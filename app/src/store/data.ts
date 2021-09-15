/**
 * @dev Poll on each block to read data
 */

// --- External imports ---
import { computed, Ref, ref } from 'vue';

// --- Our imports ---
import { BigNumber, Contract } from 'src/utils/ethers';
import useWalletStore from 'src/store/wallet';
import { SUPPORTED_TOKENS_MAPPING } from 'src/utils/chains';
import { ERC20_ABI, GRANT_ROUND_ABI } from 'src/utils/constants';
import { Grant, GrantRound, GrantRounds, GrantMetadataResolution, GrantRoundMetadataResolution } from '@dgrants/types';
import { TokenInfo } from '@uniswap/token-lists';
import { resolveMetaPtr } from 'src/utils/ipfs';
import { CLR, fetch, linear, InitArgs, GrantsDistribution, GrantRoundFetchArgs } from '@dgrants/dcurve';

// --- Parameters required ---
const { provider } = useWalletStore();

// --- State ---
// Most recent data read is saved as state
const lastBlockNumber = ref<number>(0);
const lastBlockTimestamp = ref<number>(0);

const grants = ref<Grant[]>();
const grantMetadata = ref<Record<string, GrantMetadataResolution>>({});
const distributions = ref<GrantsDistribution>();

const grantRounds = ref<GrantRounds>();
const grantRoundMetadata = ref<Record<string, GrantRoundMetadataResolution>>({});

// --- Store methods and exports ---
export default function useDataStore() {
  /**
   * @notice Called each block to poll for data, but can also be called on-demand, e.g. after user submits a transaction
   */
  async function poll() {
    const {
      grantRoundManager: grantRoundManagerRef,
      grantRegistry: grantRegistryRef,
      multicall: multicallRef,
    } = useWalletStore();
    const roundManager = grantRoundManagerRef.value;
    const registry = grantRegistryRef.value;
    const multicall = multicallRef.value;

    // Define calls to be read using multicall
    const calls = [
      { target: multicall.address, callData: multicall.interface.encodeFunctionData('getCurrentBlockTimestamp') },
      { target: registry.address, callData: registry.interface.encodeFunctionData('getAllGrants') },
    ];

    // Execute calls
    const { blockNumber, returnData } = await multicall.tryBlockAndAggregate(false, calls);

    // Parse return data
    const [timestampEncoded, grantsEncoded] = returnData;
    const { timestamp } = multicall.interface.decodeFunctionResult('getCurrentBlockTimestamp', timestampEncoded.returnData); // prettier-ignore
    const grantsList = registry.interface.decodeFunctionResult('getAllGrants', grantsEncoded.returnData)[0];

    // Get all rounds from GrantRoundCreated --- TODO: We need to cache these events somewhere (like the graph)
    const roundList = await roundManager.queryFilter(roundManager.filters.GrantRoundCreated(null));
    const roundAddresses = [...roundList.map((e) => e.args?.grantRound)];

    // Pull state from each GrantRound
    const grantRoundsList = await Promise.all(
      roundAddresses.map(async (grantRoundAddress) => {
        const roundContract = new Contract(grantRoundAddress, GRANT_ROUND_ABI, provider.value);
        // collect the donationToken before promise.all'ing everything
        const donationTokenAddress = await roundContract.donationToken();
        const donationTokenContract = new Contract(donationTokenAddress, ERC20_ABI, provider.value);
        const matchingTokenAddress = await roundContract.matchingToken();
        const matchingTokenContract = new Contract(matchingTokenAddress, ERC20_ABI, provider.value);

        return await Promise.all([
          // round details
          roundContract.startTime(),
          roundContract.endTime(),
          roundContract.metadataAdmin(),
          roundContract.payoutAdmin(),
          roundContract.registry(),
          roundContract.metaPtr(),
          roundContract.hasPaidOut(),
          // get donation token details
          donationTokenContract.name(),
          donationTokenContract.symbol(),
          donationTokenContract.decimals(),
          // get matching token details
          matchingTokenContract.name(),
          matchingTokenContract.symbol(),
          matchingTokenContract.decimals(),
          matchingTokenContract.balanceOf(grantRoundAddress),
        ]).then(
          ([
            // round details
            startTime,
            endTime,
            metadataAdmin,
            payoutAdmin,
            registry,
            metaPtr,
            hasPaidOut,
            // donation token details
            donationTokenName,
            donationTokenSymbol,
            donationTokenDecimals,
            // matching token details
            matchingTokenName,
            matchingTokenSymbol,
            matchingTokenDecimals,
            matchingTokenBalance,
          ]) => {
            // check for status against `now`
            const now = Date.now();

            return {
              startTime,
              endTime,
              metadataAdmin,
              payoutAdmin,
              registry,
              metaPtr,
              hasPaidOut,
              donationToken: {
                address: donationTokenAddress,
                name: donationTokenName,
                symbol: donationTokenSymbol,
                decimals: donationTokenDecimals,
                chainId: provider.value.network.chainId || 1,
                // TODO: fetch logo from CoinGecko's huge token list (as well as use that to avoid a network request for token info each poll): https://tokenlists.org/token-list?url=https://tokens.coingecko.com/uniswap/all.json
                logoURI: undefined, // we can leave this out for now
              } as TokenInfo,
              matchingToken: {
                address: matchingTokenAddress,
                name: matchingTokenName,
                symbol: matchingTokenSymbol,
                decimals: matchingTokenDecimals,
                chainId: provider.value.network.chainId || 1,
                // TODO: fetch logo from CoinGecko's huge token list (as well as use that to avoid a network request for token info each poll): https://tokenlists.org/token-list?url=https://tokens.coingecko.com/uniswap/all.json
                logoURI: undefined, // we can leave this out for now
              },
              address: grantRoundAddress,
              funds: matchingTokenBalance / 10 ** matchingTokenDecimals,
              status:
                now >= startTime.toNumber() * 1000 && now < endTime.toNumber() * 1000
                  ? 'Active'
                  : now < startTime.toNumber() * 1000
                  ? 'Upcoming'
                  : 'Completed',
            } as GrantRound;
          }
        );
      })
    );

    // test/example
    const clr = new CLR({
      calcAlgo: linear,
      includePayouts: true,
    } as InitArgs);
    // get contributions and grantRound details
    const grantRoundArgs = await fetch({
      provider: provider.value,
      grantRound: roundAddresses[0],
      grantRoundManager: roundManager.address,
      grantRegistry: registry.address,
      supportedTokens: SUPPORTED_TOKENS_MAPPING,
      ignore: {
        grants: [],
        contributionAddress: [],
      },
    } as GrantRoundFetchArgs);
    // calc the distributions
    const distribution = await clr.calculate(grantRoundArgs);
    console.log(distribution);
    console.log(await clr.verify(grantRoundArgs, distribution.trustBonusMetaPtr, distribution.hash));

    // Save off data
    lastBlockNumber.value = (blockNumber as BigNumber).toNumber();
    lastBlockTimestamp.value = (timestamp as BigNumber).toNumber();
    grants.value = grantsList as Grant[];
    grantRounds.value = grantRoundsList as GrantRound[];
    distributions.value = distribution;

    // Fetch Metadata
    const grantMetaPtrs = grants.value.map((grant) => grant.metaPtr);
    const grantRoundMetaPtrs = grantRounds.value.map((grantRound) => grantRound.metaPtr);
    void fetchMetaPtrs(grantMetaPtrs, grantMetadata);
    void fetchMetaPtrs(grantRoundMetaPtrs, grantRoundMetadata);
  }

  /**
   * @notice Helper method that fetches metadata for a Grant or GrantRound, and saves the data
   * to the state as soon as it's received
   * @param metaPtrs Array of URLs to resolve
   * @param metadata Name of the store's ref to assign resolve metadata to
   */
  async function fetchMetaPtrs(metaPtrs: string[], metadata: Ref) {
    const newMetadata = metaPtrs
      .filter((metaPtr) => !metadata.value[metaPtr])
      .reduce((prev, cur) => {
        return {
          ...prev,
          [cur]: { status: 'pending' },
        };
      }, {});
    // save these pending metadata objects to state
    metadata.value = { ...metadata.value, ...newMetadata };
    // resolve metadata via metaPtr and update state
    Object.keys(newMetadata).map(async (url) => {
      try {
        const data = await resolveMetaPtr(url);
        metadata.value[url] = { status: 'resolved', ...data };
      } catch (e) {
        metadata.value[url] = { status: 'error' };
        console.error(e);
      }
    });

    return metadata;
  }

  /**
   * @notice Call this method to poll now, then poll on each new block
   */
  function startPolling() {
    provider.value.removeAllListeners(); // remove all existing listeners to avoid duplicate polling
    provider.value.on('block', (/* block: number */) => void poll());
  }

  return {
    // Methods
    startPolling,
    poll,
    // Data
    lastBlockNumber: computed(() => lastBlockNumber.value || 0),
    lastBlockTimestamp: computed(() => lastBlockTimestamp.value || 0),
    grants: computed(() => grants.value),
    grantRounds: computed(() => grantRounds.value),
    grantMetadata: computed(() => grantMetadata.value),
    grantRoundMetadata: computed(() => grantRoundMetadata.value),
    distributions: computed(() => distributions.value),
  };
}

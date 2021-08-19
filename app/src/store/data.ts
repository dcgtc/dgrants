/**
 * @dev Poll on each block to read data
 */

// --- External imports ---
import { computed, markRaw, ref } from 'vue';

// --- Our imports ---
import { BigNumber, Contract } from 'src/utils/ethers';
import useWalletStore from 'src/store/wallet';
import {
  GRANT_ROUND_MANAGER_ADDRESS,
  GRANT_ROUND_MANAGER_ABI,
  GRANT_ROUND_ABI,
  GRANT_REGISTRY_ADDRESS,
  GRANT_REGISTRY_ABI,
  MULTICALL_ADDRESS,
  MULTICALL_ABI,
  ERC20_ABI,
  SUPPORTED_TOKENS_MAPPING,
} from 'src/utils/constants';
import { Grant, GrantRound, GrantRounds, GrantMetadataResolution } from '@dgrants/types';
import { TokenInfo } from '@uniswap/token-lists';
import { resolveMetaPtr } from 'src/utils/ipfs';
import { CLR, fetch, linear, InitArgs, GrantsDistribution, GrantRoundFetchArgs } from '@dgrants/dcurve';

// --- Parameters required ---
const { provider } = useWalletStore();
const multicall = ref<Contract>();
const registry = ref<Contract>();
const roundManager = ref<Contract>();

// --- State ---
// Most recent data read is saved as state
const lastBlockNumber = ref<number>(0);
const lastBlockTimestamp = ref<number>(0);
const grants = ref<Grant[]>();
const grantRounds = ref<GrantRounds>();
const grantMetadata = ref<Record<string, GrantMetadataResolution>>({});
const distributions = ref<GrantsDistribution>();

// --- Store methods and exports ---
export default function useDataStore() {
  /**
   * @notice Called each block to poll for data, but can also be called on-demand, e.g. after user submits a transaction
   */
  async function poll() {
    if (!multicall.value || !registry.value || !roundManager.value) return;

    // Define calls to be read using multicall
    const calls = [
      { target: MULTICALL_ADDRESS, callData: multicall.value.interface.encodeFunctionData('getCurrentBlockTimestamp') },
      { target: GRANT_REGISTRY_ADDRESS, callData: registry.value.interface.encodeFunctionData('getAllGrants') },
    ];

    // Execute calls
    const { blockNumber, returnData } = await multicall.value.tryBlockAndAggregate(false, calls);

    // Parse return data
    const [timestampEncoded, grantsEncoded] = returnData;
    const { timestamp } = multicall.value.interface.decodeFunctionResult('getCurrentBlockTimestamp', timestampEncoded.returnData); // prettier-ignore
    const grantsList = registry.value.interface.decodeFunctionResult('getAllGrants', grantsEncoded.returnData)[0]; // prettier-ignore

    // Get all rounds from GrantRoundCreated --- TODO: We need to cache these events somewhere (like the graph)
    const roundList = await roundManager.value.queryFilter(roundManager.value.filters.GrantRoundCreated());
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
          roundContract.minContribution(),
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
            minContribution,
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
              minContribution,
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
      grantRound: '0x8B4091997E3EbB87be90cEd3e50d8Bb27e1DC742',
      grantRoundManager: GRANT_ROUND_MANAGER_ADDRESS,
      grantRegistry: GRANT_REGISTRY_ADDRESS,
      supportedTokens: SUPPORTED_TOKENS_MAPPING,
      ignore: {
        grants: [],
        contributionAddress: [],
      },
    } as GrantRoundFetchArgs);
    // calc the distributions
    const distribution = clr.calculate(grantRoundArgs);
    console.log(distribution);

    // Save off data
    lastBlockNumber.value = (blockNumber as BigNumber).toNumber();
    lastBlockTimestamp.value = (timestamp as BigNumber).toNumber();
    grants.value = grantsList as Grant[];
    grantRounds.value = grantRoundsList as GrantRound[];
    distributions.value = distribution;

    const metaPtrs = grants.value.map((grant) => grant.metaPtr);
    // Initialize metadata for metaPtrs we haven't encountered yet to status "pending"
    const newMetadata = metaPtrs
      .filter((metaPtr) => !grantMetadata.value[metaPtr])
      .reduce((prev, cur) => {
        return {
          ...prev,
          [cur]: { status: 'pending' },
        };
      }, {});
    // save these pending metadata objects to state
    grantMetadata.value = { ...grantMetadata.value, ...newMetadata };
    // resolve metadata via metaPtr and update state
    Object.keys(newMetadata).map(async (url) => {
      try {
        const data = await resolveMetaPtr(url);
        grantMetadata.value[url] = { status: 'resolved', ...data };
      } catch (e) {
        grantMetadata.value[url] = { status: 'error' };
        console.error(e);
      }
    });
  }

  /**
   * @notice Call this method to poll now, then poll on each new block
   */
  function startPolling() {
    // Remove all existing listeners to avoid duplicate polling
    provider.value.removeAllListeners();

    // Start polling with the user's provider if available, or fallback to our default provider
    multicall.value = markRaw(new Contract(MULTICALL_ADDRESS, MULTICALL_ABI, provider.value));
    registry.value = markRaw(new Contract(GRANT_REGISTRY_ADDRESS, GRANT_REGISTRY_ABI, provider.value));
    roundManager.value = markRaw(new Contract(GRANT_ROUND_MANAGER_ADDRESS, GRANT_ROUND_MANAGER_ABI, provider.value));
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
    distributions: computed(() => distributions.value),
  };
}

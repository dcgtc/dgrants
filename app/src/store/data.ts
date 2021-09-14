/**
 * @dev Poll on each block to read data
 */

// --- External imports ---
import { computed, Ref, ref } from 'vue';

// --- Our imports ---
import { BigNumber, Contract, formatUnits } from 'src/utils/ethers';
import useWalletStore from 'src/store/wallet';
import { MULTICALL_ADDRESS, SUPPORTED_TOKENS_MAPPING } from 'src/utils/chains';
import {
  GRANT_ROUND_ABI,
  GRANT_REGISTRY_ADDRESS,
  ERC20_ABI,
} from 'src/utils/constants';
import {
  Grant,
  Contribution,
  GrantRound,
  GrantRoundCLR,
  GrantMetadataResolution,
  GrantRoundMetadataResolution,
} from '@dgrants/types';
import { CLR, linear, InitArgs } from '@dgrants/dcurve';
import { LocalStorageAnyObj, LocalStorageData } from 'src/types';
import { TokenInfo } from '@uniswap/token-lists';
import { resolveMetaPtr } from 'src/utils/ipfs';
import { Event } from 'ethers';
// TrustBonus utils
import { fetchTrustBonusScore } from '@dgrants/utils/src/trustBonus';

// --- Parameters required ---
const { provider } = useWalletStore();

// --- State ---
// Most recent data read is saved as state
const lastBlockNumber = ref<number>(0);
const lastBlockTimestamp = ref<number>(0);

const grants = ref<Grant[]>();
const grantMetadata = ref<Record<string, GrantMetadataResolution>>({});
const grantContributions = ref<{ [hash: string]: Contribution }>();

const grantRounds = ref<GrantRound[]>();
const grantRoundMetadata = ref<Record<string, GrantRoundMetadataResolution>>({});
const grantRoundsCLRData = ref<{ [grantRound: string]: GrantRoundCLR }>();

// --- Store methods and exports ---
export default function useDataStore() {
  // LocalStorage keys/prefixes
  const allGrantsKey = 'AllGrants';
  const allGrantRoundsKey = 'AllGrantRounds';
  const grantRoundKeyPrefix = 'GrantRound-';
  const contributionsKey = 'Contributions';
  const grantRoundsCLRDataKeyPrefix = 'GrantRoundsGrantData-';
  const trustBonusKey = 'TrustBonus';

  /**
   * @notice Called each block to poll for data, but can also be called on-demand, e.g. after user submits a transaction
   */
  async function rawPoll(forceRefresh = false) {    
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
      { target: MULTICALL_ADDRESS, callData: multicall.value.interface.encodeFunctionData('getCurrentBlockTimestamp') },
    ];

    // Execute calls
    const { blockNumber, returnData } = await multicall.tryBlockAndAggregate(false, calls);

    // Parse return data
    const [timestampEncoded] = returnData;
    const { timestamp } = multicall.value.interface.decodeFunctionResult('getCurrentBlockTimestamp', timestampEncoded.returnData); // prettier-ignore

    // Save block data
    lastBlockNumber.value = (blockNumber as BigNumber).toNumber();
    lastBlockTimestamp.value = (timestamp as BigNumber).toNumber();

    // Get all grants and round data held in the registry/roundManager
    const [grantsData, grantRoundData] = await Promise.all([
      await getAllGrants(forceRefresh),
      await getAllGrantRounds(forceRefresh),
    ]);

    // collect the grants into a grantId->payoutAddress obj
    const grantsList = grantsData.grants || [];
    const grantsDict = grantsList.reduce(
      (grants: Record<string, string>, grant: Record<string, string>, key: number) => {
        grants[key.toString()] = grant.payee;

        return grants;
      },
      {}
    );
    const roundAddresses = grantRoundData.roundAddresses || [];

    // Pull state from each GrantRound
    const grantRoundsList = (await Promise.all(
      roundAddresses.map(async (grantRoundAddress: string) => {
        const data = await getGrantRound(grantRoundAddress);

        return data?.grantRound;
      })
    )) as GrantRound[];

    // Get latest set of contributions
    const contributions = await fetchContributions(grantsDict, grantRoundsList[0].donationToken, forceRefresh);

    // Pull all trust scores from gitcoin api
    const trustBonusScores = await fetchTrustBonusScores(contributions.contributions, forceRefresh);

    // Pull all contributions for the current GrantRounds
    const grantRoundCLR: GrantRoundCLR[] = await Promise.all(
      roundAddresses.map(async (grantRoundAddress: string, key: number) => {
        const data = await fetchGrantRoundGrantData(
          contributions.contributions,
          trustBonusScores.trustBonus,
          grantRoundAddress,
          grantsDict,
          grantRoundsList[key].matchingToken,
          forceRefresh
        );

        return data.grantRoundCLR;
      })
    );

    const grantDataByRound: { [key: string]: GrantRoundCLR } = grantRoundCLR.reduce(
      (byRound: { [key: string]: GrantRoundCLR }, data: GrantRoundCLR): { [key: string]: GrantRoundCLR } => {
        byRound[data.grantRound] = data;

        return byRound;
      },
      {} as { [key: string]: GrantRoundCLR }
    );

    // Fetch Metadata
    const grantMetaPtrs = grantsList.map((grant: Grant) => grant.metaPtr);
    const grantRoundMetaPtrs = grantRoundsList.map((grantRound: GrantRound) => grantRound.metaPtr);
    void (await fetchMetaPtrs(grantMetaPtrs, grantMetadata));
    void (await fetchMetaPtrs(grantRoundMetaPtrs, grantRoundMetadata));

    // Save off data
    grants.value = grantsList as Grant[];
    grantRounds.value = grantRoundsList as GrantRound[];
    grantRoundsCLRData.value = grantDataByRound as { [key: string]: GrantRoundCLR };
    grantContributions.value = contributions.contributions as { [hash: string]: Contribution };
  }

  async function syncWithLocalStorage(
    key: string,
    callback: (localStorageData?: LocalStorageData) => Promise<LocalStorageAnyObj>,
    validityCheck?: (data: LocalStorageAnyObj) => boolean
  ) {
    let localStorageData: LocalStorageData | undefined = undefined;
    const rawLocalStorageData: string | null = localStorage.getItem(key);

    // pull from localstorage and check validity
    if (rawLocalStorageData) {
      localStorageData = JSON.parse(rawLocalStorageData);
      if (localStorageData) {
        localStorageData.data = await callback(localStorageData);
        // update ts/block for next check
        (localStorageData.ts = Math.floor(Date.now() / 1000)), (localStorageData.blockNumber = lastBlockNumber.value);
      }
    }
    // nothing stored, fetch again and save
    if (!localStorageData) {
      localStorageData = {
        ts: Math.floor(Date.now() / 1000),
        blockNumber: lastBlockNumber.value,
        data: await callback(),
      };
    }
    // save new state
    if (!validityCheck || validityCheck(localStorageData.data)) {
      localStorage.setItem(key, JSON.stringify(localStorageData));
    }

    return localStorageData.data;
  }

  async function getAllGrants(forceRefresh = false) {
    return await syncWithLocalStorage(
      allGrantsKey,
      async (localStorageData: LocalStorageData | undefined) => {
        let grants = localStorageData?.data?.grants || [];

        // read from registry on first load and every 10 mins
        if (
          forceRefresh ||
          !localStorageData ||
          (localStorageData && localStorageData.ts < Date.now() / 1000 - 60 * 10)
        ) {
          grants = (await registry.value?.getAllGrants()) || [];
        }

        return {
          grants: grants.map((grant: Grant) => {
            return {
              id: BigNumber.from(grant.id),
              owner: grant.owner,
              payee: grant.payee,
              metaPtr: grant.metaPtr,
            } as Grant;
          }),
        };
      },
      (data) => data.grants.length
    );
  }

  async function getAllGrantRounds(forceRefresh = false) {
    return await syncWithLocalStorage(
      allGrantRoundsKey,
      async (localStorageData: LocalStorageData | undefined) => {
        let roundAddresses = localStorageData?.data?.roundAddresses || [];

        // read from roundManager on first load and every 10 mins
        if (
          forceRefresh ||
          !localStorageData ||
          (localStorageData && localStorageData.ts < Date.now() / 1000 - 60 * 10)
        ) {
          const roundList =
            (await roundManager.value?.queryFilter(roundManager.value?.filters.GrantRoundCreated())) || [];
          roundAddresses = [...roundList.map((e: Event) => e.args?.grantRound)];
        }

        return {
          roundAddresses: roundAddresses,
        };
      },
      (data) => data.roundAddresses.length
    );
  }

  async function getGrantRound(grantRoundAddress: string, forceRefresh?: boolean) {
    return await syncWithLocalStorage(
      grantRoundKeyPrefix + grantRoundAddress,
      async (localStorageData: LocalStorageData | undefined) => {
        const data = localStorageData?.data || {};
        // read from registry on first load and every 10 mins
        if (
          forceRefresh ||
          !localStorageData ||
          (localStorageData && localStorageData.ts < Date.now() / 1000 - 60 * 10)
        ) {
          // open the rounds contract
          const roundContract = new Contract(grantRoundAddress, GRANT_ROUND_ABI, provider.value);
          // collect the donationToken before promise.all'ing everything
          const donationTokenAddress = data?.donationToken?.address || (await roundContract.donationToken());
          const donationTokenContract = new Contract(donationTokenAddress, ERC20_ABI, provider.value);
          const matchingTokenAddress = data?.matchingToken?.address || (await roundContract.matchingToken());
          const matchingTokenContract = new Contract(matchingTokenAddress, ERC20_ABI, provider.value);

          // Define calls to be read using multicall
          const calls = [
            { target: grantRoundAddress, callData: roundContract.interface.encodeFunctionData('startTime') },
            { target: grantRoundAddress, callData: roundContract.interface.encodeFunctionData('endTime') },
            { target: grantRoundAddress, callData: roundContract.interface.encodeFunctionData('metadataAdmin') },
            { target: grantRoundAddress, callData: roundContract.interface.encodeFunctionData('payoutAdmin') },
            { target: grantRoundAddress, callData: roundContract.interface.encodeFunctionData('registry') },
            { target: grantRoundAddress, callData: roundContract.interface.encodeFunctionData('metaPtr') },
            { target: grantRoundAddress, callData: roundContract.interface.encodeFunctionData('hasPaidOut') },
            { target: donationTokenAddress, callData: donationTokenContract.interface.encodeFunctionData('name') },
            { target: donationTokenAddress, callData: donationTokenContract.interface.encodeFunctionData('symbol') },
            { target: donationTokenAddress, callData: donationTokenContract.interface.encodeFunctionData('decimals') },
            { target: matchingTokenAddress, callData: matchingTokenContract.interface.encodeFunctionData('name') },
            { target: matchingTokenAddress, callData: matchingTokenContract.interface.encodeFunctionData('symbol') },
            { target: matchingTokenAddress, callData: matchingTokenContract.interface.encodeFunctionData('decimals') },
            {
              target: matchingTokenAddress,
              callData: matchingTokenContract.interface.encodeFunctionData('balanceOf', [grantRoundAddress]),
            },
          ];

          // Execute calls
          const { returnData } = (await multicall.value?.tryBlockAndAggregate(false, calls)) || {};
          const [
            startTimeEncoded,
            endTimeEncoded,
            metadataAdminEncoded,
            payoutAdminEncoded,
            registryAddressEncoded,
            metaPtrEncoded,
            hasPaidOutEncoded,
            donationTokenNameEncoded,
            donationTokenSymbolEncoded,
            donationTokenDecimalsEncoded,
            matchingTokenNameEncoded,
            matchingTokenSymbolEncoded,
            matchingTokenDecimalsEncoded,
            matchingTokenBalanceEncoded,
          ] = returnData;

          // Unpack result
          const startTime = roundContract.interface.decodeFunctionResult('startTime', startTimeEncoded.returnData)[0]; // prettier-ignore
          const endTime = roundContract.interface.decodeFunctionResult('endTime', endTimeEncoded.returnData)[0] // prettier-ignore
          const metadataAdmin = roundContract.interface.decodeFunctionResult('metadataAdmin', metadataAdminEncoded.returnData)[0]; // prettier-ignore
          const payoutAdmin = roundContract.interface.decodeFunctionResult('payoutAdmin', payoutAdminEncoded.returnData)[0]; // prettier-ignore
          const registryAddress = roundContract.interface.decodeFunctionResult('registry', registryAddressEncoded.returnData)[0]; // prettier-ignore
          const metaPtr = roundContract.interface.decodeFunctionResult('metaPtr', metaPtrEncoded.returnData)[0]; // prettier-ignore
          const hasPaidOut = roundContract.interface.decodeFunctionResult('hasPaidOut', hasPaidOutEncoded.returnData)[0]; // prettier-ignore
          const donationTokenName = donationTokenContract.interface.decodeFunctionResult('name', donationTokenNameEncoded.returnData)[0]; // prettier-ignore
          const donationTokenSymbol = donationTokenContract.interface.decodeFunctionResult('symbol', donationTokenSymbolEncoded.returnData)[0]; // prettier-ignore
          const donationTokenDecimals = donationTokenContract.interface.decodeFunctionResult('decimals', donationTokenDecimalsEncoded.returnData)[0]; // prettier-ignore
          const matchingTokenName = matchingTokenContract.interface.decodeFunctionResult('name', matchingTokenNameEncoded.returnData)[0]; // prettier-ignore
          const matchingTokenSymbol = matchingTokenContract.interface.decodeFunctionResult('symbol', matchingTokenSymbolEncoded.returnData)[0]; // prettier-ignore
          const matchingTokenDecimals = matchingTokenContract.interface.decodeFunctionResult('decimals', matchingTokenDecimalsEncoded.returnData)[0]; // prettier-ignore
          const matchingTokenBalance = matchingTokenContract.interface.decodeFunctionResult('balanceOf', matchingTokenBalanceEncoded.returnData)[0]; // prettier-ignore

          // build status against now (unix)
          const now = Date.now() / 1000;

          return {
            grantRound: {
              startTime,
              endTime,
              metadataAdmin,
              payoutAdmin,
              registryAddress,
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
              } as TokenInfo,
              address: grantRoundAddress,
              funds: matchingTokenBalance / 10 ** matchingTokenDecimals,
              status:
                now >= startTime.toNumber() && now < endTime.toNumber()
                  ? 'Active'
                  : now < startTime.toNumber()
                  ? 'Upcoming'
                  : 'Completed',
              registry: GRANT_REGISTRY_ADDRESS,
              error: undefined,
            } as GrantRound,
          };
        } else {
          // return data unchanged
          return data;
        }
      },
      (data) => data.startTime && data.endTime
    );
  }

  async function fetchContributions(
    grantsDict: { [key: string]: string },
    donationToken: TokenInfo,
    forceRefresh?: boolean
  ) {
    return await syncWithLocalStorage(
      contributionsKey,
      async (localStorageData: LocalStorageData | undefined) => {
        const roundContributions = localStorageData?.data || {};
        const contributions: { [hash: string]: Contribution } = roundContributions?.contributions || {};

        // every block
        if (
          forceRefresh ||
          !localStorageData ||
          (localStorageData && localStorageData.blockNumber < lastBlockNumber.value)
        ) {
          // get the most recent block we collected
          const fromBlock = localStorageData?.blockNumber || 0;

          // get any new donations to the grantRound
          const grantDonations = (
            (await roundManager.value?.queryFilter(
              roundManager.value.filters.GrantDonation(),
              fromBlock,
              lastBlockNumber.value
            )) || []
          ).sort((a, b) => (a.blockNumber > b.blockNumber ? -1 : a.blockNumber == b.blockNumber ? 0 : 1));

          // resolve contributions
          void (await Promise.all(
            grantDonations.map(async (contribution: Event) => {
              // get tx details to pull contributor details from
              const tx = await contribution.getTransaction();

              // check that the contribution is valid
              const grantId = contribution?.args?.grantId.toString();
              const inRounds = contribution?.args?.rounds;

              // record the new transaction
              contributions[tx.hash] = {
                grantId: grantId,
                amount: parseFloat(
                  formatUnits(
                    contribution?.args?.donationAmount,
                    SUPPORTED_TOKENS_MAPPING[donationToken.address].decimals
                  )
                ),
                inRounds: inRounds,
                grantAddress: grantsDict[grantId],
                address: tx.from,
                donationToken: donationToken,
                txHash: tx.hash,
                blockNumber: tx.blockNumber,
              };
            })
          ));
        }

        return {
          contributions: contributions as { [hash: string]: Contribution },
        };
      },
      (data) => Object.keys(data?.contributions || {}).length > 0
    );
  }

  async function fetchTrustBonusScores(contributions: { [hash: string]: Contribution }, forceRefresh = false) {
    return await syncWithLocalStorage(
      trustBonusKey,
      async (localStorageData: LocalStorageData | undefined) => {
        const trustBonusData = localStorageData?.data?.trustBonus || {};
        const contributorsData = localStorageData?.data?.contributors || [];
        const newContributionAddresses: Set<string> = new Set();
        // every block
        if (
          forceRefresh ||
          !localStorageData ||
          (localStorageData && localStorageData.blockNumber < lastBlockNumber.value)
        ) {
          // set score for null user to prevent linear from fetching (if there are no other scores matched)
          trustBonusData['0x0'] = 0.5;
          // collect any new contributors
          Object.values(contributions).forEach((contribution) => {
            if (
              !localStorageData ||
              !contribution?.blockNumber ||
              contribution.blockNumber > localStorageData.blockNumber
            ) {
              newContributionAddresses.add(contribution.address);
            }
          });
          // get the trust scores for any new contributors
          if ([...newContributionAddresses].length) {
            // fetch trust bonus scores from gitcoin API
            const { data, status } = await fetchTrustBonusScore([...newContributionAddresses]);
            if (!status.ok) console.error(status.message);
            if (data) {
              data.forEach((trust) => {
                trustBonusData[trust.address] = trust.score;
              });
            }
          }
        }

        return {
          trustBonus: trustBonusData,
          contributors: [...new Set([...contributorsData, ...newContributionAddresses])],
        };
      },
      (data) => Object.keys(data?.trustBonus || {}).length > 0
    );
  }

  async function fetchGrantRoundGrantData(
    contributions: { [hash: string]: Contribution },
    trustBonus: { [address: string]: number },
    grantRoundAddress: string,
    grantsDict: { [key: string]: string },
    matchingToken: TokenInfo,
    forceRefresh = false
  ) {
    const clr = new CLR({
      calcAlgo: linear,
      includePayouts: false,
    } as InitArgs);

    return await syncWithLocalStorage(
      grantRoundsCLRDataKeyPrefix + grantRoundAddress,
      async (localStorageData: LocalStorageData | undefined) => {
        const roundGrantData = localStorageData?.data?.grantRoundCLR || {};

        // unpack current ls state
        let grantDonations: Contribution[] = roundGrantData?.contributions || [];
        let matchingTokenDecimals: number = roundGrantData?.matchingTokenDecimals || 0;
        const totalPot: number = roundGrantData?.totalPot || 0;
        const predictions = roundGrantData?.predictions || {};
        const donationCount = grantDonations.length;

        // get token info
        const matchingTokenContract = new Contract(matchingToken.address, ERC20_ABI, provider.value);
        // used to bigNumberify the distribution data
        matchingTokenDecimals = SUPPORTED_TOKENS_MAPPING[matchingToken.address].decimals;
        // total pot is balance of matchingToken held by grantRoundAddress
        const newTotalPot = parseFloat(
          formatUnits(await matchingTokenContract.balanceOf(grantRoundAddress), matchingTokenDecimals)
        );

        // every block
        if (
          forceRefresh ||
          !localStorageData ||
          totalPot !== newTotalPot ||
          (localStorageData && localStorageData.blockNumber < lastBlockNumber.value)
        ) {
          // fetch contributions
          grantDonations = Object.values(contributions).filter((contribution: Contribution) => {
            // check that the contribution is valid
            const inRound = contribution.inRounds?.includes(grantRoundAddress);

            // only include transactions from this grantRound which havent been ignored
            return inRound;
          });

          // re-run predict if there are any new contributions
          if (totalPot !== newTotalPot || grantDonations.length > donationCount) {
            // get all predictions for the grants in this round
            void (await Promise.all(
              Object.keys(grantsDict).map(async (grantId: string) => {
                // predict for each grant in the round
                predictions[grantId] = await clr.predict({
                  grantId: grantId,
                  predictionPoints: [0, 1, 10, 100, 1000, 10000],
                  trustBonusScores: Object.keys(trustBonus).map((address) => {
                    return {
                      address: address,
                      score: trustBonus[address],
                    };
                  }),
                  grantRoundContributions: {
                    grantRound: grantRoundAddress,
                    totalPot: newTotalPot,
                    matchingTokenDecimals: matchingTokenDecimals,
                    contributions: grantDonations,
                  },
                });
              })
            ));
          }
        }

        return {
          grantRoundCLR: {
            grantRound: grantRoundAddress,
            totalPot: newTotalPot,
            matchingTokenDecimals: matchingTokenDecimals,
            contributions: grantDonations,
            predictions: predictions,
          } as GrantRoundCLR,
        };
      },
      (data) => data?.grantRoundCLR?.contributions?.length
    );
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
    void (await Promise.all(
      Object.keys(newMetadata).map(async (url) => {
        try {
          const data = await resolveMetaPtr(url);
          metadata.value[url] = { status: 'resolved', ...data };
        } catch (e) {
          metadata.value[url] = { status: 'error' };
          console.error(e);
        }
      })
    ));

    return metadata;
  }

  /**
   * @notice Throttle calls to rawPoll()
   */
  let timeout: ReturnType<typeof setTimeout> | undefined;
  function poll(forceRefresh = false) {
    if (!timeout) {
      rawPoll(forceRefresh);
      timeout = setTimeout(function () {
        timeout = undefined;
      }, 1000);
    }
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
    grantRoundsCLRData: computed(() => grantRoundsCLRData.value),
    grantContributions: computed(() => grantContributions.value),
    grantRoundMetadata: computed(() => grantRoundMetadata.value),
  };
}

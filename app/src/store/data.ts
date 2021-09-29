/**
 * @dev Poll on each block to read data
 */

// --- External imports ---
import { computed, ref, watch } from 'vue';

// --- Our imports ---
import { BigNumber } from 'src/utils/ethers';
import useWalletStore from 'src/store/wallet';
import { getAllGrants } from 'src/utils/data/grants';
import { getContributions, getTrustBonusScores } from 'src/utils/data/contributions';
import { getAllGrantRounds, getGrantRound, getGrantRoundGrantData } from 'src/utils/data/grantRounds';
import {
  Grant,
  Contribution,
  GrantRound,
  GrantRoundCLR,
  GrantMetadataResolution,
  GrantRoundMetadataResolution,
} from '@dgrants/types';
import { fetchMetaPtrs } from 'src/utils/data/ipfs';
import { TokenInfo } from '@uniswap/token-lists';
import { SUPPORTED_TOKENS_MAPPING } from 'src/utils/chains';
import { DefaultStorage, getStorageKey, setStorageKey } from 'src/utils/data/utils';

// --- Parameters required ---
const { provider, grantRoundManager: _grantRoundManager, network } = useWalletStore();

// --- State ---
// Most recent data read is saved as state
const lastBlockNumber = ref<number>(0);

const grants = ref<Grant[]>();
const grantContributions = ref<Contribution[]>();
const grantMetadata = ref<Record<string, GrantMetadataResolution>>({});

const grantRounds = ref<GrantRound[]>();
const grantRoundMetadata = ref<Record<string, GrantRoundMetadataResolution>>({});
const grantRoundsCLRData = ref<Record<string, GrantRoundCLR>>({});
const grantRoundsDonationToken = ref<TokenInfo>();

// --- Store methods and exports ---
export default function useDataStore() {
  /**
   * @notice Called each block to poll for data, but can also be called on-demand, e.g. after user submits a transaction
   */
  async function rawPoll(forceRefresh = false) {
    // Get blockdata
    lastBlockNumber.value = BigNumber.from(await provider.value.getBlockNumber()).toNumber();

    // Get computed on grantRoundManager
    const grantRoundManager = computed(() => _grantRoundManager.value);

    // Get all grants and round data held in the registry/roundManager
    const [grantsData, grantRoundData, grantRoundDonationTokenAddress] = await Promise.all([
      getAllGrants(lastBlockNumber.value, forceRefresh),
      getAllGrantRounds(lastBlockNumber.value, forceRefresh),
      grantRoundManager.value.donationToken(),
    ]);

    // Collect the grants into a grantId->payoutAddress obj
    const grantsList = grantsData.grants || [];
    const grantIds = grantsList.map((grant: Grant) => grant.id);
    const grantPayees = grantsList.reduce((grants: Record<string, string>, grant: Grant, key: number) => {
      grants[key.toString()] = grant.payee;

      return grants;
    }, {});

    // Pull state from each GrantRound
    const roundAddresses = grantRoundData.roundAddresses || [];
    const grantRoundsList = (await Promise.all(
      roundAddresses.map(async (grantRoundAddress: string) => {
        const data = await getGrantRound(lastBlockNumber.value, grantRoundAddress, forceRefresh);

        return data?.grantRound;
      })
    )) as GrantRound[];

    // Fetch Metadata
    const grantMetaPtrs = grantsList.map((grant: Grant) => grant.metaPtr);
    const grantRoundMetaPtrs = grantRoundsList.map((grantRound: GrantRound) => grantRound.metaPtr);
    // Update Metadata synchronously
    void fetchMetaPtrs(grantMetaPtrs, grantMetadata);
    void fetchMetaPtrs(grantRoundMetaPtrs, grantRoundMetadata);

    // Get latest set of contributions
    const contributions = await getContributions(
      lastBlockNumber.value,
      grantPayees,
      SUPPORTED_TOKENS_MAPPING[grantRoundDonationTokenAddress],
      forceRefresh
    );

    // Pull all trust scores from gitcoin api (depends on the contributions from getContributions)
    const trustBonusScores = await getTrustBonusScores(
      lastBlockNumber.value,
      contributions.contributions,
      forceRefresh
    );

    // Set up a watch so that we only update calculations when every rounds metadata is present
    watch(
      () => [grantRoundMetadata.value],
      async () => {
        // only do predictions once after resolving all grantRounds
        const gotAllMetadata = !grantRoundsList
          .map((grantRound: GrantRound) => {
            return grantRoundMetadata.value[grantRound.metaPtr].status === 'resolved';
          })
          .includes(false);
        // calculate predictions after we've got all rounds metadata
        if (gotAllMetadata) {
          // collect all the GrantRoundGrantData once the metaData has resolved
          const grantRoundCLRs = (await Promise.all(
            grantRoundsList.map(async (grantRound: GrantRound) => {
              const data = await getGrantRoundGrantData(
                lastBlockNumber.value,
                contributions.contributions,
                trustBonusScores.trustBonus,
                grantRound,
                grantRoundMetadata.value,
                grantPayees,
                grantIds,
                forceRefresh
              );

              return data.grantRoundCLR;
            })
          )) as GrantRoundCLR[];
          // reduce the results into a grantRoundAddress->GrantRoundCLR store
          grantRoundsCLRData.value = grantRoundCLRs.reduce(
            (byRound: Record<string, GrantRoundCLR>, data: GrantRoundCLR) => {
              byRound[data.grantRound] = data;

              return byRound;
            },
            {} as Record<string, GrantRoundCLR>
          );
        }
      },
      { immediate: true }
    );

    // Save off data
    grants.value = grantsList as Grant[];
    grantContributions.value = contributions.contributions as Contribution[];
    grantRounds.value = grantRoundsList as GrantRound[];
    grantRoundsDonationToken.value = SUPPORTED_TOKENS_MAPPING[grantRoundDonationTokenAddress] as TokenInfo;
  }

  /**
   * @notice Throttle calls to rawPoll() and catch any errors
   */
  let timeout: ReturnType<typeof setTimeout> | undefined;
  async function poll(forceRefresh = false) {
    if (!timeout) {
      try {
        await rawPoll(forceRefresh);
        timeout = setTimeout(function () {
          timeout = undefined;
        }, 1000);
      } catch (e) {
        console.log('dGrants: Data fetch error - please check your network -- ', e);
      }
    }
  }

  /**
   * @notice Call this method to poll now, then poll on each new block
   */
  async function startPolling() {
    provider.value.removeAllListeners(); // remove all existing listeners to avoid duplicate polling
    provider.value.on('block', (/* block: number */) => void poll());
    // record the network value to detect changes
    const networkValue = (await getStorageKey('network'))?.data || network.value;
    // watch the network
    watch(
      () => [network.value],
      async () => {
        // clear storage and poll again for all network changes after first load
        if (networkValue && networkValue.chainId !== network.value?.chainId) {
          void (await DefaultStorage.clear());
          void poll();
        }
        await setStorageKey('network', { data: { chainId: network.value?.chainId } });
      }
    );
  }

  return {
    // Methods
    startPolling,
    poll,
    // Data
    lastBlockNumber: computed(() => lastBlockNumber.value || 0),
    grants: computed(() => grants.value),
    grantRounds: computed(() => grantRounds.value),
    grantMetadata: computed(() => grantMetadata.value),
    grantContributions: computed(() => grantContributions.value),
    grantRoundsCLRData: computed(() => grantRoundsCLRData.value),
    grantRoundMetadata: computed(() => grantRoundMetadata.value),
    grantRoundsDonationToken: computed(() => grantRoundsDonationToken.value),
  };
}

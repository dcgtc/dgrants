/**
 * @dev Poll on each block to read data
 */

// --- External imports ---
import { computed, ref, watch } from 'vue';

// --- Our imports ---
import { BigNumber, Contract } from 'src/utils/ethers';
import useWalletStore from 'src/store/wallet';
import { getAllGrants, grantListener } from 'src/utils/data/grants';
import { getContributions, getTrustBonusScores, grantDonationListener } from 'src/utils/data/contributions';
import {
  getAllGrantRounds,
  getGrantRound,
  getGrantRoundGrantData,
  grantRoundListener,
} from 'src/utils/data/grantRounds';
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
const { provider, grantRoundManager, network } = useWalletStore();

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

const timeout = ref<ReturnType<typeof setTimeout> | undefined>();

/**
 * @notice Used to record any listeners that we currently have in place
 */
type ListenerResponse = {
  off: () => Contract;
};

// Used to record any listeners that we currently have in place
const listeners = ref<ListenerResponse[]>([]);

/**
 * @notice Called each block to poll for data, but can also be called on-demand, e.g. after user submits a transaction
 */
async function removeAllListeners() {
  // listeners in an array and flush {contract, eventName}
  listeners.value = listeners.value.reduce((empty, listener) => (listener.off(), empty), []);
}

// --- Store methods and exports ---
export default function useDataStore() {
  /**
   * @notice Called on init and network change - but can also be called on demand
   */
  async function rawInit(forceRefresh = false) {
    // Remove all listeners
    await removeAllListeners();

    // Get blockdata
    lastBlockNumber.value = BigNumber.from(await provider.value.getBlockNumber()).toNumber();

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
    const contributions =
      (
        await getContributions(
          lastBlockNumber.value,
          grantPayees,
          SUPPORTED_TOKENS_MAPPING[grantRoundDonationTokenAddress],
          forceRefresh
        )
      )?.contributions || {};

    // Pull all trust scores from gitcoin api (depends on the contributions from getContributions)
    const trustBonusScores =
      (await getTrustBonusScores(lastBlockNumber.value, contributions || [], forceRefresh))?.trustBonus || {};

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
                contributions || [],
                trustBonusScores || {},
                grantRound,
                grantRoundMetadata.value,
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
    grantContributions.value = contributions as Contribution[];
    grantRounds.value = grantRoundsList as GrantRound[];
    grantRoundsDonationToken.value = SUPPORTED_TOKENS_MAPPING[grantRoundDonationTokenAddress] as TokenInfo;

    // grantRounds have 3 associated listeners; GrantRoundCreated, MetadataUpdated and matchingToken Transfers
    // metadataUpdatedListener and matchingTokenListener responses will be pushed on to listeners asynchronously
    listeners.value.push(
      grantRoundListener(
        'GrantRoundCreated',
        {
          listeners: listeners.value,
          grantIds: grantIds,
          contributions: contributions,
          trustBonus: trustBonusScores,
        },
        {
          grantRounds,
          grantRoundsCLRData,
          grantRoundMetadata,
        }
      )
    );

    // All grant details can be fetched from the grantRegistry
    listeners.value.push(
      grantListener('GrantCreated', {
        grants,
        grantMetadata,
      })
    );
    listeners.value.push(
      grantListener('GrantUpdated', {
        grants,
        grantMetadata,
      })
    );

    // Contributions are routed through the grantRoundManager
    listeners.value.push(
      grantDonationListener(
        {
          grantIds: grantIds,
          trustBonus: trustBonusScores,
          grantPayees: grantPayees,
          donationToken: SUPPORTED_TOKENS_MAPPING[grantRoundDonationTokenAddress] as TokenInfo,
        },
        {
          contributions: grantContributions,
          grantRounds,
          grantRoundsCLRData,
          grantRoundMetadata,
        }
      )
    );
  }

  /**
   * @notice Throttle calls to rawInit() and catch any errors
   */
  async function init(forceRefresh = false) {
    if (!timeout.value) {
      await rawInit(forceRefresh);
      timeout.value = setTimeout(function () {
        timeout.value = undefined;
      }, 1000);
    }
  }

  /**
   * @notice Call this method to poll now, then poll on each new block
   */
  async function startPolling() {
    // record the network value to detect changes
    const networkValue = (await getStorageKey('network'))?.data || network.value;
    // init the current state
    void (await init());
    // watch the network
    watch(
      () => [network.value],
      async () => {
        // clear storage and poll again for all network changes after first load
        if (networkValue && networkValue.chainId !== network.value?.chainId) {
          void (await DefaultStorage.clear());
          void init();
        }
        await setStorageKey('network', { data: { chainId: network.value?.chainId } });
      }
    );
  }

  return {
    // Methods
    startPolling,
    init,
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

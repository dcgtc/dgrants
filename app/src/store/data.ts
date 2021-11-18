/**
 * @dev Poll on each block to read data
 */

// --- External imports ---
import { computed, Ref, ref, watch } from 'vue';

// --- Our imports ---
import { BigNumber, Contract } from 'src/utils/ethers';
import useWalletStore from 'src/store/wallet';
import { getAllGrants, grantListener } from 'src/utils/data/grants';
import { getContributions, getTrustBonusScores, grantDonationListener } from 'src/utils/data/contributions';
import {
  getAllGrantRounds,
  getGrantRound,
  getGrantRoundGrantData,
  grantRoundCreatedListener,
  matchingTokenListener,
  metadataUpdatedListener,
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
import {
  GRANT_REGISTRY_ADDRESS,
  GRANT_ROUND_MANAGER_ADDRESS,
  SUPPORTED_TOKENS_MAPPING,
  // DEFAULT_PROVIDER,
  DGRANTS_CHAIN_ID,
} from 'src/utils/chains';
import { DefaultStorage, getStorageKey, setStorageKey } from 'src/utils/data/utils';
import { GRANT_ROUND_ABI, ERC20_ABI } from 'src/utils/constants';
import { metadataId } from 'src/utils/utils';

// --- Parameters required ---
const { default_provider, grantRoundManager, network } = useWalletStore();

// --- State ---
// Most recent data read is saved as state
const lastBlockNumber = ref<number>(0);

const grants = ref<Grant[]>();
const grantContributions = ref<Contribution[]>();
const approvedGrants = ref<Grant[]>();
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
    // Check contracts are available on the given provider (or default provider)
    const [isGrantRegistryDeployed, isGrantRoundManagerDeployed] = await Promise.all([
      (await default_provider.value.getCode(GRANT_REGISTRY_ADDRESS)) !== '0x',
      (await default_provider.value.getCode(GRANT_ROUND_MANAGER_ADDRESS)) !== '0x',
    ]);

    // This ensures we're only attempting to load data from contracts which exist
    if (!isGrantRegistryDeployed && !isGrantRoundManagerDeployed) {
      return false;
    }

    // Remove all listeners
    await removeAllListeners();

    // Get blockdata
    lastBlockNumber.value = BigNumber.from(await default_provider.value.getBlockNumber()).toNumber();

    // Get all grants and round data held in the registry/roundManager
    const [grantsData, grantRoundData, grantRoundDonationTokenAddress] = await Promise.all([
      getAllGrants(forceRefresh),
      getAllGrantRounds(forceRefresh),
      grantRoundManager.value.donationToken(),
    ]);

    // Collect the grants into a grantId->payoutAddress obj
    const grantsList = grantsData.grants || [];
    const grantIds = grantsList.map((grant: Grant) => grant.id);
    const grantPayees = grantsList.reduce((grants: Record<string, string>, grant: Grant, key: number) => {
      grants[key.toString()] = grant.payee;

      return grants;
    }, {});

    const approvedGrantsList = await getApprovedGrants(grantsData.grants);

    // Pull state from each GrantRound
    const roundAddresses = grantRoundData.roundAddresses || [];
    const grantRoundsList = (
      await Promise.all(
        roundAddresses.map(async (grantRoundAddress: string) => {
          const data = await getGrantRound(lastBlockNumber.value, grantRoundAddress, forceRefresh);
          return data?.grantRound;
        })
      )
    ).filter((grantRound) => grantRound) as GrantRound[];

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
            return grantRoundMetadata.value[metadataId(grantRound.metaPtr)].status === 'resolved';
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
    approvedGrants.value = approvedGrantsList as Grant[];
    grantContributions.value = contributions as Contribution[];
    grantRounds.value = grantRoundsList as GrantRound[];
    grantRoundsDonationToken.value = SUPPORTED_TOKENS_MAPPING[grantRoundDonationTokenAddress] as TokenInfo;

    // Set up refs to pass into listeners
    const refs: Record<string, Ref> = {
      contributions: grantContributions,
      grantRounds: grantRounds,
      grantRoundsCLRData: grantRoundsCLRData,
      grantRoundMetadata: grantRoundMetadata,
    };

    // Set up watchers on the grantRounds
    grantRoundsList.forEach(async (grantRound) => {
      // open the rounds contract
      const roundContract = new Contract(grantRound.address, GRANT_ROUND_ABI, default_provider.value);
      // open the rounds contract
      const matchingTokenContract = new Contract(
        await roundContract.matchingToken(),
        ERC20_ABI,
        default_provider.value
      );
      // attach listeners to the rounds
      listeners.value.push(
        metadataUpdatedListener(
          {
            grantRoundContract: roundContract,
            grantRoundAddress: grantRound.address,
            contributions: contributions,
            grantIds: grantIds,
            trustBonus: trustBonusScores,
          },
          refs
        ),
        matchingTokenListener(
          {
            matchingTokenContract: matchingTokenContract,
            grantRoundAddress: grantRound.address,
            contributions: contributions,
            grantIds: grantIds,
            trustBonus: trustBonusScores,
          },
          refs
        )
      );
    });

    // Set up watchers for new grants/grantRounds/contributions
    listeners.value.push(
      // grantRoundCreatedListener watches for `GrantRoundCreated` events on the `grantRoundManager` and
      // then associates two new listeners:
      // - grantRound.MetadataUpdated - pushed to listeners async - grantRound specific
      // - matchingToken.Transfers - pushed to listeners async - grantRound specific
      grantRoundCreatedListener(
        {
          listeners: listeners.value,
          grantIds: grantIds,
          contributions: contributions,
          trustBonus: trustBonusScores,
        },
        refs
      ),
      // All grant details can be fetched from the grantRegistry
      grantListener('GrantCreated', {
        grants,
        grantMetadata,
      }),
      grantListener('GrantUpdated', {
        grants,
        grantMetadata,
      }),
      // Contributions are routed through the grantRoundManager
      grantDonationListener(
        {
          grantIds: grantIds,
          trustBonus: trustBonusScores,
          grantPayees: grantPayees,
          donationToken: SUPPORTED_TOKENS_MAPPING[grantRoundDonationTokenAddress] as TokenInfo,
        },
        refs
      )
    );

    // init complete
    return true;
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
   * @notice helper function to filter approved grants
   *
   * @param grants Grant[]
   */
  async function getApprovedGrants(grants: Grant[]) {
    const uniqueStr = '?unique=' + Date.now();

    const whitelistUrl = import.meta.env.VITE_GRANT_WHITELIST_URI;
    if (whitelistUrl) {
      const url = whitelistUrl + uniqueStr;
      const json = await fetch(url).then((res) => res.json());
      grants = grants.filter((grant) => json[DGRANTS_CHAIN_ID].includes(grant.id));
    }

    return grants;
  }

  /**
   * @notice Call this method to poll now, then poll on each new block
   */
  async function startPolling() {
    // clear old wallet connections
    default_provider.value.removeAllListeners(); // provider used when wallet is connected
    // DEFAULT_PROVIDER.removeAllListeners(); // provider used when no wallet is connected

    // record the network value to detect changes
    const networkValue = (await getStorageKey('network'))?.data || network.value;
    // watch the network
    watch(
      () => [network.value],
      async () => {
        // clear storage and poll again for all network changes after first load
        if (networkValue && networkValue.chainId !== network.value?.chainId) {
          void (await DefaultStorage.clear());
          void (await init());
        }
        // update for next time
        await setStorageKey('network', { data: { chainId: network.value?.chainId } });
      }
    );
    // init the current state
    void (await init());
  }

  return {
    // Methods
    startPolling,
    init,
    // Data
    lastBlockNumber: computed(() => lastBlockNumber.value || 0),
    grants: computed(() => grants.value),
    approvedGrants: computed(() => approvedGrants.value),
    grantRounds: computed(() => grantRounds.value),
    grantMetadata: computed(() => grantMetadata.value),
    grantContributions: computed(() => grantContributions.value),
    grantRoundsCLRData: computed(() => grantRoundsCLRData.value),
    grantRoundMetadata: computed(() => grantRoundMetadata.value),
    grantRoundsDonationToken: computed(() => grantRoundsDonationToken.value),
  };
}

/**
 * @dev Poll on each block to read data
 */

// --- External imports ---
import { computed, Ref, ref, watch } from 'vue';

// --- Our imports ---
import { BigNumber, Contract } from 'src/utils/ethers';
import useWalletStore from 'src/store/wallet';
import { getAllGrants, grantListener, getApprovedGrants } from 'src/utils/data/grants';
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
  DEFAULT_PROVIDER,
} from 'src/utils/chains';
import { DefaultStorage, getStorageKey, setStorageKey } from 'src/utils/data/utils';
import { GRANT_ROUND_ABI, ERC20_ABI } from 'src/utils/constants';
import { metadataId } from 'src/utils/utils';

// --- Parameters required ---
const { grantRoundManager, network } = useWalletStore();

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
const approvedGrantsPk = ref<number[]>();

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
   * @notice Check if a given contract has been deployed on the default provider
   */
  async function checkIsDeployed(name: string, address: string) {
    // get the current donationToken
    let check = await getStorageKey(name);
    // set if absent
    if (!check) {
      await setStorageKey(name, (check = { data: { isDeployed: (await DEFAULT_PROVIDER.getCode(address)) !== '0x' } }));
    }
    // resolve the token address
    return check.data.isDeployed as boolean;
  }

  /**
   * @notice Called on init and network change - but can also be called on demand
   */
  async function rawInit(forceRefresh = false) {
    // Remove all listeners
    await removeAllListeners();

    // Check contracts are available on the given provider (or default provider)
    const [isGrantRegistryDeployed, isGrantRoundManagerDeployed] = await Promise.all([
      checkIsDeployed('registryIsDeployed', GRANT_REGISTRY_ADDRESS),
      checkIsDeployed('managerIsDeployed', GRANT_ROUND_MANAGER_ADDRESS),
    ]);

    // This ensures we're only attempting to load data from contracts which exist
    if (!isGrantRegistryDeployed && !isGrantRoundManagerDeployed) {
      return false;
    }

    // Get current blockNumber (pass this value in to methods to avoid additional rpc calls)
    lastBlockNumber.value = BigNumber.from(await DEFAULT_PROVIDER.getBlockNumber()).toNumber();

    // Get all grants and round data held in the registry/roundManager
    const [grantsData, grantRoundData, grantRoundDonationTokenAddress] = await Promise.all([
      getAllGrants(forceRefresh, lastBlockNumber.value),
      getAllGrantRounds(forceRefresh, lastBlockNumber.value),
      // get the donationToken from storage/grantRoundManager
      new Promise((resolve) => {
        // get the current donationToken
        getStorageKey('donationToken').then(async (storedDonationToken) => {
          // set if absent
          if (!storedDonationToken) {
            await setStorageKey(
              'donationToken',
              (storedDonationToken = {
                data: { donationToken: await grantRoundManager.value.donationToken() },
              })
            );
          }
          // resolves to the donation token address
          resolve(storedDonationToken.data.donationToken as string);
        });
      }),
    ]);

    // Collect the grants into a grantId->payoutAddress obj
    const grantsList = grantsData.grants || [];
    const grantIds = grantsList.map((grant: Grant) => grant.id);
    const grantPayees = grantsList.reduce((grants: Record<string, string>, grant: Grant, key: number) => {
      grants[key.toString()] = grant.payee;

      return grants;
    }, {});

    const approvedGrantsData = await getApprovedGrants(grantsData.grants);
    const approvedGrantsList = approvedGrantsData.grants;

    // Pull state from each GrantRound
    const roundAddresses = grantRoundData.roundAddresses || [];
    const grantRoundsList = (
      await Promise.all(
        roundAddresses.map(async (grantRoundAddress: string) => {
          // check the grantRound is deployed
          const isDeployed = await checkIsDeployed(`grantRoundIsDeployed-${grantRoundAddress}`, grantRoundAddress);
          // only attempt to get the GrantRound data if it is deployed
          if (isDeployed) {
            return (await getGrantRound(lastBlockNumber.value, grantRoundAddress, forceRefresh))?.grantRound;
          }
        })
      )
    ).filter((grantRound) => grantRound) as GrantRound[];

    // Fetch Metadata
    const grantMetaPtrs = grantsList.map((grant: Grant) => grant.metaPtr);
    const grantRoundMetaPtrs = grantRoundsList.map((grantRound: GrantRound) => grantRound.metaPtr);

    // Get latest set of contributions
    const contributions =
      (
        await getContributions(
          lastBlockNumber.value,
          grantPayees,
          SUPPORTED_TOKENS_MAPPING[grantRoundDonationTokenAddress as string],
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
            return grantRoundMetadata.value[metadataId(grantRound.metaPtr)]?.status === 'resolved';
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
    grantRoundsDonationToken.value = SUPPORTED_TOKENS_MAPPING[grantRoundDonationTokenAddress as string] as TokenInfo;
    approvedGrantsPk.value = approvedGrantsData.approvedGrantsPk;

    // Set up refs to pass into listeners
    const refs: Record<string, Ref> = {
      contributions: grantContributions,
      grantRounds: grantRounds,
      grantRoundsCLRData: grantRoundsCLRData,
      grantRoundMetadata: grantRoundMetadata,
    };

    // init listeners but dont block execution
    setTimeout(() => {
      // Set up watchers on the grantRounds
      grantRoundsList.forEach(async (grantRound) => {
        // open the rounds contract
        const roundContract = new Contract(grantRound.address, GRANT_ROUND_ABI, DEFAULT_PROVIDER);
        // open the rounds contract
        const matchingTokenContract = new Contract(await roundContract.matchingToken(), ERC20_ABI, DEFAULT_PROVIDER);
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
            donationToken: grantRoundsDonationToken.value as TokenInfo,
          },
          refs
        )
      );
    });

    // Fetch asynchronously without awaiting the response
    void fetchMetaPtrs(grantMetaPtrs, grantMetadata);
    void fetchMetaPtrs(grantRoundMetaPtrs, grantRoundMetadata);

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
   * @notice Call this method to poll now, then poll on each new block
   */
  async function startPolling() {
    // clear old wallet connections
    DEFAULT_PROVIDER.removeAllListeners();

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
      },
      {
        immediate: true,
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
    approvedGrantsPk: computed(() => approvedGrantsPk.value),
  };
}

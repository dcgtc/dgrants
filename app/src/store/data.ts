/**
 * @dev Poll on each block to read data
 */

// --- External imports ---
import { computed, Ref, ref } from 'vue';

// --- Our imports ---
import { BigNumber } from 'src/utils/ethers';
import useWalletStore from 'src/store/wallet';
import { getAllGrants } from 'src/utils/data/grants';
import { getContributions, getTrustBonusScores } from 'src/utils/data/contributions';
import { getAllGrantRounds, getGrantRound, getGrantRoundGrantData } from 'src/utils/data/grantRounds';
import { getStorage, setStorage } from 'src/utils/data/utils';
import {
  Grant,
  Contribution,
  GrantRound,
  GrantRoundCLR,
  GrantMetadataResolution,
  GrantRoundMetadataResolution,
} from '@dgrants/types';
import { resolveMetaPtr } from 'src/utils/data/ipfs';

// --- Parameters required ---
const { provider } = useWalletStore();

// --- State ---
// Most recent data read is saved as state
const lastBlockNumber = ref<number>(0);

const grants = ref<Grant[]>();
const grantContributions = ref<Contribution[]>();
const grantMetadata = ref<Record<string, GrantMetadataResolution>>({});

const grantRounds = ref<GrantRound[]>();
const grantRoundMetadata = ref<Record<string, GrantRoundMetadataResolution>>({});
const grantRoundsCLRData = ref<Record<string, GrantRoundCLR>>({});

// --- Store methods and exports ---
export default function useDataStore() {
  /**
   * @notice Called each block to poll for data, but can also be called on-demand, e.g. after user submits a transaction
   */
  async function rawPoll(forceRefresh = false) {
    // Get blockdata
    lastBlockNumber.value = BigNumber.from(await provider.value.getBlockNumber()).toNumber();

    // Get all grants and round data held in the registry/roundManager
    const [grantsData, grantRoundData] = await Promise.all([
      await getAllGrants(lastBlockNumber.value, forceRefresh),
      await getAllGrantRounds(lastBlockNumber.value, forceRefresh),
    ]);

    // collect the grants into a grantId->payoutAddress obj
    const grantsList = grantsData.grants || [];
    const grantsDict = grantsList.reduce((grants: Record<string, string>, grant: Grant, key: number) => {
      grants[key.toString()] = grant.payee;

      return grants;
    }, {});
    const roundAddresses = grantRoundData.roundAddresses || [];

    // Pull state from each GrantRound
    const grantRoundsList = (await Promise.all(
      roundAddresses.map(async (grantRoundAddress: string) => {
        const data = await getGrantRound(lastBlockNumber.value, grantRoundAddress, forceRefresh);

        return data?.grantRound;
      })
    )) as GrantRound[];

    // Get latest set of contributions
    const contributions = await getContributions(
      lastBlockNumber.value,
      grantsDict,
      grantRoundsList[0].donationToken,
      forceRefresh
    );

    // Pull all trust scores from gitcoin api (depends on the contributions from getContributions)
    const trustBonusScores = await getTrustBonusScores(
      lastBlockNumber.value,
      contributions.contributions,
      forceRefresh
    );

    // Pull all contributions for the current GrantRounds
    const grantDataByRound: Record<string, GrantRoundCLR> = (
      await Promise.all(
        roundAddresses.map(async (grantRoundAddress: string, key: number) => {
          const data = await getGrantRoundGrantData(
            lastBlockNumber.value,
            contributions.contributions,
            trustBonusScores.trustBonus,
            grantRoundAddress,
            grantsDict,
            grantRoundsList[key].matchingToken,
            forceRefresh
          );

          return data.grantRoundCLR;
        }) as GrantRoundCLR[]
      )
    ).reduce((byRound, data) => {
      byRound[data.grantRound] = data;

      return byRound;
    }, {} as Record<string, GrantRoundCLR>);

    // Fetch Metadata
    const grantMetaPtrs = grantsList.map((grant: Grant) => grant.metaPtr);
    const grantRoundMetaPtrs = grantRoundsList.map((grantRound: GrantRound) => grantRound.metaPtr);
    void fetchMetaPtrs(grantMetaPtrs, grantMetadata);
    void fetchMetaPtrs(grantRoundMetaPtrs, grantRoundMetadata);
    // Save off data
    grants.value = grantsList as Grant[];
    grantContributions.value = contributions.contributions as Contribution[];
    grantRounds.value = grantRoundsList as GrantRound[];
    grantRoundsCLRData.value = grantDataByRound as Record<string, GrantRoundCLR>;
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
          // save each individual ipfs result into storage
          let data = getStorage('ipfs-' + url);
          if (!data) {
            data = await resolveMetaPtr(url);
            setStorage('ipfs-' + url, data);
          }
          metadata.value[url] = { status: 'resolved', ...data };
        } catch (e) {
          metadata.value[url] = { status: 'error' };
          console.error(e);
        }
      })
    ));
    // trigger a set at the root
    metadata.value = { ...metadata.value };

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
    grants: computed(() => grants.value),
    grantRounds: computed(() => grantRounds.value),
    grantMetadata: computed(() => grantMetadata.value),
    grantContributions: computed(() => grantContributions.value),
    grantRoundsCLRData: computed(() => grantRoundsCLRData.value),
    grantRoundMetadata: computed(() => grantRoundMetadata.value),
  };
}

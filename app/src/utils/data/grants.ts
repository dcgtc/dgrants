// --- Types ---
import { Grant } from '@dgrants/types';
import { LocalStorageData } from 'src/types';
// --- Utils ---
import { syncStorage } from 'src/utils/data/utils';
import { BigNumber, Event } from 'ethers';
// --- Constants ---
import { allGrantsKey } from 'src/utils/constants';
import { START_BLOCK } from 'src/utils/chains';
// --- Data ---
import useWalletStore from 'src/store/wallet';

// --- pull in the registry contract
const { grantRegistry } = useWalletStore();

/**
 * @notice Given a grants tx event - get only the named args
 *
 * @param {Event} tx The current state
 */
const mapArgs = (tx: Event) => {
  return {
    id: tx.args?.id,
    owner: tx.args?.owner,
    payee: tx.args?.payee,
    metaPtr: tx.args?.metaPtr,
  } as Grant;
};

/**
 * @notice Get/Refresh all Grants
 *
 * @param {number} blockNumber The current blockNumber
 * @param {boolean} forceRefresh Force the cache to refresh
 */
export async function getAllGrants(blockNumber: number, forceRefresh = false) {
  return await syncStorage(
    allGrantsKey,
    {
      blockNumber: blockNumber,
      ts: Date.now() / 1000,
    },
    async (localStorageData?: LocalStorageData | undefined, save?: () => void) => {
      // use the ls_blockNumber to decide if we need to update the grants
      const ls_blockNumber = localStorageData?.blockNumber || START_BLOCK;
      // only update grants if new ones are added...
      let grants = localStorageData?.data?.grants || [];
      // each update should be pulled in when we hydrate localStorage state
      let grantUpdates: Grant[] = [];
      // every block
      if (forceRefresh || !localStorageData || (localStorageData && ls_blockNumber < blockNumber)) {
        // get the most recent block we collected
        const fromBlock = ls_blockNumber + 1 || START_BLOCK;
        // get new state
        const [newGrants, updatedGrants] = await Promise.all([
          grantRegistry.value?.queryFilter(
            grantRegistry?.value?.filters?.GrantCreated(null, null, null, null),
            fromBlock,
            blockNumber
          ),
          grantRegistry.value?.queryFilter(
            grantRegistry?.value?.filters?.GrantUpdated(null, null, null, null),
            fromBlock,
            blockNumber
          ),
        ]);
        // get any new donations to the grantRound
        grants = [...grants, ...(newGrants || []).map(mapArgs)];
        // check up updated grants
        grantUpdates = (updatedGrants || []).map(mapArgs);
      }

      // hydrate data from localStorage
      const ls_grants = {
        grants: grants.map((grant: Grant) => {
          const updatedGrant = grantUpdates.find((foundGrant) => {
            return BigNumber.from(grant.id).toString() === BigNumber.from(foundGrant.id).toString();
          });

          return {
            id: BigNumber.from(grant.id),
            owner: updatedGrant ? updatedGrant.owner : grant.owner,
            payee: updatedGrant ? updatedGrant.payee : grant.payee,
            metaPtr: updatedGrant ? updatedGrant.metaPtr : grant.metaPtr,
          } as Grant;
        }),
      };

      // conditionally save the state
      if (grants.length && save) {
        save();
      }

      // returns all Grants[]
      return ls_grants;
    }
  );
}

// --- Types ---
import { Grant } from '@dgrants/types';
import { LocalForageData, LocalForageAnyObj } from 'src/types';
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
    },
    async (LocalForageData?: LocalForageData | undefined, save?: (saveData: LocalForageAnyObj) => void) => {
      // use the ls_blockNumber to decide if we need to update the grants
      const ls_blockNumber = LocalForageData?.blockNumber || 0;
      // pull the indexed grants data from localStorage
      const ls_grants = LocalForageData?.data?.grants || {};
      // every block
      if (forceRefresh || !LocalForageData || (LocalForageData && ls_blockNumber < blockNumber)) {
        // get the most recent block we collected
        const fromBlock = ls_blockNumber + 1 || START_BLOCK;
        // pull any newly created or edited grants from all blocks since we last polled
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
        // set the mapped entries into the indexed grants data
        [...newGrants, ...updatedGrants]
          .map((tx: Event) => {
            return {
              id: tx.args?.id,
              owner: tx.args?.owner,
              payee: tx.args?.payee,
              metaPtr: tx.args?.metaPtr,
            } as Grant;
          })
          .forEach((grant) => {
            ls_grants[BigNumber.from(grant.id).toString()] = grant as Grant;
          });
      }

      // hydrate data from localStorage
      const grants = {
        grants: (Object.values(ls_grants) as Grant[]).map((grant) => {
          return {
            ...grant,
            // return the id as a BigNumber
            id: BigNumber.from(grant.id),
          } as Grant;
        }),
      };

      // conditionally save the state
      if (grants.grants.length && save) {
        save({
          grants: ls_grants,
        });
      }

      // returns all Grants[]
      return grants;
    }
  );
}

// --- Types ---
import { Grant } from '@dgrants/types';
import { LocalStorageData } from 'src/types';
// --- Utils ---
import { syncStorage } from 'src/utils/data/utils';
import { BigNumber } from 'ethers';
// --- Constants ---
import { allGrantsKey } from 'src/utils/constants';
// --- Data ---
import useWalletStore from 'src/store/wallet';

// --- pull in the registry contract
const { grantRegistry } = useWalletStore();

/**
 * @notice Get/Refresh all Grants
 *
 * @param {number} blockNumber The currenct blockNumber
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
      const ls_blockNumber = localStorageData?.blockNumber || 0;
      // only update grants if new ones are added...
      let grants = localStorageData?.data?.grants || [];
      // every block
      if (forceRefresh || !localStorageData || (localStorageData && ls_blockNumber < blockNumber)) {
        // get the most recent block we collected
        const fromBlock = ls_blockNumber + 1 || 0;
        // get any new donations to the grantRound
        grants = [
          ...grants,
          ...(
            (await grantRegistry.value?.queryFilter(
              grantRegistry?.value?.filters?.GrantCreated(null, null, null, null),
              fromBlock,
              blockNumber
            )) || []
          ).map((tx) => {
            return {
              id: tx.args?.id,
              owner: tx.args?.owner,
              payee: tx.args?.payee,
              metaPtr: tx.args?.metaPtr,
            };
          }),
        ];
      }

      // hydrate data from localStorage
      const ls_grants = {
        grants: grants.map((grant: Grant) => {
          return {
            id: BigNumber.from(grant.id),
            owner: grant.owner,
            payee: grant.payee,
            metaPtr: grant.metaPtr,
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

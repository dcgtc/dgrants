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
      let grants = localStorageData?.data?.grants || [];

      // read from the registry contract on first load and every 10 mins
      if (
        forceRefresh ||
        !localStorageData ||
        (localStorageData && (localStorageData.ts || 0) < Date.now() / 1000 - 60 * 10)
      ) {
        grants = (await grantRegistry.value?.getAllGrants()) || [];
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

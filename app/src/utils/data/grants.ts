// --- Types ---
import { Grant } from '@dgrants/types';
import { LocalForageData, LocalForageAnyObj } from 'src/types';
// --- Utils ---
import { syncStorage } from 'src/utils/data/utils';
import { BigNumber, BigNumberish, Event } from 'ethers';
// --- Constants ---
import { allGrantsKey } from 'src/utils/constants';
import { START_BLOCK, SUBGRAPH_URL } from 'src/utils/chains';
// --- Data ---
import useWalletStore from 'src/store/wallet';
import { batchFilterCall } from '../utils';
import { Ref } from 'vue';
import { getAddress } from '../ethers';

// --- pull in the registry contract
const { grantRegistry, provider } = useWalletStore();

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
        let fromBlock = ls_blockNumber ? ls_blockNumber + 1 : START_BLOCK;
        // attempt to use the subgraph first
        if (SUBGRAPH_URL) {
          type Subgraph_Grant = {
            id: BigNumberish;
            owner: string;
            payee: string;
            metaPtr: string;
            lastUpdatedBlockNumber: number;
          };
          try {
            // make the request
            const res = await fetch(SUBGRAPH_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                query: `{
                  grants(where: {lastUpdatedBlockNumber_gte: ${fromBlock}, lastUpdatedBlockNumber_lte: ${blockNumber}}) {
                    id
                    owner
                    payee
                    metaPtr
                    lastUpdatedBlockNumber
                  }
                }`,
              }),
            });
            // resolve the json
            const json = await res.json();
            // update each of the grants
            json.data.grants.forEach((grant: Subgraph_Grant) => {
              // update to most recent block collected
              fromBlock = Math.max(fromBlock, grant.lastUpdatedBlockNumber);
              const grantId = BigNumber.from(grant.id).toNumber();
              ls_grants[grantId] = {
                id: grantId,
                owner: getAddress(grant.owner),
                payee: getAddress(grant.payee),
                metaPtr: grant.metaPtr,
              } as Grant;
            });
          } catch (e) {
            console.log('dGrants: Data fetch error - Subgraph request failed');
          }
        }
        // get remaining blocks from rpc
        if (fromBlock < blockNumber) {
          // pull any newly created or edited grants from all blocks since we last polled
          const [newGrants, updatedGrants] = await Promise.all([
            batchFilterCall(
              {
                contract: grantRegistry.value,
                filter: 'GrantCreated',
                args: [null, null, null, null],
              },
              fromBlock,
              blockNumber
            ),
            batchFilterCall(
              {
                contract: grantRegistry.value,
                filter: 'GrantUpdated',
                args: [null, null, null, null],
              },
              fromBlock,
              blockNumber
            ),
          ]);
          // set the mapped entries into the indexed grants data
          [...newGrants, ...updatedGrants]
            .map((tx: Event) => {
              return {
                id: BigNumber.from(tx.args?.id).toNumber(),
                owner: getAddress(tx.args?.owner),
                payee: getAddress(tx.args?.payee),
                metaPtr: tx.args?.metaPtr,
              } as Grant;
            })
            .forEach((grant) => {
              ls_grants[grant.id] = grant as Grant;
            });
        }
      }

      // hydrate data from localStorage
      const grants = {
        grants: (Object.values(ls_grants) as Grant[]).map((grant) => {
          return {
            ...grant,
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

/**
 * @notice Attach an event listener on grantRegistry->GrantCreated
 */
export function grantListener(name: string, args: Record<string, Ref>) {
  const listener = async (grantId: BigNumberish, owner: string, payee: string, metaPtr: string) => {
    void (await syncStorage(
      allGrantsKey,
      {
        blockNumber: provider.value.getBlockNumber(),
      },
      async (LocalForageData?: LocalForageData | undefined, save?: (saveData?: LocalForageAnyObj) => void) => {
        // pull the indexed grants data from localStorage
        const ls_grants = LocalForageData?.data?.grants || {};

        // use grantId as a number
        grantId = BigNumber.from(grantId).toNumber();

        // add the new grant
        ls_grants[grantId] = {
          id: grantId,
          owner: owner,
          payee: payee,
          metaPtr: metaPtr,
        };

        // update the stored grants
        args.grants.value = Object.values(ls_grants) as Grant[];

        // save into localstorage
        if (save) {
          save();
        }

        // return object to be saved
        return {
          grants: ls_grants,
        };
      }
    ));
  };

  // attach the listener to the registry
  grantRegistry.value.on(name, listener);

  // return a method to drop the listener
  return {
    off: () => grantRegistry.value.off(name, listener),
  };
}

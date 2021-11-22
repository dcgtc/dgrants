// --- Types ---
import { Grant, GrantSubgraph, MetaPtr } from '@dgrants/types';
import { LocalForageData, LocalForageAnyObj } from 'src/types';
// --- Utils ---
import { syncStorage } from 'src/utils/data/utils';
import { BigNumber, BigNumberish, Event } from 'ethers';
// --- Constants ---
import { allGrantsKey } from 'src/utils/constants';
import { DEFAULT_PROVIDER, START_BLOCK, SUBGRAPH_URL } from 'src/utils/chains';
// --- Data ---
import useWalletStore from 'src/store/wallet';
import { batchFilterCall, recursiveGraphFetch } from '../utils';
import { Ref } from 'vue';
import { getAddress } from '../ethers';
import { getMetadata } from './ipfs';

// --- pull in the registry contract
const { grantRegistry } = useWalletStore();

/**
 * @notice Get/Refresh all Grants
 *
 * @param {boolean} forceRefresh Force the cache to refresh
 */

export async function getAllGrants(forceRefresh = false) {
  const latestBlockNumber = BigNumber.from(await DEFAULT_PROVIDER.getBlockNumber()).toNumber();

  return await syncStorage(
    allGrantsKey,
    {
      blockNumber: latestBlockNumber,
    },
    async (LocalForageData?: LocalForageData | undefined, save?: (saveData: LocalForageAnyObj) => void) => {
      // check how far out of sync we are from the cache and pull any events that happened bwtween then and now
      const _lsBlockNumber = LocalForageData?.blockNumber || 0;
      // pull the indexed grants data from localStorage
      const _lsGrants = LocalForageData?.data?.grants || {};
      // every block
      if (forceRefresh || !LocalForageData || (LocalForageData && _lsBlockNumber < latestBlockNumber)) {
        // get the most recent block we collected
        let fromBlock = _lsBlockNumber ? _lsBlockNumber + 1 : START_BLOCK;
        // attempt to use the subgraph first
        if (SUBGRAPH_URL) {
          try {
            // make the request
            const grants = await recursiveGraphFetch(
              SUBGRAPH_URL,
              'grants',
              (filter: string) => `{
                grants(${filter}) {
                  id
                  owner
                  payee
                  metaPtr
                  createdAtTimestamp
                  lastUpdatedTimestamp
                  lastUpdatedBlockNumber
                }
              }`,
              fromBlock
            );
            // update each of the grants
            grants.forEach((grant: GrantSubgraph) => {
              const grantId = BigNumber.from(grant.id).toNumber();
              _lsGrants[grantId] = {
                id: grantId,
                owner: getAddress(grant.owner),
                payee: getAddress(grant.payee),
                metaPtr: grant.metaPtr,
                createdAt: grant.createdAtTimestamp,
                lastUpdated: grant.lastUpdatedTimestamp,
              } as Grant;
            });
            // update to most recent block collected
            fromBlock = latestBlockNumber;
          } catch {
            console.log('dGrants: Data fetch error - Subgraph request failed');
          }
        }
        // get remaining blocks from rpc
        if (fromBlock < latestBlockNumber) {
          // pull any newly created or edited grants from all blocks since we last polled
          const [newGrants, updatedGrants] = await Promise.all([
            batchFilterCall(
              {
                contract: grantRegistry.value,
                filter: 'GrantCreated',
                args: [null, null, null, null],
              },
              fromBlock,
              latestBlockNumber
            ),
            batchFilterCall(
              {
                contract: grantRegistry.value,
                filter: 'GrantUpdated',
                args: [null, null, null, null],
              },
              fromBlock,
              latestBlockNumber
            ),
          ]);
          // set the mapped entries into the indexed grants data
          [...newGrants, ...updatedGrants]
            .map((tx: Event) => {
              const grantId = BigNumber.from(tx.args?.id).toNumber();
              return {
                id: grantId,
                owner: getAddress(tx.args?.owner),
                payee: getAddress(tx.args?.payee),
                metaPtr: tx.args?.metaPtr,
                createdAt: _lsGrants[grantId] ? _lsGrants[grantId].createdAt : tx.args?.time,
                lastUpdated: tx.args?.time,
              } as Grant;
            })
            .forEach((grant) => {
              _lsGrants[grant.id] = grant as Grant;
            });
        }
      }

      // hydrate data from localStorage
      const grants = {
        grants: (Object.values(_lsGrants) as Grant[]).map((grant) => {
          return { ...grant } as Grant;
        }),
      };

      // conditionally save the state
      if (grants.grants.length && save) {
        save({
          grants: _lsGrants,
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
export function grantListener(name: string, refs: Record<string, Ref>) {
  const listener = async (
    grantId: BigNumberish,
    owner: string,
    payee: string,
    metaPtr: MetaPtr,
    time: BigNumberish
  ) => {
    console.log(`New ${name} event: `, { grantId: BigNumber.from(grantId).toNumber() });
    void (await syncStorage(
      allGrantsKey,
      {
        blockNumber: await DEFAULT_PROVIDER.getBlockNumber(),
      },
      async (LocalForageData?: LocalForageData | undefined, save?: () => void) => {
        // pull the indexed grants data from localStorage
        const _lsGrants = LocalForageData?.data?.grants || {};

        // use grantId as a number
        grantId = BigNumber.from(grantId).toNumber();

        // update the grants metadata
        const areMetaPtrsEqual = (x: MetaPtr, y: MetaPtr) =>
          BigNumber.from(x.protocol).toString() === BigNumber.from(y.protocol).toString() && x.protocol === y.protocol;

        if (_lsGrants[grantId] && !areMetaPtrsEqual(_lsGrants[grantId].metaPtr, metaPtr)) {
          void (await getMetadata(metaPtr, refs.grantMetadata));
        }

        // add the new grant
        _lsGrants[grantId] = {
          id: grantId,
          owner: getAddress(owner),
          payee: getAddress(payee),
          metaPtr: metaPtr,
          createdAt: _lsGrants[grantId] ? _lsGrants[grantId].createdAt : time,
          lastUpdated: time,
        };

        // update the stored grants
        refs.grants.value = Object.values(_lsGrants) as Grant[];

        // save into localstorage
        if (save) {
          save();
        }

        // return object to be saved
        return {
          grants: _lsGrants,
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

/**
 * 1. Functions in this file should allow uploading and fetching MetaPtr's.
 * Inside these utility functions, we should detect the protocol, then curry the pointer off to the appropriate method
 * to fetch/upload the data for the protocol in question. Currently, the only supported protocols should be 0
 * (return null on fetch, no-op on upload) or 1 for IPFS, which should pull out the CID and pass it to the aforementioned IPFS utils.
 * Any other protocol ID should throw.
 *
 * Questions:
 * 1. What is purpose of the class?
 * 2. What is the reason for change?
 */

import { GrantRoundMetadataResolution, MetaPtr } from '@dgrants/types';
import { assertIPFSPointer, decodeMetadataId, getMetaPtr, metadataId } from 'src/utils/utils';
import { getStorageKey, setStorageKey } from 'src/utils/data/utils';
import { LocalForageData } from 'src/types';
import { Ref } from 'vue';

/**
 * Resolves a metaPtr via fetch
 * @param url URL of metaPtr
 * @returns Object
 */
export const resolveMetaPtr = (url: string) => {
  return fetch(url).then((res) => res.json());
};

/**
 * @notice Helper method that fetches and or returns metadata for a Grant or GrantRound, and saves the data
 * to the state as soon as it's received
 * @param metaPtr metadata pointer object
 * @param metadata Ref store's ref to assign resolved metadata to
 */
export const getMetadata = async (metaPtr: MetaPtr, metadata: Ref) => {
  assertIPFSPointer(metaPtr);
  const id = metadataId(metaPtr);
  const fillMetadata = {} as Record<string, GrantRoundMetadataResolution>;
  try {
    // save each individual ipfs result into storage
    let data = await getStorageKey('ipfs-' + id);
    if (!data) {
      const url = getMetaPtr({ cid: metaPtr.pointer });
      data = await resolveMetaPtr(url);
      await setStorageKey('ipfs-' + id, data as LocalForageData);
    }
    fillMetadata[id] = { status: 'resolved', ...data };
  } catch (e) {
    fillMetadata[id] = { status: 'error' };
    console.error(e);
  }
  // place the metadata
  metadata.value = { ...metadata.value, ...fillMetadata };

  return metadata.value[id];
};

/**
 * @notice Helper method that fetches metadata for a Grant or GrantRound, and saves the data
 * to the state as soon as it's received
 * @param metaPtrs Array of IPFS MetaPtrs to resolve
 * @param metadata Name of the store's ref to assign resolve metadata to
 */
export const fetchMetaPtrs = async (metaPtrs: MetaPtr[], metadata: Ref) => {
  metaPtrs.forEach(assertIPFSPointer);

  // check for any missing entries
  const newMetadata = metaPtrs
    .filter((_, i) => {
      return !metadata.value[metadataId(metaPtrs[i])] || metadata.value[metadataId(metaPtrs[i])].status === 'error';
    })
    .reduce((prev, cur) => {
      return {
        ...prev,
        [metadataId(cur)]: { status: 'pending' },
      };
    }, {});
  // when there is new metadata to load...
  if (Object.keys(newMetadata).length) {
    // save these pending metadata objects to state
    metadata.value = { ...metadata.value, ...newMetadata };
    // resolve metadata via metaPtr and update state (no need to wait for resolution)
    Object.keys(newMetadata).forEach((id) => getMetadata(decodeMetadataId(id), metadata));
  }

  return metadata;
};

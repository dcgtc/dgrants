import { createIpfs } from '@dgrants/utils/src/ipfs';
import { GrantMetadata, MetaPtr } from '@dgrants/types';
import { getStorageKey, setStorageKey } from 'src/utils/data/utils';
import { decodeMetadataId, metadataId } from 'src/utils/utils';
import { BigNumber } from 'src/utils/ethers';
import { LocalForageData } from 'src/types';
import { Ref } from 'vue';

const retrievalEndpoint = 'https://scopelift.b-cdn.net/ipfs';

function assertIPFSPointer(logoPtr: MetaPtr | undefined) {
  if (!logoPtr) throw new Error('assertIPFSPointer: logoPtr is undefined');
  if (typeof logoPtr == 'string') {
    logoPtr = decodeMetadataId(logoPtr);
  }
  const protocol = BigNumber.from(logoPtr.protocol).toString();
  if (!['0', '1'].includes(protocol))
    throw new Error(`assertIPFSPointer: Expected protocol ID of 1, found ${protocol}`);
}

export const ipfs = createIpfs(import.meta.env.VITE_FLEEK_STORAGE_API_KEY);

export const uploadFile = async (file: File) => {
  const res = await ipfs.add(file);
  return res.cid;
};

/**
 * Adds grant metadata to IPFS
 * @param obj
 * @param obj.name Name of grant
 * @param obj.description Description of grant
 * @returns CID
 */
export const uploadGrantMetadata = async ({ name, description, logoPtr, properties }: GrantMetadata) => {
  assertIPFSPointer(logoPtr);
  const res = await ipfs.add(JSON.stringify({ name, description, logoPtr, properties }));
  return res.cid;
};

/**
 * Creates a url for a MetaPtr
 * @param obj
 * @param obj.cid CID of the grant
 * @returns string
 */
export const getMetaPtr = ({ cid }: { cid: string | undefined }) => {
  return `${retrievalEndpoint}/${cid}`;
};

/**
 * Given a CID, formats the metadata pointer for compatibility with the contracts
 * @param cid CID of the grant
 * @returns string
 */
export const formatMetaPtr = (cid: string): MetaPtr => {
  return {
    protocol: 1, // IPFS has a protocol ID of 1
    pointer: cid,
  };
};

/**
 * Resolves a metaPtr via fetch
 * @param url URL of metaPtr
 * @returns Object
 */
export const resolveMetaPtr = (url: string) => {
  return fetch(url).then((res) => res.json());
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

/**
 * @notice Helper method that fetches and or returns metadata for a Grant or GrantRound, and saves the data
 * to the state as soon as it's received
 * @param metaPtr metadata pointer object
 * @param metadata Ref store's ref to assign resolved metadata to
 */
export const getMetadata = async (metaPtr: MetaPtr, metadata: Ref) => {
  assertIPFSPointer(metaPtr);
  const id = metadataId(metaPtr);
  try {
    // save each individual ipfs result into storage
    let data = await getStorageKey('ipfs-' + id);
    if (!data) {
      const url = getMetaPtr({ cid: metaPtr.pointer });
      data = await resolveMetaPtr(url);
      await setStorageKey('ipfs-' + id, data as LocalForageData);
    }
    metadata.value[id] = { status: 'resolved', ...data };
  } catch (e) {
    metadata.value[id] = { status: 'error' };
    console.error(e);
  }

  return metadata.value[id];
};

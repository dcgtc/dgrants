import { createIpfs } from '@dgrants/utils/src/ipfs';
import { GrantMetadata } from '@dgrants/types';
import { getStorageKey, setStorageKey } from './utils';
import { LocalStorageData } from 'src/types';
import { Ref } from 'vue';

const retrievalEndpoint = 'https://ipfs-dev.fleek.co/ipfs';

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
export const uploadGrantMetadata = async ({ name, description, logoURI, properties }: GrantMetadata) => {
  const res = await ipfs.add(JSON.stringify({ name, description, logoURI, properties }));
  return res.cid;
};

/**
 * Creates a url for a MetaPtr
 * @param obj
 * @param obj.cid CID of the grant
 * @returns string
 */
export const getMetaPtr = ({ cid }: { cid: string }) => {
  return `${retrievalEndpoint}/${cid}`;
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
 * @param metaPtrs Array of URLs to resolve
 * @param metadata Name of the store's ref to assign resolve metadata to
 */
export const fetchMetaPtrs = async (metaPtrs: string[], metadata: Ref) => {
  // check for any missing entries
  const newMetadata = metaPtrs
    .filter((metaPtr) => !metadata.value[metaPtr] || metadata.value[metaPtr].status === 'error')
    .reduce((prev, cur) => {
      return {
        ...prev,
        [cur]: { status: 'pending' },
      };
    }, {});
  // when there is new metadata to load...
  if (Object.keys(newMetadata).length) {
    // save these pending metadata objects to state
    metadata.value = { ...metadata.value, ...newMetadata };
    // resolve metadata via metaPtr and update state
    void (await Promise.all(
      Object.keys(newMetadata).map(async (url) => {
        try {
          // save each individual ipfs result into storage
          let data = await getStorageKey('ipfs-' + url);
          if (!data) {
            data = await resolveMetaPtr(url);
            await setStorageKey('ipfs-' + url, data as LocalStorageData);
          }
          metadata.value[url] = { status: 'resolved', ...data };
        } catch (e) {
          metadata.value[url] = { status: 'error' };
          console.error(e);
        }
      })
    ));
  }

  return metadata;
};

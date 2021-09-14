import { createIpfs } from '@dgrants/utils/src/ipfs';
import { GrantMetadata } from '@dgrants/types';

const RetrievalEndpoint = 'https://ipfs-dev.fleek.co/ipfs';

export const ipfs = createIpfs(import.meta.env.VITE_FLEEK_STORAGE_API_KEY);

/**
 * Adds grant metadata to IPFS
 * @param obj
 * @param obj.name Name of grant
 * @param obj.description Description of grant
 * @returns CID
 */
export const uploadGrantMetadata = async ({ name, description, properties }: GrantMetadata) => {
  const res = await ipfs.add(JSON.stringify({ name, description, properties }));
  return res.cid;
};

/**
 * Creates a url for a MetaPtr
 * @param obj
 * @param obj.cid CID of the grant
 * @returns string
 */
export const getMetaPtr = ({ cid }: { cid: string }) => {
  return `${RetrievalEndpoint}/${cid}`;
};

/**
 * Resolves a metaPtr via fetch
 * @param url URL of metaPtr
 * @returns Object
 */
export const resolveMetaPtr = (url: string) => {
  return fetch(url).then((res) => res.json());
};

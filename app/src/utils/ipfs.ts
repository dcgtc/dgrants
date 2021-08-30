import { create } from 'ipfs-http-client';
import { GrantMetadata } from '@dgrants/types';

const config = {
  storageEndpoint: 'https://ipfs-api.dev.fleek.cool',
  storageHeaders: {
    Authorization: `v2 ${import.meta.env.VITE_FLEEK_STORAGE_API_KEY}`, // or Bearer <JWT> or public <AppKey>
  },
  retrievalEndpoint: 'https://cloudflare-ipfs.com/ipfs',
};

const ipfs = create({
  url: config.storageEndpoint,
  headers: config.storageHeaders,
});

/**
 * Adds grant metadata to IPFS
 * @param obj
 * @param obj.name Name of grant
 * @param obj.description Description of grant
 * @returns CID
 */
export const createGrant = async ({ name, description, properties }: GrantMetadata) => {
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
  return `${config.retrievalEndpoint}/${cid}`;
};

/**
 * Resolves a metaPtr via fetch
 * @param url URL of metaPtr
 * @returns Object
 */
export const resolveMetaPtr = (url: string) => {
  return fetch(url).then((res) => res.json());
};

import { createIpfs } from '@dgrants/utils/src/ipfs';
import { GrantMetadata } from '@dgrants/types';
import { assertIPFSPointer } from 'src/utils/utils';

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

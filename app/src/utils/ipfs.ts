import { create } from 'ipfs-http-client';
import config from 'src/config';
import { GrantMetadata } from '@dgrants/types';

const ipfs = create({
  url: config.ipfs.endpoint,
  headers: config.ipfs.headers,
});

export const createGrant = async ({ name, description }: GrantMetadata) => {
  const res = await ipfs.add(JSON.stringify({ name, description }));
  return res.cid;
};

export const createMetaPtr = ({ cid }: { cid: string }) => {
  return `${config.ipfs.metaPtrEndpoint}/${cid}`;
};

export const ipfsFetch = async ({ cid }: { cid: string }) => {
  for await (const file of ipfs.get(cid)) {
    if (file.type !== 'file' || !file.content) {
      continue;
    } else {
      const content = [];
      for await (const chunk of file.content) {
        content.push(chunk);
      }
      return JSON.parse(content.toString());
    }
  }
  throw Error('no content');
};

export const resolveMetaPtr = (url: string) => {
  return ipfsFetch({
    cid: url.split('/').reverse()[0],
  });
};

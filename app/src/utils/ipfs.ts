import { create } from 'ipfs-http-client';
import config from 'src/config';

const ipfs = create({
  url: config.ipfs.endpoint,
  headers: config.ipfs.headers,
});

export const createGrant = async ({ name, description }: { name: string; description: string }) => {
  const res = await ipfs.add(JSON.stringify({ name, description }));
  return res.cid;
};

export const createMetaPtr = ({ cid }: { cid: string }) => {
  return `${config.ipfs.endpoint}/${cid}`;
};

export const ipfsFetch = async ({ cid }: { cid: string }) => {
  for await (const file of ipfs.get(cid)) {
    // @ts-ignore
    if (!file.content) continue;

    const content = [];
    // @ts-ignore
    for await (const chunk of file.content) {
      content.push(chunk);
    }

    return JSON.parse(content.toString());
  }
};

export const resolveMetaPtr = ({ url }: { url: string }) => {
  return ipfsFetch({
    cid: url.split('/').reverse()[0],
  });
};

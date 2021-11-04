import { create } from 'ipfs-http-client';

const ipfsEndpoint = 'https://ipfs.fleek.co';

export const createIpfs = (fleekApiKey: string) => {
  return create({
    url: ipfsEndpoint,
    headers: {
      Authorization: `v2 ${fleekApiKey}`,
    },
  });
};

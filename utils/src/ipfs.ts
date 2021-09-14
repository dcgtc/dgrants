import { create } from 'ipfs-http-client';

const ipfsEndpoint = 'https://ipfs-api.dev.fleek.cool';

export const createIpfs = (fleekApiKey: string) => {
  return create({
    url: ipfsEndpoint,
    headers: {
      Authorization: `v2 ${fleekApiKey}`,
    },
  });
};

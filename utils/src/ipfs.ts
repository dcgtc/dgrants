import { create } from 'ipfs-http-client';

const IpfsEndpoint = 'https://ipfs-api.dev.fleek.cool';

export const createIpfs = (fleekApiKey: string) => {
  return create({
    url: IpfsEndpoint,
    headers: {
      Authorization: `v2 ${fleekApiKey}`,
    },
  });
};

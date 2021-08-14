export default {
  ipfs: {
    endpoint: 'https://ipfs-api.dev.fleek.cool',
    headers: {
      Authorization: `v2 ${import.meta.env.VITE_FLEEK_API_KEY}`, // or Bearer <JWT> or public <AppKey>
    },
    metaPtrEndpoint: 'https://ipfs-api.dev.fleek.cool',
    // metaPtrEndpoint: 'https://cloudflare-ipfs.com/ipfs',
  },
};

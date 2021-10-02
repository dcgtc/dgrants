import metadataJson from './assets/grant-round-metadata.json';

type NetworkParams = {
  roundAddress: string;
  ipfsRetrievalEndpoint: string;
  roundLogoPath: string; // this path must be relative to the 'contracts' directory
  metadataJson: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
};

type DeployParams = Record<string, NetworkParams>;

const params: DeployParams = {
  localhost: {
    // expected address using app.ts w/ hardhat default account
    //roundAddress: '0x8b4091997e3ebb87be90ced3e50d8bb27e1dc742',

    // expected address using deploy-poc.ts w/ hardhat default account
    roundAddress: '0x851248dBF29D723f3A12EA9739A9D1c88d1c7faa',
    ipfsRetrievalEndpoint: 'https://ipfs-dev.fleek.co/ipfs',
    roundLogoPath: './scripts/config/assets/dgrants-placeholder.png',
    metadataJson,
  },
  mainnet: {
    roundAddress: '0x0000000000000000000000000000000000000000',
    ipfsRetrievalEndpoint: 'https://ipfs-dev.fleek.co/ipfs',
    roundLogoPath: './scripts/config/assets/dgrants-placeholder.png',
    metadataJson,
  },
  rinkeby: {
    roundAddress: '0xa287E6E74F4bB2408C36cb0a062e72300cBEc2E9',
    ipfsRetrievalEndpoint: 'https://ipfs-dev.fleek.co/ipfs',
    roundLogoPath: './scripts/config/assets/dgrants-placeholder.png',
    metadataJson,
  },
};

export default params;

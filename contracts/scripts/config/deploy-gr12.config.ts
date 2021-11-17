import metadataJson from './assets/grant-round-metadata.json';

type NetworkParams = {
  // GrantRoundManager parameters
  donationToken: string;
  uniswapFactory: string;
  weth: string;
  // GrantRound parameters
  metadataAdmin: string;
  payoutAdmin: string;
  matchingToken: string;
  roundStartTime: number;
  roundEndTime: number;
  ipfsRetrievalEndpoint: string;
  roundLogoPath: string; // this path must be relative to the 'contracts' directory
  metadataJson: Record<string, any>; // eslint-disable-line @typescript-eslint/no-explicit-any
};

type DeployParams = Record<string, NetworkParams>;

const params: DeployParams = {
  localhost: {
    // These are mainnet settings
    donationToken: '0x6B175474E89094C44Da98b954EedeAC495271d0F', // DAI
    uniswapFactory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    metadataAdmin: '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266',
    payoutAdmin: '0x0000000000000000000000000000000000000000',
    matchingToken: '0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F', // GTC
    roundStartTime: 1661990400, // Thursday, September 1, 2022 12:00:00 AM GMT
    roundEndTime: 1663200000, // Thursday, September 15, 2022 12:00:00 AM GMT
    ipfsRetrievalEndpoint: 'https://ipfs.fleek.co/ipfs',
    roundLogoPath: './scripts/config/assets/dgrants-placeholder.png',
    metadataJson,
  },
  polygon: {
    donationToken: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI
    uniswapFactory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
    weth: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    metadataAdmin: '0x6BF1EBa9740441D0A8822EDa4E116a74f850d81B',
    payoutAdmin: '0x6BF1EBa9740441D0A8822EDa4E116a74f850d81B',
    matchingToken: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI
    roundStartTime: 1637154000,
    roundEndTime: 1641072061,
    ipfsRetrievalEndpoint: 'https://ipfs.fleek.co/ipfs',
    roundLogoPath: './scripts/config/assets/dgrants-placeholder.png',
    metadataJson,
  },
  rinkeby: {
    donationToken: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa', // DAI
    uniswapFactory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    weth: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    metadataAdmin: '0x6BF1EBa9740441D0A8822EDa4E116a74f850d81B',
    payoutAdmin: '0x6BF1EBa9740441D0A8822EDa4E116a74f850d81B',
    matchingToken: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa', // DAI
    roundStartTime: 1637154000, // set start time to time in the future
    roundEndTime: 1641072061,
    ipfsRetrievalEndpoint: 'https://ipfs.fleek.co/ipfs',
    roundLogoPath: './scripts/config/assets/dgrants-placeholder.png',
    metadataJson,
  },
};

export default params;

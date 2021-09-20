// based off of: https://github.com/Uniswap/uniswap-interface/blob/81b13469371b3371a55b4b29c7365b1610a8d865/src/constants/chains.ts
import { TokenInfo } from '@uniswap/token-lists';
import { getAddress } from 'src/utils/ethers';

// --- Types and data ---
export enum SupportedChainId {
  // L1
  MAINNET = 1,
  RINKEBY = 4,
  HARDHAT = 31337,
  // L2
  ARBITRUM_ONE = 42161,
  ARBITRUM_RINKEBY = 421611,
  OPTIMISM = 10,
  OPTIMISTIC_KOVAN = 69,
}

export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = [
  // L1
  SupportedChainId.MAINNET,
  SupportedChainId.HARDHAT,
  SupportedChainId.RINKEBY,
  // L2
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ARBITRUM_RINKEBY,
  SupportedChainId.OPTIMISM,
  SupportedChainId.OPTIMISTIC_KOVAN,
];

export const L1_CHAIN_IDS = [SupportedChainId.MAINNET, SupportedChainId.RINKEBY, SupportedChainId.HARDHAT] as const;

export type SupportedL1ChainId = typeof L1_CHAIN_IDS[number];

export const L2_CHAIN_IDS = [
  SupportedChainId.ARBITRUM_ONE,
  SupportedChainId.ARBITRUM_RINKEBY,
  SupportedChainId.OPTIMISM,
  SupportedChainId.OPTIMISTIC_KOVAN,
] as const;

export type SupportedL2ChainId = typeof L2_CHAIN_IDS[number];

// When building the app, only one Chain ID is supported per build to avoid mixing different GrantRegistry's, etc
export const DGRANTS_CHAIN_ID = (Number(import.meta.env.VITE_DGRANTS_CHAIN_ID) as SupportedChainId) || 4; // default to Rinkeby
const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;

interface L1ChainInfo {
  readonly explorer: string;
  readonly label: string;
  readonly tokens: TokenInfo[];
  readonly tokensMapping: Record<string, TokenInfo>;
  readonly rpcUrl: string;
  readonly nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  // contract addresses
  readonly weth: string;
  readonly grantRegistry: string;
  readonly grantRoundManager: string;
  readonly multicall: string;
}

export interface L2ChainInfo extends L1ChainInfo {
  readonly bridge: string;
  readonly logoUrl: string;
}

type ChainInfo = { readonly [chainId: number]: L1ChainInfo | L2ChainInfo } & {
  readonly [chainId in SupportedL2ChainId]: L2ChainInfo;
} &
  { readonly [chainId in SupportedL1ChainId]: L1ChainInfo };

const ETH_TOKEN = { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', name: 'Ether', symbol: 'ETH', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880' }; // prettier-ignore
const DAI_TOKEN = { name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/9956/thumb/dai-multi-collateral-mcd.png?1574218774' }; // prettier-ignore
const USDC_TOKEN = { name: 'USD Coin', symbol: 'USDC', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389' }; // prettier-ignore

const MAINNET_TOKENS = [
  { ...ETH_TOKEN, chainId: SupportedChainId.MAINNET },
  { ...DAI_TOKEN, chainId: SupportedChainId.MAINNET, address: '0x6B175474E89094C44Da98b954EedeAC495271d0F' },
  { ...USDC_TOKEN, chainId: SupportedChainId.MAINNET, address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48' },
  {
    chainId: SupportedChainId.MAINNET,
    address: '0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F',
    name: 'Gitcoin',
    symbol: 'GTC',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/15810/thumb/gitcoin.png?1621992929',
  },
  {
    chainId: SupportedChainId.MAINNET,
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    name: 'Uniswap',
    symbol: 'UNI',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/12504/thumb/uniswap-uni.png?1600306604',
  },
];

const RINKEBY_TOKENS = [
  { ...ETH_TOKEN, chainId: SupportedChainId.RINKEBY },
  { ...DAI_TOKEN, chainId: SupportedChainId.RINKEBY, address: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa' },
];

const ARBITRUM_ONE_TOKENS = [
  // https://bridge.arbitrum.io/token-list-42161.json
  { ...ETH_TOKEN, chainId: SupportedChainId.ARBITRUM_ONE },
  { ...USDC_TOKEN, chainId: SupportedChainId.ARBITRUM_ONE, address: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8' },
];

const ARBITRUM_RINKEBY_TOKENS = [{ ...ETH_TOKEN, chainId: SupportedChainId.ARBITRUM_RINKEBY }];

const OPTIMISM_TOKENS = [
  // https://static.optimism.io/optimism.tokenlist.json
  { ...ETH_TOKEN, chainId: SupportedChainId.OPTIMISM },
  { ...DAI_TOKEN, chainId: SupportedChainId.OPTIMISM, address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1' },
  { ...USDC_TOKEN, chainId: SupportedChainId.OPTIMISM, address: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607' },
];

const OPTIMISTIC_KOVAN_TOKENS = [
  // https://static.optimism.io/optimism.tokenlist.json
  { ...ETH_TOKEN, chainId: SupportedChainId.OPTIMISTIC_KOVAN },
  { ...DAI_TOKEN, chainId: SupportedChainId.OPTIMISTIC_KOVAN, address: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1' },
  { ...USDC_TOKEN, chainId: SupportedChainId.OPTIMISTIC_KOVAN, address: '0x4e62882864fB8CE54AFfcAf8D899A286762B011B' },
];

const ALL_SUPPORTED_TOKENS: { readonly [chainId: number]: TokenInfo[] } = {
  [SupportedChainId.ARBITRUM_ONE]: ARBITRUM_ONE_TOKENS,
  [SupportedChainId.ARBITRUM_RINKEBY]: ARBITRUM_RINKEBY_TOKENS,
  [SupportedChainId.MAINNET]: MAINNET_TOKENS,
  [SupportedChainId.HARDHAT]: MAINNET_TOKENS,
  [SupportedChainId.RINKEBY]: RINKEBY_TOKENS,
  [SupportedChainId.OPTIMISM]: OPTIMISM_TOKENS,
  [SupportedChainId.OPTIMISTIC_KOVAN]: OPTIMISTIC_KOVAN_TOKENS,
};

// Mapping from chainId to token address to TokenInfo for that token
const ALL_SUPPORTED_TOKENS_MAPPING: { readonly [chainId: number]: Record<string, TokenInfo> } = (() => {
  const mapping: { [chainId: number]: Record<string, TokenInfo> } = {};
  for (const [chainId, tokens] of Object.entries(ALL_SUPPORTED_TOKENS)) {
    mapping[Number(chainId)] = {};
    tokens.forEach((token) => (mapping[Number(chainId)][getAddress(token.address)] = token));
  }
  return mapping;
})();

const ALL_CHAIN_INFO: ChainInfo = {
  [SupportedChainId.ARBITRUM_ONE]: {
    bridge: 'https://bridge.arbitrum.io/',
    explorer: 'https://arbiscan.io/',
    label: 'Arbitrum',
    logoUrl: '/arbitrum_logo.svg',
    tokens: ALL_SUPPORTED_TOKENS[SupportedChainId.ARBITRUM_ONE],
    tokensMapping: ALL_SUPPORTED_TOKENS_MAPPING[SupportedChainId.ARBITRUM_ONE],
    weth: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    grantRegistry: '',
    grantRoundManager: '',
    multicall: '',
    rpcUrl: `https://arb-mainnet.g.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
  },
  [SupportedChainId.ARBITRUM_RINKEBY]: {
    bridge: 'https://bridge.arbitrum.io/',
    explorer: 'https://rinkeby-explorer.arbitrum.io/',
    label: 'Arbitrum Rinkeby',
    logoUrl: '/arbitrum_logo.svg',
    tokens: ALL_SUPPORTED_TOKENS[SupportedChainId.ARBITRUM_RINKEBY],
    tokensMapping: ALL_SUPPORTED_TOKENS_MAPPING[SupportedChainId.ARBITRUM_RINKEBY],
    weth: '0xB47e6A5f8b33b3F17603C83a0535A9dcD7E32681',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    grantRegistry: '',
    grantRoundManager: '',
    multicall: '',
    rpcUrl: `https://arb-rinkeby.g.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
  },
  [SupportedChainId.MAINNET]: {
    explorer: 'https://etherscan.io/',
    label: 'Mainnet',
    tokens: ALL_SUPPORTED_TOKENS[SupportedChainId.MAINNET],
    tokensMapping: ALL_SUPPORTED_TOKENS_MAPPING[SupportedChainId.MAINNET],
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    grantRegistry: '',
    grantRoundManager: '',
    multicall: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
    rpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
  },
  [SupportedChainId.HARDHAT]: {
    explorer: 'https://etherscan.io/',
    label: 'Hardhat',
    tokens: ALL_SUPPORTED_TOKENS[SupportedChainId.HARDHAT],
    tokensMapping: ALL_SUPPORTED_TOKENS_MAPPING[SupportedChainId.HARDHAT],
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    grantRegistry: '0xd0F350b13465B5251bb03E4bbf9Fa1DbC4a378F3',
    grantRoundManager: '0xB40a90fdB0163cA5C82D1959dB7e56B50A0dC016',
    multicall: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
    rpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
  },
  [SupportedChainId.RINKEBY]: {
    explorer: 'https://rinkeby.etherscan.io/',
    label: 'Rinkeby',
    tokens: ALL_SUPPORTED_TOKENS[SupportedChainId.RINKEBY],
    tokensMapping: ALL_SUPPORTED_TOKENS_MAPPING[SupportedChainId.RINKEBY],
    weth: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    grantRegistry: '0x7e13B0251f0F92C98bB5E9cAeABb9A91ccf13655',
    grantRoundManager: '0xa1f0230045eAb2D2F2c4ef1B7bD53330Bd41f862',
    multicall: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
    rpcUrl: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
  },
  [SupportedChainId.OPTIMISM]: {
    bridge: 'https://gateway.optimism.io/',
    explorer: 'https://optimistic.etherscan.io/',
    label: 'Optimism',
    logoUrl: '/optimism_logo.svg',
    tokens: ALL_SUPPORTED_TOKENS[SupportedChainId.OPTIMISM],
    tokensMapping: ALL_SUPPORTED_TOKENS_MAPPING[SupportedChainId.OPTIMISM],
    weth: '0x4200000000000000000000000000000000000006',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    grantRegistry: '',
    grantRoundManager: '',
    multicall: '0x90f872b3d8f33f305e0250db6A2761B354f7710A',
    rpcUrl: `https://opt-mainnet.g.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
  },
  [SupportedChainId.OPTIMISTIC_KOVAN]: {
    bridge: 'https://gateway.optimism.io/',
    explorer: 'https://optimistic.etherscan.io/',
    label: 'Optimistic Kovan',
    logoUrl: '/optimism_logo.svg',
    tokens: ALL_SUPPORTED_TOKENS[SupportedChainId.OPTIMISTIC_KOVAN],
    tokensMapping: ALL_SUPPORTED_TOKENS_MAPPING[SupportedChainId.OPTIMISTIC_KOVAN],
    weth: '0x4200000000000000000000000000000000000006',
    nativeCurrency: {
      name: 'Ethereum',
      symbol: 'ETH',
      decimals: 18,
    },
    grantRegistry: '',
    grantRoundManager: '',
    multicall: '0x1F98415757620B543A52E61c46B32eB19261F984',
    rpcUrl: `https://opt-kovan.g.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
  },
};

export const CHAIN_INFO = ALL_CHAIN_INFO[DGRANTS_CHAIN_ID];
export const ETHERSCAN_BASE_URL = CHAIN_INFO.explorer;
export const SUPPORTED_TOKENS = CHAIN_INFO.tokens;
export const SUPPORTED_TOKENS_MAPPING = CHAIN_INFO.tokensMapping;
export const WETH_ADDRESS = CHAIN_INFO.weth;
export const GRANT_REGISTRY_ADDRESS = CHAIN_INFO.grantRegistry;
export const GRANT_ROUND_MANAGER_ADDRESS = CHAIN_INFO.grantRoundManager;
export const MULTICALL_ADDRESS = CHAIN_INFO.multicall;
export const RPC_URL = CHAIN_INFO.rpcUrl;

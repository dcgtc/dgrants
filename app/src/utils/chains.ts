// based off of: https://github.com/Uniswap/uniswap-interface/blob/81b13469371b3371a55b4b29c7365b1610a8d865/src/constants/chains.ts
import { TokenInfo } from '@uniswap/token-lists';
import { getAddress } from 'src/utils/ethers';

// --- Types and data ---
export enum SupportedChainId {
  MAINNET = 1,
  RINKEBY = 4,
  HARDHAT = 31337,

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

interface L1ChainInfo {
  readonly explorer: string;
  readonly label: string;
  readonly tokens: TokenInfo[];
  readonly tokensMapping: Record<string, TokenInfo>;
}

export interface L2ChainInfo extends L1ChainInfo {
  readonly bridge: string;
  readonly logoUrl: string;
}

type ChainInfo = { readonly [chainId: number]: L1ChainInfo | L2ChainInfo } & {
  readonly [chainId in SupportedL2ChainId]: L2ChainInfo;
} &
  { readonly [chainId in SupportedL1ChainId]: L1ChainInfo };

const MAINNET_TOKENS = [
  {
    chainId: 1,
    address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE',
    name: 'Ether',
    symbol: 'ETH',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880',
  },
  {
    chainId: 1,
    address: '0x6B175474E89094C44Da98b954EedeAC495271d0F',
    name: 'Dai Stablecoin',
    symbol: 'DAI',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/9956/thumb/dai-multi-collateral-mcd.png?1574218774',
  },
  {
    chainId: 1,
    address: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    name: 'USD Coin USDC',
    symbol: 'USDC',
    decimals: 6,
    logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389',
  },
  {
    chainId: 1,
    address: '0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F',
    name: 'Gitcoin',
    symbol: 'GTC',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/15810/thumb/gitcoin.png?1621992929',
  },
  {
    chainId: 1,
    address: '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984',
    name: 'Uniswap',
    symbol: 'UNI',
    decimals: 18,
    logoURI: 'https://assets.coingecko.com/coins/images/12504/thumb/uniswap-uni.png?1600306604',
  },
];

export const SUPPORTED_TOKENS: { readonly [chainId: number]: TokenInfo[] } = {
  [SupportedChainId.ARBITRUM_ONE]: [],
  [SupportedChainId.ARBITRUM_RINKEBY]: [],
  [SupportedChainId.MAINNET]: MAINNET_TOKENS,
  [SupportedChainId.HARDHAT]: MAINNET_TOKENS,
  [SupportedChainId.RINKEBY]: [],
  [SupportedChainId.OPTIMISM]: [],
  [SupportedChainId.OPTIMISTIC_KOVAN]: [],
};

// Mapping from chainId to token address to TokenInfo for that token
export const SUPPORTED_TOKENS_MAPPING: { readonly [chainId: number]: Record<string, TokenInfo> } = (() => {
  const mapping: { [chainId: number]: Record<string, TokenInfo> } = {};
  for (const [chainId, tokens] of Object.entries(SUPPORTED_TOKENS)) {
    mapping[Number(chainId)] = {};
    tokens.forEach((token) => (mapping[Number(chainId)][getAddress(token.address)] = token));
  }
  return mapping;
})();

export const CHAIN_INFO: ChainInfo = {
  [SupportedChainId.ARBITRUM_ONE]: {
    bridge: 'https://bridge.arbitrum.io/',
    explorer: 'https://arbiscan.io/',
    label: 'Arbitrum',
    logoUrl: 'src/assets/arbitrum_logo.svg',
    tokens: SUPPORTED_TOKENS[SupportedChainId.ARBITRUM_ONE],
    tokensMapping: SUPPORTED_TOKENS_MAPPING[SupportedChainId.ARBITRUM_ONE],
  },
  [SupportedChainId.ARBITRUM_RINKEBY]: {
    bridge: 'https://bridge.arbitrum.io/',
    explorer: 'https://rinkeby-explorer.arbitrum.io/',
    label: 'Arbitrum Rinkeby',
    logoUrl: 'src/assets/arbitrum_logo.svg',
    tokens: SUPPORTED_TOKENS[SupportedChainId.ARBITRUM_RINKEBY],
    tokensMapping: SUPPORTED_TOKENS_MAPPING[SupportedChainId.ARBITRUM_RINKEBY],
  },
  [SupportedChainId.MAINNET]: {
    explorer: 'https://etherscan.io/',
    label: 'Mainnet',
    tokens: SUPPORTED_TOKENS[SupportedChainId.MAINNET],
    tokensMapping: SUPPORTED_TOKENS_MAPPING[SupportedChainId.MAINNET],
  },
  [SupportedChainId.RINKEBY]: {
    explorer: 'https://rinkeby.etherscan.io/',
    label: 'Rinkeby',
    tokens: SUPPORTED_TOKENS[SupportedChainId.RINKEBY],
    tokensMapping: SUPPORTED_TOKENS_MAPPING[SupportedChainId.RINKEBY],
  },
  [SupportedChainId.HARDHAT]: {
    explorer: 'https://etherscan.io/',
    label: 'Hardhat',
    tokens: SUPPORTED_TOKENS[SupportedChainId.HARDHAT],
    tokensMapping: SUPPORTED_TOKENS_MAPPING[SupportedChainId.HARDHAT],
  },
  [SupportedChainId.OPTIMISM]: {
    bridge: 'https://gateway.optimism.io/',
    explorer: 'https://optimistic.etherscan.io/',
    label: 'Optimism',
    logoUrl: 'src/assets/optimism_logo.svg',
    tokens: SUPPORTED_TOKENS[SupportedChainId.OPTIMISM],
    tokensMapping: SUPPORTED_TOKENS_MAPPING[SupportedChainId.OPTIMISM],
  },
  [SupportedChainId.OPTIMISTIC_KOVAN]: {
    bridge: 'https://gateway.optimism.io/',
    explorer: 'https://optimistic.etherscan.io/',
    label: 'Optimistic Kovan',
    logoUrl: 'src/assets/optimism_logo.svg',
    tokens: SUPPORTED_TOKENS[SupportedChainId.OPTIMISTIC_KOVAN],
    tokensMapping: SUPPORTED_TOKENS_MAPPING[SupportedChainId.OPTIMISTIC_KOVAN],
  },
};

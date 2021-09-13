// based off of: https://github.com/Uniswap/uniswap-interface/blob/81b13469371b3371a55b4b29c7365b1610a8d865/src/constants/chains.ts
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
  SupportedChainId.MAINNET,
  SupportedChainId.RINKEBY,
  SupportedChainId.HARDHAT,

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
}
export interface L2ChainInfo extends L1ChainInfo {
  readonly bridge: string;
  readonly logoUrl: string;
}

type ChainInfo = { readonly [chainId: number]: L1ChainInfo | L2ChainInfo } & {
  readonly [chainId in SupportedL2ChainId]: L2ChainInfo;
} &
  { readonly [chainId in SupportedL1ChainId]: L1ChainInfo };

export const CHAIN_INFO: ChainInfo = {
  [SupportedChainId.ARBITRUM_ONE]: {
    bridge: 'https://bridge.arbitrum.io/',
    explorer: 'https://arbiscan.io/',
    label: 'Arbitrum',
    logoUrl: 'src/assets/arbitrum_logo.svg',
  },
  [SupportedChainId.ARBITRUM_RINKEBY]: {
    bridge: 'https://bridge.arbitrum.io/',
    explorer: 'https://rinkeby-explorer.arbitrum.io/',
    label: 'Arbitrum Rinkeby',
    logoUrl: 'src/assets/arbitrum_logo.svg',
  },
  [SupportedChainId.MAINNET]: {
    explorer: 'https://etherscan.io/',
    label: 'Mainnet',
  },
  [SupportedChainId.RINKEBY]: {
    explorer: 'https://rinkeby.etherscan.io/',
    label: 'Rinkeby',
  },
  [SupportedChainId.HARDHAT]: {
    explorer: 'https://etherscan.io/',
    label: 'Hardhat',
  },
  [SupportedChainId.OPTIMISM]: {
    bridge: 'https://gateway.optimism.io/',
    explorer: 'https://optimistic.etherscan.io/',
    label: 'Optimism',
    logoUrl: 'src/assets/optimism_logo.svg',
  },
  [SupportedChainId.OPTIMISTIC_KOVAN]: {
    bridge: 'https://gateway.optimism.io/',
    explorer: 'https://optimistic.etherscan.io/',
    label: 'Optimistic Kovan',
    logoUrl: 'src/assets/optimism_logo.svg',
  },
};

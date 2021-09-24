// based off of: https://github.com/Uniswap/uniswap-interface/blob/81b13469371b3371a55b4b29c7365b1610a8d865/src/constants/chains.ts
import { TokenInfo } from '@uniswap/token-lists';
import {GRANT_ROUND_MANAGER_ABI as GRANT_ROUND_MANAGER_ABI_UNI_V3_ABI, GRANT_ROUND_MANAGER_UNI_V2_ABI} from 'src/utils/constants'; // prettier-ignore
import { ContractInterface, getAddress } from 'src/utils/ethers';

// --- Types and data ---
export enum SupportedChainId {
  // L1
  MAINNET = 1,
  RINKEBY = 4,
  HARDHAT = 31337,
  // L2
  POLYGON = 137,
}

export const ALL_SUPPORTED_CHAIN_IDS: SupportedChainId[] = [
  // L1
  SupportedChainId.MAINNET,
  SupportedChainId.HARDHAT,
  SupportedChainId.RINKEBY,
  // L2
  SupportedChainId.POLYGON,
];

export const L1_CHAIN_IDS = [SupportedChainId.HARDHAT, SupportedChainId.MAINNET, SupportedChainId.RINKEBY] as const;
export type SupportedL1ChainId = typeof L1_CHAIN_IDS[number];

export const L2_CHAIN_IDS = [SupportedChainId.POLYGON] as const;
export type SupportedL2ChainId = typeof L2_CHAIN_IDS[number];

// When building the app, only one Chain ID is supported per build to avoid mixing different GrantRegistry's, etc
export const DGRANTS_CHAIN_ID = (Number(import.meta.env.VITE_DGRANTS_CHAIN_ID) as SupportedChainId) || 4; // default to Rinkeby
const ALCHEMY_API_KEY = import.meta.env.VITE_ALCHEMY_API_KEY;

interface L1ChainInfo {
  readonly explorer: string; // Explorer URLs should have no trailing slash
  readonly label: string;
  readonly tokens: TokenInfo[];
  readonly tokensMapping: Record<string, TokenInfo>;
  readonly rpcUrl: string;
  readonly nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  // contract addresses and related info
  readonly weth: string;
  readonly grantRegistry: string;
  readonly grantRoundManager: string;
  readonly grantRoundManagerAbi: ContractInterface;
  readonly multicall: string;
  readonly startBlock: number; // block to start scanning from when looking for events, if none is cached, recommend GrantRegistry deploy block
}

export interface L2ChainInfo extends L1ChainInfo {
  readonly bridge: string;
  readonly logoUrl: string;
}

type ChainInfo = { readonly [chainId: number]: L1ChainInfo | L2ChainInfo } & {
  readonly [chainId in SupportedL2ChainId]: L2ChainInfo;
} &
  { readonly [chainId in SupportedL1ChainId]: L1ChainInfo };

// --- Template tokens ---
// Templates for tokens where the only difference between networks is the token address and chainId (or no
// difference between networks in the case of )
const DAI_TOKEN = { name: 'Dai Stablecoin', symbol: 'DAI', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/9956/thumb/dai-multi-collateral-mcd.png?1574218774' }; // prettier-ignore
const ETH_TOKEN = { address: '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE', name: 'Ether', symbol: 'ETH', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png?1595348880' }; // prettier-ignore
const USDC_TOKEN = { name: 'USD Coin', symbol: 'USDC', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/6319/thumb/USD_Coin_icon.png?1547042389' }; // prettier-ignore
const USDT_TOKEN = { name: 'Tether USD', symbol: 'USDT', decimals: 6, logoURI: 'https://assets.coingecko.com/coins/images/325/thumb/Tether-logo.png?1598003707' }; // prettier-ignore
// const WBTC_TOKEN = { name: 'Wrapped BTC', symbol: 'WBTC', decimals: 8, logoURI: 'https://assets.coingecko.com/coins/images/7598/thumb/wrapped_bitcoin_wbtc.png?1548822744' }; // prettier-ignore

// --- Tokens by network ---
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
  { ...DAI_TOKEN, chainId: SupportedChainId.RINKEBY, address: '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa' },
  { ...ETH_TOKEN, chainId: SupportedChainId.RINKEBY },
];

const POLYGON_TOKENS = [
  // Native token is MATIC, not ETH, but we keep the same address to represent the native token
  { ...ETH_TOKEN, chainId: SupportedChainId.POLYGON, name: 'Matic', symbol: 'MATIC', decimals: 18, logoURI: 'https://assets.coingecko.com/coins/images/4713/thumb/matic-token-icon.png' }, // prettier-ignore
  { ...DAI_TOKEN, chainId: SupportedChainId.POLYGON, address: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063' },
  { ...USDC_TOKEN, chainId: SupportedChainId.POLYGON, address: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174' },
  { ...USDT_TOKEN, chainId: SupportedChainId.POLYGON, address: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F' },
  // { ...WBTC_TOKEN, chainId: SupportedChainId.POLYGON, address: '0x1BFD67037B42Cf73acF2047067bd4F2C47D9BfD6' },
];

const ALL_SUPPORTED_TOKENS: { readonly [chainId: number]: TokenInfo[] } = {
  [SupportedChainId.HARDHAT]: MAINNET_TOKENS,
  [SupportedChainId.MAINNET]: MAINNET_TOKENS,
  [SupportedChainId.POLYGON]: POLYGON_TOKENS,
  [SupportedChainId.RINKEBY]: RINKEBY_TOKENS,
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

// --- Data for all supported chains ---
export const ALL_CHAIN_INFO: ChainInfo = {
  [SupportedChainId.HARDHAT]: {
    explorer: 'https://etherscan.io',
    label: 'Hardhat',
    tokens: ALL_SUPPORTED_TOKENS[SupportedChainId.HARDHAT],
    tokensMapping: ALL_SUPPORTED_TOKENS_MAPPING[SupportedChainId.HARDHAT],
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    grantRegistry: '0xd0F350b13465B5251bb03E4bbf9Fa1DbC4a378F3',
    grantRoundManager: '0xB40a90fdB0163cA5C82D1959dB7e56B50A0dC016',
    grantRoundManagerAbi: GRANT_ROUND_MANAGER_ABI_UNI_V3_ABI,
    multicall: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
    rpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
    startBlock: 13285176,
  },
  [SupportedChainId.MAINNET]: {
    explorer: 'https://etherscan.io',
    label: 'Mainnet',
    tokens: ALL_SUPPORTED_TOKENS[SupportedChainId.MAINNET],
    tokensMapping: ALL_SUPPORTED_TOKENS_MAPPING[SupportedChainId.MAINNET],
    weth: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    grantRegistry: '',
    grantRoundManager: '',
    grantRoundManagerAbi: GRANT_ROUND_MANAGER_ABI_UNI_V3_ABI,
    multicall: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
    rpcUrl: `https://eth-mainnet.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
    startBlock: 13285176,
  },
  [SupportedChainId.POLYGON]: {
    bridge: 'https://wallet.polygon.technology/bridge/',
    explorer: 'https://polygonscan.com',
    label: 'Polygon',
    logoUrl: '/polygon_logo.svg',
    tokens: ALL_SUPPORTED_TOKENS[SupportedChainId.POLYGON],
    tokensMapping: ALL_SUPPORTED_TOKENS_MAPPING[SupportedChainId.POLYGON],
    weth: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    nativeCurrency: { name: 'Matic', symbol: 'MATIC', decimals: 18 },
    grantRegistry: '0x3C66293942C39084e5Da5c9Ec04580717B27EFd8',
    grantRoundManager: '0x3692d6dE91E7Efd98d761fffe4d1541dAEF6030c',
    grantRoundManagerAbi: GRANT_ROUND_MANAGER_UNI_V2_ABI,
    multicall: '0xd3BB9902C9ae1ECbDB9cCAdbD009F827699185Cb',
    rpcUrl: 'https://polygon-rpc.com/',
    startBlock: 19437770,
  },
  [SupportedChainId.RINKEBY]: {
    explorer: 'https://rinkeby.etherscan.io',
    label: 'Rinkeby',
    tokens: ALL_SUPPORTED_TOKENS[SupportedChainId.RINKEBY],
    tokensMapping: ALL_SUPPORTED_TOKENS_MAPPING[SupportedChainId.RINKEBY],
    weth: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 },
    grantRegistry: '0x7e13B0251f0F92C98bB5E9cAeABb9A91ccf13655',
    grantRoundManager: '0xa1f0230045eAb2D2F2c4ef1B7bD53330Bd41f862',
    grantRoundManagerAbi: GRANT_ROUND_MANAGER_ABI_UNI_V3_ABI,
    multicall: '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696',
    rpcUrl: `https://eth-rinkeby.alchemyapi.io/v2/${ALCHEMY_API_KEY}`,
    startBlock: 9306030,
  },
};

// --- Chain-specific exports based on `VITE_DGRANTS_CHAIN_ID` ---
export const CHAIN_INFO = ALL_CHAIN_INFO[DGRANTS_CHAIN_ID];
export const ETHERSCAN_BASE_URL = CHAIN_INFO.explorer;
export const SUPPORTED_TOKENS = CHAIN_INFO.tokens;
export const SUPPORTED_TOKENS_MAPPING = CHAIN_INFO.tokensMapping;
export const WETH_ADDRESS = CHAIN_INFO.weth;
export const GRANT_REGISTRY_ADDRESS = CHAIN_INFO.grantRegistry;
export const GRANT_ROUND_MANAGER_ADDRESS = CHAIN_INFO.grantRoundManager;
export const GRANT_ROUND_MANAGER_ABI = CHAIN_INFO.grantRoundManagerAbi;
export const MULTICALL_ADDRESS = CHAIN_INFO.multicall;
export const RPC_URL = CHAIN_INFO.rpcUrl;
export const START_BLOCK = CHAIN_INFO.startBlock;

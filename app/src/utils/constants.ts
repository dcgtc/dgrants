import { TokenInfo } from '@uniswap/token-lists';
import { getAddress } from 'src/utils/ethers';

// Default RPC URL when user does not have a wallet connected
export const RPC_URL = `https://mainnet.infura.io/v3/${import.meta.env.VITE_INFURA_ID}`;

// Read data using Multicall2: https://github.com/makerdao/multicall
export const MULTICALL_ADDRESS = '0x5BA1e12693Dc8F9c48aAD8770482f4739bEeD696'; // applies to mainnet, rinkeby, goerli, ropsten, kovan
export const MULTICALL_ABI = [
  'function getCurrentBlockTimestamp() view returns (uint256 timestamp)',
  'function aggregate(tuple(address target, bytes callData)[] calls) view returns (uint256 blockNumber, bytes[] returnData)',
  'function getLastBlockHash() view returns (bytes32 blockHash)',
  'function getEthBalance(address addr) view returns (uint256 balance)',
  'function getCurrentBlockDifficulty() view returns (uint256 difficulty)',
  'function getCurrentBlockGasLimit() view returns (uint256 gaslimit)',
  'function getCurrentBlockCoinbase() view returns (address coinbase)',
  'function getBlockHash(uint256 blockNumber) view returns (bytes32 blockHash)',
  'function tryAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) public view returns (tuple(bool success, bytes returnData)[] returnData)',
  'function tryBlockAndAggregate(bool requireSuccess, tuple(address target, bytes callData)[] calls) public view returns (uint256 blockNumber, bytes32 blockHash, tuple(bool success, bytes returnData)[] returnData)',
];

// Data for Grants contracts
export const WAD = '1000000000000000000'; // 1e18
export const GRANT_REGISTRY_ADDRESS = '0xd0F350b13465B5251bb03E4bbf9Fa1DbC4a378F3';
export const GRANT_ROUND_MANAGER_ADDRESS = '0xB40a90fdB0163cA5C82D1959dB7e56B50A0dC016';
export { abi as GRANT_REGISTRY_ABI } from '@dgrants/contracts/artifacts/contracts/GrantRegistry.sol/GrantRegistry.json';
export { abi as GRANT_ROUND_ABI } from '@dgrants/contracts/artifacts/contracts/GrantRound.sol/GrantRound.json';
export { abi as GRANT_ROUND_MANAGER_ABI } from '@dgrants/contracts/artifacts/contracts/GrantRoundManager.sol/GrantRoundManager.json';

// Tokens
export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
export const ERC20_ABI = [
  'function name() view returns (string)',
  'function symbol() view returns (string)',
  'function decimals() view returns (uint8)',
  'function balanceOf(address) view returns (uint)',
  'function approve(address spender, uint256 amount) external returns (bool)',
  'function allowance(address owner, address spender) external view returns (uint256)',
  'function transfer(address to, uint amount)',
  'event Transfer(address indexed from, address indexed to, uint amount)',
];

export const SUPPORTED_TOKENS: TokenInfo[] = [
  // TokenList format
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

export const SUPPORTED_TOKENS_MAPPING = (() => {
  const tokenMappingByAddress: Record<string, TokenInfo> = {};
  SUPPORTED_TOKENS.forEach((token) => (tokenMappingByAddress[getAddress(token.address)] = token));
  return tokenMappingByAddress;
})();

export const LOREM_IPSOM_TEXT =
  'Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.';

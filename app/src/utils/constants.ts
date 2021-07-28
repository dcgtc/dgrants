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
export const GRANT_REGISTRY_ADDRESS = '0xd0f350b13465b5251bb03e4bbf9fa1dbc4a378f3';
export { abi as GRANT_REGISTRY_ABI } from '@dgrants/contracts/artifacts/contracts/GrantRegistry.sol/GrantRegistry.json';

export { abi as GRANT_ROUND_ABI } from '@dgrants/contracts/artifacts/contracts/GrantRound.sol/GrantRound.json';

export const GRANT_ROUND_FACTORY_ADDRESS = '0xa27bC320252d51EEAA24BCCF6cc003979E485860';
export { abi as GRANT_ROUND_FACTORY_ABI } from '@dgrants/contracts/artifacts/contracts/GrantRoundFactory.sol/GrantRoundFactory.json';

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

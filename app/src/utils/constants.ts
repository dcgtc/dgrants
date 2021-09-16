// Read data using Multicall2: https://github.com/makerdao/multicall
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
export { abi as GRANT_REGISTRY_ABI } from '@dgrants/contracts/artifacts/contracts/GrantRegistry.sol/GrantRegistry.json';
export { abi as GRANT_ROUND_ABI } from '@dgrants/contracts/artifacts/contracts/GrantRound.sol/GrantRound.json';
export { abi as GRANT_ROUND_MANAGER_ABI } from '@dgrants/contracts/artifacts/contracts/GrantRoundManager.sol/GrantRoundManager.json';

// Tokens
export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
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

export const LOREM_IPSOM_TEXT = 'A brief description of your grant goes here.\n\nLorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.'; // prettier-ignore

// LocalStorage keys
export const allGrantsKey = 'AllGrants';
export const allGrantRoundsKey = 'AllGrantRounds';
export const contributionsKey = 'Contributions';
export const trustBonusKey = 'TrustBonus';

// LocalStorage key-prefixes (partial key, we store an object for each instance)
export const grantRoundKeyPrefix = 'GrantRound-';
export const grantRoundsCLRDataKeyPrefix = 'GrantRoundsGrantData-';

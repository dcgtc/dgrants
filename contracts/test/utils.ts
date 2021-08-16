/**
 * @notice This file contains test utilities and helper methods
 */
// --- Internal imports ---
import { Grant } from '@dgrants/types';
import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/dist/src/signer-with-address';

// --- External imports ---
import { ethers, network } from 'hardhat';
import { expect } from 'chai';
import { BigNumber, BigNumberish, utils } from 'ethers';
import { Log } from '@ethersproject/providers';
import { abi as UNISWAP_POOL_ABI } from '@uniswap/v3-core/artifacts/contracts/interfaces/IUniswapV3Pool.sol/IUniswapV3Pool.json';
import { FeeAmount, Pool, Route, computePoolAddress, encodeRouteToPath } from '@uniswap/v3-sdk';
import { Token } from '@uniswap/sdk-core';

const { defaultAbiCoder, hexStripZeros, hexZeroPad, keccak256 } = utils;

// --- Constants ---
export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
//export const UNISWAP_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';
export const UNISWAP_FACTORY = '0x1F98431c8aD98523631AE4a59f267346ea31F984';

// Mapping from lowercase token symbol to properties about that token
export const tokens = {
  eth: { address: ETH_ADDRESS, name: 'Ether', symbol: 'ETH', decimals: 18, mappingSlot: null },
  weth: { address: WETH_ADDRESS, name: 'Wrapped Ether', symbol: 'WETH', decimals: 18, mappingSlot: '0x3' },
  dai: { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', name: "Dai", symbol: "DAI", decimals: 18, mappingSlot: '0x2' }, // prettier-ignore
  gtc: { address: '0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F', name: "Gitcoin", symbol: "GTC", decimals: 18, mappingSlot: '0x5' }, // prettier-ignore
};

// This type is our list of tokens supported in the "Token Helpers" section
export type SupportedToken = keyof typeof tokens;

// --- Assertions ---
// Verifies that two Grant objects are equal
export function expectEqualGrants(grant1: Grant, grant2: Grant): void {
  expect(grant1.id).to.equal(grant2.id);
  expect(grant1.owner).to.equal(grant2.owner);
  expect(grant1.payee).to.equal(grant2.payee);
  expect(grant1.metaPtr).to.equal(grant2.metaPtr);
}

// --- Time manipulation ---
// Fast forward time
export async function timeTravel(seconds: BigNumberish): Promise<void> {
  await network.provider.send('evm_increaseTime', [BigNumber.from(seconds).toNumber()]);
  await network.provider.send('evm_mine', []);
}

// Set timestamp of next block
export async function setNextBlockTimestamp(timestamp: BigNumberish): Promise<number> {
  timestamp = BigNumber.from(timestamp).toNumber();
  await network.provider.send('evm_setNextBlockTimestamp', [timestamp]);
  return timestamp;
}

// --- Uniswap Helpers ---
// Loops through an array of logs to find a Uniswap V3 `Swap` log, and returns the swap's amountOut
export function getSwapAmountOut(logs: Log[]): BigNumber {
  const swapTopic = '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67'; // topic for Swap event
  const swapLogs = logs.filter((log) => log.topics[0] === swapTopic);
  const swapLog = swapLogs[swapLogs.length - 1]; // always use the last Swap log to get final output amount
  const swapEvent = 'event Swap(address indexed sender, address indexed recipient, int256 amount0, int256 amount1, uint160 sqrtPriceX96, uint128 liquidity, int24 tick)'; // prettier-ignore
  const iface = new ethers.utils.Interface([swapEvent]);
  const event = iface.parseLog(swapLog);
  const amountOut = event.args.amount1 as BigNumber; // this is often negative
  return amountOut.abs();
}

export async function encodeRoute(tokens: SupportedToken[]): Promise<string> {
  const route = await getRoute(tokens);
  return encodeRouteToPath(route, false);
}

async function getRoute(tokens: SupportedToken[]): Promise<Route<Token, Token>> {
  const poolPromises: Promise<Pool>[] = [];
  tokens.forEach((_, index) => {
    if (index === 0) return;
    const inputToken = tokens[index - 1];
    const outputToken = tokens[index];
    poolPromises.push(getPoolInstance(inputToken, outputToken));
  });
  const pools = await Promise.all(poolPromises);
  return new Route(pools, pools[0].token0, pools[pools.length - 1].token1);
}

async function getPoolInstance(token0: SupportedToken, token1: SupportedToken): Promise<Pool> {
  // Get pool contract
  token0 = token0 === 'eth' ? 'weth' : token0;
  token1 = token1 === 'eth' ? 'weth' : token1;
  const tokenA = new Token(1, tokens[token0].address, tokens[token0].decimals, tokens[token0].symbol, tokens[token0].name); // prettier-ignore
  const tokenB = new Token(1, tokens[token1].address, tokens[token1].decimals, tokens[token1].symbol, tokens[token1].name); // prettier-ignore
  const fee = FeeAmount.MEDIUM; // always use Medium fee for now
  const poolAddress = computePoolAddress({ factoryAddress: UNISWAP_FACTORY, tokenA, tokenB, fee });
  const poolContract = new ethers.Contract(poolAddress, UNISWAP_POOL_ABI, ethers.provider);

  // Read pool data
  const [slot, liquidity] = await Promise.all([await poolContract.slot0(), await poolContract.liquidity()]);
  const [sqrtPriceX96, tick] = slot;

  // Return pool instance
  return new Pool(tokenA, tokenB, FeeAmount.MEDIUM, sqrtPriceX96, liquidity, tick);
}

// --- Token helpers ---
// Gets token balance
export async function balanceOf(tokenSymbol: SupportedToken, address: string): Promise<BigNumber> {
  if (tokenSymbol === 'eth') return ethers.provider.getBalance(address);
  const tokenAddress = tokens[tokenSymbol].address;
  const abi = ['function balanceOf(address) external view returns (uint256)'];
  const contract = new ethers.Contract(tokenAddress, abi, ethers.provider);
  return contract.balanceOf(address);
}

// Sets token allowance
export async function approve(tokenSymbol: SupportedToken, holder: SignerWithAddress, spender: string): Promise<void> {
  if (tokenSymbol === 'eth') return;
  const tokenAddress = tokens[tokenSymbol].address;
  const abi = ['function approve(address,uint256) external returns (bool)'];
  const contract = new ethers.Contract(tokenAddress, abi, holder);
  await contract.approve(spender, ethers.constants.MaxUint256);
}

// Arbitrarily set token balance of an account to a given amount
export async function setBalance(tokenSymbol: SupportedToken, to: string, amount: BigNumberish): Promise<void> {
  // If ETH, set the balance directly
  if (tokenSymbol === 'eth') {
    await network.provider.send('hardhat_setBalance', [to, BigNumber.from(amount).toHexString()]);
    return;
  }

  // Otherwise, compute the storage slot containing this users balance and use it to set the balance
  const slot = getBalanceOfSlotSolidity(tokens[tokenSymbol].mappingSlot, to);
  await network.provider.send('hardhat_setStorageAt', [tokens[tokenSymbol].address, slot, to32ByteHex(amount)]);
}

// --- Private (not exported) helpers ---
// Determine the storage slot used to store an account's balance. Notes:
//   - This only works for Solidity tokens since Vyper has different storage layout rules
//   - Read about Solidity storage layout rules at https://docs.soliditylang.org/en/latest/internals/layout_in_storage.html#mappings-and-dynamic-arrays
//   - `defaultAbiCoder.encode` is equivalent to Solidity's `abi.encode()`, and we strip leading zeros from the hashed
//     value to conform to the JSON-RPC spec: https://ethereum.org/en/developers/docs/apis/json-rpc/#hex-value-encoding
function getBalanceOfSlotSolidity(mappingSlot: string, address: string) {
  return hexStripZeros(keccak256(defaultAbiCoder.encode(['address', 'uint256'], [address, mappingSlot])));
}

// Converts a number to a 32 byte hex string
function to32ByteHex(x: BigNumberish) {
  return hexZeroPad(BigNumber.from(x).toHexString(), 32);
}

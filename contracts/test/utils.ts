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
const { defaultAbiCoder, hexStripZeros, hexZeroPad, keccak256 } = utils;

// --- Constants ---
export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const WETH_ADDRESS = '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2';
export const UNISWAP_FEES = ['500', '3000', '10000']; // Uniswap V3 fee tiers, as parts per 10k: https://github.com/Uniswap/uniswap-v3-core/blob/main/contracts/UniswapV3Factory.sol
export const UNISWAP_ROUTER = '0xE592427A0AEce92De3Edee1F18E0157C05861564';

// Mapping from lowercase token symbol to properties about that token
export const tokens = {
  eth: { address: ETH_ADDRESS, decimals: 18, mappingSlot: null },
  dai: { address: '0x6B175474E89094C44Da98b954EedeAC495271d0F', decimals: 18, mappingSlot: '0x2' },
  gtc: { address: '0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F', decimals: 18, mappingSlot: '0x5' },
};

// --- Functions ---
// Verifies that two Grant objects are equal
export function expectEqualGrants(grant1: Grant, grant2: Grant): void {
  expect(grant1.id).to.equal(grant2.id);
  expect(grant1.owner).to.equal(grant2.owner);
  expect(grant1.payee).to.equal(grant2.payee);
  expect(grant1.metaPtr).to.equal(grant2.metaPtr);
}

// Fast forward time
export async function timeTravel(seconds: number): Promise<void> {
  await ethers.provider.send('evm_increaseTime', [seconds]);
  await ethers.provider.send('evm_mine', []);
}

export async function setNextBlockTimestamp(provider: any, timestamp: number, delay: number) {
  const newTimestamp = timestamp + delay;
  await provider.send('evm_setNextBlockTimestamp', [newTimestamp]);
  return newTimestamp;
}

// Gets token balance
export async function balanceOf(tokenSymbol: keyof typeof tokens, address: string): Promise<BigNumber> {
  if (tokenSymbol === 'eth') return ethers.provider.getBalance(address);
  const tokenAddress = tokens[tokenSymbol].address;
  const abi = ['function balanceOf(address) external view returns (uint256)'];
  const contract = new ethers.Contract(tokenAddress, abi, ethers.provider);
  return contract.balanceOf(address);
}

// Sets token allowance
export async function approve(tokenSymbol: keyof typeof tokens, holder: SignerWithAddress, spender: string) {
  if (tokenSymbol === 'eth') return;
  const tokenAddress = tokens[tokenSymbol].address;
  const abi = ['function approve(address,uint256) external returns (bool)'];
  const contract = new ethers.Contract(tokenAddress, abi, holder);
  await contract.approve(spender, ethers.constants.MaxUint256);
}

// Arbitrarily set token balance of an account to a given amount
export async function setBalance(tokenSymbol: keyof typeof tokens, to: string, amount: BigNumberish) {
  // If ETH, set the balance directly
  if (tokenSymbol === 'eth') {
    await network.provider.send('hardhat_setBalance', [to, BigNumber.from(amount).toHexString()]);
    return;
  }

  // Otherwise, compute the storage slot containing this users balance and use it to set the balance
  const slot = getBalanceOfSlotSolidity(tokens[tokenSymbol].mappingSlot, to);
  await network.provider.send('hardhat_setStorageAt', [tokens[tokenSymbol].address, slot, to32ByteHex(amount)]);
}

// --- Internal helpers ---
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

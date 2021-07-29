/**
 * @notice This file contains test utilities and helper methods
 */
// --- Internal imports ---
import { Grant } from '@dgrants/types';

// --- External imports ---
import { ethers } from 'hardhat';
import { expect } from 'chai';

// --- Constants ---
export const ETH_ADDRESS = '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE';
export const UNISWAP_FEES = ['500', '3000', '10000']; // Uniswap V3 fee tiers, as parts per 10k: https://github.com/Uniswap/uniswap-v3-core/blob/main/contracts/UniswapV3Factory.sol

// --- Functions ---
// Helper method to verify that two Grant objects are equal
export function expectEqualGrants(grant1: Grant, grant2: Grant): void {
  expect(grant1.id).to.equal(grant2.id);
  expect(grant1.owner).to.equal(grant2.owner);
  expect(grant1.payee).to.equal(grant2.payee);
  expect(grant1.metaPtr).to.equal(grant2.metaPtr);
}

// Helper method to fast forward time
export async function timeTravel(seconds: number): Promise<void> {
  await ethers.provider.send('evm_increaseTime', [seconds]);
  await ethers.provider.send('evm_mine', []);
}

export async function setNextBlockTimestamp(provider: any, timestamp: number, delay: number) {
  const newTimestamp = timestamp + delay;
  await provider.send('evm_setNextBlockTimestamp', [newTimestamp]);
  return newTimestamp;
}

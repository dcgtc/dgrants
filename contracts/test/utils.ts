/**
 * @notice This file contains test utilities and helper methods
 */
// --- Internal imports ---
import { Grant } from '@dgrants/types';

// --- External imports ---
import { expect } from 'chai';

// --- Functions ---
// Helper method to verify that two Grant objects are equal
export function expectEqualGrants(grant1: Grant, grant2: Grant): void {
  expect(grant1.id).to.equal(grant2.id);
  expect(grant1.owner).to.equal(grant2.owner);
  expect(grant1.payee).to.equal(grant2.payee);
  expect(grant1.metaPtr).to.equal(grant2.metaPtr);
}

export async function timeTravel(provider: any, seconds: number) {
  await provider.send('evm_increaseTime', [seconds]);
  await provider.send('evm_mine', []);
}

export async function setNextBlockTimestamp(provider: any, timestamp: number, delay: number) {
  const newTimestamp = timestamp + delay;
  await provider.send('evm_setNextBlockTimestamp', [newTimestamp]);
  return newTimestamp;
}

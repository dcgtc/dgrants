/**
 * @notice This file contains test utilities and helper methods
 */

// --- External imports ---
import { BigNumber } from 'ethers';
import { expect } from 'chai';

// --- Types ---
// The output from ethers/typechain allows array or object access to grant data, so we must define types for
// handling the Grant struct as done below
type GrantObject = {
  id: BigNumber;
  owner: string;
  payee: string;
  metaPtr: string;
};
type GrantArray = [BigNumber, string, string, string];
type GrantEthers = GrantArray & GrantObject;
type Grant = GrantObject | GrantEthers;

// --- Functions ---
// Helper method to verify that two Grant objects are equal
export function expectEqualGrants(grant1: Grant, grant2: Grant) {
  expect(grant1.id).to.equal(grant2.id);
  expect(grant1.owner).to.equal(grant2.owner);
  expect(grant1.payee).to.equal(grant2.payee);
  expect(grant1.metaPtr).to.equal(grant2.metaPtr);
}

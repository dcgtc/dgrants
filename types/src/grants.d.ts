import {  BigNumber, BigNumberish } from 'ethers';

// --- Types ---
// The output from ethers/typechain allows array or object access to grant data, so we must define types for
// handling the Grant struct as done below
export type GrantObject = {
  id: BigNumber;
  owner: string;
  payee: string;
  metaPtr: string;
};
export type GrantArray = [BigNumber, string, string, string];
export type GrantEthers = GrantArray & GrantObject;
export type Grant = GrantObject | GrantEthers;

// Donation object from GrantRoundManager
export interface Donation {
  grantId: BigNumberish;
  rounds: string[];
  tokenIn: string;
  fee: BigNumberish;
  deadline: BigNumberish;
  amountIn: BigNumberish;
  amountOutMinimum: BigNumberish;
  sqrtPriceLimitX96: BigNumberish;
}

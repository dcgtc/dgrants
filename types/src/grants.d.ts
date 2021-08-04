import { BigNumber, BigNumberish } from 'ethers';
import { TokenInfo } from '@uniswap/token-lists';

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
  path: string;
  deadline: BigNumberish;
  amountIn: BigNumberish;
  amountOutMinimum: BigNumberish;
}
// GrantRound object from GrantRoundManager
export type GrantRound = {
  address: string;
  metadataAdmin: string;
  payoutAdmin: string;
  registry: string;
  donationToken: TokenInfo;
  matchingToken: TokenInfo;
  funds: BigNumberish;
  status: string;
  startTime: BigNumberish;
  endTime: BigNumberish;
  metaPtr: string;
  minContribution: BigNumberish;
  hasPaidOut: boolean;
  error: string|undefined;
};
export type GrantRounds = Array<GrantRound>;

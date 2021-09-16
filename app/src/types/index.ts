// App-specific type definition go here
import { Grant, GrantMetadata } from '@dgrants/types';
import { TokenInfo } from '@uniswap/token-lists';
import { BigNumberish } from 'ethers';

// Cart info saved in localStorage
export type CartItemOptions = {
  grantId: string;
  contributionTokenAddress: string; // store address instead of TokenInfo to reduce localStorage size used
  contributionAmount: number; // store as a human-readable number for better form UX
};

// Cart info used by the main Cart component -- GrantMetadata is optional as we don't have it immediately on page load
type ContributionToken = { contributionToken: TokenInfo };
export type CartItem =
  | (Omit<CartItemOptions, 'contributionTokenAddress'> & Grant & ContributionToken & GrantMetadata)
  | (Omit<CartItemOptions, 'contributionTokenAddress'> & Grant & ContributionToken);

// type of entities on Etherscan.
export type EtherscanGroup = 'tx' | 'token' | 'address';

// Cart prediction entries
export type CartPrediction = { matching: number; matchingToken: TokenInfo };
export type CartPredictions = {
  [grantId: string]: CartPrediction[];
};

// Generic localStorage type to store key->any
export type LocalStorageAnyObj = {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};
export type LocalStorageData = {
  ts?: BigNumberish;
  blockNumber?: number;
  data: LocalStorageAnyObj;
};

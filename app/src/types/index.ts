// App-specific type definition go here
import { Grant, GrantMetadata } from '@dgrants/types';
import { TokenInfo } from '@uniswap/token-lists';
import { Contract } from 'ethers';

// Cart info saved in localStorage
export type CartItemOptions = {
  grantId: number;
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
export type CartPrediction = { matching: number | boolean; matchingToken: TokenInfo };
export type CartPredictions = {
  [grantId: number]: CartPrediction[];
};

// Version/name given to the default localForage instance
export type LocalForageConfig = {
  name: string;
  version: number;
};

// Generic localStorage type to store key->any
export type LocalForageAnyObj = {
  [key: string]: any; // eslint-disable-line @typescript-eslint/no-explicit-any
};
export type LocalForageData = {
  blockNumber?: number;
  data: LocalForageAnyObj;
};

// Arguments to pass in to a BatchFilterCall()
export type BatchFilterQuery = {
  contract: Contract;
  filter: string;
  args: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any
};

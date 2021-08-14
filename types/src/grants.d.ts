import { BigNumber, BigNumberish, BytesLike } from 'ethers';
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
export type GrantMetadata = {
  name: string;
  description: string;
};
export type GrantMetadataStatus = 'resolved' | 'pending' | 'error';
export type GrantMetadataResolution = Partial<GrantMetadata> & { status: GrantMetadataStatus };
export type GrantArray = [BigNumber, string, string, string];
export type GrantEthers = GrantArray & GrantObject;
export type Grant = GrantObject | GrantEthers;

// SwapSummary struct from GrantRoundManager
export interface SwapSummary {
  amountIn: BigNumberish;
  amountOutMin: BigNumberish;
  path: BytesLike; // encoded swap path
}

// Donation struct from GrantRoundManager
export interface Donation {
  grantId: BigNumberish;
  token: string; // token address
  ratio: BigNumberish;
  rounds: string[];
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
  error: string | undefined;
};
export type GrantRounds = Array<GrantRound>;

// Claim struct from MerkleGrantRoundPayout
export type Claim = {
  index: number;
  payee: string;
  amount: number;
  merkleProof: string[];
};

// Metadata resolve from a grant's metadata pointer URL
export type GrantMetadata = {
  name: string;
  description: string;
  logoURI: string;
};

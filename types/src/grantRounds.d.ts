import { BigNumberish } from 'ethers';
import { TokenInfo } from '@uniswap/token-lists';

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

// Metadata resolve from a grant round's metadata pointer URL
export type GrantRoundMetadata = {
  name: string;
  description: string;
  grants: BigNumberish[];
  properties: {
    websiteURI: string;
    githubURI: string;
    twitterURI: string;
  };
};
export type GrantRoundMetadataStatus = 'resolved' | 'pending' | 'error';
export type GrantRoundMetadataResolution = Partial<GrantRoundMetadata> & { status: GrantRoundMetadataStatus };

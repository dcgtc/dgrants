import { BigNumberish } from 'ethers';
import { TokenInfo } from '@uniswap/token-lists';
import { Contribution, GrantPrediction } from './grants';

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
  hasPaidOut: boolean;
  error: string | undefined;
};
export type GrantRounds = Array<GrantRound>;

// Metadata resolve from a grant round's metadata pointer URL
export type GrantRoundMetadata = {
  name: string;
  description: string;
  grants: BigNumberish[];
  matchingAlgorithm: string;
  logoURI: string;
  properties?: {
    websiteURI?: string;
    governanceURI?: string;
    twitterURI?: string;
    sponsorsURI?: string[];
  };
};
export type GrantRoundMetadataStatus = 'resolved' | 'pending' | 'error';
export type GrantRoundMetadataResolution = Partial<GrantRoundMetadata> & { status: GrantRoundMetadataStatus };

/**
 * Grant rounds contributions and pot details
 *
 * @type GrantRoundContributions
 * @field {grantRound} grant round address
 * @field {totalPot} total pot amount in the round
 * @field {matchingTokenDecimals} the number of decimals used by the rounds matching currency
 * @field {[contributions]} contributions in that round
 */
export type GrantRoundContributions = {
  grantRound: string;
  totalPot: number;
  matchingTokenDecimals: number;
  contributions: Contribution[];
};

/**
 * All CLR results/data for a given GrantRound
 *
 * @type GrantRoundContributions
 * @field {grantRound} grant round address
 * @field {totalPot} total pot amount in the round
 * @field {matchingTokenDecimals} the number of decimals used by the rounds matching currency
 * @field {[contributions]} contributions in that round
 * @field {[predictions]} predictions for the round
 */
export type GrantRoundCLR = GrantRoundContributions & {
  predictions: GrantPrediction[];
};
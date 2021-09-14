'use strict';

import { MerkleDistributorInfo } from './internal/merkle';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { TokenInfo } from '@uniswap/token-lists';
import { Contribution, GrantRoundContributions } from '@dgrants/types';

// ethers provider
export type Provider = Web3Provider | JsonRpcProvider;

/**
 * Object for fetching GrantRound contributions
 *
 * @type GrantRoundFetchArgs
 * @field {grantRound} grantRound address
 * @field {grantRoundManager} grantRoundManager address from which contributions will be fetched
 * @field {ignore.contributionAddress} *optional* contributions addresses to be ignored
 * @field {ignore.grants} *optional* grants to be ignored
 */
export type GrantRoundFetchArgs = {
  grantRound: string;
  grantRegistry: string;
  grantRoundManager: string;
  provider: Provider;
  supportedTokens: Record<string, TokenInfo>;
  ignore?: {
    contributionAddress?: string[];
    grants?: number[];
  };
};

/**
 * Contributions by grantId
 * @type ContributionsByGrantId
 * @key {key} grantId (number)
 * @field {value} contributions (Contribution)
 */
export type ContributionsByGrantId = {
  [grantId: string]: {
    grantId: string;
    grantAddress: string;
    contributions: Contribution[];
  };
};

// --------- PREDICTION

/**
 * Args object fed to clr.prediction
 *
 * @type GrantPredictionArgs
 * @field {grantId} grants id
 * @field {predictionPoints} array of prediction points
 * @field {[grantRoundContributions]} contributions in that round
 * @field {[trustBonusScores]} trust bonus scores
 */
export type GrantPredictionArgs = {
  grantId: string;
  predictionPoints: number[];
  grantRoundContributions: GrantRoundContributions;
  trustBonusScores?: TrustBonusScore[];
};

// --------- CALCULATE

/**
 * Individual grant's match
 * @type GrantMatch
 * @field {grantId} unique grant identifier
 * @field {address} grant payout address
 * @field {match} match amount
 */
export type GrantMatch = {
  grantId: string;
  address: string;
  match: number;
};

/**
 * Individual address trust bonus score
 * @field {address} address
 * @field {score} trust bonus score
 */
export type TrustBonusScore = {
  address: string;
  score: number;
};

/**
 * Options fed into CLR class
 * @type InitArgs
 * @field {calcAlgo} command handle to use for calulation
 */
export type InitArgs = {
  calcAlgo: (clrArgs: CLRArgs) => Promise<GrantsDistribution>;
  includePayouts?: boolean;
};

/**
 * Individual distribution for a payout address
 * @type PayoutMatch
 * @field {grantId} unique grant identifier
 * @field {address} grant payout address
 * @field {match} match amount
 */
export type PayoutMatch = {
  grantIds: string[];
  address: string;
  match: number;
};

/**
 * Distributions by a payout address
 * @type PayoutMatches
 * @key {key} grant payout address
 * @field {value} match details (PayoutMatch)
 */
export type PayoutMatches = {
  [key: string]: PayoutMatch;
};

/**
 * Grants match distribution
 * @type GrantsDistribution
 * @field {distribution} the distribution
 * @field {hasSaturated} flag to signify round is saturated
 * @field {hash} hash of the distribution
 * @field {trustBonusMetaPtr} metaPtr location
 * @field {grantRound} grant round address used for identification
 * @field {merkleError} error generated while genrating merkle root
 */
export type GrantsDistribution = {
  distribution: GrantMatch[];
  payoutDistribution: PayoutMatch[];
  hasSaturated: boolean;
  hash: string;
  trustBonusMetaPtr: string;
  grantRound?: string;
  merkle?: MerkleDistributorInfo;
  merkleError?: string;
};

// --------- CLR CALC

/**
 * Grant CLR Calculation args
 *
 * @type CLRArgs
 * @field {contributions}
 * @field {trustBonusMetaPtr} trust bonus scores meta Ptr
 */
export type CLRArgs = {
  contributions: GrantRoundContributions;
  trustBonusMetaPtr?: string;
  trustBonusScores?: TrustBonusScore[];
};

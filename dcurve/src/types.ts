'use strict';

import { MerkleDistributorInfo } from './internal/merkle';
import { JsonRpcProvider, Web3Provider } from '@ethersproject/providers';
import { TokenInfo } from '@uniswap/token-lists';

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
 * Object for an individual Contribution
 *
 * @type Contribution
 * @field {grantId} grant id in the registry to which the contribution was made
 * @field {address} address which made the contribution
 * @field {amount} contribution amount
 */
export type Contribution = {
  grantId: string;
  grantAddress: string;
  address: string;
  amount: number;
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

/**
 * Response object returned by fetch
 *
 * @type Contribution
 * @field {grantRound} grant round address
 * @field {totalPot} total pot amount in the round
 * @field {matchTokenDecimals} the number of decimals used by the rounds currency
 * @field {[contributions]} contributions in that round
 */
export type GrantRoundContributions = {
  grantRound: string;
  totalPot: number;
  matchTokenDecimals: number;
  contributions: Contribution[];
};

// --------- PREDICTION

/**
 * Args object fed to clr.prediction
 *
 * @type GrantPredictionArgs
 * @field {grantId} grants id
 * @field {predictionPoints} array of prediction points
 * @field {[grantRoundContributions]} contributions in that round
 */
export type GrantPredictionArgs = {
  grantId: string;
  predictionPoints: number[];
  grantRoundContributions: GrantRoundContributions;
};

/**
 * The new match amount for a grant if it were to recieve an anon contribution
 * of value predicted_amount
 *
 * @type GrantPrediction
 * @field {predictionPoint} if grant were to recieve an anon contribution
 * @field {predictedGrantMatch} new match after adding predicted_amount
 * @field {predictionDiff} difference between predicted_match and predicted_amount
 */
export type GrantPrediction = {
  predictionPoint: number;
  predictedGrantMatch: number;
  predictionDiff: number;
};

/**
 * Object containing an array of GrantPrediction
 *
 * @type GrantPredictions
 * @field {grantId} grant identifier
 * @field {grantRound} grant round address
 * @field {[GrantPrediction]} list of GrantPrediction
 */
export type GrantPredictions = {
  grantId: string;
  grantRound: string;
  predictions: GrantPrediction[];
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
 * Options fed into CLR class
 * @type InitArgs
 * @field {calcAlgo} command handle to use for calulation
 */
export type InitArgs = {
  calcAlgo: (clrArgs: CLRArgs) => GrantsDistribution;
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
 * @field {grantRound} grant round address used for identification
 * @field {hash} hash of the distribution
 */
export type GrantsDistribution = {
  distribution: GrantMatch[];
  payoutDistribution: PayoutMatch[];
  hasSaturated: boolean;
  grantRound?: string;
  merkle?: MerkleDistributorInfo;
  hash?: string;
  merkleError?: string;
};

// --------- CLR CALC

/**
 * Grant CLR Calculation args
 *
 * @type CLRArgs
 * @field {contributions}
 */
export type CLRArgs = {
  contributions: GrantRoundContributions;
};

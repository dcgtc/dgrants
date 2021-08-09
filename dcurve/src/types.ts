'use strict';

/**
 * Object for fetching GrantRound contributions
 *
 * @type GrantRoundFetchArgs
 * @field {grantRegistry} grant registry
 * @field {grantRound} grant round for which contributions are fetched
 * @field {ignore.contributionAddress} *optional* contributions addresses to be ignored
 * @field {ignore.grants} *optional* grants to be ignored
 */
export type GrantRoundFetchArgs = {
  grantRegistry: string,
  grantRound: string,
  ignore?: {
    contributionAddress?: string[]
    grants?: number[]
  }
}

/**
 * Object for an individual Contribution
 *
 * @type Contribution
 * @field {grantId} grant id in the registry to which the contribution was made
 * @field {address} address which made the contribution
 * @field {amount} contribution amount
 */
export type Contribution = {
  grantId: number,
  address: string,
  amount: number
}

/**
 * Response object returned by fetch
 *
 * @type Contribution
 * @field {grantRound} grant round
 * @field {totalPot} total pot amount in the round
 * @field {[contributions]} contributions in that round
 */
export type GrantRoundContributions = {
  grantRound: string,
  totalPot: number,
  contributions: Contribution[]
}


// --------- PREDICTION

export type GrantPredictionArgs = {
  grantId: number;
  predictionPoints: number[];
  contributions: Contribution[];
};

/**
* The new match amount for a grant if it were to recieve an anon contribution
* of value predicted_amount
*
* @type GrantPrediction
* @field {predictionPoint} if grant were to recieve an anon contribution
* @field {predictionAmount} new match after adding predicted_amount
* @field {predictionDiff} difference between predicted_match and predicted_amount
*/
type GrantPrediction = {
  predictionPoint: number;
  predictionAmount: number;
  predictionDiff: number;
}

/**
* Object containing an array of GrantPrediction
*
* @type GrantPredictions
* @field {grantId} grant identifier
* @field {[GrantPrediction]} list of GrantPrediction
*/
export type GrantPredictions = {
  grantId: number,
  predictions: GrantPrediction[]
}

// --------- CALCULATE

/**
 * Individual grant's match
 * @type GrantMatch
 * @field {grantId} unique grant identifier
 * @field {match} match amount
 */
 export type GrantMatch = {
  grantId: number;
  match: number;
}


/**
* Grants match distribution
* @type GrantMatch
* @field {distribution} the distribution
* @field {hasSaturated} flag to signify round is saturated
* @field {hash} has of thr distribution
*/
export type GrantsDistribution = {
  distribution: GrantMatch[];
  hasSaturated: Boolean;
  hash?: string;
};

// --------- CLR CALC

/**
 * Grant CLR Calculation args
 *
 * @type CLRArgs
 * @field {contributions}
 * @field {matchCap}
 */
export type CLRArgs = {
  contributions: GrantRoundContributions;
  matchCap?: number;
};
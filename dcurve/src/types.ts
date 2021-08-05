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
    contributionAddress?: [string]
    grants?: [number]
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
 * @field {matchingAmount} total matching amount in the round 
 * @field {[contributions]} contributions in that round 
 */
export type GrantRoundContributions = {
  grantRound: string,
  matchingAmount: Number,
  contributions: [Contribution]
}


// --------- PREDICTION

export type GrantPredictionArgs = {
  grantId: Number;
  predictionPoints: [Number];
  contributions: Function; // MAKE THIS AN OBJECT
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
  predictionPoint: Number;
  predictionAmount: Number;
  predictionDiff: Number;
}

/**
* Object containing an array of GrantPrediction
* 
* @type GrantPredictions
* @field {grantId} grant identifier
* @field {[GrantPrediction]} list of GrantPrediction
*/
export type GrantPredictions = {
  grantId: "string",
  predictions: [GrantPrediction]
}

// --------- CALCULATE

/**
 * Individual grant's match 
 * @type GrantMatch
 * @field {grantId} unique grant identifier 
 * @field {match} match amount 
 */
 type GrantMatch = {
  grantId: "string";
  match: Number;
}


/**
* Grants match distribution
* @type GrantMatch
* @field {distribution} the distribution
*/
export type GrantsDistribution = {
  distribution: [GrantMatch];
  hash: string;
};
'use strict';

/**
 * Individual grant's match 
 * @type GrantMatch
 * @field {id} unique grant identifier 
 * @field {match} match amount 
 */
 type GrantMatch = {
  id: "string";
  match: Number;
}

/**
* The new match amount for a grant if it were to recieve an anon contribution
* of value predicted_amount 
* 
* @type GrantPrediction
* @field {current_match} actual match amount
* @field {predicted_amount} if grant were to recieve an anon contribution
* @field {predicted_match} new match after adding predicted_amount
* @field {match_diff} difference between predicted_match and predicted_amount
*/
type GrantPrediction = {
  id: "string",
  current_match: "string",
  predicted_amount: Number;
  predicted_match: Number;
  match_diff: Number;
}

/**
* Grants match distribution
* @type GrantMatch
* @field {prediction} *optional* how the match varies if a grant recieves an anon contribution
* @field {distribution} the distribution
*/
type GrantsDistribution = {
  prediction?: GrantPrediction
  distribution: [GrantMatch];
  hash: string;
};


type Contribution = {

}
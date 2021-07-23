'use strict';

// ========== Actual Calculations ===========


/**
 * Returns the distribution for a grant round
 *
 * @param roundId
 * @param type_algorithm
 * @param hash_algorithm
 *
 * @returns {GrantsDistribution} - the actual distribution based on recived contributions
 */
export const calculateCurrentDistribution = (roundId: string, type_algorithm?: string ,hash_algorithm?: string): GrantsDistribution => {
    // 1. fetchInfo
    // 2. calculateDistribution
}


/**
 * When a grants round is running and dApp wants to predict
 * how the entire distribution would vary when single grant recieves an anon predicted amount
 *
 * @param predicted_amount
 */
export const calculatePredictedDistribution = (roundId: string, predicted_amount: Number, grant_id: string, type_algorithm?: string): GrantsDistribution => {
    // 1. fetchInfo
    // 2. calculateDistribution
};


/**
 * When a grants round is running and dApp wants to predict
 * how the entire distribution would vary if a single grant recieved an anon predicted amount
 *
 * @param predicted_amount
 */
 export const calculatePredictedDistributions = (roundId: string, predicted_amount: Number, type_algorithm?: string): [GrantsDistribution] => {
    // 1. calculatePredictedDistribution for each grant
};


/**
 * Calculates matching distribution given contributions
 */
export const calculateDistribution = (): GrantsDistribution  => {
    // 1. calculates distribution
    // 2. generateHash
    // 3. returns GrantsDistribution (obtained from 1 & 2)
};


// ======= FOR FUTURE ========

// how to store the distribution curve as opposed to
// ability to pass in multiple GrantRound and generate total distribution

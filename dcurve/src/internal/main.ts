'use strict';

import { GrantPredictionArgs, GrantPredictions, GrantsDistribution } from "src/types";

// ========== Actual Calculations ===========

export class CLR {
    _options = {};

    constructor(options:object) {
        this._options = options;
    }

    calculate(contributions:Function): GrantsDistribution {
        const calcAlgo = this._options['calcAlgo'];
        const hashAlgo = this._options['hashAlgo'];
    }

    /**
     * 
     * @param contributions 
     * @param grantId 
     * @param predicitionPoints 
     * 
     * @returns GrantPredictions
     */
    predict(args: GrantPredictionArgs): GrantPredictions {

        const calcAlgo = this._options['calcAlgo'];
        const hashAlgo = this._options['hashAlgo'];

        // accepts ALL contributions then predicts against each preidicitionPoint on the grantId only

        // CLR calculation (full/with 0)
        // CLR calculation with 1
        // 1:predictedAmount = final_match for 1 - final_match for 0 

        // return [
        //     {predictionPoint: 1, predictedAmount: 12},
        //     {predictionPoint: 10, predictedAmount: 30}
        // ];
    }
}

// import { linear } from 'dcurve';
// import { sha256 } from 'dcurve';
//
// const clr = new CLR({
//     calcAlgo: (...args:any[]) => {
//         return linear(...args)
//     },
//     hashAlgo: (...args:any[]) => {
//         return sha256(...args)
//     }
// });
// const distribution = clr.calculate(() => {
//
//     // feed in grantRound and a list of addresses to ignore
//     return fetch(1, [
//         '0x0...', '0x0...',
//     ])
// })[0];
// const prediction = clr.predict(() => {
//
//     return fetch(...);
// }, 10, [1, 10])

// /**
//  * Returns the distribution for a grant round
//  *
//  * @param roundId
//  * @param type_algorithm
//  * @param hash_algorithm
//  *
//  * @returns {GrantsDistribution} - the actual distribution based on recived contributions
//  */
// export const calculateCurrentDistribution = (roundId: string, type_algorithm?: string ,hash_algorithm?: string): GrantsDistribution => {
//     // 1. fetchInfo
//     // 2. calculateDistribution
// }


// /**
//  * When a grants round is running and dApp wants to predict
//  * how the entire distribution would vary when single grant recieves an anon predicted amount
//  *
//  * @param predicted_amount
//  */
// export const calculatePredictedDistribution = (roundId: string, predicted_amount: Number, grant_id: string, type_algorithm?: string): GrantsDistribution => {
//     // 1. fetchInfo
//     // 2. calculateDistribution
// };


// // /**
// //  * When a grants round is running and dApp wants to predict
// //  * how the entire distribution would vary if a single grant recieved an anon predicted amount
// //  *
// //  * @param predicted_amount
// //  */
// //  export const calculatePredictedDistributions = (roundId: string, predicted_amount: Number, type_algorithm?: string): [GrantsDistribution] => {
// //     // 1. calculatePredictedDistribution for each grant
// // };


// /**
//  * Calculates matching distribution given contributions
//  */
// export const calculateDistribution = (): GrantsDistribution  => {
//     // 1. calculates distribution
//     // 2. generateHash
//     // 3. returns GrantsDistribution (obtained from 1 & 2)
// };


// ======= FOR FUTURE ========

// how to store the distribution curve as opposed to
// ability to pass in multiple GrantRound and generate total distribution

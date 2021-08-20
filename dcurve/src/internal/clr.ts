'use strict';

import {
  CLRArgs,
  GrantMatch,
  GrantPrediction,
  GrantPredictionArgs,
  GrantPredictions,
  GrantRoundContributions,
  GrantsDistribution,
  InitArgs,
  PayoutMatch,
  PayoutMatches,
} from '../../src/types';
import { generateMerkle, getMerkleRoot } from './merkle';
import { addAnonymousContribution, getGrantMatch } from './utils';

// polyfill Buffer for use in browser
import { Buffer } from 'buffer/';
// set to window (TODO: make this work in vite.config.ts)
Object.defineProperty(window, 'Buffer', { value: Buffer });

export class CLR {
  _options: InitArgs;

  constructor(readonly options: InitArgs) {
    this._options = options;
  }

  calculate(grantRoundContributions: GrantRoundContributions, _options?: Record<string, unknown>): GrantsDistribution {
    // allow the options to be overridden
    const options = Object.assign(this._options, _options || {});

    // retrieve the calcAlgo from the supplied options
    const calcAlgo = options['calcAlgo'];

    // move distribution into a payout obj
    const payoutObj: PayoutMatches = {};

    // calculate distribution based on contributions
    const distribution: GrantsDistribution = calcAlgo({
      contributions: grantRoundContributions,
      ...options,
    } as CLRArgs);

    // record the grantRound for identification
    distribution.grantRound = grantRoundContributions.grantRound;

    // check if the calculation should include payouts (we cannot create a merkle without any contributions)
    if (grantRoundContributions.totalPot && options.includePayouts) {
      // construct the payout obj by combining any grants which have the same payout address
      distribution.distribution.forEach((grantMatch: GrantMatch) => {
        // each payout address must only appear once in the payoutDistribution
        let grantIds = [grantMatch.grantId];
        // check if the payout address is already recorded
        if (payoutObj[grantMatch.address]) {
          // get the current set of grantIds
          const currentGrantIds = payoutObj[grantMatch.address].grantIds;
          // add the set of grantIds to the arr and dedupe
          grantIds = [...new Set(grantIds.concat(currentGrantIds))];
        }
        // ensure the payout address has a match to claim
        if (grantMatch.match) {
          // sum the total match for each payout address
          payoutObj[grantMatch.address] = {
            grantIds: grantIds,
            address: grantMatch.address,
            match: grantMatch.match + (payoutObj[grantMatch.address]?.match || 0),
          } as PayoutMatch;
        }
      });
      // record the distribution used to generate the merkle
      distribution.payoutDistribution = Object.values(payoutObj) as PayoutMatch[];
      // prevent attempting to generate a merkle tree if we're missing the minimum number of leafs
      if (distribution.payoutDistribution.length > 1) {
        // generate the merkle tree and record the root
        distribution.merkle = generateMerkle(
          distribution.payoutDistribution,
          grantRoundContributions.matchingTokenDecimals
        );
        distribution.hash = getMerkleRoot(distribution.merkle);
      } else {
        // empty state when we can't create a tree
        distribution.merkleError = 'Missing required context to build tree';
      }
    }

    // return distribution details (<GrantsDistribution>)
    return distribution;
  }

  /**
   * Calculates the matching amount based on current distribution and predicts
   * the match based on predictionPoints
   * @param GrantPredictionArgs
   *
   * @returns GrantPredictions
   */
  predict(args: GrantPredictionArgs, _options?: Record<string, unknown>): GrantPredictions {
    // allow the options to be overridden
    const options = Object.assign(this._options, _options || {});

    // retrieve the calcAlgo from the supplied options
    const calcAlgo = options['calcAlgo'];

    // unpack the prediction arguments
    const grantId: string = args.grantId;
    const predictionPoints: number[] = args.predictionPoints;
    const grantRoundContributions: GrantRoundContributions = args.grantRoundContributions;
    const predictions: GrantPrediction[] = [];

    // calculate distribution based on current contribution
    const distribution: GrantsDistribution = calcAlgo({
      contributions: grantRoundContributions,
      ...(options || {}),
    } as CLRArgs);

    // retrieve only this grantId from the distribution
    const currentGrantMatch = getGrantMatch(grantId, distribution);

    // calculate predicted distribution for each predictionPoint
    predictionPoints.forEach((predictionPoint) => {
      // calculate distribution with anon contribution
      const newDistribution: GrantsDistribution = calcAlgo({
        // add anon contribution of value predictionPoint
        contributions: addAnonymousContribution(grantId, { ...grantRoundContributions }, predictionPoint),
        // allow for overrides to set calc algo
        ...options,
      } as CLRArgs);

      // retrieve only this grantId from the predicted distribution
      const predictedGrantMatch = getGrantMatch(grantId, newDistribution);

      // push the prediction for the predictionPoint
      predictions.push({
        predictionPoint: predictionPoint,
        predictedGrantMatch: predictedGrantMatch,
        predictionDiff: predictedGrantMatch - currentGrantMatch,
      } as GrantPrediction);
    });

    // return the GrantPredictions
    return {
      grantId: grantId,
      grantRound: grantRoundContributions.grantRound,
      predictions: predictions,
    } as GrantPredictions;
  }
}

// ======= FOR FUTURE ========

// how to store the distribution curve as opposed to
// ability to pass in multiple GrantRound and generate total distribution

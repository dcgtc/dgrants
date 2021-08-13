'use strict';

import {
  GrantPrediction,
  GrantPredictionArgs,
  GrantPredictions,
  GrantRoundContributions,
  GrantsDistribution,
} from 'src/types';
import { generateMerkleRoot } from './merkle-root';
import { addAnonContribution, getGrantMatch } from './utils';

type InitArgs = {
  calcAlgo: Function;
};

export class CLR {
  _options: InitArgs;

  constructor(options: InitArgs) {
    this._options = options;
  }

  calculate(grantRoundContributions: GrantRoundContributions): GrantsDistribution {
    const calcAlgo = this._options['calcAlgo'];

    // calculate distribution based on contributions
    const distribution: GrantsDistribution = calcAlgo();
    // TODO: invoke calcAlgo with CLRArgs object and grantRoundContributions

    // generate the hash on the distribution based on selected hashAlgo
    distribution.hash = generateMerkleRoot(distribution.distribution);

    return distribution;
  }

  /**
   * Calculates the matching amount based on current distribution and predicts
   * the match based on predictionPoints
   * @param GrantPredictionArgs
   *
   * @returns GrantPredictions
   */
  predict(args: GrantPredictionArgs): GrantPredictions {
    const calcAlgo = this._options['calcAlgo'];

    const grantId: number = args.grantId;
    const predictionPoints: number[] = args.predictionPoints;
    const grantRoundContributions: GrantRoundContributions = args.grantRoundContributions;

    // calculate distribution based on current contribution
    const distribution: GrantsDistribution = calcAlgo();
    // TODO: invoke calcAlgo with CLRArgs object and grantRoundContributions
    const currentGrantMatch = getGrantMatch(grantId, distribution);

    const predictions: GrantPrediction[] = [];

    // calculate predicted distribution for each predictionPoint
    predictionPoints.forEach((predictionPoint) => {
      // add anon contribution of value predictionPoint
      const newGrantRoundContributions = addAnonContribution(grantId, grantRoundContributions, predictionPoint);

      // calculate distribution with anon contribution
      const newDistribution: GrantsDistribution = calcAlgo();
      // TODO: invoke calcAlgo with CLRArgs object and newGrantRoundContributions

      const predictedGrantMatch = getGrantMatch(grantId, newDistribution);

      const prediction: GrantPrediction = {
        predictionPoint: predictionPoint,
        predictedGrantMatch: predictedGrantMatch,
        predictionDiff: predictedGrantMatch - currentGrantMatch,
      };

      predictions.push(prediction);
    });

    const grantPredictions: GrantPredictions = {
      grantId: grantId,
      predictions: predictions,
    };

    return grantPredictions;
  }
}

// ======= FOR FUTURE ========

// how to store the distribution curve as opposed to
// ability to pass in multiple GrantRound and generate total distribution

import { GrantsDistribution, GrantMatch } from '../../src/types';
import { GrantRoundContributions, Contribution, GrantPrediction } from '@dgrants/types';

/**
 * util function which adds anonymous contribution of given value to the
 * grantRoundContributions for given grant.
 * This function would be used to update the input contributions
 * by adding a contribution of value `amount` to grant `grantId` which would be used to
 * calculate the predicted match
 *
 * @param grantId
 * @param grantRoundContributions
 * @param amount
 * @returns grantRoundContributions
 */
export const addAnonymousContribution = (
  grantId: string,
  grantRoundContributions: GrantRoundContributions,
  amount: number
): GrantRoundContributions => {
  // create anonymous contribution
  const anonymous_contribution: Contribution = {
    grantId: grantId,
    grantAddress: '0x0',
    address: '0x0',
    amount: amount,
  };

  // update grantRoundContributions to include the anon contribution
  const contributions = [...grantRoundContributions.contributions];
  contributions.push(anonymous_contribution);

  grantRoundContributions.contributions = contributions;
  return grantRoundContributions;
};

/**
 * util function which filters for a grants match value in the distribution
 *
 * @param grantId
 * @param grantsDistribution
 * @returns match
 */
export const getGrantMatch = (grantId: string, grantsDistribution: GrantsDistribution): number => {
  const contributions: GrantMatch[] = grantsDistribution.distribution.filter(
    (grantMatch) => grantMatch.grantId === grantId
  );

  return contributions[0]?.match || 0;
};

/**
 * Linear interpolation function to find the point on the curve that amount corresponds to
 *
 * @returns Number Value that fits the curve for x
 */
export function lerp(x_lower: number, x_upper: number, y_lower: number, y_upper: number, x: number) {
  return y_lower + ((y_upper - y_lower) * (x - x_lower)) / (x_upper - x_lower);
}

/**
 * Util function to find the predicted match for a given amount of matchingTokens
 *
 * @param {GrantPrediction} clr_predictions Object containing predictions for the Grant in a GrantRound
 * @param {Number} amount Human readable amount denominated in the GrantRounds matchingToken
 */
export function getPredictedMatchingForAmount(clr_predictions: GrantPrediction, amount: number) {
  // the matching for this grant in this round if we contribute the amount
  let predicted_clr = 0;
  // predictions should be provided with the same axis
  const contributions_axis = [0, 1, 10, 100, 1000, 10000];
  // get all predictions for this grant in this round
  const clr_prediction_curve = clr_predictions?.predictions?.map((prediction, key) => {
    return key == 0 ? prediction.predictedGrantMatch : prediction.predictionDiff;
  });
  // set up lerp input for more accurate predicted matching
  if (!clr_prediction_curve || !amount || isNaN(amount)) {
    predicted_clr = 0;
  } else if (contributions_axis.indexOf(amount) > 0) {
    predicted_clr = clr_prediction_curve[contributions_axis.indexOf(amount)];
  } else {
    let x_lower = 0;
    let x_upper = 0;
    let y_lower = 0;
    let y_upper = 0;

    if (0 < amount && amount < 1) {
      x_lower = 0;
      x_upper = 1;
      y_lower = clr_prediction_curve[0];
      y_upper = clr_prediction_curve[1];
    } else if (1 < amount && amount < 10) {
      x_lower = 1;
      x_upper = 10;
      y_lower = clr_prediction_curve[1];
      y_upper = clr_prediction_curve[2];
    } else if (10 < amount && amount < 100) {
      x_lower = 10;
      x_upper = 100;
      y_lower = clr_prediction_curve[2];
      y_upper = clr_prediction_curve[3];
    } else if (100 < amount && amount < 1000) {
      x_lower = 100;
      x_upper = 1000;
      y_lower = clr_prediction_curve[3];
      y_upper = clr_prediction_curve[4];
    } else {
      x_lower = 1000;
      x_upper = 10000;
      y_lower = clr_prediction_curve[4];
      y_upper = clr_prediction_curve[5];
    }
    // Linear interpolation for more accurate prediction
    predicted_clr = lerp(x_lower, x_upper, y_lower, y_upper, amount);
  }

  return predicted_clr;
}

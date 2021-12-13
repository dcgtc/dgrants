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
  grantId: number,
  grantRoundContributions: GrantRoundContributions,
  amount: number
): GrantRoundContributions => {
  // create anonymous contribution
  const anonymousContribution: Contribution = {
    grantId: grantId,
    grantAddress: '0x0',
    address: '0x0',
    tokenIn: '0x0',
    amount: amount,
  };

  // update grantRoundContributions to include the anon contribution
  const contributions = [...grantRoundContributions.contributions];
  contributions.push(anonymousContribution);

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
export const getGrantMatch = (grantId: number, grantsDistribution: GrantsDistribution): number => {
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
export function lerp(xLower: number, xUpper: number, yLower: number, yUpper: number, x: number) {
  return yLower + ((yUpper - yLower) * (x - xLower)) / (xUpper - xLower);
}

/**
 * Util function to find the predicted match for a given amount of matchingTokens
 *
 * @param {GrantPrediction} clrPredictions Object containing predictions for the Grant in a GrantRound
 * @param {Number} amount Human readable amount denominated in the GrantRounds matchingToken
 */
export function getPredictedMatchingForAmount(clrPredictions: GrantPrediction, amount: number) {
  if (amount < 0) {
    return 0;
  }

  // the matching for this grant in this round if we contribute the amount
  let clrPrediction = 0;
  // predictions should be provided with the same axis
  const contributionsAxis = [0, 1, 10, 100, 1000, 10000];
  // get all predictions for this grant in this round
  const clrPredictionCurve = clrPredictions?.predictions?.map((prediction) => {
    return prediction.predictionDiff;
  });
  // set up lerp input for more accurate predicted matching
  if (!clrPredictionCurve || !amount || isNaN(amount)) {
    clrPrediction = 0;
  } else if (contributionsAxis.indexOf(amount) > 0) {
    clrPrediction = clrPredictionCurve[contributionsAxis.indexOf(amount)];
  } else {
    let xLower = 0;
    let xUpper = 0;
    let yLower = 0;
    let yUpper = 0;

    if (0 < amount && amount < 1) {
      xLower = 0;
      xUpper = 1;
      yLower = clrPredictionCurve[0];
      yUpper = clrPredictionCurve[1];
    } else if (1 < amount && amount < 10) {
      xLower = 1;
      xUpper = 10;
      yLower = clrPredictionCurve[1];
      yUpper = clrPredictionCurve[2];
    } else if (10 < amount && amount < 100) {
      xLower = 10;
      xUpper = 100;
      yLower = clrPredictionCurve[2];
      yUpper = clrPredictionCurve[3];
    } else if (100 < amount && amount < 1000) {
      xLower = 100;
      xUpper = 1000;
      yLower = clrPredictionCurve[3];
      yUpper = clrPredictionCurve[4];
    } else {
      xLower = 1000;
      xUpper = 10000;
      yLower = clrPredictionCurve[4];
      yUpper = clrPredictionCurve[5];
    }
    // Linear interpolation for more accurate prediction
    clrPrediction = lerp(xLower, xUpper, yLower, yUpper, amount);
  }

  return clrPrediction;
}

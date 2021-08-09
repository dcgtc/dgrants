import { CLRArgs, GrantMatch, GrantRoundContributions, GrantsDistribution, Contribution } from "src/types";

/**
 * Holds the logic to determine the distribution using linear QF formula
 * @param clrArgs
 */
export const handle = (clrArgs: CLRArgs): GrantsDistribution => {

  // define local variables
  const matchCap = Number(clrArgs.matchCap);
  const grantRoundContributions: GrantRoundContributions = clrArgs.contributions;

  const totalPot = grantRoundContributions.totalPot;
  const contributions: Contribution[] = grantRoundContributions.contributions;

  let sumOfSqrtContrib = 0;
  let sumOfContrib = 0;
  let totalMatch = 0;
  let hasSaturated = false;
  let distribution: any = [];

  // calculate sum of sqrt of contributions and contributions
  contributions.forEach(contribution => {

    // TODO: ADD TRUST BONUS SCORE

    // sum of square root of contributions
    sumOfSqrtContrib += Math.sqrt(contribution.amount);

    // sum of contributions
    sumOfContrib += contribution.amount;

    const match = Math.pow(sumOfSqrtContrib, 2) - sumOfContrib;
    let grantMatch: GrantMatch = {
      grantId: contribution.grantId,
      match: match
    };

    // generate the distribution without normalizing
    if (!distribution) {
      distribution = [grantMatch];
    } else {
      distribution.push(grantMatch);
    }

    totalMatch += match;
  });

  if (totalMatch > totalPot) {
    // this means the round has saturated and we have enough
    // contributions to ensure all the funds are distributed
    hasSaturated = true;
  }

  /**
   * normalize match if
   *  - hasSaturated is true
   *  - match of a grant exceeds set cap
   */
   distribution.forEach((grantMatch: GrantMatch) => {

    if (hasSaturated) {
      // normalize match if round has saturated
      grantMatch.match = (grantMatch.match * totalPot) / totalMatch;
    }

    if (grantMatch.match >= matchCap) {
      // normalize match if grant has match greater than cap
      grantMatch.match = matchCap;
    }
  });

  const grantDistribution: GrantsDistribution = {
    distribution: distribution,
    hasSaturated: hasSaturated
  }

  return grantDistribution;
}
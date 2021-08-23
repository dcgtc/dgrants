import { CLRArgs, ContributionsByGrantId, GrantMatch, GrantRoundContributions, GrantsDistribution } from '../../types';

/**
 * Holds the logic to determine the distribution using linear QF formula
 * @param clrArgs
 */
export const handle = (clrArgs: CLRArgs): GrantsDistribution => {
  // GrantRoundContributions will define the round and hold all matching contributions
  const grantRoundContributions: GrantRoundContributions = clrArgs.contributions;

  // unpack grantRoundContributions to local state
  const { totalPot, contributions } = grantRoundContributions;

  // define local variables
  let totalMatch = 0;
  let hasSaturated = false;
  const distribution: GrantMatch[] = [];
  const contributionsByGrantId: ContributionsByGrantId = {};

  // pivot the contributions by project
  contributions.forEach((contribution) => {
    if (!contributionsByGrantId[contribution.grantId]) {
      contributionsByGrantId[contribution.grantId] = {
        grantId: contribution.grantId,
        grantAddress: contribution.grantAddress,
        contributions: [],
      };
    }
    contributionsByGrantId[contribution.grantId].contributions.push(contribution);
  });

  // calculate linear matching for each Grant
  Object.values(contributionsByGrantId).forEach((details) => {
    let sumOfSqrtContrib = 0;
    let sumOfContrib = 0;
    // calculate sum of sqrt of contributions and contributions
    details.contributions.forEach((contribution) => {

      // sum of square root of contributions
      sumOfSqrtContrib += contribution.amount ** 0.5;

      // sum of contributions
      sumOfContrib += contribution.amount;
    });

    // sum of square root of contributions ^ 2 - sum of contributions
    const match = sumOfSqrtContrib ** 2 - sumOfContrib;

    // TODO: ADD TRUST BONUS SCORE HERE
    // API CALL TO TRUST BONUS API 
    // GET SCORE FROM CONTRIBUTIONS ADDRESS 
    // MULTIPLY SCORE WITH match VARIABLE IN LINE 47
    // 0.5 AS DEFAULT IF NO TRUST BONUSES PERFORMED, UP TO 1.5

    // record the match for each grantId
    distribution.push({
      grantId: details.grantId,
      address: details.grantAddress,
      match: match,
    } as GrantMatch);

    // record how much of the totalPot we have allocated
    totalMatch += match;
  });

  // this means the round has saturated and we have enough
  // contributions to ensure all funds are distributed
  if (totalMatch > totalPot) {
    hasSaturated = true;
  }

  // normalize match if hasSaturated is true
  if (hasSaturated) {
    distribution.forEach((grantMatch: GrantMatch) => {
      // normalize match if round has saturated
      grantMatch.match = (grantMatch.match * totalPot) / totalMatch;
    });
  }

  return {
    distribution: distribution,
    hasSaturated: hasSaturated,
  } as GrantsDistribution;
};

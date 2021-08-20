import { GrantRoundContributions, Contribution, GrantsDistribution, GrantMatch } from '../../src/types';

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
 * util function which filters and grant match value in the distribution
 *
 * @param grantId
 * @param grantsDistribution
 * @returns match
 */
export const getGrantMatch = (grantId: number, grantsDistribution: GrantsDistribution): number => {
  const contributions: GrantMatch[] = grantsDistribution.distribution.filter(
    (grantMatch) => grantMatch.grantId === grantId
  );

  return contributions[0].match;
};

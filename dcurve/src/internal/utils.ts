import { GrantRoundContributions, Contribution, GrantsDistribution, GrantMatch } from '../../src/types';

/**
 * util function which adds anon contribution of given value to the
 * grantRoundContributions for given grant
 *
 * @param grantId
 * @param grantRoundContributions
 * @param amount
 * @returns grantRoundContributions
 */
export const addAnonContribution = (
  grantId: number,
  grantRoundContributions: GrantRoundContributions,
  amount: number
): GrantRoundContributions => {
  // create anon contribution
  const anon_contribution: Contribution = {
    grantId: grantId,
    grantAddress: '0x0',
    address: '0x0',
    amount: amount,
  };

  // update grantRoundContributions to include the anon contribution
  const contributions = [...grantRoundContributions.contributions];
  contributions.push(anon_contribution);

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

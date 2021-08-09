import { utils } from  'ethers';
import { GrantMatch } from 'src/types';

/**
 * Generates hash of the GrantsDistribution distribution
 * @param distribution - GrantMatch[]
 * @returns {string} - sha256 hash of the distribution
 */
export const handle = (distribution: GrantMatch[]): string => {

  let grantIds: number[] = [];
  let matches: number[] = [];

  distribution.forEach((grantMatch: GrantMatch) => {
    grantIds.push(grantMatch.grantId);
    matches.push(grantMatch.match);
  });

  const grandIdsHash = utils.sha256(grantIds);
  const matchesHash = utils.sha256(matches);

  return utils.sha256(grandIdsHash + matchesHash);
}
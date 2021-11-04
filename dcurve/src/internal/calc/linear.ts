import { fetchJson } from '@ethersproject/web';
import { CLRArgs, ContributionsByGrantId, GrantMatch, GrantsDistribution } from '../../types';
import { GrantRoundContributions, TrustBonusScore } from '@dgrants/types';
import { uploadTrustBonusScores } from '@dgrants/utils/src/trustBonus';

const retrievalEndpoint = 'https://ipfs.fleek.co/ipfs';

/**
 * Creates a url for a MetaPtr
 * @param obj
 * @param obj.cid CID of the grant
 * @returns string
 */
export const getMetaPtr = ({ cid }: { cid: string }) => {
  return `${retrievalEndpoint}/${cid}`;
};

/**
 * Resolves a metaPtr via fetch
 * @param url URL of metaPtr
 * @returns Object
 */
export const resolveMetaPtr = (url: string) => {
  return fetchJson(url).then((res: any) => res.json());
};

/**
 * @notice Contains the logic to determine the distribution using linear QF formula.
 *
 * Additonally :
 *  - will fetches trust bonus scores using `fetchTrustBonusScore`
 *  -
 *  - also supports uploading the score onto IPFS and returning the hash.
 *
 * @param clrArgs
 */
export const handle = async (clrArgs: CLRArgs): Promise<GrantsDistribution> => {
  // GrantRoundContributions will define the round and hold all matching contributions
  const grantRoundContributions: GrantRoundContributions = clrArgs.contributions;

  // unpack grantRoundContributions to local state
  const { totalPot, contributions } = grantRoundContributions;

  // define local variables
  let totalMatch = 0;
  let hasSaturated = false;
  const distribution: GrantMatch[] = [];
  const contributionsByGrantId: ContributionsByGrantId = {};

  const contributionAddresses: Set<string> = new Set();

  // pivot the contributions by project
  contributions.forEach((contribution) => {
    if (!contributionsByGrantId[contribution.grantId]) {
      contributionsByGrantId[contribution.grantId] = {
        grantId: contribution.grantId,
        grantAddress: contribution.grantAddress,
        contributions: {},
      };
      contributionAddresses.add(contribution.address);
    }
    // sum contributions from the same contributor to dampen effects
    if (!contributionsByGrantId[contribution.grantId].contributions[contribution.address]) {
      contributionsByGrantId[contribution.grantId].contributions[contribution.address] = { ...contribution };
    } else {
      contributionsByGrantId[contribution.grantId].contributions[contribution.address].amount += contribution.amount;
    }
  });

  let trustBonusScores = clrArgs.trustBonusScores || [];
  let trustBonusMetaPtr = clrArgs.trustBonusMetaPtr;

  if (!trustBonusScores.length) {
    if (clrArgs.trustBonusMetaPtr) {
      // fetch trust bonus scores from metaPtr
      const url = getMetaPtr({ cid: clrArgs.trustBonusMetaPtr });
      trustBonusScores = await resolveMetaPtr(url);
    }

    // upload trust bonus to IPFS and store hash
    if (!trustBonusMetaPtr && trustBonusScores) {
      trustBonusMetaPtr = (await uploadTrustBonusScores(trustBonusScores)).toString();
    }
  }

  // calculate linear matching for each Grant
  Object.values(contributionsByGrantId).forEach((details) => {
    let sumOfSqrtContrib = 0;
    let sumOfContrib = 0;
    // calculate sum of sqrt of contributions and contributions
    Object.values(details.contributions).forEach((contribution) => {
      // get contributor's trust bonus score
      const trustBonusScore = trustBonusScores.find(
        (trustScore: TrustBonusScore) => trustScore.address == contribution.address
      );

      const score = trustBonusScore ? trustBonusScore.score : 0.5;

      // multiply the trust bonus with the contirbution
      const weightedContribution = contribution.amount * score;

      // sum of square root of contribution
      sumOfSqrtContrib += weightedContribution ** 0.5;

      // sum of contributions
      sumOfContrib += weightedContribution;
    });

    // sum of square root of contributions ^ 2 - sum of contributions
    const match = sumOfSqrtContrib ** 2 - sumOfContrib;

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
    trustBonusMetaPtr: trustBonusMetaPtr,
  } as GrantsDistribution;
};

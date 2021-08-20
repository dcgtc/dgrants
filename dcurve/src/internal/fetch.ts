'use strict';

import { Contract } from 'ethers';
import { Contribution, GrantRoundContributions, GrantRoundFetchArgs } from '../../src/types';
import { abi as GRANT_REGISTRY_ABI } from '@dgrants/contracts/artifacts/contracts/GrantRegistry.sol/GrantRegistry.json';
import { abi as GRANT_ROUND_ABI } from '@dgrants/contracts/artifacts/contracts/GrantRound.sol/GrantRound.json';
import { abi as GRANT_ROUND_MANAGER_ABI } from '@dgrants/contracts/artifacts/contracts/GrantRoundManager.sol/GrantRoundManager.json';
import { formatUnits } from 'ethers/lib/utils';

const ERC20_ABI = ['function balanceOf(address) view returns (uint)'];

/**
 * Returns GrantRoundContributions describing the round and any contributions
 * @param {GrantRoundFetchArgs}
 */
export const fetch = async (args: GrantRoundFetchArgs) => {
  // fetch the grantList
  const registry = new Contract(args.grantRegistry, GRANT_REGISTRY_ABI, args.provider);
  // fetch the grantRound
  const round = new Contract(args.grantRound, GRANT_ROUND_ABI, args.provider);
  // fetch grantRoundManager
  const roundManager = new Contract(args.grantRoundManager, GRANT_ROUND_MANAGER_ABI, args.provider);

  // set-up
  const [allGrants, matchingToken, donationToken, grantDonations] = await Promise.all([
    registry.getAllGrants(), // TODO: https://github.com/dcgtc/dgrants/pull/91#discussion_r692567688
    round.matchingToken(),
    roundManager.donationToken(),
    roundManager.queryFilter(roundManager.filters.GrantDonation()), // TODO: https://github.com/dcgtc/dgrants/pull/91#discussion_r692569977
  ]);

  // collect the grants into a grantId->payoutAddress obj
  const grantsDict = allGrants.reduce((grants: Record<string, string>, grant: Record<string, string>, key: number) => {
    grants[key.toString()] = grant.payee;

    return grants;
  }, {});

  // get token info
  const matchingTokenContract = new Contract(matchingToken, ERC20_ABI, args.provider);

  // fetch & ignore Contributions
  const contributions: Contribution[] = [];

  // records matching contributions in the expected format (Contribution[])
  grantDonations.forEach(async (contribution) => {
    // get tx details to pull contributor details from
    const tx = await contribution.getTransaction();

    // check that the contribution is valid
    const grantId = contribution?.args?.grantId.toString();
    const inRound = contribution?.args?.rounds.includes(args.grantRound);
    const isIgnoredGrant = args?.ignore?.grants?.includes(grantId);
    const isIgnoredContributor = args?.ignore?.contributionAddress?.indexOf(tx.from) !== -1;

    // only include transactions from this grantRound which havent been ignored
    if (inRound && !isIgnoredGrant && !isIgnoredContributor) {
      contributions.push({
        grantId: grantId,
        amount: parseFloat(
          formatUnits(contribution?.args?.donationAmount, args.supportedTokens[donationToken].decimals)
        ),
        grantAddress: grantsDict[grantId],
        address: tx.from,
      });
    }
  });

  // return contributions as GrantRoundContributions
  return {
    grantRound: args.grantRound,
    totalPot: parseFloat(
      formatUnits(await matchingTokenContract.balanceOf(args.grantRound), args.supportedTokens[matchingToken].decimals)
    ),
    matchingTokenDecimals: args.supportedTokens[matchingToken].decimals,
    contributions: contributions,
  } as GrantRoundContributions;
};

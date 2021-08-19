'use strict';

import { Contract } from 'ethers';
import { Contribution, GrantRoundContributions, GrantRoundFetchArgs } from '../../src/types';
import { abi as GRANT_ROUND_MANAGER_ABI } from '@dgrants/contracts/artifacts/contracts/GrantRoundManager.sol/GrantRoundManager.json';
import { abi as GRANT_REGISTRY_ABI } from '@dgrants/contracts/artifacts/contracts/GrantRegistry.sol/GrantRegistry.json';

const ERC20_ABI = ['function balanceOf(address) view returns (uint)'];

/**
 * Returns GrantRoundContributions describing the round and any contributions
 * @param {GrantRoundFetchArgs}
 */
export const fetch = async (args: GrantRoundFetchArgs) => {
  // fetch grantRoundManager
  const roundManager = new Contract(args.grantRoundManager, GRANT_ROUND_MANAGER_ABI, args.provider);
  // fetch the grantList
  const registry = new Contract(args.grantRegistry, GRANT_REGISTRY_ABI, args.provider);

  // set-up
  const values = await Promise.all([
    registry.getAllGrants(),
    roundManager.donationToken(),
    roundManager.queryFilter(roundManager.filters.GrantDonation()),
  ]);

  // collect the grants into a grantId->payoutAddress obj
  const grantsList = values[0].reduce((grants: Record<string, string>, grant: Record<string, string>, key: number) => {
    grants[key] = grant.payee;

    return grants;
  }, {});

  // get donation token info
  const donationToken = values[1];
  const donationTokenContract = new Contract(donationToken, ERC20_ABI, args.provider);

  // fetch & ignore Contributions
  const grantDonations = values[2];
  const contributions: Contribution[] = [];

  // records matching contributions in the expected format (Contribution[])
  grantDonations.forEach(async (contribution) => {
    // get tx details to pull contributor details from
    const tx = await contribution.getTransaction();

    // check that the contribution is valid
    const inRound = contribution?.args?.rounds.indexOf(args.grantRound) !== -1;
    const isIgnoredGrant =
      args.ignore && args.ignore.grants && args.ignore.grants?.indexOf(contribution?.args?.grantId.toNumber()) !== -1;
    const isIgnoredContributor =
      args.ignore && args.ignore.contributionAddress && args.ignore.contributionAddress?.indexOf(tx.from) !== -1;

    // only include transactions from this grantRound which havent been ignored
    if (inRound && !isIgnoredGrant && !isIgnoredContributor) {
      contributions.push({
        grantId: contribution?.args?.grantId.toNumber(),
        amount: contribution?.args?.donationAmount / 10 ** args.supportedTokens[donationToken].decimals,
        grantAddress: grantsList[contribution?.args?.grantId.toNumber()],
        address: tx.from,
      });
    }
  });

  // return contributions as GrantRoundContributions
  return {
    grantRound: args.grantRound,
    totalPot:
      (await donationTokenContract.balanceOf(args.grantRound)) / 10 ** args.supportedTokens[donationToken].decimals,
    currDecimals: 18,
    contributions: contributions,
  } as GrantRoundContributions;
};

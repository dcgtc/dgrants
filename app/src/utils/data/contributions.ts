// --- Types ---
import { Contribution, GrantRound } from '@dgrants/types';
import { LocalForageAnyObj } from 'src/types';
import { TokenInfo } from '@uniswap/token-lists';
// --- Utils ---
import { fetchTrustBonusScore } from '@dgrants/utils/src/trustBonus';
import { formatUnits } from 'ethers/lib/utils';
import { Event } from 'ethers';
import { syncStorage } from 'src/utils/data/utils';
// --- Constants ---
import { contributionsKey, trustBonusKey } from 'src/utils/constants';
import { START_BLOCK } from 'src/utils/chains';
// --- Data ---
import useWalletStore from 'src/store/wallet';

// --- pull in the registry contract
const { grantRoundManager } = useWalletStore();

/**
 * @notice Get/Refresh all contributions
 *
 * @param {number} blockNumber The current blockNumber
 * @param {Object} grantPayees A dict of grant addresses (grant.id->grant.payee)
 * @param {TokenInfo} donationToken The roundManagers donation token
 * @param {boolean} forceRefresh Force the cache to refresh
 */
export async function getContributions(
  blockNumber: number,
  grantPayees: Record<string, string>,
  donationToken: TokenInfo,
  forceRefresh?: boolean
) {
  return await syncStorage(
    contributionsKey,
    {
      blockNumber: blockNumber,
    },
    async (LocalForageData?: LocalForageAnyObj | undefined, save?: (saveData?: LocalForageAnyObj) => void) => {
      // pick up contributions from the localStorage obj
      const ls_contributions: Record<string, Contribution> = LocalForageData?.data?.contributions || {};

      // every block
      if (forceRefresh || !LocalForageData || (LocalForageData && LocalForageData.blockNumber < blockNumber)) {
        // get the most recent block we collected
        const fromBlock = LocalForageData?.blockNumber + 1 || START_BLOCK;
        // get any new donations to the grantRound
        const grantDonations =
          (await grantRoundManager.value?.queryFilter(
            grantRoundManager?.value?.filters?.GrantDonation(null, null, null, null),
            fromBlock,
            blockNumber
          )) || [];

        // resolve contributions
        void (await Promise.all(
          grantDonations.map(async (contribution: Event) => {
            // get tx details to pull contributor details from
            const tx = await contribution.getTransaction();

            // check that the contribution is valid
            const grantId = contribution?.args?.grantId.toString();
            const inRounds = contribution?.args?.rounds;
            // record the new transaction
            ls_contributions[`${tx.hash}-${grantId}`] = {
              grantId: grantId,
              amount: parseFloat(formatUnits(contribution?.args?.donationAmount, donationToken.decimals)),
              inRounds: inRounds,
              grantAddress: grantPayees[grantId],
              address: tx.from,
              donationToken: donationToken,
              txHash: tx.hash,
              blockNumber: tx.blockNumber,
            };
          })
        ));
      }

      // convert back to Contribitions[] and sort
      const contributions = {
        contributions: Object.values(ls_contributions).sort((a: Contribution, b: Contribution) =>
          (a?.blockNumber || 0) > (b?.blockNumber || 0) ? -1 : a?.blockNumber == b?.blockNumber ? 0 : 1
        ) as Contribution[],
      };

      // mark for renewal and save off the { txHash: Contribution } version to avoid duplicates
      if ((contributions.contributions || []).length > 0 && save) {
        save({
          contributions: ls_contributions,
        });
      }

      // return sorted Contributions[]
      return contributions;
    }
  );
}

/**
 * @notice Get/Refresh all TrustBonus scores
 *
 * @param {number} blockNumber The current blockNumber
 * @param {Object} contributions A dict of all contributions (contribution.txHash->contribution)
 * @param {boolean} forceRefresh Force the cache to refresh
 */
export async function getTrustBonusScores(
  blockNumber: number,
  contributions: Record<string, Contribution>,
  forceRefresh = false
) {
  return await syncStorage(
    trustBonusKey,
    {
      blockNumber: blockNumber,
    },
    async (LocalForageData?: LocalForageAnyObj | undefined, save?: () => void) => {
      const ls_trustBonus = LocalForageData?.data?.trustBonus || {};
      const ls_contributors = LocalForageData?.data?.contributors || [];
      // collect any new contributor
      const newContributorAddresses: Set<string> = new Set();
      // every block
      if (
        forceRefresh ||
        !LocalForageData ||
        (LocalForageData && (LocalForageData.blockNumber || START_BLOCK) < blockNumber)
      ) {
        // set score for null user to prevent linear from fetching (if there are no other scores matched)
        ls_trustBonus['0x0'] = 0.5;
        // collect any new contributors
        Object.values(contributions).forEach((contribution) => {
          if (
            !LocalForageData ||
            !contribution?.blockNumber ||
            contribution.blockNumber > (LocalForageData.blockNumber || START_BLOCK)
          ) {
            newContributorAddresses.add(contribution.address);
          }
        });
        // get the trust scores for any new contributors
        if ([...newContributorAddresses].length) {
          // fetch trust bonus scores from gitcoin API
          const { data, status } = await fetchTrustBonusScore([...newContributorAddresses]);
          if (!status.ok) console.error(status.message);
          if (data) {
            data.forEach((trustBonus) => {
              ls_trustBonus[trustBonus.address] = trustBonus.score;
            });
          }
        }
      }

      // compile response data
      const trustBonus = {
        trustBonus: ls_trustBonus,
        contributors: [...new Set([...ls_contributors, ...newContributorAddresses])],
      };

      // mark this for renewal
      if (Object.keys(ls_trustBonus || {}).length > 0 && save) {
        save();
      }

      return trustBonus;
    }
  );
}

/**
 * @notice given a grantId and the contributions return only contributions for the grant
 */
export function filterContributionsByGrantId(grantId: string, contributions: Contribution[]) {
  // filter contributions that are for this grantId
  return contributions.filter((contribution: Contribution) => {
    // check that the contribution is valid
    const forThisGrant = contribution.grantId === grantId;

    // only include contributions for this forThisGrant
    return forThisGrant;
  });
}

/**
 * @notice given a grantRound and the contributions return only contributions for the grantRound
 */
export function filterContributionsByGrantRound(round: GrantRound, contributions: Contribution[]) {
  // filter contributions that are for this grantId
  return contributions.filter((contribution: Contribution) => {
    // check that the contribution is valid
    const forThisGrantRound = contribution.inRounds?.includes(round.address);

    // only include contributions for this GrantRound
    return forThisGrantRound;
  });
}

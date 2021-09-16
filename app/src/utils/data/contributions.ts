// --- Types ---
import { Contribution, GrantRound } from '@dgrants/types';
import { LocalStorageAnyObj } from 'src/types';
import { TokenInfo } from '@uniswap/token-lists';
// --- Utils ---
import { fetchTrustBonusScore } from '@dgrants/utils/src/trustBonus';
import { formatUnits } from 'ethers/lib/utils';
import { Event } from 'ethers';
import { syncStorage } from 'src/utils/data/utils';
// --- Constants ---
import { contributionsKey, trustBonusKey } from 'src/utils/constants';
import { SUPPORTED_TOKENS_MAPPING } from 'src/utils/chains';
// --- Data ---
import useWalletStore from 'src/store/wallet';

// --- pull in the registry contract
const { grantRoundManager } = useWalletStore();

/**
 * @notice Get/Refresh all contributions
 *
 * @param {number} blockNumber The current blockNumber
 * @param {Object} grantsDict A dict of grant addresses (grant.id->grant.payee)
 * @param {TokenInfo} donationToken The roundManagers donation token
 * @param {boolean} forceRefresh Force the cache to refresh
 */
export async function getContributions(
  blockNumber: number,
  grantsDict: Record<string, string>,
  donationToken: TokenInfo,
  forceRefresh?: boolean
) {
  return await syncStorage(
    contributionsKey,
    {
      blockNumber: blockNumber,
      timeStamp: Date.now() / 1000,
    },
    async (localStorageData?: LocalStorageAnyObj | undefined, save?: (saveData?: LocalStorageAnyObj) => void) => {
      const rawData = localStorageData?.data || {};
      const contributions: Record<string, Contribution> = rawData?.contributions || {};

      // every block
      if (forceRefresh || !localStorageData || (localStorageData && localStorageData.blockNumber < blockNumber)) {
        // get the most recent block we collected
        const fromBlock = localStorageData?.blockNumber + 1 || 0;
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
            contributions[`${tx.hash}-${grantId}`] = {
              grantId: grantId,
              amount: parseFloat(
                formatUnits(
                  contribution?.args?.donationAmount,
                  SUPPORTED_TOKENS_MAPPING[donationToken.address].decimals
                )
              ),
              inRounds: inRounds,
              grantAddress: grantsDict[grantId],
              address: tx.from,
              donationToken: donationToken,
              txHash: tx.hash,
              blockNumber: tx.blockNumber,
            };
          })
        ));
      }

      // convert back to Contribitions[] and sort
      const ls_contributions = {
        contributions: Object.values(contributions).sort((a: Contribution, b: Contribution) =>
          (a?.blockNumber || 0) > (b?.blockNumber || 0) ? -1 : a?.blockNumber == b?.blockNumber ? 0 : 1
        ) as Contribution[],
      };

      // mark for renewal and save off the { txHash: Contribution } version to avoid duplicates
      if ((ls_contributions.contributions || []).length > 0 && save) {
        save({
          contributions: contributions,
        });
      }

      // return sorted Contributions[]
      return ls_contributions;
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
      ts: Date.now() / 1000,
      blockNumber: blockNumber,
    },
    async (localStorageData?: LocalStorageAnyObj | undefined, save?: () => void) => {
      const trustBonusData = localStorageData?.data?.trustBonus || {};
      const contributorsData = localStorageData?.data?.contributors || [];
      const newContributionAddresses: Set<string> = new Set();
      // every block
      if (
        forceRefresh ||
        !localStorageData ||
        (localStorageData && (localStorageData.blockNumber || 0) < blockNumber)
      ) {
        // set score for null user to prevent linear from fetching (if there are no other scores matched)
        trustBonusData['0x0'] = 0.5;
        // collect any new contributors
        Object.values(contributions).forEach((contribution) => {
          if (
            !localStorageData ||
            !contribution?.blockNumber ||
            contribution.blockNumber > (localStorageData.blockNumber || 0)
          ) {
            newContributionAddresses.add(contribution.address);
          }
        });
        // get the trust scores for any new contributors
        if ([...newContributionAddresses].length) {
          // fetch trust bonus scores from gitcoin API
          const { data, status } = await fetchTrustBonusScore([...newContributionAddresses]);
          if (!status.ok) console.error(status.message);
          if (data) {
            data.forEach((trustBonus) => {
              trustBonusData[trustBonus.address] = trustBonus.score;
            });
          }
        }
      }

      const ls_trustBonus = {
        trustBonus: trustBonusData,
        contributors: [...new Set([...contributorsData, ...newContributionAddresses])],
      };

      // mark this for renewal
      if (Object.keys(ls_trustBonus.trustBonus || {}).length > 0 && save) {
        save();
      }

      return ls_trustBonus;
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

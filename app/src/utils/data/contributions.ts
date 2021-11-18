// --- Types ---
import {
  Contribution,
  ContributionDetail,
  ContributionSubgraph,
  Grant,
  GrantMetadata,
  GrantRound,
  GrantRoundMetadata,
} from '@dgrants/types';
import { LocalForageAnyObj } from 'src/types';
import { TokenInfo } from '@uniswap/token-lists';
// --- Utils ---
import { fetchTrustBonusScore } from '@dgrants/utils/src/trustBonus';
import { formatUnits, getAddress, id } from 'ethers/lib/utils';
import { BigNumber, BigNumberish, Event, EventFilter } from 'ethers';
import { syncStorage } from 'src/utils/data/utils';
// --- Constants ---
import { contributionsKey, trustBonusKey } from 'src/utils/constants';
import { GRANT_ROUND_MANAGER_ADDRESS, START_BLOCK, SUBGRAPH_URL } from 'src/utils/chains';
// --- Data ---
import useWalletStore from 'src/store/wallet';
import { batchFilterCall, metadataId } from '../utils';
import { Ref } from 'vue';
import { getGrantRoundGrantData } from './grantRounds';

// --- pull in the registry contract
const { provider, grantRoundManager } = useWalletStore();

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
  return (
    (await syncStorage(
      contributionsKey,
      {
        blockNumber: blockNumber,
      },
      async (LocalForageData?: LocalForageAnyObj | undefined, save?: (saveData?: LocalForageAnyObj) => void) => {
        // check how far out of sync we are from the cache and pull any events that happened bwtween then and now
        const _lsBlockNumber = LocalForageData?.blockNumber || 0;
        // pick up contributions from the localStorage obj
        const _lsContributions: Record<string, Contribution> = LocalForageData?.data?.contributions || {};

        // get the most recent block we collected
        let fromBlock = _lsBlockNumber ? _lsBlockNumber + 1 : START_BLOCK;

        // every block
        if (forceRefresh || !LocalForageData || (LocalForageData && fromBlock < blockNumber)) {
          if (SUBGRAPH_URL) {
            try {
              // make the request
              const res = await fetch(SUBGRAPH_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  query: `{
                    grantDonations(where: {lastUpdatedBlockNumber_gte: ${fromBlock}, lastUpdatedBlockNumber_lte: ${blockNumber}}) {
                      grantId
                      tokenIn
                      donationAmount
                      from
                      hash
                      rounds
                      lastUpdatedBlockNumber
                    }
                  }`,
                }),
              });
              // resolve the json
              const json = await res.json();
              // update each of the grants
              json.data.grantDonations.forEach((contribution: ContributionSubgraph) => {
                const grantId = BigNumber.from(contribution.grantId).toNumber();
                _lsContributions[`${contribution.hash}-${grantId}`] = {
                  grantId: grantId,
                  amount: parseFloat(formatUnits(contribution.donationAmount, donationToken.decimals)),
                  inRounds: contribution.rounds.map((address: string) => getAddress(address)),
                  grantAddress: grantPayees[grantId],
                  tokenIn: getAddress(contribution.tokenIn),
                  address: getAddress(contribution.from),
                  donationToken: donationToken,
                  txHash: contribution.hash,
                  blockNumber: contribution.lastUpdatedBlockNumber,
                };
              });
              // update to most recent block collected
              fromBlock = blockNumber;
            } catch {
              console.log('dGrants: Data fetch error - Subgraph request failed');
            }
          }
          // collect the remainder of the blocks
          if (fromBlock < blockNumber) {
            // get any new donations to the grantRound
            const grantDonations = await batchFilterCall(
              {
                contract: grantRoundManager.value,
                filter: 'GrantDonation',
                args: [null, null, null, null],
              },
              fromBlock,
              blockNumber
            );

            // resolve contributions
            void (await Promise.all(
              grantDonations.map(async (contribution: Event) => {
                // get tx details to pull contributor details from
                const tx = await contribution.getTransaction();

                // check that the contribution is valid
                const grantId = contribution?.args?.grantId.toNumber();

                // record the new transaction
                _lsContributions[`${tx.hash}-${grantId}`] = {
                  grantId: grantId,
                  amount: parseFloat(formatUnits(contribution?.args?.donationAmount, donationToken.decimals)),
                  inRounds: contribution?.args?.rounds.map((address: string) => getAddress(address)),
                  grantAddress: grantPayees[grantId],
                  address: getAddress(tx.from),
                  tokenIn: getAddress(contribution?.args?.tokenIn),
                  donationToken: donationToken,
                  txHash: tx.hash,
                  blockNumber: tx.blockNumber,
                };
              })
            ));
          }
        }

        // convert back to Contribitions[] and sort
        const contributions = {
          contributions: Object.values(_lsContributions).sort((a: Contribution, b: Contribution) =>
            (a?.blockNumber || 0) > (b?.blockNumber || 0) ? -1 : a?.blockNumber == b?.blockNumber ? 0 : 1
          ) as Contribution[],
        };

        // mark for renewal and save off the { txHash: Contribution } version to avoid duplicates
        if ((contributions.contributions || []).length > 0 && save) {
          save({
            contributions: _lsContributions,
          });
        }

        // return sorted Contributions[]
        return contributions;
      }
    )) || {}
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
  return (
    (await syncStorage(
      trustBonusKey,
      {
        blockNumber: blockNumber,
      },
      async (LocalForageData?: LocalForageAnyObj | undefined, save?: () => void) => {
        const _lsTrustBonus = LocalForageData?.data?.trustBonus || {};
        const _lsContributors = LocalForageData?.data?.contributors || [];
        // collect any new contributor
        const newContributorAddresses: Set<string> = new Set();
        // every block
        if (
          forceRefresh ||
          !LocalForageData ||
          (LocalForageData && (LocalForageData.blockNumber || START_BLOCK) < blockNumber)
        ) {
          // set score for null user to prevent linear from fetching (if there are no other scores matched)
          _lsTrustBonus['0x0'] = 0.5;
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
                _lsTrustBonus[trustBonus.address] = trustBonus.score;
              });
            }
          }
        }

        // compile response data
        const trustBonus = {
          trustBonus: _lsTrustBonus,
          contributors: [...new Set([..._lsContributors, ...newContributorAddresses])],
        };

        // mark this for renewal
        if (Object.keys(_lsTrustBonus || {}).length > 0 && save) {
          save();
        }

        return trustBonus;
      }
    )) || {}
  );
}

/**
 * @notice given a grantId and the contributions return only contributions for the grant
 */
export function filterContributionsByGrantId(grantId: number, contributions: Contribution[]) {
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

/**
 * @notice Attach an event listener on grantRoundManager-> grantDonation
 */
export function grantDonationListener(
  args: {
    grantPayees: Record<string, string>;
    donationToken: TokenInfo;
    grantIds: number[];
    trustBonus: Record<string, number>;
  },
  refs: Record<string, Ref>
) {
  const listener = async (
    grantId: BigNumberish,
    tokenIn: string,
    donationAmount: BigNumberish,
    grantRounds: string[],
    event: Event
  ) => {
    // console.log(name, grantId, tokenIn, donationAmount, rounds);
    const blockNumber = await provider.value.getBlockNumber();
    // get tx details to pull contributor details from
    const tx = await event.getTransaction();
    // log the new contribution
    console.log('New contribution: ', {
      grantId: BigNumber.from(grantId).toNumber(),
      donationAmount: parseFloat(formatUnits(donationAmount, args.donationToken.decimals)),
      from: tx.from,
    });
    // store the new contribution
    const contributions = await syncStorage(
      contributionsKey,
      {
        blockNumber: blockNumber,
      },
      async (LocalForageData?: LocalForageAnyObj | undefined, save?: (saveData: LocalForageAnyObj) => void) => {
        // pull the contributions
        const _lsContributions: Record<string, Contribution> = LocalForageData?.data?.contributions || {};
        // check that the contribution is valid
        grantId = BigNumber.from(grantId).toNumber();
        // record the new transaction
        _lsContributions[`${tx.hash}-${grantId}`] = {
          grantId: grantId,
          amount: parseFloat(formatUnits(donationAmount, args.donationToken.decimals)),
          inRounds: grantRounds,
          grantAddress: args.grantPayees[grantId],
          address: tx.from,
          donationToken: args.donationToken,
          tokenIn: tokenIn,
          txHash: tx.hash,
          blockNumber: tx.blockNumber,
        };

        if (save) {
          save({
            contributions: _lsContributions,
          });
        }

        // convert back to Contribitions[], sort and save to refs
        refs.contributions.value = Object.values(_lsContributions).sort((a: Contribution, b: Contribution) =>
          (a?.blockNumber || 0) > (b?.blockNumber || 0) ? -1 : a?.blockNumber == b?.blockNumber ? 0 : 1
        ) as Contribution[];

        return {
          contributions: refs.contributions.value,
        };
      }
    );

    // trustBonus
    await getTrustBonusScores(blockNumber, contributions);

    // getGrantRoundGrantData
    void (await Promise.all(
      grantRounds.map(async (grantRoundAddress: string) => {
        if (grantRounds.indexOf(grantRoundAddress) !== -1) {
          const grantRound = refs.grantRounds.value.find(
            (round: GrantRound) => getAddress(round.address) == getAddress(grantRoundAddress)
          );

          // get the clr data for the round
          const grantRoundCLRData = await getGrantRoundGrantData(
            blockNumber,
            contributions.contributions,
            args.trustBonus || {},
            grantRound,
            refs.grantRoundMetadata.value,
            args.grantIds,
            false
          );

          // update the ref
          refs.grantRoundsCLRData.value[grantRoundAddress] = grantRoundCLRData.grantRoundCLR;
        }
      })
    ));
  };

  // filter for every event by topic so that we can get to the event args too
  const filter = {
    address: GRANT_ROUND_MANAGER_ADDRESS,
    topics: [id('GrantDonation(uint96,address,uint256,address[])')],
  } as EventFilter;

  // attach listener
  grantRoundManager.value.on(filter, listener);

  // return destroy method
  return {
    off: () => grantRoundManager.value.off(filter, listener),
  };
}

/**
 * @notice given a userAddress and the contributions, return only the contributions for that address
 * @param userAddress
 * @param contributions
 */
export function filterContributionsByUserAddress(userAddress: string, contributions: Contribution[]) {
  if (contributions && userAddress) {
    return contributions.filter((contribution: Contribution) => {
      return contribution.address === userAddress;
    });
  }
  return undefined;
}

/**
 * @notice filters through the grantrounds and returns the necessary attributes for  contribution detail screens
 * @param grantRounds
 * @param grantId
 * @param grantRoundMeta
 */
function filterGrantRoundsForContributions(
  grantRounds: GrantRound[],
  grantId: number,
  grantRoundMeta: GrantRoundMetadata[]
) {
  let roundName = '...';

  grantRounds.find((grantRound) => {
    const metadata = grantRoundMeta[<never>metadataId(grantRound.metaPtr)];
    if (metadata && metadata.grants?.includes(grantId)) {
      roundName = metadata.name;
    }
    return roundName;
  });

  return roundName;
}

/***
 * @notice
 * @param userAddress
 * @param contributions
 * @param grants
 * @param grantMetaData
 * @param grantRounds
 * @param grantRoundsMetaData
 */
export function filterContributionGrantData(
  userAddress: string,
  contributions: Contribution[],
  grants: Grant[],
  grantMetaData: GrantMetadata[],
  grantRounds: GrantRound[],
  grantRoundsMetaData: GrantRoundMetadata[]
): ContributionDetail[] {
  const myContributions = filterContributionsByUserAddress(userAddress, contributions);
  if (myContributions?.length === 0 || !myContributions) {
    return [];
  }
  const fullContributionDetail = myContributions?.map((contribution) => {
    let grantLogo = '/placeholder_grant.svg';
    let grantName = '...';

    const grantData = grants.find((grant) => grant.id === contribution.grantId);
    if (grantData) {
      grantLogo = grantMetaData[<never>metadataId(grantData.metaPtr)].logoURI ?? '';
      grantName = grantMetaData[<never>metadataId(grantData.metaPtr)].name ?? '...';
    }

    const roundData = filterGrantRoundsForContributions(grantRounds, contribution.grantId, grantRoundsMetaData);

    return {
      grantId: contribution.grantId,
      grantAddress: contribution.grantAddress,
      grantName: grantName,
      grantLogoURI: grantLogo,
      address: contribution.address,
      amount: contribution.amount,
      tokenIn: contribution.tokenIn,
      inRounds: contribution.inRounds,
      roundName: roundData,
      txHash: contribution.txHash,
      blockNumber: contribution.blockNumber,
    } as ContributionDetail;
  });

  return fullContributionDetail;
}

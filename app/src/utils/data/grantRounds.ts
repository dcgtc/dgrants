// --- Types ---
import {
  GrantRound,
  Contribution,
  GrantRoundCLR,
  GrantsRoundDetails,
  GrantRoundMetadataResolution,
  GrantPrediction,
} from '@dgrants/types';
import { LocalForageData } from 'src/types';
// --- Methods and Data ---
import useWalletStore from 'src/store/wallet';
import { BigNumber, BigNumberish, Contract, Event } from 'ethers';
import { formatUnits, getAddress } from 'ethers/lib/utils';
import { formatNumber, callMulticallContract, batchFilterCall } from '../utils';
import { syncStorage } from 'src/utils/data/utils';
import { CLR, linear, InitArgs } from '@dgrants/dcurve';
import { filterContributionsByGrantId, filterContributionsByGrantRound } from './contributions';
// --- Constants ---
import { START_BLOCK, SUPPORTED_TOKENS_MAPPING, GRANT_REGISTRY_ADDRESS, SUBGRAPH_URL } from 'src/utils/chains';
import {
  GRANT_ROUND_ABI,
  ERC20_ABI,
  allGrantRoundsKey,
  grantRoundKeyPrefix,
  grantRoundsCLRDataKeyPrefix,
} from 'src/utils/constants';
import { Ref } from 'vue';
import { getMetadata } from './ipfs';

const { grantRoundManager, provider } = useWalletStore();

/**
 * @notice Get/Refresh all GrantRound addresses
 *
 * @param {number} blockNumber The currenct block number
 * @param {boolean} forceRefresh Force the cache to refresh
 */
export async function getAllGrantRounds(blockNumber: number, forceRefresh = false) {
  return await syncStorage(
    allGrantRoundsKey,
    {
      blockNumber: blockNumber,
    },
    async (LocalForageData?: LocalForageData | undefined, save?: () => void) => {
      // use the ls_blockNumber to decide if we need to update the roundAddresses
      const ls_blockNumber = LocalForageData?.blockNumber || 0;
      // only update roundAddress if new ones are added...
      const ls_roundAddresses = new Set(LocalForageData?.data?.roundAddresses || []);
      // get the most recent block we collected
      let fromBlock = ls_blockNumber ? ls_blockNumber + 1 : START_BLOCK;
      // every block
      if (forceRefresh || !LocalForageData || (LocalForageData && ls_blockNumber < blockNumber)) {
        // attempt to use the subgraph first
        if (SUBGRAPH_URL) {
          type Subgraph_GrantRound = {
            address: string;
            lastUpdatedBlockNumber: number;
          };
          // make the request
          const res = await fetch(SUBGRAPH_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: `{
                grantRounds(where: {lastUpdatedBlockNumber_gte: ${fromBlock}, lastUpdatedBlockNumber_lte: ${blockNumber}}) {
                  address
                  lastUpdatedBlockNumber
                }
              }`,
            }),
          });
          // resolve the json
          const json = await res.json();
          // update each of the grants
          json.data.grantRounds.forEach((grantRound: Subgraph_GrantRound) => {
            // update to most recent block collected
            fromBlock = Math.max(fromBlock, grantRound.lastUpdatedBlockNumber);
            // collate grantRoundAddresses
            ls_roundAddresses.add(getAddress(grantRound.address));
          });
        }
        // collect the remainder of the blocks
        if (fromBlock < blockNumber) {
          (
            await batchFilterCall(
              {
                contract: grantRoundManager.value,
                filter: 'GrantRoundCreated',
                args: [null],
              },
              fromBlock,
              blockNumber
            )
          ).forEach((e: Event) => {
            // collate grantRoundAddresses
            ls_roundAddresses.add(getAddress(e.args?.grantRound));
          });
        }
      }

      // hydrate/format roundAddresses for use
      const roundAddresses = {
        roundAddresses: [...ls_roundAddresses],
      };

      // conditionally save the new roundAddresses
      if (roundAddresses.roundAddresses.length && save) {
        save();
      }

      return roundAddresses;
    }
  );
}

/**
 * @notice Get/Refresh the details of a single GrantRound - we need to run this frequently to get any changes in balance
 *
 * @param {number} blockNumber The currenct block number
 * @param {string} grantRoundAddress The grantRoundAddress to get the details for
 * @param {boolean} forceRefresh Force the cache to refresh
 */
export async function getGrantRound(blockNumber: number, grantRoundAddress: string, forceRefresh?: boolean) {
  return await syncStorage(
    grantRoundKeyPrefix + grantRoundAddress,
    {
      blockNumber: blockNumber,
    },
    async (LocalForageData?: LocalForageData | undefined, save?: () => void) => {
      // use the ls_blockNumber to decide if we need to update the rounds data
      const ls_blockNumber = LocalForageData?.blockNumber || 0;
      // current state
      let {
        startTime,
        endTime,
        metadataAdmin,
        payoutAdmin,
        registryAddress,
        metaPtr,
        hasPaidOut,
        donationToken,
        matchingToken,
        funds,
        donationTokenAddress,
      } = LocalForageData?.data?.grantRound || {};
      // open the rounds contract
      const roundContract = new Contract(grantRoundAddress, GRANT_ROUND_ABI, provider.value);
      // collect the donationToken & matchingToken before promise.all'ing everything
      const matchingTokenAddress = matchingToken?.address || (await roundContract.matchingToken());
      // use matchingTokenContract to get balance
      const matchingTokenContract = new Contract(matchingTokenAddress, ERC20_ABI, provider.value);
      // full update of stored data
      if (forceRefresh || !LocalForageData) {
        // Define calls to be read using multicall
        [
          donationTokenAddress,
          startTime,
          endTime,
          metadataAdmin,
          payoutAdmin,
          registryAddress,
          metaPtr,
          hasPaidOut,
          funds,
        ] = await callMulticallContract([
          // pull the grantRound data from its contract
          {
            target: grantRoundAddress,
            contract: roundContract,
            fns: [
              'donationToken',
              'startTime',
              'endTime',
              'metadataAdmin',
              'payoutAdmin',
              'registry',
              'metaPtr',
              'hasPaidOut',
            ],
          },
          // get the balance from the matchinTokenContract
          {
            target: matchingTokenAddress,
            contract: matchingTokenContract,
            fns: [
              {
                fn: 'balanceOf',
                args: [grantRoundAddress],
              },
            ],
          },
        ]);
        // get the donation/matching token
        matchingToken = SUPPORTED_TOKENS_MAPPING[matchingTokenAddress];
        donationToken = SUPPORTED_TOKENS_MAPPING[donationTokenAddress];
        // record the funds as a human readable number
        funds = parseFloat(formatUnits(BigNumber.from(funds), SUPPORTED_TOKENS_MAPPING[matchingTokenAddress].decimals));
      } else if (LocalForageData && ls_blockNumber < blockNumber) {
        // get updated metadata
        const [newMetaPtr, balance] = await Promise.all([
          roundContract.metaPtr(),
          matchingTokenContract.balanceOf(grantRoundAddress),
        ]);
        // update to the new metaPtr
        metaPtr = newMetaPtr;
        // update to the new balance
        funds = parseFloat(formatUnits(balance, SUPPORTED_TOKENS_MAPPING[matchingTokenAddress].decimals)).toString();
      }
      // build status against now (unix)
      const now = Date.now() / 1000;
      // place the GrantRound details into a GrantRound object
      const grantRound = {
        grantRound: {
          startTime,
          endTime,
          metadataAdmin,
          payoutAdmin,
          registryAddress,
          metaPtr,
          hasPaidOut,
          donationToken: donationToken,
          matchingToken: matchingToken,
          address: grantRoundAddress,
          funds: funds,
          status:
            now >= BigNumber.from(startTime).toNumber() && now < BigNumber.from(endTime).toNumber()
              ? 'Active'
              : now < BigNumber.from(startTime).toNumber()
              ? 'Upcoming'
              : 'Completed',
          registry: GRANT_REGISTRY_ADDRESS,
          error: undefined,
        } as GrantRound,
      };

      // mark this for renewal
      if (grantRound.grantRound.startTime && save) {
        save();
      }

      // return the GrantRound data
      return grantRound;
    }
  );
}

/**
 * @notice Get/Refresh all GrantRound Grant data
 *
 * @param {number} blockNumber The latest blockNumber
 * @param {Object} contributions An array of all contributions (contribution[])
 * @param {Object} trustBonus A dict of all trustBonus scores (contribution.payee->trustBonusScore)
 * @param {String} grantRoundAddress The grantRound address we want details for
 * @param {Array} grantIds An array of grantIds
 * @param {TokenInfo} matchingToken The matchingToken used by the grantRound
 * @param {boolean} forceRefresh Force the cache to refresh
 */
export async function getGrantRoundGrantData(
  blockNumber: number,
  contributions: Contribution[],
  trustBonus: { [address: string]: number },
  grantRound: GrantRound,
  grantRoundMetadata: Record<string, GrantRoundMetadataResolution>,
  grantIds: number[],
  forceRefresh = false
) {
  const clr = new CLR({
    calcAlgo: linear,
    includePayouts: false,
  } as InitArgs);

  return await syncStorage(
    grantRoundsCLRDataKeyPrefix + grantRound.address,
    {
      blockNumber: blockNumber,
    },
    async (LocalForageData?: LocalForageData | undefined, save?: () => void) => {
      // unpack round state
      const roundAddress = grantRound.address;
      const matchingTokenDecimals = grantRound.matchingToken.decimals;
      const totalPot = BigNumber.from(grantRound.funds).toNumber();

      // unpack current ls state
      const roundGrantData = LocalForageData?.data?.grantRoundCLR || {};
      const ls_totalPot = roundGrantData?.totalPot || 0;
      // add new donations/predictions to ls state
      let ls_grantDonations: Contribution[] = roundGrantData?.contributions || [];
      let ls_grantPredictions = roundGrantData?.predictions || {};

      // every block
      if (
        forceRefresh ||
        !LocalForageData ||
        (LocalForageData && (LocalForageData.blockNumber || START_BLOCK) < blockNumber)
      ) {
        // get the rounds metadata
        const metadata = grantRoundMetadata[grantRound.metaPtr];
        // total the number of contributions being considered in the current prediction
        const oldDonationCount = ls_grantDonations.length;
        // fetch contributions
        ls_grantDonations = Object.values(contributions)
          .filter((contribution: Contribution) => {
            // check that the contribution is valid
            const inRound = metadata.grants?.includes(BigNumber.from(contribution.grantId).toNumber());

            // only include transactions from this grantRound which havent been ignored
            return inRound;
          })
          .map((contrib) => JSON.parse(JSON.stringify(contrib)));

        // recalculate when totalPot increases or when there are new grantDonations
        if (
          ls_totalPot < totalPot ||
          ls_grantDonations.length > oldDonationCount ||
          (metadata.grants?.length || 0) > Object.keys(ls_grantPredictions).length
        ) {
          // scores are to be presented in an array
          const trustBonusScores = Object.keys(trustBonus).map((address) => {
            return {
              address: address,
              score: trustBonus[address],
            };
          });

          // get all predictions for each grant in this round
          ls_grantPredictions = (
            await Promise.all(
              grantIds.map(async (grantId: number) => {
                let prediction: GrantPrediction | undefined = undefined;
                if (metadata && metadata.grants?.includes(grantId)) {
                  prediction = await clr.predict({
                    grantId: grantId,
                    predictionPoints: [0, 1, 10, 100, 1000, 10000],
                    trustBonusScores: trustBonusScores,
                    grantRoundContributions: {
                      grantRound: roundAddress,
                      totalPot: totalPot,
                      matchingTokenDecimals: matchingTokenDecimals,
                      contributions: ls_grantDonations,
                    },
                  });
                }
                return prediction;
              })
            )
          ).reduce((predictions, prediction) => {
            // record as a dict (grantId -> GrantPrediction)
            if (prediction) {
              predictions[prediction.grantId] = prediction;
            }
            return predictions;
          }, {} as Record<string, GrantPrediction>);
        }
      }

      const grantRoundCLR = {
        grantRoundCLR: {
          grantRound: roundAddress,
          totalPot: totalPot,
          matchingTokenDecimals: matchingTokenDecimals,
          contributions: ls_grantDonations,
          predictions: ls_grantPredictions,
        } as GrantRoundCLR,
      };

      if (Object.keys(ls_grantPredictions).length && save) {
        save();
      }

      return grantRoundCLR;
    }
  );
}

/**
 * @notice returns the predictions for this grant in the given round
 */
export function getPredictionsForGrantInRound(grantId: number, roundData: GrantRoundCLR) {
  return roundData && roundData.predictions && roundData.predictions[Number(grantId)];
}

/**
 * @notice Returns the details for all grantRounds this grant is a member of
 */
export function getGrantsGrantRoundDetails(
  grantId: number,
  rounds: GrantRound[],
  roundsMetadata: Record<string, GrantRoundMetadataResolution>,
  grantRoundsCLRData: Record<string, GrantRoundCLR>,
  contributions: Contribution[]
) {
  // get all contributions for this grant
  const grant_contributions = filterContributionsByGrantId(grantId, contributions);

  return rounds
    .map((round) => {
      const metadata = roundsMetadata[round.metaPtr];
      if (metadata && metadata.grants?.includes(grantId)) {
        // get the predictions for this grant in this round
        const predictions = getPredictionsForGrantInRound(grantId, grantRoundsCLRData[round.address]);
        // filter only contributions which should be considered for this round (should we also/only check metadata here?)
        const roundContributions = filterContributionsByGrantRound(round, grant_contributions);
        // sum the contributions which were made against this round
        const roundsContributionTotal = roundContributions
          .reduce((carr, contrib) => (contrib ? contrib.amount + carr : carr), 0)
          .toString();

        return {
          grantId: grantId,
          address: round.address,
          metaPtr: round.metaPtr,
          name: metadata?.name || '',
          matchingToken: round.matchingToken,
          donationToken: round.donationToken,
          contributions: roundContributions,
          balance: formatNumber(roundsContributionTotal, 2),
          matching: predictions && formatNumber(predictions.predictions[0].predictedGrantMatch, 2),
          prediction1: predictions && formatNumber(predictions.predictions[1].predictionDiff, 2),
          prediction10: predictions && formatNumber(predictions.predictions[2].predictionDiff, 2),
          prediction100: predictions && formatNumber(predictions.predictions[3].predictionDiff, 2),
        } as GrantsRoundDetails;
      } else {
        return false;
      }
    })
    .filter((round) => round);
}

/**
 * @notice Pull new GrantRound details and update refs
 */
async function updateGrantRound(
  grantRoundAddress: string,
  args: {
    grantIds: number[];
    trustBonus: Record<string, number>;
    contributions: Contribution[];
  },
  refs: Record<string, Ref>
) {
  // blockNumber from the provider
  const blockNumber = await provider.value.getBlockNumber();
  // update ls_roundAddresses
  void (await syncStorage(
    allGrantRoundsKey,
    {
      blockNumber: blockNumber,
    },
    async (LocalForageData?: LocalForageData | undefined, save?: () => void) => {
      // only update roundAddress if new ones are added...
      const ls_roundAddresses = LocalForageData?.data?.roundAddresses || [];
      const grantRoundAddresses = new Set(ls_roundAddresses);
      grantRoundAddresses.add(grantRoundAddress);

      // hydrate/format roundAddresses for use
      const roundAddresses = {
        roundAddresses: [...grantRoundAddresses],
      };

      // conditionally save the new roundAddresses
      if (save) {
        void save();
      }

      // push the new grant round
      const grantRound = (await getGrantRound(blockNumber, grantRoundAddress)) as GrantRound;

      // get the clr data for the round
      const grantRoundCLRData = await getGrantRoundGrantData(
        blockNumber,
        args.contributions || [],
        args.trustBonus || {},
        grantRound,
        refs.grantRoundMetadata.value,
        args.grantIds,
        false
      );

      // update the refs
      const grantRoundIndex = refs.grantRounds.value.findIndex(
        (round: GrantRound) => getAddress(round.address) == getAddress(grantRound.address)
      );
      // drop the old entry
      if (grantRoundIndex !== -1) {
        refs.grantRounds.value.splice(grantRoundIndex, 1);
      }
      // replace with new entry
      refs.grantRounds.value.push(grantRound);
      refs.grantRoundsCLRData.value[grantRoundAddress] = grantRoundCLRData.grantRoundCLR;

      // return the roundAddresses to be saved
      return roundAddresses;
    }
  ));
}

/**
 * @notice Attach an event listener on grantRoundManager->grantRoundCreated
 */
export function grantRoundListener(
  name: string,
  args: {
    listeners: { off: () => Contract }[];
    grantIds: number[];
    trustBonus: Record<string, number>;
    contributions: Contribution[];
  },
  refs: Record<string, Ref>
) {
  const listener = async (grantRoundAddress: string) => {
    // open the rounds contract
    const roundContract = new Contract(grantRoundAddress, GRANT_ROUND_ABI, provider.value);
    // open the rounds contract
    const matchingTokenContract = new Contract(await roundContract.matchingToken(), ERC20_ABI, provider.value);
    // update the grants round
    void updateGrantRound(grantRoundAddress, args, refs);

    // init and record the new listeners
    args.listeners.push(
      metadataUpdatedListener(
        {
          grantRoundContract: roundContract,
          grantRoundAddress: grantRoundAddress,
          contributions: args.contributions,
          grantIds: args.grantIds,
          trustBonus: args.trustBonus,
        },
        refs
      )
    );
    args.listeners.push(
      matchingTokenListener(
        {
          matchingTokenContract: matchingTokenContract,
          grantRoundAddress: grantRoundAddress,
          contributions: args.contributions,
          grantIds: args.grantIds,
          trustBonus: args.trustBonus,
        },
        refs
      )
    );
  };

  grantRoundManager.value.on(name, listener);

  return {
    off: () => grantRoundManager.value.off(name, listener),
  };
}

/**
 * @notice Attach an event listener on roundContract->MetadataUpdated
 */
export function metadataUpdatedListener(
  args: {
    grantRoundAddress: string;
    grantRoundContract: Contract;
    grantIds: number[];
    contributions: Contribution[];
    trustBonus: Record<string, number>;
  },
  refs: Record<string, Ref>
) {
  const listener = async (oldMetaPtr: string, newMetaPtr: string) => {
    console.log('Updating GrantRounds MetaPtr: ', oldMetaPtr, newMetaPtr);
    // update the grants metadata
    void (await getMetadata(newMetaPtr, refs.grantRoundMetadata));
    // push the new grant round
    void (await updateGrantRound(args.grantRoundAddress, args, refs));
  };

  args.grantRoundContract.on('MetadataUpdated', listener);

  return {
    off: () => args.grantRoundContract.off('MetadataUpdated', listener),
  };
}

/**
 * @notice Attach an event listener on matchingTokenContract->Transfer
 */
export function matchingTokenListener(
  args: {
    grantRoundAddress: string;
    matchingTokenContract: Contract;
    grantIds: number[];
    contributions: Contribution[];
    trustBonus: Record<string, number>;
  },
  refs: Record<string, Ref>
) {
  // filter for the grantRoundAddress
  const filter = args.matchingTokenContract.filters.Transfer(null, args.grantRoundAddress);

  const listener = async (to: string, amount: BigNumberish, from: string) => {
    console.log(`New contributions: ${to} - ${BigNumber.from(amount).toString()} - ${from}`);
    // push the new grant round
    void (await updateGrantRound(args.grantRoundAddress, args, refs));
  };

  args.matchingTokenContract.on(filter, listener);

  return {
    off: () => args.matchingTokenContract.off(filter, listener),
  };
}

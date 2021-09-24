// --- Types ---
import {
  GrantRound,
  Contribution,
  GrantRoundCLR,
  GrantsRoundDetails,
  GrantRoundMetadataResolution,
} from '@dgrants/types';
import { LocalStorageData } from 'src/types';
import { TokenInfo } from '@uniswap/token-lists';
// --- Methods and Data ---
import useWalletStore from 'src/store/wallet';
import { Contract, Event } from 'ethers';
import { formatUnits } from 'ethers/lib/utils';
import { formatNumber } from '../utils';
import { syncStorage } from 'src/utils/data/utils';
import { CLR, linear, InitArgs } from '@dgrants/dcurve';
import { filterContributionsByGrantId, filterContributionsByGrantRound } from './contributions';
// --- Constants ---
import { START_BLOCK, SUPPORTED_TOKENS_MAPPING, GRANT_REGISTRY_ADDRESS } from 'src/utils/chains';
import {
  GRANT_ROUND_ABI,
  ERC20_ABI,
  allGrantRoundsKey,
  grantRoundKeyPrefix,
  grantRoundsCLRDataKeyPrefix,
} from 'src/utils/constants';

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
      ts: Date.now() / 1000,
      blockNumber: blockNumber,
    },
    async (localStorageData?: LocalStorageData | undefined, save?: () => void) => {
      const { grantRoundManager } = useWalletStore();
      // use the ls_blockNumber to decide if we need to update the roundAddresses
      const ls_blockNumber = localStorageData?.blockNumber || START_BLOCK;
      // only update roundAddress if new ones are added...
      let roundAddresses = localStorageData?.data?.roundAddresses || [];
      // every block
      if (forceRefresh || !localStorageData || (localStorageData && ls_blockNumber < blockNumber)) {
        // get the most recent block we collected
        const fromBlock = ls_blockNumber + 1 || START_BLOCK;
        const roundList =
          (
            await grantRoundManager.value?.queryFilter(
              grantRoundManager.value?.filters.GrantRoundCreated(null),
              fromBlock,
              blockNumber
            )
          ).map((e: Event) => e.args?.grantRound) || [];
        // add new rounds
        roundAddresses = [...roundAddresses, ...roundList];
      }

      // hydrate/format roundAddresses for use
      const ls_roundAddresses = {
        roundAddresses: roundAddresses,
      };

      // conditionally save the new roundAddresses
      if (roundAddresses.length && save) {
        save();
      }

      return ls_roundAddresses;
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
      ts: Date.now() / 1000,
      blockNumber: blockNumber,
    },
    async (localStorageData?: LocalStorageData | undefined, save?: () => void) => {
      const { provider, multicall } = useWalletStore();
      const data = localStorageData?.data || {};

      // read from registry on first load and every 30 secs after (we need to pick up any changes)
      if (
        forceRefresh ||
        !localStorageData ||
        (multicall.value && localStorageData && (localStorageData.ts || 0) < Date.now() / 1000 - 30)
      ) {
        // open the rounds contract
        const roundContract = new Contract(grantRoundAddress, GRANT_ROUND_ABI, provider.value);
        // collect the donationToken before promise.all'ing everything
        const donationTokenAddress = data?.donationToken?.address || (await roundContract.donationToken());
        const matchingTokenAddress = data?.matchingToken?.address || (await roundContract.matchingToken());
        // use matchingTokenContract to get balance
        const matchingTokenContract = new Contract(matchingTokenAddress, ERC20_ABI, provider.value);

        // Define calls to be read using multicall
        const calls = [
          { target: grantRoundAddress, callData: roundContract.interface.encodeFunctionData('startTime') },
          { target: grantRoundAddress, callData: roundContract.interface.encodeFunctionData('endTime') },
          { target: grantRoundAddress, callData: roundContract.interface.encodeFunctionData('metadataAdmin') },
          { target: grantRoundAddress, callData: roundContract.interface.encodeFunctionData('payoutAdmin') },
          { target: grantRoundAddress, callData: roundContract.interface.encodeFunctionData('registry') },
          { target: grantRoundAddress, callData: roundContract.interface.encodeFunctionData('metaPtr') },
          { target: grantRoundAddress, callData: roundContract.interface.encodeFunctionData('hasPaidOut') },
          {
            target: matchingTokenAddress,
            callData: matchingTokenContract.interface.encodeFunctionData('balanceOf', [grantRoundAddress]),
          },
        ];

        // Execute calls
        const { returnData } = (await multicall.value?.tryBlockAndAggregate(false, calls)) || {};
        const [
          startTimeEncoded,
          endTimeEncoded,
          metadataAdminEncoded,
          payoutAdminEncoded,
          registryAddressEncoded,
          metaPtrEncoded,
          hasPaidOutEncoded,
          matchingTokenBalanceEncoded,
        ] = returnData;

        // Unpack result
        const startTime = roundContract.interface.decodeFunctionResult('startTime', startTimeEncoded.returnData)[0]; // prettier-ignore
        const endTime = roundContract.interface.decodeFunctionResult('endTime', endTimeEncoded.returnData)[0] // prettier-ignore
        const metadataAdmin = roundContract.interface.decodeFunctionResult('metadataAdmin', metadataAdminEncoded.returnData)[0]; // prettier-ignore
        const payoutAdmin = roundContract.interface.decodeFunctionResult('payoutAdmin', payoutAdminEncoded.returnData)[0]; // prettier-ignore
        const registryAddress = roundContract.interface.decodeFunctionResult('registry', registryAddressEncoded.returnData)[0]; // prettier-ignore
        const metaPtr = roundContract.interface.decodeFunctionResult('metaPtr', metaPtrEncoded.returnData)[0]; // prettier-ignore
        const hasPaidOut = roundContract.interface.decodeFunctionResult('hasPaidOut', hasPaidOutEncoded.returnData)[0]; // prettier-ignore
        const matchingTokenBalance = matchingTokenContract.interface.decodeFunctionResult('balanceOf', matchingTokenBalanceEncoded.returnData)[0]; // prettier-ignore

        // build status against now (unix)
        const now = Date.now() / 1000;

        // place the GrantRound details into a GrantRound object
        const ls_grantRound = {
          grantRound: {
            startTime,
            endTime,
            metadataAdmin,
            payoutAdmin,
            registryAddress,
            metaPtr,
            hasPaidOut,
            donationToken: {
              address: donationTokenAddress,
              name: SUPPORTED_TOKENS_MAPPING[donationTokenAddress].name,
              symbol: SUPPORTED_TOKENS_MAPPING[donationTokenAddress].symbol,
              decimals: SUPPORTED_TOKENS_MAPPING[donationTokenAddress].decimals,
              chainId: provider.value.network.chainId || 1,
              // TODO: fetch logo from CoinGecko's huge token list (as well as use that to avoid a network request for token info each poll): https://tokenlists.org/token-list?url=https://tokens.coingecko.com/uniswap/all.json
              logoURI: undefined, // we can leave this out for now
            } as TokenInfo,
            matchingToken: {
              address: matchingTokenAddress,
              name: SUPPORTED_TOKENS_MAPPING[matchingTokenAddress].name,
              symbol: SUPPORTED_TOKENS_MAPPING[matchingTokenAddress].symbol,
              decimals: SUPPORTED_TOKENS_MAPPING[matchingTokenAddress].decimals,
              chainId: provider.value.network.chainId || 1,
              // TODO: fetch logo from CoinGecko's huge token list (as well as use that to avoid a network request for token info each poll): https://tokenlists.org/token-list?url=https://tokens.coingecko.com/uniswap/all.json
              logoURI: undefined, // we can leave this out for now
            } as TokenInfo,
            address: grantRoundAddress,
            funds: matchingTokenBalance / 10 ** SUPPORTED_TOKENS_MAPPING[matchingTokenAddress].decimals,
            status:
              now >= startTime.toNumber() && now < endTime.toNumber()
                ? 'Active'
                : now < startTime.toNumber()
                ? 'Upcoming'
                : 'Completed',
            registry: GRANT_REGISTRY_ADDRESS,
            error: undefined,
          } as GrantRound,
        };

        // mark this for renewal
        if (data.startTime && data.endTime && save) {
          save();
        }

        // return the GrantRound data
        return ls_grantRound;
      } else {
        // return data unchanged
        return data;
      }
    }
  );
}

/**
 * @notice Get/Refresh all GrantRound Grant data
 *
 * @param {number} blockNumber The latest blockNumber
 * @param {Object} contributions A dict of all contributions (contribution.txHash->contribution)
 * @param {Object} trustBonus A dict of all trustBonus scores (contribution.payee->trustBonusScore)
 * @param {String} grantRoundAddress The grantRound address we want details for
 * @param {Object} grantsDict A dict of grant addresses (grant.id->grant.payee)
 * @param {TokenInfo} matchingToken The matchingToken used by the grantRound
 * @param {boolean} forceRefresh Force the cache to refresh
 */
export async function getGrantRoundGrantData(
  blockNumber: number,
  contributions: Contribution[],
  trustBonus: { [address: string]: number },
  grantRoundAddress: string,
  grantsDict: { [key: string]: string },
  matchingToken: TokenInfo,
  forceRefresh = false
) {
  const clr = new CLR({
    calcAlgo: linear,
    includePayouts: false,
  } as InitArgs);

  return await syncStorage(
    grantRoundsCLRDataKeyPrefix + grantRoundAddress,
    {
      ts: Date.now() / 1000,
      blockNumber: blockNumber,
    },
    async (localStorageData?: LocalStorageData | undefined, save?: () => void) => {
      const { provider } = useWalletStore();
      const roundGrantData = localStorageData?.data?.grantRoundCLR || {};

      // unpack current ls state
      let grantDonations: Contribution[] = roundGrantData?.contributions || [];
      let matchingTokenDecimals: number = roundGrantData?.matchingTokenDecimals || 0;
      const totalPot: number = roundGrantData?.totalPot || 0;
      const predictions = roundGrantData?.predictions || {};
      const donationCount = grantDonations.length;

      // get token info
      const matchingTokenContract = new Contract(matchingToken.address, ERC20_ABI, provider.value);
      // used to bigNumberify the distribution data
      matchingTokenDecimals = SUPPORTED_TOKENS_MAPPING[matchingToken.address].decimals;
      // total pot is balance of matchingToken held by grantRoundAddress
      const newTotalPot = parseFloat(
        formatUnits(await matchingTokenContract.balanceOf(grantRoundAddress), matchingTokenDecimals)
      );

      // every block
      if (
        forceRefresh ||
        !localStorageData ||
        totalPot !== newTotalPot ||
        (localStorageData && (localStorageData.blockNumber || START_BLOCK) < blockNumber)
      ) {
        // fetch contributions
        grantDonations = Object.values(contributions).filter((contribution: Contribution) => {
          // check that the contribution is valid
          const inRound = contribution.inRounds?.includes(grantRoundAddress);

          // only include transactions from this grantRound which havent been ignored
          return inRound;
        });

        // re-run predict if there are any new contributions
        if (totalPot !== newTotalPot || grantDonations.length > donationCount) {
          // get all predictions for the grants in this round
          void (await Promise.all(
            Object.keys(grantsDict).map(async (grantId: string) => {
              // predict for each grant in the round
              predictions[grantId] = await clr.predict({
                grantId: grantId,
                predictionPoints: [0, 1, 10, 100, 1000, 10000],
                trustBonusScores: Object.keys(trustBonus).map((address) => {
                  return {
                    address: address,
                    score: trustBonus[address],
                  };
                }),
                grantRoundContributions: {
                  grantRound: grantRoundAddress,
                  totalPot: newTotalPot,
                  matchingTokenDecimals: matchingTokenDecimals,
                  contributions: grantDonations,
                },
              });
            })
          ));
        }
      }

      const ls_grantRoundCLR = {
        grantRoundCLR: {
          grantRound: grantRoundAddress,
          totalPot: newTotalPot,
          matchingTokenDecimals: matchingTokenDecimals,
          contributions: grantDonations,
          predictions: predictions,
        } as GrantRoundCLR,
      };

      if (grantDonations.length && save) {
        save();
      }

      return ls_grantRoundCLR;
    }
  );
}

/**
 * @notice returns the prediction curve for this grant in the given round
 */
export function getPredictionsForGrantInRound(grantId: string, roundData: GrantRoundCLR) {
  return roundData.predictions && roundData.predictions[Number(grantId)];
}

/**
 * @notice Returns the details for all grantRounds this grant is a member of
 */
export function getGrantsGrantRoundDetails(
  grantId: string,
  rounds: GrantRound[],
  roundsMetadata: Record<string, GrantRoundMetadataResolution>,
  grantRoundsCLRData: Record<string, GrantRoundCLR>,
  contributions: Contribution[]
) {
  // get all contributions for this grant
  const grant_contributions = filterContributionsByGrantId(grantId, contributions);

  return rounds.map((round) => {
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
      name: roundsMetadata[round.metaPtr].name || '',
      matchingToken: round.matchingToken,
      donationToken: round.donationToken,
      contributions: roundContributions,
      balance: formatNumber(roundsContributionTotal, 2),
      matching: predictions && formatNumber(predictions.predictions[0].predictedGrantMatch, 2),
      prediction1: predictions && formatNumber(predictions.predictions[1].predictionDiff, 2),
      prediction10: predictions && formatNumber(predictions.predictions[2].predictionDiff, 2),
      prediction100: predictions && formatNumber(predictions.predictions[3].predictionDiff, 2),
    } as GrantsRoundDetails;
  });
}

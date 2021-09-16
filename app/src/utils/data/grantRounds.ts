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
import { SUPPORTED_TOKENS_MAPPING, GRANT_REGISTRY_ADDRESS } from 'src/utils/chains';
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
      let roundAddresses = localStorageData?.data?.roundAddresses || [];

      // read from roundManager on first load and every 10 mins
      if (
        forceRefresh ||
        !localStorageData ||
        (localStorageData && (localStorageData.ts || 0) < Date.now() / 1000 - 60 * 10)
      ) {
        const roundList =
          (await grantRoundManager.value?.queryFilter(grantRoundManager.value?.filters.GrantRoundCreated(null))) || [];
        roundAddresses = [...roundList.map((e: Event) => e.args?.grantRound)];
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
 * @notice Get/Refresh the details of a single GrantRound
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

      // read from registry on first load and every 10 mins
      if (
        forceRefresh ||
        !localStorageData ||
        (multicall.value && localStorageData && (localStorageData.ts || 0) < Date.now() / 1000 - 60 * 10)
      ) {
        // open the rounds contract
        const roundContract = new Contract(grantRoundAddress, GRANT_ROUND_ABI, provider.value);
        // collect the donationToken before promise.all'ing everything
        const donationTokenAddress = data?.donationToken?.address || (await roundContract.donationToken());
        const donationTokenContract = new Contract(donationTokenAddress, ERC20_ABI, provider.value);
        const matchingTokenAddress = data?.matchingToken?.address || (await roundContract.matchingToken());
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
          { target: donationTokenAddress, callData: donationTokenContract.interface.encodeFunctionData('name') },
          { target: donationTokenAddress, callData: donationTokenContract.interface.encodeFunctionData('symbol') },
          { target: donationTokenAddress, callData: donationTokenContract.interface.encodeFunctionData('decimals') },
          { target: matchingTokenAddress, callData: matchingTokenContract.interface.encodeFunctionData('name') },
          { target: matchingTokenAddress, callData: matchingTokenContract.interface.encodeFunctionData('symbol') },
          { target: matchingTokenAddress, callData: matchingTokenContract.interface.encodeFunctionData('decimals') },
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
          donationTokenNameEncoded,
          donationTokenSymbolEncoded,
          donationTokenDecimalsEncoded,
          matchingTokenNameEncoded,
          matchingTokenSymbolEncoded,
          matchingTokenDecimalsEncoded,
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
        const donationTokenName = donationTokenContract.interface.decodeFunctionResult('name', donationTokenNameEncoded.returnData)[0]; // prettier-ignore
        const donationTokenSymbol = donationTokenContract.interface.decodeFunctionResult('symbol', donationTokenSymbolEncoded.returnData)[0]; // prettier-ignore
        const donationTokenDecimals = donationTokenContract.interface.decodeFunctionResult('decimals', donationTokenDecimalsEncoded.returnData)[0]; // prettier-ignore
        const matchingTokenName = matchingTokenContract.interface.decodeFunctionResult('name', matchingTokenNameEncoded.returnData)[0]; // prettier-ignore
        const matchingTokenSymbol = matchingTokenContract.interface.decodeFunctionResult('symbol', matchingTokenSymbolEncoded.returnData)[0]; // prettier-ignore
        const matchingTokenDecimals = matchingTokenContract.interface.decodeFunctionResult('decimals', matchingTokenDecimalsEncoded.returnData)[0]; // prettier-ignore
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
              name: donationTokenName,
              symbol: donationTokenSymbol,
              decimals: donationTokenDecimals,
              chainId: provider.value.network.chainId || 1,
              // TODO: fetch logo from CoinGecko's huge token list (as well as use that to avoid a network request for token info each poll): https://tokenlists.org/token-list?url=https://tokens.coingecko.com/uniswap/all.json
              logoURI: undefined, // we can leave this out for now
            } as TokenInfo,
            matchingToken: {
              address: matchingTokenAddress,
              name: matchingTokenName,
              symbol: matchingTokenSymbol,
              decimals: matchingTokenDecimals,
              chainId: provider.value.network.chainId || 1,
              // TODO: fetch logo from CoinGecko's huge token list (as well as use that to avoid a network request for token info each poll): https://tokenlists.org/token-list?url=https://tokens.coingecko.com/uniswap/all.json
              logoURI: undefined, // we can leave this out for now
            } as TokenInfo,
            address: grantRoundAddress,
            funds: matchingTokenBalance / 10 ** matchingTokenDecimals,
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
        (localStorageData && (localStorageData.blockNumber || 0) < blockNumber)
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

import { BigNumber, BigNumberish } from 'ethers';
import { TokenInfo } from '@uniswap/token-lists';

// --- Grants ---
// The output from ethers/typechain allows array or object access to grant data, so we must define types for
// handling the Grant struct as done below
export type MetaPtr = { protocol: BigNumberish; pointer: string };

export type GrantEthersArray = [BigNumber, string, number, number, string, [BigNumber, string]];

export type GrantEthersObject = {
  id: BigNumber;
  owner: string;
  createdAt: number;
  lastUpdated: number;
  payee: string;
  metaPtr: MetaPtr;
};

export type GrantEthers = GrantEthersObject | (GrantEthersArray & GrantEthersObject);

// When pulled from the subgraph a grant will have the following properties
export type GrantSubgraph = {
  id: BigNumberish;
  owner: string;
  payee: string;
  metaPtr: MetaPtr;
  lastUpdatedBlockNumber: number;
  createdAt: BigNumber;
  lastUpdated: BigNumber;
};
// internally we cast id:BigNumber from GrantEthers to a number for Grant
export type Grant = {
  id: number;
  owner: string;
  payee: string;
  metaPtr: MetaPtr;
  createdAt: BigNumber;
  lastUpdated: BigNumber;
};

// Metadata resolve from a grant's metadata pointer URL
export type GrantMetadata = {
  name: string;
  description: string;
  logoURI?: string;
  properties?: {
    websiteURI?: string;
    githubURI?: string;
    twitterURI?: string;
  } & {
    [key: string]: string; // for extensions/flexibility
  };
};
export type GrantMetadataStatus = 'resolved' | 'pending' | 'error';
export type GrantMetadataResolution = Partial<GrantMetadata> & {
  status: GrantMetadataStatus;
};

/**
 * Object for an individual Contribution
 *
 * @type Contribution
 * @field {grantId} grant id in the registry to which the contribution was made
 * @field {grantAddress} grants payee address
 * @field {address} address which made the contribution
 * @field {amount} contribution amount
 * --- optional ---
 * @field {inRounds} rounds that the contributions counts towards
 * @field {donationToken} rounds donationToken info
 * @field {txHash} contributions transaction hash
 * @field {blockNumber} blockNumber that mined the transaction
 */
export type Contribution = {
  grantId: number;
  grantAddress: string;
  address: string;
  amount: number;
  tokenIn: string;
  // these help to identify the contribution but are optional
  inRounds?: string[];
  donationToken?: TokenInfo;
  txHash?: string;
  blockNumber?: number;
};

/***
 * Object for an individual Contribution Detail View
 *
 * @type ContributionDetail
 * @field {grantId} grant id in the registry to which the contribution was made
 * @field {grantAddress} grants payee address
 * @field {grantName} name of the grant the contribution is associated with
 * @field {amount} contribution amount
 * --- optional ---
 * @field {inRounds} rounds that the contributions counts towards
 * @field {txHash} contributions transaction hash
 * @field {blockNumber} blockNumber that mined the transaction
 */
export type ContributionDetail = {
  grantId: number;
  grantAddress: string;
  grantName: string;
  grantLogoURI?: string;
  address: string;
  amount: number;
  tokenIn: string;
  // these help to identify the contribution but are optional
  inRounds?: string[];
  roundName?: string;
  txHash?: string;
  blockNumber?: number;
};

/**
 * Object for an individual Contribution as supplied by the subgraph
 *
 * @type ContributionSubgraph
 * @field {grantId} grant id in the registry to which the contribution was made
 * @field {tokenIn} the token in which the contribution was made
 * @field {donationAmount} the amount being contributed
 * @field {from} address which made the contribution
 * @field {hash} the events tx hash
 * @field {rounds} in which rounds this contribution is to be part of
 * @field {lastUpdatedBlockNumber} the blockNumber on which this entity was lastUpdated
 */
type ContributionSubgraph = {
  grantId: string;
  tokenIn: string;
  donationAmount: string;
  from: string;
  hash: string;
  rounds: string[];
  lastUpdatedBlockNumber: number;
};

/**
 * The new match amount for a grant if it were to recieve an anon contribution
 * of value predicted_amount
 *
 * @type CLRPrediction
 * @field {predictionPoint} if grant were to recieve an anon contribution
 * @field {predictedGrantMatch} new match after adding predicted_amount
 * @field {predictionDiff} difference between predicted_match and predicted_amount
 */
export type CLRPrediction = {
  predictionPoint: number;
  predictedGrantMatch: number;
  predictionDiff: number;
};

/**
 * Object containing an array of CLRPredictions
 *
 * @type GrantPrediction
 * @field {grantId} grant identifier
 * @field {grantRound} grant round address
 * @field {[GrantPrediction]} list of GrantPrediction
 */
export type GrantPrediction = {
  grantId: number;
  grantRound: string;
  predictions: CLRPrediction[];
};

/**
 * Details of a grant in a round
 *
 * @type GrantsRoundDetails
 * @field {address} GrantRound address
 * @field {metaPtr} GrantRound metaPointer
 * @field {name} GrantRound Name
 * @field {matchingToken} GrantRounds matchingToken
 * @field {donationToken} GrantRound donationToken
 * @field {matching} This grants matching amount in this grantRound
 * @field {prediction10} CLR prediction for 10(donationTokens)
 * @field {prediction100} CLR prediction for 100(donationTokens)
 * @field {contributions} Contributions for this grant in this round
 * @field {balance} The total amount contributed
 */
export type GrantsRoundDetails = {
  address: string;
  metaPtr: MetaPtr;
  name: string;
  matchingToken: TokenInfo;
  donationToken: TokenInfo;
  contributions: Contribution[];
  matching: string;
  prediction10: string;
  prediction100: string;
  balance: string;
};

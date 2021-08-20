import { parseUnits } from 'ethers/lib/utils';
import {
  MerkleDistributorInfo,
  NewFormat,
  parseBalanceMap,
} from '@dgrants/utils/src/merkle-distributor/parse-balance-map';
import { PayoutMatch } from '../types';

export type { MerkleDistributorInfo };

/**
 * Generates hash of the GrantsDistribution distribution
 * @param distribution - PayoutMatch[]
 * @param matchingTokenDecimals - The number of decimals used by the distributed token
 * @returns {MerkleDistributorInfo} - merkle tree of the distribution
 * https://github.com/Uniswap/merkle-distributor
 */
export const generateMerkle = (distribution: PayoutMatch[], matchingTokenDecimals: number) => {
  // collect the input
  const merkleInput: NewFormat[] = [];

  // foreach payout parse the earnings
  distribution.forEach((payoutMatch: PayoutMatch) => {
    merkleInput.push({
      address: payoutMatch.address,
      earnings: parseUnits(payoutMatch.match.toString(), matchingTokenDecimals).toHexString(),
      reasons: '',
    });
  });

  // parse and return the tree
  return parseBalanceMap(merkleInput) as MerkleDistributorInfo;
};

/**
 * Generates hash of the GrantsDistribution distribution
 * @param distribution - PayoutMatch[]
 * @param matchingTokenDecimals - The number of decimals used by the distributed token
 * @returns {string} - merkle root hash of the distribution
 * https://github.com/Uniswap/merkle-distributor
 */
export const generateMerkleRoot = (distribution: PayoutMatch[], matchingTokenDecimals: number): string => {
  // get the merkleTree
  const merkleDistributorInfo: MerkleDistributorInfo = generateMerkle(distribution, matchingTokenDecimals);

  // return merkleRoot
  return merkleDistributorInfo.merkleRoot;
};

/**
 * Generates merkle and outputs the proof of the GrantsDistribution distribution
 * @param address - address to find in the distribution
 * @param distribution - PayoutMatch[]
 * @param matchingTokenDecimals - The number of decimals used by the distributed token
 * @returns {string[]} - merkle proof for the provided address
 * https://github.com/Uniswap/merkle-distributor
 */
export const generateMerkleProof = (
  address: string,
  distribution: PayoutMatch[],
  matchingTokenDecimals: number
): string[] => {
  // get the merkleTree
  const merkleDistributorInfo: MerkleDistributorInfo = generateMerkle(distribution, matchingTokenDecimals);

  // return proof for address
  return merkleDistributorInfo.claims[address].proof;
};

/**
 * Gets a proof from the provided merkle tree
 * @param merkleDistributorInfo - MerkleDistributorInfo
 * @returns {string} - merkle root hash of the distribution
 * https://github.com/Uniswap/merkle-distributor
 */
export const getMerkleRoot = (merkleDistributorInfo: MerkleDistributorInfo | undefined): string => {
  // when merkleDistributorInfo is provided
  if (merkleDistributorInfo) {
    // return root of the merkle
    return merkleDistributorInfo.merkleRoot;
  } else {
    return '';
  }
};

/**
 * Gets a proof from the provided merkle tree
 * @param address - address to find in the claims
 * @param merkleDistributorInfo - MerkleDistributorInfo
 * @returns {string[]} - merkle proof for the provided address
 * https://github.com/Uniswap/merkle-distributor
 */
export const getMerkleProof = (address: string, merkleDistributorInfo: MerkleDistributorInfo | undefined): string[] => {
  // when merkleDistributorInfo is provided
  if (merkleDistributorInfo) {
    // return proof for address
    return merkleDistributorInfo.claims[address].proof;
  } else {
    return [];
  }
};

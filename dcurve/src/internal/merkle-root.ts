import {
  MerkleDistributorInfo,
  NewFormat,
  parseBalanceMap,
} from '../../../utils/src/merkle-distributor/parse-balance-map';
import { GrantMatch } from 'src/types';

/**
 * Generates hash of the GrantsDistribution distribution
 * @param distribution - GrantMatch[]
 * @returns {string} - merkle root hash of the distribution
 * https://github.com/Uniswap/merkle-distributor
 */
export const generateMerkleRoot = (distribution: GrantMatch[]): string => {
  const merkleInput: NewFormat[] = [];

  distribution.forEach((grantMatch: GrantMatch) => {
    merkleInput.push({
      address: grantMatch.address,
      earnings: `0x${grantMatch.match.toString(16)}`,
      reasons: '',
    });
  });

  const merkleDistributorInfo: MerkleDistributorInfo = parseBalanceMap(merkleInput);

  return merkleDistributorInfo.merkleRoot;
};

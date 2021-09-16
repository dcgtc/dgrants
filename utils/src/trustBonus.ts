import { ipfs } from '@dgrants/app/src/utils/data/ipfs';
import { TrustBonusScore } from '@dgrants/dcurve/src/types';
import { Status } from '../types';

type TrustBonusScoreAPI = {
  data: TrustBonusScore[];
  status: Status;
};

/**
 * @notice fetches the trust bonus score for a list of addresses
 * from the gitcoin trust-bonus API
 *
 * @param address
 * @param defaultScore
 * @returns
 */
export const fetchTrustBonusScore = async (addresses: string[]): Promise<TrustBonusScoreAPI> => {
  const status: Status = {
    ok: true,
    message: '',
  };

  const result: TrustBonusScoreAPI = {
    status: status,
    data: [],
  };

  if (addresses.length == 0) return result;

  const url = `https://gitcoin.co/grants/v1/api/trust-bonus?addresses=${addresses.join(',')}`;

  try {
    const response = await fetch(url);
    const trustBonusScores = await response.json();
    result.data = trustBonusScores;
    return result;
  } catch (err) {
    result.status.message = `fetchTrustBonusScore: ${err}`;
    return result;
  }
};

/**
 * @notice util function which upload trust bonus metadata to IPFS
 * and return a CID which can be used to verify the distribution.
 *
 * @param obj
 * @param obj.address Contributors Address
 * @param obj.trustBonusScore Description of grant
 * @returns CID
 */
export const uploadTrustBonusScores = async (trustBonusScores: TrustBonusScore[]) => {
  const res = await ipfs.add(JSON.stringify(trustBonusScores));
  return res.cid;
};

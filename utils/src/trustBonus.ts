import { fetchJson } from '@ethersproject/web';
import { TrustBonusScore } from '@dgrants/types';
import { Status } from '../types';
import { createIpfs } from './ipfs';

type TrustBonusScoreAPI = {
  data: TrustBonusScore[];
  status: Status;
};

// Some hacky config so this can be used in both node and the browser
let FLEEK_STORAGE_API_KEY: string;
if (typeof process !== 'object') {
  // in browser
  FLEEK_STORAGE_API_KEY = (process as { env: any }).env.FLEEK_STORAGE_API_KEY as string;
} else {
  // in node, use process.env format
  require('dotenv').config();
  if (!process.env.FLEEK_STORAGE_API_KEY) throw new Error('Please set the FLEEK_STORAGE_API_KEY environment variable');
  FLEEK_STORAGE_API_KEY = process.env.FLEEK_STORAGE_API_KEY as string;
}
const ipfs = createIpfs(FLEEK_STORAGE_API_KEY);

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

  // filter any falseys before making the fetch to prevent [undefined] returning a 400: Bad Request
  if (addresses.filter((v) => v).length == 0) return result;

  const url = `https://gitcoin.co/grants/v1/api/trust-bonus?addresses=${addresses.join(',')}`;

  try {
    const response = await fetchJson(url);
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

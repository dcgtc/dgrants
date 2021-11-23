import { GrantRound } from "@dgrants/contracts";
import { Grant } from "@dgrants/types";
import { GRANT_REGISTRY_ADDRESS, GRANT_ROUND_MANAGER_ADDRESS, SUPPORTED_TOKENS_MAPPING } from "src/utils/chains";
import { getContributions } from "src/utils/data/contributions";
import { getAllGrantRounds, getGrantRound } from "src/utils/data/grantRounds";
import { getAllGrants } from "src/utils/data/grants";
import { BigNumber, JsonRpcProvider } from "src/utils/ethers";
import useWalletStore from "./wallet";

const { grantRoundManager } = useWalletStore();

export const average = (arr: any[]) => arr.reduce((a,b) => a + b, 0) / arr.length;

function getSummary(times: any[]) {

  let fetchCodeTimes: any[] = [];
  let fetchAllGrantAndGrantRoundsTimes: any[] = [];
  let fetchContributionsTimes: any[] = [];
  let fetchGrantRoundTimes: any[] = [];
  let fetchLastBlockNumberTimes: any[] = [];


  times.map((time: any) => {
    fetchCodeTimes.push(time.fetchCodeTime);
    fetchAllGrantAndGrantRoundsTimes.push(time.fetchAllGrantAndGrantRoundsTime);
    fetchContributionsTimes.push(time.fetchContributionsTime);
    fetchGrantRoundTimes.push(time.fetchGrantRoundTime);
    fetchLastBlockNumberTimes.push(time.fetchLastBlockNumberTime);
  });


  let avg_summary = {
    'fetchCodeTimeAvg': average(fetchCodeTimes),
    'fetchAllGrantAndGrantRoundsTimeAvg': average(fetchAllGrantAndGrantRoundsTimes),
    'fetchContributionsTimeAvg': average(fetchContributionsTimes),
    'fetchGrantRoundTimesAvg': average(fetchGrantRoundTimes),
    'fetchLastBlockNumberTimesAvg': average(fetchLastBlockNumberTimes),
  } 

  let fastest_summary = {
    'fetchCodeTimeAvg': Math.min(...fetchCodeTimes),
    'fetchAllGrantAndGrantRoundsTimeAvg':  Math.min(...fetchAllGrantAndGrantRoundsTimes),
    'fetchContributionsTimeAvg':  Math.min(...fetchContributionsTimes),
    'fetchGrantRoundTimesAvg':  Math.min(...fetchGrantRoundTimes),
    'fetchLastBlockNumberTimesAvg':  Math.min(...fetchLastBlockNumberTimes),
  } 
  

  let slowest_summary = {
    'fetchCodeTimeAvg': Math.max(...fetchCodeTimes),
    'fetchAllGrantAndGrantRoundsTimeAvg':  Math.max(...fetchAllGrantAndGrantRoundsTimes),
    'fetchContributionsTimeAvg':  Math.max(...fetchContributionsTimes),
    'fetchGrantRoundTimesAvg':  Math.max(...fetchGrantRoundTimes),
    'fetchLastBlockNumberTimesAvg':  Math.max(...fetchLastBlockNumberTimes),
  } 

  return {
    'slowest': slowest_summary,
    'fastest': fastest_summary,
    'avg': avg_summary
  }
}


async function stressTest(func: Function, count: number) {
  let times = []

  for(let i = 0 ; i < count; i++) {
    const time = await func();
    times.push(time);
  }

  return getSummary(times);

}



async function fetchFromRPC(RPC_URL: string) {
    
  const PROVIDER = new JsonRpcProvider(RPC_URL);

  const time: any = {};
  let startTime, endTime;
  
  // 1. Fetch registry and manager code
  startTime = performance.now()
  const [isGrantRegistryDeployed, isGrantRoundManagerDeployed] = await Promise.all([
    (await PROVIDER.getCode(GRANT_REGISTRY_ADDRESS)) !== '0x',
    (await PROVIDER.getCode(GRANT_ROUND_MANAGER_ADDRESS)) !== '0x',
  ]);
  endTime = performance.now()

  time['fetchCodeTime'] = endTime - startTime;

          
  // 2. fetch block number
  startTime = performance.now()
  const lastBlockNumber = BigNumber.from(await PROVIDER.getBlockNumber()).toNumber();
  endTime = performance.now()
  time['fetchLastBlockNumberTime'] = endTime - startTime;


  // 3. FETCH Get all grants and round data held in the registry/roundManager
  startTime = performance.now()
  const [grantsData, grantRoundData, grantRoundDonationTokenAddress] = await Promise.all([
    getAllGrants(true),
    getAllGrantRounds(true),
    grantRoundManager.value.donationToken(),
  ]);
  endTime = performance.now()
  time['fetchAllGrantAndGrantRoundsTime'] = endTime - startTime;

      
  // 4. FETCH Grant Round
  const grantsList = grantsData.grants || [];
  const grantPayees = grantsList.reduce((grants: Record<string, string>, grant: Grant, key: number) => {
    grants[key.toString()] = grant.payee;
    return grants;
  }, {});
          
  startTime = performance.now()
  const roundAddresses = grantRoundData.roundAddresses || [];
  const grantRoundsList = (
    await Promise.all(
      roundAddresses.map(async (grantRoundAddress: string) => {
        const data = await getGrantRound(lastBlockNumber, grantRoundAddress, true);
        return data?.grantRound;
      })
    )
  ).filter((grantRound) => grantRound) as GrantRound[];
  endTime = performance.now()
  time['fetchGrantRoundTime'] = endTime - startTime;

  
  // 5. FETCH contributions
  startTime = performance.now()
  const contributions = await getContributions(
    lastBlockNumber,
    grantPayees,
    SUPPORTED_TOKENS_MAPPING[grantRoundDonationTokenAddress],
    true
  )
  endTime = performance.now()
  time['fetchContributionsTime'] = endTime - startTime;
  
  return time;
}


export async function initStress(url: string, stressCount: number) {

  const summary = await stressTest(
    async function() { return fetchFromRPC(url) },
    stressCount
  )

  console.log("rpc", url);
  console.log("summary" , summary);

  return summary;
};

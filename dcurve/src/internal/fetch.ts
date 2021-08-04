'use strict'

/**
 * Fetches grant round information from chain
 * @param roundId
 */
 const fetchGrantRound = (roundId: string) => {
}


/**
 * Fetches all contributions from a set of grants between start and end date from chain
 *
 * @param grantIds array of grantids for which the contribution needs to be fetched
 * @param startDate contributions made after this date
 * @param endDate contributions made before this date. default: current timestamp
 */
const fetchContributions = (grantIds: [string], startDate: Date, endDate?: Date, registry?: string) => {

}


/**
 * returns an array of GrantConstributions[] + which grantId
 * @param predicted_amount
 */
 export const fetch = (grantRound:number, registry:string) => {
  // 1. fetchGrantRound
  // 2. fetchContributions
  // 3. optional -> add new predicted_amount contribution to grant

  // Example Output
  // {
  //   roundId: 1,
  //   fundAmount: 2000,
  //   contributions: [
  //       {grantId: 2, address: '0x0...', contribution_amount: 100}
  //   ]
  // }
}
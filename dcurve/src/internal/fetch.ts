'use strict'

import { GrantRoundContributions, GrantRoundFetchArgs } from "src/types";

/**
 * Fetches grant round information from chain
 * @param roundId
 */
 const fetchGrantRound = (roundId: string) => {
}


/**
 * Fetches all contributions from a set of grants between start and end date for a grantRound 
 *
 * @param roundId grant round
 * @param startDate contributions made after this date
 * @param endDate contributions made before this date. default: current timestamp
 */
const fetchContributions = (roundId: string, startDate: Date, endDate?: Date): Contribution => {
}


/**
 * Returns an array of GrantRoundContributions
 * @param {GrantRoundFetchArgs}
 */
 export const fetch = (args: GrantRoundFetchArgs): GrantRoundContributions => {
  // 1. fetchGrantRound
  
  // 2. fetchContributions
  const contributions = fetchContributions();

  // 3. Ignore contributions - CAN BE DONE LATER

  const output: GrantRoundContributions  = {
    grantRound: args.grantRound,
    matchingAmount: 0, // TODO: UPDATE
    contributions : contributions // TODO: UPDATE
  }

  return output;
}
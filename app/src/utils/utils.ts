/**
 * @notice Various helper methods and formatters to help display data in the UI nicely
 */
import router from 'src/router/index';
import { RouteLocationRaw } from 'vue-router';
import { BigNumber, BigNumberish, commify, Contract, ContractTransaction, isAddress } from 'src/utils/ethers';
import { GrantRound, EtherscanGroup } from '@dgrants/types';

// --- Formatters ---
// Returns an address with the following format: 0x1234…abcd
export function formatAddress(address: string) {
  if (!address || address.length !== 42) return null;
  return `${address.slice(0, 6)}…${address.slice(38)}`;
}

// Is the given val defined?
export function isDefined(val: unknown) {
  return !!val;
}

// Formats a number for display to the user, by rounding to the specified number of decimals and adding commas
export function formatNumber(value: BigNumberish, decimals: number): string {
  // `BigNumber.from()` can't take decimal inputs
  value = typeof value === 'number' || typeof value === 'string' ? Number(value) : BigNumber.from(value);
  return commify(parseFloat(String(value)).toFixed(decimals));
}

// Expects a unix timestamp and will return a human readable message of how far in the past/future it is
export function daysAgo(val = 0) {
  // Use a formatter to establish "in 10 days" vs "10 days ago"
  const formatter = new Intl.RelativeTimeFormat();
  // Number of days since now
  const deltaDays = (val * 1000 - Date.now()) / (1000 * 3600 * 24);

  // Format "days ago" as string
  return formatter.format(Math.round(deltaDays), 'days');
}

// Convert a unix ts to a toLocaleString
export function unixToLocaleString(time: BigNumberish) {
  return new Date(BigNumber.from(time).toNumber() * 1000).toLocaleString();
}

// Normalize twitter handle
export function urlFromTwitterHandle(handle: string) {
  const twitterHandle = handle.includes('@') ? handle.substring(1) : handle;
  return 'https://twitter.com/' + twitterHandle;
}

// Clean twitter url and return the handle
export function cleanTwitterUrl(url: string | undefined) {
  return url ? url.replace('https://twitter.com/', '') : undefined;
}

// --- Validation ---
// Returns true if the provided URL is a valid URL
export function isValidUrl(val: string) {
  // TODO more robust URL validation
  return (val.includes('http') || val.includes('https')) && val.includes('://') && val.includes('.');
}

// Returns true if the provided website is a valid option
export function isValidWebsite(val: string | undefined) {
  return val ? isValidUrl(val) : true;
}

// Returns true if the provided URL is a valid Github URL
export function isValidGithub(val: string | undefined) {
  return val ? val.includes('://github.com/') : true;
}

// Returns true if the provided twitter handle is valid
export function isValidTwitter(val: string | undefined) {
  if (!val) return true;
  const handle = val.includes('@') ? val.substring(1) : val;
  return /^[a-zA-Z0-9_]{1,15}$/.test(handle);
}

// Returns true if the provided address is valid (TODO support ENS)
export function isValidAddress(val: string | undefined) {
  return val && isAddress(val);
}

// --- Tokens ---
// Check for approved allowance
export async function checkAllowance(token: Contract, ownerAddress: string | undefined, spenderAddress: string) {
  // return the balance held for userAddress
  return ownerAddress ? await token.allowance(ownerAddress, spenderAddress) : 0;
}

// Get approval for the round contract to spend the amount on behalf of the user
export async function getApproval(token: Contract, address: string, amount: BigNumberish) {
  // get approval
  const tx: ContractTransaction = await token.approve(address, amount);
  // wait for approval to go through
  await tx.wait();
}

// --- Other ---
// Check against the grantRounds status for a match
export function hasStatus(status: string) {
  // returns a fn (currying the given status)
  return (round: GrantRound) => round.status === status;
}

// Navigates to the specified page and pushes a new entry into the history stack
export async function pushRoute(to: RouteLocationRaw) {
  await router.push(to);
}

// Generates the Etherscan URL based on the given `hash`, `chainId` and `group`
export function getEtherscanUrl(hash: string, chainId: number, group: EtherscanGroup = 'tx') {
  // Only mainnet is supported, but we include chain ID 31337 for local testing against Hardhat
  let networkPrefix = '';
  if (chainId === 1) networkPrefix = 'etherscan.io';
  else if (chainId === 31337) networkPrefix = 'etherscan.io';
  // else throw new Error(`Could not generate Etherscan URL: Invalid chain ID ${chainId}`);
  return `https://${networkPrefix}/${group}/${hash}`;
}

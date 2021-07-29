/**
 * @notice Various helper methods and formatters to help display data in the UI nicely
 */
import router from 'src/router/index';
import { RouteLocationRaw } from 'vue-router';
import { isAddress } from 'src/utils/ethers';

// Returns an address with the following format: 0x1234...abcd
export function formatAddress(address: string) {
  if (address.length !== 42) return null;
  return `${address.slice(0, 6)}...${address.slice(38)}`;
}

// Navigates to the specified page and pushes a new entry into the history stack
export async function pushRoute(to: RouteLocationRaw) {
  await router.push(to);
}

// Returns true if the provided URL is a valid URL
export function isValidUrl(val: string | undefined) {
  return val && val.includes('://'); // TODO more robust URL validation
}

// Returns true if the provided address is valid (TODO support ENS)
export function isValidAddress(val: string | undefined) {
  return val && isAddress(val);
}

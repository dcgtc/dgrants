/**
 * @notice Various helper methods and formatters to help display data in the UI nicely
 */
import router from 'src/router/index';

// Returns an address with the following format: 0x1234...abcd
export function formatAddress(address: string) {
  if (address.length !== 42) return null;
  return `${address.slice(0, 6)}...${address.slice(38)}`;
}

// Navigates to the page named `name` and pushes a new entry into the history stack
export async function pushRoute(name: string) {
  await router.push({ name });
}

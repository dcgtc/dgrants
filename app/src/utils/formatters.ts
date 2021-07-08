/**
 * @notice Various formatters to help display data in the UI nicely
 */

// Returns an address with the following format: 0x1234...abcd
export function formatAddress(address: string) {
  if (address.length !== 42) return null;
  return `${address.slice(0, 6)}...${address.slice(38)}`;
}

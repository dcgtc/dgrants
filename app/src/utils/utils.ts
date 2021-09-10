/**
 * @notice Various helper methods and formatters to help display data in the UI nicely
 */
import router from 'src/router/index';
import { RouteLocationRaw } from 'vue-router';
import { BigNumber, BigNumberish, commify, Contract, ContractTransaction, isAddress } from 'src/utils/ethers';
import { EtherscanGroup } from 'src/types';
import useWalletStore from 'src/store/wallet';
import { GrantRound } from '@dgrants/types';
import { formatUnits } from 'src/utils/ethers';
import { ETH_ADDRESS } from 'src/utils/constants';
import { ETHERSCAN_BASE_URL, SUPPORTED_TOKENS_MAPPING, WETH_ADDRESS } from 'src/utils/chains';

// --- Formatters ---
// Returns an address with the following format: 0x1234…abcd
export function formatAddress(address: string) {
  if (!address || address.length !== 42) return '';
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
  // Return value with minimum number of decimals shown, e.g. return '123' if input is 123.00
  return commify(parseFloat(Number(value).toFixed(decimals)));
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

// Returns true if the provided address is valid (TODO support ENS)
export function isValidAddress(val: string | undefined) {
  return val && isAddress(val);
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

// Returns true if the provided logo is valid
export async function isValidLogo(file: File | undefined) {
  if (!file) return true;
  if (file.size > 200000) return false;
  if (!(file.type.includes('image/png') || file.type.includes('image/svg'))) return false;

  const dimensions = await new Promise<{ width: number; height: number }>((resolve) => {
    const img = new Image();
    img.src = window.URL.createObjectURL(file);
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
    };
  });

  return dimensions.width === 1920 && dimensions.height === 1080;
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
export function getEtherscanUrl(hash: string, group: EtherscanGroup = 'tx') {
  return `${ETHERSCAN_BASE_URL}/${group}/${hash}`;
}

/**
 * @notice Throws an error if the user does not have sufficient balance for the specified token
 * @param tokenAddress Address of the token to check
 * @param requiredAmount Amount required as a raw number, e.g. 5e18 if the user needs 5 DAI
 * @returns True if the user has sufficient balance, or throws otherwise
 */
export async function assertSufficientBalance(tokenAddress: string, requiredAmount: BigNumberish): Promise<boolean> {
  const { provider, userAddress } = useWalletStore();
  if (!userAddress.value) return true; // exit early, don't want any errors thrown
  const isEth = tokenAddress === WETH_ADDRESS;
  tokenAddress = isEth ? ETH_ADDRESS : tokenAddress;
  const abi = ['function balanceOf(address) view returns (uint256)'];
  const token = new Contract(tokenAddress, abi, provider.value);
  const balance = isEth ? await provider.value.getBalance(userAddress.value) : await token.balanceOf(userAddress.value);
  if (balance.lt(requiredAmount)) {
    const tokenInfo = SUPPORTED_TOKENS_MAPPING[tokenAddress];
    const { symbol, decimals } = tokenInfo;
    const balanceNeeds = formatNumber(formatUnits(requiredAmount, decimals), 4);
    const balanceHas = formatNumber(formatUnits(balance, decimals), 4);
    throw new Error(
      `Insufficient ${symbol} balance: Current cart requires ${balanceNeeds} ${symbol}, but you only have ${balanceHas} ${symbol}`
    );
  }
  return true;
}

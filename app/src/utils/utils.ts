/**
 * @notice Various helper methods and formatters to help display data in the UI nicely
 */
import router from 'src/router/index';
import { RouteLocationRaw } from 'vue-router';
import { BigNumber, BigNumberish, Contract, ContractTransaction, isAddress } from 'src/utils/ethers';
import { CartItem, CartItemOptions } from 'src/types';
import { Donation, Grant, GrantRound, SwapSummary } from '@dgrants/types';

// --- Formatters ---
// Returns an address with the following format: 0x1234...abcd
export function formatAddress(address: string) {
  if (!address || address.length !== 42) return null;
  return `${address.slice(0, 6)}...${address.slice(38)}`;
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

// convert a unix ts to a toLocaleString
export function unixToLocaleString(time: BigNumberish) {
  return new Date(BigNumber.from(time).toNumber() * 1000).toLocaleString();
}

// --- Validation ---
// Returns true if the provided URL is a valid URL
export function isValidUrl(val: string | undefined) {
  return val && val.includes('://'); // TODO more robust URL validation
}

// Returns true if the provided address is valid (TODO support ENS)
export function isValidAddress(val: string | undefined) {
  return val && isAddress(val);
}

// --- Grants + Cart ---
const CART_KEY = 'cart';
const DEFAULT_CONTRIBUTION_TOKEN_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // DAI
const DEFAULT_CONTRIBUTION_AMOUNT = 5; // this is converted to a parsed BigNumber at checkout

// Loads cart data
export function loadCart(): CartItemOptions[] {
  // Return empty array if nothing found
  const rawCart = localStorage.getItem(CART_KEY);
  if (!rawCart) return [];

  // Parse the data. If the data is an array, return it,
  const cart = JSON.parse(rawCart);
  if (Array.isArray(cart)) return cart;

  // Otherwise clear the localStorage key and return empty array
  localStorage.removeItem(CART_KEY);
  return [];
}

// Adds a grant to the cart
export function addToCart(grant: Grant | null | undefined): CartItemOptions[] {
  if (!grant) return []; // null and undefined input types are to avoid lint errors when calling this from a template
  // If this grant is already in the cart, do nothing
  const cart = loadCart();
  if (cart.map((grant) => grant.grantId).includes(grant.id.toString())) return cart;

  // Otherwise, add it to the cart and update localStorage
  cart.push({
    grantId: grant.id.toString(),
    contributionTokenAddress: DEFAULT_CONTRIBUTION_TOKEN_ADDRESS,
    contributionAmount: DEFAULT_CONTRIBUTION_AMOUNT,
  });
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  return cart;
}

// Removes a grant from the cart
export function removeFromCart(grantId: BigNumberish): CartItemOptions[] {
  const cart = loadCart();
  const newCart = cart.filter((grant) => grant.grantId !== BigNumber.from(grantId).toString());
  localStorage.setItem(CART_KEY, JSON.stringify(newCart));
  return newCart;
}

// Clears the cart
export function clearCart(): CartItemOptions[] {
  localStorage.removeItem(CART_KEY);
  return [];
}

// Sets the full cart
export function setCart(cart: CartItemOptions[]) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
}

// Check against the grantRounds status for a match
export function hasStatus(status: string) {
  // returns a fn (currying the given status)
  return (round: GrantRound) => round.status === status;
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
// Takes an array of cart items and returns inputs needed for the GrantRoundManager.donate() method
export function formatDonateInputs(cart: CartItem[]): { swaps: SwapSummary[]; donations: Donation[] } {
  const swaps: SwapSummary[] = [];
  const donations: Donation[] = [];

  for (const item of cart) {
    // TODO use helper methods from @dgrants/utils
    item;
  }

  return { swaps, donations };
}

// Navigates to the specified page and pushes a new entry into the history stack
export async function pushRoute(to: RouteLocationRaw) {
  await router.push(to);
}

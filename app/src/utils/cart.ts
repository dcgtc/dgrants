import { BigNumber, BigNumberish } from 'src/utils/ethers';
import { Donation, Grant, SwapSummary } from '@dgrants/types';
import { CartItem, CartItemOptions } from 'src/types';
import { SUPPORTED_TOKENS_MAPPING } from 'src/utils/constants';

const CART_KEY = 'cart';
const DEFAULT_CONTRIBUTION_TOKEN_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // DAI
const DEFAULT_CONTRIBUTION_AMOUNT = 5; // this is converted to a parsed BigNumber at checkout

// --- Modifying cart ---
export function loadCart(): CartItemOptions[] {
  try {
    // Return empty array if nothing found
    const rawCart = localStorage.getItem(CART_KEY);
    if (!rawCart) return [];

    // Parse the data. If the data is an array, return it,
    const cart = JSON.parse(rawCart);
    if (Array.isArray(cart)) return cart;

    // Otherwise clear the localStorage key and return empty array
    localStorage.removeItem(CART_KEY);
    return [];
  } catch (e) {
    console.warn('Could not read any existing cart data from localStorage. Defaulting to empty cart');
    return [];
  }
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

// --- Parsing cart data ---
// Convert a cart into an array of objects summarizing the cart info, with human-readable values
export function getCartSummary(cart: CartItem[]): Record<keyof typeof SUPPORTED_TOKENS_MAPPING, number> {
  const output: Record<keyof typeof SUPPORTED_TOKENS_MAPPING, number> = {};
  for (const item of cart) {
    const tokenAddress = item.contributionToken.address;
    if (tokenAddress in output) output[tokenAddress] += item.contributionAmount;
    else output[tokenAddress] = item.contributionAmount;
  }
  return output;
}

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

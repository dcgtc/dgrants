/**
 * @dev Manages the user's cart and ensures the cart store stays in sync with localStorage. The way
 * this is handled is that all cart management methods do any pre-processing required, then complete
 * with a call to `setCart()` which manages the synchronization
 */

// --- Imports ---
import { computed, ref } from 'vue';
import { Donation, Grant, SwapSummary } from '@dgrants/types';
import { CartItem, CartItemOptions } from 'src/types';
import { SUPPORTED_TOKENS_MAPPING, WAD } from 'src/utils/constants';
import { BigNumber, BigNumberish, hexDataSlice, isAddress, parseUnits } from 'src/utils/ethers';
import useDataStore from 'src/store/data';

// --- Constants and helpers ---
const CART_KEY = 'cart';
const DEFAULT_CONTRIBUTION_TOKEN_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // DAI
const DEFAULT_CONTRIBUTION_AMOUNT = 5; // this is converted to a parsed BigNumber at checkout
const EMPTY_CART: CartItemOptions[] = []; // and empty cart is identified by an empty array

const { grants, grantRounds } = useDataStore();
const toString = (val: BigNumberish) => BigNumber.from(val).toString();
const toHex = (val: BigNumberish) => BigNumber.from(val).toHexString();

// --- State ---
const lsCart = ref<CartItemOptions[]>([]); // localStorage cart
const cart = ref<CartItem[]>([]);

// --- Composition function for state management ---
export default function useCartStore() {
  // --- Cart management ---
  /**
   * @notice Initialize the store based on localStorage
   * @dev MUST be called on app load
   */
  function initializeCart() {
    try {
      // Set empty array if nothing found
      const rawCart = localStorage.getItem(CART_KEY);
      if (!rawCart) {
        setCart(EMPTY_CART);
        return;
      }

      // Parse the data. If the data is an array, set the cart with that array data
      const cart = JSON.parse(rawCart);
      if (Array.isArray(cart)) {
        setCart(cart);
        return;
      }

      // Otherwise, something is wrong with the localStorage key, so clear it and set cart to an empty array
      setCart(EMPTY_CART);
    } catch (e) {
      console.warn('Could not read any existing cart data from localStorage. Defaulting to empty cart');
      setCart(EMPTY_CART);
    }
  }

  /**
   * @notice Update the cart store with the provided `newCart`
   * @dev Regardless if input type, the most recent grant data will be fetched from the data store for all grants
   * to fully repopulate the cart with up-to-date data
   * @dev This method is not exposed as you should never directly set the cart
   * @param newCart Full cart to update state with
   */
  function setCart(newCart: CartItemOptions[] | CartItem[]) {
    // Save empty chart
    if (!newCart || newCart.length === 0) {
      localStorage.setItem(CART_KEY, JSON.stringify(EMPTY_CART));
      cart.value = EMPTY_CART as unknown as CartItem[]; // even though this is an empty array, TS complains about type mismatch without casting
      lsCart.value = EMPTY_CART;
      return;
    }

    // Generate full cart data
    const _lsCart: CartItemOptions[] = [];
    const _cart: CartItem[] = [];
    newCart.forEach((item) => {
      const { grantId, contributionAmount } = item;
      const grant = grants.value?.filter((grant) => grant.id.toString() === grantId)[0] as Grant; // TODO may be slow for large numbers of grants
      const tokenAddr = 'contributionToken' in item ? item.contributionToken.address : item.contributionTokenAddress;
      const token = SUPPORTED_TOKENS_MAPPING[tokenAddr];
      _lsCart.push({ grantId, contributionTokenAddress: token.address, contributionAmount });
      _cart.push({ ...grant, grantId, contributionAmount, contributionToken: token });
    });

    // Save off the cart
    localStorage.setItem(CART_KEY, JSON.stringify(_lsCart));
    lsCart.value = _lsCart;
    cart.value = _cart;
  }

  /**
   * @notice Updates the amount or token of an item in the cart
   * @dev Used to keep localStorage in sync with store when the `cart` ref is modified directly via v-model in Cart.vue
   * @dev NOTE: You MUST call this when directly modifying the `cart` ref via v-model
   * @param grantId Grant ID to update
   * @param data A token address to update the token, or a number to update the amount
   */
  function updateCart(grantId: BigNumberish, data: BigNumberish) {
    // Get index of the grant to replace
    const _lsCart = lsCart.value;
    const index = _lsCart.findIndex((item) => item.grantId === toString(grantId));

    // Handle token address update
    if (isAddress(toHex(data))) {
      _lsCart[index] = { ..._lsCart[index], contributionTokenAddress: toHex(data) };
      setCart(_lsCart);
      return;
    }

    // Handle amount update
    const amount = BigNumber.from(data).toNumber();
    _lsCart[index] = { ..._lsCart[index], contributionAmount: amount };
    setCart(_lsCart);
  }

  /**
   * @notice Adds an item to the cart
   * @param grantId Grant ID to add to the cart
   */
  function addToCart(grantId: BigNumberish | undefined) {
    if (!grantId) return;

    // Do nothing if this item is already in the cart
    const cartGrantIds = cart.value.map((grant) => grant.grantId);
    if (cartGrantIds.includes(toString(grantId))) return;

    // Otherwise, add it to the cart and update localStorage
    const newCart = [
      ...lsCart.value,
      {
        grantId: toString(grantId),
        contributionTokenAddress: DEFAULT_CONTRIBUTION_TOKEN_ADDRESS,
        contributionAmount: DEFAULT_CONTRIBUTION_AMOUNT,
      },
    ];
    setCart(newCart);
  }

  /**
   * @notice Removes a grant from the cart based on it's `grantId`
   * @param grantId Grant ID to remove from the cart
   */
  function removeFromCart(grantId: BigNumberish | undefined) {
    if (!grantId) return;
    setCart(cart.value.filter((grant) => grant.grantId !== toString(grantId)));
  }

  /**
   * @notice Removes all items from the cart
   */
  function clearCart() {
    setCart(EMPTY_CART);
  }

  /**
   * @notice Executes donations
   */
  function checkout() {
    console.log('checking out', cart.value);
    console.log(cartDonationInputs.value);
  }

  // --- Getters ---
  /**
   * @notice Returns true if the provided grantId is in the cart, false otherwise
   * @param grantId Grant ID to check
   */
  function isInCart(grantId: BigNumberish): boolean {
    const grantIds = lsCart.value.map((item) => item.grantId);
    return grantIds.includes(toString(grantId));
  }

  /**
   * @notice Convert a cart into an array of objects summarizing the cart info, with human-readable values
   * @returns Object where keys are token addresses, values are total amount of that token in cart
   */
  const cartSummary = computed((): Record<keyof typeof SUPPORTED_TOKENS_MAPPING, number> => {
    const output: Record<keyof typeof SUPPORTED_TOKENS_MAPPING, number> = {};
    for (const item of cart.value) {
      const tokenAddress = item.contributionToken.address;
      if (tokenAddress in output) output[tokenAddress] += item.contributionAmount;
      else output[tokenAddress] = item.contributionAmount;
    }
    return output;
  });

  /**
   * @notice Takes an array of cart items and returns inputs needed for the GrantRoundManager.donate() method
   */
  const cartDonationInputs = computed((): { swaps: SwapSummary[]; donations: Donation[]; deadline: number } => {
    // Get the swaps array
    const swaps: SwapSummary[] = Object.keys(cartSummary.value).map((tokenAddress) => {
      const decimals = SUPPORTED_TOKENS_MAPPING[tokenAddress].decimals;
      const amountIn = parseUnits(String(cartSummary.value[tokenAddress]), decimals);
      const amountOutMin = '1'; // TODO improve this
      const path = ''; // TODO
      return { amountIn, amountOutMin, path };
    });

    // Get the donations array
    const donations: Donation[] = cart.value.map((item) => {
      // Extract data we already have
      const { grantId, contributionAmount, contributionToken } = item;
      const tokenAddress = contributionToken.address;
      const rounds = grantRounds.value ? [grantRounds.value[0].address] : []; // TODO we're hardcoding the first round for now
      const donationAmount = parseUnits(String(contributionAmount), SUPPORTED_TOKENS_MAPPING[tokenAddress].decimals);

      // Compute ratio
      const swap = swaps.find((swap) => hexDataSlice(swap.path, 0, 20) === tokenAddress);
      if (!swap) throw new Error('Could not find matching swap for donation');
      const ratio = donationAmount.mul(WAD).div(swap.amountIn); // ratio of `token` to donate, specified as numerator where WAD = 1e18 = 100%

      // Return donation object
      return { grantId, token: tokenAddress, ratio, rounds };
    });

    // Return all inputs needed for checkout, using a deadline 20 minutes from now
    const now = new Date().getTime();
    const nowPlus20Minutes = new Date(now + 20 * 60 * 1000).getTime();
    return { swaps, donations, deadline: Math.floor(nowPlus20Minutes / 1000) };
  });

  /**
   * @notice Returns a summary of items in the cart, e.g. "50 DAI" or "20 DAI + 0.5 ETH + 30 GTC"
   */
  const cartSummaryString = computed(() => {
    // returns a string summarizing the `cartSummary`, such as `12 DAI + 4 GTC + 10 USDC`
    const summary = Object.keys(cartSummary.value).reduce((acc, tokenAddr) => {
      return acc + `${cartSummary.value[tokenAddr]} ${SUPPORTED_TOKENS_MAPPING[tokenAddr].symbol} + `;
    }, '');
    return summary.slice(0, -3); // trim the trailing ` + ` from the string
  });

  return {
    // Store
    // WARNING: Be careful -- the `cart` ref is directly exposed so it can be edited by v-model, so just make
    // sure to call `updateCart()` with the appropriate inputs whenever the `cart` ref is modified
    cart,
    // Getters
    cartDonationInputs,
    cartSummary,
    cartSummaryString,
    // Mutations
    addToCart,
    checkout,
    clearCart,
    initializeCart,
    isInCart,
    removeFromCart,
    updateCart,
  };
}

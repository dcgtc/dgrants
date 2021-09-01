/**
 * @dev Manages the user's cart and ensures the cart store stays in sync with localStorage. The way
 * this is handled is that all cart management methods do any pre-processing required, then complete
 * with a call to `setCart()` which manages the synchronization
 */

// --- Imports ---
import { computed, ref } from 'vue';
import { Donation, Grant, SwapSummary } from '@dgrants/types';
import { CartItem, CartItemOptions } from 'src/types';
import {
  ERC20_ABI,
  ETH_ADDRESS,
  GRANT_ROUND_MANAGER_ABI,
  GRANT_ROUND_MANAGER_ADDRESS,
  SUPPORTED_TOKENS_MAPPING,
  WAD,
  WETH_ADDRESS,
} from 'src/utils/constants';
import {
  BigNumber,
  BigNumberish,
  BytesLike,
  Contract,
  ContractTransaction,
  formatUnits,
  hexDataSlice,
  MaxUint256,
  isAddress,
  parseUnits,
  getAddress,
} from 'src/utils/ethers';
import { formatNumber } from 'src/utils/utils';
import useDataStore from 'src/store/data';
import useWalletStore from 'src/store/wallet';

// --- Constants and helpers ---
const CART_KEY = 'cart';
const DEFAULT_CONTRIBUTION_TOKEN_ADDRESS = '0x6B175474E89094C44Da98b954EedeAC495271d0F'; // DAI
const DEFAULT_CONTRIBUTION_AMOUNT = 5; // this is converted to a parsed BigNumber at checkout
const EMPTY_CART: CartItemOptions[] = []; // and empty cart is identified by an empty array
// Hardcoded swap paths based on a input token and swapping to DAI, based on most liquid pairs: https://info.uniswap.org/#/
// TODO replace with more robust swap path logic
const SWAP_PATHS = {
  // ETH to DAI through the 0.3% pool
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb86b175474e89094c44da98b954eedeac495271d0f', // prettier-ignore
  // USDC to DAI through the 0.05% pool
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb480001f46b175474e89094c44da98b954eedeac495271d0f', // prettier-ignore
  // GTC to ETH through 1% pool, ETH to DAI through 0.3% pool
  '0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F': '0xde30da39c46104798bb5aa3fe8b9e0e1f348163f002710c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb86b175474e89094c44da98b954eedeac495271d0f', // prettier-ignore
  // UNI to ETH through 0.3% pool, ETH to DAI through 0.3% pool
  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984': '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb86b175474e89094c44da98b954eedeac495271d0f', // prettier-ignore
  // DAI "swap path" is just its token address for our router
  '0x6B175474E89094C44Da98b954EedeAC495271d0F': '0x6b175474e89094c44da98b954eedeac495271d0f',
};

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
   * @param data A token address to update the token, or a human-readable number to update the amount
   */
  function updateCart(grantId: BigNumberish, data: string | number) {
    // Get index of the grant to replace
    const _lsCart = lsCart.value;
    const index = _lsCart.findIndex((item) => item.grantId === toString(grantId));

    // Handle token address update (type check is because if `data` is a decimal number `toHex` would fail)
    if (typeof data !== 'number' && isAddress(toHex(data))) {
      _lsCart[index] = { ..._lsCart[index], contributionTokenAddress: toHex(data) };
      setCart(_lsCart);
      return;
    }

    // Handle amount update
    const amount = Number(data);
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
  async function checkout(): Promise<ContractTransaction> {
    const { signer, userAddress } = useWalletStore();
    const { swaps, donations, deadline } = await getCartDonationInputs();
    const manager = new Contract(GRANT_ROUND_MANAGER_ADDRESS, GRANT_ROUND_MANAGER_ABI, signer.value);
    const getInputToken = (swap: SwapSummary) => getAddress(hexDataSlice(swap.path, 0, 20));

    // Check all balances
    for (const swap of swaps) {
      await assertSufficientBalance(getInputToken(swap), swap.amountIn);
    }

    // Execute approvals if required
    for (const swap of swaps) {
      const tokenAddress = getInputToken(swap);
      if (tokenAddress === ETH_ADDRESS || tokenAddress === WETH_ADDRESS) continue; // no approvals for ETH, and explicit WETH donation not supported
      const token = new Contract(tokenAddress, ERC20_ABI, signer.value);
      const allowance = <BigNumber>await token.allowance(userAddress.value, manager.address);
      if (allowance.lt(swap.amountIn)) {
        const tx = <ContractTransaction>await token.approve(manager.address, MaxUint256);
        await tx.wait(); // we wait for each approval to be mined to avoid gas estimation complexity
      }
    }

    // Determine if we need to send value with this transaction
    const ethSwap = swaps.find((swap) => getInputToken(swap) === WETH_ADDRESS);
    const value = ethSwap ? ethSwap.amountIn : 0;

    // Execute donation
    return <ContractTransaction>await manager.donate(swaps, deadline, donations, { value });
  }

  /**
   * @notice Takes an array of cart items and returns inputs needed for the GrantRoundManager.donate() method
   */
  async function getCartDonationInputs(): Promise<{ swaps: SwapSummary[]; donations: Donation[]; deadline: number }> {
    // Get the swaps array
    const swapPromises = Object.keys(cartSummary.value).map(async (tokenAddress) => {
      const decimals = SUPPORTED_TOKENS_MAPPING[tokenAddress].decimals;
      const amountIn = parseUnits(String(cartSummary.value[tokenAddress]), decimals);
      const path = SWAP_PATHS[<keyof typeof SWAP_PATHS>tokenAddress];
      // Use Uniswap's Quoter.sol to get amountOutMin, unless the path indicates so swap is required
      const amountOutMin = path.length === 42 ? amountIn : await quoteExactInput(path, amountIn);
      return { amountIn, amountOutMin, path };
    });
    const swaps = <SwapSummary[]>await Promise.all(swapPromises);

    // Get the donations array
    const donations: Donation[] = cart.value.map((item) => {
      // Extract data we already have
      const { grantId, contributionAmount, contributionToken } = item;
      const isEth = contributionToken.address === ETH_ADDRESS;
      const tokenAddress = isEth ? WETH_ADDRESS : contributionToken.address;
      const rounds = grantRounds.value ? [grantRounds.value[0].address] : []; // TODO we're hardcoding the first round for now
      const decimals = isEth ? 18 : SUPPORTED_TOKENS_MAPPING[tokenAddress].decimals;
      const donationAmount = parseUnits(String(contributionAmount), decimals);

      // Compute ratio
      const swap = swaps.find((swap) => hexDataSlice(swap.path, 0, 20) === tokenAddress.toLowerCase());
      if (!swap) throw new Error('Could not find matching swap for donation');
      const ratio = donationAmount.mul(WAD).div(swap.amountIn); // ratio of `token` to donate, specified as numerator where WAD = 1e18 = 100%

      // Return donation object
      return { grantId, token: tokenAddress, ratio, rounds };
    });

    // Return all inputs needed for checkout, using a deadline 20 minutes from now
    const now = new Date().getTime();
    const nowPlus20Minutes = new Date(now + 20 * 60 * 1000).getTime();
    return { swaps, donations: fixDonationRoundingErrors(donations), deadline: Math.floor(nowPlus20Minutes / 1000) };
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
   * @notice Returns a summary of items in the cart, e.g. "50 DAI" or "20 DAI + 0.5 ETH + 30 GTC"
   */
  const cartSummaryString = computed(() => {
    // returns a string summarizing the `cartSummary`, such as `12 DAI + 4 GTC + 10 USDC`
    const summary = Object.keys(cartSummary.value).reduce((acc, tokenAddr) => {
      return acc + `${cartSummary.value[tokenAddr]} ${SUPPORTED_TOKENS_MAPPING[tokenAddr].symbol} + `;
    }, '');
    return summary.slice(0, -3); // trim the trailing ` + ` from the string
  });

  /**
   * @notice Returns the amount of items in the cart
   */
  const cartItemsCount = computed(() => Object.entries(cartSummary.value).length);

  // Only export additional items as they are needed outside the store
  return {
    // Store
    // WARNING: Be careful -- the `cart` ref is directly exposed so it can be edited by v-model, so just make
    // sure to call `updateCart()` with the appropriate inputs whenever the `cart` ref is modified
    cart,
    // Getters
    cartItemsCount,
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

// --- Pure functions (not reliant on state) ---

/**
 * @notice Takes an array of donation data, and adjusts the ratios so they sum to 1e18 for each set of tokens
 * @dev For each token, we adjust the first item in the cart to force the sum to be 100%. The adjustments will only
 * affect donation amounts by a few wei, so practically it doesn't matter which item the adjustment is applied to.
 * We run the same logic on each iteration, but because it's fixed during the first iteration for a given token,
 * subsequent iterations that operate on a donation item with the same token are no-ops. This is necessary because
 * ratios are calculated with integer division, which truncates. For example, if you had 3 items of 5 DAI each in
 * your cart, the ratios would be 33.333% each and would not sum to 100%. This method fixes that so one of the items
 * is 33.334%
 * @param donations Donations to adjust
 */
function fixDonationRoundingErrors(donations: Donation[]) {
  donations.forEach((donation, index) => {
    const { token, ratio } = donation;

    // Get the sum of all items using this token
    const sum = donations.reduce((acc, curr) => acc.add(curr.token === token ? curr.ratio : 0), BigNumber.from(0));
    if (sum.gt(WAD)) throw new Error('Ratios sum to greater than 100%');

    // Make adjustments are necessary based on the total ratio
    const shortfall = BigNumber.from(WAD).sub(sum); // if sum is already 100%, we add zero, no explicit check that sum is 100% is required
    donations[index] = { ...donation, ratio: BigNumber.from(ratio).add(shortfall) }; // apply fix to donation item
  });

  return donations;
}

/**
 * @notice Returns the amountOutMin expected for a given trade assuming 0.5% slippage
 * @param path Swap path
 * @param amountIn Swap input amount, as a full integer
 */
async function quoteExactInput(path: BytesLike, amountIn: BigNumberish): Promise<BigNumber> {
  const { provider } = useWalletStore();
  const abi = ['function quoteExactInput(bytes memory path, uint256 amountIn) external view returns (uint256 amountOut)']; // prettier-ignore
  const quoter = new Contract('0xb27308f9F90D607463bb33eA1BeBb41C27CE5AB6', abi, provider.value);
  const amountOut = await quoter.quoteExactInput(path, amountIn);
  return amountOut.mul(995).div(1000); // multiplying by 995/1000 is equivalent to 0.5% slippage
}

/**
 * @notice Throws an error if the user does not have sufficient balance for the specified token
 * @param tokenAddress Address of the token to check
 * @param requiredAmount Amount required as a raw number, e.g. 5e18 if the user needs 5 DAI
 * @returns True if the user has sufficient balance, or throws otherwise
 */
async function assertSufficientBalance(tokenAddress: string, requiredAmount: BigNumberish): Promise<boolean> {
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

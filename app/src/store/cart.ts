/**
 * @dev Manages the user's cart and ensures the cart store stays in sync with localStorage. The way
 * this is handled is that all cart management methods do any pre-processing required, then complete
 * with a call to `setCart()` which manages the synchronization
 */

// --- Imports ---
import { computed, ref } from 'vue';
import { Donation, Grant, SwapSummary } from '@dgrants/types';
import { CartItem, CartItemOptions, CartPrediction, CartPredictions } from 'src/types';
import { SupportedChainId, SUPPORTED_TOKENS, SUPPORTED_TOKENS_MAPPING, WETH_ADDRESS } from 'src/utils/chains';
import { ERC20_ABI, ETH_ADDRESS, WAD } from 'src/utils/constants';
import { BigNumber, BigNumberish, BytesLike, Contract, ContractTransaction, formatUnits, getAddress, hexDataSlice, isAddress, MaxUint256, parseUnits } from 'src/utils/ethers'; // prettier-ignore
import { assertSufficientBalance } from 'src/utils/utils';
import useDataStore from 'src/store/data';
import useWalletStore from 'src/store/wallet';
import { getPredictedMatchingForAmount } from '@dgrants/dcurve';
import { getPredictionsForGrantInRound } from 'src/utils/data/grantRounds';

// --- Constants and helpers ---
const CART_KEY = 'cart';
const DEFAULT_CONTRIBUTION_AMOUNT = 5; // this is converted to a parsed BigNumber at checkout
const EMPTY_CART: CartItemOptions[] = []; // and empty cart is identified by an empty array
// Hardcoded swap paths based on a input token and swapping to DAI, based on most liquid pairs: https://info.uniswap.org/#/
// TODO replace with more robust swap path logic
const MAINNET_SWAP_PATHS = {
  // ETH to DAI through the 0.3% pool
  '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb86b175474e89094c44da98b954eedeac495271d0f', // prettier-ignore
  // USDC to DAI through the 0.05% pool
  '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb480001f46b175474e89094c44da98b954eedeac495271d0f', // prettier-ignore
  // GTC to ETH through 1% pool, ETH to DAI through 0.3% pool
  '0xDe30da39c46104798bB5aA3fe8B9e0e1F348163F': '0xde30da39c46104798bb5aa3fe8b9e0e1f348163f002710c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb86b175474e89094c44da98b954eedeac495271d0f', // prettier-ignore
  // UNI to ETH through 0.3% pool, ETH to DAI through 0.3% pool
  '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984': '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984000bb8c02aaa39b223fe8d0a0e5c4f27ead9083c756cc2000bb86b175474e89094c44da98b954eedeac495271d0f', // prettier-ignore
  // DAI "swap path" is just its token address for our router
  '0x6B175474E89094C44Da98b954EedeAC495271d0F': '0x6B175474E89094C44Da98b954EedeAC495271d0F'.toLowerCase(),
};
const SWAP_PATHS = {
  [SupportedChainId.MAINNET]: MAINNET_SWAP_PATHS,
  [SupportedChainId.HARDHAT]: MAINNET_SWAP_PATHS,
  [SupportedChainId.RINKEBY]: {
    // ETH to DAI through the 0.3% pool
    '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': '0xc778417e063141139fce010982780140aa0cd5ab000bb85592ec0cfb4dbc12d3ab100b257153436a1f0fea', // prettier-ignore
    // DAI "swap path" is just its token address for our router
    '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa': '0x5592EC0cfb4dbc12D3aB100b257153436a1f0FEa'.toLowerCase(),
  },
  [SupportedChainId.OPTIMISM]: {
    // ETH to DAI through the 0.3% pool
    '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': '0x4200000000000000000000000000000000000006000bb8da10009cbd5d07dd0cecc66161fc93d7c9000da1', // prettier-ignore
    // USDC to DAI through the 0.3% pool
    '0x7F5c764cBc14f9669B88837ca1490cCa17c31607': '0x7f5c764cbc14f9669b88837ca1490cca17c31607000bb8da10009cbd5d07dd0cecc66161fc93d7c9000da1', // prettier-ignore
    // DAI "swap path" is just its token address for our router
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1': '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'.toLowerCase(),
  },
  [SupportedChainId.OPTIMISTIC_KOVAN]: {
    // ETH to DAI through the 0.3% pool
    '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': '0x4200000000000000000000000000000000000006000bb8da10009cbd5d07dd0cecc66161fc93d7c9000da1', // prettier-ignore
    // USDC to DAI through the 0.3% pool
    '0x7F5c764cBc14f9669B88837ca1490cCa17c31607': '0x7f5c764cbc14f9669b88837ca1490cca17c31607000bb8da10009cbd5d07dd0cecc66161fc93d7c9000da1', // prettier-ignore
    // DAI "swap path" is just its token address for our router
    '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1': '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1'.toLowerCase(),
  },
  // *** Arbitrum paths are currently not handled as there is no bridged DAI ***
  // We use the mainnet paths here just to avoid lint errors
  [SupportedChainId.ARBITRUM_ONE]: {
    // ETH to USDC through the 0.3% pool
    '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1000bb8ff970a61a04b1ca14834a43f5de4533ebddb5cc8', // prettier-ignore
    // USDC "swap path" is just its token address for our router (no DAI on Arbitrum yet, so using USDC instead)
    '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8': '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8'.toLowerCase(),
  },
  [SupportedChainId.ARBITRUM_RINKEBY]: {
    // Seems Uniswap V3 has no liquidity here (this swap path is not correct)
    '0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE': '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1000bb86b175474e89094c44da98b954eedeac495271d0f', // prettier-ignore
    // TODO choose donation token since there's no DAI -- USDC?
  },
};

const { grants, grantRounds, grantRoundsCLRData } = useDataStore();
const { chainId } = useWalletStore();
const toString = (val: BigNumberish) => BigNumber.from(val).toString();
const toHex = (val: BigNumberish) => BigNumber.from(val).toHexString();

// --- State ---
const lsCart = ref<CartItemOptions[]>([]); // localStorage cart
const cart = ref<CartItem[]>([]); // source of truth for what's in the user's cart
const quotes = ref<Record<string, number>>({}); // mapping from token address to DAI exchange rate, i.e. multiple token quantity by the exchange rate to get the value in DAI

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

  // convert the (human readable) amount to a different token (direction allows for moving to/from the tokenAddress)
  function getConvertedAmount(amount: number, tokenAddress: string, direction = 1) {
    const exchangeRate = quotes.value[tokenAddress] ?? 0;

    return amount * (direction == 1 ? exchangeRate : 1 / exchangeRate);
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
    const DEFAULT_CONTRIBUTION_TOKEN = SUPPORTED_TOKENS.find((token) => token.symbol === 'DAI');
    const newCart = [
      ...lsCart.value,
      {
        grantId: toString(grantId),
        contributionTokenAddress: <string>DEFAULT_CONTRIBUTION_TOKEN?.address,
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
    const { signer, userAddress, grantRoundManager } = useWalletStore();
    const manager = grantRoundManager.value;
    const { swaps, donations, deadline } = await getCartDonationInputs();
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
      const path = swapPaths.value[tokenAddress as keyof typeof swapPaths.value];
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

  /**
   * @notice Fetches quotes based on the users cart
   * @dev For max accuracy, this should be run each time the user edits their cart with the actual cart amounts, but in
   * reality this will be accurate enough if we just run it once with default amounts and save the results, because
   * the Uniswap pools have sufficient liquid for all supported tokens
   */
  async function fetchQuotes() {
    // TODO use multicall for better performance + fewer RPC requests
    const _quotes = await Promise.all(
      SUPPORTED_TOKENS.map(async (token) => {
        if (token.symbol === 'DAI' || token.symbol === 'USDC') return { token, rate: 1 };
        const path = swapPaths.value[token.address as keyof typeof swapPaths.value];
        const amountIn = parseUnits('1', token.decimals); // for simplicity, use a value of 1 token for getting quotes
        const amountOut = await quoteExactInput(path, amountIn); // as raw BigNumber
        return { token, rate: Number(formatUnits(amountOut, token.decimals)) };
      })
    );
    _quotes.forEach((quote) => (quotes.value[quote.token.address] = quote.rate));
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
  const cartSummary = computed((): Record<string, number> => {
    const output: Record<string, number> = {};
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
   * @notice Returns list of valid swap paths for the specified chainId
   */
  const swapPaths = computed(() => SWAP_PATHS[chainId.value]);

  /**
   * @notice Returns all clr matching for each grant and each round
   */
  const clrPredictions = computed<CartPredictions>(() => {
    const _predictions: CartPredictions = {};
    cart.value.forEach((item) => {
      // the original token the contribution was made in
      const token = item.contributionToken;
      // collect the matching values for each grant in each round
      _predictions[item.grantId] = (grantRounds.value || []).map((round) => {
        // all calculations are denominated in the rounds donationToken
        const roundToken = round.donationToken;
        // get the predictions for this grant in this round
        const clr_predictions = getPredictionsForGrantInRound(item.grantId, grantRoundsCLRData.value[round.address]);
        // no conversion is required if tokens are in the same currency
        const contributionIsRoundToken = token.address == roundToken.address;
        // if contribution/donationToken token is DAI we can skip that step of the conversion
        const contributionIsDai = token.symbol === 'DAI';
        const roundTokenIsDai = roundToken.symbol === 'DAI';
        // take the initial contributionAmount and convert it to be denominated in donationToken
        let amount = item.contributionAmount;
        // convert amount to the donationToken (double hop to get into dai then into the donationToken)
        amount = contributionIsDai || contributionIsRoundToken ? amount : getConvertedAmount(amount, token.address, 1);
        amount =
          roundTokenIsDai || contributionIsRoundToken ? amount : getConvertedAmount(amount, roundToken.address, -1);

        const matching = getPredictedMatchingForAmount(
          clr_predictions,
          amount // pass in the donationToken denominated amount
        );

        return {
          matching: matching,
          matchingToken: round.matchingToken,
        };
      });
    });

    return _predictions;
  });

  /**
   * @notice sum of clrPredictions for grants in the cart (summed by token)
   */
  const clrPredictionsByToken = computed<Record<string, number>>(() => {
    const _predictions = clrPredictions.value;
    const _predictionTotals: Record<string, number> = {};
    cart.value.forEach((item) => {
      if (_predictions[item.grantId]) {
        _predictions[item.grantId].forEach((prediction: CartPrediction) => {
          if (!_predictionTotals[prediction.matchingToken.symbol]) {
            _predictionTotals[prediction.matchingToken.symbol] = 0;
          }
          _predictionTotals[prediction.matchingToken.symbol] += prediction.matching;
        });
      }
    });

    return _predictionTotals;
  });

  // Only export additional items as they are needed outside the store
  return {
    // Store
    // WARNING: Be careful -- the `cart` ref is directly exposed so it can be edited by v-model, so just make
    // sure to call `updateCart()` with the appropriate inputs whenever the `cart` ref is modified
    cart,
    lsCart,
    quotes: computed(() => quotes.value),
    // Getters
    cartItemsCount: computed(() => cart.value.length),
    cartSummary: computed(() => cartSummary.value),
    cartSummaryString: computed(() => cartSummaryString.value),
    clrPredictions: computed(() => clrPredictions.value),
    clrPredictionsByToken: computed(() => clrPredictionsByToken.value),
    // Actions / Mutations
    addToCart,
    checkout,
    clearCart,
    fetchQuotes,
    initializeCart,
    isInCart,
    removeFromCart,
    setCart,
    updateCart,
    getConvertedAmount,
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

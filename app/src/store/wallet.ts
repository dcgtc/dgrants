/**
 * @dev Information about the user's wallet, network, etc. are stored and managed here
 *
 * @dev State is handled in reusable components, where each component is its own self-contained file consisting of
 * one function defined used the composition API. Since we want the wallet state to be shared between all instances
 * when this file is imported, we defined state outside of the function definition.
 *
 * @dev When assigning ethers objects as refs, we must wrap the object in `markRaw` for assignment. This is not required
 * with Vue 2's reactivity system based on Object.defineProperty, but is required for Vue 3's reactivity system based
 * on ES6 proxies. The Vue 3 reactivity system does not work well with non-configurable, non-writable properties on
 * objects, and many ethers classes, such as providers and networks, use non-configurable or non-writable properties.
 * Therefore we wrap the object in `markRaw` to prevent it from being converted to a Proxy. If you do not do this,
 * you'll see errors like this when using ethers objects as refs:
 *     Uncaught (in promise) TypeError: 'get' on proxy: property '_network' is a read-only and non-configurable data
 *     property on the proxy target but the proxy did not return its actual value (expected '#<Object>' but got
 *     '[object Object]')
 * Read more here:
 *     - https://stackoverflow.com/questions/65693108/threejs-component-working-in-vuejs-2-but-not-3
 *     - https://github.com/vuejs/vue-next/issues/3024
 *     - https://v3.vuejs.org/api/basic-reactivity.html#markraw
 */

import { computed, ref, markRaw } from 'vue';
import useDataStore from 'src/store/data';
import useSettingsStore from 'src/store/settings';
import { SupportedChainId, ALL_SUPPORTED_CHAIN_IDS, CHAIN_INFO } from 'src/utils/chains';
import { Contract, JsonRpcProvider, JsonRpcSigner, Network, Web3Provider } from 'src/utils/ethers';
import { formatAddress } from 'src/utils/utils';
import Onboard from 'bnc-onboard';
import { API as OnboardAPI } from 'bnc-onboard/dist/src/interfaces';
import { getAddress } from 'src/utils/ethers';
import { GRANT_REGISTRY_ABI, GRANT_ROUND_MANAGER_ABI, MULTICALL_ABI } from 'src/utils/constants';
import { GrantRegistry, GrantRoundManager } from '@dgrants/contracts';

const { startPolling } = useDataStore();
const { setLastWallet } = useSettingsStore();
const defaultChainId = process.env.DEFAULT_CHAINID | SupportedChainId.MAINNET;
const defaultProvider = new JsonRpcProvider(CHAIN_INFO[defaultChainId].rpcUrl);

// State variables
let onboard: OnboardAPI; // instance of Blocknative's onboard.js library
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const rawProvider = ref<any>(); // raw provider from the user's wallet, e.g. EIP-1193 provider
const provider = ref<Web3Provider | JsonRpcProvider>(defaultProvider); // ethers provider
const signer = ref<JsonRpcSigner>(); // ethers signer
const userAddress = ref<string>(); // user's wallet address
const userEns = ref<string | null>(); // user's ENS name
const network = ref<Network>(); // connected network, derived from provider

// Reset state when, e.g.user switches wallets. Provider/signer are automatically updated by ethers so are not cleared
function resetState() {
  userAddress.value = undefined;
  network.value = undefined;
}

// Settings
const walletChecks = [{ checkName: 'connect' }];
const wallets = [{ walletName: 'metamask', preferred: true }]; // TODO determine set of wallets to support, and make sure rpcUrls are reactive based on network

export default function useWalletStore() {
  // ------------------------------------------------ Wallet Connection ------------------------------------------------
  /**
   * @notice Initialize the onboard.js module
   */
  function initializeOnboard() {
    onboard = Onboard({
      dappId: import.meta.env.VITE_BLOCKNATIVE_API_KEY,
      networkId: 1,
      walletSelect: { wallets },
      walletCheck: walletChecks,
      subscriptions: {
        // On wallet connection, save wallet in local storage and set provider
        wallet: (wallet) => {
          setProvider(wallet.provider);
          if (wallet.name) setLastWallet(wallet.name);
        },
        // On address or network change, re-run configureProvider
        address: async (address) => {
          if (userAddress.value && userAddress.value !== getAddress(address)) await configureProvider();
        },
        network: async (chainId) => {
          if (network.value?.chainId && network.value.chainId !== chainId) await configureProvider();
        },
      },
    });
  }

  /**
   * @notice Prompt user to connect wallet, or attempt to connect to wallet specified by `name`
   * @param name Wallet name to connect, or undefined to prompt user to select a wallet
   */
  async function connectWallet(name: string | undefined | MouseEvent = undefined) {
    // If user already connected wallet, return
    if (userAddress.value) return;

    // If input type is MouseEvent, this method was ran from clicking a DOM element, so set name to undefined
    if (name && typeof name !== 'string' && 'pageX' in name) name = undefined;

    // Otherwise, prompt them for connection / wallet change
    if (!onboard) initializeOnboard(); // instantiate Onboard instance
    onboard.walletReset(); // clear existing wallet selection
    await onboard.walletSelect(name); // wait for user to select wallet
    await onboard.walletCheck(); // run any specified checks
    await configureProvider(); // load info based on user's address
  }

  /**
   * @notice Disconnect the current user wallet
   */
  function disconnectWallet() {
    // If user doesn't have a connected wallet, return
    if (!userAddress.value) return;

    resetState();
    onboard.walletReset();
  }

  /**
   * @notice Change wallet
   */
  async function changeWallet() {
    const prevWallet = onboard.getState().wallet;
    try {
      await onboard.walletSelect();
      await onboard.walletCheck();
      await configureProvider();
    } catch (error) {
      if (prevWallet.name) {
        // changing wallet failed. Restoring previous wallet
        await onboard.walletSelect(prevWallet.name);
      } else {
        // this shouldn't happen because to change a wallet you need a previous wallet
        // defaulting to disconnecting if we reach this point
        disconnectWallet();
      }
    }
  }

  // ----------------------------------------------------- Actions -----------------------------------------------------

  // When user connects their wallet, we call this method to update the provider
  /* eslint-disable @typescript-eslint/no-explicit-any */
  function setProvider(p: any) {
    rawProvider.value = p;
  }
  /* eslint-enable @typescript-eslint/no-explicit-any */

  // Any actions or data to fetch dependent on user's wallet are done here
  async function configureProvider() {
    // Set network/wallet properties
    if (!rawProvider.value) return;
    const _provider = new Web3Provider(rawProvider.value);
    const _signer = _provider.getSigner();

    // Get user and network information
    const [_userAddress, _network] = await Promise.all([
      _signer.getAddress(), // get user's address
      _provider.getNetwork(), // get information on the connected network
    ]);

    // If nothing has changed, no need to continue configuring
    if (_userAddress === userAddress.value && _network.chainId === network.value?.chainId) return;

    // Clear state
    resetState();

    // Exit if not a valid network
    const chainId = _provider.network.chainId; // must be done after the .getNetwork() call
    if (!ALL_SUPPORTED_CHAIN_IDS.includes(chainId)) {
      network.value = markRaw(_network); // save network for checking if this is a supported network
      return;
    }

    // Get ENS name if we're on mainnet
    const _userEns = _network.chainId === 1 ? await _provider.lookupAddress(_userAddress) : null;

    // Now we save the user's info to the store. We don't do this earlier because the UI is reactive based on these
    // parameters, and we want to ensure this method completed successfully before updating the UI
    provider.value = markRaw(_provider);
    signer.value = _signer;
    userAddress.value = _userAddress;
    userEns.value = _userEns;
    network.value = markRaw(_network);

    // Start polling for data
    startPolling();
  }

  // ----------------------------------------------------- Getters -----------------------------------------------------
  // Default to mainnet for all network-based getters
  const chainId = computed(() => (network.value?.chainId || defaultChainId) as SupportedChainId);
  const chainInfo = computed(() => CHAIN_INFO[chainId.value]);
  const supportedTokens = computed(() => chainInfo.value.tokens);
  const supportedTokensMapping = computed(() => chainInfo.value.tokensMapping);
  const contractProvider = computed(() => signer.value || defaultProvider);
  const grantRegistry = computed(() => {
    return <GrantRegistry>new Contract(chainInfo.value.grantRegistry, GRANT_REGISTRY_ABI, contractProvider.value);
  });
  const grantRoundManager = computed(() => {
    return <GrantRoundManager>(
      new Contract(chainInfo.value.grantRoundManager, GRANT_ROUND_MANAGER_ABI, contractProvider.value)
    );
  });
  const multicall = computed(() => new Contract(chainInfo.value.multicall, MULTICALL_ABI, contractProvider.value));
  const isSupportedNetwork = computed(
    () => (network.value ? ALL_SUPPORTED_CHAIN_IDS.includes(network.value.chainId) : true) // assume valid if we have no network information
  );

  // ----------------------------------------------------- Exports -----------------------------------------------------

  // Define parts of the store to expose. Only expose computed properties or methods to avoid direct mutation of state
  return {
    // Methods
    configureProvider,
    connectWallet,
    disconnectWallet,
    changeWallet,
    setProvider,
    // Properties
    chainId,
    WETH_ADDRESS: computed(() => chainInfo.value.weth),
    supportedTokens,
    supportedTokensMapping,
    isSupportedNetwork,
    grantRegistry,
    grantRoundManager,
    multicall,
    network: computed(() => network.value),
    provider: computed(() => provider.value),
    signer: computed(() => signer.value),
    userAddress: computed(() => userAddress.value),
    userDisplayName: computed(() => userEns.value || formatAddress(userAddress.value || '')),
  };
}

/**
 * @dev Poll on each block to read data
 */

// --- External imports ---
import { computed, markRaw, ref } from 'vue';

// --- Our imports ---
import { BigNumber, Contract } from 'src/utils/ethers';
import useWalletStore from 'src/store/wallet';
import { GRANT_REGISTRY_ADDRESS, GRANT_REGISTRY_ABI, MULTICALL_ADDRESS, MULTICALL_ABI } from 'src/utils/constants';
import { Grant } from '@dgrants/types';

// --- Parameters required ---
const { provider } = useWalletStore();
const multicall = ref<Contract>();
const registry = ref<Contract>();

// --- State ---
// Most recent data read is saved as state
const lastBlockNumber = ref<number>(0);
const lastBlockTimestamp = ref<number>(0);
const grants = ref<Grant[]>();

// --- Store methods and exports ---
export default function useDataStore() {
  /**
   * @notice Called each block to poll for data, but can also be called on-demand, e.g. after user submits a transaction
   */
  async function poll() {
    if (!multicall.value || !registry.value) return;

    // Define calls to be read using multicall
    const calls = [
      { target: MULTICALL_ADDRESS, callData: multicall.value.interface.encodeFunctionData('getCurrentBlockTimestamp') },
      { target: GRANT_REGISTRY_ADDRESS, callData: registry.value.interface.encodeFunctionData('getAllGrants') },
    ];

    // Execute calls
    const { blockNumber, returnData } = await multicall.value.tryBlockAndAggregate(false, calls);

    // Parse return data
    const [timestampEncoded, grantsEncoded] = returnData;
    const { timestamp } = multicall.value.interface.decodeFunctionResult('getCurrentBlockTimestamp', timestampEncoded.returnData); // prettier-ignore
    const grantsList = registry.value.interface.decodeFunctionResult('getAllGrants', grantsEncoded.returnData)[0]; // prettier-ignore

    // Save off data
    lastBlockNumber.value = (blockNumber as BigNumber).toNumber();
    lastBlockTimestamp.value = (timestamp as BigNumber).toNumber();
    grants.value = grantsList as Grant[];
    console.log('grants.value: ', grants.value);
  }

  /**
   * @notice Call this method to poll now, then poll on each new block
   */
  function startPolling() {
    // Remove all existing listeners to avoid duplicate polling
    provider.value.removeAllListeners();

    // Start polling with the user's provider if available, or fallback to our default provider
    multicall.value = markRaw(new Contract(MULTICALL_ADDRESS, MULTICALL_ABI, provider.value));
    registry.value = markRaw(new Contract(GRANT_REGISTRY_ADDRESS, GRANT_REGISTRY_ABI, provider.value));
    provider.value.on('block', (/* block: number */) => void poll());
  }

  return {
    // Methods
    startPolling,
    poll,
    // Data
    lastBlockNumber: computed(() => lastBlockNumber.value || 0),
    lastBlockTimestamp: computed(() => lastBlockTimestamp.value || 0),
    grants: computed(() => grants.value),
  };
}

/**
 * @dev Poll on each block to read data
 */

// --- External imports ---
import { computed, ref } from 'vue';

// --- Our imports ---
import { BigNumber, Contract } from 'src/utils/ethers';
import useWalletStore from 'src/store/wallet';
import { MULTICALL_ADDRESS, MULTICALL_ABI } from 'src/utils/constants';

// --- Parameters required ---
const { provider } = useWalletStore();

// --- State ---
// Most recent data read is saved as state
const lastBlockNumber = ref<number>(0);
const lastBlockTimestamp = ref<number>(0);

// --- Store methods and exports ---
export default function useDataStore() {
  async function poll(multicall: Contract) {
    // Define calls to be read using multicall
    const calls = [
      { target: MULTICALL_ADDRESS, callData: multicall.interface.encodeFunctionData('getCurrentBlockTimestamp') },
    ];

    // Execute calls
    const { blockNumber, returnData } = await multicall.tryBlockAndAggregate(false, calls);

    // Parse return data
    const [timestampEncoded] = returnData;
    const { timestamp } = multicall.interface.decodeFunctionResult('getCurrentBlockTimestamp', timestampEncoded.returnData); // prettier-ignore

    // Save off data
    lastBlockNumber.value = (blockNumber as BigNumber).toNumber();
    lastBlockTimestamp.value = (timestamp as BigNumber).toNumber();
  }

  // Call this method to poll now, then poll on each new block
  function startPolling() {
    // Remove all existing listeners to avoid duplicate polling
    provider.value.removeAllListeners();

    // Start polling with the user's provider if available, or fallback to our default provider
    const multicall = new Contract(MULTICALL_ADDRESS, MULTICALL_ABI, provider.value);
    provider.value.on('block', (/* block: number */) => void poll(multicall));
  }

  return {
    // Methods
    startPolling,
    // Data
    lastBlockNumber: computed(() => lastBlockNumber.value || 0),
    lastBlockTimestamp: computed(() => lastBlockTimestamp.value || 0),
  };
}

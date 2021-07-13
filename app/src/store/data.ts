/**
 * @dev Poll on each block to read data
 */

// --- External imports ---
import { computed, ref } from 'vue';

// --- Our imports ---
import { BigNumber, Contract } from 'src/utils/ethers';
import useWalletStore from 'src/store/wallet';
import { GRANT_REGISTRY_ADDRESS, GRANT_REGISTRY_ABI, MULTICALL_ADDRESS, MULTICALL_ABI } from 'src/utils/constants';

// --- Types ---
// The output from ethers/typechain allows array or object access to grant data, so we must define types for
// handling the Grant struct as done below
type GrantObject = {
  id: BigNumber;
  owner: string;
  payee: string;
  metaPtr: string;
};
type GrantArray = [BigNumber, string, string, string];
type GrantEthers = GrantArray & GrantObject;
type Grant = GrantObject | GrantEthers;

// --- Parameters required ---
const { provider } = useWalletStore();

// --- State ---
// Most recent data read is saved as state
const lastBlockNumber = ref<number>(0);
const lastBlockTimestamp = ref<number>(0);
const grants = ref<Grant[]>();

// --- Store methods and exports ---
export default function useDataStore() {
  async function poll(multicall: Contract, registry: Contract) {
    // Define calls to be read using multicall
    const calls = [
      { target: MULTICALL_ADDRESS, callData: multicall.interface.encodeFunctionData('getCurrentBlockTimestamp') },
      { target: GRANT_REGISTRY_ADDRESS, callData: registry.interface.encodeFunctionData('getAllGrants') },
    ];

    // Execute calls
    const { blockNumber, returnData } = await multicall.tryBlockAndAggregate(false, calls);

    // Parse return data
    const [timestampEncoded, grantsEncoded] = returnData;
    const { timestamp } = multicall.interface.decodeFunctionResult('getCurrentBlockTimestamp', timestampEncoded.returnData); // prettier-ignore
    const grantsList = registry.interface.decodeFunctionResult('getAllGrants', grantsEncoded.returnData)[0]; // prettier-ignore

    // Save off data
    lastBlockNumber.value = (blockNumber as BigNumber).toNumber();
    lastBlockTimestamp.value = (timestamp as BigNumber).toNumber();
    grants.value = grantsList as Grant[];
  }

  // Call this method to poll now, then poll on each new block
  function startPolling() {
    // Remove all existing listeners to avoid duplicate polling
    provider.value.removeAllListeners();

    // Start polling with the user's provider if available, or fallback to our default provider
    const multicall = new Contract(MULTICALL_ADDRESS, MULTICALL_ABI, provider.value);
    const registry = new Contract(GRANT_REGISTRY_ADDRESS, GRANT_REGISTRY_ABI, provider.value);
    provider.value.on('block', (/* block: number */) => void poll(multicall, registry));
  }

  return {
    // Methods
    startPolling,
    // Data
    lastBlockNumber: computed(() => lastBlockNumber.value || 0),
    lastBlockTimestamp: computed(() => lastBlockTimestamp.value || 0),
    grants: computed(() => grants.value),
  };
}

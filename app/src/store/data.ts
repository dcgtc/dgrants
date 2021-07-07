/**
 * @dev Poll on each block to read data
 */

import { ref } from 'vue';
import { BigNumber, Contract } from 'src/utils/ethers';
import useWalletStore from 'src/store/wallet';
import { MULTICALL_ADDRESS, MULTICALL_ABI } from 'src/utils/constants';

const { provider, userAddress } = useWalletStore();

// Most recent data read is saved as state
const lastBlockNumber = ref<number>(0);
const lastBlockTimestamp = ref<number>(0);
const ethBalance = ref<bigint>();

export default function useDataStore() {
  async function poll(multicall: Contract) {
    // Don't poll if user has not connected wallet
    if (!userAddress.value) return;

    // Define calls to be read using multicall
    const calls = [
      { target: MULTICALL_ADDRESS, callData: multicall.interface.encodeFunctionData('getCurrentBlockTimestamp') },
      { target: MULTICALL_ADDRESS, callData: multicall.interface.encodeFunctionData('getEthBalance', [userAddress.value]) }, // prettier-ignore
    ];

    // Execute calls
    const { blockNumber, returnData } = await multicall.tryBlockAndAggregate(false, calls);

    // Parse return data
    const [timestampEncoded, ethBalanceEncoded] = returnData;
    const { timestamp } = multicall.interface.decodeFunctionResult('getCurrentBlockTimestamp', timestampEncoded.returnData); // prettier-ignore
    const { balance } = multicall.interface.decodeFunctionResult('getEthBalance', ethBalanceEncoded.returnData); // prettier-ignore

    // Save off data
    lastBlockNumber.value = (blockNumber as BigNumber).toNumber();
    lastBlockTimestamp.value = (timestamp as BigNumber).toNumber();
    ethBalance.value = (balance as BigNumber).toBigInt();
  }

  // Call this method to poll now, then poll on each new block
  function startPolling() {
    const multicall = new Contract(MULTICALL_ADDRESS, MULTICALL_ABI, provider.value);
    provider.value.on('block', (/* block: number */) => void poll(multicall));
  }

  return {
    // Methods
    startPolling,
    // Data
    lastBlockNumber,
    lastBlockTimestamp,
    ethBalance,
  };
}

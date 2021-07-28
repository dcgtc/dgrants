/**
 * @dev Poll on each block to read data
 */

// --- External imports ---
import { computed, markRaw, ref } from 'vue';

// --- Our imports ---
import { BigNumber, Contract } from 'src/utils/ethers';
import useWalletStore from 'src/store/wallet';
import {
  GRANT_ROUND_FACTORY_ADDRESS,
  GRANT_ROUND_FACTORY_ABI,
  GRANT_ROUND_ABI,
  GRANT_REGISTRY_ADDRESS,
  GRANT_REGISTRY_ABI,
  ERC20_ABI,
  MULTICALL_ADDRESS,
  MULTICALL_ABI,
} from 'src/utils/constants';
import { Grant, GrantRound, GrantRounds } from '@dgrants/types';

// --- Parameters required ---
const { provider } = useWalletStore();
const multicall = ref<Contract>();
const registry = ref<Contract>();
const roundFactory = ref<Contract>();

// --- State ---
// Most recent data read is saved as state
const lastBlockNumber = ref<number>(0);
const lastBlockTimestamp = ref<number>(0);
const grants = ref<Grant[]>();
const grantRounds = ref<GrantRounds>();

// --- Store methods and exports ---
export default function useDataStore() {
  /**
   * @notice Called each block to poll for data, but can also be called on-demand, e.g. after user submits a transaction
   */
  async function poll() {
    if (!multicall.value || !registry.value || !roundFactory.value) return;

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

    // Get all rounds from GrantRoundCreated --- TODO: We need to cache these events somewhere (like the graph)
    const roundList = await roundFactory.value.queryFilter(roundFactory.value.filters.GrantRoundCreated());
    const roundAddresses = [...roundList.map((e) => e.args?.grantRound)];

    // Pull state from each GrantRound
    grantRounds.value = await Promise.all(
      roundAddresses.map(async (grantRoundAddress) => {
        const round = new Contract(grantRoundAddress, GRANT_ROUND_ABI, provider.value);
        const donationToken = await round.donationToken();
        // --- TODO: Cache token contracts and the name/sybmol
        const token = new Contract(donationToken, ERC20_ABI, provider.value);
        // get the token details
        const donationTokenName = await token.name();
        const donationTokenSymbol = await token.symbol();
        const donationTokenDecimals = await token.decimals();
        // get the rounds balance (in whole units)
        const funds = (await token.balanceOf(grantRoundAddress)) / 10 ** donationTokenDecimals;
        // discover status from startTime/endTime
        const now = Date.now();
        const startTime = await round.startTime();
        const endTime = await round.endTime();
        const status =
          now > startTime.toNumber() * 1000 && now < endTime.toNumber() * 1000
            ? 'Active'
            : Date.now() < round.startTime.toNumber() * 1000
            ? 'Upcoming'
            : 'Completed';

        return {
          address: grantRoundAddress,
          startTime: startTime,
          endTime: endTime,
          status: status,
          donationToken: donationToken,
          donationTokenName: donationTokenName,
          donationTokenSymbol: donationTokenSymbol,
          donationTokenDecimals: donationTokenDecimals,
          funds: funds,
          owner: await round.owner(),
          registry: await round.registry(),
          metaPtr: await round.metaPtr(),
          minContribution: await round.minContribution(),
          hasPaidOut: await round.hasPaidOut(),
        } as GrantRound;
      })
    );
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
    roundFactory.value = markRaw(new Contract(GRANT_ROUND_FACTORY_ADDRESS, GRANT_ROUND_FACTORY_ABI, provider.value));
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
    grantRounds: computed(() => grantRounds.value),
  };
}

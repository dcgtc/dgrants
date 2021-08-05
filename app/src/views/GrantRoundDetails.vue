<template>
  <!-- GrantRound details -->
  <div v-if="!isContributing">
    <div v-if="grantRound.address">
      <h1 class="my-6 text-center text-3xl font-extrabold text-gray-900">
        Details for Grant Round: <span :title="grantRound.address">{{ formatAddress(grantRound.address) }}</span>
      </h1>
      <p>Status: {{ grantRound.status }}</p>
      <p>
        Funds:
        <a
          class="link"
          :title="grantRound.matchingToken.name"
          :href="`https://etherscan.io/token/${grantRound.matchingToken.address}?a=${grantRound.address}`"
        >
          {{ grantRound.funds.toString() }} {{ grantRound.matchingToken.symbol }}
        </a>
      </p>
      <p>
        {{ hasStatus('Upcoming')(grantRound) ? 'Will begin' : 'Started' }}:
        <span :title="new Date(BigNumber.from(grantRound.startTime).toNumber() * 1000).toLocaleString()">
          {{ daysAgo(BigNumber.from(grantRound.startTime).toNumber()) }}
        </span>
      </p>
      <p>
        {{ hasStatus('Completed')(grantRound) ? 'Ended' : 'Will end' }}:
        <span :title="new Date(BigNumber.from(grantRound.endTime).toNumber() * 1000).toLocaleString()">
          {{ daysAgo(BigNumber.from(grantRound.endTime).toNumber()) }}
        </span>
      </p>
      <p v-if="hasStatus('Completed')(grantRound)">
        Has paid out:
        <span>{{ grantRound.hasPaidOut ? 'Yes' : 'No' }}</span>
      </p>
      <p>
        Metadata Admin:
        <a class="link" :href="`https://etherscan.io/address/${grantRound.metadataAdmin}`">{{
          grantRound.metadataAdmin
        }}</a>
      </p>
      <p>
        Payout Admin:
        <a class="link" :href="`https://etherscan.io/address/${grantRound.payoutAdmin}`">{{
          grantRound.payoutAdmin
        }}</a>
      </p>
      <p>
        Address:
        <a class="link" :href="`https://etherscan.io/address/${grantRound.address}`">{{ grantRound.address }}</a>
      </p>
      <p>
        Metadata URL: <a class="link" :href="grantRound.metaPtr" target="_blank">{{ grantRound.metaPtr }}</a>
      </p>

      <button @click="startContributing" class="btn btn-primary mt-6">Contribute to the matching fund</button>
    </div>
    <div v-else-if="grantRound.error">
      <span>{{ grantRound.error }}</span>
    </div>
    <div v-else>
      <span>Loading details...</span>
    </div>
  </div>

  <!-- Contributing to GrantRound -->
  <div v-else class="flex flex-col justify-center sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img
        class="mx-auto h-12 w-auto"
        src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
        alt="Workflow"
      />
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
        Contribute to GrantRound {{ formatAddress(grantRound.address.toString()) }}
      </h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md text-left">
      <div class="py-8 px-4 border border-gray-200 shadow sm:rounded-lg sm:px-6 bg-gray-50">
        <form class="space-y-6" @submit.prevent="sendContribution">
          <!-- token address -->
          <BaseInput
            v-model="form.token"
            description="The token used to make the contribution"
            id="contribution-token-address"
            label="Contribution Token address"
            :readonly="true"
            :disabled="true"
            :rules="isValidAddress"
            errorMsg="Please enter a valid address"
          />

          <!-- contribution amount -->
          <BaseInput
            v-model="form.amount"
            description="The number of tokens to contribute"
            id="contribution-amount"
            label="Contribution amount"
            :rules="isAmountValid"
            errorMsg="Please enter an amount greater than 0"
          />

          <!-- Submit and cancel buttons -->
          <button
            type="submit"
            class="btn btn-primary w-full"
            :class="{ 'btn-primary-disabled': !isFormValid }"
            :disabled="!isFormValid"
          >
            Send Contribution
          </button>
          <button @click.prevent="cancelContribution" class="btn btn-outline w-full">Cancel</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import BaseInput from 'src/components/BaseInput.vue';
// --- Store ---
import useDataStore from 'src/store/data';
import useWalletStore from 'src/store/wallet';
// --- Methods and Data ---
import { GRANT_ROUND_ABI, ERC20_ABI } from 'src/utils/constants';
import {
  BigNumber,
  BigNumberish,
  Contract,
  ContractTransaction,
  getAddress,
  MaxUint256,
  parseUnits,
} from 'src/utils/ethers';
import {
  daysAgo,
  formatAddress,
  isValidAddress,
  isValidUrl,
  checkAllowance,
  getApproval,
  hasStatus,
} from 'src/utils/utils';
// --- Types ---
import { GrantRound } from '@dgrants/types';
import { GrantRound as GrantRoundContract } from '@dgrants/contracts';

function useGrantRoundDetail() {
  const { grantRounds, poll } = useDataStore();
  const { signer, userAddress } = useWalletStore();
  const route = useRoute();

  // get a single grantRound or an empty/error object (TODO: should the typings be modified to account for an empty object?)
  const grantRound = computed(() => {
    if (grantRounds.value) {
      // filter for a matching GrantRound
      const round = grantRounds.value.filter((round) => round.address === getAddress(<string>route.params.address));

      return <GrantRound>(round.length ? round[0] : { error: `No GrantRound @ ${route.params.address}` });
    } else {
      return <GrantRound>{};
    }
  });

  // --- Contribution capabilities ---
  const isContributing = ref(false);
  const form = computed<{ token: string; amount: string }>(() => {
    return {
      token: grantRound.value.matchingToken.address,
      amount: String(grantRound.value.minContribution),
    };
  });
  const isAmountValid = (amount: BigNumberish) => {
    return (Number(amount) || 0) > 0;
  };
  const isFormValid = computed(() => {
    const { token, amount } = form.value;
    const areFieldsValid =
      isValidAddress(<string>token) && token === grantRound.value.matchingToken.address && isAmountValid(amount);
    return areFieldsValid;
  });

  /**
   * @notice Show the contribution window
   */
  function startContributing() {
    isContributing.value = true; // show contribution form
  }

  /**
   * @notice Hide the contribution window
   */
  function cancelContribution() {
    isContributing.value = false; // hide contribution form
  }

  /**
   * @notice Send contribution
   */
  async function sendContribution() {
    // Get contract instances
    if (!signer.value) throw new Error('Please connect a wallet');

    // pull data from form
    const { amount } = form.value;

    // set up contracts
    const token = new Contract(grantRound.value.matchingToken.address, ERC20_ABI, signer.value);
    const round = <GrantRoundContract>new Contract(grantRound.value.address, GRANT_ROUND_ABI, signer.value);

    // contributionAmount must have the right number of decimals and be hexed
    const contributionAmount = parseUnits(amount, grantRound.value.matchingToken.decimals);

    // check if contract is already approved as a spender
    const allowance = await checkAllowance(token, userAddress.value, grantRound.value.address);
    if (allowance < contributionAmount) {
      await getApproval(token, grantRound.value.address, MaxUint256);
    }

    // invoke addMatchingFunds on the round contract
    await addMatchingFunds(round, contributionAmount);

    // poll for the updated state and toggle page state back to display mode
    await poll();
    cancelContribution();
  }

  /**
   * @notice Submit `addMatchingFunds` tx to contribute to the fund
   */
  async function addMatchingFunds(round: GrantRoundContract, amount: BigNumber) {
    // send funds to the matching pool (*Note: Unable to test this until we get an ERC20 balance into the hardhat accounts)
    const tx: ContractTransaction = await round.addMatchingFunds(amount);
    // After tx mines, poll so the store has the latest data
    await tx.wait();
  }

  return {
    BigNumber,
    hasStatus,
    daysAgo,
    formatAddress,
    isAmountValid,
    isContributing,
    isValidAddress,
    isValidUrl,
    isFormValid,
    grantRound,
    form,
    startContributing,
    cancelContribution,
    sendContribution,
  };
}

export default defineComponent({
  name: 'GrantRoundDetails',
  components: { BaseInput },
  setup() {
    return { ...useGrantRoundDetail() };
  },
});
</script>

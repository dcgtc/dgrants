<template>
  <!-- Contributing to GrantRound -->
  <div v-if="isAddingFunds" class="flex flex-col justify-center sm:px-6 lg:px-8">
    <BaseHeader name="Contribute to GrantRound" :tagline="grantRoundMetadata?.name" />

    <div class="text-left">
      <form class="space-y-5" @submit.prevent="addFunds">
        <!-- Token address -->
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

        <!-- Contribution amount -->
        <BaseInput
          v-model="form.amount"
          description="The number of tokens to contribute"
          id="contribution-amount"
          label="Contribution amount"
          :required="true"
          :rules="isAmountValid"
          errorMsg="Please enter an amount greater than 0"
        />

        <!-- Submit and cancel buttons -->
        <div class="flex justify-end pt-6">
          <button
            type="submit"
            class="btn btn-primary mr-5"
            :class="{ disabled: !isFormValid }"
            :disabled="!isFormValid"
          >
            Add Funds
          </button>
          <button @click.prevent="hideAddFunds" class="btn btn-outline">Cancel</button>
        </div>
      </form>
    </div>
  </div>

  <!-- Grant Round Details -->
  <div v-else-if="grantRound.address && grantRoundMetadata">
    <BaseHeader
      :breadcrumbContent="breadcrumb"
      :name="grantRoundMetadata?.name"
      :owner="formatAddress(grantRound.address)"
      :nextPath="!nextGrantRound ? undefined : { name: 'dgrants-round', params: { address: nextGrantRound?.address } }"
      :lastPath="!prevGrantRound ? undefined : { name: 'dgrants-round', params: { address: prevGrantRound?.address } }"
    />

    <!-- grant details row ( image + raised, address, in round, matchin, add to cart button ) -->
    <GrantRoundDetailsRow :grantRound="grantRound" :grantRoundMetadata="grantRoundMetadata" />

    <!-- Interactions Bar for Share, Add Funds  -->
    <div class="px-4 md:px-12 py-8 border-b border-grey-100">
      <div class="flex flex-wrap gap-x-6 gap-y-4">
        <!-- TODO: Share-->
        <div class="flex items-center gap-x-2 cursor-pointer group ml-auto">
          <ShareIcon class="icon icon-primary icon-small" />
          <span class="text-grey-400 group-hover:text-grey-500">Share</span>
        </div>
        <!-- Add funds to Grant Round -->
        <div @click="showAddFunds()" class="flex items-center gap-x-2 cursor-pointer group">
          <DonateIcon class="icon icon-primary icon-small icon-secondary" />
          <span class="text-grey-400 group-hover:text-grey-500">Add funds</span>
        </div>
      </div>
    </div>

    <!-- Description -->
    <SectionHeader title="Description" />
    <div class="border-b border-grey-100">
      <p style="white-space: pre-line" class="intent px-4 md:px-12 py-24 mx-auto max-w-6xl">
        {{ grantRoundMetadata?.description }}
      </p>
    </div>

    <!-- LINKS -->
    <SectionHeader title="Links" />
    <div class="px-4 md:px-12 py-12 border-grey-100 flex flex-col gap-y-4">
      <div v-if="isDefined(grantRoundMetadata?.properties?.websiteURI)" class="flex gap-x-4">
        <span class="text-grey-400">Website:</span>
        <a :href="grantRoundMetadata?.properties?.websiteURI" target="_blank">{{
          grantRoundMetadata?.properties?.websiteURI
        }}</a>
      </div>

      <div v-if="isDefined(grantRoundMetadata?.properties?.governanceURI)" class="flex gap-x-4">
        <span class="text-grey-400">Governance:</span>
        <a :href="grantRoundMetadata?.properties?.governanceURI" target="_blank">{{
          grantRoundMetadata?.properties?.governanceURI
        }}</a>
      </div>

      <div v-if="isDefined(grantRoundMetadata?.properties?.twitterURI)" class="flex gap-x-4">
        <span class="text-grey-400">Twitter:</span>
        <a :href="grantRoundMetadata?.properties?.twitterURI" target="_blank">{{
          grantRoundMetadata?.properties?.twitterURI
        }}</a>
      </div>
    </div>
  </div>

  <!-- No grant round selected -->
  <div v-else-if="grantRound.error">
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">No grant round selected</h2>
    <span>{{ grantRound.error }}</span>
  </div>

  <!-- Loading -->
  <div v-else>
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Loading...</h2>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';

// --- Components ---
import BaseHeader from 'src/components/BaseHeader.vue';
import BaseInput from 'src/components/BaseInput.vue';
import GrantRoundDetailsRow from 'src/components/GrantRoundDetailsRow.vue';
import SectionHeader from 'src/components/SectionHeader.vue';
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
  pushRoute,
  isDefined,
} from 'src/utils/utils';

// --- Types ---
import { GrantRound, GrantRoundMetadata, Breadcrumb } from '@dgrants/types';

// --- Icons ---
import { ArrowToprightIcon as ShareIcon } from '@fusion-icons/vue/interface';
import { DonateIcon } from '@fusion-icons/vue/interface';

// --- Contract ---
import { GrantRound as GrantRoundContract } from '@dgrants/contracts';

// --- Filter by GrantRound ID ---
function useGrantRoundDetail() {
  const { grantRounds, grantRoundMetadata: _grantRoundMetadata, poll } = useDataStore();

  const { signer, userAddress } = useWalletStore();
  const route = useRoute();

  const grantRoundAddress = computed(() => route.params.address);

  // --- BaseHeader Navigation ---
  const breadcrumb = computed(
    () =>
      <Breadcrumb[]>[
        {
          displayName: 'dgrants',
          routeTarget: { name: 'Home' },
        },
        {
          displayName: 'rounds',
          routeTarget: { name: 'dgrants-rounds-list' },
        },
        {
          displayName: `#${formatAddress(grantRoundAddress.value.toString())}`,
          routeTarget: { name: 'dgrants-round', params: { address: grantRoundAddress.value } },
        },
      ]
  );

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

  /**
   * @notice Link To Previous Grant Round
   */
  const prevGrantRound = computed(() => {
    let prevRound = <GrantRound>{};

    if (grantRounds.value) {
      grantRounds.value.forEach((round, index) => {
        if (round.address == getAddress(<string>route.params.address)) {
          if (grantRounds.value?.length && index - 1 != 0) {
            // check to see if there is previous round
            prevRound = <GrantRound>grantRounds.value[index - 1];
          }
        }
      });
    }
    return prevRound;
  });

  /**
   * @notice Link To Next Grant Round
   */
  const nextGrantRound = computed(() => {
    let nextRound = <GrantRound>{};

    if (grantRounds.value) {
      grantRounds.value.forEach((round, index) => {
        if (round.address == getAddress(<string>route.params.address)) {
          if (index + 1 == grantRounds.value?.length) {
            // check to see if there is next round
            nextRound = <GrantRound>grantRounds.value[index + 1];
          }
        }
      });
    }
    return nextRound;
  });

  /**
   * @notice Populate grant round metadata
   */
  const grantRoundMetadata = computed(() =>
    grantRound.value ? _grantRoundMetadata.value[grantRound.value.metaPtr] : null
  );

  // --- Contribution capabilities ---

  const isAddingFunds = ref(false);
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
   * @notice Show the add funds window
   */
  function showAddFunds() {
    isAddingFunds.value = true;
  }

  /**
   * @notice Hide the add funds window
   */
  function hideAddFunds() {
    isAddingFunds.value = false;
  }

  /**
   * @notice Add Funds
   */
  async function addFunds() {
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
    hideAddFunds();
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
    isAddingFunds,
    isValidAddress,
    isValidUrl,
    isFormValid,
    grantRound,
    grantRoundMetadata: grantRoundMetadata.value as GrantRoundMetadata, // without type casting you get `Types of property 'name' are incompatible. Type 'string | undefined' is not assignable to type 'string'.`
    form,
    showAddFunds,
    hideAddFunds,
    addFunds,
    pushRoute,
    prevGrantRound,
    nextGrantRound,
    isDefined,
    breadcrumb,
  };
}

export default defineComponent({
  name: 'GrantRoundDetails',
  components: {
    BaseHeader,
    BaseInput,
    GrantRoundDetailsRow,
    SectionHeader,
    DonateIcon,
    ShareIcon,
  },
  setup() {
    return { ...useGrantRoundDetail() };
  },
});
</script>

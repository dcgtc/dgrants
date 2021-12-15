<template>
  <!-- Transaction Loading Page -->
  <div v-if="txHash">
    <BaseHeader name="Add Funds to Grant Round: Transaction Status" />
    <TransactionStatus
      :hash="txHash"
      buttonLabel="CONTINUE"
      :buttonAction="() => (grantRound ? hideAddFunds() : null)"
    />
  </div>

  <!-- Contributing to GrantRound -->
  <div v-else-if="isAddingFunds" class="flex flex-col justify-center sm:px-6 lg:px-8">
    <BaseHeader name="Contribute to GrantRound" :tagline="grantRoundMetadata?.name" />

    <div class="text-left">
      <form class="space-y-5" @submit.prevent="addFunds">
        <!-- Token Symbol -->
        <InputRow>
          <template v-slot:label>Token:</template>
          <template v-slot:input>{{ grantRound.matchingToken.symbol }}</template>
        </InputRow>

        <!-- Token Address -->
        <InputRow>
          <template v-slot:label>Token Address:</template>
          <template v-slot:input>{{ grantRound.matchingToken.address }}</template>
        </InputRow>

        <!-- Contribution amount -->
        <InputRow>
          <template v-slot:label>Contribution amount:</template>
          <template v-slot:input>
            <BaseInput
              v-model="form.amount"
              width="w-full"
              placeholder="0"
              id="contribution-amount"
              :required="true"
              :rules="isAmountValid"
              errorMsg="Please enter an amount greater than 0"
            />
          </template>
        </InputRow>

        <div v-if="roundStatus" class="flex gap-x-4 justify-end">
          <div>
            <div class="text-sm text-right">Transaction</div>
            <div>{{ roundStatus }}</div>
          </div>
          <button class="btn disabled spinner float-right" disabled><Spinner1Icon /></button>
        </div>
        <!-- Submit and cancel buttons -->
        <div v-else class="flex justify-end pt-6">
          <button
            type="submit"
            class="btn btn-primary mr-5"
            :class="{ disabled: !isFormValid || !isCorrectNetwork }"
            :disabled="!isFormValid || !isCorrectNetwork"
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
        <!-- Tweet -->
        <a
          target="_blank"
          rel="noreferrer noopener"
          :href="
            'https://twitter.com/intent/tweet' +
            '?text=' +
            encodeURIComponent(
              `Check out the ${grantRoundMetadata?.name} matching round on the new Gitcoin DAO decentralized grants platform!`
            ) +
            '&url=' +
            encodeURIComponent('https://grants.gtcdao.net/#') +
            $route.path
          "
          class="flex items-center gap-x-2 cursor-pointer group ml-auto"
        >
          <TwitterIcon class="icon icon-primary icon-small" />
          <span class="text-grey-400 group-hover:text-grey-500">Tweet</span>
        </a>

        <!-- Add funds to Grant Round -->
        <div @click="showAddFunds()" class="flex items-center gap-x-2 cursor-pointer group">
          <DonateIcon class="icon icon-primary icon-small" />
          <span class="text-grey-400 group-hover:text-grey-500">Add funds</span>
        </div>
      </div>
    </div>

    <!-- Description -->
    <SectionHeader title="Description" />
    <div class="border-b border-grey-100">
      <div class="px-4 md:px-12 py-12 mx-auto max-w-6xl">
        <!-- the idea is to transform each CRLF / ENTER into a <p class="text-indent">text</p> 
        ( whitespace-pre-line will be not needed then ) -->
        <p class="text-indent whitespace-pre-line">{{ grantRoundMetadata?.description }}</p>
      </div>
    </div>

    <!-- LINKS -->
    <SectionHeader title="Links" />
    <div class="px-4 md:px-12 py-12 border-grey-100 flex flex-col gap-y-4">
      <div v-if="isDefined(grantRoundMetadata?.properties?.websiteURI)" class="flex gap-x-4">
        <span class="text-grey-400">Website:</span>
        <a :href="grantRoundMetadata?.properties?.websiteURI" target="_blank" class="link">{{
          grantRoundMetadata?.properties?.websiteURI
        }}</a>
      </div>

      <div v-if="isDefined(grantRoundMetadata?.properties?.governanceURI)" class="flex gap-x-4">
        <span class="text-grey-400">Governance:</span>
        <a :href="grantRoundMetadata?.properties?.governanceURI" target="_blank" class="link">{{
          grantRoundMetadata?.properties?.governanceURI
        }}</a>
      </div>

      <div v-if="isDefined(grantRoundMetadata?.properties?.twitterURI)" class="flex gap-x-4">
        <span class="text-grey-400">Twitter:</span>
        <a :href="grantRoundMetadata?.properties?.twitterURI" target="_blank" class="link">{{
          grantRoundMetadata?.properties?.twitterURI
        }}</a>
      </div>
    </div>

    <!-- CONTRIBUTIONS -->
    <SectionHeader title="Contributions" />
    <ContributionDetail :contributions="roundContributions" />
  </div>

  <!-- No grant round selected -->
  <div v-else-if="grantRound.error">
    <h2 class="mt-6">No grant round selected</h2>
    <span>{{ grantRound.error }}</span>
  </div>

  <!-- Loading -->
  <LoadingSpinner v-else />
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';

// --- Components ---
import BaseHeader from 'src/components/BaseHeader.vue';
import BaseInput from 'src/components/BaseInput.vue';
import GrantRoundDetailsRow from 'src/components/GrantRoundDetailsRow.vue';
import ContributionDetail from 'src/components/ContributionDetail.vue';
import InputRow from 'src/components/InputRow.vue';
import SectionHeader from 'src/components/SectionHeader.vue';
import TransactionStatus from 'src/components/TransactionStatus.vue';
import LoadingSpinner from 'src/components/LoadingSpinner.vue';
// --- Store ---
import useDataStore from 'src/store/data';
import useWalletStore from 'src/store/wallet';
// --- Methods and Data ---
import { GRANT_ROUND_ABI, ERC20_ABI } from 'src/utils/constants';
import { BigNumber, BigNumberish, Contract, getAddress, MaxUint256, parseUnits } from 'src/utils/ethers';
import {
  assertSufficientBalance,
  checkAllowance,
  daysAgo,
  formatAddress,
  getApproval,
  hasStatus,
  isDefined,
  isValidUrl,
  metadataId,
  watchTransaction,
} from 'src/utils/utils';

import { filterMatchingPoolContributions } from 'src/utils/data/contributions';

// --- Types ---
import { Breadcrumb, GrantRound, GrantRoundMetadata } from '@dgrants/types';

// --- Icons ---
import { TwitterIcon, DonateIcon, Spinner1Icon } from '@fusion-icons/vue/interface';

// --- Contract ---
import { GrantRound as GrantRoundContract } from '@dgrants/contracts';

// --- Filter by GrantRound ID ---
function useGrantRoundDetail() {
  const { grantRounds, grantRoundMetadata: _grantRoundMetadata, grantRoundsDonations } = useDataStore();

  const { signer, userAddress, isCorrectNetwork } = useWalletStore();
  const route = useRoute();

  const grantRoundAddress = computed(() => route.params.address);
  const txHash = ref<string>();
  const roundStatus = ref<string>('');

  // --- BaseHeader Navigation ---
  const breadcrumb = computed(() => {
    return <Breadcrumb[]>[
      {
        displayName: 'dgrants',
        routeTarget: { name: 'Home' },
      },
      {
        displayName: 'rounds',
        routeTarget: { name: 'dgrants-rounds-list' },
      },
      {
        displayName: grantRoundMetadata.value?.name
          ? grantRoundMetadata.value?.name
          : formatAddress(grantRoundAddress.value.toString()),
        routeTarget: { name: 'dgrants-round', params: { address: grantRoundAddress.value } },
      },
    ];
  });

  // get a single grantRound or an empty/error object (TODO: should the typings be modified to account for an empty object?)
  const grantRound = computed(() => {
    if (grantRounds.value) {
      // filter for a matching GrantRound
      const round = grantRounds.value.filter(
        (grantRound) => getAddress(<string>grantRound.address) === getAddress(<string>route.params.address)
      );

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
        if (getAddress(<string>round.address) == getAddress(<string>route.params.address)) {
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
        if (getAddress(<string>round.address) == getAddress(<string>route.params.address)) {
          if (index + 1 == grantRounds.value?.length) {
            // check to see if there is a next round
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
    _grantRoundMetadata.value
      ? (_grantRoundMetadata.value[metadataId(grantRound.value?.metaPtr)] as GrantRoundMetadata)
      : null
  );

  // get grantRound contributions
  const roundContributions = computed(() =>
    filterMatchingPoolContributions(
      grantRound.value.address,
      grantRoundsDonations.value,
      grantRoundMetadata.value?.name,
      grantRoundMetadata.value?.logoPtr
    )
  );

  // --- Contribution capabilities ---

  const isAddingFunds = ref(false);
  const form = ref<{ amount: string }>({
    amount: '',
  });
  const isAmountValid = (amount: BigNumberish) => {
    return (Number(amount) || 0) > 0;
  };
  const isFormValid = computed(() => {
    return isAmountValid(form.value.amount);
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
    txHash.value = undefined;
  }

  /**
   * @notice Add Funds
   */
  async function addFunds() {
    // Get contract instances
    if (!signer.value) throw new Error('Please connect a wallet');
    if (!isCorrectNetwork.value) throw new Error('Wrong network');

    // Pull data from form
    const { amount } = form.value;
    const tokenAddress = grantRound.value.matchingToken.address;

    // Set up contracts
    const token = new Contract(tokenAddress, ERC20_ABI, signer.value);
    const round = <GrantRoundContract>new Contract(grantRound.value.address, GRANT_ROUND_ABI, signer.value);

    // contributionAmount must have the right number of decimals and be hexed
    const contributionAmount = parseUnits(amount, grantRound.value.matchingToken.decimals);

    let txIndex = 1;
    let txsNeeded = 1;
    // Check if contract is already approved as a spender
    const allowance = await checkAllowance(token, userAddress.value, grantRound.value.address);
    if (allowance.lt(contributionAmount)) {
      txsNeeded++;
      roundStatus.value = `${txIndex} of ${txsNeeded} pending`;
      await getApproval(token, grantRound.value.address, MaxUint256);
      txIndex++;
    }
    assertSufficientBalance(tokenAddress, contributionAmount);

    roundStatus.value = `${txIndex} of ${txsNeeded} pending`;
    // Invoke addMatchingFunds on the round contract
    await addMatchingFunds(round, contributionAmount);

    // After successful transaction, clear the form data
    if (txHash.value) {
      form.value.amount = '';
    } else {
      roundStatus.value = '';
    }
  }

  /**
   * @notice Submit `addMatchingFunds` tx to contribute to the fund
   */
  async function addMatchingFunds(round: GrantRoundContract, amount: BigNumber) {
    // send funds to the matching pool
    return await watchTransaction(() => round.addMatchingFunds(amount), txHash);
  }

  return {
    BigNumber,
    hasStatus,
    daysAgo,
    formatAddress,
    isAmountValid,
    isAddingFunds,
    isValidUrl,
    isFormValid,
    isCorrectNetwork,
    grantRound,
    grantRoundMetadata,
    roundContributions,
    form,
    showAddFunds,
    hideAddFunds,
    addFunds,
    roundStatus,
    prevGrantRound,
    nextGrantRound,
    isDefined,
    breadcrumb,
    txHash,
  };
}

export default defineComponent({
  name: 'GrantRoundGrants',
  components: {
    BaseHeader,
    BaseInput,
    GrantRoundDetailsRow,
    ContributionDetail,
    InputRow,
    SectionHeader,
    DonateIcon,
    TwitterIcon,
    Spinner1Icon,
    TransactionStatus,
    LoadingSpinner,
  },
  setup() {
    return { ...useGrantRoundDetail() };
  },
});
</script>

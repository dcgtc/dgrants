<template>
  <div class="border-b border-grey-100 grid grid-cols-1 md:grid-cols-2 gap-x-14">
    <!--grid:left (img)-->
    <div>
      <img
        class="shadow-light object-cover h-full"
        :src="grantRoundMetadata?.logoURI || '/src/assets/placeholder_grant.svg'"
      />
    </div>

    <div class="mt-8 px-8 md:px-0">
      <!-- Funds -->
      <div class="mt-6 mb-1">
        <span class="text-grey-400 mr-4">Funds:</span>
        <span>
          {{ grantRound.funds.toString() }}
          {{ grantRound.matchingToken.symbol }}
        </span>
      </div>

      <!-- Contract -->
      <div class="mb-1">
        <span class="text-grey-400 mr-4">Contract:</span>
        <a
          class="link"
          :href="`https://etherscan.io/address/${grantRound.address}`"
          target="_blank"
          rel="noopener noreferrer"
          >{{ formatAddress(grantRound.address) }}</a
        >
      </div>

      <div class="mb-8">
        <span class="text-grey-400 mr-4">Payout Admin:</span>
        <a
          class="link"
          :href="`https://etherscan.io/address/${grantRound.payoutAdmin}`"
          target="_blank"
          rel="noopener noreferrer"
          >{{ formatAddress(grantRound.payoutAdmin) }}</a
        >
      </div>

      <!-- Grants count -->
      <div class="mb-1">
        <span class="text-grey-400 mr-4">Grants In Round:</span>
        <span>{{ grantRoundMetadata?.grants?.length }}</span>
      </div>

      <!-- Period -->
      <div class="mb-1">
        <span class="text-grey-400 mr-4">Period:</span>
        <span>
          {{ new Date(BigNumber.from(grantRound.startTime).toNumber() * 1000).toLocaleDateString() }}
          -
          {{ new Date(BigNumber.from(grantRound.endTime).toNumber() * 1000).toLocaleDateString() }}
        </span>
      </div>

      <!-- Status -->
      <div class="mb-1">
        <span class="text-grey-400 mr-4">Status:</span>
        <span>{{ grantRound.status }}</span>

        <!-- // add pending payout -->
      </div>

      <!-- Matching -->
      <div>
        <span class="text-grey-400 mr-4">Matching:</span>
        <span>{{ grantRoundMetadata?.matchingAlgorithm }}</span>
      </div>

      <!-- See Grants -->
      <div class="mt-2">
        <button
          class="float-right btn btn-primary"
          @click="pushRoute({ name: 'dgrants-round-details', params: { address: grantRound.address } })"
        >
          See Grants
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
// --- Types ---
import { GrantRound, GrantRoundMetadata } from '@dgrants/types';
// --- Utils/helper ---
import { pushRoute, formatAddress } from 'src/utils/utils';
// --- Methods ---
import { BigNumber } from 'src/utils/ethers';

export default defineComponent({
  name: 'GrantRoundDetailsRow',
  props: {
    grantRound: { type: Object as PropType<GrantRound>, required: true },
    grantRoundMetadata: { type: Object as PropType<GrantRoundMetadata>, required: true },
  },
  setup() {
    return {
      BigNumber,
      pushRoute,
      formatAddress,
    };
  },
});
</script>

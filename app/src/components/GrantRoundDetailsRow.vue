<template>
  <div class="border-b border-grey-100 grid grid-cols-1 md:grid-cols-2 gap-x-14">
    <!--grid:left (img)-->
    <figure class="aspect-w-16 aspect-h-9 shadow-light">
      <LogoPtrImage
        class="w-full h-full object-center object-cover"
        :logoPtr="grantRoundMetadata?.logoPtr"
        placeholder="/placeholder_round.svg"
      />
    </figure>

    <!--grid:right (txt)-->
    <div class="my-6 px-8 md:px-0">
      <!-- Funds -->
      <div>
        <span class="text-grey-400 mr-4">Matching Funds:</span>
        <span>
          {{ grantRound.funds.toString() }}
          {{ grantRound.matchingToken.symbol }}
        </span>
      </div>

      <!-- Contract -->
      <div>
        <span class="text-grey-400 mr-4">Contract:</span>
        <a
          class="link"
          :href="getEtherscanUrl(grantRound.address, 'address')"
          target="_blank"
          rel="noopener noreferrer"
          >{{ formatAddress(grantRound.address) }}</a
        >
      </div>

      <!-- Payout Admin -->
      <div>
        <span class="text-grey-400 mr-4">Payout Admin:</span>
        <a
          class="link"
          :href="getEtherscanUrl(grantRound.payoutAdmin, 'address')"
          target="_blank"
          rel="noopener noreferrer"
          >{{ formatAddress(grantRound.payoutAdmin) }}</a
        >
      </div>

      <!-- Grants count -->
      <div>
        <span class="text-grey-400 mr-4">Grants In Round:</span>
        <span>{{ grantRoundMetadata?.grants?.length }}</span>
      </div>

      <!-- Period -->
      <div>
        <span class="text-grey-400 mr-4">Period:</span>
        <span>
          {{ new Date(BigNumber.from(grantRound.startTime).toNumber() * 1000).toLocaleDateString() }}
          -
          {{ new Date(BigNumber.from(grantRound.endTime).toNumber() * 1000).toLocaleDateString() }}
        </span>
      </div>

      <!-- Status -->
      <div>
        <span class="text-grey-400 mr-4">Status:</span>
        <span>{{ grantRound.status }}</span>

        <!-- // add pending payout -->
      </div>

      <!-- Matching -->
      <div>
        <span class="text-grey-400 mr-4">Matching Algorithm:</span>
        <span>
          <template v-if="grantRoundMetadata?.matchingAlgorithm">
            {{ grantRoundMetadata?.matchingAlgorithm }}
          </template>
          <template v-else>Linear</template>
        </span>
      </div>

      <!-- See Grants -->
      <div class="mt-8">
        <button
          class="btn btn-primary"
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
import { pushRoute, formatAddress, getEtherscanUrl } from 'src/utils/utils';
// --- Methods ---
import { BigNumber } from 'src/utils/ethers';
// --- Components/icons ---
import LogoPtrImage from 'src/components/LogoPtrImage.vue';

export default defineComponent({
  name: 'GrantRoundDetailsRow',
  components: { LogoPtrImage },
  props: {
    grantRound: { type: Object as PropType<GrantRound>, required: true },
    grantRoundMetadata: { type: Object as PropType<GrantRoundMetadata>, required: true },
  },
  setup() {
    return { BigNumber, pushRoute, formatAddress, getEtherscanUrl };
  },
});
</script>

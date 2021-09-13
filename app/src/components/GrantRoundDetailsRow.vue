<template>
  <div class="border-b border-grey-100 grid grid-cols-1 md:grid-cols-2 gap-x-14">
    <!--grid:left (img)-->
    <div>
      <img
        class="shadow-light object-cover h-full"
        :src="grantRoundMetadata?.logoURI || '/src/assets/placeholder_grant.svg'"
      />
    </div>

    <!--grid:right (txt)-->
    <div class="my-6 px-8 md:px-0">
      <!-- Funds -->
      <div>
        <span class="text-grey-400 mr-4">Funds:</span>
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
          :href="getEtherscanUrl(grantRound.address, chainId, 'address')"
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
          :href="getEtherscanUrl(grantRound.payoutAdmin, chainId, 'address')"
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
        <span class="text-grey-400 mr-4">Matching:</span>
        <span>{{ grantRoundMetadata?.matchingAlgorithm }}</span>
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
import { computed, defineComponent, PropType } from 'vue';
// --- Types ---
import { GrantRound, GrantRoundMetadata } from '@dgrants/types';
// --- Utils/helper ---
import { pushRoute, formatAddress, getEtherscanUrl } from 'src/utils/utils';
// --- Methods ---
import { BigNumber } from 'src/utils/ethers';
import useWalletStore from 'src/store/wallet';

export default defineComponent({
  name: 'GrantRoundDetailsRow',
  props: {
    grantRound: { type: Object as PropType<GrantRound>, required: true },
    grantRoundMetadata: { type: Object as PropType<GrantRoundMetadata>, required: true },
  },
  setup() {
    const chainId = computed(() => {
      const { network } = useWalletStore();
      return network.value?.chainId ? network.value.chainId : 1;
    });

    return {
      BigNumber,
      pushRoute,
      formatAddress,
      getEtherscanUrl,
      chainId,
    };
  },
});
</script>

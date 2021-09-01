<template>
  <div class="px-4 md:px-12">
    <div class="border-b border-grey-100 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <!--contributor-->
        <div class="truncate">
          <div class="flex items-center gap-4">
            <figure>
              <Jazzicon :address="contribution.from" :key="contribution.from" />
            </figure>
            <div>
              <div v-if="contribution.from">
                <a
                  class="link"
                  :href="`https://etherscan.io/address/${contribution.from}`"
                  target="_blank"
                  rel="noopener noreferrer"
                  >{{ formatAddress(contribution.from) }}</a
                >
              </div>
              <div class="text-grey-400">#{{ contribution.blockNumber }}</div>
            </div>
          </div>
        </div>

        <!-- tx -->
        <div class="truncate">
          <div class="truncate">
            <a
              class="link"
              :href="`https://etherscan.io/tx/${contribution.transactionHash}`"
              target="_blank"
              rel="noopener noreferrer"
              >{{ contribution.transactionHash }}</a
            >
          </div>
          <div class="text-grey-400">Success</div>
        </div>

        <!-- donation-->
        <div class="truncate text-left md:text-right">
          <div>
            {{ formatNumber(formatUnits(contribution.args?.donationAmount, contribution.donationToken?.decimals), 2) }}
            {{ contribution.donationToken?.symbol }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
// --- Utils/helpers ---
import { formatUnits } from 'src/utils/ethers';
import { formatAddress, formatNumber } from 'src/utils/utils';
// --- Types ---
import { ContributionEvent } from '@dgrants/types';
// --- Components ---
import Jazzicon from 'src/components/Jazzicon.vue';

export default defineComponent({
  name: 'ContributionRow',
  props: {
    contribution: { type: Object as PropType<ContributionEvent>, required: true },
  },
  components: { Jazzicon },
  setup() {
    return { formatUnits, formatAddress, formatNumber };
  },
});
</script>

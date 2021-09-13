<template>
  <div class="px-4 md:px-12">
    <div class="py-6 md:py-8 border-b border-grey-100">
      <!-- 3 row even grid that collapse to 1 row grid on mobile -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-2">
        <div>
          <!-- identicon + address + blocknumber -->
          <div class="flex items-center gap-x-4">
            <!--identicon-->
            <div>
              <Jazzicon :address="contribution.from" :key="contribution.from" :width="48" />
            </div>

            <!--address-->
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
              <!--blocknumber-->
              <div class="text-grey-400">#{{ contribution.blockNumber }}</div>
            </div>
          </div>
        </div>

        <!--transaction hash & transaction status-->
        <!--todo : display real transaction status-->
        <div class="truncate">
          <a
            class="link"
            :href="`https://etherscan.io/tx/${contribution.transactionHash}`"
            target="_blank"
            rel="noopener noreferrer"
            >{{ contribution.transactionHash }}</a
          >
          <div class="text-grey-400">Success</div>
        </div>

        <!-- donation -->
        <div class="md:ml-auto">
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

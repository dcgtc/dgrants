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
                <a href="">{{ formatAddress(contribution.from) }}</a>
              </div>
              <div class="text-grey-400">#{{ contribution.blockNumber }}</div>
            </div>
          </div>
        </div>

        <!-- tx -->
        <div class="truncate">
          <div class="truncate">
            <a href="">{{ contribution.transactionHash }}</a>
          </div>
          <div class="text-grey-400">Success</div>
        </div>

        <!-- donation-->
        <div class="truncate text-left md:text-right">
          <div>
            {{ formatUnits(contribution.args.donationAmount, donationToken.decimals) }} {{ donationToken.symbol }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Jazzicon from 'src/components/Jazzicon.vue';
import { formatUnits } from 'src/utils/ethers';
import { formatAddress } from 'src/utils/utils';

export default defineComponent({
  name: 'ContributionRow',
  props: {
    contribution: { type: Object, required: false, default: () => ({}) },
    donationToken: { type: Object, required: false, default: () => ({}) },
  },
  components: { Jazzicon },
  setup() {
    return { formatUnits, formatAddress };
  },
});
</script>

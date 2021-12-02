<template>
  <template v-if="contributions.length > 0">
    <section v-for="contribution in contributions" :key="contribution.txHash" class="px-4 md:px-12">
      <div class="py-4 md:py-6 lg:py-8 border-b border-grey-100">
        <div class="grid grid-cols-12 gap-x-8 gap-y-4 items-center">
          <!-- grand image + grant description + optional grant round -->
          <article class="col-span-12 md:col-span-6 lg:col-span-5">
            <!-- subgrid -->
            <div class="grid grid-cols-4 items-center gap-x-4">
              <!-- img -->
              <div class="hidden lg:block col-span-1">
                <!-- do not forget to link the figure to the grant ^^ -->
                <figure class="aspect-w-16 aspect-h-9 shadow-light cursor-pointer">
                  <img
                    class="w-full h-full object-center object-cover group-hover:opacity-90"
                    :src="contribution.grantLogoURI ? contribution.grantLogoURI : '/placeholder_grant.svg'"
                  />
                </figure>
              </div>
              <div v-if="contribution.grantName && contribution.roundName" class="col-span-4 lg:col-span-3">
                <a href="#" class="link">{{ contribution.grantName }}</a>
                <br /><span class="mr-2">via</span>
                <a href="#" class="link">{{ contribution.roundName }}</a>
              </div>
              <div v-else class="col-span-4 lg:col-span-3">
                <a href="#" class="link">{{ contribution.grantName }}</a>
              </div>
            </div>
          </article>

          <!-- donors + amount -->
          <article class="col-span-12 md:col-span-6 lg:col-span-4">
            <!-- subgrid -->
            <div class="flex justify-between items-center">
              <!-- donors -->
              <div>
                <!-- subgrid -->
                <div class="flex gap-4 items-center">
                  <!-- do not forget to link the figure to the donors profile  -->
                  <figure class="cursor-pointer">
                    <Jazzicon :address="contribution.address" :width="48" />
                  </figure>
                  <div>
                    <a
                      :href="getEtherscanUrl(contribution.address, 'address')"
                      class="link"
                      target="_blank"
                      rel="noopener noreferrer"
                      >{{ formatAddress(contribution.address) }}</a
                    >
                  </div>
                </div>
              </div>
              <!-- amount -->
              <div>
                <div class="text-grey-400">
                  {{ formatNumber(contribution.amount, 4) }}
                  {{ contribution.donationToken?.symbol }}
                </div>
              </div>
            </div>
          </article>

          <!-- transaction time + transaction hash-->
          <article class="col-span-12 md:col-span-12 lg:col-span-3">
            <!-- subgrid -->
            <div class="flex justify-between lg:block lg:text-right">
              <!-- utc-time -->
              <div class="text-grey-400">{{ contribution.createdAt }}</div>
              <!-- tx-hash -->
              <div class="truncate">
                <a :href="getEtherscanUrl(contribution.txHash || '', 'tx')" class="link" target="_blank"
                  >{{ `${contribution.txHash?.slice(0, 6)}...${contribution.txHash?.slice(62)}` }}
                </a>
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  </template>
  <template v-else>
    <section class="px-4 md:px-12">
      <p>No contributions found!</p>
    </section>
  </template>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { formatAddress, formatNumber, getEtherscanUrl } from 'src/utils/utils';
import Jazzicon from 'src/components/Jazzicon.vue';
import { ContributionsDetail } from '@dgrants/types/src/grants';

export default defineComponent({
  name: 'ContributionDetail',
  props: {
    // -- Required props --
    contributions: { type: Array as PropType<ContributionsDetail[]>, required: true },
  },
  components: { Jazzicon },
  setup() {
    return { formatAddress, formatNumber, getEtherscanUrl };
  },
});
</script>

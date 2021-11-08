<template>
  <template v-if="contributions.length > 0">
    <section v-for="contribution in contributions" :key="contribution.name" class="px-4 md:px-12">
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
                    :src="'/placeholder_grant.svg'"
                  />
                </figure>
              </div>
              <!-- text -->
              <div class="col-span-4 lg:col-span-3">
                <a href="#" class="link">{{ contribution.name }}</a>
                <!-- if this tx was via a matching round show round -->
                <br /><span class="mr-2">via</span>
                <a href="#" class="link">Round Dgrants Proof-Of-Concept</a>
                <!-- end if -->
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
                  <!-- do not forget to link the figure to the donors profile ^^ -->
                  <figure class="cursor-pointer">
                    <Jazzicon
                      address="0x2aB75Ef4DC851CD34d4170B453cA56D2ef14683D"
                      key="0x2aB75Ef4DC851CD34d4170B453cA56D2ef14683D"
                      :width="48"
                    />
                  </figure>
                  <div><a href="#" class="link">0x96…f1fe</a></div>
                </div>
              </div>
              <!-- amount -->
              <div>
                <div class="text-grey-400">+ 12.1223 ETH</div>
              </div>
            </div>
          </article>

          <!-- transaction time + transaction hash-->
          <article class="col-span-12 md:col-span-12 lg:col-span-3">
            <!-- subgrid -->
            <div class="flex justify-between lg:block lg:text-right">
              <!-- utc-time -->
              <div class="text-grey-400">2021-11-01 13:20:41</div>
              <!-- tx-hash -->
              <div class=""><a href="#" class="link">0x96…f1fe</a></div>
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
import { Contribution } from '@dgrants/types';
import { defineComponent, PropType } from 'vue';
import Jazzicon from 'src/components/Jazzicon.vue';

// const contributionIdList = ref([]);

export default defineComponent({
  name: 'ContributionDetail',
  props: {
    // -- Required props --
    contributions: { type: Array as PropType<Contribution[]>, required: true },
  },
  components: { Jazzicon },
  setup(props) {
    console.log('props: ', props);
  },
});
</script>

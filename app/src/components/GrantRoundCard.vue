<!-- GrantCard -->

<template>
  <figure class="group">
    <div class="relative cursor-pointer" @click="pushRoute({ name: 'dgrants-round', params: { address: address } })">
      <img :src="imgurl" />
      <div class="absolute bottom-0 right-0"></div>
    </div>
    <figcaption class="grid grid-cols-2 mt-4">
      <div>
        <div class="text-grey-500 font-medium truncate">{{ name }}</div>
        <div>
          <span class="text-grey-400"
            >by
            <a
              class="text-grey-500 underline ml-1"
              :href="getEtherscanUrl(address, 'address')"
              target="_blank"
              rel="noopener noreferrer"
              >{{ formatAddress(address) }}
            </a>
          </span>
        </div>
      </div>
      <div class="text-right">
        <div>
          <span class="text-grey-400">Grants:</span
          ><a class="ml-1 link" @click="pushRoute({ name: 'dgrants-round-details', params: { address: address } })">{{
            grantsTotal
          }}</a>
        </div>
        <div>
          <span class="text-grey-400">Funds:</span><span class="ml-1">{{ funds }}</span>
        </div>
      </div>
    </figcaption>
  </figure>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
// --- Methods and Data ---
import { formatAddress, getEtherscanUrl, pushRoute } from 'src/utils/utils';

export default defineComponent({
  name: 'GrantRoundCard',
  props: {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    imgurl: { type: String, required: true },
    funds: { type: String, required: true },
    grantsTotal: { type: Number, required: true },
  },
  setup() {
    return { formatAddress, getEtherscanUrl, pushRoute };
  },
});
</script>

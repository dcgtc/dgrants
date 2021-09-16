<!-- RoundCard -->

<template>
  <figure class="group">
    <div class="cursor-pointer" @click="pushRoute({ name: 'dgrants-round', params: { address: address } })">
      <img :src="imgurl" />
    </div>

    <figcaption class="mt-4">
      <!-- name -->
      <div class="text-grey-500 font-medium truncate">
        {{ name }}
      </div>

      <!-- by -->
      <div>
        <span class="text-grey-400">by:</span>
        <a class="link ml-1" :href="getEtherscanUrl(address, 'address')" target="_blank" rel="noopener noreferrer"
          >{{ formatAddress(address) }}
        </a>
      </div>

      <!-- grants -->
      <div>
        <span class="text-grey-400">Grants:</span>
        <a class="link ml-1" @click="pushRoute({ name: 'dgrants-round-details', params: { address: address } })">{{
          grantsTotal
        }}</a>
      </div>

      <!-- funds -->
      <div>
        <span class="text-grey-400">Funds:</span>
        <span class="ml-1">{{ funds }}</span>
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

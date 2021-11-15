<!-- RoundCard -->
<template>
  <figure class="group cursor-pointer" @click="pushRoute({ name: 'dgrants-round', params: { address: address } })">
    <!--img-->
    <div class="aspect-w-16 aspect-h-9 shadow-light">
      <img
        class="w-full h-full object-center object-cover group-hover:opacity-90"
        :src="ptrToURI(logoPtr) || '/placeholder_round.svg'"
      />
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
import { defineComponent, PropType } from 'vue';
import { formatAddress, getEtherscanUrl, pushRoute, ptrToURI } from 'src/utils/utils';
import { MetaPtr } from '@dgrants/types';

export default defineComponent({
  name: 'GrantRoundCard',
  props: {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    address: { type: String, required: true },
    logoPtr: { type: Object as PropType<MetaPtr>, required: false },
    funds: { type: String, required: true },
    grantsTotal: { type: Number, required: true },
  },
  setup() {
    return { formatAddress, getEtherscanUrl, pushRoute, ptrToURI };
  },
});
</script>

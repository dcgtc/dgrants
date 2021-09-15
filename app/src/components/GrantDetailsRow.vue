<template>
  <div class="border-b border-grey-100 grid grid-cols-1 md:grid-cols-2 gap-x-14">
    <!--grid:left (img)-->
    <div>
      <img class="shadow-light object-cover h-full" :src="logoURI || '/placeholder_grant.svg'" />
    </div>

    <!--grid:right (txt)-->
    <div class="my-6 px-8 md:px-0">
      <!-- raised -->
      <div><span class="text-grey-400 mr-4">Raised:</span>{{ totalRaised }}</div>

      <!--contract-->
      <div>
        <span class="text-grey-400 mr-4">Contract:</span>
        <a class="link" :href="getEtherscanUrl(payoutAddress, 'address')" target="_blank" rel="noopener noreferrer">{{
          formatAddress(payoutAddress)
        }}</a>
      </div>

      <!--round-->
      <div>
        <span class="text-grey-400 mr-4">In Round:</span>
        <span v-for="(round, index) in roundDetails" :key="index">
          {{ round.name }}<span v-if="index + 1 < roundDetails.length">, </span>
        </span>
      </div>

      <!--matching-->
      <div>
        <span class="text-grey-400 mr-4">Matching:</span>
        <span v-for="(round, index) in roundDetails" :key="index">
          {{ round.matching }} {{ round.matchingToken.symbol }}
          <span v-if="index + 1 < roundDetails.length">, </span>
        </span>
      </div>

      <!-- button -->
      <div class="mt-8">
        <button v-if="isInCart(grant?.id)" @click="removeFromCart(grant?.id)" class="btn in-cart btn-primary">
          <CartIcon class="icon-small" />Remove
        </button>

        <button v-else @click="addToCart(grant?.id)" class="btn btn-primary"><CartIcon class="icon-small" />Add</button>
      </div>

      <!-- matching example -->
      <div class="mt-4">
        <div>
          10 {{ roundDetails[0] ? roundDetails[0].donationToken.symbol : '' }} ≈
          <span v-for="(round, index) in roundDetails" :key="index">
            {{ round.prediction10 }} {{ round.matchingToken.symbol
            }}<span v-if="index + 1 < roundDetails.length">, </span>
          </span>
          Matching
        </div>
        <div>
          100 {{ roundDetails[0] ? roundDetails[0].donationToken.symbol : '' }} ≈
          <span v-for="(round, index) in roundDetails" :key="index">
            {{ round.prediction100 }} {{ round.matchingToken.symbol
            }}<span v-if="index + 1 < roundDetails.length">, </span>
          </span>
          Matching
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
// --- Data ---
import useCartStore from 'src/store/cart';
// --- Types ---
import { Grant, GrantsRoundDetails } from '@dgrants/types';
// --- Utils/helper ---
import { formatAddress, getEtherscanUrl } from 'src/utils/utils';
// --- Components/icons ---
import { Cart2Icon as CartIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'GrantDetailsRow',
  components: { CartIcon },
  props: {
    grant: { type: Object as PropType<Grant>, required: true },
    roundDetails: { type: Array as PropType<GrantsRoundDetails[]>, required: true },
    logoURI: { type: String, required: false, default: undefined },
    payoutAddress: { type: String, required: false, default: '0x0' },
    totalRaised: { type: String, required: false, default: '0' },
  },
  setup() {
    const { addToCart, isInCart, removeFromCart } = useCartStore();
    return { addToCart, isInCart, removeFromCart, formatAddress, getEtherscanUrl };
  },
});
</script>

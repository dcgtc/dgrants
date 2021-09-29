<template>
  <!-- grid sm:1col md:2col -->
  <section class="border-b border-grey-100 grid grid-cols-1 md:grid-cols-2">
    <!--grid:left (img)-->
    <figure class="aspect-w-16 aspect-h-9 shadow-light">
      <img class="w-full h-full object-center object-cover" :src="logoURI || '/placeholder_grant.svg'" />
    </figure>

    <!--grid:right (txt)-->
    <div class="my-6 px-4 md:px-8">
      <!-- raised amount, contract, donate button -->
      <article>
        <!-- raised -->
        <div><span class="text-grey-400 mr-4">Raised:</span>{{ totalRaised }}</div>

        <!--contract-->
        <div>
          <span class="text-grey-400 mr-4">Contract:</span>
          <a class="link" :href="getEtherscanUrl(payoutAddress, 'address')" target="_blank" rel="noopener noreferrer">{{
            formatAddress(payoutAddress)
          }}</a>
        </div>

        <!-- button -->
        <div class="mt-8">
          <button v-if="isInCart(grant?.id)" @click="removeFromCart(grant?.id)" class="btn in-cart btn-primary">
            <CartIcon class="icon-small" />Remove
          </button>

          <button v-else @click="addToCart(grant?.id)" class="btn btn-primary">
            <CartIcon class="icon-small" />Add
          </button>
        </div>
      </article>

      <!-- rounds a grant is in -->
      <article class="mt-8">
        <div v-for="(round, index) in roundDetails" :key="index" class="mt-2">
          <!--round-->
          <div>
            <span class="text-grey-400 mr-4">Matching:</span>
            <span>{{ round.matching || '...' }} {{ round.matchingToken.symbol }}</span>
            <span>, {{ round.name }}</span>
          </div>

          <!--matching-->
          <div>
            <span class="text-grey-300 italic">
              10 {{ roundDetails[0] ? roundDetails[0].donationToken.symbol : '' }} ≈ {{ round.prediction10 }}
              {{ round.matchingToken.symbol }}, 100 {{ roundDetails[0] ? roundDetails[0].donationToken.symbol : '' }} ≈
              {{ round.prediction100 }} {{ round.matchingToken.symbol }}
            </span>
          </div>
        </div>
      </article>
    </div>
  </section>
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

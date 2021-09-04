<template>
  <div class="border-b border-grey-100">
    <div class="grid grid-cols-4 gap-8">
      <!-- img -->
      <div class="col-span-4 xl:col-span-2">
        <img class="shadow-light" :src="logoURI || '/src/assets/placeholder_grant.svg'" />
      </div>

      <!-- raised, contract, round, matching -->
      <div class="col-span-4 md:col-span-2 xl:col-span-1 mb-8 xl:mb-0">
        <div class="px-4 xl:px-0 mt-0 xl:mt-8">
          <!--raised-->
          <div>
            <span class="text-grey-400 mr-4">Raised:</span>
            {{ totalRaised }}
          </div>

          <!--contract-->
          <div>
            <span class="text-grey-400 mr-4">Contract:</span>
            <a
              class="link"
              :href="`https://etherscan.io/address/${payoutAddress}`"
              target="_blank"
              rel="noopener noreferrer"
              >{{ formatAddress(payoutAddress) }}</a
            >
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
        </div>
      </div>

      <!-- add to cart, matching example -->
      <div class="col-span-4 md:col-span-2 xl:col-span-1">
        <div class="px-4 xl:px-12 md:text-right mb-8 xl:mb-0">
          <div class="mt-0 xl:mt-8 mb-4 flex md:justify-end">
            <!-- when item in cart add class "in-cart" + text in span "remove from cart"-->

            <button v-if="isInCart(grant?.id)" @click="removeFromCart(grant?.id)" class="btn in-cart btn-primary">
              <CartIcon class="icon-small" />Remove from Cart
            </button>

            <button v-else @click="addToCart(grant?.id)" class="btn btn-primary">
              <CartIcon class="icon-small" />Add to Cart
            </button>
          </div>

          <div>
            <!-- matching example -->
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
import { formatAddress } from 'src/utils/utils';
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

    return { addToCart, isInCart, removeFromCart, formatAddress };
  },
});
</script>

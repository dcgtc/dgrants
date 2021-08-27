<template>
  <div class="border-b border-grey-100">
    <div class="grid grid-cols-4 gap-0">
      <!-- img -->
      <div class="col-span-4 md:col-span-2 shadow-light flex">
        <img class="m-auto" :src="logoURI" />
      </div>
      <div class="col-span-4 md:col-span-2 grid grid-cols-12 pt-8">
        <!-- raised, contract, round, matching -->
        <div class="text-center xl:text-left col-span-12 mb-8 xl:col-span-5 xl:col-start-2">
          <div class="px-4 xl:px-0 xl:pt-2">
            <div><span class="text-grey-400 mr-4">Raised:</span>{{ totalRaised }}</div>
            <div>
              <span class="text-grey-400 mr-4">Address:</span><a href="">{{ formatAddress(payoutAddress) }}</a>
            </div>
            <div class="xl:pt-6">
              <span class="text-grey-400 mr-4">In Round:</span>
              <span v-for="(round, index) in roundDetails" :key="index">
                {{ round.name }}<span v-if="index + 1 < roundDetails.length">, </span>
              </span>
            </div>
            <div>
              <span class="text-grey-400 mr-4">Matching:</span>
              <span v-for="(round, index) in roundDetails" :key="index">
                {{ round.matching }} {{ round.matchingToken.symbol
                }}<span v-if="index + 1 < roundDetails.length">, </span>
              </span>
            </div>
          </div>
        </div>
        <!-- add to cart, matching example -->
        <div class="text-center xl:text-left col-span-12 mb-8 xl:col-span-5 xl:col-end-12">
          <div class="px-4 xl:px-0 xl:text-right mb-8 xl:mb-0">
            <div class="flex justify-center mb-6 xl:justify-end">
              <!-- when item in cart add class "in-cart" + text in span "remove from cart"-->
              <button v-if="isInCart(grant?.id)" @click="removeFromCart(grant?.id)" class="btn btn-primary">
                <CartIcon class="icon-small" />
                Remove from Cart
              </button>
              <button v-else @click="addToCart(grant?.id)" class="btn btn-primary">
                <CartIcon class="icon-small" />
                Add to Cart
              </button>
            </div>

            <div>
              <div class="truncate">
                10 {{ roundDetails[0] ? roundDetails[0].donationToken.symbol : '' }} ≈
                <span v-for="(round, index) in roundDetails" :key="index">
                  {{ round.prediction10 }} {{ round.matchingToken.symbol
                  }}<span v-if="index + 1 < roundDetails.length">, </span>
                </span>
                Matching
              </div>
              <div class="truncate">
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
        <div class="text-left col-span-11 col-start-2">
          <div class="flex flex-wrap gap-x-6 gap-y-4">
            <div class="flex items-center gap-x-2 cursor-pointer group">
              <ShareIcon class="icon-primary stroke-2 w-9" />
              <span class="text-grey-400 group-hover:text-grey-500">Share</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Cart2Icon as CartIcon } from '@fusion-icons/vue/interface';
import { ArrowToprightIcon as ShareIcon } from '@fusion-icons/vue/interface';
import { formatAddress } from 'src/utils/utils';
import useCartStore from 'src/store/cart';
import { GrantsRoundDetails } from '@dgrants/types';

export default defineComponent({
  name: 'GrantDetailsRow',
  components: { CartIcon, ShareIcon },
  props: {
    grant: { type: Object, required: false, default: () => ({}) },
    logoURI: { type: String, required: false, default: undefined },
    payoutAddress: { type: String, required: false, default: '0x0' },
    totalRaised: { type: String, required: false, default: '0' },
    roundDetails: { type: Array as PropType<GrantsRoundDetails[]>, required: false, default: () => [] },
  },
  setup() {
    const { addToCart, isInCart, removeFromCart } = useCartStore();

    return { addToCart, isInCart, removeFromCart, formatAddress };
  },
});
</script>

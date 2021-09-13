<!-- GrantCard -->

<template>
  <figure class="group">
    <div
      class="relative cursor-pointer"
      @click="pushRoute({ name: 'dgrants-id', params: { id: BigNumber.from(id).toString() } })"
    >
      <img class="shadow-light" :src="imgurl" />
      <div class="absolute bottom-0 right-0">
        <!-- when item in cart, add class "in-cart" to <button> -->
        <button
          class="btn opacity-0 group-hover:opacity-100"
          :class="{ 'in-cart': isInCart(id) }"
          @click.stop="addToCart(id)"
        >
          <CartIcon />
        </button>
      </div>
    </div>
    <figcaption class="mt-4 px-4 lg:px-0">
      <div class="text-grey-500 font-medium truncate">{{ name }}</div>
      <div class="flex justify-between">
        <span class="text-grey-400"
          >by
          <a
            class="text-grey-500 underline"
            :href="getEtherscanUrl(ownerAddress, chainId, 'address')"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ formatAddress(ownerAddress) }}
          </a>
        </span>
        <span class="text-grey-400"
          >Raised: <span class="text-grey-500">{{ raised }}</span></span
        >
      </div>
    </figcaption>
  </figure>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
// --- Store ---
import useCartStore from 'src/store/cart';
// --- Methods and Data ---
import { BigNumber, BigNumberish } from 'src/utils/ethers';
import { formatAddress, getEtherscanUrl, pushRoute } from 'src/utils/utils';
// --- Icons ---
import { Cart2Icon as CartIcon } from '@fusion-icons/vue/interface';
import useWalletStore from 'src/store/wallet';

export default defineComponent({
  name: 'GrantCard',
  props: {
    id: { type: Object as PropType<BigNumberish>, required: true },
    name: { type: String, required: true },
    imgurl: { type: String, required: true },
    ownerAddress: { type: String, required: true },
    raised: { type: String, required: true },
  },
  components: { CartIcon },
  setup() {
    const { addToCart, isInCart } = useCartStore();
    const chainId = computed(() => {
      const { network } = useWalletStore();
      return network.value?.chainId ? network.value.chainId : 1;
    });
    return { addToCart, isInCart, formatAddress, getEtherscanUrl, pushRoute, BigNumber, chainId };
  },
});
</script>

<!-- GrantCard -->

<template>
  <figure class="group">
    <div
      class="relative cursor-pointer"
      @click="pushRoute({ name: 'dgrants-id', params: { id: BigNumber.from(id).toString() } })"
    >
      <img class="shadow-light" :src="imgurl" />
      <div class="absolute bottom-0 right-0">
        <button
          class="btn opacity-0 group-hover:opacity-100"
          :class="{ 'in-cart': isInCart(id) }"
          @click.stop="isInCart(id) ? removeFromCart(id) : addToCart(id)"
        >
          <CartIcon />
        </button>
      </div>
    </div>
    <figcaption class="mt-4">
      <div class="text-grey-500 font-medium truncate">{{ name }}</div>
      <div>
        <span class="text-grey-400"
          >by
          <a
            class="text-grey-500 underline ml-1"
            :href="getEtherscanUrl(ownerAddress, 'address')"
            target="_blank"
            rel="noopener noreferrer"
            >{{ formatAddress(ownerAddress) }}
          </a>
        </span>
      </div>
      <div>
        <span class="text-grey-400">Raised:</span><span class="ml-1">{{ raised }}</span>
      </div>
    </figcaption>
  </figure>
</template>

<script lang="ts">
import { ref, defineComponent, PropType } from 'vue';
// --- Store ---
import useCartStore from 'src/store/cart';
import useDataStore from 'src/store/data';
// --- Methods and Data ---
import { BigNumber, BigNumberish } from 'src/utils/ethers';
import { filterContributionsByGrantId } from 'src/utils/data/contributions';
import { formatNumber, formatAddress, getEtherscanUrl, pushRoute } from 'src/utils/utils';
// --- Icons ---
import { Cart2Icon as CartIcon } from '@fusion-icons/vue/interface';

function getTotalRaised(grantId: any) {
  const { grantRounds, grantContributions } = useDataStore();
  const contributions = filterContributionsByGrantId(grantId.toString(), grantContributions?.value || []);
  const raised = `${formatNumber(
    contributions.reduce((total, contribution) => contribution?.amount + total, 0),
    2
  )} ${grantRounds.value && grantRounds.value[0].donationToken.symbol}`;
  return { raised };
}

export default defineComponent({
  name: 'GrantCard',
  props: {
    id: { type: Object as PropType<BigNumberish>, required: true },
    name: { type: String, required: true },
    imgurl: { type: String, required: true },
    ownerAddress: { type: String, required: true },
  },
  components: { CartIcon },
  setup(props) {
    const grantId = ref<any>(props.id);
    const { addToCart, isInCart, removeFromCart } = useCartStore();
    return {
      addToCart,
      removeFromCart,
      isInCart,
      formatAddress,
      getEtherscanUrl,
      pushRoute,
      BigNumber,
      ...getTotalRaised(grantId),
    };
  },
});
</script>

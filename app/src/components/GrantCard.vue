<!-- GrantCard -->

<template>
  <figure
    class="group cursor-pointer"
    @click="pushRoute({ name: 'dgrants-id', params: { id: BigNumber.from(id).toString() } })"
  >
    <!--wrapper to position img and cart button-->
    <div class="relative">
      <!--img-->
      <div class="aspect-w-16 aspect-h-9 shadow-light">
        <img class="w-full h-full object-center object-cover group-hover:opacity-90" :src="imgurl" />
      </div>

      <!--cart button-->
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
      <div class="truncate">{{ name }}</div>
      <div>
        <span class="text-grey-400"
          >by
          <a
            class="link ml-1"
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
import { ref, defineComponent, PropType, computed } from 'vue';
// --- Store ---
import useCartStore from 'src/store/cart';
import useDataStore from 'src/store/data';
// --- Methods and Data ---
import { BigNumber, BigNumberish } from 'src/utils/ethers';
import { filterContributionsByGrantId } from 'src/utils/data/contributions';
import { formatNumber, formatAddress, getEtherscanUrl, pushRoute } from 'src/utils/utils';
// --- Icons ---
import { Cart2Icon as CartIcon } from '@fusion-icons/vue/interface';

function getTotalRaised(grantId: BigNumberish) {
  const { grantRounds, grantContributions } = useDataStore();
  const contributions = filterContributionsByGrantId(grantId.toString(), grantContributions?.value || []);
  const raised = `${formatNumber(
    contributions.reduce((total, contribution) => contribution?.amount + total, 0),
    2
  )} ${grantRounds.value && grantRounds.value[0].donationToken.symbol}`;
  return raised;
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
    const grantId = ref<BigNumberish>(props.id);
    const raised = computed(() => getTotalRaised(grantId.value));
    const { addToCart, isInCart, removeFromCart } = useCartStore();

    return {
      addToCart,
      removeFromCart,
      isInCart,
      formatAddress,
      getEtherscanUrl,
      pushRoute,
      BigNumber,
      raised,
    };
  },
});
</script>

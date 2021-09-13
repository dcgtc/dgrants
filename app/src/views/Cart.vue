<template>
  <!-- Empty cart -->
  <div v-if="!txHash && cart.length === 0">
    <BaseHeader :name="`My Cart (${cart.length})`" />

    <div class="px-4 md:px-12">
      <div class="py-8 border-b border-grey-100">
        <div class="flex gap-x-4 justify-end">
          <span>Your Cart is empty.</span>
        </div>
      </div>

      <div class="mt-12">
        <div class="flex gap-x-4 justify-end">
          <button @click="pushRoute({ name: 'dgrants' })" class="btn">explore grants</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Cart has items and no checkout transaction -->
  <div v-else-if="!txHash">
    <BaseHeader :name="`My Cart (${cart.length})`" />

    <!-- Action Nav / Cart Toolbar ( Share & Clear Cart -->
    <div class="px-4 md:px-12 py-8 border-b border-grey-100">
      <div class="flex flex-wrap gap-x-6 gap-y-4">
        <div @click="NOT_IMPLEMENTED('Share cart')" class="flex items-center gap-x-2 cursor-pointer group">
          <ArrowToprightIcon class="icon icon-small icon-primary" />
          <span class="text-grey-400 group-hover:text-grey-500">Share</span>
        </div>

        <div @click="clearCart" class="flex items-center gap-x-2 cursor-pointer group ml-auto">
          <CloseIcon class="icon icon-small icon-primary" />
          <span class="text-grey-400 group-hover:text-grey-500">Clear</span>
        </div>
      </div>
    </div>

    <!-- Cart Items -->
    <div v-for="item in cart" :key="item.grantId" class="px-4 md:px-12">
      <div class="py-8 border-b border-grey-100">
        <div class="grid grid-flow-col items-center gap-x-8">
          <div>
            <div class="grid grid-cols-4 items-center gap-x-8 gap-y-4">
              <!-- image -->
              <div class="col-span-4 lg:col-span-1">
                <figure class="max-w-lg">
                  <img
                    class="shadow-light"
                    :src="grantMetadata[item.metaPtr]?.logoURI || 'src/assets/placeholder_grant.svg'"
                  />
                </figure>
              </div>
              <!-- text -->
              <div class="col-span-4 lg:col-span-1">
                <div>{{ grantMetadata[item.metaPtr]?.name }}</div>
              </div>
              <!-- input -->
              <div class="col-span-4 lg:col-span-1">
                <div class="flex">
                  <BaseInput
                    :modelValue="item.contributionAmount"
                    @update:modelValue="
                      item.contributionAmount = Number($event);
                      updateCart(item.grantId, item.contributionAmount);
                    "
                    type="number"
                    width="w-1/2"
                    customcss="border-r-0"
                  />

                  <BaseSelect
                    :modelValue="item.contributionToken"
                    @update:modelValue="
                      item.contributionToken = $event;
                      updateCart(item.grantId, item.contributionToken.address);
                    "
                    :options="supportedTokens"
                    label="symbol"
                    width="w-1/2"
                  />
                </div>
              </div>
              <!-- matching -->
              <div class="col-span-4 lg:col-span-1">
                <div class="text-grey-400 text-left lg:text-right">
                  <!-- TODO use real match estimates -->
                  <p v-if="true">not in an active round</p>
                  <p v-else>USD estimated matching</p>
                </div>
              </div>
            </div>
          </div>

          <div class="justify-self-end">
            <CloseIcon @click="removeFromCart(item.grantId)" class="icon icon-small icon-primary cursor-pointer" />
          </div>
        </div>
      </div>
    </div>

    <!-- Checkout -->
    <div class="px-4 md:px-12">
      <div class="py-8 border-b border-grey-100">
        <div class="flex gap-x-4 justify-end">
          <span class="text-grey-400">Contributing:</span>
          <span>{{ cartSummaryString }}</span>
        </div>
      </div>

      <div class="py-8 border-b border-grey-100">
        <div class="flex gap-x-4 justify-end">
          <span class="text-grey-400">Equivalent to:</span>
          <span>~{{ formatNumber(equivalentContributionAmount, 2) }} DAI</span>
        </div>
      </div>

      <div class="py-8 border-b border-grey-100">
        <div class="flex gap-x-4 justify-end">
          <span class="text-grey-400">Estimated matching value:</span>
          <span>TODO</span>
        </div>
      </div>

      <div class="mt-12 mb-12">
        <div class="flex gap-x-4 justify-end">
          <button @click="executeCheckout" class="btn">checkout</button>
        </div>
      </div>
    </div>
  </div>

  <!-- Checkout transaction is pending -->
  <div v-else-if="txHash">
    <!-- We use a -1px bottom margin so overlapping borders of BaseHeader and TransactionStatus don't make the border thicker -->
    <BaseHeader name="Checkout Transaction Status" style="margin-bottom: -1px" />
    <TransactionStatus
      @onReceipt="completeCheckout"
      :hash="txHash"
      buttonLabel="Home"
      :buttonAction="() => pushRoute({ name: 'Home' })"
    />
  </div>
</template>

<script lang="ts">
// --- External Imports ---
import { computed, defineComponent, onMounted, ref } from 'vue';
import { ArrowToprightIcon, CloseIcon } from '@fusion-icons/vue/interface';
// --- Component Imports ---
import BaseHeader from 'src/components/BaseHeader.vue';
import BaseInput from 'src/components/BaseInput.vue';
import BaseSelect from 'src/components/BaseSelect.vue';
import TransactionStatus from 'src/components/TransactionStatus.vue';
// --- Store ---
import useCartStore from 'src/store/cart';
import useDataStore from 'src/store/data';
import useWalletStore from 'src/store/wallet';
// --- Methods and Data ---
import { pushRoute, formatNumber } from 'src/utils/utils';

function useCart() {
  const { cart, cartSummary, cartSummaryString, checkout, clearCart, fetchQuotes, initializeCart, quotes, removeFromCart, updateCart } = useCartStore(); // prettier-ignore

  onMounted(async () => {
    await fetchQuotes(); // get latest quotes
    initializeCart(); // make sure cart store is initialized
  });
  const txHash = ref<string>();
  const status = ref<'not started' | 'pending' | 'success' | 'failure'>('pending');

  const equivalentContributionAmount = computed(() => {
    let sum = 0;
    for (const [tokenAddress, amount] of Object.entries(cartSummary.value)) {
      if (!amount) continue;
      const exchangeRate = quotes.value[tokenAddress] ?? 0;
      sum += amount * exchangeRate;
    }
    return sum;
  });

  async function executeCheckout() {
    const tx = await checkout();
    txHash.value = tx.hash;
  }

  function completeCheckout(success: boolean) {
    if (success) clearCart();
  }

  return { cart, cartSummaryString, clearCart, completeCheckout, equivalentContributionAmount, executeCheckout, removeFromCart, status, txHash, updateCart }; // prettier-ignore
}

export default defineComponent({
  name: 'Cart',
  components: { BaseHeader, BaseInput, BaseSelect, TransactionStatus, ArrowToprightIcon, CloseIcon },
  setup() {
    const { grantMetadata } = useDataStore();
    const { supportedTokens } = useWalletStore();
    const NOT_IMPLEMENTED = (msg: string) => window.alert(`NOT IMPLEMENTED: ${msg}`);
    return { ...useCart(), pushRoute, grantMetadata, supportedTokens, NOT_IMPLEMENTED, formatNumber };
  },
});
</script>

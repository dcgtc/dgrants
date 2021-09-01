<template>
  <!-- Empty cart -->
  <div v-if="!txHash && cart.length === 0">
    <div class="mt-10">Your cart is empty</div>
    <button @click="pushRoute({ name: 'dgrants' })" class="btn btn-primary mx-auto mt-6">Browse Grants</button>
  </div>

  <!-- Cart has items and no checkout transaction -->
  <div v-else-if="!txHash">
    <BaseHeader :name="`My Cart (${cart.length})`" />
    <!-- Cart toolbar -->
    <div
      class="flex justify-between max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 border-b border-grey-100 text-grey-400"
    >
      <div class="flex items-center justify-start">
        <div @click="NOT_IMPLEMENTED('Share cart')" class="flex items-center justify-start cursor-pointer">
          <ArrowToprightIcon class="icon-small icon-primary mr-2" /> Share cart
        </div>
      </div>
      <div @click="clearCart" class="flex items-center justify-end cursor-pointer">
        <CloseIcon class="icon-small icon-primary mr-2" /> Clear cart
      </div>
    </div>
    <!-- Cart items -->
    <div class="bg-white shadow sm:rounded-md max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <ul>
        <!-- For each grant in the cart -->
        <li v-for="item in cart" :key="item.grantId">
          <div class="flex justify-between items-center border-b border-grey-100 py-10">
            <!-- Logo and name -->
            <div
              class="flex items-center cursor-pointer"
              @click="pushRoute({ name: 'dgrants-id', params: { id: item.id.toString() } })"
            >
              <img
                class="h-12 w-12"
                :src="grantMetadata[item.metaPtr]?.logoURI || 'src/assets/logo.png'"
                alt="Grant logo"
              />
              <p class="ml-4 text-sm text-left font-medium truncate max-w-lg">
                {{ grantMetadata[item.metaPtr]?.name }}
              </p>
            </div>

            <!-- Contribution info -->
            <div class="flex space-x-2 items-center">
              <!-- Contribution token and amount -->
              <div class="flex">
                <!-- We use a -1px right margin so overlapping borders don't make the border thicker -->
                <BaseInput
                  style="margin-right: -1px"
                  :modelValue="item.contributionAmount"
                  @update:modelValue="
                    item.contributionAmount = Number($event);
                    updateCart(item.grantId, item.contributionAmount);
                  "
                  type="number"
                  width="w-36"
                />
                <BaseSelect
                  :modelValue="item.contributionToken"
                  @update:modelValue="
                    item.contributionToken = $event;
                    updateCart(item.grantId, item.contributionToken.address);
                  "
                  :options="SUPPORTED_TOKENS"
                  label="symbol"
                />
              </div>

              <!-- Match estimate -->
              <!-- TODO use real match estimates -->
              <div class="flex-none hidden md:block px-4">
                <p v-if="true" class="text-sm text-left text-grey-300">not in an active round</p>
                <p v-else class="text-sm text-left text-grey-500">USD estimated matching</p>
              </div>

              <!-- Delete from cart -->
              <div>
                <CloseIcon @click="removeFromCart(item.grantId)" class="icon-small icon-primary" />
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Checkout -->
    <div class="bg-white shadow sm:rounded-md max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-right">
      <div class="border-b border-grey-100 py-8">
        <span class="text-grey-300">Contributing:</span> {{ cartSummaryString }}
      </div>
      <div class="border-b border-grey-100 py-8"><span class="text-grey-300">Equivalent to:</span> TODO USD</div>
      <div class="border-b border-grey-100 py-8">
        <span class="text-grey-300">Estimated matching value:</span> TODO USD
      </div>
      <div class="py-8 flex justify-end">
        <button @click="executeCheckout" class="btn">Checkout</button>
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
import { defineComponent, onMounted, ref } from 'vue';
import { ArrowToprightIcon, CloseIcon } from '@fusion-icons/vue/interface';
// --- App Imports ---
import BaseHeader from 'src/components/BaseHeader.vue';
import BaseInput from 'src/components/BaseInput.vue';
import BaseSelect from 'src/components/BaseSelect.vue';
import TransactionStatus from 'src/components/TransactionStatus.vue';
// --- Store ---
import useCartStore from 'src/store/cart';
import useDataStore from 'src/store/data';
// --- Methods and Data ---
import { SUPPORTED_TOKENS } from 'src/utils/constants';
import { pushRoute } from 'src/utils/utils';

function useCart() {
  const { cart, cartSummaryString, removeFromCart, clearCart, initializeCart, updateCart, checkout } = useCartStore(); // prettier-ignore

  onMounted(() => initializeCart()); // make sure cart store is initialized
  const txHash = ref<string>();
  const status = ref<'not started' | 'pending' | 'success' | 'failure'>('pending');

  async function executeCheckout() {
    const tx = await checkout();
    txHash.value = tx.hash;
  }

  function completeCheckout(success: boolean) {
    if (success) clearCart();
  }

  return { txHash, status, cart, updateCart, clearCart, removeFromCart, cartSummaryString, executeCheckout, completeCheckout }; // prettier-ignore
}

export default defineComponent({
  name: 'Cart',
  components: { BaseHeader, BaseInput, BaseSelect, TransactionStatus, ArrowToprightIcon, CloseIcon },
  setup() {
    const { grantMetadata } = useDataStore();
    const NOT_IMPLEMENTED = (msg: string) => window.alert(`NOT IMPLEMENTED: ${msg}`);
    return { ...useCart(), pushRoute, grantMetadata, SUPPORTED_TOKENS, NOT_IMPLEMENTED };
  },
});
</script>

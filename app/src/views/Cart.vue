<template>
  <!-- Header -->
  <h1 class="my-6 text-center text-3xl font-extrabold text-gray-900">Cart {{ cart.length }}</h1>

  <!-- Empty cart -->
  <div v-if="cart.length === 0">
    <div>Your cart is empty</div>
    <button @click="pushRoute({ name: 'dgrants' })" class="btn btn-primary mt-6">Browse Grants</button>
  </div>

  <!-- Cart has items -->
  <div v-else>
    <!-- Cart toolbar -->
    <div class="flex justify-between mb-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 border-t-2 border-b-2">
      <div class="flex justify-start">
        <button @click="NOT_IMPLEMENTED('Share cart')" class="btn btn-flat">Share cart</button>
      </div>
      <button @click="clearCart" class="btn btn-flat">Clear cart</button>
    </div>
    <!-- Cart items -->
    <div class="bg-white shadow sm:rounded-md max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <ul class="divide-y divide-gray-200">
        <!-- For each grant in the cart -->
        <li v-for="item in cart" :key="item.grantId">
          <div class="flex justify-between items-center px-4 py-4 sm:px-6">
            <!-- Logo and name -->
            <div
              class="flex items-center cursor-pointer"
              @click="pushRoute({ name: 'dgrants-id', params: { id: item.id.toString() } })"
            >
              <img
                class="h-12 w-12"
                :src="grantMetadata[item.metaPtr]?.logoURI || 'src/assets/logo.svg'"
                alt="Grant logo"
              />
              <p class="ml-4 text-sm text-left font-medium truncate max-w-lg">
                {{ grantMetadata[item.metaPtr]?.name }}
              </p>
            </div>

            <!-- Contribution info -->
            <div class="flex space-x-2 items-center">
              <!-- Contribution token and amount -->
              <div class="flex-none flex">
                <BaseInput
                  :modelValue="item.contributionAmount"
                  @update:modelValue="
                    item.contributionAmount = Number($event);
                    updateCart(item.grantId, item.contributionAmount);
                  "
                  type="number"
                />
                <BaseSelect
                  class="ml-2"
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
              <div class="flex-none hidden md:block">
                <p class="text-sm text-left text-gray-400">not in an active round</p>
              </div>

              <!-- Delete from cart -->
              <div>
                <CloseIcon
                  @click="removeFromCart(item.grantId)"
                  class="icon cursor-pointer flex-none h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Checkout -->
    <div class="mt-10">
      <div>{{ cartSummaryString }}</div>
      <div class="flex justify-center mt-5">
        <button @click="checkout" class="btn btn-secondary">Checkout</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
// --- External Imports ---
import { defineComponent, onMounted } from 'vue';
import { CloseIcon } from '@fusion-icons/vue/interface';

// --- App Imports ---
import BaseInput from 'src/components/BaseInput.vue';
import BaseSelect from 'src/components/BaseSelect.vue';
// --- Store ---
import useCartStore from 'src/store/cart';
import useDataStore from 'src/store/data';
// --- Methods and Data ---
import { SUPPORTED_TOKENS } from 'src/utils/constants';
import { pushRoute } from 'src/utils/utils';

function useCart() {
  const { cart, cartSummaryString, removeFromCart, clearCart, initializeCart, updateCart, checkout } = useCartStore(); // prettier-ignore
  onMounted(() => initializeCart()); // make sure cart store is initialized
  return { cart, updateCart, clearCart, removeFromCart, cartSummaryString, checkout };
}

export default defineComponent({
  name: 'Cart',
  components: { BaseInput, BaseSelect, CloseIcon },
  setup() {
    const { grantMetadata } = useDataStore();
    const NOT_IMPLEMENTED = (msg: string) => window.alert(`NOT IMPLEMENTED: ${msg}`);
    return { ...useCart(), pushRoute, grantMetadata, SUPPORTED_TOKENS, NOT_IMPLEMENTED };
  },
});
</script>

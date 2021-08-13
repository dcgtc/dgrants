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
        <button class="btn btn-flat mr-5">Save as collection</button>
        <button class="btn btn-flat">Share cart</button>
      </div>
      <button @click="clearCartAndUpdateState" class="btn btn-flat">Clear cart</button>
    </div>
    <!-- Cart items -->
    <div class="bg-white shadow sm:rounded-md max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <ul class="divide-y divide-gray-200">
        <!-- For each grant -->
        <li v-for="grant in cart" :key="grant.grantId">
          <div class="flex justify-between items-center px-4 py-4 sm:px-6">
            <!-- Logo and name -->
            <div class="flex items-center">
              <img class="h-12 w-12" :src="grant.logoUrl || 'src/assets/logo.png'" alt="" />
              <p class="text-sm text-left font-medium truncate">{{ grant.grantId }} {{ grant.metaPtr }}</p>
            </div>

            <!-- Contribution info -->
            <div class="flex space-x-2 items-center">
              <!-- Contribution token and amount -->
              <div class="flex-none flex">
                <BaseInput v-model.number="grant.contributionAmount" type="number" />
                <BaseSelect v-model="grant.contributionToken" :options="SUPPORTED_TOKENS" label="symbol" />
              </div>

              <!-- Match estimate -->
              <div class="flex-none hidden md:block">
                <p class="text-sm text-left text-gray-400">not in an active round</p>
              </div>

              <!-- Delete from cart -->
              <div>
                <XIcon
                  @click="removeItemAndUpdateState(grant.grantId)"
                  class="cursor-pointer flex-none h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>

    <!-- Checkout -->
    <button @click="checkout" class="btn btn-secondary">Checkout</button>
  </div>
</template>

<script lang="ts">
// --- External Imports ---
import { defineComponent, onMounted, ref, watch } from 'vue';
import { XIcon } from '@heroicons/vue/solid';

// --- App Imports ---
import BaseInput from 'src/components/BaseInput.vue';
import BaseSelect from 'src/components/BaseSelect.vue';
import { SUPPORTED_TOKENS, SUPPORTED_TOKENS_MAPPING } from 'src/utils/constants';
import { BigNumberish } from 'src/utils/ethers';
import { pushRoute, clearCart, loadCart, removeFromCart, setCart, formatDonateInputs } from 'src/utils/utils';
import useDataStore from 'src/store/data';
import { CartItem, CartItemOptions } from 'src/types';

function useCart() {
  const { grants, poll, startPolling } = useDataStore();
  const selectedToken = ref(SUPPORTED_TOKENS[0]);
  const rawCart = ref<CartItemOptions[]>(loadCart());
  const cart = ref<CartItem[]>([]);

  // Clearing and removing cart items modifies localStorage, so we use these method to keep component state in sync
  const clearCartAndUpdateState = () => (rawCart.value = clearCart());
  const removeItemAndUpdateState = (grantId: BigNumberish) => (rawCart.value = removeFromCart(grantId));

  // Editing contribution amount or token modifies compoent state, so we use a watcher to keep localStorage data
  // in sync with cart when user modifies cart
  watch(
    cart,
    (newCart /*, prevCart */) => {
      const localStorageCart = newCart.map((item) => {
        const { contributionAmount, contributionToken, grantId } = item;
        return { grantId, contributionAmount, contributionTokenAddress: contributionToken.address };
      });
      setCart(localStorageCart);
    },
    { deep: true }
  );

  // Initialize cart
  onMounted(async () => {
    // Wait for poll to complete to ensure grants.value is not undefined
    startPolling();
    await poll();
    // Update cart. TODO `grants.value.filter` may be slow for large number of grants
    cart.value = rawCart.value.map((cartItem) => {
      const grant = grants.value.filter((grant) => grant.id.toString() === cartItem.grantId)[0];
      return {
        ...grant,
        grantId: cartItem.grantId,
        contributionAmount: cartItem.contributionAmount,
        // notice we remove the cartItem.contributionTokenAddress field and replace it with the below. The token
        // selection component uses the full TokenInfo object, so that's what the `cart` data uses instead of an address
        contributionToken: SUPPORTED_TOKENS_MAPPING[cartItem.contributionTokenAddress],
      } as CartItem;
    });
  });

  function checkout() {
    console.log('checkout');
    const { swaps, donations } = formatDonateInputs(cart.value);
    swaps;
    donations;
  }

  return { cart, checkout, clearCartAndUpdateState, removeItemAndUpdateState, selectedToken };
}

export default defineComponent({
  name: 'Cart',
  components: { BaseInput, BaseSelect, XIcon },
  setup() {
    return { ...useCart(), pushRoute, SUPPORTED_TOKENS };
  },
});
</script>

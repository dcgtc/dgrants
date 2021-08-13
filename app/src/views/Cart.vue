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
      <button @click="clearCartState" class="btn btn-flat">Clear cart</button>
    </div>
    <!-- Cart items -->
    <div class="bg-white shadow overflow-hidden sm:rounded-md max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
      <ul class="divide-y divide-gray-200">
        <!-- For each grant -->
        <li v-for="grant in cart" :key="grant.grantId">
          <div class="flex justify-between items-center px-4 py-4 sm:px-6">
            <!-- Logo and name -->
            <div class="flex items-center">
              <img class="h-12 w-12" :src="grant.logoUrl || 'src/assets/logo.png'" alt="" />
              <p class="text-sm text-left font-medium truncate">
                {{ grant.name || 'name not found' }}
              </p>
            </div>

            <!-- Contribution info -->
            <div class="flex space-x-2">
              <!-- Contribution token and amount -->
              <div class="flex-none flex">
                <BaseInput />
              </div>

              <!-- Match estimate -->
              <div class="flex-none hidden md:block">
                <p class="text-sm text-left text-gray-400">not in an active round</p>
              </div>

              <!-- Delete from cart -->
              <div>
                <XIcon class="flex-none h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
            </div>
          </div>
        </li>
      </ul>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { pushRoute, clearCart, loadCart } from 'src/utils/utils';
import useDataStore from 'src/store/data';
import { CartItemOptions } from 'src/types';
import { Grant } from '@dgrants/types';
import { XIcon } from '@heroicons/vue/solid';
import BaseInput from 'src/components/BaseInput.vue';

type CartItem = CartItemOptions & Grant;

function useCart() {
  const { grants } = useDataStore();

  const rawCart = ref<CartItemOptions[]>(loadCart());
  const clearCartState = () => (rawCart.value = clearCart());
  const cart = computed(() => {
    // Use cart info form localStorage and concatenate it with grant data from store
    return rawCart.value.map((cartItem) => {
      // grants.value is likely undefined as page first loads before data is fetched, hence the `grants.value &&`
      const grant = grants.value && grants.value.filter((grant) => grant.id.toString() === cartItem.grantId)[0]; // TODO `grants.value.filter` may be slow for large number of grants
      return { ...cartItem, ...grant } as CartItem;
    });
  });

  return { cart, clearCartState };
}

export default defineComponent({
  name: 'Cart',
  components: { BaseInput, XIcon },
  setup() {
    return { ...useCart(), pushRoute };
  },
});
</script>

<template>
  <h1 class="my-6 text-center text-3xl font-extrabold text-gray-900">Cart</h1>

  <div v-if="cart.length === 0">
    <div>Your cart is empty</div>
    <button @click="pushRoute({ name: 'dgrants' })" class="btn btn-primary mt-6">Browse Grants</button>
  </div>

  <div v-else>
    <div v-for="item in cart" :key="item.grantId" class="mb-10">
      <div>{{ item }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { pushRoute, loadCart } from 'src/utils/utils';
import useDataStore from 'src/store/data';
import { CartItemOptions } from 'src/types';
import { Grant } from '@dgrants/types';

type CartItem = CartItemOptions & Grant;

function useCart() {
  const { grants } = useDataStore();

  const cart = computed(() => {
    // Load cart info form localStorage, then concatenate it with grant data from store
    const rawCart = loadCart();
    return rawCart.map((cartItem) => {
      // grants.value is likely undefined as page first loads before data is fetched, hence the `grants.value &&`
      const grant = grants.value && grants.value.filter((grant) => grant.id.toString() === cartItem.grantId)[0]; // TODO `grants.value.filter` may be slow for large number of grants
      return { ...cartItem, ...grant } as CartItem;
    });
  });

  return { cart, grants };
}

export default defineComponent({
  name: 'Cart',
  setup() {
    return { ...useCart(), pushRoute };
  },
});
</script>

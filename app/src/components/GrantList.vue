<template>
  <div class="max-w-screen-lg mx-auto">
    <!-- View Existing Grants -->
    <ul class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      <li
        v-for="grant in grants"
        :key="grant.id.toString()"
        class="
          col-span-1
          bg-white
          rounded-lg
          shadow
          divide-y divide-gray-400 divide-opacity-30
          border border-gray-200
          hover:border-primary-500
        "
      >
        <div
          @click="pushRoute({ name: 'dgrants-id', params: { id: grant.id.toString() } })"
          class="cursor-pointer divide-y divide-gray-400 divide-opacity-30"
        >
          <div class="w-full flex items-center justify-between p-6 space-x-6 hover:border">
            <div class="flex-1 truncate text-left">
              <div class="flex items-center space-x-3">
                <h3 class="text-gray-900 text-sm font-medium truncate">
                  Grant Name: {{ grantMetadata[grant.metaPtr].name }}
                </h3>
              </div>
              <p class="mt-1 text-gray-500 text-sm truncate">{{ grantMetadata[grant.metaPtr].description }}</p>
            </div>
          </div>
          <div>
            <div class="pl-6 p-2 -mt-px flex divide-x divide-gray-400 divide-opacity-30">
              <div class="w-0 flex-1 flex">
                <div class="flex-1 truncate text-left">
                  <p class="mt-1 text-gray-500 text-sm truncate">Owner</p>
                  <div class="flex items-center space-x-3">
                    <h3 class="text-gray-900 text-sm font-medium">{{ formatAddress(grant.owner) }}</h3>
                  </div>
                </div>
              </div>
              <div class="pl-6 -ml-px w-0 flex-1 flex">
                <div class="w-0 flex-1 flex">
                  <div class="flex-1 truncate text-left">
                    <p class="mt-1 text-gray-500 text-sm truncate">Payee</p>
                    <div class="flex items-center space-x-3">
                      <h3 class="text-gray-900 text-sm font-medium">{{ formatAddress(grant.payee) }}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="divide-x divide-gray-400 divide-opacity-30 flex justify-center">
          <button v-if="isInCart(grant.id)" @click="removeFromCart(grant.id)" class="my-2 btn btn-primary">
            Remove from Cart
          </button>
          <button v-else @click="addToCart(grant.id)" class="my-2 btn btn-primary">Add to Cart</button>
        </div>
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import useCartStore from 'src/store/cart';

import { formatAddress, pushRoute } from 'src/utils/utils';
import { Grant, GrantRoundMetadataResolution } from '@dgrants/types';

export default defineComponent({
  name: 'GrantList',
  props: {
    // --- Required props ---
    grants: { type: Array as PropType<Grant[]>, required: true },
    grantMetadata: { type: Object as PropType<Record<string, GrantRoundMetadataResolution>>, required: true },
  },
  setup() {
    const { addToCart, isInCart, removeFromCart } = useCartStore();
    return { isInCart, addToCart, removeFromCart, formatAddress, pushRoute };
  },
});
</script>

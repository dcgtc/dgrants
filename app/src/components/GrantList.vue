<template>
  <ul class="base-grid">
    <li v-for="grant in grants" :key="grant.id.toString()">
      <!-- ToDo: Raised data -->
      <GrantCard
        :id="grant.id"
        :name="grantMetadata[grant.metaPtr].name ?? ''"
        :ownerAddress="grant.owner"
        :imgurl="grantMetadata[grant.metaPtr].logoURI || '/placeholder_grant.svg'"
        raised="100"
      />
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
// --- App Imports ---
import GrantCard from 'src/components/GrantCard.vue';
// --- Store ---
import useCartStore from 'src/store/cart';
// --- Types ---
import { Grant, GrantMetadataResolution } from '@dgrants/types';

export default defineComponent({
  name: 'GrantList',
  components: { GrantCard },
  props: {
    // --- Required props ---
    grants: { type: Array as PropType<Grant[]>, required: true },
    grantMetadata: { type: Object as PropType<Record<string, GrantMetadataResolution>>, required: true },
  },
  setup() {
    const { addToCart, isInCart, removeFromCart } = useCartStore();
    return { isInCart, addToCart, removeFromCart };
  },
});
</script>

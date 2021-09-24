<template>
  <!-- General filters -->
  <BaseFilterNav :items="grantRegistryListNav" :button="button" title="grants:" />
  <ul class="base-grid">
    <li v-for="grant in sortedGrants" :key="grant.id.toString()">
      <!-- ToDo: Raised data -->
      <GrantCard
        :id="grant.id"
        :name="grantMetadata[grant.metaPtr].name ?? ''"
        :ownerAddress="grant.owner"
        :imgurl="grantMetadata[grant.metaPtr].logoURI || '/placeholder_grant.svg'"
      />
    </li>
  </ul>
</template>

<script lang="ts">
import { computed, defineComponent, onUnmounted, PropType, ref } from 'vue';
// --- App Imports ---
import BaseFilterNav from 'src/components/BaseFilterNav.vue';
import GrantCard from 'src/components/GrantCard.vue';
// --- Store ---
import useCartStore from 'src/store/cart';
// --- Types ---
import { FilterNavButton, FilterNavItem, Grant, GrantMetadataResolution } from '@dgrants/types';
import { SortingMode } from 'src/types';
import { bigNumberComparator } from 'src/utils/sorting';

const defaultSortingMode = 'descending';
const grantsSortingMode = ref<SortingMode>(defaultSortingMode);
const shuffleNonce = ref(1);

const filterNavTag = computed(() => {
  switch (grantsSortingMode.value) {
    case 'descending': {
      return 'newest';
    }
    case 'ascending': {
      return 'oldest';
    }
    case 'random': {
      return 'shuffle';
    }
    default: {
      return 'newest';
    }
  }
});

const grantRegistryListNav = computed(
  () =>
    <FilterNavItem[]>[
      {
        label: 'Sort',
        tag: filterNavTag.value,
        menu: [
          {
            label: 'newest',
            action: () => {
              grantsSortingMode.value = 'descending';
            },
          },
          {
            label: 'oldest',
            action: () => {
              grantsSortingMode.value = 'ascending';
            },
          },
          {
            label: 'shuffle',
            action: () => {
              shuffleNonce.value++;
              grantsSortingMode.value = 'random';
            },
          },
        ],
      },
    ]
);

export default defineComponent({
  name: 'GrantList',
  components: { BaseFilterNav, GrantCard },
  props: {
    // --- Required props ---
    grants: { type: Array as PropType<Grant[]>, required: true },
    grantMetadata: { type: Object as PropType<Record<string, GrantMetadataResolution>>, required: true },
    button: { type: Object as PropType<FilterNavButton>, required: false },
  },
  setup(props) {
    const { addToCart, isInCart, removeFromCart } = useCartStore();

    const sortedGrants = computed(() => {
      // Force to recalculate when clicking "Shuffle" consecutively.
      shuffleNonce.value;
      return [...props.grants].sort((a, b) => bigNumberComparator(a.id, b.id, grantsSortingMode.value));
    });

    onUnmounted(() => {
      grantsSortingMode.value = defaultSortingMode;
    });

    return {
      sortedGrants,
      isInCart,
      addToCart,
      removeFromCart,
      grantRegistryListNav,
    };
  },
});
</script>

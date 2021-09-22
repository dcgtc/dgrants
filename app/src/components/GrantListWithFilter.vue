<template>
  <!-- General filters -->
  <BaseFilterNav :items="grantRegistryListNav" :button="button" title="grants:" />
  <GrantList :grants="sortedGrants" :grantMetadata="grantMetadata" />
</template>

<script lang="ts">
import { computed, defineComponent, PropType, ref, onUnmounted } from 'vue';
// --- App Imports ---
import BaseFilterNav from 'src/components/BaseFilterNav.vue';
import GrantList from 'src/components/GrantList.vue';
// --- Store ---
import useCartStore from 'src/store/cart';
// --- Types ---
import { FilterNavButton, FilterNavItem, Grant, GrantMetadataResolution } from '@dgrants/types';
import { SortingMode } from 'src/types';
// --- Utils ---
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
  name: 'GrantListWithFilter',
  components: { BaseFilterNav, GrantList },
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

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
import { computed, defineComponent, onMounted, onUnmounted, PropType, ref } from 'vue';
// --- App Imports ---
import BaseFilterNav from 'src/components/BaseFilterNav.vue';
import GrantCard from 'src/components/GrantCard.vue';
// --- Store ---
import useCartStore from 'src/store/cart';
import useWalletStore from 'src/store/wallet';
// --- Types ---
import { FilterNavButton, FilterNavItem, Grant, GrantMetadataResolution } from '@dgrants/types';

type SortingMode = 'newest' | 'oldest' | 'shuffle';

const defaultSortingMode = 'newest';
const grantsSortingMode = ref<SortingMode>(defaultSortingMode);
const grantIdList = ref([]);

function createCustomGrantList(grants: Grant[]) {
  const customGrantList: Grant[] = [];
  for (const val of grantIdList.value) {
    if (!grants[val]) return;
    customGrantList.push(grants[val]);
  }
  return customGrantList;
}

function useSortedGrants(grants: Grant[]) {
  const sortedGrants = computed(() => (grantIdList.value.length > 0 ? createCustomGrantList(grants) : grants));

  function sortGrants(order: SortingMode) {
    grantsSortingMode.value = order;
    if (order === 'newest') sortedGrants.value = sortedGrants.value.sort((a, b) => (a.id < b.id ? 1 : -1));
    else if (order === 'oldest') sortedGrants.value = sortedGrants.value.sort((a, b) => (a.id > b.id ? 1 : -1));
    else sortedGrants.value = sortedGrants.value.sort(() => (Math.random() < 0.5 ? 1 : -1));
  }

  sortGrants(grantsSortingMode.value);

  const grantRegistryListNav = computed(
    () =>
      <FilterNavItem[]>[
        {
          label: 'Sort',
          tag: grantsSortingMode.value,
          menu: [
            {
              label: 'newest',
              action: () => {
                sortGrants('newest');
              },
            },
            {
              label: 'oldest',
              action: () => {
                sortGrants('oldest');
              },
            },
            {
              label: 'shuffle',
              action: () => {
                sortGrants('shuffle');
              },
            },
          ],
        },
      ]
  );

  return {
    sortedGrants,
    grantRegistryListNav,
  };
}

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
    const { chainId } = useWalletStore();

    onMounted(async () => {
      const url = 'https://storageapi.fleek.co/phutchins-team-bucket/dgrants/staging/whitelist-grants.json';
      const json = await fetch(url).then((res) => res.json());
      grantIdList.value = json[chainId.value];
    });

    onUnmounted(() => {
      grantsSortingMode.value = defaultSortingMode;
    });

    return {
      ...useSortedGrants(props.grants),
      isInCart,
      addToCart,
      removeFromCart,
    };
  },
});
</script>

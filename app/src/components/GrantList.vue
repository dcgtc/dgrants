<template>
  <!-- General filters -->
  <BaseFilterNav :items="grantRegistryListNav" :button="button" />
  <section class="pb-20">
    <ul class="base-grid">
      <li v-for="grant in sortedGrants" :key="grant.id.toString()">
        <GrantCard
          :id="grant.id"
          :name="(grantMetadata && grantMetadata[metadataId(grant.metaPtr)]?.name) || '...'"
          :ownerAddress="grant.owner"
          :logoPtr="grantMetadata && grantMetadata[metadataId(grant.metaPtr)]?.logoPtr"
          :roundAddress="roundAddress"
          :roundName="roundName"
        />
      </li>
    </ul>
  </section>
</template>

<script lang="ts">
import { watch, computed, defineComponent, onUnmounted, PropType, ComputedRef, ref } from 'vue';
// --- Components ---
import BaseFilterNav from 'src/components/BaseFilterNav.vue';
import GrantCard from 'src/components/GrantCard.vue';
// --- Store + methods---
import useCartStore from 'src/store/cart';
import { metadataId } from 'src/utils/utils';
// --- Types ---
import { FilterNavButton, FilterNavItem, Grant, GrantMetadataResolution } from '@dgrants/types';

type SortingMode = 'newest' | 'oldest' | 'shuffle';

const defaultSortingMode = 'newest';
const grantsSortingMode = ref<SortingMode>(defaultSortingMode);
const grantIdList = ref([]);

function createCustomGrantList(grants: Grant[]) {
  const customGrantList: Grant[] = [];
  const idList = grantIdList.value as Array<number>;
  for (const val of grants) {
    if (idList.includes(val.id)) customGrantList.push(val);
  }
  return customGrantList;
}

function useSortedGrants(grants: ComputedRef<Grant[]>) {
  const sortedGrants = ref([...grants.value]);

  function sortGrants(order: SortingMode) {
    grantsSortingMode.value = order;
    if (order === 'newest') sortedGrants.value = sortedGrants.value.sort((a, b) => (a.id < b.id ? 1 : -1));
    else if (order === 'oldest') sortedGrants.value = sortedGrants.value.sort((a, b) => (a.id > b.id ? 1 : -1));
    else sortedGrants.value = sortedGrants.value.sort(() => (Math.random() < 0.5 ? 1 : -1));
  }

  watch(
    () => grantIdList.value,
    async () => {
      sortedGrants.value = [...grants.value];
      sortGrants(grantsSortingMode.value);
    },
    { immediate: true }
  );

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

    // --- Optional props ---
    button: { type: Object as PropType<FilterNavButton>, required: false },
    roundAddress: { type: String, default: '' },
    roundName: { type: String, default: '' },
  },
  setup(props) {
    const { addToCart, isInCart, removeFromCart } = useCartStore();
    const grantList = computed(() =>
      grantIdList.value?.length > 0 ? createCustomGrantList(props.grants) : props.grants
    );

    onUnmounted(() => {
      grantsSortingMode.value = defaultSortingMode;
    });

    return {
      ...useSortedGrants(grantList),
      isInCart,
      addToCart,
      removeFromCart,
      metadataId,
    };
  },
});
</script>

<template>
  <template v-if="grants && grantMetadata">
    <BaseHeader :name="title" :breadcrumbContent="breadcrumb" />
    <!-- General filters -->
    <BaseFilterNav :items="grantRegistryListNav" :button="filterNavButton" />
    <GrantList :grants="grants" :grantMetadata="grantMetadata" />
  </template>

  <LoadingScreen v-else />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
// --- App Imports ---
import BaseHeader from 'src/components/BaseHeader.vue';
import BaseFilterNav from 'src/components/BaseFilterNav.vue';
import GrantList from 'src/components/GrantList.vue';
import LoadingScreen from 'src/components/LoadingScreen.vue';
// --- Store ---
import useDataStore from 'src/store/data';
// --- Methods and Data ---
import { pushRoute } from 'src/utils/utils';
// --- Types ---
import { Breadcrumb, FilterNavButton, FilterNavItem } from '@dgrants/types';

function useGrantRegistryList() {
  // --- BaseHeader Navigation ---
  const title = 'All Grants';
  const breadcrumb = computed(
    () =>
      <Breadcrumb[]>[
        {
          displayName: 'dgrants',
          routeTarget: { name: 'Home' },
        },
      ]
  );

  // --- Grants filters ---
  // TODO add info to show the right filters
  const grantRegistryListNav = <FilterNavItem[]>[
    {
      label: 'Sort',
      menu: [
        // TODO implement the behaviours here when grants have a date
        {
          label: 'newest',
          action: () => {
            console.log('newest');
          },
        },
        {
          label: 'oldest',
          action: () => {
            console.log('oldest');
          },
        },
        {
          label: 'shuffle',
          action: () => {
            console.log('shuffle');
          },
        },
      ],
    },
  ];

  const filterNavButton = <FilterNavButton>{
    label: 'create grant',
    action: () => pushRoute({ name: 'dgrants-new' }),
  };

  return {
    breadcrumb,
    filterNavButton,
    grantRegistryListNav,
    title,
  };
}

export default defineComponent({
  name: 'GrantRegistryList',
  components: { BaseHeader, BaseFilterNav, GrantList, LoadingScreen },
  setup() {
    const { grants, grantMetadata } = useDataStore();

    return {
      grants,
      grantMetadata,
      ...useGrantRegistryList(),
    };
  },
});
</script>

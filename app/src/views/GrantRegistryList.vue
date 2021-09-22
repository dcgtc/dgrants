<template>
  <template v-if="grants && grantMetadata">
    <BaseHeader :name="title" :breadcrumbContent="breadcrumb" />
    <GrantListWithFilter :button="filterNavButton" :grants="grants" :grantMetadata="grantMetadata" />
  </template>

  <LoadingSpinner v-else />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
// --- App Imports ---
import BaseHeader from 'src/components/BaseHeader.vue';
import GrantListWithFilter from 'src/components/GrantListWithFilter.vue';
import LoadingSpinner from 'src/components/LoadingSpinner.vue';
// --- Store ---
import useDataStore from 'src/store/data';
// --- Methods and Data ---
import { pushRoute } from 'src/utils/utils';
// --- Types ---
import { Breadcrumb, FilterNavButton } from '@dgrants/types';

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
        {
          displayName: 'registry',
          routeTarget: { name: 'dgrants' },
        },
      ]
  );

  const filterNavButton = <FilterNavButton>{
    label: 'create grant',
    action: () => pushRoute({ name: 'dgrants-new' }),
  };

  return {
    breadcrumb,
    filterNavButton,
    title,
  };
}

export default defineComponent({
  name: 'GrantRegistryList',
  components: { BaseHeader, GrantListWithFilter, LoadingSpinner },
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

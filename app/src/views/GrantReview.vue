<template>
  <template v-if="grants && grantMetadata">
    <BaseHeader :name="title" :breadcrumbContent="breadcrumb" />
    <GrantReviewList :grants="grants" :grantMetadata="grantMetadata" />
  </template>

  <LoadingSpinner v-else />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
// --- App Imports ---
import BaseHeader from 'src/components/BaseHeader.vue';
import GrantReviewList from 'src/components/GrantReviewList.vue';
import LoadingSpinner from 'src/components/LoadingSpinner.vue';
// --- Store ---
import useDataStore from 'src/store/data';
// --- Types ---
import { Breadcrumb } from '@dgrants/types';

function useGrantReview() {
  // --- BaseHeader Navigation ---
  const title = 'Unapproved Grants';
  const breadcrumb = computed(
    () =>
      <Breadcrumb[]>[
        {
          displayName: 'dgrants',
          routeTarget: { name: 'Home' },
        },
        {
          displayName: 'review',
          routeTarget: { name: 'review' },
        },
      ]
  );

  return {
    breadcrumb,
    title,
  };
}

export default defineComponent({
  name: 'GrantReview',
  components: { BaseHeader, GrantReviewList, LoadingSpinner },
  setup() {
    const { grants, grantMetadata } = useDataStore();

    return {
      grants,
      grantMetadata,
      ...useGrantReview(),
    };
  },
});
</script>

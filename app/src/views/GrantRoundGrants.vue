<template>
  <template v-if="hasLoadedHeader">
    <BaseHeader :name="title" :breadcrumbContent="breadcrumb" />
    <!-- General filters -->
    <GrantList v-if="hasLoadedGrants" :button="filterNavButton" :grants="grants" :grantMetadata="grantMetadata" />
  </template>

  <LoadingSpinner v-else />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { useRoute } from 'vue-router';
// --- App Imports ---
import BaseHeader from 'src/components/BaseHeader.vue';
import GrantList from 'src/components/GrantList.vue';
import LoadingSpinner from 'src/components/LoadingSpinner.vue';

// --- Store ---
import useDataStore from 'src/store/data';
// --- Methods and Data ---
import { getAddress } from 'src/utils/ethers';
import { pushRoute } from 'src/utils/utils';
// --- Types ---
import { Breadcrumb, FilterNavButton, Grant, GrantRound } from '@dgrants/types';

function useGrantRoundDetail() {
  const { grantRounds, grantRoundMetadata: _grantRoundMetadata, grants: allGrants, grantMetadata } = useDataStore();
  const route = useRoute();

  // get a single grantRound or an empty/error object (TODO: should the typings be modified to account for an empty object?)
  const grantRound = computed(() => {
    if (grantRounds.value) {
      // filter for a matching GrantRound
      const round = grantRounds.value.filter(
        (round) => getAddress(<string>round.address) === getAddress(<string>route.params.address)
      );

      return <GrantRound>(round.length ? round[0] : { error: `No GrantRound @ ${route.params.address}` });
    } else {
      return <GrantRound>{};
    }
  });

  /**
   * @notice returns grants present in grantRound
   */
  const grants = computed(() => {
    if (allGrants.value && grantRoundMetadata?.value?.grants) {
      const grantIdsInRound = Object.keys(grantRoundMetadata?.value['grants']);
      return allGrants.value.filter((grant) => grantIdsInRound.includes(grant.id.toString()));
    } else {
      return <Grant[]>[];
    }
  });

  const grantRoundMetadata = computed(() =>
    grantRound.value ? _grantRoundMetadata.value[grantRound.value.metaPtr] : null
  );

  const title = computed(() => `${grantRoundMetadata.value?.name} Grants`);
  const breadcrumb = computed(
    () =>
      <Breadcrumb[]>[
        {
          displayName: 'dgrants',
          routeTarget: { name: 'Home' },
        },
        {
          displayName: grantRoundMetadata.value?.name,
          routeTarget: { name: 'dgrants-round', params: { address: grantRound.value?.address } },
        },
      ]
  );

  const hasLoadedHeader = computed(() => grantRound.value?.address && grantRoundMetadata.value?.name);
  const hasLoadedGrants = computed(() => grants.value && grantMetadata);

  const filterNavButton = <FilterNavButton>{
    label: 'create grant',
    action: () => pushRoute({ name: 'dgrants-new' }),
  };

  return {
    breadcrumb,
    filterNavButton,
    title,
    grants,
    grantMetadata,
    grantRoundMetadata,
    hasLoadedHeader,
    hasLoadedGrants,
  };
}

export default defineComponent({
  name: 'GrantRoundGrants',
  components: { BaseHeader, GrantList, LoadingSpinner },
  setup() {
    return {
      ...useGrantRoundDetail(),
    };
  },
});
</script>

<template>
  <template v-if="fullContributions && !loading">
    <!-- this is a header for a the route "/contributions" what show ALL contributions.
      other pages already have a header, so its not needed there. -->
    <BaseHeader :name="title" />

    <!-- btw in this component was a "cursor-pointer" for some reason. i removed it as this is
    not something clickable. just for final PR this component could need that update too-->
    <SectionHeader :title="`Contributions (${contributionTotal})`" />

    <!-- a single contribution ( right now this would be the "ContributionRow.vue" what we maybe
    not even wana keep - depends on the architecture you wana do ...
    i added a v-for loop with some dummy data for {{name}} just to test how this looks
    you can delete this of cause ...
    -->
    <ContributionDetail :contributions="fullContributions" />
  </template>

  <LoadingSpinner v-else />
</template>

<script lang="ts">
import BaseHeader from 'src/components/BaseHeader.vue';
import SectionHeader from 'src/components/SectionHeader.vue';
import ContributionDetail from 'src/components/ContributionDetail.vue';
import useDataStore from 'src/store/data';
import { computed, defineComponent, ref, watch } from 'vue';
import LoadingSpinner from 'src/components/LoadingSpinner.vue';
import { filterContributionGrantData } from 'src/utils/data/contributions';
import useWalletStore from 'src/store/wallet';
import { useRoute } from 'vue-router';
import { GrantMetadata, GrantRoundMetadata } from '@dgrants/types';

function setTitle(route: string) {
  return route === '/contribution/donations' ? 'My Contributions' : 'Contributions';
}

function contributionDetails() {
  const { grantContributions, grants, grantMetadata, grantRounds, grantRoundMetadata } = useDataStore();
  const { userAddress } = useWalletStore();

  const fullContributions = ref();
  const contributionTotal = ref(0);
  const loading = ref(true);

  const allGrantRounds = computed(() => {
    return grantRounds.value ? grantRounds.value : [];
  });

  const grantMetaData = computed(() => {
    return grantMetadata.value as Record<string, GrantMetadata>;
  });

  const grantRoundsMetaData = computed(() => {
    return grantRoundMetadata.value as Record<string, GrantRoundMetadata>;
  });

  const contributions = computed(() => {
    return grantContributions.value ? grantContributions.value : [];
  });

  const allGrants = computed(() => {
    return grants.value ? grants.value : [];
  });

  const userAddr = computed(() => {
    return userAddress.value ? userAddress.value : '';
  });

  watch(
    () => [
      contributions.value,
      allGrantRounds.value,
      grantRounds.value,
      grantMetadata.value,
      grantRoundsMetaData.value,
    ],
    () => {
      // ensure state is still loading
      loading.value = true;
      if (
        contributions.value &&
        userAddr.value &&
        allGrantRounds.value &&
        grantRoundMetadata.value &&
        grantMetadata.value
      ) {
        fullContributions.value = filterContributionGrantData(
          userAddr.value,
          contributions.value,
          allGrants.value,
          allGrantRounds.value,
          grantMetaData.value,
          grantRoundsMetaData.value
        );

        contributionTotal.value = fullContributions.value.length;
        loading.value = false;
      }
    },
    { immediate: true }
  );

  return {
    fullContributions,
    contributions,
    contributionTotal,
    loading,
  };
}

export default defineComponent({
  name: 'Contribution',
  components: { LoadingSpinner, ContributionDetail, BaseHeader, SectionHeader },
  setup() {
    const route = useRoute();
    const title = setTitle(route?.path || 'contributions');
    return {
      title,
      ...contributionDetails(),
    };
  },
});
</script>

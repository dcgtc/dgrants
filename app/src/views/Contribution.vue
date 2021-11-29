<template>
  <template v-if="fullContributions">
    <BaseHeader :name="title" />
    <SectionHeader :title="`Contributions (${fullContributions?.length})`" />
    <ContributionDetail :contributions="fullContributions" />
  </template>
  <LoadingSpinner v-else />
</template>

<script lang="ts">
import BaseHeader from 'src/components/BaseHeader.vue';
import SectionHeader from 'src/components/SectionHeader.vue';
import ContributionDetail from 'src/components/ContributionDetail.vue';
import useDataStore from 'src/store/data';
import { computed, defineComponent } from 'vue';
import LoadingSpinner from 'src/components/LoadingSpinner.vue';
import { filterContributionGrantData } from 'src/utils/data/contributions';
import useWalletStore from 'src/store/wallet';
import { useRoute } from 'vue-router';
import { GrantMetadata, GrantRoundMetadata } from '@dgrants/types';

const { grantContributions, grants, grantMetadata, grantRounds, grantRoundMetadata } = useDataStore();
const { userAddress } = useWalletStore();

function setTitle(route: string) {
  return route === '/contribution/donations' ? 'My Contributions' : 'Contributions';
}

function getFullContributionDetails() {
  if (!userAddress.value || !grantContributions.value || !grants.value || !grantRounds.value) {
    return null;
  }
  const grantMeta = grantMetadata.value ? (grantMetadata.value as Record<string, GrantMetadata>) : undefined;
  const grantRoundMeta = grantRoundMetadata.value
    ? (grantRoundMetadata.value as Record<string, GrantRoundMetadata>)
    : undefined;

  return filterContributionGrantData(
    userAddress.value,
    grantContributions.value,
    grants.value,
    grantRounds.value,
    grantMeta,
    grantRoundMeta
  );
}

export default defineComponent({
  name: 'Contribution',
  components: { LoadingSpinner, ContributionDetail, BaseHeader, SectionHeader },
  setup() {
    const route = useRoute();
    const title = setTitle(route?.path || 'contributions');
    const fullContributions = computed(() => getFullContributionDetails());
    return {
      title,
      fullContributions,
    };
  },
});
</script>

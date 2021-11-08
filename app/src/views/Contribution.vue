<template>
  <template v-if="myGrantContributions">
    <!-- this is a header for a the route "/contributions" what show ALL contributions.
      other pages already have a header, so its not needed there. -->
    <BaseHeader :name="title" />

    <!-- btw in this component was a "cursor-pointer" for some reason. i removed it as this is
    not something clickable. just for final PR this component could need that update too-->
    <SectionHeader title="Contributions (444)" />

    <!-- a single contribution ( right now this would be the "ContributionRow.vue" what we maybe
    not even wana keep - depends on the architecture you wana do ...
    i added a v-for loop with some dummy data for {{name}} just to test how this looks
    you can delete this of cause ...
    -->
    <ContributionDetail :contributions="myGrantContributions" />
  </template>

  <LoadingSpinner v-else />
</template>

<script lang="ts">
import BaseHeader from 'src/components/BaseHeader.vue';
import SectionHeader from 'src/components/SectionHeader.vue';
import ContributionDetail from 'src/components/ContributionDetail.vue';
import useDataStore from 'src/store/data';
import { computed, defineComponent } from 'vue';
import useWalletStore from 'src/store/wallet';
import LoadingSpinner from 'src/components/LoadingSpinner.vue';
import { useRoute } from 'vue-router';
import { filterContributionsByUserAddress } from 'src/utils/data/contributions';

const { grantContributions: contributions } = useDataStore();
const { userAddress } = useWalletStore();

function setTitle(route: string | symbol | null | undefined) {
  return route === '/contribution/donations' ? 'My Contributions' : 'Contributions';
}

export default defineComponent({
  name: 'Contribution',
  components: { LoadingSpinner, ContributionDetail, BaseHeader, SectionHeader },
  setup() {
    const route = useRoute();
    //   TODO: testing const userAddressTest = '0x4A87a2A017Be7feA0F37f03F3379d43665486Ff8';
    const myGrantContributions = computed(() =>
      filterContributionsByUserAddress(userAddress.value, contributions?.value)
    );
    const title = setTitle(route.path);
    return {
      title,
      myGrantContributions,
    };
  },
});
</script>

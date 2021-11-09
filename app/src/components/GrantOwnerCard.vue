<template>
  <!-- grid sm:1col md:2col -->
  <section class="pb-12 border-b border-grey-100 grid grid-cols-1 md:grid-cols-2">
    <!--grid:left (img)-->
    <figure
      class="aspect-w-16 aspect-h-9 shadow-light"
      @click="pushRoute({ name: 'dgrants-id', params: { id: id.toString() } })"
    >
      <img class="w-full h-full object-center object-cover" :src="imgurl || '/placeholder_grant.svg'" />
    </figure>

    <!--grid:right (txt)-->
    <div class="px-4 md:px-8">
      <article>
        <!-- Grant Name -->
        <div class="font-medium mb-10" @click="pushRoute({ name: 'dgrants-id', params: { id: id.toString() } })">
          {{ name }}
        </div>

        <!-- Grant Creation Date -->
        <!-- <div class="mb-2">
          <span class="text-grey-400">Submitted:</span>
          <span class="ml-1">TODO</span>
        </div> -->

        <!-- Last Updated Date -->
        <!-- <div class="mb-2">
          <span class="text-grey-400">Last Update:</span>
          <span class="ml-1">TODO</span>
        </div> -->

        <!-- Total Funds Raised -->
        <div class="mb-2">
          <span class="text-grey-400">Funds Raised:</span>
          <span class="ml-1">{{ grantInfo.raised }}</span>
        </div>

        <!-- Matching Funds Raised -->
        <div class="mb-2">
          <span class="text-grey-400">Matching Funds:</span>
          <span class="ml-1">TODO</span>
          <!--
          <div v-for="(round, index) in roundDetails" :key="index" class="mt-2">
            <span class="text-grey-400 mr-4">Matching:</span>
            <span>{{ round.matching || '...' }} {{ round.matchingToken.symbol }}</span>
            <span>, {{ round.name }}</span>
          </div> -->
        </div>

        <!-- Total Donation Count -->
        <div class="mb-2">
          <span class="text-grey-400">Donations:</span>
          <span class="ml-1">{{ grantInfo.contributionCount }}</span>
        </div>

        <!-- Status -->
        <div class="mt-10">
          <button v-if="status == 'pending'" class="btn bg-grey-200">Pending</button>
          <button v-else-if="status == 'approved'" class="btn btn-success">Approved</button>
        </div>
      </article>

      <div
        @click="pushRoute({ name: 'dgrants-id', params: { id: id.toString() }, query: { edit: 'true' } })"
        class="flex float-right items-center gap-x-2 cursor-pointer mt-10"
      >
        <EditIcon class="icon icon-primary icon-small" />
        <span class="text-grey-400 group-hover:text-grey-500">Edit</span>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
// --- Methods and Data ---
import { filterContributionsByGrantId } from 'src/utils/data/contributions';

// --- Utils/helper ---
import { formatNumber, pushRoute } from 'src/utils/utils';

// --- Components/icons ---
import useDataStore from 'src/store/data';
import { Edit3Icon as EditIcon } from '@fusion-icons/vue/interface';

function useGrantInfo(id: number) {
  const { grantRounds, grantContributions, approvedGrantsPk } = useDataStore();

  const grantId = ref<number>(id);

  const status = computed(() => {
    if (approvedGrantsPk && approvedGrantsPk.value) {
      return approvedGrantsPk.value.includes(id) ? 'approved' : 'pending';
    }
    console.error('could not compute approval status of grant');
    return 'pending';
  });

  function getGrantInfo(grantId: number) {
    const contributions = filterContributionsByGrantId(grantId, grantContributions?.value || []);
    const contributionCount = contributions.length;
    const raised = `${formatNumber(
      contributions.reduce((total, contribution) => contribution?.amount + total, 0),
      2
    )} ${grantRounds.value && grantRounds.value[0] && grantRounds.value[0].donationToken.symbol}`;

    return { raised: raised, contributionCount: contributionCount };
  }

  const grantInfo = computed(() => getGrantInfo(grantId.value));

  return { status: status, grantInfo };
}

export default defineComponent({
  name: 'GrantOwnerCard',
  components: { EditIcon },
  props: {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    imgurl: { type: String, required: true },
    ownerAddress: { type: String, required: true },
  },
  setup(props) {
    return { pushRoute, ...useGrantInfo(props.id) };
  },
});
</script>

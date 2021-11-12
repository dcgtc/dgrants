<template>
  <section class="border-b border-grey-100">
    <!--------- GRANT IMAGE + GRANT DATA + STATUS -------->
    <article class="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
      <!--grid:left (img)-->
      <figure
        class="aspect-w-16 aspect-h-9 shadow-light cursor-pointer"
        @click="pushRoute({ name: 'dgrants-id', params: { id: id.toString() } })"
      >
        <img class="w-full h-full object-center object-cover" :src="imgurl || '/placeholder_grant.svg'" />
      </figure>

      <!--grid:right (txt)-->
      <div>
        <!-- Name -->
        <div class="font-medium mb-4" @click="pushRoute({ name: 'dgrants-id', params: { id: id.toString() } })">
          <span class="cursor-pointer">{{ name }}</span>
        </div>

        <!-- Funds Raised -->
        <div class="mb-2">
          <span class="text-grey-400">Funds Raised:</span>
          <span class="ml-1">{{ grantInfo.raised }}</span>
        </div>

        <!-- Donation Count -->
        <div class="mb-2">
          <span class="text-grey-400">Donations:</span>
          <span @click="pushRoute({ name: 'dgrants-id', params: { id: id.toString() } })" class="ml-1 link">{{
            grantInfo.contributionCount
          }}</span>
        </div>

        <!-- Status -->
        <div class="mt-10">

          <!-- approved (green)-->
          <div v-if="status == 'approved'">
            <span class="px-8 py-4 font-medium bg-teal">Approved</span>
          </div>

          <!-- pending (grey)-->
          <div v-else>
            <span class="px-8 py-4 font-medium bg-grey-100">Pending</span>
          </div>
        </div>
      </div>
    </article>

    <!--------- INTERACTION BAR - FOR EDIT, CLAIM, HIDE, ETC ... ---------->
    <article class="py-8 mt-8">
      <div class="flex flex-wrap gap-x-10 gap-y-4 justify-end">
        <!--EDIT-->
        <div @click="pushRoute({ name: 'dgrants-id', params: { id: id.toString() }, query: { edit: 'true' } })">
          <div class="flex items-center gap-x-2 cursor-pointer group">
            <EditIcon class="icon icon-primary icon-small" />
            <span class="text-grey-400 group-hover:text-grey-500">Edit</span>
          </div>
        </div>
      </div>
    </article>
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
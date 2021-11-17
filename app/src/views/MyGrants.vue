<template>
  <template v-if="grants && grantMetadata">
    <BaseHeader name="My Grants" />

    <!-- No Grants -->
    <div v-if="grants.length == 0">
      <div class="mt-10">
        <router-link :to="{ name: 'dgrants-new' }">
          <button class="btn mx-auto">create grant</button>
        </router-link>
      </div>

      <img style="max-height: 10rem" class="mx-auto" src="/placeholder_grant.svg" />
      <p class="mt-4 text-center">No Grants created</p>
    </div>
    <!-- My Grants -->
    <ul v-else class="base-grid-large">
      <li v-for="grant in grants" :key="grant.id.toString()">
        <GrantOwnerCard
          :id="grant.id"
          :name="(grantMetadata && grantMetadata[metadataId(grant.metaPtr)]?.name) || '...'"
          :ownerAddress="grant.owner"
          :imgurl="(grantMetadata && ptrToURI(grantMetadata[metadataId(grant.metaPtr)]?.logoPtr)) || '/placeholder_grant.svg'"
        />
      </li>
    </ul>
  </template>

  <!-- Loading Screen -->
  <LoadingSpinner v-else />
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
// --- App Imports ---
import BaseHeader from 'src/components/BaseHeader.vue';
import GrantOwnerCard from 'src/components/GrantOwnerCard.vue';
import LoadingSpinner from 'src/components/LoadingSpinner.vue';
// --- Store ---
import useDataStore from 'src/store/data';
import useWalletStore from 'src/store/wallet';

import { metadataId, ptrToURI } from 'src/utils/utils';

const { grantMetadata } = useDataStore();

function filterMyGrants() {
  const { grants: allGrants } = useDataStore();
  const { userAddress } = useWalletStore();

  const grants = computed(() => {
    if (allGrants.value && userAddress.value) {
      return allGrants.value.filter((grant) => grant.owner == userAddress.value);
    } else {
      return undefined;
    }
  });

  return { grants };
}

export default defineComponent({
  name: 'MyGrants',
  components: { BaseHeader, GrantOwnerCard, LoadingSpinner },

  setup() {
    return {
      metadataId,
      grantMetadata,
      ptrToURI,
      ...filterMyGrants(),
    };
  },
});
</script>

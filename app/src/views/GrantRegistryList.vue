<template>
  <!-- Create New Grant -->
  <div class="mb-10">
    <h2 class="text-lg mb-3">Create New Grant</h2>
    <div class="mb-1">Click the button below to create a new grant</div>
    <div class="flex justify-center">
      <button @click="pushRoute({ name: 'dgrants-new' })" class="btn btn-secondary mt-6">Create Grant</button>
    </div>
  </div>

  <!-- View Existing Grants -->
  <h2 class="text-lg mb-3">Grant Registry List</h2>
  <div class="mb-10">Below are all grants read from the GrantRegistry contract</div>
  <GrantList v-if="grants && grantMetadata" :grants="grants" :grantMetadata="grantMetadata" />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import useDataStore from 'src/store/data';
import GrantList from 'src/components/GrantList.vue';
import { pushRoute } from 'src/utils/utils';

export default defineComponent({
  name: 'GrantRegistryList',
  components: { GrantList },
  setup() {
    const { grants, grantMetadata } = useDataStore();
    return { grants, grantMetadata, pushRoute };
  },
});
</script>

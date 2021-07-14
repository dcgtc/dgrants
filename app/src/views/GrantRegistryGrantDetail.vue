<template>
  <div class="font-bold">Details for Grant ID {{ grant.id.toString() }}</div>
  <p>Owner: {{ grant.owner }}</p>
  <p>Payee: {{ grant.payee }}</p>
  <p>
    Metadata URL: <a class="link" :href="grant.metaPtr" target="_blank">{{ grant.metaPtr }}</a>
  </p>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRoute } from 'vue-router';
import useDataStore from 'src/store/data';

export default defineComponent({
  name: 'GrantRegistryGrantDetail',
  setup() {
    const route = useRoute();
    const { grants } = useDataStore();
    return { grant: grants.value[route.params.id] };
  },
});
</script>

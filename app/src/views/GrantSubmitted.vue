<template>
  <div>
    <BaseHeader
      name="Thank you for your grant submission! Your grant has been queued for review and upon approval will be visible to everyone. Average time to review is less than 24 hours."
    />
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import BaseHeader from 'src/components/BaseHeader.vue';
export default defineComponent({
  name: 'GrantRegistryNewGrant',
  components: {
    BaseHeader,
  },
});
</script>

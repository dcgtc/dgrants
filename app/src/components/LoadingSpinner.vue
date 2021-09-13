<template>
  <div class="text-center my-16">
    <img style="width: 64px; height: 64px" class="mx-auto" src="/src/assets/spinner.svg" />
    <h2 class="mt-6 text-3xl text-gray-500">
      {{ text }}
    </h2>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LoadingSpinner',
  props: {
    text: { type: String, required: false, default: 'Loading...' },
  },
});
</script>

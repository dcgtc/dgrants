<template>
  <div class="text-center my-16">
    <img style="width: 64px; height: 64px" class="mx-auto" src="/src/assets/spinner.svg" />
    <h2 class="mt-6 text-3xl font-extrabold text-gray-900">
      {{ text }}
    </h2>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LoadingScreen',
  props: {
    text: { type: String, required: false, default: 'Loading...' },
  },
});
</script>

<template>
  <div>
    <img src="/src/assets/spinner.svg" />
    <span>{{ text }}</span>
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

<style scoped>
div {
  @apply text-center mx-auto py-12;
}

img {
  @apply mx-auto;
  @apply h-8 w-8 md:h-12 md:w-12;
}

span {
  @apply inline-block mt-4 text-grey-500;
}
</style>

<template>
  <div class="px-4 md:px-12 pt-16 pb-8 border-b border-grey-100">
    <div class="block md:flex gap-x-8">
      <div class="flex flex-wrap content-center gap-x-8">
        <div class="cursor-pointer uppercase font-medium">
          {{ title }}
          <span v-if="counter" class="ml-2 text-grey-400">({{ counter }})</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BaseTitle',
  props: {
    title: { type: String, required: false, default: undefined },
    counter: { type: Number, required: false, default: undefined },
  },
});
</script>

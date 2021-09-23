<!-- ImageRow
  A Component to display a Users uploaded images,
  to make it deletable for him. 
  its for grants images, rounds images, and custom user images
  so all 3 formats.
-->

<template>
  <div class="py-8">
    <div class="grid grid-cols-12 items-center gap-x-4 md:gap-x-8">
      <!-- image -->
      <div class="col-span-5 md:col-span-2 mb-3 md:mb-0">
        <img class="shadow-light" :src="URI" />
      </div>

      <!-- filename -->
      <div class="col-span-6 md:col-span-4 mb-3 md:mb-0 truncate">
        {{ URI }}
      </div>

      <!-- delete icon -->
      <div v-if="deletable" class="col-span-1 md:col-span-3 mb-3 md:mb-0 justify-self-end">
        <XIcon class="icon icon-primary icon-small cursor-pointer" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { CloseIcon as XIcon } from '@fusion-icons/vue/interface';
export default defineComponent({
  name: 'BaseImageRow',
  props: {
    deleteable: { type: Boolean, required: false, default: false },
    URI: { type: String, required: true },
  },
  components: { XIcon },
});
</script>

<!-- ImageRow
  A Component to display a Users uploaded images,
  to make it deletable for him. 
  its for grants images, rounds images, and custom user images
  so all 3 formats.
-->

<template>
  <div class="px-4 md:px-12">
    <div class="py-8 border-b border-grey-100">
      <div class="grid grid-cols-12 items-center gap-x-4 md:gap-x-8">
        <!-- label -->
        <div class="col-span-12 md:col-span-3 mb-3 md:mb-0 text-grey-400">
          {{ label }}
        </div>

        <!-- image -->
        <div class="col-span-5 md:col-span-2 mb-3 md:mb-0">
          <img class="shadow-light" :src="imgsrc" />
        </div>

        <!-- filename -->
        <div class="col-span-6 md:col-span-4 mb-3 md:mb-0 truncate">
          {{ filename }}
        </div>

        <!-- delete icon -->
        <div class="col-span-1 md:col-span-3 mb-3 md:mb-0 justify-self-end">
          <XIcon class="icon cursor-pointer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { CloseIcon as XIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'ImageRow',
  props: {
    label: String,
    imgsrc: String,
    filename: String,
  },
  components: { XIcon },

  data() {
    return {
      toggle: false,
    };
  },
});
</script>

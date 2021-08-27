<template>
  <!-- optional breadcrumb within a header -->
  <div class="flex flex-wrap justify-center mb-8">
    <router-link
      v-for="link in path"
      :key="link.name"
      :to="link.href"
      active-class="font-bold"
      exact
      class="group no-underline flex items-center"
    >
      <span class="uppercase font-medium text-grey-400 truncate hover:text-grey-500">{{ link.name }}</span>
      <ArrowRightSmallIcon class="icon-small icon-primary" />
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
// types
import { Breadcrumb } from '@dgrants/types';
// icons
import { ArrowRight2Icon as ArrowRightSmallIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'BaseHeader',
  props: {
    path: { type: Array as PropType<Breadcrumb[]>, required: false, default: () => [] },
  },
  components: { ArrowRightSmallIcon },
});
</script>

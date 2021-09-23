<template>
  <!-- optional breadcrumb within a header -->
  <div class="flex flex-wrap justify-center mb-8">
    <router-link
      v-for="link in path"
      :key="link.displayName"
      :to="link.routeTarget"
      active-class="font-medium"
      exact
      class="group no-underline flex items-center"
    >
      <span class="uppercase font-medium text-grey-400 truncate group-hover:text-grey-500">{{ link.displayName }}</span>
      <ArrowRightSmallIcon class="icon-small icon-primary" />
    </router-link>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
// --- Types ---
import { Breadcrumb } from '@dgrants/types';
// --- Icons ---
import { ArrowRight2Icon as ArrowRightSmallIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'Breadcrumb',
  props: {
    path: { type: Array as PropType<Breadcrumb[]>, required: true },
  },
  components: { ArrowRightSmallIcon },
});
</script>

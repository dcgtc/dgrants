<!-- BaseTabs  
a navigation bar that can have various nav items with optional (INT) numbers,
where one is the "active" by apply "border-b-2" class on it.
-->

<template>

<div class="px-4 md:px-12 py-6 border-b border-grey-100 flex flex-wrap gap-x-10 gap-y-2">

  <span class="cursor-pointer text-grey-500 font-medium no-underline
  whitespace-pre-line hover:text-grey-500 py-2 border-b-2">All (543)</span>

  <span class="cursor-pointer text-grey-400 font-medium no-underline
  whitespace-pre-line hover:text-grey-500 py-2">Infra Tech (184)</span>

  <span class="cursor-pointer text-grey-500 font-medium no-underline
  whitespace-pre-line hover:text-grey-400 py-2">dApp Tech (184)</span>

</div>

</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BaseTabs',
  components: {},
});
</script>

<template>
  <footer class="mt-12 py-12 border-t border-grey-100">
    <div class="grid items-center justify-center">
      <a href="https://gitcoindao.com" target="_blank" class="group">
        <div class="flex flex-wrap gap-4 items-center justify-center">
          <img class="w-5 xl:w-6" src="/gitcoindao.svg" alt="gitcoindao" />
          <span class="text-center text-grey-400 group-hover:text-grey-500">Built by the Gitcoin community.</span>
        </div>
      </a>
    </div>
  </footer>
</template>

<script lang="ts">
// --- External Imports ---
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LayoutFooter',
});
</script>

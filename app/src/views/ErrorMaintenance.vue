<template>
  <section class="px-4 md:px-12 py-4 md:py-12">
    <div class="grid justify-center text-center">
      <h1 class="text-grey-500">503</h1>
      <h1>Maintenance</h1>
      <p class="mt-4 italic text-grey-400 mx-auto max-w-6xl">
        dGrants is currently unavailable, but will be back soon. Learn more on Twitter.
      </p>

      <!-- button row container -->
      <div class="mt-12 flex flex-wrap gap-8 justify-center">
        <a href="https://twitter.com/gitcoindao" target="_blank" rel="noreferrer noopener">
          <button class="btn">
            <TwitterIcon />
            <span>Twitter</span>
          </button></a
        >
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { TwitterIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'ErrorMaintenance',
  components: { TwitterIcon },
});
</script>

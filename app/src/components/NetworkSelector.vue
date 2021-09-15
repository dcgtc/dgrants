<template>
  <div class="px-4 md:px-12 py-8 bg-grey-200 text-white">
    <div class="block md:flex gap-x-8 items-center">
      <div>
        <p class="text-white bg-pink inline">Wrong Network!<br />Please switch Network to Rinkeby.</p>
      </div>

      <div class="ml-auto mt-4 md:mt-0">
        <button class="btn text-left">
          <NetworkIcon />
          Rinkeby
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NetworkIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'NetworkSelector',
  components: { NetworkIcon },
  props: {},
});
</script>

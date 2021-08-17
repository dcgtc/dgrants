<template>
  <div
    :class="[showLoading ? 'flex' : 'hidden']"
    class="h-screen fixed w-full"
    style="z-index: 11000; background-color: #ffffff"
  >
    <div class="px-4 md:px-12 m-auto bg-white">
      <img class="icon-large" src="../assets/spinner.svg" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Loading',
  props: {
    showLoading: Boolean,
  },
  components: {},
});
</script>

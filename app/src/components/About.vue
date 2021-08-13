<template>
  <div
    :class="[showAbout ? 'flex' : 'hidden']"
    class="h-screen fixed w-full"
    style="z-index: 10000; background-color: #ffffffdd"
  >
    <div class="px-4 md:px-12 m-auto bg-white">
      <div class="border-grey-500 border-2 px-4 md:px-12 relative">
        <!-- close icons -->
        <div class="absolute top-6 right-6">
          <XIcon @click="$emit('toggle-about')" class="icon cursor-pointer" />
        </div>

        <!-- logo -->
        <div class="mt-8">
          <h1 class="font-medium"><span class="text-teal">d</span>Grants</h1>
        </div>

        <!-- version -->
        <div class="mt-2">build 0.0.0.0</div>

        <!-- team -->
        <div class="mt-16">
          <span>Dezentralize Gitcoin – Workstream Team: </span>
          <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >, <span><a href="#">Name</a></span
          >,
        </div>

        <!-- donate -->
        <div class="mt-16">
          <button
            class="
              flex
              items-center
              gap-2
              whitespace-nowrap
              uppercase
              font-medium
              bg-grey-500
              text-white
              px-8
              py-4
              hover:bg-grey-400
            "
          >
            <span>donate to <span class="text-teal">d</span>grants</span>
          </button>
        </div>

        <!-- nav bar -->
        <div class="mt-16 mb-8 block md:flex gap-x-8">
          <div><a href="">Licensed under xyz license</a></div>
          <div><a href="">Github</a></div>
          <div class="ml-auto"><a href="">Help & Support</a></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { CloseIcon as XIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  props: {
    showAbout: Boolean,
  },
  components: {
    XIcon,
  },
});
</script>

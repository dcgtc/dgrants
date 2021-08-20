<!-- about modal

  before we launch todo : 
  - pick a licence / link to license
  - think about what place we wana send users for support / help for now.
  
  - suggestion : rewrite fetch so its cashed and maybe even order by data field : contributions 

 -->

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

        <!-- team ( fetching contributors from github )-->
        <div class="mt-16">
          <span>Dezentralize Gitcoin – Workstream Team: </span>
          <span v-bind:key="members.id" v-for="members in data">
            <span
              ><a href="{{members.html_url}}" target="_blank">{{ members.login }}</a></span
            >,
          </span>
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
          <div><a href="#">Licensed under xyz license</a></div>
          <div><a href="https://github.com/dcgtc/dgrants" target="_blank">Github</a></div>
          <div class="ml-auto"><a href="https://support.gitcoin.co" target="_blank">Help & Support</a></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { CloseIcon as XIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  async created() {
    const response = await fetch('https://api.github.com/repos/dcgtc/dgrants/contributors');
    const data = await response.json();
    this.data = data;
  },

  name: 'About',
  props: {
    showAbout: Boolean,
  },
  components: {
    XIcon,
  },
  data() {
    return {
      data: {},
    };
  },
});
</script>

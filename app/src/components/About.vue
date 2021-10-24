<template>
  <div
    :class="[showAbout ? 'flex' : 'hidden']"
    class="h-screen fixed w-full z-50 bg-white bg-opacity-90"
    @click="emitEvent('toggleAbout')"
  >
    <div class="px-4 md:px-12 m-auto bg-white">
      <div class="border-grey-500 border-2 px-4 md:px-12 relative" @click.stop>
        <!-- close icon-->
        <div class="absolute top-6 right-6">
          <XIcon @click="emitEvent('toggleAbout')" class="icon icon-primary cursor-pointer" />
        </div>

        <!-- dGrants -->
        <div class="mt-8">
          <h1 class="font-medium"><span class="text-teal">d</span>Grants</h1>
        </div>

        <!-- ToDo. build version -->
        <div class="mt-2">build {{ packagejson.version }}</div>

        <!-- Team -->
        <div class="mt-16">
          <span>Dezentralize Gitcoin – Workstream Team: </span>
          <span :key="contributor.login" v-for="(contributor, index) in contributors">
            <span>
              <a :href="contributor.html_url" class="link" target="_blank" rel="noreferrer noopener">
                {{ contributor.login }}
              </a>
            </span>
            <span v-if="index !== contributors.length - 1">, </span><span v-else>.</span>
          </span>
        </div>

        <!-- ToDo. Link to the real dGrant grant -->
        <div class="mt-16 flex flex-wrap gap-4">
          <router-link to="/dgrants/0" @click="emitEvent('toggleAbout')">
            <button class="btn">
              <span>donate to <span class="text-teal">d</span>grants</span>
            </button>
          </router-link>

          <a href="https://github.com/dcgtc" target="_blank" rel="noreferrer noopener">
            <button class="btn">
              <GithubIcon />
              <span>Github</span>
            </button></a
          >

          <a href="https://twitter.com/gitcoin" target="_blank" rel="noreferrer noopener">
            <button class="btn">
              <TwitterIcon />
              <span>Twitter</span>
            </button></a
          >
        </div>

        <!-- license & support link -->
        <div class="mt-8 mb-8 block md:flex items-center gap-x-8 space-y-2 md:space-y-0">
          <div>
            <a
              class="link"
              href="https://github.com/dcgtc/dgrants/blob/main/LICENSE"
              target="_blank"
              rel="noreferrer noopener"
              >Licensed under AGPL-3.0 License</a
            >
          </div>
          <div class="ml-auto">
            <a class="link" href="https://support.gitcoin.co" target="_blank" rel="noreferrer noopener"
              >Help & Support</a
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted, ref } from 'vue';
import { CloseIcon as XIcon } from '@fusion-icons/vue/interface';
import { TwitterIcon as TwitterIcon } from '@fusion-icons/vue/interface';
import { GithubIcon as GithubIcon } from '@fusion-icons/vue/interface';

import packagejson from './../../package.json';

function useContributors() {
  type Contributor = {
    login: string;
    html_url: string;
  };

  const contributors = ref<Contributor[]>([]);

  onMounted(async () => {
    try {
      const url = 'https://api.github.com/repos/dcgtc/dgrants/contributors';
      const response = await fetch(url);
      contributors.value = await response.json();
    } catch {
      contributors.value = [
        {
          login: 'dGrants',
          html_url: 'https://github.com/dcgtc/dgrants/contributors',
        },
      ];
    }
  });

  return { contributors };
}

export default defineComponent({
  name: 'About',
  props: { showAbout: { type: Boolean, required: true, default: false } },
  components: { XIcon, TwitterIcon, GithubIcon },
  setup(_props, context) {
    const emitEvent = (eventName: string) => context.emit(eventName);
    return { emitEvent, packagejson, ...useContributors() };
  },
});
</script>

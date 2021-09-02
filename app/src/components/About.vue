<template>
  <div
    :class="[showAbout ? 'flex' : 'hidden']"
    class="h-screen fixed w-full z-50 bg-white bg-opacity-80"
    @click="emitEvent('toggleAbout')"
  >
    <div class="px-4 md:px-12 m-auto bg-white">
      <div class="border-grey-500 border-2 px-4 md:px-12 relative" @click.stop>
        <div class="absolute top-6 right-6">
          <XIcon @click="emitEvent('toggleAbout')" class="icon icon-primary cursor-pointer" />
        </div>

        <div class="mt-8">
          <h1 class="font-medium"><span class="text-teal">d</span>Grants</h1>
        </div>

        <!-- ToDo. build version -->
        <div class="mt-2">build 0.0.0.0</div>

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

        <div class="mt-16">
          <!-- ToDo. Link to the real dGrant grant -->
          <router-link
            to="/dgrants/0"
            @click="emitEvent('toggleAbout')"
            class="gap-2 whitespace-nowrap uppercase font-medium bg-grey-500 text-white px-8 py-4 hover:bg-grey-400"
          >
            <span>donate to <span class="text-teal">d</span>grants</span>
          </router-link>
        </div>

        <div class="mt-16 mb-8 block md:flex items-center gap-x-8 space-y-2 md:space-y-0">
          <div>
            <a href="https://github.com/dcgtc/dgrants/blob/main/LICENSE" target="_blank" rel="noreferrer noopener"
              >Licensed under AGPL-3.0 License</a
            >
          </div>
          <div class="inline-flex space-x-6">
            <a
              v-for="item in socialLinks"
              :key="item.name"
              :href="item.href"
              target="_blank"
              class="text-gray-400 hover:text-gray-500"
            >
              <span class="sr-only">{{ item.name }}</span>
              <component :is="item.icon" class="h-6 w-6" />
            </a>
          </div>
          <div class="ml-auto">
            <a href="https://support.gitcoin.co" target="_blank" rel="noreferrer noopener">Help & Support</a>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, h } from 'vue';
import { CloseIcon as XIcon } from '@fusion-icons/vue/interface';

type Contributor = {
  login: string;
  html_url: string;
};

// See here to find more social media icon SVG paths: https://www.flaticon.com/free-icons/social-media
const socialLinks = [
  {
    name: 'Twitter',
    href: 'https://twitter.com/gitcoin',
    icon: defineComponent({
      render: () =>
        h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
          h('path', {
            d: 'M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84',
          }),
        ]),
    }),
  },
  {
    name: 'GitHub',
    href: 'https://github.com/dcgtc',
    icon: defineComponent({
      render: () =>
        h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
          h('path', {
            'fill-rule': 'evenodd',
            d: 'M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z',
            'clip-rule': 'evenodd',
          }),
        ]),
    }),
  },
  {
    name: 'Telegram',
    href: '',
    icon: defineComponent({
      render: () =>
        h('svg', { fill: 'currentColor', viewBox: '0 0 24 24' }, [
          h('path', {
            'fill-rule': 'evenodd',
            d: 'm9.417 15.181-.397 5.584c.568 0 .814-.244 1.109-.537l2.663-2.545 5.518 4.041c1.012.564 1.725.267 1.998-.931l3.622-16.972.001-.001c.321-1.496-.541-2.081-1.527-1.714l-21.29 8.151c-1.453.564-1.431 1.374-.247 1.741l5.443 1.693 12.643-7.911c.595-.394 1.136-.176.691.218z',
            'clip-rule': 'evenodd',
          }),
        ]),
    }),
  },
];

export default defineComponent({
  name: 'About',
  props: {
    showAbout: Boolean,
  },
  components: {
    XIcon,
  },
  data() {
    return {
      contributors: [] as Contributor[],
    };
  },
  setup(_props, context) {
    const emitEvent = (eventName: string) => context.emit(eventName);
    return { emitEvent, socialLinks };
  },
  async created() {
    try {
      const url = 'https://api.github.com/repos/dcgtc/dgrants/contributors';
      const response = await fetch(url);
      this.contributors = await response.json();
    } catch {
      this.contributors = [
        {
          login: 'dGrants',
          html_url: 'https://github.com/dcgtc/dgrants/contributors',
        },
      ];
    }
  },
});
</script>

<template>
  <header class="bg-white">
    <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" aria-label="Top">
      <div class="w-full py-6 flex items-center justify-between border-b border-gray-300 lg:border-none">
        <div class="flex items-center">
          <a href="/">
            <img class="h-10 w-auto" src="../assets/logo.png" alt="logo" />
          </a>
          <div class="hidden ml-10 space-x-8 lg:block">
            <router-link
              v-for="link in navigation"
              :key="link.name"
              :to="link.href"
              active-class="font-bold"
              exact
              class="font-medium text-gray-500 hover:text-gray-900"
            >
              {{ link.name }}
            </router-link>
            <button @click="$emit('toggleAbout')" class="font-medium text-gray-500 hover:text-gray-900">About</button>
          </div>
        </div>
        <div class="ml-10 space-x-4">
          <div v-if="userDisplayName" class="text-gray-700">{{ userDisplayName }}</div>
          <div v-else-if="!isSupportedNetwork" class="flex items-center">
            <div class="flex h-12 items-center pr-2 w-12">
              <WarningIcon class="icon stroke-pink" />
            </div>
            <div class="text-gray-500">Unsupported network</div>
          </div>
          <button v-else @click="connectWallet" class="btn btn-secondary">Connect Wallet</button>
        </div>
      </div>
      <div class="py-4 flex flex-wrap justify-center space-x-6 lg:hidden">
        <router-link
          v-for="link in navigation"
          :key="link.name"
          :to="link.href"
          active-class="font-bold"
          exact
          class="font-medium text-gray-500 hover:text-gray-900"
        >
          {{ link.name }}
        </router-link>
      </div>
    </nav>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import useWalletStore from 'src/store/wallet';
import { WarningIcon } from '@fusion-icons/vue/interface';

// Header menu bar items
const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Cart', href: '/cart' },
  { name: 'Contact', href: '/contact' },
];

export default defineComponent({
  name: 'LayoutHeader',
  components: { WarningIcon },
  emits: ['toggleAbout'],
  setup() {
    const { connectWallet, isSupportedNetwork, userDisplayName } = useWalletStore();
    return { connectWallet, isSupportedNetwork, navigation, userDisplayName };
  },
});
</script>

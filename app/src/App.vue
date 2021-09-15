<template>
  <About :showAbout="showAbout" @toggle-about="toggleAbout" />
  <div>
    <layout-header id="header" @toggle-about="toggleAbout" />
    <NetworkSelector />
    <main id="app-main"><router-view /></main>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import About from './components/About.vue';
import NetworkSelector from './components/NetworkSelector.vue';
import LayoutHeader from './components/LayoutHeader.vue';
import useCartStore from 'src/store/cart';
import useSettingsStore from 'src/store/settings';
import useWalletStore from 'src/store/wallet';

export default defineComponent({
  name: 'App',
  components: { NetworkSelector, About, LayoutHeader },
  data() {
    return {
      showAbout: false,
    };
  },
  setup() {
    // Load cart, load settings, and try connecting user's wallet on page load
    const { initializeCart } = useCartStore();
    const { connectWallet } = useWalletStore();
    const { lastWallet, initializeSettings } = useSettingsStore();
    onMounted(async () => {
      initializeCart();
      await initializeSettings();
      if (lastWallet.value) await connectWallet(lastWallet.value);
    });
  },
  methods: {
    toggleAbout() {
      this.showAbout = !this.showAbout;
    },
  },
});
</script>

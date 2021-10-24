<template>
  <About :showAbout="showAbout" @toggle-about="toggleAbout" />
  <div>
    <layout-header id="header" @toggle-about="toggleAbout" />
    <NetworkSelector />
    <main id="app-main"><router-view /></main>
    <layout-footer />
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import About from './components/About.vue';
import NetworkSelector from './components/NetworkSelector.vue';
import LayoutHeader from './components/LayoutHeader.vue';
import LayoutFooter from './components/LayoutFooter.vue';
import useCartStore from 'src/store/cart';
import useDataStore from 'src/store/data';
import useSettingsStore from 'src/store/settings';
import useWalletStore from 'src/store/wallet';

export default defineComponent({
  name: 'App',
  components: { About, LayoutHeader, LayoutFooter, NetworkSelector },
  setup() {
    const showAbout = ref(false);
    // Start polling, load cart, load settings, and try connecting user's wallet on page load
    const { initializeCart } = useCartStore();
    const { startPolling } = useDataStore();
    const { connectWallet } = useWalletStore();
    const { lastWallet, initializeSettings } = useSettingsStore();
    onMounted(async () => {
      startPolling();
      initializeCart();
      await initializeSettings();
      if (lastWallet.value) await connectWallet(lastWallet.value);
    });

    function toggleAbout() {
      showAbout.value = !showAbout.value;
    }

    return {
      toggleAbout,
      showAbout,
    };
  },
});
</script>

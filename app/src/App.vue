<template>
  <div class="flex flex-col min-h-screen">
    <layout-header id="header" />
    <main id="app-main" class="flex-grow bg-white"><router-view /></main>
    <!--<layout-footer id="footer" />-->
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import useSettingsStore from 'src/store/settings';
import useWalletStore from 'src/store/wallet';
import LayoutHeader from './components/LayoutHeader.vue';
// import LayoutFooter from './components/LayoutFooter.vue';

export default defineComponent({
  name: 'App',
  //components: { LayoutHeader, LayoutFooter },
  components: { LayoutHeader },
  setup() {
    // Load settings and try connecting user's wallet on page load
    const { connectWallet } = useWalletStore();
    const { lastWallet, initializeSettings } = useSettingsStore();
    onMounted(async () => {
      await initializeSettings();
      if (lastWallet.value) await connectWallet(lastWallet.value);
    });
  },
});
</script>

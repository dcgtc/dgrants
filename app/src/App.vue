<template>
  <About :showAbout="showAbout" @toggle-about="toggleAbout" />
  <div class="flex flex-col min-h-screen">
    <layout-header id="header" @toggle-about="toggleAbout" />
    <main id="app-main" class="flex-grow bg-white"><router-view /></main>
    <!--<layout-footer id="footer" />-->
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import useSettingsStore from 'src/store/settings';
import useWalletStore from 'src/store/wallet';
import LayoutHeader from './components/LayoutHeader.vue';
import About from './components/About.vue';

// import LayoutFooter from './components/LayoutFooter.vue';

// import Jazzicon from 'vue3-jazzicon/src/components';

export default defineComponent({
  name: 'App',
  components: { LayoutHeader, About },

  data() {
    return { showAbout: false };
  },

  methods: {
    toggleAbout() {
      this.showAbout = !this.showAbout;
      console.log(this.showAbout);
    },
  },

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

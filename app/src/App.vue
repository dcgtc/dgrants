<template>
  <Loading :showLoading="showLoading" @toggle-loading="toggleLoading" />
  <About :showAbout="showAbout" @toggle-about="toggleAbout" />
  <div class="flex flex-col min-h-screen">
    <layout-header id="header" @toggle-about="toggleAbout" @toggle-loading="toggleLoading" />
    <main id="app-main" class="flex-grow bg-white"><router-view /></main>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import useSettingsStore from 'src/store/settings';
import useWalletStore from 'src/store/wallet';
import LayoutHeader from './components/LayoutHeader.vue';
import About from './components/About.vue';
import Loading from './components/Loading.vue';

export default defineComponent({
  name: 'App',
  components: { LayoutHeader, About, Loading },

  data() {
    return {
      showAbout: false,
      showLoading: false,
    };
  },

  methods: {
    toggleAbout() {
      this.showAbout = !this.showAbout;
      console.log(this.showAbout);
    },
    toggleLoading() {
      this.showLoading = !this.showLoading;
      console.log(this.showLoading);
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

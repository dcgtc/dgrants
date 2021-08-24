<template>
  <About :showAbout="showAbout" @toggle-about="toggleAbout" />
  <div class="flex flex-col min-h-screen">
    <layout-header id="header" @toggle-about="toggleAbout" />
    <main id="app-main" class="flex-grow bg-white"><router-view /></main>
    <layout-footer id="footer" />
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import About from './components/About.vue';
import LayoutHeader from './components/LayoutHeader.vue';
import LayoutFooter from './components/LayoutFooter.vue';
import useCartStore from 'src/store/cart';
import useSettingsStore from 'src/store/settings';
import useWalletStore from 'src/store/wallet';

export default defineComponent({
  name: 'App',
  components: { About, LayoutHeader, LayoutFooter },
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

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}

#nav {
  padding: 30px;
}

#nav a {
  font-weight: bold;
  color: #2c3e50;
}

#nav a.router-link-exact-active {
  color: #42b983;
}
</style>

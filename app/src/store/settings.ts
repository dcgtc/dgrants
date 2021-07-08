/**
 * @dev User settings are managed here and persisted with localStorage
 */

import { computed, ref } from 'vue';
import nightwind from 'nightwind/helper';

// Local storage key names
const settings = {
  lastWallet: 'last-wallet',
  theme: 'nightwind-mode', // this is the localStorage key name used by nightwind
};

// Helper methods to load save items from local storage
const load = (key: string) => window.localStorage.getItem(key);
/* eslint-disable @typescript-eslint/no-explicit-any */
const save = (key: string, value: any) => window.localStorage.setItem(key, value);
/* eslint-enable @typescript-eslint/no-explicit-any */

// Shared state
const lastWallet = ref<string>(); // name of last wallet used
const theme = ref<string>(); // light or dark theme

// Composition function for managing state
export default function useSettingsStore() {
  async function initializeSettings() {
    // Initialize nightwind (used for dark mode)
    nightwind.init();

    // Load settings
    lastWallet.value = load(settings.lastWallet) ? String(load(settings.lastWallet)) : undefined;
    theme.value = load(settings.theme) ? String(load(settings.theme)) : 'light';
    if (theme.value === 'dark') toggleDarkMode(); // make sure to set app to dark mode when required
  }

  function setLastWallet(walletName: string) {
    save(settings.lastWallet, walletName);
  }

  function toggleDarkMode() {
    // Nightwind uses localStorage to save its state, so no need to manage it
    nightwind.toggle();
  }

  return {
    initializeSettings,
    // Wallet
    setLastWallet,
    lastWallet: computed(() => lastWallet.value),
    // Theme
    isDark: computed(() => (theme.value === 'dark' ? true : false)),
    toggleDarkMode,
  };
}

/**
 * @dev User settings are managed here and persisted with localStorage
 */

import { computed, ref } from 'vue';

// Local storage key names
const settings = {
  lastWallet: 'last-wallet',
};

// Helper methods to load save items from local storage
const load = (key: string) => window.localStorage.getItem(key);
const save = (key: string, value: any) => window.localStorage.setItem(key, value); // eslint-disable-line @typescript-eslint/no-explicit-any
const clear = (key: string) => window.localStorage.removeItem(key);

// Shared state
const lastWallet = ref<string>(); // name of last wallet used

// Composition function for managing state
export default function useSettingsStore() {
  async function initializeSettings() {
    // Load settings
    lastWallet.value = load(settings.lastWallet) ? String(load(settings.lastWallet)) : undefined;
  }

  function setLastWallet(walletName: string) {
    save(settings.lastWallet, walletName);
  }

  function clearLastWallet() {
    clear(settings.lastWallet);
  }

  return {
    initializeSettings,
    // Wallet
    setLastWallet,
    clearLastWallet,
    lastWallet: computed(() => lastWallet.value),
  };
}

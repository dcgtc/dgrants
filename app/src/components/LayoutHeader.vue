<template>
  <header class="bg-white flex items-center gap-x-4 md:gap-x-8 h-28 mx-4 text-grey-400" aria-label="Top">
    <div class="relative group">
      <div class="font-medium flex items-center h-14 cursor-pointer">
        <router-link to="/">
          <img class="icon" src="../assets/logo.svg" alt="dGrant logo" />
        </router-link>
        <div class="ml-4 hidden md:block">
          <span class="text-teal">d</span><span class="text-grey-500">GRANTS</span>
        </div>
        <div class="ml-1">
          <ArrowBottomIcon class="icon-small icon-primary" />
        </div>
      </div>

      <div
        class="
          absolute
          hidden
          left-2
          md:left-20
          group-hover:flex
          z-10
          border border-grey-400
          p-6
          pr-10
          bg-white
          text-grey-400
          flex-col
          gap-y-2
          uppercase
          font-medium
        "
      >
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
        <div class="border-b border-grey-400 my-4"></div>
        <button @click="$emit('toggleAbout')" class="font-medium text-gray-500 hover:text-gray-900 uppercase">
          About
        </button>
      </div>
    </div>

    <div v-if="userDisplayName" class="ml-auto flex items-center gap-x-4 md:gap-x-8">
      <div class="flex items-center gap-x-2 h-14 group cursor-pointer">
        <div class="hidden md:block group-hover:text-grey-500">Cart</div>
        <CartIcon class="icon-small icon-primary" />
        <div class="group-hover:text-grey-500">12</div>
      </div>

      <div class="border-r border-grey-100 h-14"></div>

      <div class="group relative">
        <div class="flex items-center h-16 gap-x-2 space-x-4 group cursor-pointer">
          <div class="hidden md:block group-hover:text-grey-500">
            <span>{{ userDisplayName }}</span>
          </div>
          <figure>
            <Jazzicon :address="userAddress" :key="userAddress" width="40" />
          </figure>
          <div>
            <ArrowBottomIcon class="icon-small icon-primary" />
          </div>
        </div>
        <!-- menu-->
        <div
          class="
            absolute
            hidden
            group-hover:flex
            z-10
            border border-grey-400
            p-5
            right-2
            md:right-20
            bg-white
            text-grey-400
            flex-col
            gap-y-2
            uppercase
            font-medium
            text-left
            whitespace-nowrap
          "
        >
          <div>{{ userDisplayName }}</div>
          <div>{{ balance }} ETH</div>
          <div class="border-b border-grey-400 my-4"></div>

          <button
            @click="changeWallet"
            class="cursor-pointer hover:text-grey-500 flex no-underline uppercase font-medium"
          >
            change wallet
          </button>
          <button
            @click="disconnect"
            class="cursor-pointer hover:text-grey-500 flex no-underline uppercase font-medium"
          >
            disconnect wallet
          </button>
        </div>
      </div>
    </div>
    <div v-else-if="!isSupportedNetwork" class="ml-auto flex items-center">
      <div class="flex h-12 items-center pr-2 w-12">
        <WarningIcon class="icon stroke-pink" />
      </div>
      <div class="text-gray-500">Unsupported network</div>
    </div>
    <div v-else @click="connectWallet" class="flex items-center h-14 gap-x-2 group cursor-pointer ml-auto">
      <div class="hidden md:block group-hover:text-grey-500">Connect</div>
      <div>
        <ConnectWalletIcon class="icon icon-primary" />
      </div>
    </div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import useWalletStore from 'src/store/wallet';
import { WarningIcon } from '@fusion-icons/vue/interface';
import { Wallet3Icon as ConnectWalletIcon } from '@fusion-icons/vue/web3';
import { ArrowBottom2Icon as ArrowBottomIcon } from '@fusion-icons/vue/interface';
import Jazzicon from 'src/components/Jazzicon.vue';
import { Cart2Icon as CartIcon } from '@fusion-icons/vue/interface';
import { formatEther, JsonRpcProvider, Web3Provider } from 'src/utils/ethers';

// Header menu bar items
const navigation = [
  { name: 'Home', href: '/' },
  { name: 'Cart', href: '/cart' },
];

export default defineComponent({
  name: 'LayoutHeader',
  components: { ConnectWalletIcon, ArrowBottomIcon, CartIcon, Jazzicon, WarningIcon },
  emits: ['toggleAbout'],
  data() {
    return {
      balance: '0',
      provider: null as Web3Provider | JsonRpcProvider | null,
    };
  },
  watch: {
    userAddress: 'updateBalance',
  },
  methods: {
    async updateBalance() {
      if (!this.userAddress) {
        return;
      }
      const balance = await this.provider?.getBalance?.(this.userAddress);
      this.balance = formatEther(balance ?? '0');
    },
    disconnect() {
      // ToDo implement disconnect
      console.log('disconnecting');
    },
    changeWallet() {
      // ToDo implement changeWallet
      console.log('changing wallets');
    },
  },
  setup() {
    const { connectWallet, isSupportedNetwork, provider, userDisplayName, userAddress } = useWalletStore();
    return { connectWallet, isSupportedNetwork, navigation, provider, userDisplayName, userAddress };
  },
});
</script>

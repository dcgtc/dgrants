<template>
  <header class="bg-white flex items-center gap-x-4 md:gap-x-8 h-28 mx-4 text-grey-400" aria-label="Top">
    <div class="relative group">
      <div class="font-medium flex items-center h-14 cursor-pointer">
        <router-link to="/">
          <img class="icon" src="/logo.svg" alt="dGrant logo" />
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
          :to="{ name: link.name }"
          active-class="font-medium text-grey-500"
          exact
          class="hover:text-grey-500"
        >
          {{ link.label }}
        </router-link>

        <div class="border-b border-grey-400"></div>

        <div @click="emitEvent('toggleAbout')" class="text-grey-400 hover:text-grey-500 uppercase cursor-pointer">
          About
        </div>
      </div>
    </div>

    <div v-if="userAddress" class="ml-auto flex items-center gap-x-4 md:gap-x-8">
      <router-link :to="{ name: 'Cart' }" class="flex items-center gap-x-2 h-14 group cursor-pointer">
        <div class="hidden md:block group-hover:text-grey-500">Cart</div>
        <CartIcon class="icon-small icon-primary" />
        <div class="group-hover:text-grey-500">{{ cartItemsCount }}</div>
      </router-link>

      <div class="border-r border-grey-100 h-14"></div>

      <div class="group relative">
        <div class="flex items-center h-16 gap-x-2 space-x-2 group cursor-pointer">
          <div class="hidden md:block group-hover:text-grey-500">
            <span>{{ userDisplayName }}</span>
          </div>
          <div class="flex items-center">
            <figure>
              <Jazzicon :address="userAddress" :key="userAddress" :width="38" />
            </figure>
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
          <div class="border-b border-grey-400 my-4"></div>

          <button
            @click="changeWallet"
            class="cursor-pointer hover:text-grey-500 flex no-underline uppercase font-medium"
          >
            change wallet
          </button>
          <button
            @click="disconnectWallet"
            class="cursor-pointer hover:text-grey-500 flex no-underline uppercase font-medium"
          >
            disconnect wallet
          </button>
          <button
            v-if="userAddress"
            @click="myContributions(userAddress)"
            class="cursor-pointer hover:text-grey-500 flex no-underline uppercase font-medium"
          >
            my contributions
          </button>
        </div>
      </div>
    </div>

    <!-- connect wallet -->
    <div v-else @click="connectWallet" class="flex items-center h-14 gap-x-2 group cursor-pointer ml-auto">
      <div class="hidden md:block group-hover:text-grey-500">Connect</div>
      <div>
        <ConnectWalletIcon class="icon icon-primary" />
      </div>
    </div>
  </header>
</template>

<script lang="ts">
// --- External Imports ---
import { defineComponent } from 'vue';
import { Wallet3Icon as ConnectWalletIcon } from '@fusion-icons/vue/web3';
import { ArrowBottom2Icon as ArrowBottomIcon } from '@fusion-icons/vue/interface';
import { Cart2Icon as CartIcon } from '@fusion-icons/vue/interface';
// --- App Imports ---
import Jazzicon from 'src/components/Jazzicon.vue';
// --- Store ---
import useWalletStore from 'src/store/wallet';
import useCartStore from 'src/store/cart';
import { useRouter } from 'vue-router';
// Header menu bar items
const navigation = [
  { label: 'Home', name: 'Home' },
  { label: 'Rounds', name: 'dgrants-rounds-list' },
  { label: 'Grants', name: 'dgrants' },
];

// Composition function for wallet management in the header. All reading/writing related to the user's wallet
// is managed in this composition function, which reads/writes to/from src/store/wallet.ts store
function useWalletConnection() {
  const { connectWallet, disconnectWallet, changeWallet, isSupportedNetwork, userDisplayName, userAddress } =
    useWalletStore();

  return { disconnectWallet, changeWallet, connectWallet, isSupportedNetwork, userDisplayName, userAddress };
}

export default defineComponent({
  name: 'LayoutHeader',
  components: { ConnectWalletIcon, ArrowBottomIcon, CartIcon, Jazzicon },
  setup(_props, context) {
    const { cartItemsCount } = useCartStore();
    const emitEvent = (eventName: string) => context.emit(eventName);
    const router = useRouter();

    function myContributions(userId: string) {
      //TODO: further check that the userId is defined and valid?
      router.push({
        name: 'contribution',
        params: { id: userId },
      });
    }

    return {
      cartItemsCount,
      navigation,
      emitEvent,
      myContributions,
      ...useWalletConnection(),
    };
  },
});
</script>

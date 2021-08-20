<template>
  <header class="flex items-center gap-x-4 md:gap-x-8 h-28 mx-4 text-grey-400">
    <div class="group">
      <!-- 
      * logo icon + logo text + arrow 
      * -->

      <div class="relative">
        <div class="font-medium flex items-center h-14 cursor-pointer">
          <div>
            <img class="icon-large" src="../assets/logo.svg" />
          </div>
          <div class="ml-4 hidden md:block">
            <big> <span class="text-teal">d</span><span class="text-grey-500">GRANTS</span></big>
          </div>
          <div class="ml-1">
            <ArrowBottomIcon class="icon-small" />
          </div>
        </div>
      </div>

      <!-- 
      * main menu 
      * -->

      <div class="absolute hidden left-2 md:left-20 group-hover:block" style="z-index: 9999">
        <div
          class="border border-grey-400 p-6 pr-10 bg-white text-grey-400 flex flex-col gap-y-2 uppercase font-medium"
        >
          <router-link to="grants" class="cursor-pointer hover:text-grey-500 no-underline" active-class="text-grey-500"
            >grants</router-link
          >

          <router-link to="rounds" class="cursor-pointer hover:text-grey-500 no-underline" active-class="text-grey-500"
            >rounds</router-link
          >

          <div class="border-b border-grey-400 my-4"></div>

          <!-- about modal -->
          <div @click="$emit('toggle-about')" class="cursor-pointer hover:text-grey-500">About</div>

          <!-- little dev section : delete on release ... -->
          <div class="border-b border-grey-400 my-4"></div>
          <!-- richards components-->
          <router-link to="ui" class="cursor-pointer hover:text-grey-500 no-underline" active-class="text-grey-500"
            >ui</router-link
          >
          <!-- a test to trigger the loading screen -->
          <div @click="$emit('toggle-loading')" class="cursor-pointer hover:text-grey-500">
            <small>dev: trigger Loading Screen</small>
          </div>
        </div>
      </div>
    </div>

    <!--
    * cart
    * just if connected to web3
    -->

    <div v-if="userDisplayName" class="ml-auto flex items-center gap-x-2 h-14 group cursor-pointer">
      <!--text-->
      <div class="hidden md:block group-hover:text-grey-500">Cart</div>
      <!--icon-->
      <!-- when items in cart use class ="in-cart" on CartIcon -->
      <CartIcon class="icon" />
      <!--in cart number-->
      <!-- when no items in cart, dont show a 0. show nothing in that div / or hide the div. -->
      <div class="group-hover:text-grey-500">12</div>
    </div>

    <!--
    * a seperator between cart and user menu
    * just if connected to web3
    -->
    <div v-if="userDisplayName" class="border-r border-grey-100 h-14"></div>

    <!--
    * user navigation
    * just if connected to web3
    -->

    <div v-if="userDisplayName" class="group">
      <div class="relative flex items-center h-16 gap-x-2 group cursor-pointer">
        <div class="hidden md:block group-hover:text-grey-500">{{ userDisplayName }}</div>
        <div>
          <!-- identicon -->
          <img src="http://placekitten.com/64" />
        </div>
        <!--arrow-->
        <div>
          <ArrowBottomIcon class="icon-small" />
        </div>
      </div>

      <!-- menu-->
      <div class="absolute hidden right-2 md:right-20 group-hover:block" style="z-index: 9999">
        <div
          class="border border-grey-400 p-6 pr-10 bg-white text-grey-400 flex flex-col gap-y-2 uppercase font-medium"
        >
          <div>{{ userDisplayName }}</div>
          <div>1337 ETH</div>
          <div class="border-b border-grey-400 my-4"></div>

          <router-link
            to="profile"
            class="cursor-pointer hover:text-grey-500 flex no-underline"
            active-class="text-grey-500"
            >profile</router-link
          >

          <router-link
            to="favorites"
            class="cursor-pointer hover:text-grey-500 flex no-underline"
            active-class="text-grey-500"
            >favorites<span class="pl-4 ml-auto">32</span></router-link
          >

          <router-link
            to="my grants"
            class="cursor-pointer hover:text-grey-500 flex no-underline"
            active-class="text-grey-500"
            >my grants<span class="pl-4 ml-auto">32</span></router-link
          >

          <router-link
            to="settings"
            class="cursor-pointer hover:text-grey-500 flex no-underline"
            active-class="text-grey-500"
            >settings</router-link
          >

          <div class="border-b border-grey-400 my-4 flex"></div>

          <router-link
            to="change wallet"
            class="cursor-pointer hover:text-grey-500 flex no-underline"
            active-class="text-grey-500"
            >change wallet</router-link
          >
        </div>
      </div>
    </div>

    <!--
    * not connected
    * 
    -->

    <div
      v-if="!userDisplayName"
      @click="connectWallet"
      class="flex items-center h-14 gap-x-2 group cursor-pointer ml-auto"
    >
      <div class="hidden md:block group-hover:text-grey-500">Connect</div>
      <div>
        <ConnectWalletIcon class="icon" />
      </div>
    </div>

    <!--
    * not supported network
    * 
    -->

    <div v-if="!isSupportedNetwork" class="text-pink">Not supportet Network!</div>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import useWalletStore from 'src/store/wallet';

//icons
import { Wallet3Icon as ConnectWalletIcon } from '@fusion-icons/vue/web3';
import { ArrowBottom2Icon as ArrowBottomIcon } from '@fusion-icons/vue/interface';
import { Cart2Icon as CartIcon } from '@fusion-icons/vue/interface';

// Header menu bar items
const navigation = [
  { name: 'Home', href: '/' },
  { name: 'About', href: '/about' },
  { name: 'Docs', href: '/docs' },
  { name: 'Contact', href: '/contact' },
  { name: 'Ui', href: '/ui' },
];

export default defineComponent({
  name: 'LayoutHeader',
  components: { ConnectWalletIcon, ArrowBottomIcon, CartIcon },
  setup() {
    const { connectWallet, isSupportedNetwork, userDisplayName } = useWalletStore();
    return { connectWallet, isSupportedNetwork, navigation, userDisplayName };
  },
});
</script>

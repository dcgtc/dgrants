<template>
  <!--
* @richard : these components are all hardcoded
* and need to get props / data logic.
-->

  <div class="bg-pink">BaseHeader</div>
  <BaseHeader />

  <!--
*
*
-->

  <div class="bg-pink">BaseFilterNav</div>
  <BaseFilterNav />

  <!--
*
*
-->

  <!-- i could not name it BaseSectionTitle - got errors on it. 
  didnt get the concept of slots need help to do this right -->
  <div class="bg-pink">BaseTitle</div>
  <BaseTitle />

  <!--
*
*
-->

  <div class="bg-pink">BaseTabs</div>
  <BaseTabs />

  <!--
*
*
-->

  <div class="bg-pink">GrantCard ( in a Grid )</div>
  <section
    class="
      px-4
      md:px-12
      py-12
      pb-24
      grid
      gap-x-12 gap-y-12
      grid-cols-1
      md:grid-cols-2
      lg:grid-cols-3
      xl:grid-cols-4
      border-b border-grey-100
    "
  >
    <GrantCard /><GrantCard /><GrantCard /><GrantCard /><GrantCard /><GrantCard /><GrantCard /><GrantCard />
  </section>

  <!--
*
*
-->

  <div class="bg-pink">ActionsNav</div>
  <ActionsNav />

  <!--
*
*
-->

  <div class="bg-pink">ContributionRow</div>
  <ContributionRow />

  <!--
*
*
-->

  <div class="bg-pink">CartItem</div>
  <CartItem />

  <!--
*
*
-->

  <div class="bg-pink">GrantDetailsRow</div>
  <GrantDetailsRow />

  <!--
*
*
-->

  <div class="bg-teal">HTML-Fragment : Grant Description</div>
  <!----------------------------------------------- GRANT DESCRIPTION  -->
  <div class="border-b border-grey-100">
    <p class="intent px-4 md:px-12 py-12 mx-auto max-w-6xl">
      Im a paragraph but with intent. <a href="#">link</a> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
      diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
      accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor
      sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
      labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
      Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
    </p>
  </div>

  <!--
*
*
-->

  <div class="bg-teal">HTML-Fragment : Button</div>
  <!----------------------------------------------- BUTTON -->
  <button class="uppercase font-medium bg-grey-500 text-white px-8 py-4 hover:bg-grey-400">Click me</button>

  <!--
*
*
-->

  <div class="bg-teal">HTML-Fragment : Transaction Status</div>
  <!----------------------------------------------- transaction status -->
  <div class="px-4 md:px-12 py-8 border-b border-grey-100">
    <div class="grid grid-cols-12 items-center gap-x-8">
      <div class="col-span-12 md:col-span-3 mb-3 md:mb-0">
        <span class="text-grey-400">Hash:</span>
      </div>
      <div class="col-span-12 md:col-span-9">
        <div class="break-all"><a href="#">0xd510ef6c442fc967436e0bcaf0837ab372eced86fda84b04958b5e315f0a083a</a></div>
      </div>
    </div>
  </div>

  <!--
*
*
-->

  <div class="bg-teal">HTML-Fragment : Transaction Pending</div>
  <!----------------------------------------------- transaction pending  -->
  <div class="px-4 md:px-12 py-8 border-b border-grey-100">
    <div class="grid grid-cols-12 items-center gap-x-8">
      <div class="col-span-12 md:col-span-3 mb-3 md:mb-0">
        <span class="text-grey-400">Status:</span>
      </div>
      <div class="col-span-12 md:col-span-9">
        <div class="my-4">
          <span class="uppercase px-8 py-4 border-2 border-grey-400 text-grey-400 font-medium mr-4">pending</span>
          Pending since 37 sec
        </div>
      </div>
    </div>
  </div>

  <!--
*
*
-->

  <div class="bg-teal">HTML-Fragment : Transaction Success</div>
  <!----------------------------------------------- transaction sucess  -->
  <div class="px-4 md:px-12 py-8 border-b border-grey-100">
    <div class="grid grid-cols-12 items-center gap-x-8">
      <div class="col-span-12 md:col-span-3 mb-3 md:mb-0">
        <span class="text-grey-400">Status:</span>
      </div>
      <div class="col-span-12 md:col-span-9">
        <div class="my-4">
          <span class="uppercase px-8 py-4 border-2 border-teal text-teal font-medium mr-4">success</span>
          Confirmed within 37 sec
        </div>
      </div>
    </div>
  </div>

  <!--
*
*
-->

  <div class="bg-teal">HTML-Fragment : Transaction Failed</div>
  <!----------------------------------------------- transaction failed  -->
  <div class="px-4 md:px-12 py-8 border-b border-grey-100">
    <div class="grid grid-cols-12 items-center gap-x-8">
      <div class="col-span-12 md:col-span-3 mb-3 md:mb-0">
        <span class="text-grey-400">Status:</span>
      </div>
      <div class="col-span-12 md:col-span-9">
        <div class="my-4">
          <span class="uppercase px-8 py-4 border-2 border-pink text-pink font-medium mr-4">fail</span>
          Confirmed within 37 sec
        </div>
      </div>
    </div>
  </div>

  <!--
* 
*
-->

  <div class="bg-teal">HTML-Fragment : InputRow what can have some inputfields like text, dropdown ...</div>
  <!----------------------------------------------- A SINGLE INPUT
with optional delete item InputRow.vue
-->

  <div class="px-4 md:px-12 py-8 border-b border-grey-100">
    <div class="grid grid-cols-12 items-center gap-x-8">
      <!-- label -->
      <div class="col-span-12 md:col-span-3 mb-3 md:mb-0">
        <label for="" class="text-grey-400">Website:</label>
      </div>

      <!-- input -->
      <div class="col-span-10 md:col-span-7">
        <input type="text" placeholder="https://" />
      </div>

      <!-- optional delete icon -->
      <div class="col-span-2 justify-self-end">
        <XIcon class="icon cursor-pointer" />
      </div>
    </div>
  </div>

  <!--
* 
*
-->

  <div class="bg-teal">HTML-Fragment : same row but inset via a wrapper</div>
  <!----------------------------------------------- A SINGLE INPUT WRAPPER
with optional delete item -->

  <!-- pref : inset  :class="`${inset ? "px-4..." : ""}`"   -->
  <div class="px-4 md:px-12">
    <div class="py-8 border-b border-grey-100">
      <div class="grid grid-cols-12 items-center gap-x-8">
        <!-- label -->
        <div class="col-span-12 md:col-span-3 mb-3 md:mb-0">
          <label for="" class="text-grey-400">Website:</label>
        </div>

        <!-- input -->
        <div class="col-span-10 md:col-span-7">
          <input type="text" placeholder="https://" />
        </div>

        <!-- optional delete icon -->
        <div class="col-span-2 justify-self-end">
          <XIcon class="icon cursor-pointer" />
        </div>
      </div>
    </div>
  </div>

  <!--
* 
*
-->

  <div class="bg-teal">autocomplete dropdown - unsure cause not suported by tailwind/forms in styling the arrow</div>
  <!-- theres a native html autocomplete thingy we could use for tokens
  but tailfind/forms not support it in styles, and im not sure if i like it 
  i wrote an issue https://github.com/tailwindlabs/tailwindcss/discussions/5187 -->

  <div>
    <datalist id="tokens">
      <option>eth</option>
      <option>dai</option>
      <option>wai</option>
      <option>weth</option>
      <option>pan</option>
    </datalist>
    <input type="text" autoComplete="on" list="tokens" placeholder="eth" />
  </div>

  <div class="bg-teal">some other inputs ( just to see the look )</div>

  <div class="flex gap-8">
    <div>
      <input type="number" placeholder="0" />
    </div>

    <div>
      <input type="password" placeholder="password" />
    </div>

    <div>
      <input type="checkbox" name="radio" />
    </div>

    <div>
      <input type="radio" name="radio" />
      <input type="radio" name="radio" />
    </div>

    <div>
      <select name="token" class="w-36">
        <option>eth</option>
        <option>dai</option>
        <option>wai</option>
        <option>weth</option>
        <option>pan</option>
      </select>
    </div>
  </div>

  <!--
* 
*
-->

  <div class="bg-teal">button / button with icon</div>

  <div class="flex gap-8">
    <div>
      <button class="whitespace-nowrap uppercase font-medium bg-grey-500 text-white px-8 py-4 hover:bg-grey-400">
        test
      </button>
    </div>

    <div>
      <button
        class="
          flex
          items-center
          gap-2
          whitespace-nowrap
          uppercase
          font-medium
          bg-grey-500
          text-white
          px-8
          py-4
          hover:bg-grey-400
        "
      >
        <CollectionIcon class="stroke-3 stroke-white object-contain h-6 w-6 md:h-8 md:w-8" />
        <span>test</span>
      </button>
    </div>
  </div>

  <!--
*
*
-->

  <div class="bg-teal">toggle</div>

  <div>
    <input v-model="toggle" type="checkbox" style="visibility: hidden" checked />
    <span
      v-if="toggle"
      @click="
        () => {
          toggle = !toggle;
        }
      "
      >on</span
    >
    <span
      v-if="!toggle"
      @click="
        () => {
          toggle = !toggle;
        }
      "
      >off</span
    >
  </div>

  <!--
* 
*
-->

  <div class="bg-teal">nav</div>
  <!----------------------------------------------- NAVIGATION 
with: logo + text + arrow + menu
with optional : cart ( text + icon + number )
with optional : web3-connected ( address + identicon + arrow + menu )
with optional : web3-not-connected ( text + icon )
-->
  <nav class="flex items-center gap-x-4 md:gap-x-8 h-28 mx-4 text-grey-400" style="z-index: 9999">
    <!-- logo + menu -->
    <div class="group">
      <div class="relative">
        <!--logo + text + arrow -->
        <div class="font-medium flex items-center h-14 cursor-pointer">
          <!-- img -->
          <div>
            <img class="icon-large" src="../assets/logo.svg" />
          </div>
          <!--txt-->
          <div class="ml-4 hidden md:block">
            <big> <span class="text-teal">d</span><span class="text-grey-500">GRANTS</span></big>
          </div>
          <!--arrow-->
          <div class="ml-1">
            <ArrowBottomIcon class="icon-small" />
          </div>
        </div>
      </div>

      <!-- main menu-->
      <div class="absolute hidden left-2 md:left-20 group-hover:block" style="z-index: 9999">
        <div
          class="border border-grey-400 p-6 pr-10 bg-white text-grey-400 flex flex-col gap-y-2 uppercase font-medium"
        >
          <div class="text-grey-500">grants</div>
          <div class="cursor-pointer hover:text-grey-500">rounds</div>
          <div class="cursor-pointer hover:text-grey-500">collections</div>
          <!-- seperator -->
          <div class="border-b border-grey-400 my-4"></div>
          <div class="cursor-pointer hover:text-grey-500">about</div>
        </div>
      </div>
    </div>
    <!-- group end-->

    <!-- cart -->
    <div class="ml-auto flex items-center gap-x-2 h-14 group cursor-pointer">
      <!--text-->
      <div class="hidden md:block group-hover:text-grey-500">Cart</div>
      <!--icon-->
      <CartIcon class="icon" />
      <!--in cart number-->
      <div class="group-hover:text-grey-500">12</div>
    </div>

    <!--seperator-->
    <div class="border-r border-grey-100 h-14"></div>

    <!-- web3:connected : show this-->
    <div class="group">
      <!--navigation part-->
      <div class="relative flex items-center h-16 gap-x-2 group cursor-pointer">
        <!--text-->
        <div class="hidden md:block group-hover:text-grey-500">0x7099…79C8</div>
        <!--image-->
        <div>
          <ArrowBottomIcon class="icon-small" />
        </div>
        <!--arrow-->
        <div>
          <img class="icon-small" src="http://placekitten.com/64" />
        </div>
      </div>

      <!-- menu-->
      <div class="absolute hidden right-2 md:right-20 group-hover:block" style="z-index: 9999">
        <div
          class="border border-grey-400 p-6 pr-10 bg-white text-grey-400 flex flex-col gap-y-2 uppercase font-medium"
        >
          <div>0xff…ffff</div>
          <div>1337 ETH</div>
          <div class="border-b border-grey-400 my-4"></div>
          <div class="cursor-pointer hover:text-grey-500 flex">profile</div>
          <div class="cursor-pointer hover:text-grey-500 flex">favorites<span class="pl-4 ml-auto">32</span></div>
          <div class="cursor-pointer hover:text-grey-500 flex">my grants<span class="pl-4 ml-auto">32</span></div>
          <div class="cursor-pointer hover:text-grey-500 flex">settings</div>
          <div class="border-b border-grey-400 my-4 flex"></div>
          <div class="cursor-pointer hover:text-grey-500 flex">change wallet</div>
          <div class="cursor-pointer hover:text-grey-500 flex">disconnect wallet</div>
        </div>
      </div>
    </div>

    <!-- web3: not connected : show this-->
    <div class="flex items-center h-14 gap-x-2 group cursor-pointer">
      <!--text-->
      <div class="hidden md:block group-hover:text-grey-500">Connect</div>
      <!--image-->
      <div>
        <ConnectWalletIcon class="icon" />
      </div>
    </div>
  </nav>

  <br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br /><br />

  <!--
* 
*
--></template>

<script lang="ts">
import { defineComponent } from 'vue';
// bigger components
import BaseHeader from 'src/components/BaseHeader.vue';
import BaseFilterNav from 'src/components/BaseFilterNav.vue';
import BaseTitle from 'src/components/BaseTitle.vue';
import BaseTabs from 'src/components/BaseTabs.vue';
import GrantCard from 'src/components/GrantCard.vue';
import ActionsNav from 'src/components/ActionsNav.vue';
import ContributionRow from 'src/components/ContributionRow.vue';
import CartItem from 'src/components/CartItem.vue';
import GrantDetailsRow from 'src/components/GrantDetailsRow.vue';

//all the icons i use
import { ArrowBottom2Icon as ArrowBottomIcon } from '@fusion-icons/vue/interface';
import { ViewListIcon as CollectionIcon } from '@fusion-icons/vue/interface';
import { Cart2Icon as CartIcon } from '@fusion-icons/vue/interface';
import { CloseIcon as XIcon } from '@fusion-icons/vue/interface';
import { Wallet3Icon as ConnectWalletIcon } from '@fusion-icons/vue/web3';

export default defineComponent({
  name: 'Ui',
  components: {
    ArrowBottomIcon,
    CartIcon,
    ConnectWalletIcon,
    CollectionIcon,
    XIcon,
    BaseHeader,
    BaseFilterNav,
    BaseTitle,
    BaseTabs,
    GrantCard,
    ActionsNav,
    ContributionRow,
    CartItem,
    GrantDetailsRow,
  },
  data() {
    return {
      toggle: false,
    };
  },
});
</script>

<!----- toto : 

- input item for simple toggle
- round card
- round detail view top part
- spread x eth to y grants banner thingy
- links list for grants and rounds
- about modal
- jazzicon images

-->

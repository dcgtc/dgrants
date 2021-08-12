<!-- ActionsNav  
a group of Icon + Text Links used in the Cart and in Round and Grant Detail Page.
some items wana be shift to LEFT with class "ml-auto"

i am unsure how to load all icons in here - to be able to use it in a flexible way,
without running into issues in linter test ...  i had to deactivate most again ...

as we just have this bar in 3 places, maybe we should not make it modular but just copy it
for usage in cart and in rounds and in grants  ??  up to you guys. 

-->

<template>
  <div class="px-4 md:px-12 py-8 border-b border-grey-100">
    <div class="flex flex-wrap gap-x-12 gap-y-4">
      <div class="group flex items-center gap-4 cursor-pointer">
        <CollectionIcon class="icon cursor-pointer" />
        <span class="hidden md:block text-grey-400 group-hover:text-grey-500">Save as Collection</span>
      </div>

      <div class="group flex items-center gap-4 cursor-pointer">
        <ShareIcon class="icon cursor-pointer" />
        <span class="hidden md:block text-grey-400 group-hover:text-grey-500">Share Cart</span>
      </div>

      <div class="group flex items-center gap-4 cursor-pointer ml-auto">
        <XIcon class="icon cursor-pointer" />
        <span class="hidden md:block text-grey-400 group-hover:text-grey-500">Clear Cart</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

//import { ArrowBottom2Icon as ArrowBottomIcon } from '@fusion-icons/vue/interface';
//import { ArrowRight2Icon as ArrowRightSmallIcon } from '@fusion-icons/vue/interface';
//import { ArrowLeft4Icon as ArrowLeftIcon } from '@fusion-icons/vue/interface';
//import { ArrowRight4Icon as ArrowRightIcon } from '@fusion-icons/vue/interface';
//import { Heart2Icon as FavoriteIcon } from '@fusion-icons/vue/interface';
import { ViewListIcon as CollectionIcon } from '@fusion-icons/vue/interface';
import { ArrowToprightIcon as ShareIcon } from '@fusion-icons/vue/interface';
//import { Cart2Icon as CartIcon } from '@fusion-icons/vue/interface';
import { CloseIcon as XIcon } from '@fusion-icons/vue/interface';
//import { SearchIcon as SearchIcon } from '@fusion-icons/vue/interface';
//import { Edit3Icon as EditIcon } from '@fusion-icons/vue/interface';
//import { CheckmarkIcon as CheckmarkIcon } from '@fusion-icons/vue/interface';
//import { Add1Icon as AddIcon } from '@fusion-icons/vue/interface';
//import { ImportIcon as ImportIcon } from '@fusion-icons/vue/interface';
//import { Wallet3Icon as ConnectWalletIcon } from '@fusion-icons/vue/web3';

export default defineComponent({
  name: 'ActionsNav',
  components: {
    CollectionIcon,
    ShareIcon,
    XIcon,
  },
});
</script>

<!-- ActionsNav  
a group of Icon + Text Links used in the Cart and in Round and Grant Detail Page.
some items wana be shift to LEFT with class "ml-auto"

im not sure if this should be a dynamic component,
as it would need props for each action :

- action-url / what happens on click on item
- action-name
- action-icon
- load icon component based on that
- when ml-auto ( push icon to right side)

i think we should just copy this 3 times for all 3 uses and fill it with specific content to safe time !?

---

see : i added scoped styles to make the html better readable.
im not sure if this works on build or if i have to add <style postcss> 
as i remember philip told something like this ( i forgot )

-->

<template>
  <div class="px-4 md:px-12 py-8 border-b border-grey-100">
    <div class="flex flex-wrap gap-x-6 gap-y-4">
      <div class="flex items-center gap-x-2 cursor-pointer group">
        <CollectionIcon class="icon" />
        <span class="text-grey-400 group-hover:text-grey-500">Save</span>
      </div>

      <div class="flex items-center gap-x-2 cursor-pointer group">
        <ShareIcon class="icon" />
        <span class="text-grey-400 group-hover:text-grey-500">Share</span>
      </div>

      <div class="flex items-center gap-x-2 cursor-pointer group ml-auto">
        <XIcon class="icon" />
        <span class="text-grey-400 group-hover:text-grey-500">Clear</span>
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

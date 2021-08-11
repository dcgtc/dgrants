<!-- GrantCard
  this is for various pages that needs to display a grant / set of grants.
  in ui.vue you can see the related grid that wrapps these cards.
-->

<template>

<figure class="cursor-pointer">
  <div class="relative">
    <img class="shadow-light" src="http://placekitten.com/1920/1080?image=1" />
    <div class="group absolute bottom-0 right-0 p-4 bg-white opacity-30 hover:opacity-100">
      <CartIcon class="icon-small" />
    </div>
  </div>
  <figcaption class="mt-4">
    <div class="text-grey-500 font-medium truncate">Gitcoin Grants Official Matching Pool Fund</div>
    <div><span class="text-grey-400">by</span><a class="ml-1" href="#">0xff…ffff</a></div>
    <div><span class="text-grey-400">Raised:</span><span class="ml-1">315.355 USD</span></div>
  </figcaption>
</figure>

</template>

<script lang="ts">
import { defineComponent } from 'vue';

// icons
import { Cart2Icon as CartIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'GrantCard',
  components: { CartIcon },
});
</script>

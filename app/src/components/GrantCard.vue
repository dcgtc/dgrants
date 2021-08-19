<!-- GrantCard
  this is for various pages that needs to display a grant / set of grants.
  in ui.vue you can see the related grid that wrapps these cards.
-->

<template>
  <figure class="group cursor-pointer">
    <div class="relative">
      <img class="shadow-light" src="http://placekitten.com/1920/1080?image=1" />
      <div class="absolute bottom-0 right-0">
        <!-- when item in cart, add class "in-cart" to <button> -->
        <button class="btn opacity-0 group-hover:opacity-100">
          <CartIcon />
        </button>
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

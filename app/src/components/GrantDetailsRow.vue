<!-- GrantDetailsRow  
this is a part of the Grant Detail View
-->

<template>
  <div class="border-b border-grey-100">
    <div class="grid grid-cols-4 gap-8">
      <!-- img -->
      <div class="col-span-4 xl:col-span-2">
        <img class="shadow-light" src="http://placekitten.com/1920/1080?image=1" />
      </div>
      <!-- raised, contract, round, matching -->
      <div class="col-span-4 md:col-span-2 xl:col-span-1 mb-8 xl:mb-0">
        <div class="px-4 xl:px-0">
          <div><span class="text-grey-400 mr-4">Raised:</span>1337 USD</div>
          <div><span class="text-grey-400 mr-4">Contract:</span><a href="">0xff…ffff</a></div>
          <div><span class="text-grey-400 mr-4">In Round:</span><a href="">GR11</a></div>
          <div><span class="text-grey-400 mr-4">Matching:</span><a href="">Quadratic</a></div>
        </div>
      </div>
      <!-- add to cart, matching example -->
      <div class="col-span-4 md:col-span-2 xl:col-span-1">
        <div class="px-4 xl:px-12 md:text-right mb-8 xl:mb-0">
          <div class="mb-4 flex md:justify-end">
            <!-- when item in cart add class "in-cart" + text in span "remove from cart"-->
            <button class="btn">
              <CartIcon />
              <span>add to cart</span>
            </button>
          </div>

          <div>
            <div>1 USD ≈ 32 USD Matching</div>
            <div>10 USD ≈ 83 USD Matching</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { Cart2Icon as CartIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'GrantDetailsRow',
  components: { CartIcon },
});
</script>

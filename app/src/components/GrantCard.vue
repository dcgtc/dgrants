<!-- GrantCard -->

<template>
  <figure class="group cursor-pointer">
    <div class="relative">
      <img class="shadow-light" :src="imgurl" />
      <div class="absolute bottom-0 right-0">
        <!-- when item in cart, add class "in-cart" to <button> -->
        <button class="btn opacity-0 group-hover:opacity-100" :class="{ 'in-cart': incart }">
          <CartIcon />
        </button>
      </div>
    </div>
    <figcaption class="mt-4">
      <div class="text-grey-500 font-medium truncate">{{ name }}</div>
      <div>
        <span class="text-grey-400">by</span><a class="ml-1" href="#">{{ address }}</a>
      </div>
      <div>
        <span class="text-grey-400">Raised:</span><span class="ml-1">{{ raised }}</span>
      </div>
    </figcaption>
  </figure>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

// icons
import { Cart2Icon as CartIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'GrantCard',
  props: {
    name: String,
    imgurl: String,
    address: String,
    raised: String,
    incart: Boolean,
  },
  components: { CartIcon },
});
</script>

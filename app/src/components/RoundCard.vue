<!-- RoundCard
  this is for various pages that needs to display a grant / set of rounds.
  in ui.vue you can see the related grid that wrapps these cards.
-->

<template>
  <figure class="cursor-pointer">
    <div>
      <img class="shadow-light" src="http://placekitten.com/1920/1080?image=1" />
    </div>
    <figcaption class="mt-4">
      <div class="text-grey-500 font-medium truncate">Gitcoin GR11</div>
      <div><span class="text-grey-400">by</span><a class="ml-1" href="#">gitcoindao.eth</a></div>
      <div>
        <span class="text-grey-400">Grants:</span><span class="ml-1"><a href="">49</a></span>
      </div>
      <div><span class="text-grey-400">Funds:</span><span class="ml-1">500.000 USD</span></div>
    </figcaption>
  </figure>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'RoundCard',
  components: {},
});
</script>

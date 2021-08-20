<!-- RoundCard -->

<template>
  <figure class="cursor-pointer">
    <div>
      <!--<img class="shadow-light" src="http://placekitten.com/1920/1080?image=1" />-->
      <img :src="imgurl" alt="" />
    </div>
    <figcaption class="mt-4">
      <div class="text-grey-500 font-medium truncate">{{ name }}</div>
      <div>
        <span class="text-grey-400">by</span><a class="ml-1" href="#">{{ address }}</a>
      </div>
      <div>
        <span class="text-grey-400">Grants:</span
        ><span class="ml-1"
          ><a href="">{{ grants }}</a></span
        >
      </div>
      <div>
        <span class="text-grey-400">Funds:</span><span class="ml-1">{{ funds }}</span>
      </div>
    </figcaption>
  </figure>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'RoundCard',
  props: {
    name: String,
    imgurl: String,
    address: String,
    grants: String,
    funds: String,
  },
  components: {},
});
</script>

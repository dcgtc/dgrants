<!-- RoundDetailsRow  
this is a part of the Round Detail View
-->

<template>
  <div class="border-b border-grey-100">
    <div class="grid grid-cols-4 gap-8">
      <div class="col-span-4 xl:col-span-2">
        <!--<img class="shadow-light" src="http://placekitten.com/1920/1080?image=1" />-->
        <img src="../assets/building-gitcoin-keyshape-animation.svg" alt="" />
      </div>

      <div class="col-span-4 md:col-span-2 xl:col-span-1 mb-8 xl:mb-0">
        <div class="px-4 xl:px-0">
          <div><span class="text-grey-400 mr-4">Funds:</span>500.000 USD</div>
          <div><span class="text-grey-400 mr-4">Contract:</span><a href="">0xff…ffff</a></div>
          <div><span class="text-grey-400 mr-4">Grants in Round:</span><a href="">847</a></div>
          <div><span class="text-grey-400 mr-4">Period:</span>21.6.2021 – 08.7.2021</div>
          <div><span class="text-grey-400 mr-4">Matching:</span>Quadratic</div>
        </div>
      </div>

      <div class="col-span-4 md:col-span-2 xl:col-span-1">
        <div class="px-4 xl:px-12 md:text-right mb-8 xl:mb-0">
          <div class="mb-4 flex md:justify-end">
            <button class="btn">see grants</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'RoundDetailsRow',
  components: {},
});
</script>

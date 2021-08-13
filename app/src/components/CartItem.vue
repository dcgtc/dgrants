<!-- CartItem  
one grant item in the cart.
unsure how much this needs more granularity - e.g. the amount input + token dropdown
-->

<template>
  <div class="px-4 md:px-12">
    <div class="py-8 border-b border-grey-100">
      <div class="grid grid-flow-col items-center gap-x-8">
        <div>
          <div class="grid grid-cols-4 items-center gap-x-8 gap-y-4">
            <!-- image -->
            <div class="col-span-4 lg:col-span-1">
              <figure class="max-w-lg">
                <img class="shadow-light" src="http://placekitten.com/1920/1080?image=1" />
              </figure>
            </div>
            <!-- text -->
            <div class="col-span-4 lg:col-span-1">
              <div>DeFi Developer Roadmap V3</div>
            </div>
            <!-- input -->
            <div class="col-span-4 lg:col-span-1">
              <div class="flex">
                <input class="w-1/2" type="number" placeholder="0" />
                <select name="token" class="border-l-0 w-1/2">
                  <option value="eth">ETH</option>
                  <option value="dai">DAI</option>
                  <option value="gtc">GTC</option>
                  <option value="weth">WETH</option>
                </select>
              </div>
            </div>
            <!-- matching -->
            <div class="col-span-4 lg:col-span-1">
              <div class="text-grey-400">not in an active round</div>
            </div>
          </div>
        </div>

        <div class="justify-self-end">
          <XIcon class="icon cursor-pointer" />
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { CloseIcon as XIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'CartItem',
  components: { XIcon },
});
</script>

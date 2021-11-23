<template>
   <div class="text-center mx-auto px-4 md:px-12 flex justify-around">
    <template v-if="alchemyTime || alchemyTime">
      <div class="">
        <h2 class="text-left">Moralis</h2>
        <pre style="font-size: 14px; text-align: left;">
          {{moralisTime}}
        </pre>
      </div>

      <div class="">
        <h2 class="text-left">Alchemy</h2>
        <pre style="font-size: 14px; text-align: left;">
          {{ alchemyTime }}
        </pre>
      </div>      

    </template>
   </div>

</template>

<script lang="ts">
import { initStress } from 'src/store/stress';
import { defineComponent} from 'vue';

const stressCount = 1;
const alchemy_rpc = 'https://polygon-mainnet.g.alchemy.com/v2/EDGl6ZSI39a9rlwQwfxlWcLsgYkac02v';
const moralis_rpc = 'https://speedy-nodes-nyc.moralis.io/a2586e6a4965d7035a097eaf/polygon/mainnet';

const alchemyTime = await initStress(alchemy_rpc, stressCount);
const moralisTime = await initStress(moralis_rpc, stressCount);

export default defineComponent({
  name: 'Benchmark',
  components: { },

  setup() {
  
    return { alchemyTime, moralisTime }
  },
});
</script>

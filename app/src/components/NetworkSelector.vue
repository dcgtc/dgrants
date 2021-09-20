<template>
  <div v-if="!isSupportedNetwork" class="px-4 md:px-12 py-8 bg-grey-200 text-white">
    <div class="block md:flex gap-x-8 items-center">
      <div>
        <p class="text-white bg-pink inline">
          Connect your wallet to {{ supportedNetworkName }} to enable full functionality of this app.
        </p>
      </div>

      <div class="ml-auto mt-4 md:mt-0">
        <button class="btn text-left">
          <NetworkIcon />
          <div>Switch network</div>
        </button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { NetworkIcon } from '@fusion-icons/vue/interface';
import { CHAIN_INFO } from 'src/utils/chains';
import useWalletStore from 'src/store/wallet';

export default defineComponent({
  name: 'NetworkSelector',
  components: { NetworkIcon },
  setup() {
    const { isSupportedNetwork } = useWalletStore();
    return { isSupportedNetwork, supportedNetworkName: CHAIN_INFO.label };
  },
});
</script>

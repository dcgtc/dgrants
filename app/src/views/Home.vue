<template>
  <h1 class="my-6 text-center text-3xl font-extrabold text-gray-900">Hello {{ userDisplayName }}</h1>

  <div v-if="userDisplayName">
    <div>Block number: {{ blockNumber }}</div>
  </div>

  <div class="flex justify-center mt-6">
    <button @click="pushRoute({ name: 'dgrants-rounds-list' })" class="btn btn-primary mr-3">Grant Rounds</button>
    <button @click="pushRoute({ name: 'dgrants' })" class="btn btn-primary mr-3">Grants Registry</button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import useDataStore from 'src/store/data';
import useWalletStore from 'src/store/wallet';
import { commify, formatUnits } from 'src/utils/ethers';
import { pushRoute } from 'src/utils/utils';

export default defineComponent({
  name: 'Home',
  setup() {
    const { lastBlockNumber } = useDataStore();
    const { userDisplayName, network } = useWalletStore();

    const blockNumber = computed(() => commify(lastBlockNumber.value));

    return { formatUnits, pushRoute, blockNumber, network, userDisplayName };
  },
});
</script>

<template>
  <div class="font-bold">Hello {{ userDisplayName }}</div>

  <div v-if="userDisplayName">
    <div>Block number: {{ blockNumber }}</div>
    <div>Date: {{ date }}</div>
    <div>Balance: {{ balance }} ETH</div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import useDataStore from 'src/store/data';
import useWalletStore from 'src/store/wallet';
import { commify, formatUnits } from 'src/utils/ethers';

export default defineComponent({
  name: 'Home',
  setup() {
    const { lastBlockNumber, lastBlockTimestamp, ethBalance } = useDataStore();
    const { userDisplayName, network } = useWalletStore();

    const blockNumber = computed(() => commify(lastBlockNumber.value));
    const date = computed(() => new Date(lastBlockTimestamp.value * 1000).toLocaleString());
    const balance = computed(() => (ethBalance.value ? Number(formatUnits(ethBalance.value)).toFixed(4) : 0));
    return { userDisplayName, network, blockNumber, date, balance, formatUnits };
  },
});
</script>

<template>
  <!-- Transaction hash -->
  <section>
    <label>Hash:</label>
    <div class="">
      <a :href="etherscanUrl" target="_blank" rel="noopener noreferrer " class="link break-all">{{ hash }}</a>
    </div>
  </section>

  <!-- Status -->
  <section>
    <label>Status:</label>

    <template v-if="status === 'pending'">
      <div class="status pending">Pending</div>
      <div>Pending for {{ timeString }}</div>
    </template>

    <template v-else-if="status === 'success'">
      <div class="status success">Success</div>
      <div>Confirmed in {{ timeString }}</div>
    </template>

    <template v-else-if="status === 'failed'">
      <div class="status failed">Fail</div>
      <div>Failed after {{ timeString }}</div>
    </template>
  </section>

  <!-- Copy + button -->
  <section>
    <div>
      <template v-if="status === 'pending'">Your transaction is pending. </template>
      <template v-if="status === 'success'">Transaction successful! </template>
      <template v-if="status === 'failed'">Something went wrong. Please check the transaction and try again.</template>
    </div>

    <button
      v-if="label"
      @click="action ? action() : () => ({})"
      class="btn ml-auto"
      :class="{ disabled: status === 'pending' }"
      :disabled="status === 'pending'"
    >
      {{ label }}
    </button>
  </section>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, SetupContext, watch } from 'vue';
import { getEtherscanUrl } from 'src/utils/utils';
import useWalletStore from 'src/store/wallet';

const emittedEventName = 'onReceipt'; // emitted once we receive the transaction receipt

function useTransactionStatus(hash: string, context: SetupContext<'onReceipt'[]>) {
  // Transaction status management
  const status = ref<'pending' | 'success' | 'failed'>('pending'); // available states
  const emitTxReceipt = (success: boolean) => context.emit(emittedEventName, success); // emit event when we get receipt

  // UI timer management
  const timer = ref(1); // number of seconds transaction has been pending for
  const timeString = computed(() => (timer.value === 1 ? '1 second' : `${timer.value} seconds`));
  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)); // for updating timer each second
  watch(
    () => timer.value,
    async () => {
      // Update timer every second when transaction is pending
      if (status.value !== 'pending') return;
      await sleep(1000);
      timer.value += 1;
    },
    { immediate: true }
  );

  // Etherscan URL helpers
  const chainId = ref(1); // default chainId is mainnet
  const etherscanUrl = computed(() => getEtherscanUrl(hash, chainId.value));

  // On mount, fetch receipt and wait for it to be mined, and emit event with receipt status once mined
  onMounted(async () => {
    const { provider } = useWalletStore();
    chainId.value = (await provider.value.getNetwork()).chainId;
    const receipt = await provider.value.waitForTransaction(hash);
    status.value = receipt.status === 1 ? 'success' : 'failed';
    emitTxReceipt(Boolean(receipt.status));
  });

  return { etherscanUrl, status, timeString };
}

export default defineComponent({
  name: 'TransactionStatus',
  emits: [emittedEventName],
  props: {
    hash: { type: String, required: true }, // transaction hash
    buttonLabel: { type: String, required: false, default: undefined }, // if true, show button with this label
    buttonAction: { type: Function, required: false, default: undefined }, // if buttonLabel is present, execute this method when button is clicked
  },
  setup(props, context) {
    return {
      action: props.buttonAction,
      label: props.buttonLabel,
      ...useTransactionStatus(props.hash, context),
    };
  },
});
</script>

<style scoped>
label {
  @apply text-grey-400 w-1/5;
}

section {
  @apply px-4 py-8 md:px-12 border-b border-grey-100 flex flex-wrap items-center gap-x-8 gap-y-4;
}

.status {
  @apply px-6 py-4 border-2 border-grey-500;
}

.status.pending {
  @apply border-grey-500 text-grey-500;
}
.status.success {
  @apply border-teal text-teal;
}
.status.failed {
  @apply border-pink text-pink;
}
</style>

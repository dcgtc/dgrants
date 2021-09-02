<template>
  <!-- Transaction hash -->
  <div :class="[...rowClasses, 'border-t', 'border-b', 'border-grey-100']">
    <div class="mr-4 w-28">Hash:</div>
    <a :href="etherscanUrl" target="_blank" rel="noopener noreferrer" class="link text-grey-400">{{ hash }}</a>
  </div>
  <!-- Status -->
  <div :class="[...rowClasses, 'border-b', 'border-grey-100']">
    <div class="mr-4 w-28">Status:</div>
    <div v-if="status === 'pending'" class="text-grey-500">
      <span class="border-2 p-4 mr-8">Pending</span>
      Pending for {{ timeString }}
    </div>
    <div v-else-if="status === 'success'" class="text-grey-500">
      <span class="text-teal border-teal border-2 p-4 mr-8">Success</span>
      Confirmed in {{ timeString }}
    </div>
    <div v-else-if="status === 'failed'" class="text-grey-500">
      <span class="text-pink border-pink border-2 p-4 mr-8 px-8">Fail</span>
      Failed after {{ timeString }}
    </div>
  </div>
  <!-- Copy + button -->
  <div :class="[...rowClasses, 'justify-between']">
    <div v-if="status === 'pending'" class="text-grey-500">Your transaction is pending.</div>
    <div v-else-if="status === 'success'" class="text-grey-500">Transaction successful!</div>
    <div v-else-if="status === 'failed'" class="text-grey-500">
      Something went wrong. Please check the transaction and try again.
    </div>
    <button
      v-if="label"
      @click="action ? action() : () => ({})"
      class="btn"
      :class="{ disabled: status === 'pending' }"
      :disabled="status === 'pending'"
    >
      {{ label }}
    </button>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, onMounted, ref, SetupContext, watch } from 'vue';
import { getEtherscanUrl } from 'src/utils/utils';
import useWalletStore from 'src/store/wallet';

const emittedEventName = 'onReceipt'; // emitted once we receive the transaction receipt
const rowClasses = [
  // styles applied to all rows in the HTML template
  'flex',
  'justify-start',
  'items-center',
  'text-grey-400',
  'text-left',
  'py-10',
  'px-4',
  'sm:px-6',
  'lg:px-8',
];

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
      rowClasses,
      ...useTransactionStatus(props.hash, context),
    };
  },
});
</script>

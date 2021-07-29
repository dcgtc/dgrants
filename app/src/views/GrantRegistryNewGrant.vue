<template>
  <div class="flex flex-col justify-center sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img
        class="mx-auto h-12 w-auto"
        src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
        alt="Workflow"
      />
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Create New Grant</h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md text-left">
      <div class="py-8 px-4 border border-gray-200 shadow sm:rounded-lg sm:px-6 bg-gray-50">
        <form class="space-y-6" @submit.prevent="createGrant">
          <!-- Owner address -->
          <BaseInput
            v-model="form.owner"
            description="The owner has permission to edit the grant"
            id="owner-address"
            label="Owner address"
            :rules="isValidAddress"
            errorMsg="Please enter a valid address"
          />

          <!-- Payee address -->
          <BaseInput
            v-model="form.payee"
            description="The address contributions and matching funds are sent to"
            id="payee-address"
            label="Payee address"
            :rules="isValidAddress"
            errorMsg="Please enter a valid address"
          />

          <!-- Metadata pointer -->
          <BaseInput
            v-model="form.metaPtr"
            description="URL containing additional details about this grant"
            id="metadata-url"
            label="Metadata URL"
            :rules="isValidUrl"
            errorMsg="Please enter a valid URL"
          />

          <!-- Submit button -->
          <button
            type="submit"
            class="btn btn-primary w-full"
            :class="{ 'btn-primary-disabled': !isFormValid }"
            :disabled="!isFormValid"
          >
            Create Grant
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import BaseInput from 'src/components/BaseInput.vue';
// --- Store ---
import useDataStore from 'src/store/data';
import useWalletStore from 'src/store/wallet';
// --- Methods and Data ---
import { GRANT_REGISTRY_ADDRESS, GRANT_REGISTRY_ABI } from 'src/utils/constants';
import { Contract } from 'src/utils/ethers';
import { isValidAddress, isValidUrl, pushRoute } from 'src/utils/utils';
// --- Types ---
import { GrantRegistry } from '@dgrants/contracts';

function useNewGrant() {
  const { signer } = useWalletStore();
  const { poll } = useDataStore();

  // Define form fields and parameters
  const form = ref<{ owner: string; payee: string; metaPtr: string }>({
    owner: '',
    payee: '',
    metaPtr: '',
  });
  const isFormValid = computed(
    () => isValidAddress(form.value.owner) && isValidAddress(form.value.payee) && isValidUrl(form.value.metaPtr)
  );

  /**
   * @notice Creates a new grant, parses logs for the Grant ID, and navigates to that grant's page
   */
  async function createGrant() {
    // Send transaction
    const { owner, payee, metaPtr } = form.value;
    if (!signer.value) throw new Error('Please connect a wallet');
    const registry = <GrantRegistry>new Contract(GRANT_REGISTRY_ADDRESS, GRANT_REGISTRY_ABI, signer.value);
    const tx = await registry.createGrant(owner, payee, metaPtr);
    await tx.wait();

    // Parse receipt to find the grant ID
    const receipt = await signer.value.provider.getTransactionReceipt(tx.hash);
    const log = registry.interface.parseLog(receipt.logs[0]); // there is only one emitted event

    // Poll so the store has the latest data, then navigate to the grant page
    await poll();
    await pushRoute({ name: 'dgrants-id', params: { id: log.args.id.toString() } });
  }

  return { createGrant, isValidAddress, isValidUrl, isFormValid, form };
}

export default defineComponent({
  name: 'GrantRegistryNewGrant',
  components: { BaseInput },
  setup() {
    return { ...useNewGrant() };
  },
});
</script>

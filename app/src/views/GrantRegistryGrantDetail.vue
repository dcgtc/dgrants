<template>
  <!-- Grant details -->
  <div v-if="!isEditing && grant">
    <h1 class="my-6 text-center text-3xl font-extrabold text-gray-900">
      Details for Grant ID {{ grant.id.toString() }}
    </h1>
    <p>Owner: {{ grant.owner }}</p>
    <p>Payee: {{ grant.payee }}</p>
    <p>
      Metadata URL: <a class="link" :href="grant.metaPtr" target="_blank">{{ grant.metaPtr }}</a>
    </p>

    <button v-if="isOwner" @click="isEditing = true" class="mt-5 btn btn-primary">Edit Grant</button>
  </div>

  <!-- Editing grant -->
  <div v-else-if="grant" class="flex flex-col justify-center sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img
        class="mx-auto h-12 w-auto"
        src="https://tailwindui.com/img/logos/workflow-mark-indigo-600.svg"
        alt="Workflow"
      />
      <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">Edit Grant {{ grant.id.toString() }}</h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md text-left">
      <div class="py-8 px-4 border border-gray-200 shadow sm:rounded-lg sm:px-6 bg-gray-50">
        <form class="space-y-6" @submit.prevent="saveEdits">
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

          <!-- Submit and cancel buttons -->
          <button
            type="submit"
            class="btn btn-primary w-full"
            :class="{ 'btn-primary-disabled': !isFormValid }"
            :disabled="!isFormValid"
          >
            Save Edits
          </button>
          <button @click.prevent="cancelEdits" class="btn btn-outline w-full">Cancel</button>
        </form>
      </div>
    </div>
  </div>

  <!-- No grant selected -->
  <div v-else>
    <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">No grant selected</h2>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import BaseInput from 'src/components/BaseInput.vue';
// --- Store ---
import useDataStore from 'src/store/data';
import useWalletStore from 'src/store/wallet';
// --- Methods and Data ---
import { GRANT_REGISTRY_ADDRESS, GRANT_REGISTRY_ABI } from 'src/utils/constants';
import { Contract, ContractTransaction } from 'src/utils/ethers';
import { isValidAddress, isValidUrl } from 'src/utils/utils';
// --- Types ---
import { GrantRegistry } from '@dgrants/contracts';

function useGrantDetail() {
  const { grants, poll } = useDataStore();
  const { signer, userAddress } = useWalletStore();

  const route = useRoute();
  const grant = computed(() => {
    const id = route.params.id; // type `string | string[]`, so must narrow it down
    if (!grants.value || Array.isArray(id)) return null; // array type unsupported
    return grants.value[Number(id)];
  });

  // --- Edit capabilities ---
  const isOwner = computed(() => userAddress.value === grant.value?.owner);
  const isEditing = ref(false);
  const form = ref<{ owner: string; payee: string; metaPtr: string }>({
    owner: grant.value?.owner || '',
    payee: grant.value?.payee || '',
    metaPtr: grant.value?.metaPtr || '',
  });
  const isFormValid = computed(() => {
    if (!grant.value) return false;
    const { owner, payee, metaPtr } = form.value;
    const areFieldsValid = isValidAddress(owner) && isValidAddress(payee) && isValidUrl(metaPtr);
    const areFieldsUpdated = owner !== grant.value.owner || payee !== grant.value.payee || metaPtr !== grant.value.metaPtr; // prettier-ignore
    return areFieldsValid && areFieldsUpdated;
  });

  /**
   * @notice Resets the form values that user may have changed, and hides the edit window
   */
  function cancelEdits() {
    // Reset form values
    form.value.owner = grant.value?.owner || '';
    form.value.payee = grant.value?.payee || '';
    form.value.metaPtr = grant.value?.metaPtr || '';
    // Hide edit form
    isEditing.value = false;
  }

  /**
   * @notice Saves edits
   */
  async function saveEdits() {
    // Validation
    const { owner, payee, metaPtr } = form.value;
    if (!grant.value) throw new Error('No grant selected');
    if (!signer.value) throw new Error('Please connect a wallet');

    // Get registry instance
    const registry = <GrantRegistry>new Contract(GRANT_REGISTRY_ADDRESS, GRANT_REGISTRY_ABI, signer.value);

    // Determine which update method to call
    let tx: ContractTransaction;
    const g = grant.value; // for better readability in the if statements
    if (owner !== g.owner && payee === g.payee && metaPtr === g.metaPtr) {
      tx = await registry.updateGrantOwner(g.id, owner);
    } else if (owner === g.owner && payee !== g.payee && metaPtr === g.metaPtr) {
      tx = await registry.updateGrantPayee(g.id, payee);
    } else if (owner === g.owner && payee === g.payee && metaPtr !== g.metaPtr) {
      tx = await registry.updateGrantMetaPtr(g.id, metaPtr);
    } else {
      tx = await registry.updateGrant(g.id, owner, payee, metaPtr);
    }

    // After tx mines, poll so the store has the latest data, then navigate to the grant page
    await tx.wait();
    await poll();
    cancelEdits(); // reset form ref and toggle page state back to display mode
  }

  return { isEditing, isOwner, isValidAddress, isValidUrl, isFormValid, grant, form, cancelEdits, saveEdits };
}

export default defineComponent({
  name: 'GrantRegistryGrantDetail',
  components: { BaseInput },
  setup() {
    return { ...useGrantDetail() };
  },
});
</script>

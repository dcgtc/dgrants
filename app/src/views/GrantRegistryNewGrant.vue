<template>
  <div v-if="txHash">
    <BaseHeader name="Create Grant : Transaction Status" />
    <TransactionStatus
      :hash="txHash"
      buttonLabel="CONTINUE"
      :buttonAction="() => (grantId ? pushRoute({ name: 'dgrants-id', params: { id: grantId } }) : null)"
    />
  </div>

  <div v-else class="flex flex-col justify-center sm:px-6 lg:px-8 mb-40">
    <BaseHeader name="Setup Grant" />
    <div class="text-left">
      <form class="space-y-5" @submit.prevent="createGrant">
        <!-- Grant name -->
        <BaseInput
          v-model="form.name"
          placeholder="Fusion – Icon Pack for Cryptonauts"
          id="grant-name"
          label="Title"
          :rules="isDefined"
          errorMsg="Please enter a name"
        />

        <!-- Owner address -->
        <BaseInput
          v-model="form.owner"
          placeholder="0xBADCdDEA250f1e317Ba59999232464933C4E8D90"
          description="has permission to edit the grant"
          id="owner-address"
          label="Owner address"
          :rules="isValidAddress"
          errorMsg="Please enter a valid address"
        />

        <!-- Payee address -->
        <BaseInput
          v-model="form.payee"
          placeholder="0xBADCdDEA250f1e317Ba59999232464933C4E8D90"
          description="contributions and matching funds are sent to"
          id="payee-address"
          label="Payee address"
          :rules="isValidAddress"
          errorMsg="Please enter a valid address"
        />

        <!-- Grant Description -->
        <BaseTextarea
          v-model="form.description"
          :placeholder="LOREM_IPSOM_TEXT"
          id="grant-description"
          label="Grant description"
          :required="true"
          :rules="isDefined"
          errorMsg="Please enter a description"
        />

         <!-- Grant website -->
        <BaseInput
          v-model="form.website"
          description="Your grant's website"
          id="grant-website"
          label="Grant website"
          :rules="isValidUrl"
          errorMsg="Please enter a valid URL"
          :required="false"
        />

        <!-- Grant github -->
        <BaseInput
          v-model="form.github"
          description="Your grant's github"
          id="grant-github"
          label="Grant github"
          :rules="isValidGithubUrl"
          errorMsg="Please enter a valid Github URL"
          :required="false"
        />

        <!-- Grant twitter handle -->
        <BaseInput
          v-model="form.twitter"
          description="Your grant's twitter handle"
          id="grant-handle"
          label="Grant twitter"
          :rules="isValidTwitter"
          errorMsg="Please enter a valid Twitter handle"
          :required="false"
        />

        <!-- Submit button -->
        <button
          type="submit"
          class="btn btn-primary float-right"
          :class="{ disabled: !isFormValid }"
          :disabled="!isFormValid"
        >
          Create Grant
        </button>

        <p v-if="!isFormValid" class="text-center text-grey-400">* Please fill in all required fields</p>
      </form>
    </div>
  </div>
</template>

<script lang="ts">
// --- External Imports ---
import { computed, defineComponent, ref } from 'vue';
// --- Component Imports ---
import BaseHeader from 'src/components/BaseHeader.vue';
import BaseInput from 'src/components/BaseInput.vue';
import BaseTextarea from 'src/components/BaseTextarea.vue';
import TransactionStatus from 'src/components/TransactionStatus.vue';
// --- Store ---
import useDataStore from 'src/store/data';
import useWalletStore from 'src/store/wallet';
// --- Methods and Data ---
import { GRANT_REGISTRY_ADDRESS, GRANT_REGISTRY_ABI, LOREM_IPSOM_TEXT } from 'src/utils/constants';
import { Contract } from 'src/utils/ethers';
import {
  isValidAddress,
  isValidUrl,
  isValidGithubUrl,
  isValidTwitter,
  isDefined,
  pushRoute,
  urlFromTwitterHandle,
} from 'src/utils/utils';
import * as ipfs from 'src/utils/ipfs';
// --- Types ---
import { GrantRegistry } from '@dgrants/contracts';

function useNewGrant() {
  const { signer } = useWalletStore();
  const { poll } = useDataStore();

  const txHash = ref<string>();
  const grantId = ref<string>();

  // Define form fields and parameters
  const form = ref<{
    owner: string;
    payee: string;
    name: string;
    description: string;
    website: string;
    github: string;
    twitter: string;
  }>({
    owner: '',
    payee: '',
    name: '',
    description: '',
    website: '',
    github: '',
    twitter: '',
  });
  const isFormValid = computed(
    () =>
      isValidAddress(form.value.owner) &&
      isValidAddress(form.value.payee) &&
      isDefined(form.value.name) &&
      isDefined(form.value.description)
  );

  /**
   * @notice Creates a new grant, parses logs for the Grant ID, and navigates to that grant's page
   */
  async function createGrant() {
    // Send transaction
    const { owner, payee, name, description, website, github, twitter } = form.value;
    const twitterURI = twitter === '' ? twitter : urlFromTwitterHandle(twitter);
    const properties = { websiteURI: website, githubURI: github, twitterURI };
    if (!signer.value) throw new Error('Please connect a wallet');
    const metaPtr = await ipfs
      .uploadGrantMetadata({ name, description, properties })
      .then((cid) => ipfs.getMetaPtr({ cid: cid.toString() }));
    const registry = <GrantRegistry>new Contract(GRANT_REGISTRY_ADDRESS, GRANT_REGISTRY_ABI, signer.value);

    const tx = await registry.createGrant(owner, payee, metaPtr);
    txHash.value = tx.hash;
    // TODO: show waiting state screen
    await tx.wait();

    // Parse receipt to find the grant ID
    const receipt = await signer.value.provider.getTransactionReceipt(tx.hash);
    const log = registry.interface.parseLog(receipt.logs[0]); // there is only one emitted event

    grantId.value = log.args.id;
    // Poll so the store has the latest data, then navigate to the grant page
    await poll();
  }

  return {
    createGrant,
    isValidAddress,
    isValidUrl,
    isValidGithubUrl,
    isValidTwitter,
    isFormValid,
    isDefined,
    form,
    LOREM_IPSOM_TEXT,
    txHash,
    grantId,
    pushRoute,
  };
}

export default defineComponent({
  name: 'GrantRegistryNewGrant',
  components: { BaseInput, BaseTextarea, TransactionStatus, BaseHeader },
  setup() {
    return { ...useNewGrant() };
  },
});
</script>

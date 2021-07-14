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
      <div class="py-8 px-4 border shadow sm:rounded-lg sm:px-6">
        <form class="space-y-6" action="#" method="POST">
          <!-- Owner address -->
          <BaseInput
            v-model="owner"
            description="The owner has permission to edit the grant"
            id="owner-address"
            label="Owner address"
            errorMsg="Please enter a valid address"
          />

          <!-- Payee address -->
          <BaseInput
            v-model="payee"
            description="The address contributions and matching funds are sent to"
            id="payee-address"
            label="Payee address"
            errorMsg="Please enter a valid address"
          />

          <!-- Metadata pointer -->
          <BaseInput
            v-model="metaPtr"
            description="URL containing additional details about this grant"
            id="metadata-url"
            label="Metadata URL"
            errorMsg="Please enter a valid URL"
          />

          <!-- Submit button -->
          <button type="submit" class="btn btn-primary w-full">Create Grant</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import BaseInput from 'src/components/BaseInput.vue';

export default defineComponent({
  name: 'GrantRegistryNewGrant',
  components: { BaseInput },
  setup() {
    const isOwnerValid = ref(false);
    const owner = ref();
    const payee = ref();
    const metaPtr = ref();
    return { isOwnerValid, owner, payee, metaPtr };
  },
});
</script>

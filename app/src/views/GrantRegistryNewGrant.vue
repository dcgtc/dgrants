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
          <div>
            <label for="owner" class="block text-sm font-medium text-gray-700"> Owner address </label>
            <p class="text-gray-500 text-sm">The owner has permission to edit the grant</p>
            <div class="mt-1">
              <input id="owner" name="owner" type="owner" required class="input" />
            </div>
          </div>

          <div>
            <label for="payee" class="block text-sm font-medium text-gray-700"> Payee address </label>
            <p class="text-gray-500 text-sm">The address contributions and matching funds are sent to</p>
            <div class="mt-1">
              <input id="payee" name="payee" type="payee" required class="input" />
            </div>
          </div>

          <div>
            <label for="metadataUrl" class="block text-sm font-medium text-gray-700"> Metadata URL </label>
            <p class="text-gray-500 text-sm">URL containing additional details about this grant</p>
            <div class="mt-1">
              <input id="metadataUrl" name="metadataUrl" type="metadataUrl" required class="input" />
            </div>
          </div>

          <div>
            <button type="submit" class="btn btn-primary w-full">Create Grant</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'GrantRegistryNewGrant',
});
</script>

<template>
  <h1 class="text-lg mb-3">Grant Registry List</h1>
  <ul class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    <li v-for="grant in grants" :key="grant.id" class="col-span-1 bg-white rounded-lg shadow divide-y divide-gray-200">
      <div class="w-full flex items-center justify-between p-6 space-x-6">
        <div class="flex-1 truncate text-left">
          <div class="flex items-center space-x-3">
            <h3 class="text-gray-900 text-sm font-medium truncate">Grant ID: {{ grant.id.toString() }}</h3>
          </div>
          <p class="mt-1 text-gray-500 text-sm truncate">{{ grant.metaPtr }}</p>
        </div>
      </div>
      <div>
        <div class="pl-6 p-2 -mt-px flex divide-x divide-gray-200">
          <div class="w-0 flex-1 flex">
            <div class="flex-1 truncate text-left">
              <p class="mt-1 text-gray-500 text-sm truncate">Owner</p>
              <div class="flex items-center space-x-3">
                <h3 class="text-gray-900 text-sm font-medium">{{ formatAddress(grant.owner) }}</h3>
              </div>
            </div>
          </div>
          <div class="pl-6 -ml-px w-0 flex-1 flex">
            <div class="w-0 flex-1 flex">
              <div class="flex-1 truncate text-left">
                <p class="mt-1 text-gray-500 text-sm truncate">Payee</p>
                <div class="flex items-center space-x-3">
                  <h3 class="text-gray-900 text-sm font-medium">{{ formatAddress(grant.payee) }}</h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </li>
  </ul>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { formatAddress } from 'src/utils/formatters';
import useDataStore from 'src/store/data';

export default defineComponent({
  name: 'GrantRegistryList',
  setup() {
    const { grants } = useDataStore();
    return { formatAddress, grants };
  },
});
</script>

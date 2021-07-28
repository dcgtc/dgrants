<template>
  <div class="max-w-screen-lg mx-auto">
    <!-- View Existing GrantRounds -->
    <h1 class="my-6 text-center text-3xl font-extrabold text-gray-900">Grant Round List</h1>
    <div class="mb-10">Below is all grant rounds read from the GrantRoundFactory contract</div>

    <div v-for="list in grantRoundLists" :key="list.title">
      <h2 class="text-left my-5">{{ list.title }}</h2>
      <ul v-if="list.rounds.length > 0" class="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-10">
        <li
          v-for="(grantRound, index) in list.rounds"
          :key="index"
          @click="pushRoute({ name: 'dgrants-round-details', params: { address: grantRound.address } })"
          class="
            col-span-1
            bg-white
            rounded-lg
            shadow
            divide-y divide-gray-400 divide-opacity-30
            cursor-pointer
            border border-gray-200
            hover:border-primary-500
          "
        >
          <div class="w-full flex items-center justify-between p-6 space-x-6 hover:border">
            <div class="flex-1 truncate text-left">
              <div class="flex items-center space-x-3">
                <h3 class="text-gray-900 text-sm font-medium truncate">
                  Grant Round funds: {{ grantRound.funds.toString() }}
                  <span :title="grantRound.donationTokenName">{{ grantRound.donationTokenSymbol }}</span>
                </h3>
              </div>
              <p class="mt-1 text-gray-500 text-sm truncate">{{ grantRound.metaPtr }}</p>
            </div>
          </div>
          <div>
            <div class="pl-6 p-2 -mt-px flex divide-x divide-gray-400 divide-opacity-30">
              <div class="w-0 flex-1 flex">
                <div class="flex-1 truncate text-left">
                  <p class="mt-1 text-gray-500 text-sm truncate">Round Address</p>
                  <div class="flex items-center space-x-3">
                    <h3 class="text-gray-900 text-sm font-medium" :title="grantRound.address">
                      {{ formatAddress(grantRound.address) }}
                    </h3>
                  </div>
                </div>
              </div>
              <div class="pl-6 -ml-px w-0 flex-1 flex">
                <div class="w-0 flex-1 flex">
                  <div class="flex-1 truncate text-left">
                    <p class="mt-1 text-gray-500 text-sm truncate">
                      Round {{ hasStatus('Upcoming')(grantRound) ? 'will start' : 'started' }}
                    </p>
                    <div class="flex items-center space-x-3">
                      <h3 class="text-gray-900 text-sm font-medium" :title="unixToLocaleString(grantRound.startTime)">
                        {{ daysAgo(grantRound.startTime.toNumber()) }}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
              <div class="pl-6 -ml-px w-0 flex-1 flex">
                <div class="w-0 flex-1 flex">
                  <div class="flex-1 truncate text-left">
                    <p class="mt-1 text-gray-500 text-sm truncate">
                      Round {{ hasStatus('Completed')(grantRound) ? 'ended' : 'will end' }}
                    </p>
                    <div class="flex items-center space-x-3">
                      <h3 class="text-gray-900 text-sm font-medium" :title="unixToLocaleString(grantRound.endTime)">
                        {{ daysAgo(grantRound.endTime.toNumber()) }}
                      </h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </li>
      </ul>
      <div v-else>
        <span>No {{ list.title }} Grant Rounds</span>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent } from 'vue';
import { daysAgo, formatAddress, pushRoute, unixToLocaleString } from 'src/utils/utils';
import useDataStore from 'src/store/data';
import { GrantRound } from '@dgrants/types';
import { BigNumber } from 'ethers';

// check if the grantRound has the given status
const hasStatus = (status: string) => (round: GrantRound) => round.status == status;

// sort by startDate
const sortByStartTime = (a: GrantRound, b: GrantRound) =>
  BigNumber.from(a.startTime).toNumber() < BigNumber.from(b.startTime).toNumber()
    ? -1
    : BigNumber.from(a.startTime).toNumber() == BigNumber.from(b.startTime).toNumber()
    ? 0
    : 1;

export default defineComponent({
  name: 'GrantRoundsList',
  setup() {
    // Pull the grantRounds (to populate grantRoundLists)
    const { grantRounds } = useDataStore();
    // pivot the grandRounds data into separate lists
    const grantRoundLists = computed(() => [
      {
        title: 'Active',
        rounds: grantRounds.value ? grantRounds.value.filter(hasStatus('Active')).sort(sortByStartTime) : [],
      },
      {
        title: 'Upcoming',
        rounds: grantRounds.value ? grantRounds.value.filter(hasStatus('Upcoming')).sort(sortByStartTime) : [],
      },
      {
        title: 'Completed',
        rounds: grantRounds.value ? grantRounds.value.filter(hasStatus('Completed')).sort(sortByStartTime) : [],
      },
    ]);

    return { daysAgo, formatAddress, grantRoundLists, hasStatus, pushRoute, unixToLocaleString };
  },
});
</script>

<template>
  <div v-if="Object.keys(grantRoundMetadata).length">
    <!-- Simple breadcrumb pointing back to the landing -->
    <BaseHeader :breadcrumbContent="breadcrumb" name="Matching Rounds" />

    <!-- Status filters -->
    <BaseFilterNav :active="selectedTab" :items="grantRoundsNav" />
    <div class="max-w-screen-lg mx-auto">
      <!-- Status filtered Cards -->
      <template v-if="grantRoundLists[selectedTab] && grantRoundLists[selectedTab]?.rounds?.length">
        <ul class="text-left grid grid-cols-1 gap-10 py-12 px-4 md:px-12 md:grid-cols-2">
          <li v-for="(grantRound, index) in grantRoundLists[selectedTab].rounds" :key="grantRound.address">
            <GrantRoundCard
              :id="index"
              :ptr="grantRound.metaPtr"
              :address="grantRound.address"
              :name="grantRoundMetadata[grantRound.metaPtr].name ?? ''"
              :imgurl="grantRoundMetadata[grantRound.metaPtr].logoURI ?? '/placeholder_round.svg'"
              :grantsTotal="grantRoundMetadata[grantRound.metaPtr].grants?.length ?? 0"
              :funds="`${formatNumber(grantRound.funds, 2)} ${grantRound.matchingToken.symbol}`"
            />
          </li>
        </ul>
      </template>
      <!-- Empty state -->
      <template v-else>
        <div class="my-10 mx-4">
          <span>No {{ grantRoundLists[selectedTab].title }} Grant Rounds</span>
        </div>
      </template>
    </div>
  </div>

  <LoadingSpinner v-else />
</template>

<script lang="ts">
// --- Types ---
import { Breadcrumb, FilterNavItem, GrantRound } from '@dgrants/types';
// --- Utils ---
import { computed, defineComponent, ref } from 'vue';
import { BigNumber } from 'ethers';
import { daysAgo, formatAddress, formatNumber, pushRoute, unixToLocaleString, hasStatus } from 'src/utils/utils';
// --- Data and Methods ---
import useDataStore from 'src/store/data';
// --- Components ---
import BaseHeader from 'src/components/BaseHeader.vue';
import BaseFilterNav from 'src/components/BaseFilterNav.vue';
import GrantRoundCard from 'src/components/GrantRoundCard.vue';
import LoadingSpinner from 'src/components/LoadingSpinner.vue';

// sort by startTime
const sortByStartTime = (a: GrantRound, b: GrantRound) =>
  BigNumber.from(a.startTime).toNumber() < BigNumber.from(b.startTime).toNumber()
    ? -1
    : BigNumber.from(a.startTime).toNumber() === BigNumber.from(b.startTime).toNumber()
    ? 0
    : 1;

export default defineComponent({
  name: 'GrantRoundsList',
  components: {
    BaseHeader,
    BaseFilterNav,
    GrantRoundCard,
    LoadingSpinner,
  },
  setup() {
    const { grantRounds: _grantRounds, grantRoundMetadata: _grantRoundMetadata } = useDataStore();

    // --- Data sources ---
    const grantRounds = computed(() => _grantRounds.value);
    const grantRoundMetadata = computed(() => _grantRoundMetadata.value);

    // --- BaseHeader Navigation ---
    const breadcrumb = computed(
      () =>
        <Breadcrumb[]>[
          {
            displayName: 'dgrants',
            routeTarget: { name: 'Home' },
          },
          {
            displayName: 'rounds',
            routeTarget: { name: 'dgrants-rounds-list' },
          },
        ]
    );

    // --- GrantRound Filter nav ---
    const selectedTab = ref<number>(0);
    // status tabs
    const statusTab = ['Active', 'Upcoming', 'Complete'];
    // filter and sort each of the status tabs
    const filteredLists = statusTab.map((status) =>
      computed(() => {
        return grantRounds.value ? grantRounds.value.filter(hasStatus(status)).sort(sortByStartTime) : [];
      })
    );
    const grantRoundsNav = computed(
      () => <FilterNavItem[]>statusTab.map((status, index) => {
          return {
            label: status,
            counter: filteredLists[index].value.length,
            action: () => {
              selectedTab.value = index;
            },
          };
        })
    );

    // --- GrantRoundCard data ---
    const grantRoundLists = computed(() =>
      statusTab.map((status, index) => {
        return {
          title: status,
          rounds: filteredLists[index].value,
        };
      })
    );

    return {
      BigNumber,
      breadcrumb,
      daysAgo,
      formatAddress,
      formatNumber,
      grantRoundLists,
      grantRoundMetadata,
      grantRoundsNav,
      hasStatus,
      pushRoute,
      selectedTab,
      unixToLocaleString,
    };
  },
});
</script>

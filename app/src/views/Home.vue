<template>
  <div v-if="Object.keys(grantRoundMetadata).length">
    <!-- Simple breadcrumb pointing back to the landing -->
    <BaseHeader :breadcrumbContent="breadcrumb" name="Decentral Grants Explorer" />

    <!-- Status filters -->
    <BaseFilterNav :active="selectedTab" :items="grantRoundsNav" />
    <div>
      <!-- Status filtered Cards -->
      <template v-if="grantRoundLists[selectedTab] && grantRoundLists[selectedTab]?.rounds?.length">
        <ul class="base-grid">
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
        <div class="px-4 md:px-12 mt-8">
          <span>No {{ grantRoundLists[selectedTab].title }} Grant Rounds</span>
        </div>
      </template>
    </div>
  </div>

  <LoadingSpinner v-else />

  <template v-if="grants && grantMetadata">
    <!-- General filters -->
    <BaseFilterNav :items="grantRegistryListNav" :button="filterNavButton" />
    <GrantList :grants="grants" :grantMetadata="grantMetadata" />
  </template>

  <LoadingSpinner v-else />
</template>

<script lang="ts">
// --- Types ---
import { Breadcrumb, FilterNavItem, FilterNavButton, GrantRound } from '@dgrants/types';
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
import GrantList from 'src/components/GrantList.vue';
import LoadingSpinner from 'src/components/LoadingSpinner.vue';

// sort by startTime
const sortByStartTime = (a: GrantRound, b: GrantRound) =>
  BigNumber.from(a.startTime).toNumber() < BigNumber.from(b.startTime).toNumber()
    ? -1
    : BigNumber.from(a.startTime).toNumber() === BigNumber.from(b.startTime).toNumber()
    ? 0
    : 1;

function useGrantRegistryList() {
  // --- Grants filters ---
  // TODO add info to show the right filters
  const grantRegistryListNav = <FilterNavItem[]>[
    {
      label: 'Sort',
      tag: 'newest',
      menu: [
        // TODO implement the behaviours here when grants have a date
        {
          label: 'newest',
          action: () => {
            console.log('newest');
          },
        },
        {
          label: 'oldest',
          action: () => {
            console.log('oldest');
          },
        },
        {
          label: 'shuffle',
          action: () => {
            console.log('shuffle');
          },
        },
      ],
    },
  ];

  const filterNavButton = <FilterNavButton>{
    label: 'create grant',
    action: () => pushRoute({ name: 'dgrants-new' }),
  };

  return {
    filterNavButton,
    grantRegistryListNav,
  };
}

export default defineComponent({
  name: 'Home',
  components: {
    BaseHeader,
    BaseFilterNav,
    GrantRoundCard,
    GrantList,
    LoadingSpinner,
  },
  setup() {
    const {
      grantRounds: _grantRounds,
      grantRoundMetadata: _grantRoundMetadata,
      grants,
      grantMetadata,
    } = useDataStore();

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
      grants,
      grantMetadata,
      ...useGrantRegistryList(),
    };
  },
});
</script>

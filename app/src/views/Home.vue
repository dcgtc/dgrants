<template>
  <div v-if="grantRoundMetadata && grantRounds && Object.keys(grantRoundMetadata).length == grantRounds.length">
    <!--------------- INTRO --------------->
    <section class="px-4 md:px-12 py-20 border-b border-grey-100 text-center">
      <h1>Decentralized Grants</h1>

      <!-- description -->
      <p class="italic mt-8 mx-auto max-w-4xl text-grey-400">
        Facilitating open source developers creating grants to collect contributions in a decentralized way. Read more
        about <router-link to="/dgrants" class="link">Grants</router-link> and
        <router-link to="/dgrants/rounds" class="link">Rounds</router-link> in the
        <a
          href="https://github.com/dcgtc/dgrants/wiki/dGrants-FAQ"
          target="_blank"
          rel="noreferrer noopener"
          class="link"
          >FAQ</a
        >
      </p>

      <!-- create grant -->
      <div class="flex mt-8 justify-center">
        <router-link :to="{ name: 'dgrants-new' }">
          <button class="btn">create grant</button>
        </router-link>
      </div>

      <!-- stats -->
      <div class="flex flex-wrap gap-y-4 gap-x-12 justify-center mt-12">
        <!-- rounds -->
        <div>
          <div class="text-grey-400 uppercase">rounds</div>
          <h1>{{ grantRounds?.length }}</h1>
        </div>

        <template v-if="validGrantsCount && validGrantsCount > 0">
          <!--seperator-->
          <div class="hidden md:block bg-grey-100 w-px"></div>
          <!-- grants -->
          <div>
            <div class="text-grey-400 uppercase">grants</div>
            <h1>{{ validGrantsCount }}</h1>
          </div>
        </template>

        <!--seperator-->
        <div class="hidden md:block bg-grey-100 w-px"></div>

        <!-- contributions -->
        <div>
          <div class="text-grey-400 uppercase">contributions</div>
          <h1>{{ grantContributions?.length }}</h1>
        </div>
      </div>
    </section>

    <!--------------- ROUNDS INTRO --------------->
    <section class="px-4 md:px-12 pt-8">
      <h1>Rounds</h1>
      <p class="italic text-grey-400">
        Grant Rounds are collections of Grants which receive matching from a pool.
        <a
          href="https://github.com/dcgtc/dgrants/wiki/dGrants-FAQ#q-what-is-a-grant-round"
          target="_blank"
          rel="noreferrer noopener"
          class="link"
          >Learn more</a
        >
      </p>
    </section>

    <!-- Status filters -->
    <BaseFilterNav :active="selectedTab" :items="grantRoundsNav" />
    <div>
      <!-- Status filtered Cards -->
      <template v-if="grantRoundLists[selectedTab] && grantRoundLists[selectedTab]?.rounds?.length">
        <section class="border-b border-grey-100">
          <ul class="base-grid-big">
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

          <!-- Link to see all rounds  -->

          <div class="px-4 md:px-12 py-8">
            <div class="flex flex-wrap gap-x-6 gap-y-4">
              <router-link to="/dgrants/rounds" class="ml-auto">
                <div class="flex items-center gap-x-2 cursor-pointer group">
                  <ArrowRightIcon class="icon icon-primary icon-small" />
                  <span class="text-grey-400 group-hover:text-grey-500">All Rounds</span>
                </div>
              </router-link>
            </div>
          </div>
        </section>
      </template>

      <!-- Empty state -->
      <template v-else>
        <div class="px-4 md:px-12 py-4 md:py-12 border-b border-grey-100 text-grey-400">
          <div class="mb-8">
            <span>No {{ grantRoundLists[selectedTab].title }} Grant Rounds</span>
          </div>
        </div>
      </template>
    </div>
  </div>

  <LoadingSpinner v-else />

  <!--------------- GRANTS INTRO --------------->
  <section class="px-4 md:px-12 pt-8">
    <h1>Grants</h1>
    <p class="italic text-grey-400">
      Grants are a facility for projects to receive donations to their cause.
      <a
        href="https://github.com/dcgtc/dgrants/wiki/dGrants-FAQ#q-what-is-a-grant"
        target="_blank"
        rel="noreferrer noopener"
        class="link"
        >Learn more</a
      >
    </p>
  </section>

  <GrantList v-if="grants && grantMetadata" :button="filterNavButton" :grants="grants" :grantMetadata="grantMetadata" />

  <!-- Link to see all grants  -->

  <div class="px-4 md:px-12 py-8">
    <div class="flex flex-wrap gap-x-6 gap-y-4">
      <router-link to="/dgrants" class="ml-auto">
        <div class="flex items-center gap-x-2 cursor-pointer group">
          <ArrowRightIcon class="icon icon-primary icon-small" />
          <span class="text-grey-400 group-hover:text-grey-500">All Grants</span>
        </div>
      </router-link>
    </div>
  </div>
</template>

<script lang="ts">
// --- Types ---
import { Breadcrumb, FilterNavItem, FilterNavButton } from '@dgrants/types';
// --- Utils ---
import { computed, defineComponent, ref, watch } from 'vue';
import { BigNumber } from 'ethers';
import {
  daysAgo,
  formatAddress,
  formatNumber,
  pushRoute,
  unixToLocaleString,
  hasStatus,
  sortByStartTime,
} from 'src/utils/utils';
// --- Data ---
import useDataStore from 'src/store/data';
import { DGRANTS_CHAIN_ID } from 'src/utils/chains';
// --- Components ---
import BaseFilterNav from 'src/components/BaseFilterNav.vue';
import GrantRoundCard from 'src/components/GrantRoundCard.vue';
import GrantList from 'src/components/GrantList.vue';
import LoadingSpinner from 'src/components/LoadingSpinner.vue';
import { ArrowRightIcon } from '@fusion-icons/vue/interface';

const validGrantsCount = ref<number>(0);

function useGrantRegistryList() {
  const filterNavButton = <FilterNavButton>{
    label: 'create grant',
    action: () => pushRoute({ name: 'dgrants-new' }),
  };

  return {
    filterNavButton,
  };
}

export default defineComponent({
  name: 'Home',
  components: {
    BaseFilterNav,
    GrantRoundCard,
    GrantList,
    LoadingSpinner,
    ArrowRightIcon,
  },

  setup() {
    watch(
      () => [],
      async () => {
        const uniqueStr = '?unique=' + Date.now();
        const whitelistUrl = import.meta.env.VITE_GRANT_WHITELIST_URI;
        if (whitelistUrl) {
          const url = whitelistUrl + uniqueStr;
          const json = await fetch(url).then((res) => res.json());
          validGrantsCount.value = json[DGRANTS_CHAIN_ID]?.length;
        }
      },
      { immediate: true }
    );

    const {
      grants: _grants,
      grantMetadata: _grantMetadata,
      grantRounds: _grantRounds,
      grantRoundMetadata: _grantRoundMetadata,
      grantContributions: _grantContributions,
    } = useDataStore();

    // --- Data sources ---
    const grants = computed(() => _grants?.value?.slice(0, 8));
    const grantMetadata = computed(() => _grantMetadata.value);
    const grantRounds = computed(() => _grantRounds.value);
    const grantRoundMetadata = computed(() => _grantRoundMetadata.value);
    const grantContributions = computed(() => _grantContributions.value);

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
      grantRounds,
      grantRoundLists,
      grantRoundMetadata,
      grantRoundsNav,
      hasStatus,
      pushRoute,
      selectedTab,
      unixToLocaleString,
      grants,
      grantContributions,
      grantMetadata,
      validGrantsCount,
      ...useGrantRegistryList(),
    };
  },
});
</script>

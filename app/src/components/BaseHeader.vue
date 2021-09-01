<template>
  <header class="px-4 md:px-12 py-20 border-b border-grey-100 text-center relative">
    <!-- optional breadcrumb within a header -->
    <Breadcrumb v-if="breadcrumbContent" :path="breadcrumbContent" />

    <h1>{{ name }}</h1>

    <!-- optional subline -->
    <h1 v-if="tagline">“{{ tagline }}”</h1>

    <!--optional by address last seen / last  updated  -->
    <div v-if="formattedOwner">
      <span class="text-grey-400 mr-4">by</span>
      <a class="link mr-4" :href="`https://etherscan.io/address/${owner}`" target="_blank" rel="noopener noreferrer">{{
        formattedOwner
      }}</a>
      <span v-if="formattedLastUpdated" class="italic text-grey-400">{{ formattedLastUpdated }}</span>
    </div>

    <!-- optional quote -->
    <p v-if="quote" class="intent italic mt-8 mx-auto max-w-6xl">“{{ quote }}”</p>

    <span>
      <!-- optional navigation to jump to next item in a list -->
      <router-link
        v-if="nextPath"
        :class="['group', 'inline', 'p-6', 'absolute', 'right-0']"
        style="top: 50%; transform: translateY(-50%)"
        :to="nextPath"
      >
        <ArrowRightIcon :class="['icon', 'icon-primary']" />
      </router-link>
      <router-link
        v-if="lastPath"
        :class="['group', 'inline', 'p-6', 'absolute', 'left-0']"
        style="top: 50%; transform: translateY(-50%)"
        :to="lastPath"
      >
        <ArrowLeftIcon :class="['icon', 'icon-primary']" />
      </router-link>
    </span>
  </header>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
// --- Types ---
import { RouteTarget, Breadcrumb as BreadcrumbType } from '@dgrants/types';
// --- Components ---
import Breadcrumb from 'src/components/Breadcrumb.vue';
// --- Icons ---
import { ArrowLeft4Icon as ArrowLeftIcon } from '@fusion-icons/vue/interface';
import { ArrowRight4Icon as ArrowRightIcon } from '@fusion-icons/vue/interface';
import { daysAgo, formatAddress } from 'src/utils/utils';

export default defineComponent({
  name: 'BaseHeader',
  props: {
    breadcrumbContent: { type: Array as PropType<BreadcrumbType[]>, required: false, default: undefined },
    name: { type: String, required: true, default: undefined },
    tagline: { type: String, required: false, default: undefined },
    owner: { type: String, required: false, default: undefined },
    lastUpdated: { type: String, required: false, default: undefined },
    quote: { type: String, required: false, default: undefined },
    nextPath: { type: Object as PropType<RouteTarget>, required: false, default: undefined },
    lastPath: { type: Object as PropType<RouteTarget>, required: false, default: undefined },
  },
  components: { ArrowLeftIcon, ArrowRightIcon, Breadcrumb },
  setup(props) {
    const formattedOwner = computed(() => (props.owner ? formatAddress(props.owner) : false));
    const formattedLastUpdated = computed(() =>
      props.lastUpdated ? daysAgo(new Date(props.lastUpdated).getTime() / 1000) : false
    );

    return { formattedOwner, formattedLastUpdated };
  },
});
</script>

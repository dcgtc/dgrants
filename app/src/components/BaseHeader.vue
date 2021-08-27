<template>
  <header class="px-4 md:px-12 py-20 border-b border-grey-100 text-center relative">
    <!-- optional breadcrumb within a header -->
    <Breadcrumb v-if="breadcrumbContent" :path="breadcrumbContent" />

    <h1>{{ name }}</h1>

    <!-- optional subline -->
    <h1 v-if="tagline">“{{ tagline }}”</h1>

    <!--optional by address last seen / last  updated " "byWhen"  -->
    <div v-if="by">
      <span class="text-grey-400 mr-4">by</span>
      <a class="mr-4">{{ by }}</a>
      <span v-if="byWhen" class="italic text-grey-400">{{ byWhen }}</span>
    </div>

    <!-- optional quote -->
    <p v-if="quote" class="intent italic mt-8 mx-auto max-w-6xl">“{{ quote }}”</p>

    <span>
      <!-- optional navigation to jump to next item in a list -->
      <router-link
        :class="['group', 'inline', 'p-6', 'absolute', 'right-0', !nextPath ? 'cursor-default' : '']"
        style="top: 50%; transform: translateY(-50%)"
        :to="nextPath"
      >
        <ArrowRightIcon :class="['icon', nextPath ? 'icon-primary' : 'icon-disabled']" />
      </router-link>
      <router-link
        :class="['group', 'inline', 'p-6', 'absolute', 'left-0', !lastPath ? 'cursor-default' : '']"
        style="top: 50%; transform: translateY(-50%)"
        :to="lastPath"
      >
        <ArrowLeftIcon :class="['icon', lastPath ? 'icon-primary' : 'icon-disabled']" />
      </router-link>
    </span>
  </header>
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
// types
import { Breadcrumb as BreadcrumbType } from '@dgrants/types';
// components
import Breadcrumb from 'src/components/Breadcrumb.vue';
// icons
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
    nextPath: { type: String, required: false, default: undefined },
    lastPath: { type: String, required: false, default: undefined },
  },
  components: { ArrowLeftIcon, ArrowRightIcon, Breadcrumb },
  setup(props) {
    const by = computed(() => (props.owner ? formatAddress(props.owner) : false));
    const byWhen = computed(() => (props.lastUpdated ? daysAgo(new Date(props.lastUpdated).getTime() / 1000) : false));

    return { by, byWhen };
  },
});
</script>

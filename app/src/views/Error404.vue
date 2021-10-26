<template>
  <section class="px-4 md:px-12 py-4 md:py-12">
    <div class="grid justify-center text-center">
      <h1 class="text-grey-500">404</h1>
      <h1>This page is lost.</h1>
      <p class="mt-4 italic text-grey-400 mx-auto max-w-6xl">
        We’ve explored far and wide, but we can’t find the page you were looking for.
      </p>

      <!-- button row container -->
      <div class="mt-12 flex flex-wrap gap-8 justify-center">
        <!--back button-->
        <button @click="routerGo(-1)" class="btn">
          <BackIcon class="icon-small" />
          <span>Back</span>
        </button>

        <!--home button-->
        <button @click="routerPush('/')" class="btn">
          <HomeIcon class="icon-small" />
          <span>Home</span>
        </button>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';
import { HomeIcon, ArrowLeftIcon as BackIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'Error404',
  setup() {
    const router = useRouter();
    /* eslint-disable @typescript-eslint/unbound-method */
    return { routerPush: router.push, routerGo: router.go };
    /* eslint-enable @typescript-eslint/unbound-method */
  },
  components: { HomeIcon, BackIcon },
});
</script>

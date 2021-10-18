<template>
  <section class="px-4 md:px-12 py-4 md:py-12">
    <div class="grid justify-center text-center">
      <h1 class="text-grey-500">Thank you for contributing!</h1>
      <div class="mt-8 flex gap-4 justify-center">
        <button @click="routerGo(-1)" class="btn">Back</button>
        <button @click="routerPush('/')" class="btn">Home</button>
        <button class="btn">
          <a
            target="_blank"
            rel="noreferrer noopener"
            :href="
              'https://twitter.com/intent/tweet' +
              '?text=' +
              encodeURIComponent('Completed contribution at Gitcoins Decentral Grants App!') +
              '&url=' +
              encodeURIComponent('https://grants.gtcdao.net')
            "
          >
            <div class="flex items-center gap-x-2 cursor-pointer">
              <TwitterIcon class="icon" />
              <span>Tweet</span>
            </div>
          </a>
        </button>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { TwitterIcon } from '@fusion-icons/vue/interface';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'PostCheckout',
  components: {
    TwitterIcon,
  },
  setup() {
    const router = useRouter();
    /* eslint-disable @typescript-eslint/unbound-method */
    return { routerPush: router.push, routerGo: router.go };
    /* eslint-enable @typescript-eslint/unbound-method */
  },
});
</script>

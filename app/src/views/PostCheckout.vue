<template>
  <section class="px-4 md:px-12 py-4 md:py-12">
    <div class="grid justify-center text-center">
      <h1 class="text-grey-500">Thank you for contributing!</h1>
      <div class="mt-8 flex gap-4 justify-center">
        <button @click="routerGo(-1)" class="btn">Back</button>
        <button @click="routerPush('/')" class="btn">Home</button>
        <a
          target="_blank"
          rel="noreferrer noopener"
          :href="
            'https://twitter.com/intent/tweet' +
            '?text=' +
            encodeURIComponent(
              'I just made a contribution to a grant using the new Gitcoin DAO decentralized grants platform! Join me in supporting public goods and open source at https://grants.gtcdao.net'
            ) +
            '&url=' +
            encodeURIComponent('https://grants.gtcdao.net')
          "
        >
          <button class="btn">
            <div class="flex items-center gap-x-2 cursor-pointer">
              <TwitterIcon class="icon" />
              <span>Tweet</span>
            </div>
          </button>
        </a>
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

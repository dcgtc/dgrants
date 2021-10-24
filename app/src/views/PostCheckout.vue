<template>
  <section class="px-4 md:px-12 py-4 md:py-12">
    <div class="grid justify-center text-center">
      <h1>Thanks! You’re Awesome. <span class="italic">Seriously.</span></h1>

      <p class="mt-4 italic text-grey-400 mx-auto max-w-6xl">
        Please help dGrants by spread the word with a tweet. Let us now how we can improve – your feedback is
        appreciated.
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

        <!--tweet button-->

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
            <TwitterIcon class="icon-small" />
            <span>Tweet</span>
          </button>
        </a>

        <!--feedback button-->

        <a
          target="_blank"
          rel="noreferrer noopener"
          href="https://docs.google.com/forms/d/10cQ1iUK7km5LT9HSwyoS0k08Akxhzd3PhILi2Pepd-M/edit?usp=sharing"
        >
          <button class="btn">
            <FeedbackIcon class="icon-small" />
            <span>Feedback</span>
          </button>
        </a>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { useRouter } from 'vue-router';
import {
  TwitterIcon,
  HomeIcon,
  ArrowLeftIcon as BackIcon,
  Chat1Icon as FeedbackIcon,
} from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'PostCheckout',
  components: {
    TwitterIcon,
    HomeIcon,
    BackIcon,
    FeedbackIcon,
  },
  setup() {
    const router = useRouter();
    /* eslint-disable @typescript-eslint/unbound-method */
    return { routerPush: router.push, routerGo: router.go };
    /* eslint-enable @typescript-eslint/unbound-method */
  },
});
</script>

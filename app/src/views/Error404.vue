<template>
  <section class="px-4 md:px-12 py-4 md:py-12">
    <div class="grid justify-center text-center">
      <h1 class="text-grey-500">404</h1>
      <p>Page not found!</p>

      <div class="mt-8 flex gap-4 justify-center">
        <button @click="routerGo(-1)" class="btn">Back</button>
        <button @click="routerPush('/')" class="btn">Home</button>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'Error404',
  setup() {
    const router = useRouter();
    /* eslint-disable @typescript-eslint/unbound-method */
    return { routerPush: router.push, routerGo: router.go };
    /* eslint-enable @typescript-eslint/unbound-method */
  },
});
</script>

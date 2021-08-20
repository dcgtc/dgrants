<!-- BaseTitle  
a section seperator that i should name BaseSectionTitle
but could not as it gave me errors . graham talked about
using the concept of <slots> but i am not sure how to do this right.

this can have a single item + optional some (INT) counter
-->

<template>
  <div class="px-4 md:px-12 pt-16 pb-8 border-b border-grey-100">
    <div class="block md:flex gap-x-8">
      <div class="flex flex-wrap content-center gap-x-8">
        <div class="cursor-pointer uppercase font-medium">active rounds<span class="ml-2 text-grey-400">(3)</span></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BaseTitle',
  components: {},
});
</script>

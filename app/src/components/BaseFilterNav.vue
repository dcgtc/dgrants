<!-- BaseFilterNav  
a filter navigation bar, that items can be various combinations :
- TEXT + (NUMBER)           e.g. ACTIVE ROUNDS (3)
- LABEL + STATUS            e.g. CURATION : ON 
- LABEL + STATUS + MENU     e.g. SORT : SHUFFLE ( ASC, DESC, BY WHATER)
it can also have an optional right aligned BUTTON as a call to action
-->

<template>
  <div class="px-4 md:px-12 pt-16 pb-8 border-b border-grey-100">
    <div class="block md:flex gap-x-8">
      <div class="flex flex-wrap content-center gap-x-8">
        <!-- text + (number) -->
        <div class="cursor-pointer uppercase font-medium">active rounds<span class="ml-2 text-grey-400">(3)</span></div>
        <!-- text + (number) -->
        <div class="cursor-pointer uppercase font-medium">all rounds<span class="ml-2 text-grey-400">(5)</span></div>
        <!-- label : text -->
        <div class="cursor-pointer uppercase font-medium"><span class="text-grey-400 mr-2">round:</span>gr11</div>
        <!-- label : text -->
        <div class="cursor-pointer uppercase font-medium"><span class="text-grey-400 mr-2">curation:</span>on</div>
        <!-- label : text + SUBMENU -->
        <div class="group cursor-pointer uppercase font-medium">
          <div class="relative"><span class="text-grey-400 mr-2">hover me:</span>shuffle</div>
          <!-- menu -->
          <div class="absolute hidden group-hover:block">
            <div
              class="
                border border-grey-400
                p-6
                pr-10
                bg-white
                text-grey-400
                flex flex-col
                gap-y-2
                uppercase
                font-medium
              "
            >
              <div class="text-grey-500">newest</div>
              <div class="hover:text-grey-500 cursor-pointer">shuffle</div>
              <div class="hover:text-grey-500 cursor-pointer">oldest</div>
              <div class="hover:text-grey-500 cursor-pointer">random</div>
              <!-- seperator -->
              <div class="border-b border-grey-400 my-4"></div>
              <div class="hover:text-grey-500 cursor-pointer">something</div>
            </div>
          </div>
        </div>
      </div>
      <!--optional button -->
      <div class="mt-4 md:mt-0 ml-auto">
        <button class="btn">im optional</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'BaseFilterNav',
  components: {},
});
</script>

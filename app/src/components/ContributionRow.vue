<!-- ContributionRow  
this is for the Grants Detail Page to show a Contribution.
-->

<template>
  <div class="px-4 md:px-12">
    <div class="border-b border-grey-100 py-8">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-2">
        <!--contributor-->
        <div class="truncate">
          <div class="flex items-center gap-4">
            <figure>
              <img class="icon cursor-pointer rounded-xl" src="http://placekitten.com/64" />
            </figure>
            <div>
              <div class=""><a href="">0xff…ffff</a></div>
              <div class="text-grey-400">3 min ago</div>
            </div>
          </div>
        </div>

        <!-- tx -->
        <div class="truncate">
          <div class="truncate"><a href="">0xff55483c4f83e65155483c4f83e65155483c4f83e651</a></div>
          <div class="text-grey-400">pending</div>
        </div>

        <!-- donation-->
        <div class="truncate text-left md:text-right">
          <div>1.337 ETH</div>
          <div class="text-grey-400">≈ 2000 USD</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'ContributionRow',
  components: {},
});
</script>

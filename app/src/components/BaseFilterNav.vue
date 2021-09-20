<template>
  <!-- wrapper for border bottom + padding -->
  <section>
    <!-- wrapper for left nav items + right optional button -->
    <div class="flex flex-col gap-y-4 md:flex-row gap-x-8">
      <!-- nav items wrapper -->
      <div class="flex flex-wrap whitespace-nowrap content-center gap-x-8 gap-y-4">
        <!-- nav item loop -->
        <ul v-for="(item, index) in items" :key="item.label">
          <!-- nav item -->
          <li @click="item?.action">
            <!-- if item have a menu show label in grey with a : at end -->
            <span v-if="item.menu" class="text-grey-400">{{ item.label + ':' }}</span>

            <!-- else just show the label-->
            <span v-else :class="active == index ? 'border-b pb-1' : 'text-grey-400'">{{ item.label }}</span>

            <!-- if item have a counter -->
            <span v-if="item.counter" class="ml-2 text-grey-400">({{ item.counter }})</span>

            <!-- if item have a item tag -->
            <span v-if="item.tag" class="ml-2">{{ item.tag }}</span>

            <!-- if item have a menu render a menu for it -->
            <div v-if="item.menu" class="absolute hidden group-hover:block text-left z-10">
              <div class="menu">
                <div
                  v-for="(menuItem, menuIndex) in item.menu"
                  :key="menuItem.label"
                  :class="
                    menuItem.separator
                      ? 'border-b border-grey-400 my-4'
                      : item.active == menuIndex
                      ? 'text-grey-500'
                      : 'hover:text-grey-500 cursor-pointer'
                  "
                  @click="menuItem?.action"
                >
                  {{ menuItem.label }}
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>

      <!--optional button -->
      <div v-if="button" class="mt-4 md:mt-0 ml-auto">
        <button class="btn" @click="button?.action">{{ button.label }}</button>
      </div>
    </div>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
// --- Types ---
import { FilterNavItem, FilterNavButton } from '@dgrants/types';

export default defineComponent({
  name: 'BaseFilterNav',
  components: {},
  props: {
    items: { type: Array as PropType<FilterNavItem[]>, required: true },
    active: { type: Number, required: false, default: 0 },
    button: { type: Object as PropType<undefined | FilterNavButton>, required: false, default: undefined },
  },
});
</script>

<style scoped>
section {
  @apply px-4 md:px-12 py-8 border-b border-grey-100;
}

li {
  @apply cursor-pointer uppercase font-medium group;
}

.menu {
  @apply border border-grey-400 p-6 pr-10 bg-white text-grey-400 flex flex-col gap-y-2 uppercase font-medium;
}
</style>

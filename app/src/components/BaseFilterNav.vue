<template>
  <div class="px-4 md:px-12 pt-16 pb-8 border-b border-grey-100">
    <div class="block md:flex gap-x-8">
      <div class="flex flex-wrap content-center gap-x-8">
        <div v-for="(item, index) in items" :key="item.title">
          <div class="cursor-pointer uppercase font-medium" @click="item?.action">
            <span :class="active == index ? 'underline' : ''">{{ item.title }}</span>
            <span v-if="item.counter" class="ml-2 text-grey-400">({{ item.counter }})</span>
            <span v-else-if="item.tag" class="text-grey-400 mr-2">{{ item.tag }}</span>
            <div v-if="item.menu" class="absolute hidden group-hover:block">
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
                <div
                  v-for="(menuItem, menuIndex) in item.menu"
                  :key="menuItem.title"
                  :class="
                    menuItem.seperator
                      ? 'border-b border-grey-400 my-4'
                      : item.active == menuIndex
                      ? 'text-grey-500'
                      : 'hover:text-grey-500 cursor-pointer'
                  "
                  @click="menuItem?.action"
                >
                  {{ menuItem.title }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!--optional button -->
      <div v-if="button" class="mt-4 md:mt-0 ml-auto">
        <button class="btn" @click="button?.action">{{ button.title }}</button>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { FilterItem } from '@dgrants/types';

export default defineComponent({
  name: 'BaseFilterNav',
  components: {},
  props: {
    items: { type: Array as PropType<FilterItem[]>, required: false, default: () => [] },
    active: { type: Number, required: false, default: 0 },
    button: { type: Object, required: false, default: undefined },
  },
});
</script>

<template>
  <div :class="intended ? 'px-4 md:px-12' : ''">
    <div class="py-8 border-b border-grey-100" :class="intended ? '' : 'px-4 md:px-12'">
      <div class="grid grid-cols-12 items-center gap-x-8">
        <!-- label -->
        <div class="col-span-12 md:col-span-3 mb-3 md:mb-0">
          <slot name="label"></slot>
        </div>

        <!-- input + optional description -->
        <div class="col-span-9 md:col-span-6">
          <slot name="input"></slot>
          <div v-if="text" class="mt-2">{{ text }}</div>
        </div>

        <!-- deletable -->
        <div v-if="deleteable" class="col-span-3 justify-self-end">
          <XIcon class="icon cursor-pointer" />
        </div>

        <!--toggle-->
        <div v-if="toggleable" class="col-span-3 justify-self-end">
          <input v-model="toggle" type="checkbox" class="hidden" checked />
          <div
            v-if="toggle"
            @click="
              () => {
                toggle = !toggle;
              }
            "
            class="
              px-8
              py-4
              border border-grey-400
              cursor-pointer
              hover:border-grey-500
              font-medium
              text-grey-400
              hover:text-grey-500
            "
          >
            on
          </div>
          <div
            v-if="!toggle"
            @click="
              () => {
                toggle = !toggle;
              }
            "
            class="
              px-8
              py-4
              border border-grey-200
              cursor-pointer
              hover:border-grey-300
              font-medium
              text-grey-200
              hover:text-grey-300
            "
          >
            off
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { CloseIcon as XIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'InputRow',
  props: {
    deleteable: Boolean,
    toggleable: Boolean,
    intended: Boolean,
    text: String,
  },
  components: { XIcon },

  data() {
    return {
      toggle: false,
    };
  },
});
</script>

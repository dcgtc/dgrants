<template>
  <div :class="intended ? 'px-4 md:px-12' : ''">
    <div class="py-8 border-b border-grey-100" :class="intended ? '' : 'px-4 md:px-12'">
      <div class="grid grid-cols-4 items-center gap-x-8 gap-y-4">
        <!-- label -->
        <div class="col-span-4 md:col-span-1">
          <slot name="label"></slot>
        </div>

        <!-- input + optional description -->
        <div class="col-span-4 md:col-span-3">
          <div class="flex items-center">
            <slot name="input"></slot>

            <!-- deletable -->
            <div v-if="deleteable" class="col-span-3 justify-self-end">
              <XIcon class="icon icon-primary icon-small cursor-pointer ml-4" />
            </div>
          </div>
          <div v-if="text" class="mt-2">{{ text }}</div>
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
    deleteable: { type: Boolean, required: false, default: false },
    intended: { type: Boolean, required: false, default: false },
    text: { type: String, required: false, default: '' },
  },
  components: { XIcon },
});
</script>

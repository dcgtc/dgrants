<template>
  <div :class="width">
    <label :class="['flex', 'flex-col', 'bg-white', 'items-center', 'block', 'px-6', 'py-8', 'border border-grey-400']">
      <span>Choose image file to upload</span>
      <input type="file" @change="onFile" class="hidden" />
    </label>
    <div v-if="!isValid" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none h-12 w-12">
      <WarningIcon class="icon stroke-pink" />
    </div>
    <p v-if="!isValid" class="text-xs text-red-600" :id="`${id}-error`">{{ errorMsg }}</p>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { WarningIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'BaseImageUpload',
  components: { WarningIcon },
  props: {
    // --- Required props ---
    modelValue: { type: File, required: true, default: undefined }, // from v-model, don't pass this directly
    // --- Optional props ---
    errorMsg: { type: String, required: false, default: undefined }, // message to show on error
    id: { type: String, required: false, default: undefined }, // id, for accessibility
    required: { type: Boolean, required: false, default: true }, // is required
    width: { type: String, required: false, default: 'w-full' }, // input field width
    showBorder: { type: Boolean, requred: false, default: true }, // show border below input
    rules: {
      // Validation rules, as a function that takes one input and returns a bool
      type: Function,
      required: false,
      default: () => true,
    },
  },

  setup(props, context) {
    const logo = ref<any>(props.modelValue); // eslint-disable-line @typescript-eslint/no-explicit-any
    const isValid = true;
    function onFile(e: Event) {
      const target = e.target as HTMLInputElement;
      const file: File = (target.files as FileList)[0];
      context.emit('updateLogo', file);
    }
    return { onFile, isValid, logo };
  },
});
</script>

<template>
  <div :class="width">
    <label class="flex flex-col bg-white items-center block px-6 py-8 border border-grey-400 cursor-pointer">
      <span>Choose image file to upload</span>
      <div v-if="isValid && val" :id="`${id}-success`">Uploaded: {{ val.name }}</div>
      <input type="file" @input="onInput" class="hidden" />
    </label>
    <div v-if="!isValid" class="bg-pink p-4 text-white" :id="`${id}-error`">{{ errorMsg }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';

export default defineComponent({
  name: 'BaseImageUpload',
  props: {
    // --- Required props ---
    // Getting the prop type right as File | undefined was a pain, so just leaving out the type definition here
    modelValue: { required: true }, // from v-model, don't pass this directly
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
    const val = ref<File | undefined>(props.modelValue as File);
    const isValid = ref(true);

    // Use watcher for rule validation since the rules are async (checking image dimensions is async)
    watch(
      () => val.value,
      async () => (isValid.value = val.value ? await props.rules(val.value) : true),
      { immediate: true }
    );

    function onInput(e: Event) {
      const target = e.target as HTMLInputElement;
      const file: File = (target.files as FileList)[0];
      val.value = file;
      context.emit('update:modelValue', file); // https://v3.vuejs.org/guide/migration/v-model.html#v-model
    }
    return { onInput, isValid, val };
  },
});
</script>

<template>
  <div :class="width">
    <label
      v-on:dragover="fileDragOver($event)"
      v-on:drop="fileDrop($event)"
      class="flex items-center justify-center cursor-pointer border-dropzone"
    >
      <ImportIcon class="icon-small icon-primary mx-8 my-16" />
      <input type="file" @input="onInput" class="hidden" />
    </label>

    <div v-if="!isValid" class="bg-pink p-4 text-white" :id="`${id}-error`">{{ errorMsg }}</div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { ImportIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'ImageDropZone',

  props: {
    // --- Required props ---
    // Getting the prop type right as File | undefined was a pain, so just leaving out the type definition here
    modelValue: { required: true }, // from v-model, don't pass this directly
    addImage: { required: true },
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
  components: { ImportIcon },

  setup(_, context) {
    const isValid = ref(true);
    const selectedImage = ref<string | null>(null);
    const mimeType = ref('');
    const finalImage = ref('');

    const handleFile = (file: File) => {
      context.emit('addImage', file); // https://v3.vuejs.org/guide/migration/v-model.html#v-model

      mimeType.value = 'not-for-now'; //file.type;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target !== null) {
          selectedImage.value = String(e.target.result);
        }
      };
      reader.readAsDataURL(file);
    };

    const fileDragOver = (e: Event) => {
      e.preventDefault();
    };
    const fileDrop = (e: DragEvent) => {
      e.preventDefault();

      if (e.dataTransfer !== null) {
        const file: File = (e.dataTransfer.files as FileList)[0];
        handleFile(file);
      }
    };

    function onInput(e: Event) {
      const target = e.target as HTMLInputElement;
      const file: File = (target.files as FileList)[0];
      handleFile(file);
    }

    return { onInput, isValid, fileDragOver, fileDrop, selectedImage, mimeType, finalImage };
  },
});
</script>

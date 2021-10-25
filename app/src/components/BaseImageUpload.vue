<template>
  <div :class="width" v-if="!val">
    <label
      v-on:dragover="fileDragOver($event)"
      v-on:drop="fileDrop($event)"
      class="flex flex-col bg-white items-center block px-6 py-8 border border-grey-400 cursor-pointer"
    >
      <span>Choose or Drop an image to upload</span>
      <div v-if="isValid && val" :id="`${id}-success`">Uploaded: {{ val.name }}</div>
      <input type="file" @input="onInput" class="hidden" />
    </label>
    <div v-if="!isValid" class="bg-pink p-4 text-white" :id="`${id}-error`">{{ errorMsg }}</div>
  </div>
  <div v-if="val">
    <div v-if="finalImage">
      <img :src="finalImage" class="h-36" />
      <p class="mx-2">{{ val.name }}</p>
      <button @click="onDiscard" class="mx-2">Discard Image</button>
    </div>
    <div v-if="!finalImage">
      <div v-if="!isValid">
        <div class="grid grid-cols-6 gap-4">
          <div class="col-span-5">
            <ImageEditor
              @cropped="onCrop"
              @discard="onDiscard"
              :mimeType="mimeType"
              :selectedImage="selectedImage"
              :desiredRatio="16 / 9"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import ImageEditor from './ImageEditor.vue';

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
  components: {
    ImageEditor,
  },

  setup(props, context) {
    const val = ref<File | undefined>(props.modelValue as File);
    const isValid = ref(true);
    const selectedImage = ref<any>(null);
    const mimeType = ref('');
    const finalImage = ref('');

    // Use watcher for rule validation since the rules are async (checking image dimensions is async)
    watch(
      () => val.value,
      async () => (isValid.value = val.value ? await props.rules(val.value) : true),
      { immediate: true }
    );

    const handleFile = (file: File) => {
      val.value = file;
      context.emit('update:modelValue', file); // https://v3.vuejs.org/guide/migration/v-model.html#v-model

      mimeType.value = 'not-for-now'; //file.type;

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target !== null) {
          selectedImage.value = e.target.result;
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

    function onCrop(image: string) {
      finalImage.value = image;
      console.log('???', finalImage.value);
    }

    function onDiscard() {
      finalImage.value = '';
      selectedImage.value = null;
      mimeType.value = '';
      val.value = undefined;
    }

    return { onInput, isValid, val, fileDragOver, fileDrop, selectedImage, mimeType, onCrop, onDiscard, finalImage };
  },
});
</script>

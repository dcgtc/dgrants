<template>
  <!-- Uploaded Image Preview -->
  <div v-if="logoURI" class="py-8">
    <div class="grid grid-cols-12 items-center gap-x-4 md:gap-x-8">
      <!-- image -->
      <div class="col-span-5 md:col-span-2 mb-3 md:mb-0">
        <img class="shadow-light" :src="logoURI" />
      </div>

      <!-- filename -->
      <div class="col-span-6 md:col-span-4 mb-3 md:mb-0 truncate">
        {{ logoURI }}
      </div>

      <!-- delete icon -->
      <div class="col-span-1 md:col-span-3 mb-3 md:mb-0 justify-self-end">
        <XIcon class="icon icon-primary icon-small cursor-pointer" @click="removeLogo" />
      </div>
    </div>
  </div>

  <!-- Image Upload -->
  <template v-else>
    <div class="block">
      <label class="w-100 flex flex-col bg-white items-center px-6 py-8 border border-grey-400 cursor-pointer">
        <input type="file" @input="onInput" class="hidden" />
        <div class="flex p-12 gap-x-12">
          <div
            class="
              group
              flex
              items-center
              justify-center
              h-24
              border border-grey-400
              p-12
              cursor-pointer
              hover:border-grey-500
            "
          >
            <ImportIcon class="icon icon-small icon-primary" />
          </div>
          <div class="text-grey-400 flex items-center">
            1920x1080px<br />
            *.png
          </div>
        </div>
      </label>
    </div>
    <div v-if="!isValid && !logoURI" class="bg-pink p-4 text-white" :id="`${id}-error`">
      {{ errorMsg }}
    </div>
  </template>
</template>

<script lang="ts">
import { defineComponent, ref, watch } from 'vue';
import { ImportIcon } from '@fusion-icons/vue/interface';
import { CloseIcon as XIcon } from '@fusion-icons/vue/interface';

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
    showBorder: { type: Boolean, required: false, default: true }, // show border below input
    logoURI: { type: String, required: false, default: undefined }, // URI of uploaded image
    rules: {
      // Validation rules, as a function that takes one input and returns a bool
      type: Function,
      required: false,
      default: () => true,
    },
  },

  components: { ImportIcon, XIcon },

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

    function removeLogo() {
      context.emit('update:modelValue', undefined);
    }

    return {
      onInput,
      removeLogo,
      isValid,
      val,
    };
  },
});
</script>

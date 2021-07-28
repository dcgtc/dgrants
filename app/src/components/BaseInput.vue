<template>
  <div>
    <label :for="id" class="block text-sm font-medium text-gray-700"> {{ label }} </label>
    <p :for="id" class="text-gray-500 text-sm">{{ description }}</p>
    <div class="mt-1 relative">
      <input
        v-model="val"
        @input="onInput"
        :class="{ 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500': !isValid }"
        class="
          hy
          appearance-none
          bg-white
          block
          w-full
          px-3
          py-2
          border border-gray-300
          rounded-md
          shadow-sm
          placeholder-gray-400
          focus:outline-none focus:ring-primary-500 focus:border-primary-500
          sm:text-sm
        "
        :id="id"
        :name="id"
        :required="true"
        :type="type"
        :readonly="readonly"
        :disabled="disabled"
      />
      <div v-if="!isValid" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <ExclamationCircleIcon class="h-5 w-5 text-red-500" />
      </div>
    </div>
    <p v-if="!isValid" class="mt-2 text-sm text-red-600" :id="`${id}-error`">{{ errorMsg }}</p>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { ExclamationCircleIcon } from '@heroicons/vue/solid';

export default defineComponent({
  name: 'BaseInput',
  components: { ExclamationCircleIcon },
  props: {
    // --- Required props ---
    modelValue: { type: String, required: true, default: undefined }, // from v-model, don't pass this directly
    // --- Optional props ---
    label: { type: String, required: false, default: undefined }, // field label
    description: { type: String, required: false, default: undefined }, // field description
    errorMsg: { type: String, required: false, default: undefined }, // message to show on error
    id: { type: String, required: false, default: undefined }, // id, for accessibility
    placeholder: { type: String, required: false, default: undefined }, // input placeholder text
    type: { type: String, required: false, default: 'text' }, // input type
    readonly: { type: Boolean, required: false, default: false }, // is readonly
    disabled: { type: Boolean, required: false, default: false }, // is disabled
    rules: {
      // Validation rules, as a function that takes one input and returns a bool
      type: Function,
      required: false,
      default: () => true,
    },
  },

  setup(props, context) {
    const val = ref<any>(props.modelValue); // eslint-disable-line @typescript-eslint/no-explicit-any
    const isValid = computed(() => (val.value ? props.rules(val.value) : true)); // assume valid if field is empty
    function onInput() {
      context.emit('update:modelValue', val.value);
    }
    return { onInput, isValid, val };
  },
});
</script>

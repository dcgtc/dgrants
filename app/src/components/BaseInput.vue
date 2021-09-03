<template>
  <div :class="width">
    <label :for="id" class="block text-sm font-medium text-gray-700"> {{ label }} </label>
    <p :for="id" class="text-gray-500 text-sm">{{ description }}</p>
    <div>
      <input
        v-model="val"
        @input="onInput"
        :class="[!isValid ? 'border-pink text-pink' : '', customcss ? customcss : '']"
        :id="id"
        :name="id"
        :required="required"
        :type="type"
        :readonly="readonly"
        :disabled="disabled"
        :placeholder="placeholder"
      />
      <div v-if="!isValid" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none h-12 w-12">
        <WarningIcon class="icon stroke-pink" />
      </div>
      <p v-if="!isValid" class="text-xs text-red-600" :id="`${id}-error`">{{ errorMsg }}</p>
      <p :for="id" class="text-grey-400 mt-2 text-sm">{{ description }}</p>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';
import { WarningIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'BaseInput',
  components: { WarningIcon },
  props: {
    // --- Required props ---
    modelValue: { type: [String, Number], required: true, default: undefined }, // from v-model, don't pass this directly
    // --- Optional props ---
    label: { type: String, required: false, default: undefined }, // field label
    description: { type: String, required: false, default: undefined }, // field description
    errorMsg: { type: String, required: false, default: undefined }, // message to show on error
    id: { type: String, required: false, default: undefined }, // id, for accessibility
    placeholder: { type: String, required: false, default: undefined }, // input placeholder text
    type: { type: String, required: false, default: 'text' }, // input type
    required: { type: Boolean, required: false, default: true }, // is required
    readonly: { type: Boolean, required: false, default: false }, // is readonly
    disabled: { type: Boolean, required: false, default: false }, // is disabled
    width: { type: String, required: false, default: 'w-full' }, // input field width
    customcss: { type: String, required: false, default: '' }, // add custom css stylings

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

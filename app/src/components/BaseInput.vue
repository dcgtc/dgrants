<template>
  <div :class="width">
    <input
      v-model="val"
      @input="onInput"
      :class="[customcss ? customcss : '']"
      class="h-16"
      :id="id"
      :name="id"
      :required="required"
      :type="type"
      :readonly="readonly"
      :disabled="disabled"
      :placeholder="placeholder"
      :min="type === 'number' && min ? min : undefined"
    />

    <div v-if="!isValid">
      <div class="bg-pink p-4 text-white" :id="`${id}-error`">{{ errorMsg }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'BaseInput',
  props: {
    // --- Required props ---
    modelValue: { type: [String, Number], required: true, default: undefined }, // from v-model, don't pass this directly
    // --- Optional props ---
    errorMsg: { type: String, required: false, default: undefined }, // message to show on error
    id: { type: String, required: false, default: undefined }, // id, for accessibility
    placeholder: { type: String, required: false, default: undefined }, // input placeholder text
    type: { type: String, required: false, default: 'text' }, // input type
    required: { type: Boolean, required: false, default: true }, // is required
    readonly: { type: Boolean, required: false, default: false }, // is readonly
    disabled: { type: Boolean, required: false, default: false }, // is disabled
    width: { type: String, required: false, default: 'w-full' }, // input field width
    customcss: { type: String, required: false, default: '' }, // add custom css stylings
    min: { type: Number, required: false, default: undefined }, // min if being used as a number input

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

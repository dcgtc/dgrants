<template>
  <div :class="width">
    <textarea
      v-model="val"
      @input="onInput"
      :id="id"
      :name="id"
      :required="required"
      :rows="rows"
      :type="type"
      :readonly="readonly"
      :disabled="disabled"
      :placeholder="placeholder"
    />

    <div v-if="!isValid">
      <div class="bg-pink p-4 text-white" :id="`${id}-error`">{{ errorMsg }}</div>
    </div>
  </div>
</template>

<script lang="ts">
import { computed, defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'BaseTextarea',
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
    readonly: { type: Boolean, required: false, default: false }, // is readonly
    rows: { type: Number, required: false, default: 10 }, // rows in textarea
    required: { type: Boolean, required: false, default: false }, // is required field
    disabled: { type: Boolean, required: false, default: false }, // is disabled
    width: { type: String, required: false, default: 'w-full' }, // input field width
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

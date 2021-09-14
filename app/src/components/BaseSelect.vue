<template>
  <div :class="width">
    <select v-model="val" @input="onInput" @update:model-value="$emit('update:modelValue', $event)">
      <option v-for="option in options" :key="option.id" :value="option">
        {{ option[label] }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
  name: 'BaseSelect',
  props: {
    // --- Required props ---
    options: { type: Array as PropType<Record<string, any>[]>, required: true }, // available
    modelValue: { type: Object, required: true, default: undefined },

    // --- Optional props ---

    width: { type: String, required: false, default: 'w-full' }, // input field width
    label: { type: String, required: false, default: 'name' }, // option[label] is used as the string shown

    rules: {
      // Validation rules, as a function that takes one input and returns a bool
      type: Function,
      required: false,
      default: () => true,
    },
  },

  setup(props) {
    const val = ref<any>(props.modelValue); // eslint-disable-line @typescript-eslint/no-explicit-any

    function onInput() {
      console.log(val);
    }
    return { onInput, val };
  },
});
</script>

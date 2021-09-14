<template>
  <div :class="width">
    <select name="token" class="">
      <option v-for="option in options" :key="option.id" :value="option">
        {{ option[label] }}
      </option>
    </select>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';

export default defineComponent({
  name: 'BaseSelect',
  components: {},
  props: {
    // --- Required props ---
    modelValue: { type: Object, required: true }, // from v-model, don't pass this directly
    // --- Optional props ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: { type: Array as PropType<Record<string, any>[]>, required: true }, // available options, must be array of objects with an `id` field
    width: { type: String, required: false, default: 'w-full' }, // input field width
    label: { type: String, required: false, default: 'name' }, // option[label] is used as the string shown
  },
});
</script>

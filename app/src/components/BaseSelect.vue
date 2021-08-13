<template>
  <Listbox
    as="div"
    v-model="selected"
    :modelValue="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <!-- <ListboxLabel class="block text-sm font-medium text-gray-700"> {{ description }} </ListboxLabel> -->
    <div class="mt-1 relative">
      <ListboxButton
        class="
          bg-white
          relative
          w-24
          border border-gray-300
          rounded-md
          shadow-sm
          pl-3
          pr-10
          py-2
          text-left
          cursor-default
          focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500
          sm:text-sm
        "
      >
        <span class="block truncate">{{ selected[label] }}</span>
        <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
          <SelectorIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
        </span>
      </ListboxButton>

      <transition
        leave-active-class="transition ease-in duration-100"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <ListboxOptions
          class="
            absolute
            z-10
            mt-1
            w-full
            bg-white
            shadow-lg
            max-h-60
            rounded-md
            py-1
            text-base text-left
            ring-1 ring-black ring-opacity-5
            overflow-auto
            focus:outline-none
            sm:text-sm
          "
        >
          <ListboxOption
            as="template"
            v-for="option in options"
            :key="option.id"
            :value="option"
            v-slot="{ active, selected }"
          >
            <li
              :class="[
                active ? 'text-white bg-indigo-600' : 'text-gray-900',
                'cursor-default select-none relative py-2 pl-3 pr-9',
              ]"
            >
              <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">
                {{ option[label] }}
              </span>

              <span
                v-if="selected"
                :class="[
                  active ? 'text-white' : 'text-indigo-600',
                  'absolute inset-y-0 right-0 flex items-center pr-4',
                ]"
              >
                <CheckIcon class="h-5 w-5" aria-hidden="true" />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<script lang="ts">
import { defineComponent, ref, PropType } from 'vue';
import { Listbox, ListboxButton, /* ListboxLabel, */ ListboxOption, ListboxOptions } from '@headlessui/vue';
import { CheckIcon, SelectorIcon } from '@heroicons/vue/solid';

export default defineComponent({
  name: 'BaseSelect',
  components: { Listbox, ListboxButton, /* ListboxLabel, */ ListboxOption, ListboxOptions, CheckIcon, SelectorIcon },
  props: {
    // --- Required props ---
    modelValue: { type: Object, required: true, default: undefined }, // from v-model, don't pass this directly
    // --- Optional props ---
    options: { type: Array as PropType<Record<string, unknown>[]>, required: true }, // available options, must be array of objects with an `id` field
    label: { type: String, required: false, default: 'name' }, // option[label] is used as the string shown
  },

  setup(props) {
    const selected = ref<any>(props.modelValue); // eslint-disable-line @typescript-eslint/no-explicit-any
    return { selected };
  },
});
</script>

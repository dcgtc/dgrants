<template>
  <Listbox as="div" :modelValue="modelValue" @update:model-value="$emit('update:modelValue', $event)">
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
        <span class="block truncate">{{ modelValue[label] }}</span>
        <span class="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none w-12">
          <ArrowBottom2Icon class="icon icon-primary" aria-hidden="true" />
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
                active ? 'text-white bg-grey-500' : 'text-gray-900',
                'cursor-default select-none relative py-2 pl-3 pr-9',
              ]"
            >
              <span :class="[selected ? 'font-semibold' : 'font-normal', 'block truncate']">
                {{ option[label] }}
              </span>

              <span v-if="selected" :class="['absolute inset-y-0 right-0 flex items-center pr-4 w-12']">
                <CheckIcon
                  :class="['icon icon-heavy', active ? 'stroke-white' : 'stroke-grey-400']"
                  aria-hidden="true"
                />
              </span>
            </li>
          </ListboxOption>
        </ListboxOptions>
      </transition>
    </div>
  </Listbox>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
import { Listbox, ListboxButton, /* ListboxLabel, */ ListboxOption, ListboxOptions } from '@headlessui/vue';
import { CheckIcon, ArrowBottom2Icon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'BaseSelect',
  components: {
    Listbox,
    ListboxButton,
    /* ListboxLabel, */ ListboxOption,
    ListboxOptions,
    CheckIcon,
    ArrowBottom2Icon,
  },
  props: {
    // --- Required props ---
    modelValue: { type: Object, required: true }, // from v-model, don't pass this directly
    // --- Optional props ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: { type: Array as PropType<Record<string, any>[]>, required: true }, // available options, must be array of objects with an `id` field
    label: { type: String, required: false, default: 'name' }, // option[label] is used as the string shown
  },
});
</script>

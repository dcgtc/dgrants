<template>
  <Listbox
    :class="containerClass"
    as="div"
    :modelValue="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
  >
    <div class="relative">
      <!-- not realy happy with using the headless ui just for having a non-native input-select field ( <ListboxButton> and <ListboxOptions> ) 
      1. its impossible without hardcoding heights to mix native input fields and this fake
      input selects ... i would prefer regular native input type select and get rid
      of that dependency as it is not realy helpfull here -->

      <!-- example code would be like this :
      <select name="token" class="border-l-0 w-1/2">
        <option value="eth">ETH</option>
        <option value="dai">DAI</option>
        <option value="gtc">GTC</option>
        <option value="weth">WETH</option>
      </select>
      -->

      <ListboxButton :class="`group w-full border border-grey-400 hover:border-grey-500 ${buttonClass}`">
        <span class="block truncate text-left">{{ modelValue[label] }}</span>
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
            w-full
            bg-white
            text-left
            overflow-auto
            border border-grey-400 border-t-0
            p-5
            font-medium
            bg-white
            text-grey-400
            uppercase
            whitespace-nowrap
          "
        >
          <ListboxOption
            as="template"
            v-for="option in options"
            :key="option.id"
            :value="option"
            v-slot="{ active, selected }"
          >
            <li :class="[active ? 'text-grey-500' : '', 'cursor-pointer select-none relative']">
              <span :class="[selected ? 'text-grey-500' : '', 'block truncate']">
                {{ option[label] }}
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
import { ArrowBottom2Icon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'BaseSelect',
  components: {
    Listbox,
    ListboxButton,
    /* ListboxLabel, */ ListboxOption,
    ListboxOptions,
    ArrowBottom2Icon,
  },
  props: {
    // --- Required props ---
    modelValue: { type: Object, required: true }, // from v-model, don't pass this directly
    // --- Optional props ---
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    options: { type: Array as PropType<Record<string, any>[]>, required: true }, // available options, must be array of objects with an `id` field
    label: { type: String, required: false, default: 'name' }, // option[label] is used as the string shown
    buttonClass: { type: String, required: false, default: '' }, // button field class
    containerClass: { type: String, required: false, default: 'w-full' }, // input field class
  },
});
</script>

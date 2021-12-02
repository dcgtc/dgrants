<template>
  <img :class="classStr" :src="logoUrl" />
</template>

<script lang="ts">
import { computed, defineComponent, PropType } from 'vue';
// --- Types ---
import { MetaPtr } from '@dgrants/types';
// --- Utils ---
import { ptrToURI } from 'src/utils/utils';

export default defineComponent({
  name: 'LogoPtrImage',
  props: {
    class: { type: String, require: false, default: 'w-full h-full object-center object-cover' },
    logoPtr: { type: Object as PropType<MetaPtr> | undefined, required: false, default: undefined },
    placeholder: { type: String, require: false, default: '/placeholder_grant.svg' },
  },
  setup(props) {
    // watch for changes on provided props
    const classStr = computed(() => props.class);
    const logoUrl = computed(() => (props.logoPtr ? ptrToURI(props.logoPtr) : false) || props.placeholder);

    return {
      logoUrl,
      classStr,
    };
  },
});
</script>

<template>
  <div ref="icon" />
</template>

<script lang="ts">
import jazzicon from 'jazzicon-ts';
import { defineComponent, ref, onMounted } from 'vue';

export default defineComponent({
  name: 'Jazzicon',
  props: {
    width: { type: Number, required: false, default: 64 },
    address: { type: String, required: true }, // address to generate jazzicon for
  },
  setup(props) {
    const icon = ref<HTMLDivElement>();
    const width = ref<number>(props.width);
    const address = ref<string>(props.address);

    onMounted(() => {
      // construct the element
      const identicon = jazzicon(width.value, parseInt(address.value.slice(2, 10), 16));
      // place the identicon against the icon ref
      icon.value?.appendChild(identicon);
    });

    return {
      icon,
    };
  },
});
</script>

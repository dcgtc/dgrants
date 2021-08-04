<template>
  <button> {{ label }} </button>
</template>

<script lang="ts">
import { defineComponent } from 'vue';


export default defineComponent({
  name: 'Button',
  props: {
    label: { type: String, required: false, default: undefined }, // field label
  },
});
</script>

<style lang="postcss" scoped >

button{
  @apply py-4 px-8 font-medium uppercase bg-grey-300 text-white hover:bg-grey-400
}

</style>


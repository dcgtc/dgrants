<template>
  <InputRow v-for="(item, index) in controllerList" :key="item.id">
    <template v-slot:label>Image ({{ index + 1 }}):</template>
    <template v-slot:input>
      <ImageRow :index="index" @discard="discardImage" :imageController="item" :desiredRatio="desiredRatio" />
    </template>
  </InputRow>
  <InputRow>
    <template v-slot:label>Logo:</template>
    <template v-slot:input>
      <BaseImageUpload v-on:addImage="addImage" />
    </template>
  </InputRow>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';

import { ImageEditorVariant, ControlledImage } from '../types/images';

import ImageRow from './ImageRow.vue';
import BaseImageUpload from './BaseImageUpload.vue';
import InputRow from './InputRow.vue';

export default defineComponent({
  name: 'ImageController',
  props: {
    multi: {
      type: Boolean,
      default: false,
    },
    limit: {
      type: Number,
      default: 1,
    },
    maxSize: {
      type: Number,
      default: 500 * 1024,
    },
    variant: {
      type: String as PropType<ImageEditorVariant>,
      default: 'RECTANGLE',
    },
    desiredRatio: {
      type: Number,
      default: 16 / 9,
    },
  },
  components: {
    ImageRow,
    BaseImageUpload,
    InputRow,
  },
  setup(props) {
    const controllerList = ref<Array<ControlledImage>>([]);

    const addImage = (image: File) => {
      const controlledImage = new ControlledImage(image, props.desiredRatio);

      controllerList.value.push(controlledImage);
    };

    const discardImage = (id: number) => {
      controllerList.value = controllerList.value.filter((item) => item.id !== id);
    };

    return { addImage, controllerList, discardImage };
  },
});
</script>

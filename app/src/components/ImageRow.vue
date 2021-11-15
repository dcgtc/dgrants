<template>
  <div v-if="isUploading">Uploading ...</div>
  <div v-if="!isUploading">Uploaded</div>
  <div v-if="needEdit">
    <!-- We should put editor here -->
    <ImageEditor
      :imageName="imageController.images.raw.name"
      @cropped="onCrop"
      :desiredRatio="desiredRatio"
      :selectedImage="selectedImage"
      :imageId="imageController.id"
    />
  </div>
  <div v-if="!needEdit">
    <!-- We should put finalized editor here -->
  </div>
  <button @click="discard">Discard Image</button>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import ImageEditor from './ImageEditor.vue';
import { ControlledImage } from '../types/images';

import { getImageUrlFromFile } from '../utils/image-processing';

export default defineComponent({
  name: 'ImageRow',
  components: {
    ImageEditor,
  },
  props: {
    imageController: {
      type: Object as PropType<ControlledImage>,
      required: true,
    },
    desiredRatio: {
      type: Number,
    },
    index: {
      type: Number,
    },
  },
  setup(props, context) {
    const isUploading = ref<boolean>(props.imageController.isUploading);
    const needEdit = ref<boolean>(props.imageController.needEdit);
    const selectedImage = ref<any>('');

    props.imageController?.addEventListener('changed', async () => {
      const { imageController } = props;
      // console.log('something has changed');
      isUploading.value = imageController.isUploading;

      console.log(imageController);

      needEdit.value = imageController.needEdit;
      getImageUrlFromFile(imageController.images.raw)
        .then((imageUrl) => {
          selectedImage.value = imageUrl;
        })
        .catch((err) => console.log(err));
    });

    const onCrop = (image: File) => {
      props.imageController.process(image);
    };

    /* const processProperRatioImage = () => {
      imageController.process();
    };
*/
    const discard = () => {
      const { imageController } = props;

      console.log(props.index);
      context.emit('discard', imageController.id);
    };

    return {
      isUploading,
      needEdit,
      selectedImage,
      discard,
      onCrop,
    };
  },
});
</script>

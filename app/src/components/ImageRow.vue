<template>
  <!-- EDIT -->

  <section v-if="needEdit || isEdit" class="w-full">
    <article class="flex items-center gap-8">
      <div class="w-full">
        <ImageEditor
          :imageName="imageController.images.raw.name"
          @cropped="onCrop"
          @cancel="cancelEdit"
          @discard="discard"
          :desiredRatio="desiredRatio"
          :selectedImage="selectedImage"
          :imageId="imageController.id"
          :isEdit="isEdit"
        />
      </div>

      <div class="ml-auto">
        <!-- @ajand : this button need trigger the CROP -->
        <button>
          <ExportIcon class="icon-small icon-primary" />
        </button>
      </div>
    </article>
  </section>

  <!-- IMG CARD -->

  <section v-if="!needEdit && !isEdit" class="w-full">
    <!-- IMAGE UPLOADING -->

    <article v-if="isUploading" class="flex items-center">
      <figure class="flex gap-8 items-center animate-pulse">
        <img :src="thumbImage" class="w-16 md:w-32 lg:w-48" />
        <figcaption>Uploading – {{ imageController.images.raw.name }}</figcaption>
      </figure>

      <div class="ml-auto">
        <button v-on:click="discard">
          <CloseIcon class="icon-small icon-primary" />
        </button>
      </div>
    </article>

    <!-- IMAGE ONLINE / READY -->

    <article v-if="!isUploading" class="flex items-center">
      <figure class="flex gap-8 items-center">
        <img :src="thumbImage" class="w-16 md:w-32 lg:w-48" />
        <figcaption>{{ imageController.images.raw.name }}</figcaption>
      </figure>

      <div class="ml-auto">
        <button v-on:click="changeEdit">
          <EditIcon class="icon-small icon-primary" />
        </button>
      </div>
    </article>
  </section>
</template>

<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import ImageEditor from './ImageEditor.vue';
import { ControlledImage } from '../types/images';
import { CloseIcon, ExportIcon, Edit2Icon as EditIcon } from '@fusion-icons/vue/interface';

import { getImageUrlFromFile } from '../utils/image-processing';

export default defineComponent({
  name: 'ImageRow',
  components: {
    ImageEditor,
    EditIcon,
    CloseIcon,
    ExportIcon,
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
    const isEdit = ref<boolean>(false);
    const thumbImage = ref<string | null>('');

    props.imageController?.addEventListener('changed', async () => {
      const { imageController } = props;
      isUploading.value = imageController.isUploading;
      needEdit.value = imageController.needEdit;
      getImageUrlFromFile(imageController.images.raw)
        .then((imageUrl) => {
          selectedImage.value = imageUrl;
        })
        .catch((err) => console.log(err));

      if (imageController.images.processed) {
        getImageUrlFromFile(imageController.images.processed)
          .then((imageUrl) => {
            thumbImage.value = imageUrl;
          })
          .catch((err) => console.log(err));
      }
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
      context.emit('discard', imageController.id);
    };

    const changeEdit = () => {
      isEdit.value = !isEdit.value;
    };

    const cancelEdit = () => {
      isEdit.value = false;
    };

    return {
      isUploading,
      needEdit,
      selectedImage,
      discard,
      onCrop,
      isEdit,
      thumbImage,
      changeEdit,
      cancelEdit,
    };
  },
});
</script>

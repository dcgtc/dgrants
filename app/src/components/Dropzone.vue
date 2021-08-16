<!-- Dropzone  

  this is an input that creates a dropzone 
  it should also work on click to open the file-browser.
  the text for the formats should be 3 different texts:

  -- 1920x1080px<br/>*.png            // Tumbnail for a Grant or a Round
  -- 1920x1200px<br/>*.png            // Slide for Grant 
  -- 1024x1024px<br/>*.jpg,*.png      // Avatar / Foto

-->

<template>
  <div class="border border-grey-400 border-dashed hover:border-grey-500 cursor-copy">
    <div class="flex p-12 gap-x-12">
      <div
        class="
          group
          flex
          items-center
          justify-center
          h-24
          border border-grey-400
          p-12
          cursor-pointer
          hover:border-grey-500
        "
      >
        <ImportIcon class="icon-small" />
      </div>
      <div class="text-grey-400 flex items-center">
        1920x1080px<br />
        *.png
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import { ImportIcon as ImportIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'Dropzone',
  components: {
    ImportIcon,
  },
});
</script>

<style scoped></style>

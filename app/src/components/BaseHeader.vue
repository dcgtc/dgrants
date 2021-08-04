<template>
  <header>
    <!-- back icon -->
    <nav>PREV</nav>

    <div class="content">
      <div>breadcrumb needs to go here</div>
      <h1>{{ headline }}</h1>
      <h1 v-if="subline">{{ subline }}</h1>
      <p v-if="address"><span class="text-grey-400">by</span> <a href="#">{{ address }}</a> <span class="italic text-grey-400">{{ action }} {{ time }}</span></p>



    </div>
    
    <!-- next icon -->
    <nav>NEXT</nav>
    
  </header>
  
</template>

<script lang="ts">
import { defineComponent } from 'vue';


export default defineComponent({
  name: 'BaseHeader',
  props: {
    headline: { type: String, required: true, default: undefined }, // headline
    subline: { type: String, required: false, default: undefined }, //on some headers needed
    address: { type: String, required: false, default: undefined }, //trunciated or ENSed eth address
    time: { type: String, required: false, default: undefined }, //humanized timestamp
    action: { type: String, required: false, default: undefined }, //last updated, last seen . maybe better word?

  },
});
</script>

<style lang="postcss" scoped >

header{
  @apply flex justify-between items-center gap-4 border-b border-grey-100 py-16;
}

header nav {
  @apply  bg-grey-100 ;
}

header .content{
  @apply items-center text-center;
}


</style>


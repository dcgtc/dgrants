<template>
  <!-- header with navigation, bredcrumb, subtile, quote-->
  <header class="px-12 py-20 border-b border-grey-100 text-center relative">
    <!-- optional breadcrumb -->
    <div class="uppercase font-medium text-grey-400 mb-8">
      <span class="">dgrants</span>
      <span class="mx-4 bg-pink">→</span>
      <span>collections (4949)</span>
      <span class="mx-4 bg-pink">→</span>
      <span>#432</span>
      <span class="mx-4 bg-pink">→</span>
    </div>

    <h1>Best Infrastructure Grants</h1>

    <!-- optional subline -->
    <h1>subline</h1>

    <!--optional by address last seen / last  updated-->
    <p>
      <span class="text-grey-400 mr-4">by</span>
      <a class="mr-4" href="#">0xff…ffff</a>
      <span class="italic text-grey-400">last seen 3 days ago</span>
    </p>

    <!-- optional quote -->
    <p class="italic mt-8">
      “Focus on infrastructure, and the organization of services. vidunt ut labore et dolore magna aliquyam erat, sed
      diam voluptua. vidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.”
    </p>

    <!-- optional navigation to jump to next item in a list -->
    <nav class="inline p-6 bg-pink absolute right-0" style="top: 50%; transform: translateY(-50%)">PREV</nav>
    <nav class="inline p-6 bg-pink absolute left-0" style="top: 50%; transform: translateY(-50%)">NEXT</nav>
  </header>

  <!-- minimal header  -->
  <header class="px-12 py-20 border-b border-grey-100 text-center relative">
    <h1>Best Infrastructure Grants</h1>
  </header>

  <!-- head part for sections-->
  <div class="px-12 pt-16 pb-8 border-b border-grey-100">
    <p class="uppercase font-medium">Grants<span class="ml-4 text-grey-400">(1337)</span></p>
  </div>

  <!-- grant description paragraph with some intent-->
  <div class="px-12 py-12 mx-auto max-w-6xl">
    <p class="intent">
      Im a paragraph but with intent. <a href="#">link</a> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
      diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
      accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor
      sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
      labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
      Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
    </p>
  </div>

  <!--button-->
  <br /><br />
  <button class="uppercase font-medium bg-grey-500 text-white px-8 py-4 hover:bg-grey-400">Click me</button>

  <!--link-->
  <br /><br />
  <a href="#">Im a link</a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Ui',
});
</script>

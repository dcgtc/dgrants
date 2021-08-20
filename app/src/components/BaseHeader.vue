<!-- BaseHeader  
with headline
with optional absolute left right navigation 
with optional breadcrumb navigation 
with optional second headline
with optional metadata "by {address}" + "last seen/update" + humanized timestamp
with optional "quote" ( for a public collection of a user ) 
should have props .... on /off  breadcrumb, secondHeadine , quote,  byWhen
-->

<template>
  <header class="px-4 md:px-12 py-20 border-b border-grey-100 text-center relative">
    <!-- optional breadcrumb within a header -->
    <div class="flex flex-wrap justify-center mb-8">
      <a class="group no-underline flex items-center" href="#">
        <span class="uppercase font-medium text-grey-400 truncate hover:text-grey-500">dgrants</span>
        <ArrowRightSmallIcon class="icon-small" />
      </a>

      <a class="group no-underline flex items-center" href="#">
        <span class="uppercase font-medium text-grey-400 truncate hover:text-grey-500">collections (4949)</span>
        <ArrowRightSmallIcon class="icon-small" />
      </a>

      <a class="group no-underline flex items-center" href="#">
        <span class="uppercase font-medium text-grey-400 truncate hover:text-grey-500">#432</span>
        <ArrowRightSmallIcon class="icon-small" />
      </a>
    </div>

    <h1>Best Infrastructure Grants</h1>

    <!-- optional subline -->
    <h1>“Fusion - Iconpack for Cryptonauts”</h1>

    <!--optional by address last seen / last  updated " "byWhen"  -->
    <div>
      <span class="text-grey-400 mr-4">by</span>
      <a class="mr-4" href="#">0xff…ffff</a>
      <span class="italic text-grey-400">last seen 3 days ago</span>
    </div>

    <!-- optional quote -->
    <p class="intent italic mt-8 mx-auto max-w-6xl">
      “Im a paragraph but with intent. <a href="#">link</a> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
      diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
      accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor
      sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
      labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
      Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.”
    </p>

    <!-- optional navigation to jump to next item in a list -->
    <nav class="group inline p-6 absolute right-0 cursor-pointer" style="top: 50%; transform: translateY(-50%)">
      <ArrowRightIcon class="icon" />
    </nav>
    <nav class="group inline p-6 absolute left-0 cursor-pointer" style="top: 50%; transform: translateY(-50%)">
      <ArrowLeftIcon class="icon" />
    </nav>
  </header>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

// icons
import { ArrowRight2Icon as ArrowRightSmallIcon } from '@fusion-icons/vue/interface';
import { ArrowLeft4Icon as ArrowLeftIcon } from '@fusion-icons/vue/interface';
import { ArrowRight4Icon as ArrowRightIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'BaseHeader',
  components: { ArrowRightSmallIcon, ArrowLeftIcon, ArrowRightIcon },
});
</script>

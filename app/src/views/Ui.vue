<template>

<!-- header 
  with headline
  with optional absolute left right navigation 
  with optional breadcrumb navigation 
  with optional second headline
  with optional metadata "by {address}" + "last seen/update" + humanized timestamp
  with optional "quote" ( for a public collection of a user ) 
-->
<header class="px-12 py-20 border-b border-grey-100 text-center relative ">

    <!-- optional breadcrumb within a header -->
    <div class="flex flex-wrap justify-center mb-8">
      
      <a class="no-underline flex items-center" href="#">
        <span class="uppercase font-medium text-grey-400 truncate hover:text-grey-500">dgrants</span>
        <img class="mx-4" src="http://placekitten.com/24">
      </a>

      <a class="no-underline flex items-center" href="#">
        <span class="uppercase font-medium text-grey-400 truncate hover:text-grey-500">collections (4949)</span>
        <img class="mx-4" src="http://placekitten.com/24">
      </a>

      <a class="no-underline flex items-center" href="#">
        <span class="uppercase font-medium text-grey-400 truncate hover:text-grey-500">#432</span>
        <img class="mx-4" src="http://placekitten.com/24">
      </a>      

    </div>


  <h1>Best Infrastructure Grants</h1>

  <!-- optional subline -->
  <h1>“Fusion - Iconpack for Cryptonauts”</h1>

  <!--optional by address last seen / last  updated-->
  <div>
    <span class="text-grey-400 mr-4">by</span>
    <a class="mr-4" href="#">0xff…ffff</a>
    <span class="italic text-grey-400">last seen 3 days ago</span>
  </div>

  <!-- optional quote -->
  <p class="intent italic mt-8 mx-auto max-w-6xl ">
    “Im a paragraph but with intent. <a href="#">link</a> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
    diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
    accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor
    sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
    labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
    Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.”
  </p>


  <!-- optional navigation to jump to next item in a list -->
  <nav class="inline p-6 bg-pink absolute right-0" style="top: 50%; transform: translateY(-50%)">
    <img src="http://placekitten.com/32">
  </nav>
  <nav class="inline p-6 bg-pink absolute left-0" style="top: 50%; transform: translateY(-50%)">
    <img src="http://placekitten.com/32">
  </nav>
</header>





<!-- divider / mini header -->
<div class="px-12 pt-16 pb-8 border-b border-grey-100">
  <p class="uppercase font-medium">Grants<span class="ml-4 text-grey-400">(1337)</span></p>
</div>


<!-- grant description paragraph with some intent-->
<div class="border-b border-grey-100">
  <p class="intent px-12 py-12 mx-auto max-w-6xl ">
    Im a paragraph but with intent. <a href="#">link</a> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
    diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
    accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor
    sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
    labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
    Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
  </p>
</div>


<!-- tab bar -->
<div class="px-12 py-6 border-b border-grey-100 flex flex-wrap gap-x-10 gap-y-2">
  <a class="text-grey-500 font-medium no-underline whitespace-pre-line hover:text-grey-500 py-2 border-b-2" href="#">All (543)</a>
  <a class="text-grey-400 font-medium no-underline whitespace-pre-line hover:text-grey-500 py-2" href="#">Infra Tech (184)</a>
  <a class="text-grey-400 font-medium no-underline whitespace-pre-line hover:text-grey-500 py-2" href="#">dApp Tech (184)</a>
  <a class="text-grey-400 font-medium no-underline whitespace-pre-line hover:text-grey-500 py-2" href="#">Community (43)</a>
  <a class="text-grey-400 font-medium no-underline whitespace-pre-line hover:text-grey-500 py-2" href="#">Building  Gitcoin (10)</a>
  <a class="text-grey-400 font-medium no-underline whitespace-pre-line hover:text-grey-500 py-2" href="#">NFTs (3)</a>
  <a class="text-grey-400 font-medium no-underline whitespace-pre-line hover:text-grey-500 py-2" href="#">dGov (17)</a>
</div>



<!--button-->
<br /><br />
<button class="uppercase font-medium bg-grey-500 text-white px-8 py-4 hover:bg-grey-400">Click me</button>

<!--link-->
<br /><br />
<a href="#">Im a link</a>



  


<!-- grid of grant cards -->
<br /><br /><br /><br />









<section class="px-12 py-12 pb-24 grid gap-x-12 gap-y-12 grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 border-b border-grey-100">


  <figure class="group">
    <div class="relative">
      <img class="shadow-light" src="http://placekitten.com/1920/1080?image=1">
      <div class="hidden group-hover:block">
        <div class="absolute flex justify-evenly w-full bottom-0 bg-white border-b-2 border-t-2 border-grey-400 py-8 bg-white">
          <img class="cursor-pointer" src="http://placekitten.com/32/32?image=7">
          <img class="cursor-pointer" src="http://placekitten.com/32/32?image=8">
          <img class="cursor-pointer" src="http://placekitten.com/32/32?image=9">
        </div>
      </div>
    </div>
    <figcaption class="mt-4">
      <div class="text-grey-500 font-medium truncate">Gitcoin Grants Official Matching Pool Fund</div>
      <div><span class="text-grey-400">by</span><a class="ml-1" href="#">0xff…ffff</a></div>
      <div><span class="text-grey-400">Raised:</span><span class="ml-1">315.355 USD</span></div>
    </figcaption>
  </figure>




  <figure>
    <a href="#" class="no-underline">
      <img class="shadow-light" src="http://placekitten.com/1920/1080?image=2" alt="">
      <figcaption class="mt-4">
        <div class="text-grey-500 font-medium truncate">Gitcoin Grants Official Matching Pool Fund</div>
        <div><span class="text-grey-400">by</span><a class="ml-1" href="#">0xff…ffff</a></div>
        <div><span class="text-grey-400">Raised:</span><span class="ml-1">315.355 USD</span></div>
      </figcaption>
    </a>
  </figure>

  <figure>
    <a href="#" class="no-underline">
      <img class="shadow-light" src="http://placekitten.com/1920/1080?image=3" alt="">
      <figcaption class="mt-4">
        <div class="text-grey-500 font-medium truncate">Gitcoin Grants Official Matching Pool Fund</div>
        <div><span class="text-grey-400">by</span><a class="ml-1" href="#">0xff…ffff</a></div>
        <div><span class="text-grey-400">Raised:</span><span class="ml-1">315.355 USD</span></div>
      </figcaption>
    </a>
  </figure>

  <figure>
    <a href="#" class="no-underline">
      <img class="shadow-light" src="http://placekitten.com/1920/1080?image=4" alt="">
      <figcaption class="mt-4">
        <div class="text-grey-500 font-medium truncate">Gitcoin Grants Official Matching Pool Fund</div>
        <div><span class="text-grey-400">by</span><a class="ml-1" href="#">0xff…ffff</a></div>
        <div><span class="text-grey-400">Raised:</span><span class="ml-1">315.355 USD</span></div>
      </figcaption>
    </a>
  </figure>    

  <figure>
    <a href="#" class="no-underline">
      <img class="shadow-light" src="http://placekitten.com/1920/1080?image=5" alt="">
      <figcaption class="mt-4">
        <div class="text-grey-500 font-medium truncate">Gitcoin Grants Official Matching Pool Fund</div>
        <div><span class="text-grey-400">by</span><a class="ml-1" href="#">0xff…ffff</a></div>
        <div><span class="text-grey-400">Raised:</span><span class="ml-1">315.355 USD</span></div>
      </figcaption>
    </a>
  </figure>    

  <figure>
    <a href="#" class="no-underline">
      <img class="shadow-light" src="http://placekitten.com/1920/1080?image=6" alt="">
      <figcaption class="mt-4">
        <div class="text-grey-500 font-medium truncate">Gitcoin Grants Official Matching Pool Fund</div>
        <div><span class="text-grey-400">by</span><a class="ml-1" href="#">0xff…ffff</a></div>
        <div><span class="text-grey-400">Raised:</span><span class="ml-1">315.355 USD</span></div>
      </figcaption>
    </a>
  </figure>      

</section>



<br /><br /><br /><br /><br /><br /><br /><br />











</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Ui',
});
</script>

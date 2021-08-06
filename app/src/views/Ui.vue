<template>
  <!-- navigation -->
  <nav class="flex items-center gap-x-4 md:gap-x-8 h-28 mx-4 text-grey-400" style="z-index: 9999;">
    <!-- logo + menu - this is a group to use group-hover:block for the absolute hidden menu line 29-39 -->
    <div class="group">
      <!-- this is the relative always there logo+text+arrow part -->
      <div class="relative">
        <!--logo + text + arrow -->
        <div class="font-medium flex items-center h-14 cursor-pointer">
          <!-- img -->
          <div>
            <img class="icon-large" src="../assets/logo.svg" />
          </div>
          <!--txt-->
          <div class="ml-4 hidden md:block">
            <big>
            <span class="text-teal">d</span><span class="text-grey-500">GRANTS</span></big>
          </div>
          <!--arrow-->
          <div class="ml-1">
            <img class="icon-small" src="http://placekitten.com/64" />
          </div>
        </div>
      </div>

      <!-- menu - this is the absolute menu what should apear on hover over the relative part line 10-27 -->
      <div class="absolute hidden left-20 group-hover:block"  style="z-index: 9999;">
        <div
          class="border border-grey-400 p-6 pr-10 bg-white text-grey-400 flex flex-col gap-y-2 uppercase font-medium"
        >
          <div class="text-grey-500">grants</div>
          <div class="cursor-pointer hover:text-grey-500">rounds</div>
          <div class="cursor-pointer hover:text-grey-500">collections</div>
          <!-- seperator -->
          <div class="border-b border-grey-400 my-4"></div>
          <div class="cursor-pointer hover:text-grey-500">about</div>
        </div>
      </div>
    </div>
    <!-- group end-->

    <!-- cart -->
    <div class="ml-auto flex items-center gap-x-2 h-14 group cursor-pointer">
      <!--text-->
      <div class="hidden md:block group-hover:text-grey-500">Cart</div>
      <!--icon-->
      <div>
        <img class="icon" src="http://placekitten.com/64" />
      </div>
      <!--in cart number-->
      <div class="group-hover:text-grey-500">12</div>
    </div>

    <!--seperator-->
    <div class="border-r border-grey-100 h-14"></div>

    <!-- web3:connected : show this-->
    <div class="flex items-center h-16 gap-x-2 group cursor-pointer">
      <!--text-->
      <div class="hidden md:block group-hover:text-grey-500">0x7099…79C8</div>
      <!--image-->
      <div>
        <img class="icon" src="http://placekitten.com/64?image=3" />
      </div>
      <!--arrow-->
      <div>
        <img class="icon-small" src="http://placekitten.com/64" />
      </div>
    </div>

    <!-- web3: not connected : show this-->
    <div class="flex items-center h-14 gap-x-2 group cursor-pointer">
      <!--text-->
      <div class="hidden md:block group-hover:text-grey-500">Connect</div>
      <!--image-->
      <div>
        <img class="icon" src="http://placekitten.com/64" />
      </div>
    </div>
  </nav>

  <!-- header 
  with headline
  with optional absolute left right navigation 
  with optional breadcrumb navigation 
  with optional second headline
  with optional metadata "by {address}" + "last seen/update" + humanized timestamp
  with optional "quote" ( for a public collection of a user ) 
-->
  <header class="px-12 py-20 border-b border-grey-100 text-center relative">
    <!-- optional breadcrumb within a header -->
    <div class="flex flex-wrap justify-center mb-8">
      <a class="no-underline flex items-center" href="#">
        <span class="uppercase font-medium text-grey-400 truncate hover:text-grey-500">dgrants</span>
        <img class="icon-small mx-4" src="http://placekitten.com/64" />
      </a>

      <a class="no-underline flex items-center" href="#">
        <span class="uppercase font-medium text-grey-400 truncate hover:text-grey-500">collections (4949)</span>
        <img class="icon-small mx-4" src="http://placekitten.com/64" />
      </a>

      <a class="no-underline flex items-center" href="#">
        <span class="uppercase font-medium text-grey-400 truncate hover:text-grey-500">#432</span>
        <img class="icon-small mx-4" src="http://placekitten.com/64" />
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
    <p class="intent italic mt-8 mx-auto max-w-6xl">
      “Im a paragraph but with intent. <a href="#">link</a> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
      diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
      accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor
      sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
      labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
      Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.”
    </p>

    <!-- optional navigation to jump to next item in a list -->
    <nav class="inline p-6 bg-pink absolute right-0" style="top: 50%; transform: translateY(-50%)">
      <img class="icon" src="http://placekitten.com/64" />
    </nav>
    <nav class="inline p-6 bg-pink absolute left-0" style="top: 50%; transform: translateY(-50%)">
      <img class="icon" src="http://placekitten.com/64" />
    </nav>
  </header>

  <!-- section header / divider ( whats a good name ? )
  - with optional right button 
  - with optional submenu per item
-->
  <div class="px-12 pt-16 pb-8 border-b border-grey-100">
    <div class="block md:flex gap-x-8">
      <div class="flex flex-wrap content-center gap-x-8">
        <!-- text + (number) -->
        <div class="cursor-pointer uppercase font-medium">active rounds<span class="ml-2 text-grey-400">(3)</span></div>
        <!-- text + (number) -->
        <div class="cursor-pointer uppercase font-medium">all rounds<span class="ml-2 text-grey-400">(5)</span></div>
        <!-- label : text -->
        <div class="cursor-pointer uppercase font-medium"><span class="text-grey-400 mr-2">round:</span>gr11</div>
        <!-- label : text -->
        <div class="cursor-pointer uppercase font-medium"><span class="text-grey-400 mr-2">curation:</span>on</div>
        <!-- label : text + SUBMENU -->
        <div class="group cursor-pointer uppercase font-medium">
          <div class="relative"><span class="text-grey-400 mr-2">click me:</span>shuffle</div>
          <!-- menu -->
          <div class="absolute hidden group-hover:block">
            <div
              class="
                border border-grey-400
                p-6
                pr-10
                bg-white
                text-grey-400
                flex flex-col
                gap-y-2
                uppercase
                font-medium
              "
            >
              <div class="text-grey-500">newest</div>
              <div class="hover:text-grey-500 cursor-pointer">shuffle</div>
              <div class="hover:text-grey-500 cursor-pointer">oldest</div>
              <div class="hover:text-grey-500 cursor-pointer">random</div>
              <!-- seperator -->
              <div class="border-b border-grey-400 my-4"></div>
              <div class="hover:text-grey-500 cursor-pointer">something</div>
            </div>
          </div>
        </div>
      </div>
      <!--optional button -->
      <div class="mt-4 md:mt-0 ml-auto">
        <button class="whitespace-nowrap uppercase font-medium bg-grey-500 text-white px-8 py-4 hover:bg-grey-400">
          im optional
        </button>
      </div>
    </div>
  </div>

  <!-- grant description paragraph with some intent-->
  <div class="border-b border-grey-100">
    <p class="intent px-12 py-12 mx-auto max-w-6xl">
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
    <span
      class="
        cursor-pointer
        text-grey-500
        font-medium
        no-underline
        whitespace-pre-line
        hover:text-grey-500
        py-2
        border-b-2
      "
      >All (543)</span
    >
    <span
      class="cursor-pointer text-grey-400 font-medium no-underline whitespace-pre-line hover:text-grey-500 py-2"
      >Infra Tech (184)</span
    >
    <span
      class="cursor-pointer text-grey-400 font-medium no-underline whitespace-pre-line hover:text-grey-500 py-2"
      >dApp Tech (184)</span
    >
    <span
      class="cursor-pointer text-grey-400 font-medium no-underline whitespace-pre-line hover:text-grey-500 py-2"
      >Community (43)</span
    >
    <span
      class="cursor-pointer text-grey-400 font-medium no-underline whitespace-pre-line hover:text-grey-500 py-2"
      >Building Gitcoin (10)</span
    >
    <span
      class="cursor-pointer text-grey-400 font-medium no-underline whitespace-pre-line hover:text-grey-500 py-2"
      >NFTs (3)</span
    >
    <span
      class="cursor-pointer text-grey-400 font-medium no-underline whitespace-pre-line hover:text-grey-500 py-2"
      >dGov (17)</span
    >
  </div>

  <!-- grid of grant cards -->
  <br /><br /><br /><br />

  <section
    class="
      px-12
      py-12
      pb-24
      grid
      gap-x-12 gap-y-12
      grid-cols-1
      md:grid-cols-2
      lg:grid-cols-3
      xl:grid-cols-4
      border-b border-grey-100
    "
  >
    <!-- grant card -->
    <figure class="group cursor-pointer">
      <div class="relative">
        <img class="shadow-light" src="http://placekitten.com/1920/1080?image=1" />
        <div class="hidden group-hover:block">
          <div
            class="
              absolute
              flex
              justify-center
              gap-x-12
              w-full
              bottom-0
              bg-white
              border-b-2 border-t-2 border-grey-400
              py-8
              bg-white
            "
          >
            <img class="icon cursor-pointer" src="http://placekitten.com/64" />
            <img class="icon cursor-pointer" src="http://placekitten.com/64" />
            <img class="icon cursor-pointer" src="http://placekitten.com/64" />
          
          </div>
        </div>
      </div>
      <figcaption class="mt-4">
        <div class="text-grey-500 font-medium truncate">Gitcoin Grants Official Matching Pool Fund</div>
        <div><span class="text-grey-400">by</span><a class="ml-1" href="#">0xff…ffff</a></div>
        <div><span class="text-grey-400">Raised:</span><span class="ml-1">315.355 USD</span></div>
      </figcaption>
    </figure>

  </section>




  <br /><br /><br />

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

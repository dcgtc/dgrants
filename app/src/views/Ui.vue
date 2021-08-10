<template>

  <!-- take the codebase of this documents "fragments"
    and make components out of it by copy the fragments
    into new files in /components and make it modular with 
    params / logic . then remove the code-part from here
    and replace it with the <Component params="value" />
    so richard can continue finetune it along the way,
    and we can start build views from that components
  -->




  <!----------------------------------------------- NAVIGATION 
  with: logo + text + arrow + menu
  with optional : cart ( text + icon + number )
  with optional : web3-connected ( address + identicon + arrow + menu )
  with optional : web3-not-connected ( text + icon )
  -->
  <nav class="flex items-center gap-x-4 md:gap-x-8 h-28 mx-4 text-grey-400" style="z-index: 9999;">
    <!-- logo + menu -->
    <div class="group">
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

      <!-- main menu-->
      <div class="absolute hidden left-2 md:left-20 group-hover:block"  style="z-index: 9999;">
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
      <svg class="icon" xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64" fill="none"><path d="M12 44a48.53 48.53 0 0 0 20 4 48.53 48.53 0 0 0 20-4c-4-20-4-32-20-32S16 24 12 44z"/><line x1="32" y1="8" x2="32" y2="12"/><path d="M24 47.41V48a8 8 0 0 0 16 0v-.59"/></svg>
      <!--in cart number-->
      <div class="group-hover:text-grey-500">12</div>
    </div>

    <!--seperator-->
    <div class="border-r border-grey-100 h-14"></div>

    <!-- web3:connected : show this-->
    <div class="group">

      <!--navigation part-->
      <div class="relative flex items-center h-16 gap-x-2 group cursor-pointer">
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

      <!-- menu-->
      <div class="absolute hidden right-2 md:right-20 group-hover:block"  style="z-index: 9999;">
        <div
          class="border border-grey-400 p-6 pr-10 bg-white text-grey-400 flex flex-col gap-y-2 uppercase font-medium"
        >
          <div>0xff…ffff</div>
          <div>1337 ETH</div>
          <div class="border-b border-grey-400 my-4"></div>
          <div class="cursor-pointer hover:text-grey-500 flex">profile</div>
          <div class="cursor-pointer hover:text-grey-500 flex">favorites<span class="pl-4 ml-auto">32</span></div>
          <div class="cursor-pointer hover:text-grey-500 flex">my grants<span class="pl-4 ml-auto">32</span></div>
          <div class="cursor-pointer hover:text-grey-500 flex">settings</div>
          <div class="border-b border-grey-400 my-4 flex"></div>
          <div class="cursor-pointer hover:text-grey-500 flex">change wallet</div>
          <div class="cursor-pointer hover:text-grey-500 flex">disconnect wallet</div>
        </div>
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

  <!----------------------------------------------- HEADER  
  with headline
  with optional absolute left right navigation 
  with optional breadcrumb navigation 
  with optional second headline
  with optional metadata "by {address}" + "last seen/update" + humanized timestamp
  with optional "quote" ( for a public collection of a user ) 
  -->
  <header class="px-4 md:px-12 py-20 border-b border-grey-100 text-center relative">
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


  <!----------------------------------------------- SECTION HEADER / DIVIDER 
  ( whats a good name for this element ? )  
  - with optional right button 
  - with optional submenu per item
  -->
  <div class="px-4 md:px-12 pt-16 pb-8 border-b border-grey-100">
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

  <!----------------------------------------------- GRANT DESCRIPTION  
  - a paragraph with some intent for better typography - for now probably just
  gona used for the round and grant detail page
  -->
  <div class="border-b border-grey-100">
    <p class="intent px-4 md:px-12 py-12 mx-auto max-w-6xl">
      Im a paragraph but with intent. <a href="#">link</a> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
      diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
      accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor
      sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut
      labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum.
      Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
    </p>
  </div>

  <!----------------------------------------------- TAB BAR   
  - with active state ( see first "all") classes vs other clases 
  -->
  <div class="px-4 md:px-12 py-6 border-b border-grey-100 flex flex-wrap gap-x-10 gap-y-2">
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

<!----------------------------------------------- CARD GRID FOR ROUNDS AND GRANTS  -->


  <section
    class="
      px-4 md:px-12
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


<!----------------------------------------------- GRANT CARD   
- with 3 icons just for test . we might just need one later on 
-->

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

<!----------------------------------------------- BUTTON 
  -->
  <br /><br />
  <button class="uppercase font-medium bg-grey-500 text-white px-8 py-4 hover:bg-grey-400">Click me</button>




<br/><br/><br/><br/><br/>


<!----------------------------------------------- CART TOP BAR ( maybe not call it cart top bar and keep it generic,
    its probably a bar full of interactions like share, delete, save ... ) 
  -->

  <div class="px-4 md:px-12 py-8 border-b border-grey-100 flex gap-x-8 ">

    <div class="group flex items-center gap-x-4 text-grey-400 cursor-pointer">
      <img class="icon cursor-pointer" src="http://placekitten.com/64" />
      <span class="group-hover:text-grey-500 hidden md:block">Save as Collection</span>
    </div>

    <div class="group flex items-center gap-x-4 text-grey-400 cursor-pointer">
      <img class="icon cursor-pointer" src="http://placekitten.com/64" />
      <span class="group-hover:text-grey-500 hidden md:block">Share Cart</span>
    </div>

    <div class="group flex items-center gap-x-4 text-grey-400 cursor-pointer ml-auto">
      <img class="icon cursor-pointer" src="http://placekitten.com/64" />
      <span class="group-hover:text-grey-500 hidden md:block">Clear Cart</span>      
    </div>
  </div>



<br/><br/><br/><br/><br/>






<!----------------------------------------------- A CART ITEM V3-->

<div class="px-4 md:px-12">
  <div class="py-8 border-b border-grey-100">

    <div class="grid grid-flow-col items-center gap-x-8">

      <div>

        <div class="grid grid-cols-4 items-center gap-x-8 gap-y-4 ">
          <!-- image -->
          <div class="col-span-4 lg:col-span-1">
            <figure class="max-w-lg">
              <img class="shadow-light" src="http://placekitten.com/1920/1080?image=1" />
            </figure>
          </div>
          <!-- text -->
          <div class="col-span-4 lg:col-span-1">
              <div>DeFi Developer Roadmap V3</div>
          </div>
          <!-- input -->
          <div class="col-span-4 lg:col-span-1">
            <div class="flex">
              <input class="right w-36" type="number" placeholder="0">
              <select name="token" class="border-l-0 w-36">
                <option value="eth">ETH</option>
                <option value="dai">DAI</option>
                <option value="gtc">GTC</option>
                <option value="weth">WETH</option>
              </select>
            </div>              
          </div>   
          <!-- matching -->  
          <div class="col-span-4 lg:col-span-1">
              <div class="text-grey-400">not in an active round</div>
          </div>
        </div>

      </div>  

      <div class="justify-self-end bg-pink">
         <img class="icon cursor-pointer" src="http://placekitten.com/64" />
      </div>   

    </div>


  </div>
</div>









<br/><br/><br/><br/><br/><br/>


<!----------------------------------------------- A SINGLE INPUT
with optional delete item  -->

<div class="px-4 md:px-12 py-8 border-b border-grey-100">
  <div class="grid grid-cols-12 items-center gap-x-8">

    <!-- label -->
    <div class="col-span-12 md:col-span-3 mb-3 md:mb-0">
      <label for="" class="text-grey-400">Website:</label>
    </div>

    <!-- input -->
    <div class="col-span-10 md:col-span-7">
      <input type="text" placeholder="https://">
    </div>

    <!-- optional delete icon -->
    <div class="col-span-2 justify-self-end">
      <img class="icon cursor-pointer" src="http://placekitten.com/64" />
    </div>

  </div>
</div>





<!----------------------------------------------- A DROPDOWN INPUT
with optional delete item  -->

<div class="px-4 md:px-12 py-8 border-b border-grey-100">
  <div class="grid grid-cols-12 items-center gap-x-8">

    <!-- label -->
    <div class="col-span-12 md:col-span-3 mb-3 md:mb-0">
      <label for="" class="text-grey-400">Category:</label>
    </div>

    <!-- input -->
    <div class="col-span-10 md:col-span-7">
      <select name="token">
        <option value="community">Community</option>
        <option value="infrastructure">Infrastructure</option>
      </select>
    </div>

    <!-- optional delete icon -->
    <div class="col-span-2 justify-self-end">
      <img class="icon cursor-pointer" src="http://placekitten.com/64" />
    </div>

  </div>
</div>










<!----------------------------------------------- A SINGLE INPUT
but wrapped into another div for "groups of elements see figma "
its basicaly removing the "px-4 md:px-12" from div but put it in an extra
div arround it ...

with optional delete item -->

<div class="px-4 md:px-12">

  <div class="py-8 border-b border-grey-100">
    <div class="grid grid-cols-12 items-center gap-x-8">

      <!-- label -->
      <div class="col-span-12 md:col-span-3 mb-3 md:mb-0">
        <label for="" class="text-grey-400">Website:</label>
      </div>

      <!-- input -->
      <div class="col-span-10 md:col-span-7">
          <input type="text" placeholder="https://">
      </div>

      <!-- optional delete icon -->
      <div class="col-span-2 justify-self-end">
        <img class="icon cursor-pointer" src="http://placekitten.com/64" />
      </div>

    </div>
  </div>

</div>















<br/><br/><br/><br/><br/><br/>




<!----------------------------------------------- transaction status  -->

<div class="px-4 md:px-12 py-8 border-b border-grey-100">
  <div class="grid grid-cols-12 items-center gap-x-8">
    <div class="col-span-12 md:col-span-3 mb-3 md:mb-0">
      <span class="text-grey-400">Hash:</span>
    </div>
    <div class="col-span-12 md:col-span-9">
      <div class="break-all"><a href="#">0xd510ef6c442fc967436e0bcaf0837ab372eced86fda84b04958b5e315f0a083a</a></div>
    </div>
  </div>
</div>


<!----------------------------------------------- transaction pending  -->

<div class="px-4 md:px-12 py-8 border-b border-grey-100">
  <div class="grid grid-cols-12 items-center gap-x-8">
    <div class="col-span-12 md:col-span-3 mb-3 md:mb-0">
      <span class="text-grey-400">Status:</span>
    </div>
    <div class="col-span-12 md:col-span-9">
      <div class="my-4">
        <span class="uppercase px-8 py-4 border-2 border-grey-400 text-grey-400 font-medium mr-4">pending</span>
        Pending since 37 sec
      </div>
    </div>
  </div>
</div>

<!----------------------------------------------- transaction sucess  -->

<div class="px-4 md:px-12 py-8 border-b border-grey-100">
  <div class="grid grid-cols-12 items-center gap-x-8">
    <div class="col-span-12 md:col-span-3 mb-3 md:mb-0">
      <span class="text-grey-400">Status:</span>
    </div>
    <div class="col-span-12 md:col-span-9">
      <div class="my-4">
        <span class="uppercase px-8 py-4 border-2 border-teal text-teal font-medium mr-4">success</span>
        Confirmed within 37 sec
      </div>
    </div>
  </div>
</div>

<!----------------------------------------------- transaction failed  -->

<div class="px-4 md:px-12 py-8 border-b border-grey-100">
  <div class="grid grid-cols-12 items-center gap-x-8">
    <div class="col-span-12 md:col-span-3 mb-3 md:mb-0">
      <span class="text-grey-400">Status:</span>
    </div>
    <div class="col-span-12 md:col-span-9">
      <div class="my-4">
        <span class="uppercase px-8 py-4 border-2 border-pink text-pink font-medium mr-4">fail</span>
        Confirmed within 37 sec
      </div>
    </div>
  </div>
</div>


<br/><br/><br/><br/><br/><br/>



<!----------------------------------------------- grants detail page image+core stats ( that element under header )  -->

<div class="border-b border-grey-100">

  <div class="grid grid-cols-4 gap-8">
    <!-- img -->
    <div class="col-span-4 xl:col-span-2">
      <img class="shadow-light" src="http://placekitten.com/1920/1080?image=1" />
    </div>
    <!-- raised, contract, round, matching -->
    <div class="col-span-4 md:col-span-2 xl:col-span-1 mb-8 xl:mb-0">
      <div class="px-4 xl:px-0 ">
        <div><span class="text-grey-400 mr-4">Raised:</span>1337 USD</div>
        <div><span class="text-grey-400 mr-4">Contract:</span><a href="">0xff…ffff</a></div>
        <div><span class="text-grey-400 mr-4">In Round:</span><a href="">GR11</a></div>
        <div><span class="text-grey-400 mr-4">Matching:</span><a href="">Quadratic</a></div>
      </div>
    </div>
    <!-- add to cart, matching example -->
    <div class="col-span-4 md:col-span-2 xl:col-span-1">
      <div class="px-4 xl:px-12 md:text-right mb-8 xl:mb-0">
        <div class="mb-4">
          <button class="whitespace-nowrap uppercase font-medium bg-grey-500 text-white px-8 py-4 hover:bg-grey-400">add to cart</button>
        </div>
        <div>
          <div>1 USD ≈ 32 USD Matching</div>
          <div>10 USD ≈ 83 USD Matching</div>
        </div>
      </div>      
    </div>
  </div>

</div>

<!-- interaction bar -->
<div class="px-4 md:px-12 py-8 border-b border-grey-100">
  <div class="flex flex-wrap gap-x-12 gap-y-4">
    <div class="flex items-center gap-4">
      <img class="icon cursor-pointer" src="http://placekitten.com/64" />
      <span>Share</span>
    </div>

    <div class="flex items-center gap-4">
      <img class="icon cursor-pointer" src="http://placekitten.com/64" />
      <span>Favorites</span>
    </div>

    <div class="flex items-center gap-4">
      <img class="icon cursor-pointer" src="http://placekitten.com/64" />
      <span>Collection</span>
    </div>


  </div>
</div>






<br/><br/><br/><br/><br/><br/>





</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'Ui',
});
</script>

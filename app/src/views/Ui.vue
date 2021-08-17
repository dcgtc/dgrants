<template>
  <!--
* @richard : these components are all hardcoded
* and need to get props / data logic.
-->

  <ImageRow
    label="Image 1:"
    imgsrc="http://placekitten.com/1920/1200?image=1"
    filename="0x32bc27d24ec86a23e8a52208935e7fa.png"
  />
  <ImageRow
    label="Image 2:"
    imgsrc="http://placekitten.com/1920/1200?image=2"
    filename="0x32bc27d24ec86a23e8a52208935e7fa.png"
  />
  <ImageRow
    label="Avatar:"
    imgsrc="http://placekitten.com/1024/1024?image=3"
    filename="0x32bc27d24ec86a23e8a52208935e7fa.png"
  />
  <ImageRow
    label="Grant Thumbnail:"
    imgsrc="http://placekitten.com/1920/1080?image=4"
    filename="0x32bc27d24ec86a23e8a52208935e7fa.png"
  />

  <!--
*
*
-->

  <div class="bg-pink">BaseHeader</div>
  <BaseHeader />

  <!--
*
*
-->

  <div class="bg-pink">CartItem</div>
  <CartItem />

  <!--
*
*
-->

  <div class="bg-pink">ActionsNav</div>
  <ActionsNav />

  <!--
*
*
-->

  <div class="bg-pink">BaseFilterNav</div>
  <BaseFilterNav />

  <!--
*
*
-->

  <!-- i could not name it BaseSectionTitle - got errors on it. 
  didnt get the concept of slots need help to do this right -->
  <div class="bg-pink">BaseTitle</div>
  <BaseTitle />

  <!--
*
*
-->

  <div class="bg-pink">BaseTabs</div>
  <BaseTabs />

  <!--
*
*
-->

  <div class="bg-pink">GrantCard ( in a Grid )</div>
  <section
    class="
      px-4
      md:px-12
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
    <GrantCard /><GrantCard /><GrantCard /><GrantCard /><GrantCard /><GrantCard /><GrantCard /><GrantCard />
  </section>

  <!--
*
*
-->

  <div class="bg-pink">RoundCard ( in a Grid )</div>
  <section
    class="
      px-4
      md:px-12
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
    <RoundCard /><RoundCard /><RoundCard /><RoundCard />
  </section>

  <!--
*
*
-->

  <div class="bg-pink">ContributionRow</div>
  <ContributionRow />

  <!--
*
*
-->

  <div class="bg-pink">GrantDetailsRow</div>
  <GrantDetailsRow />

  <!--
*
*
-->

  <div class="bg-pink">RoundDetailsRow</div>
  <RoundDetailsRow />

  <!--
* a row of LABEL + INPUT 
* props : 
* deletable: Boolean // show X icon to the right
* toggleable: Boolean // show toggleable button to the right ( can not combined with deletable ! )
* intended: Boolean // intend the row a bit for grouped inputs
* text: String // optional helping text for an input
-->

  <div class="bg-pink">InputRow</div>

  <InputRow :deleteable="true" :intended="false" text="im optional helping text">
    <template v-slot:label>Website:</template>
    <template v-slot:input>
      <input type="text" placeholder="https://" />
    </template>
  </InputRow>

  <InputRow :deleteable="false" :intended="false">
    <template v-slot:label>Category:</template>
    <template v-slot:input>
      <select name="token" class="">
        <option>eth</option>
        <option>dai</option>
        <option>wai</option>
        <option>weth</option>
        <option>pan</option>
      </select>
    </template>
  </InputRow>

  <InputRow :deleteable="false" :intended="true">
    <template v-slot:label>intended:</template>
    <template v-slot:input> im an intended row but not deletable </template>
  </InputRow>

  <InputRow :deleteable="false" :intended="true">
    <template v-slot:label>Drag and Drop Area:</template>
    <template v-slot:input><Dropzone /></template>
  </InputRow>

  <InputRow :deleteable="true" :intended="true">
    <template v-slot:label>intended:</template>
    <template v-slot:input> im an intended row and deletable </template>
  </InputRow>

  <InputRow :deleteable="true" :intended="true">
    <template v-slot:label>intended:</template>
    <template v-slot:input> im an intended row and deletable </template>
  </InputRow>

  <InputRow
    :deleteable="false"
    :intended="false"
    :toggleable="true"
    text="Select a Platform and enter your Handle on this platform."
  >
    <template v-slot:label>platform:</template>
    <template v-slot:input>
      <select name="platform" class="w-1/2">
        <option value="gitcoin">Gitcoin</option>
        <option value="github">Github</option>
      </select>
      <input class="right w-1/2 border-l-0" type="text" placeholder="handle" />
    </template>
  </InputRow>

  <!--
*
*
-->

  <div class="bg-teal">HTML-Fragment : Grant Description</div>
  <!----------------------------------------------- GRANT DESCRIPTION  -->
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

  <!--
*
*
-->

  <div class="bg-teal">HTML-Fragment : Transaction Status</div>
  <!----------------------------------------------- transaction status -->
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

  <!--
*
*
-->

  <div class="bg-teal">HTML-Fragment : Transaction Pending</div>
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

  <!--
*
*
-->

  <div class="bg-teal">HTML-Fragment : Transaction Success</div>
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

  <!--
*
*
-->

  <div class="bg-teal">HTML-Fragment : Transaction Failed</div>
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

  <!--
*
*
-->

  <div class="bg-teal">autocomplete dropdown - unsure cause not suported by tailwind/forms in styling the arrow</div>
  <!-- theres a native html autocomplete thingy we could use for tokens
  but tailfind/forms not support it in styles, and im not sure if i like it 
  i wrote an issue https://github.com/tailwindlabs/tailwindcss/discussions/5187 -->

  <div>
    <datalist id="tokens">
      <option>eth</option>
      <option>dai</option>
      <option>wai</option>
      <option>weth</option>
      <option>pan</option>
    </datalist>
    <input type="text" autoComplete="on" list="tokens" placeholder="eth" />
  </div>

  <!--
* 
*
-->

  <div class="bg-teal">button examples</div>

  <div class="flex flex-wrap gap-8">
    <button class="btn">textbutton</button>

    <button class="btn">
      <CollectionIcon />
      <span>with icon</span>
    </button>

    <button class="btn disabled">textbutton</button>
  </div>

  <br /><br /><br /><br /><br /><br /><br /><br /><br /><br />

  <!--
* 
*
--></template>

<script lang="ts">
import { defineComponent } from 'vue';

//components
import BaseHeader from 'src/components/BaseHeader.vue';
import BaseFilterNav from 'src/components/BaseFilterNav.vue';
import BaseTitle from 'src/components/BaseTitle.vue';
import BaseTabs from 'src/components/BaseTabs.vue';
import GrantCard from 'src/components/GrantCard.vue';
import RoundCard from 'src/components/RoundCard.vue';
import ActionsNav from 'src/components/ActionsNav.vue';
import ContributionRow from 'src/components/ContributionRow.vue';
import CartItem from 'src/components/CartItem.vue';
import GrantDetailsRow from 'src/components/GrantDetailsRow.vue';
import RoundDetailsRow from 'src/components/RoundDetailsRow.vue';
import InputRow from 'src/components/InputRow.vue';
import Dropzone from 'src/components/Dropzone.vue';
import ImageRow from 'src/components/ImageRow.vue';

// icons
import { ViewListIcon as CollectionIcon } from '@fusion-icons/vue/interface';

export default defineComponent({
  name: 'Ui',
  components: {
    CollectionIcon,
    BaseHeader,
    BaseFilterNav,
    BaseTitle,
    BaseTabs,
    GrantCard,
    RoundCard,
    ActionsNav,
    ContributionRow,
    CartItem,
    GrantDetailsRow,
    RoundDetailsRow,
    InputRow,
    Dropzone,
    ImageRow,
  },
});
</script>

<!----- toto : 

- spread x eth to y grants banner thingy
- links list for grants and rounds
- jazzicon images - post on discord about this error
- animate the logo
- button disabled / state / normal state / icon state 
- fullscreen loading screen toggable like about page


-->

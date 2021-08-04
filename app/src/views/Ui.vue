<template>
  <!-- this is a modular base header. 
  if there is a subline, it displays it.
  if there is an address, it displays time, action, address ( by scco.eth last update 3 days ago )
  tbd: breadcrumb
  tbd: fusion icons left right IF NEEDED ( not on all headers needed )
  tbd: responsive things - works nice out of the box already.
  tbd: what if no left right arrow : then justify-between not work nice... just keep it but hide with opacity? or better way to align this so it works also without that nav ?
  -->

  <BaseHeader
    headline="Edit Collection"
    subline="“Best GR11 Gems”"
    address="gitcoin-dao.eth"
    action="updated"
    time="3 minutes ago"
    text="“Focus on infrastructure, and the organization of services. vidunt ut labore et dolore magna aliquyam erat, sed diam voluptua.”"
  />

  <h1>I am a Headline</h1>

  <p>
    Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore
    magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet clita kasd
    gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing
    elitr, sed diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero
    eos et accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum
    dolor sit amet.
  </p>

  <p class="intent">
    Im a paragraph but with intent. <a href="#">link</a> Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed
    diam nonumy eirmod tempor invidunt ut labore et dolore magna aliquyam erat, sed diam voluptua. At vero eos et
    accusam et justo duo dolores et ea rebum. Stet clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor
    sit amet. Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor invidunt ut labore
    et dolore magna aliquyam erat, sed diam voluptua. At vero eos et accusam et justo duo dolores et ea rebum. Stet
    clita kasd gubergren, no sea takimata sanctus est Lorem ipsum dolor sit amet.
  </p>

  <Button label="Click Me" />

  <a href="#">Im a link</a>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Button from 'src/components/Button.vue';
import BaseHeader from 'src/components/BaseHeader.vue';

export default defineComponent({
  name: 'Ui',
  components: { Button, BaseHeader },
});
</script>

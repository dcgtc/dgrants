<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style lang="scss">
  @import '/assets/css/vendor/bootstrap.min.css';

  #app {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    color: #2c3e50;
    margin-top: 32px;
    margin-bottom: 32px;
  }

  .loading {
    content: '';
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.3);
  }

  .spinner-border {
    @extend .spinner-border;
    height:4rem;
    width:4rem;
  }
</style>

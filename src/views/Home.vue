<template>
  <div id="main" class="d-flex justify-content-center align-items-center">
    <div id="nav">
      <router-link to="/payments"><button type="button" class="btn btn-primary">Go to Payments</button></router-link>
      <p></p>
      <router-link to="/shopping"><button type="button" class="btn btn-primary mt-4">Got to Shopping</button></router-link>
    </div>
  </div>
</template>

<script>

export default {
  name: 'home'
}
</script>

<style scope>
  #main {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }
</style>
<template>
  <div v-if="isDrizzleInitialized" id="app">
    <h1>Sign the Guestbook</h1>
    <drizzle-contract-form
      contractName="GrantRegistry"
      method="getGrants"
      :placeholders="['Grant']"
    />
    <h2>Guests:</h2>
    <ul v-if="getGrants">
      <li v-for="(grant, i) in getGrants" :key="i">{{ utils.toUtf8(grant) }}</li>
    </ul>
  </div>
  <div v-else>
    Loading application...
  </div>
</template>

<script>
import { mapGetters } from "vuex"
export default {
  name: "app",
  computed: {
    ...mapGetters("drizzle", ["drizzleInstance", "isDrizzleInitialized"]),
    ...mapGetters("contracts", ["getContractData"]),
    getNames() {
      let data = this.getContractData({
        contract: "GrantRegistry",
        method: "getGrants"
      });
      if (data === "loading") return false;
      return data
    },
    utils() {
      return this.drizzleInstance.web3.utils
    }
  },
  created() {
    this.$store.dispatch("drizzle/REGISTER_CONTRACT", {
      contractName: "GrantRegistry",
      method: "getGrants",
      methodArgs: []
    })
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

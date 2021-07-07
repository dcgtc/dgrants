<template>
    <div>
        <div class="mb-4">
            <router-link to="/">Home</router-link> |
            <router-link to="/grants">Grants</router-link>
        </div>
        <div>
            <form v-on:submit.prevent="">
                <div v-if="address" class='row mt-4 bg-light text-left p-4 border border-secondary'>
                  <GrantDetail v-for="(grant, index) in grants" :key="index" :gid="grant.id"
                  :owner="grant.owner" :payout="grant.payout" :metaPtr="grant.metaPtr" :state="grant.state" />
                </div>
            </form>
            <div v-if="!address" class='text-center mt-4 p-4 bg-light border border-secondary'>
                <router-link to="/grantExplorer"><h5>Please, load or create a GrantRegistry contract
                </h5></router-link>
            </div>
        </div>
        <div v-if="loading" class="loading d-flex justify-content-center align-items-center">
            <div class="spinner-border"  role="status">
                <span class="sr-only">Loading...</span>
            </div>
        </div>
    </div>
</template>

<script>
import { mapState } from 'vuex'; // Creates getter for properties in vuex state
import GrantDetail from './GrantDetail.vue';
import GrantService from '../domain/GrantService.js';

export default {
  name: 'GrantExplorer',
  props: {},
  computed: mapState({
    grants: (state) => state.grants,
    address: (state) => state.contract,
  }),
  async mounted() {
    const grants = await this.getGrants(this.address);
    this.$store.commit('setGrants', grants);
  },
  data() {
    return {
      loading: false,
    };
  },
  components: {
    GrantDetail,
  },
  methods: {
    async getGrants() {
      const grantService = new GrantService();
      const grants = await grantService.getAllGrants(this.address);
      debugger;
      return grants;
    },
  },
};
</script>

<style lang="scss" scoped>
</style>

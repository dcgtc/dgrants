<template>
    <div>
        <div class="mb-4">
            <router-link to="/">Home</router-link> |
            <router-link to="/grants">Grants</router-link>
        </div>
        <div>
            <GrantDetail v-for="(grant, index) in grants" :key="index" :name="grant.name" :description="grant.description" :price="grant.price" v-bind:image="grant.image" />
            <form v-on:submit.prevent="">
                <div v-if="address" class='row mt-4 bg-light text-left p-4 border border-secondary'>
                    <div class='col-sm text-right'>
                        <h3>Total {{ total }} eth</h3>
                    </div>
                    <div class='col-sm text-left'>
                        <button class="btn btn-primary" @click="pay">Proceed to payment</button>
                    </div>
                </div>
            </form>
            <div v-if="!address" class='text-center mt-4 p-4 bg-light border border-secondary'>
                <router-link to="/grantExplorer"><h5>Please, load or create a GrantRegistry contract </h5></router-link>
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
    total: (state) => state.grants.reduce((accumulator, currentValue) => (accumulator + Number(currentValue.units) * parseFloat(currentValue.price)), 0),
    address: (state) => state.contract,
  }),
  data() {
    return {
      loading: false,
    };
  },
  components: {
    GrantDetail,
  },
  methods: {
    async pay() {
      const address = this.$store.state.contract;
      const reference = `SC-${new Date().getTime()}`;
      const amount = this.$store.getters.totalAmount;

      const paymentsService = new PaymentsService();

      this.loading = true;
      try {
        await paymentsService.pay(address, reference, amount);
      } catch (e) {
        console.log(e);
      }
      this.loading = false;
      this.$store.commit('clearGrantUnits');
      this.$router.push('/grantExplorer');
    },
  },
};
</script>

<style lang="scss" scoped>
</style>

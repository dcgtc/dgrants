<template>
    <div>
        <div id="loadContract" class="d-flex justify-content-center align-items-center">
            <div class="text-center" style="width:60%">
            <button type="button" class="btn btn-primary mb-4" @click="createContract">
                Create grants contract
            </button>
            <hr>
            <input id="address" v-model="address" type="text" placeholder="Existing contract.." class="mr-3 mt-4" /><button type="button" class="btn btn-primary" @click="loadContract">Load</button>
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
import GrantService from '../domain/GrantService.js';

export default {
  name: 'GrantsLoad',
  data() {
    return {
      address: '',
      loading: false,
    };
  },
  methods: {
    async createContract() {
      const GrantService = new GrantService();
      this.loading = true;
      try {
        const contract = await GrantService.createContract();
        this.$store.commit('setContract', contract.options.address);
      } catch (e) {
        console.log(e);
      }
      this.loading = false;
    },
    loadContract() {
      this.$store.commit('setContract', this.address);
    },
  },
};
</script>

<style scoped>
    #address {
        width: 400px;
        height: 32px;
    }
    #loadContract {
        margin-top: 6em
    }
</style>

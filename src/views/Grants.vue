<template>
  <div class='container'>
    <div class="mb-4">
      <router-link to="/">Home</router-link> |
      <router-link to="/grantExplorer">Grant Explorer</router-link> |
      <a href="javascript:void(0)" @click="changeContract">Change Payments contract</a>
    </div>

    <GrantsLoad v-if="!hasContract" />
    <GrantDetail v-if="hasContract" />
  </div>
</template>

<script>
import GrantsLoad from '@/components/GrantsLoad.vue';
import GrantDetail from '@/components/GrantDetail.vue';

export default {
  name: 'Grants',
  components: {
    GrantsLoad,
    GrantDetail,
  },
  computed: {
    contract() {
      return this.$store.state.contract;
    },
    hasContract() {
      return (this.$store.state.contract);
    },
  },
  methods: {
    changeContract() {
      this.$store.commit('setContract', '');
    },
  },
};
</script>

<template>
  <div class='container'>
    <div class="mb-4">
      <router-link to="/">Home</router-link> |
      <router-link to="/shopping">Shopping Cart</router-link> |
      <a href="javascript:void(0)" @click="changeContract">Change Payments contract</a>
    </div>

    <PaymentsLoad v-if="!hasContract" />
    <PaymentsDetail v-if="hasContract" />
  </div>
</template>

<script>
import PaymentsLoad from '@/components/PaymentsLoad.vue'
import PaymentsDetail from '@/components/PaymentsDetail.vue'

export default {
  name: 'Payments',
  components: {
    PaymentsLoad,
    PaymentsDetail
  },
  computed: {
    contract: function() {
      return this.$store.state.contract
    },
    hasContract: function() {
      return (this.$store.state.contract)
    }
  },
  methods: {
    changeContract: function() {
      this.$store.commit('setContract', '')
    }
  }
}
</script>
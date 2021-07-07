<template>
    <div class="card mt-4">
        <div class="card-horizontal">
            <div class="img-square-wrapper">
                <h2 class="">ID: {{ gid }}</h2>
            </div>
            <div class="card-body">
                <h5 class="card-subtitle mb-3 text-muted text-left">Owner: {{ owner }}</h5>
                <p class="card-text text-left">Payout: {{ payout }}</p>
            </div>
        </div>
    </div>
</template>

<script>
export default {
  name: 'GrantDetail',
  props: {
    grant: Object,
    gid: String,
    owner: String,
    payout: String,
    state: Number,
    metaPtr: String,
  },
  data() {
    return {
      unitsX: 0,
    };
  },
  computed: {
    subtotal() {
      return this.units * parseFloat(this.price);
    },
    imagePath() {
      return `/assets/${this.image}`;
    },
    units: {
      get() {
        return this.$store.getters.getGrantUnits(this.name);
      },
      set(newValue) {
        this.$store.commit('setGrantUnits', { name: this.name, units: newValue });
      },
    },
  },
};
</script>

<style>
    .card-horizontal {
        display: flex;
        flex: 1 1 auto;
        padding: 8px;
    }
</style>

<template>
    <div class="card mt-4">
        <div class="card-horizontal">
            <div class="img-square-wrapper">
                <img class="" :src='imagePath' alt="Card image cap">
            </div>
            <div class="card-body">
                <h4 class="card-title text-left">{{ name }}</h4>
                <h5 class="card-subtitle mb-3 text-muted text-left">{{ price }} eth</h5>
                <p class="card-text text-left">{{ description }}</p>
                <div class="text-left">
                    <label class="mr-2 font-weight-bold">Number of kilogrames </label>
                    <select v-model='units' id='units'>
                        <option value=0>0</option>
                        <option v-for="index in 10" v-bind:key="index">{{ index }}</option>
                    </select>
                    <span v-if="units>0" class='ml-4'>{{ subtotal }} eth</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'FruitDetail',
    props:{
        fruit: Object,
        name: String,
        image: String,
        price: String,
        description: String
    },
    data: function() {
        return {
            unitsX: 0
        }
    },
    computed: {
        subtotal: function() {
            return this.units*parseFloat(this.price)
        },
        imagePath: function() {
            return '/assets/' + this.image
        },
        units: {
            get: function() {
                return this.$store.getters.getFruitUnits(this.name)
            },
            set: function(newValue) {
                this.$store.commit('setFruitUnits', {name: this.name, units: newValue})
            }
        }
    }
}
</script>

<style>
    .card-horizontal {
        display: flex;
        flex: 1 1 auto;
        padding: 8px;
    }
</style>
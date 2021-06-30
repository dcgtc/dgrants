<template>
    <div class='container'>
        <Basket />
    </div>
</template>

<script>
// @ is an alias to /src
import Basket from '@/components/Basket.vue'

export default {
  name: 'shoppingCart',
  components: {
    Basket
  }
}
</script>
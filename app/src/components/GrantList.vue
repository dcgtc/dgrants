<template>
  <div class="max-w-screen-lg mx-auto">
    <!-- ToDo. Loading... message-->
    <ul class="text-left grid grid-cols-1 gap-10 py-10 sm:grid-cols-2">
      <li v-for="grant in grants" :key="grant.id.toString()">
        <!-- ToDo: Raised data -->
        <!-- ToDo: Grant image -->
        <GrantCard
          :id="grant.id"
          :name="grantMetadata[grant.metaPtr].name ?? ''"
          :ownerAddress="grant.owner"
          raised="100"
          imgurl="https://s3-alpha-sig.figma.com/img/901c/c3ae/ac690f9a43a7634d9d198cf9057c4454?Expires=1632096000&Signature=PnDBcqyesPYCxYzyRTGn-imh2ktN8ImD4GIrtJKoBrpooTX6Uqae5ogcpWdMpn6CyZnfDAnGuA2XYokhIpLTbLTriqd5Ifiiv2zbVHHQlUwQQ8fk4k9gpAj17CTBJGS0Ldqv6pn9MvSTzXKaLa~FjSiX2AAeWgWz1Vy9OJ6KFahsmhfLXlGEmBDr1Dx016AMvWH5DhKRLY4XbpfJz5zJy6zEHbV7GZ6uxop4d-pIk9KvTPt3kjJEsmKRdVxxy8XC8zN2cIFMEQEWJDRe64AekEl5ABzlTN~9o8NYS6~q5ObH3BlwQuvUhPLNvw0Atjwc9DX3yWuo-cAOZISl5sboOg__&Key-Pair-Id=APKAINTVSUGEWH5XD5UA"
        />
      </li>
    </ul>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from 'vue';
// --- App Imports ---
import GrantCard from 'src/components/GrantCard.vue';
// --- Store ---
import useCartStore from 'src/store/cart';
// --- Methods and Data ---
import { pushRoute } from 'src/utils/utils';
// --- Types ---
import { Grant, GrantRoundMetadataResolution } from '@dgrants/types';

export default defineComponent({
  name: 'GrantList',
  components: { GrantCard },
  props: {
    // --- Required props ---
    grants: { type: Array as PropType<Grant[]>, required: true },
    grantMetadata: { type: Object as PropType<Record<string, GrantRoundMetadataResolution>>, required: true },
  },
  setup() {
    const { addToCart, isInCart, removeFromCart } = useCartStore();
    return { isInCart, addToCart, removeFromCart, pushRoute, console };
  },
});
</script>

import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import GrantExplorer from '../views/GrantExplorer.vue';
import ShoppingCart from '../views/ShoppingCart.vue';
import Payments from '../views/Payments.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/shopping',
    name: 'shopping',
    component: ShoppingCart,
  },
  {
    path: '/payments',
    name: 'payments',
    component: Payments,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes, // short for `routes: routes`
});

export default router;

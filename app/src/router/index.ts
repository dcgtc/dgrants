/**
 * @notice Router configuration
 * @dev When the `component` property has an `import` statement, this gives route level code-splitting, which
 * generates a separate chunk (e.g. `about.[hash].js`) for this route which is lazy-loaded when the route is visited
 */

import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import Home from '../views/Home.vue';

// For info on using Vue Router with the Composition API, see https://next.router.vuejs.org/guide/advanced/composition-api.html

const routes: Array<RouteRecordRaw> = [
  { path: '/', name: 'Home', component: Home },
  { path: '/about', name: 'About', component: () => import('../views/About.vue') },
  { path: '/dgrants', name: 'dgrants', component: () => import('../views/GrantRegistryList.vue') },
  { path: '/dgrants/new', name: 'dgrants-new', component: () => import('../views/GrantRegistryNewGrant.vue') },
  { path: '/dgrants/:id', name: 'dgrants-id', component: () => import('../views/GrantRegistryGrantDetail.vue') },
  { path: '/ui', name: 'Ui', component: () => import('../views/Ui.vue') },
  { path: '/dgrants/rounds/', name: 'dgrants-rounds-list', component: () => import('../views/GrantRoundsList.vue') },
  {
    path: '/dgrants/rounds/:address',
    name: 'dgrants-round-details',
    component: () => import('../views/GrantRoundDetails.vue'),
  },
  // Fallback route for handling 404s
  { path: '/:pathMatch(.*)*', name: '404', component: () => import('../views/Error404.vue') },
];

const router = createRouter({
  // If app is not hosted at the domain root, make sure to pass the `base` input here: https://next.router.vuejs.org/api/#parameters
  history: createWebHistory(),
  routes,
});

export default router;

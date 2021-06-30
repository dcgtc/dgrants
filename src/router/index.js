import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import GrantExplorer from '../views/GrantExplorer.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/grantExplorer',
    name: 'grantExplorer',
    component: GrantExplorer,
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes, // short for `routes: routes`
});

export default router;

import { createRouter, createWebHistory } from '@ionic/vue-router';
import { RouteRecordRaw } from 'vue-router';
import TabsPage from '../views/TabsPage.vue'

import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/firebase';

const routes: Array<RouteRecordRaw> = [
  { path: '/', redirect: '/tabs/tab1' },
  
  { 
    path: '/tabs/', 
    component: TabsPage,
    children: [
      { path: '', redirect: '/tabs/tab1' },
      { path: 'tab1', component: () => import('@/views/Tab1Page.vue') },
      { path: 'tab2', component: () => import('@/views/Tab2Page.vue') },
      { path: 'tab3', component: () => import('@/views/Tab3Page.vue') },
    ]
  },

  { path: '/auth/login', component: () => import('@/views/auth/LoginPage.vue') },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
})

// Navigation guard
router.beforeEach((to, from, next) => {
  onAuthStateChanged(auth, (user) => {
    if (!user && to.path !== '/auth/login') {
      next('/auth/login');
    } else if (user && to.path === '/auth/login') {
      next('/');
    } else {
      next();
    }
  });
});

export default router

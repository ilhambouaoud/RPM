import { createRouter, createWebHistory } from 'vue-router'
import MainLayout from '@/layouts/MainLayout.vue'


const router = createRouter({
  history: createWebHistory('/CNESTEN'),
  routes: [

{
  path: '/login',
  name: 'Login',
  component: () => import('@/layouts/Login.vue')
},
{
  path: '/',
  redirect: '/login'
},

{
  path: '/portiques',
  name: 'Portiques',
  component: () => import('@/layouts/Portiques.vue'),
  meta: { requiresAuth: true }
},

{
  path: '/',
  component: MainLayout,
  meta: { requiresAuth: true },
  children: [

    {
      path: '/portiques',
      redirect: '/portiques'
    },

    {
      path: 'portique/:id',
      name: 'PortiqueDashboard',
      component: () => import('@/views/Dashboard.vue')
    },

    {
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue')
    },
    {
      path: '/addPortique',
      name: 'AddPortique',
      component: () => import('@/views/addPortique.vue'),
      meta: { requiresAuth: true }
    },

   
    {
      path: 'settings',
      name: 'Settings',
      component: () => import('@/views/Settings.vue')
    }

  ]
}
]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token')
  if (to.meta.requiresAuth && !token) {
    next('/login')
  }
  else if (token && to.path === '/login') {
    next('/portiques')
  }

  else {
    next()
  }
})

export default router
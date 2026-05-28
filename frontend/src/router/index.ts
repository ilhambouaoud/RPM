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

    // ⚠️ IMPORTANT : Les routes avec paramètres doivent être APRÈS les routes fixes
    // Route de calibration (doit être AVANT la route dynamique)
    {
      path: 'portique/:id/calibration',
      name: 'Calibration',
      component: () => import('@/views/Calibration.vue')
    },

    // Route du dashboard (route dynamique - doit être APRÈS)
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
    },
    {
  path: 'test',
  name: 'Test',
  component: () => import('@/views/Test.vue')
}

  ]
}
]
})

router.beforeEach((to, from, next) => {

  const username = localStorage.getItem("username")

  if (to.meta.requiresAuth && !username) {
    next('/login')
  }
  else if (username && to.path === '/login') {
    next('/portiques')
  }
  else {
    next()
  }
})

export default router
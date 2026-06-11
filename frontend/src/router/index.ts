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
      path: 'portiques',
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
      path: 'addPortique',
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
    },
    {
    path: 'users',
    name: 'Users',

    component: () =>
    import('@/views/Users.vue'),

    meta: {
        requiresAuth: true,
        requiresAdmin: true
      }
    },
    {
    path: 'create-user',
    name: 'CreateUser',

    component: () =>
      import('@/views/CreateUser.vue'),

    meta: {
      requiresAuth: true,
      requiresAdmin: true
    }
   },
   {


  path: 'portique/:id/history',
  name: 'History',
  component: () => import('@/views/HistoryView.vue')


  },

  ]
}
]
})

router.beforeEach((to, from, next) => {

  const username = localStorage.getItem("username")

  const user = JSON.parse(
    localStorage.getItem("user") || "null"
  )

  console.log("TO PATH =", to.path)
  console.log("MATCHED =", to.matched)
  console.log("USER =", user)

  // NON CONNECTÉ
  if (
    to.matched.some(
      record => record.meta.requiresAuth
    ) &&
    !username
  ) {

    return next('/login')

  }

  // DÉJÀ CONNECTÉ
  if (
    username &&
    to.path === '/login'
  ) {

    return next('/portiques')

  }

  // ADMIN ONLY
  if (
    to.matched.some(
      record => record.meta.requiresAdmin
    )
  ) {

    if (
      !user ||
      user.role !== 'admin'
    ) {

      return next('/portiques')

    }

  }

  next()

})
export default router
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/modules/dashboard/views/DashboardView.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/modules/auth/views/LoginView.vue'),
    meta: { guestOnly: true },
  },
  {
    path: '/registro',
    name: 'registro',
    component: () => import('@/modules/auth/views/RegisterView.vue'),
    meta: { guestOnly: true },
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.estaAutenticado) {
    return next('/login')
  }

  if (to.meta.guestOnly && authStore.estaAutenticado) {
    return next('/')
  }

  next()
})

export default router

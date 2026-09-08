<template>
  <header class="w-full bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
      <!-- Logo y Nombre -->
      <div class="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <RouterLink to="/" class="flex items-center gap-2 sm:gap-2.5 hover:opacity-90 transition-opacity">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-orange-600 flex items-center justify-center text-white shadow-xs">
            <Trophy class="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div class="flex items-center gap-1 sm:gap-1.5">
            <span class="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white tracking-tight">SpinApp</span>
            <span class="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 tracking-wider">
              Torneo
            </span>
          </div>
        </RouterLink>
      </div>

      <!-- Zona Derecha: Switcher, Theme Toggle, Usuario y Salir -->
      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <!-- Switcher visual: Panel Admin <-> Vista Jugador -->
        <RouterLink
          v-if="esRutaAdmin"
          to="/"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
          title="Cambiar a Vista de Jugador"
        >
          <Users class="w-3.5 h-3.5 text-slate-600 dark:text-slate-400" />
          <span class="hidden sm:inline">Vista Jugador</span>
        </RouterLink>

        <RouterLink
          v-else-if="authStore.esAdmin"
          to="/admin"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 transition-colors"
          title="Ingresar al Panel de Administrador"
        >
          <ShieldCheck class="w-3.5 h-3.5 text-orange-500" />
          <span class="hidden sm:inline">Panel Admin</span>
        </RouterLink>

        <!-- Botón Especial de Modo Oscuro / Claro con Pelota Rebotando sobre la Mesa -->
        <ThemeTogglePingPong />

        <div class="h-4 sm:h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

        <!-- Info del Usuario / Admin -->
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            {{ userInitials }}
          </div>
          <div class="flex flex-col min-w-0">
            <span class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white leading-tight truncate max-w-24 sm:max-w-none">
              {{ authStore.usuario?.nombre || 'Usuario' }} {{ authStore.usuario?.apellido || '' }}
            </span>
            <span v-if="authStore.esAdmin" class="text-[9px] font-black text-orange-500 uppercase tracking-wider">
              Admin
            </span>
          </div>
        </div>

        <div class="h-4 sm:h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

        <button
          type="button"
          class="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-red-500 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer shrink-0"
          @click="handleLogout"
          title="Cerrar sesión"
        >
          <LogOut class="w-4 h-4 text-red-500" />
          <span class="hidden sm:inline">Salir</span>
        </button>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import { Trophy, LogOut, ShieldCheck, Users } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import ThemeTogglePingPong from '@/components/ThemeTogglePingPong.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const esRutaAdmin = computed(() => route.path.startsWith('/admin'))

const userInitials = computed(() => {
  const nombre = authStore.usuario?.nombre?.[0] || 'A'
  const apellido = authStore.usuario?.apellido?.[0] || 'D'
  return `${nombre}${apellido}`.toUpperCase()
})

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}
</script>

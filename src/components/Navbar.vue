<template>
  <header class="w-full bg-white border-b border-slate-200/90 sticky top-0 z-40 shadow-xs">
    <div class="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
      <div class="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-emerald-700 flex items-center justify-center text-white shadow-xs">
          <Trophy class="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div class="flex items-center gap-1 sm:gap-1.5">
          <span class="text-base sm:text-lg font-bold font-heading text-slate-900 tracking-tight">SpinApp</span>
          <span class="text-[9px] sm:text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 tracking-wider">
            Torneo
          </span>
        </div>
      </div>

      <div class="flex items-center gap-2 sm:gap-4 min-w-0">
        <div class="flex items-center gap-2 min-w-0">
          <div class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0">
            {{ userInitials }}
          </div>
          <span class="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate max-w-27.5 sm:max-w-none">
            {{ authStore.usuario?.nombre }} {{ authStore.usuario?.apellido }}
          </span>
        </div>

        <div class="h-4 sm:h-5 w-px bg-slate-200 shrink-0" />

        <button
          type="button"
          class="flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold text-slate-500 hover:text-red-600 p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg hover:bg-red-50 transition-colors cursor-pointer shrink-0"
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
import { useRouter } from 'vue-router'
import { Trophy, LogOut } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const userInitials = computed(() => {
  const nombre = authStore.usuario?.nombre?.[0] || 'J'
  const apellido = authStore.usuario?.apellido?.[0] || 'M'
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

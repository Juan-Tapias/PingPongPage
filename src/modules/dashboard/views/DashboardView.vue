<script setup lang="ts">
import { useRouter } from 'vue-router'
import { Trophy, LogOut, User, Sparkles, CheckCircle2 } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import Button from '@/components/Button.vue'
import Card from '@/components/Card.vue'

const router = useRouter()
const authStore = useAuthStore()

const handleLogout = async () => {
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}
</script>

<template>
  <div class="min-h-screen w-full bg-background flex flex-col">
    <!-- Barra Superior de Navegación -->
    <header class="w-full border-b border-slate-800 bg-surface/60 backdrop-blur-md sticky top-0 z-50">
      <div class="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <div class="flex items-center gap-2.5">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center">
            <Trophy class="w-4 h-4 text-emerald-400" />
          </div>
          <span class="text-base font-bold font-heading text-white tracking-tight">
            SpinApp <span class="text-emerald-400">Torneo</span>
          </span>
        </div>

        <div class="flex items-center gap-3">
          <div class="hidden sm:flex flex-col text-right">
            <span class="text-xs font-semibold text-white">
              {{ authStore.usuario?.nombre }} {{ authStore.usuario?.apellido }}
            </span>
            <span class="text-[10px] uppercase font-bold text-slate-400">
              {{ authStore.usuario?.tipo }}
            </span>
          </div>

          <Button
            variant="ghost"
            size="sm"
            @click="handleLogout"
          >
            <LogOut class="w-3.5 h-3.5 mr-1.5" />
            <span>Salir</span>
          </Button>
        </div>
      </div>
    </header>

    <!-- Contenido Principal -->
    <main class="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center gap-6 my-auto">
      <Card variant="glass" padding="lg">
        <div class="flex flex-col items-center text-center gap-4 py-4">
          <div class="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shadow-lg shadow-emerald-950/20">
            <CheckCircle2 class="w-8 h-8 text-emerald-400" />
          </div>

          <div>
            <h1 class="text-2xl sm:text-3xl font-bold font-heading text-white tracking-tight">
              ¡Bienvenido a SpinApp, {{ authStore.usuario?.nombre || 'Jugador' }}!
            </h1>
            <p class="text-sm text-slate-300 mt-1 max-w-md mx-auto">
              Has iniciado sesión exitosamente en la plataforma del torneo de tenis de mesa.
            </p>
          </div>

          <!-- Tarjetas de Información del Perfil -->
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-xl mt-2">
            <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
              <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Participante
              </span>
              <span class="text-sm font-bold text-white capitalize mt-0.5 flex items-center gap-1.5">
                <User class="w-3.5 h-3.5 text-emerald-400" />
                {{ authStore.usuario?.tipo || 'Jugador' }}
              </span>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
              <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Correo Registrado
              </span>
              <span class="text-xs font-medium text-slate-200 truncate mt-0.5 block">
                {{ authStore.usuario?.email || 'N/A' }}
              </span>
            </div>

            <div class="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-left">
              <span class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
                Estado del Torneo
              </span>
              <span class="text-xs font-semibold text-emerald-400 mt-0.5 flex items-center gap-1.5">
                <Sparkles class="w-3.5 h-3.5" />
                Fase Inicial
              </span>
            </div>
          </div>
        </div>
      </Card>
    </main>
  </div>
</template>

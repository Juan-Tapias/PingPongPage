<template>
  <header class="w-full bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 sticky top-0 z-40 shadow-xs transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2">
      <!-- Logo y Nombre -->
      <div class="flex items-center gap-2 sm:gap-2.5 shrink-0">
        <RouterLink to="/" class="flex items-center hover:opacity-95 transition-opacity">
          <Logo variant="horizontal" />
        </RouterLink>
      </div>

      <!-- Zona Derecha: Switcher, Theme Toggle y Dropdown de Usuario con Opción de Salir -->
      <div class="flex items-center gap-2 sm:gap-3 min-w-0">
        <!-- Badge Pulsante de Transmisión en Vivo (Live Stream Fase 2) -->
        <a
          v-if="torneosEnVivo.length === 1 && torneosEnVivo[0]"
          :href="torneosEnVivo[0].enlaceTransmision"
          target="_blank"
          rel="noopener noreferrer"
          class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-500 hover:from-red-500 hover:to-rose-500 shadow-md shadow-red-500/30 animate-pulse border border-red-400/50 cursor-pointer transition-all shrink-0"
          :title="`🔴 EN VIVO: ${torneosEnVivo[0].nombre}`"
        >
          <span class="w-2 h-2 rounded-full bg-white animate-ping" />
          <span class="hidden sm:inline">🔴 EN VIVO | Ver Torneo</span>
          <span class="sm:hidden">🔴 EN VIVO</span>
          <ExternalLink class="w-3.5 h-3.5 ml-0.5" />
        </a>

        <!-- Varias transmisiones simultáneas: selector desplegable -->
        <div v-else-if="torneosEnVivo.length > 1" ref="navEnVivoRef" class="relative shrink-0">
          <button
            type="button"
            class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl text-[11px] sm:text-xs font-black text-white bg-gradient-to-r from-red-600 via-rose-600 to-red-500 shadow-md shadow-red-500/30 border border-red-400/50 cursor-pointer"
            title="Hay varias transmisiones en vivo"
            @click="menuEnVivoAbierto = !menuEnVivoAbierto"
          >
            <span class="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>🔴 EN VIVO ({{ torneosEnVivo.length }})</span>
            <ChevronDown class="w-3.5 h-3.5" :class="{ 'rotate-180': menuEnVivoAbierto }" />
          </button>
          <div
            v-if="menuEnVivoAbierto"
            class="absolute right-0 mt-2 w-64 rounded-2xl bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 shadow-2xl z-50 p-1.5"
          >
            <a
              v-for="t in torneosEnVivo"
              :key="t.id"
              :href="t.enlaceTransmision"
              target="_blank"
              rel="noopener noreferrer"
              class="flex items-center justify-between gap-2 px-3 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-red-50 dark:hover:bg-red-950/40"
              @click="menuEnVivoAbierto = false"
            >
              <span class="truncate">{{ t.nombre }}</span>
              <ExternalLink class="w-3.5 h-3.5 text-red-500 shrink-0" />
            </a>
          </div>
        </div>

        <!-- Switcher visual: Panel Admin <-> Vista Jugador / Volver a Torneos -->
        <RouterLink
          v-if="esRutaBiblioteca"
          to="/"
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors border border-slate-200/60 dark:border-slate-700/60"
          title="Volver a la Página Principal"
        >
          <ArrowLeft class="w-3.5 h-3.5 text-orange-500" />
          <span class="hidden sm:inline">Inicio</span>
        </RouterLink>

        <RouterLink
          v-else-if="esRutaAdmin"
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

        <!-- Botón Biblioteca de Videos (Bloqueado / Próximamente) -->
        <button
          type="button"
          disabled
          class="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border shrink-0 select-none min-h-[36px] opacity-60 cursor-not-allowed text-slate-400 dark:text-slate-500 bg-slate-100/60 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 transition-all"
          title="Biblioteca de Videos (Próximamente)"
        >
          <Film class="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
          <span class="hidden md:inline">Biblioteca</span>
          <span class="hidden sm:inline md:hidden">Clips</span>
          <Lock class="w-3 h-3 text-slate-400 dark:text-slate-500 ml-0.5" />
        </button>

        <!-- Botón Especial de Modo Oscuro / Claro con Pelota Rebotando sobre la Mesa -->
        <ThemeTogglePingPong />

        <div class="h-4 sm:h-5 w-px bg-slate-200 dark:bg-slate-800 shrink-0" />

        <!-- Info y Menú Desplegable del Usuario -->
        <!-- Info y Menú Desplegable del Usuario (Player Passport Dropdown) -->
        <div ref="navUsuarioRef" class="relative">
          <button
            type="button"
            class="flex items-center gap-2 sm:gap-2.5 p-1 sm:p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/80 border border-transparent hover:border-slate-200/80 dark:hover:border-slate-700/60 transition-all cursor-pointer select-none group"
            @click="menuUsuarioAbierto = !menuUsuarioAbierto"
          >
            <!-- Avatar con Indicador En Línea -->
            <div class="relative">
              <AvatarJugador
                :foto-url="authStore.usuario?.fotoUrl"
                :nombre="authStore.usuario?.nombre"
                size="sm"
                ring-class="ring-2 ring-sky-500/20 group-hover:ring-sky-500/40"
              />
              <span class="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0f172a]" />
            </div>

            <div class="hidden md:flex flex-col text-left min-w-0">
              <span class="text-xs sm:text-sm font-black text-slate-900 dark:text-white leading-tight truncate max-w-28 sm:max-w-36">
                {{ authStore.usuario?.nombre || 'Usuario' }} {{ authStore.usuario?.apellido || '' }}
              </span>
              <span v-if="authStore.esAdmin" class="text-[9px] font-black text-orange-500 uppercase tracking-wider">
                Admin
              </span>
              <span v-else class="text-[9px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Jugador
              </span>
            </div>
            <ChevronDown class="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200 transition-transform duration-200" :class="{ 'rotate-180': menuUsuarioAbierto }" />
          </button>

          <!-- Dropdown Desplegable (Player Passport & Settings) -->
          <div
            v-if="menuUsuarioAbierto"
            class="absolute right-0 mt-2 w-72 sm:w-80 rounded-3xl bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 overflow-hidden"
          >
            <!-- Cabecera de la Ficha de Jugador -->
            <div class="p-4 bg-gradient-to-br from-slate-50 via-white to-slate-100/60 dark:from-slate-900/90 dark:via-[#0c1222] dark:to-slate-900/50 border-b border-slate-200/70 dark:border-slate-800/80">
              <div class="flex items-start gap-3">
                <AvatarJugador
                  :foto-url="authStore.usuario?.fotoUrl"
                  :nombre="authStore.usuario?.nombre"
                  size="lg"
                  ring-class="shadow-md shadow-sky-500/20"
                />
                <div class="min-w-0 flex-1">
                  <div class="flex items-center gap-1.5">
                    <p class="text-sm font-black text-slate-900 dark:text-white truncate font-heading">
                      {{ authStore.usuario?.nombre }} {{ authStore.usuario?.apellido }}
                    </p>
                  </div>
                  <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5 font-mono">
                    {{ authStore.usuario?.email }}
                  </p>
                </div>
              </div>

              <!-- Badges de Identidad Oficial -->
              <div class="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-slate-200/60 dark:border-slate-800/60 flex-wrap">
                <span
                  v-if="authStore.esAdmin"
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30"
                >
                  <ShieldCheck class="w-3 h-3" />
                  <span>Administrador</span>
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30"
                >
                  <Trophy class="w-3 h-3" />
                  <span>Jugador Oficial</span>
                </span>

                <span
                  v-if="authStore.usuario?.tipo === 'camper'"
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30"
                >
                  <GraduationCap class="w-3 h-3" />
                  <span>Camper</span>
                </span>
                <span
                  v-else-if="authStore.usuario?.tipo === 'trabajador'"
                  class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30"
                >
                  <Briefcase class="w-3 h-3" />
                  <span>Colaborador</span>
                </span>
              </div>
            </div>

            <!-- Accesos Rápidos Deportivos -->
            <div class="p-2 space-y-1 text-xs">
              <RouterLink
                to="/"
                class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all font-semibold"
                @click="menuUsuarioAbierto = false"
              >
                <Trophy class="w-4 h-4 text-orange-500 shrink-0" />
                <span>Mis Torneos y Partidos</span>
              </RouterLink>

              <!-- Acceso a Perfil y Avatar -->
              <RouterLink
                to="/perfil"
                class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all font-semibold"
                @click="menuUsuarioAbierto = false"
              >
                <UserCircle class="w-4 h-4 text-sky-500 shrink-0" />
                <span>Mi Perfil / Avatar</span>
              </RouterLink>

              <!-- Biblioteca de Videos (Bloqueada) -->
              <div
                class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-slate-400 dark:text-slate-500 opacity-60 cursor-not-allowed font-semibold text-xs select-none"
                title="Biblioteca de Videos (Próximamente)"
              >
                <div class="flex items-center gap-2.5">
                  <Film class="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
                  <span>Biblioteca de Videos</span>
                </div>
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700/60 text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <Lock class="w-2.5 h-2.5" />
                  Próximamente
                </span>
              </div>

              <!-- Conmutador Admin / Jugador en caso de ser Administrador -->
              <template v-if="authStore.esAdmin">
                <RouterLink
                  v-if="!esRutaAdmin"
                  to="/admin"
                  class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-orange-600 dark:text-orange-400 hover:bg-orange-500/10 transition-all font-bold"
                  @click="menuUsuarioAbierto = false"
                >
                  <ShieldCheck class="w-4 h-4 shrink-0" />
                  <span>Entrar al Panel de Control</span>
                </RouterLink>

                <RouterLink
                  v-else
                  to="/"
                  class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-sky-600 dark:text-sky-400 hover:bg-sky-500/10 transition-all font-bold"
                  @click="menuUsuarioAbierto = false"
                >
                  <Users class="w-4 h-4 shrink-0" />
                  <span>Ver Pantalla como Jugador</span>
                </RouterLink>
              </template>

              <!-- Botón Reglamento Técnico Oficial ITTF -->
              <button
                type="button"
                class="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-all font-semibold cursor-pointer text-left"
                @click="handleAbrirReglamento"
              >
                <BookOpen class="w-4 h-4 text-slate-400 shrink-0" />
                <span>Reglamento Oficial ITTF</span>
              </button>
            </div>

            <!-- Footer: Cerrar Sesión -->
            <div class="p-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40">
              <button
                type="button"
                class="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer text-left"
                @click="handleLogout"
              >
                <span class="flex items-center gap-2">
                  <LogOut class="w-4 h-4 text-red-500 shrink-0" />
                  <span>Cerrar sesión</span>
                </span>
                <span class="text-[10px] text-red-400/80 font-normal">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute, RouterLink } from 'vue-router'
import {
  Trophy,
  LogOut,
  ShieldCheck,
  Users,
  ChevronDown,
  BookOpen,
  GraduationCap,
  Briefcase,
  Film,
  ArrowLeft,
  Lock,
  UserCircle,
  ExternalLink,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { useReglamento } from '@/composables/useReglamento'
import ThemeTogglePingPong from '@/components/ThemeTogglePingPong.vue'
import Logo from '@/components/Logo.vue'
import AvatarJugador from '@/components/AvatarJugador.vue'
import { storeToRefs } from 'pinia'
import { useTorneosEnVivoStore } from '@/stores/torneosEnVivo'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { abrirReglamento } = useReglamento()

const menuUsuarioAbierto = ref(false)
const navUsuarioRef = ref<HTMLElement | null>(null)

const menuEnVivoAbierto = ref(false)
const navEnVivoRef = ref<HTMLElement | null>(null)

// Suscripción compartida (Pinia) filtrada a torneos con transmisión activa
const torneosEnVivoStore = useTorneosEnVivoStore()
const { torneosEnVivo } = storeToRefs(torneosEnVivoStore)

const esRutaAdmin = computed(() => route.path.startsWith('/admin'))
const esRutaBiblioteca = computed(() => route.path.startsWith('/biblioteca'))

const userInitials = computed(() => {
  const nombre = authStore.usuario?.nombre?.[0] || 'P'
  const apellido = authStore.usuario?.apellido?.[0] || 'L'
  return `${nombre}${apellido}`.toUpperCase()
})

const handleClickOutside = (event: MouseEvent) => {
  if (navUsuarioRef.value && !navUsuarioRef.value.contains(event.target as Node)) {
    menuUsuarioAbierto.value = false
  }
  if (navEnVivoRef.value && !navEnVivoRef.value.contains(event.target as Node)) {
    menuEnVivoAbierto.value = false
  }
}

const handleAbrirReglamento = () => {
  menuUsuarioAbierto.value = false
  abrirReglamento()
}

onMounted(() => {
  window.addEventListener('click', handleClickOutside)
  torneosEnVivoStore.iniciar()
})

onUnmounted(() => {
  window.removeEventListener('click', handleClickOutside)
  torneosEnVivoStore.detener()
})

const handleLogout = async () => {
  menuUsuarioAbierto.value = false
  try {
    await authStore.logout()
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}
</script>

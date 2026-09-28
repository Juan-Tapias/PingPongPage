<template>
  <div class="min-h-screen w-full bg-slate-100 dark:bg-[#060a14] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 relative overflow-x-hidden">
    <!-- Fondo de Estadio y Cancha Reglamentaria -->
    <FondoEstadioCancha />

    <!-- Barra de Navegación Global -->
    <Navbar class="relative z-10" />

    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-4 sm:py-6 flex flex-col gap-5 sm:gap-6 relative z-10">
      <!-- Barra Superior de Navegación: Botón Volver a la Página Principal -->
      <div class="flex items-center justify-between gap-3">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:text-orange-500 dark:hover:text-orange-400 hover:border-orange-500/40 active:scale-95 text-xs font-bold transition-all shadow-xs cursor-pointer group"
        >
          <ArrowLeft class="w-4 h-4 text-orange-500 group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver a la Página Principal</span>
        </RouterLink>

        <span class="text-[11px] font-semibold text-slate-400 dark:text-slate-500 hidden sm:inline">
          SpinApp / Videoteca Oficial
        </span>
      </div>

      <!-- Hero de la Biblioteca (Estilo Twitch / YouTube Gaming) -->
      <div class="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-300/80 dark:border-slate-800/90 shadow-xl bg-[#080d1a] p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-2.5 max-w-xl z-10">
          <div class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-black uppercase tracking-wider backdrop-blur-md">
            <Film class="w-3.5 h-3.5 text-orange-400" />
            <span>Videoteca Oficial de Partidos</span>
          </div>

          <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight font-heading drop-shadow-md">
            Biblioteca de Repeticiones y Clips
          </h1>

          <p class="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-lg">
            Revive las transmisiones en vivo, los mejores remates, saques as y puntos decisivos capturados durante los torneos.
          </p>

          <!-- Métricas y Estadísticas en Vivo de la Videoteca -->
          <div class="flex items-center gap-2.5 pt-1 text-xs font-bold text-slate-300 flex-wrap">
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-white shadow-2xs">
              <Film class="w-3.5 h-3.5 text-orange-400" />
              <span>{{ clips.length }} {{ clips.length === 1 ? 'Video' : 'Videos' }}</span>
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-white shadow-2xs">
              <Eye class="w-3.5 h-3.5 text-sky-400" />
              <span>{{ totalVistas }} Vistas</span>
            </span>
            <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 text-white shadow-2xs">
              <Heart class="w-3.5 h-3.5 text-rose-400 fill-rose-500/40" />
              <span>{{ totalLikes }} Likes</span>
            </span>
          </div>
        </div>

        <!-- Botón para subir o registrar nuevo clip (SOLO VISIBLE PARA ADMINS) -->
        <div v-if="authStore.esAdmin" class="flex items-center gap-3 z-10 w-full sm:w-auto">
          <button
            type="button"
            class="w-full sm:w-auto justify-center px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 active:scale-95 text-white font-black text-xs sm:text-sm shadow-xl shadow-orange-600/30 flex items-center gap-2 cursor-pointer transition-all border border-orange-400/30"
            @click="mostrarModalSubir = true"
          >
            <Plus class="w-4 h-4 stroke-[3]" />
            <span>Agregar Clip / Video</span>
          </button>
        </div>

        <!-- Decoración de fondo -->
        <div class="absolute -right-10 -bottom-10 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none"></div>
      </div>

      <!-- Barra de Filtros, Categorías y Buscador -->
      <div class="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white dark:bg-[#0c1222] p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <!-- Pestañas de Categoría con Iconos SVG Limpios -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0 w-full md:w-auto">
          <button
            v-for="cat in CATEGORIAS"
            :key="cat.id"
            type="button"
            :class="[
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border shrink-0',
              categoriaSeleccionada === cat.id
                ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700'
            ]"
            @click="categoriaSeleccionada = cat.id"
          >
            <component
              :is="cat.icon"
              class="w-3.5 h-3.5 shrink-0"
              :class="categoriaSeleccionada === cat.id ? 'text-white' : 'text-orange-500 dark:text-orange-400'"
            />
            <span>{{ cat.label }}</span>
          </button>
        </div>

        <!-- Buscador y Orden -->
        <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full md:w-auto">
          <!-- Campo de Búsqueda -->
          <div class="relative flex-1 sm:w-64">
            <Search class="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              v-model.trim="busquedaTexto"
              type="text"
              placeholder="Buscar por jugador, torneo..."
              class="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:border-orange-500 outline-hidden transition-all"
            />
          </div>

          <!-- Selector de Orden -->
          <select
            v-model="ordenSeleccionado"
            class="w-full sm:w-auto px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-300 focus:border-orange-500 outline-hidden transition-all cursor-pointer shrink-0"
          >
            <option value="recientes">Más recientes</option>
            <option value="vistas">Más vistos</option>
            <option value="likes">Más likes</option>
          </select>
        </div>
      </div>

      <!-- Estado de Carga (Skeletons) -->
      <div v-if="cargando" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        <div
          v-for="n in 4"
          :key="n"
          class="flex flex-col bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden animate-pulse shadow-xs"
        >
          <div class="w-full aspect-video bg-slate-200 dark:bg-slate-800/70"></div>
          <div class="p-4 space-y-3">
            <div class="h-4 bg-slate-200 dark:bg-slate-800 rounded-md w-3/4"></div>
            <div class="h-3 bg-slate-100 dark:bg-slate-800/50 rounded-md w-1/2"></div>
            <div class="h-px bg-slate-100 dark:bg-slate-800/80 pt-2"></div>
            <div class="flex justify-between items-center">
              <div class="h-3 bg-slate-100 dark:bg-slate-800/50 rounded-md w-1/4"></div>
              <div class="h-3 bg-slate-100 dark:bg-slate-800/50 rounded-md w-1/4"></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Cuadrícula de Videos Estilo Twitch / YouTube -->
      <div v-else-if="clipsFiltrados.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
        <TarjetaVideoBiblioteca
          v-for="clip in clipsFiltrados"
          :key="clip.id"
          :clip="clip"
          @reproducir="handleReproducirClip"
          @like="darLike"
        />
      </div>

      <!-- Estado Vacío -->
      <div
        v-else
        class="flex flex-col items-center justify-center p-8 sm:p-14 bg-white dark:bg-[#0c1222] rounded-3xl border border-slate-200 dark:border-slate-800 text-center gap-3"
      >
        <div class="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
          <Film class="w-7 h-7" />
        </div>
        <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white font-heading">
          {{ clips.length === 0 ? 'Aún no hay videos en la videoteca' : 'No se encontraron videos' }}
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
          {{
            clips.length === 0
              ? (authStore.esAdmin
                  ? 'Como administrador, puedes subir clips grabados o esperar a que concluyan transmisiones en vivo para que aparezcan aquí automáticamente.'
                  : 'Las transmisiones de los partidos y las jugadas destacadas aparecerán aquí automáticamente.')
              : 'No hay clips que coincidan con el filtro seleccionado. Prueba con otra categoría o restablece tu búsqueda.'
          }}
        </p>
        <div class="flex items-center gap-2 mt-2 flex-wrap justify-center">
          <button
            v-if="clips.length > 0 && (busquedaTexto || categoriaSeleccionada !== 'todos')"
            type="button"
            class="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs cursor-pointer transition-all border border-slate-300 dark:border-slate-700"
            @click="busquedaTexto = ''; categoriaSeleccionada = 'todos'"
          >
            Restablecer Filtros
          </button>
          <button
            v-if="authStore.esAdmin"
            type="button"
            class="px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-bold text-xs cursor-pointer shadow-md transition-all flex items-center gap-1.5"
            @click="mostrarModalSubir = true"
          >
            <Plus class="w-3.5 h-3.5 stroke-[3]" />
            <span>Subir el primer clip</span>
          </button>
        </div>
      </div>
    </main>

    <!-- Modal Reproductor de Video (Con Likes en Tiempo Real, YouTube y Delete Admin) -->
    <ModalReproductorVideo
      :clip="clipSeleccionado"
      :ya-dio-like="clipSeleccionado ? haDadoLike(clipSeleccionado.id) : false"
      @cerrar="clipSeleccionadoId = null"
      @like="darLike"
      @eliminar="handleEliminarClip"
    />

    <!-- Modal para Subir o Enlazar Nuevo Clip (Solo Admins) -->
    <ModalSubirClip
      :visible="mostrarModalSubir && authStore.esAdmin"
      @cerrar="mostrarModalSubir = false"
      @clip-creado="handleClipCreado"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import {
  Film,
  Plus,
  Search,
  ArrowLeft,
  Layers,
  Star,
  Radio,
  Zap,
  Trophy,
  Eye,
  Heart,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import Navbar from '@/components/Navbar.vue'
import FondoEstadioCancha from '@/components/FondoEstadioCancha.vue'
import TarjetaVideoBiblioteca from '../components/TarjetaVideoBiblioteca.vue'
import ModalReproductorVideo from '../components/ModalReproductorVideo.vue'
import ModalSubirClip from '../components/ModalSubirClip.vue'
import { useBibliotecaVideos } from '../composables/useBibliotecaVideos'
import type { ClipBiblioteca, CategoriaClip } from '../types'

const authStore = useAuthStore()

const {
  clips,
  clipsFiltrados,
  cargando,
  categoriaSeleccionada,
  busquedaTexto,
  ordenSeleccionado,
  agregarClip,
  incrementarVistas,
  darLike,
  haDadoLike,
  eliminarClip,
} = useBibliotecaVideos()

const clipSeleccionadoId = ref<string | null>(null)

// Vinculación reactiva en tiempo real: al actualizarse los likes o views de un clip, el modal se actualiza al instante
const clipSeleccionado = computed(() => {
  if (!clipSeleccionadoId.value) return null
  return clips.value.find((c) => c.id === clipSeleccionadoId.value) || null
})

const mostrarModalSubir = ref(false)

const totalVistas = computed(() => {
  return clips.value.reduce((total, c) => total + (c.vistas || 0), 0)
})

const totalLikes = computed(() => {
  return clips.value.reduce((total, c) => total + (c.likes || 0), 0)
})

const CATEGORIAS: { id: CategoriaClip; label: string; icon: any }[] = [
  { id: 'todos', label: 'Todos', icon: Layers },
  { id: 'mejor_jugada', label: 'Mejores Jugadas', icon: Star },
  { id: 'transmision_completa', label: 'Transmisiones', icon: Radio },
  { id: 'saque_as', label: 'Saques As', icon: Zap },
  { id: 'punto_campeonato', label: 'Puntos de Match', icon: Trophy },
]

const handleReproducirClip = (clip: ClipBiblioteca) => {
  clipSeleccionadoId.value = clip.id
  incrementarVistas(clip.id)
}

const handleClipCreado = async (nuevo: Omit<ClipBiblioteca, 'id' | 'vistas' | 'likes' | 'fechaCreacion'>) => {
  if (!authStore.esAdmin) return
  await agregarClip(nuevo)
}

const handleEliminarClip = async (clipId: string) => {
  if (!authStore.esAdmin) return
  await eliminarClip(clipId)
  clipSeleccionadoId.value = null
}
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

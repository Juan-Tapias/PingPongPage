<template>
  <div class="min-h-screen w-full bg-slate-100 dark:bg-[#060a14] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 relative overflow-x-hidden">
    <!-- Fondo de Estadio y Cancha Reglamentaria -->
    <FondoEstadioCancha />

    <!-- Barra de Navegación Global -->
    <Navbar class="relative z-10" />

    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 relative z-10">
      <!-- Hero de la Biblioteca (Estilo Twitch / YouTube Gaming) -->
      <div class="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-300/80 dark:border-slate-800/90 shadow-xl bg-[#080d1a] p-5 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div class="space-y-2 max-w-xl z-10">
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
        </div>

        <!-- Botón para subir o registrar nuevo clip -->
        <div class="flex items-center gap-3 z-10">
          <button
            type="button"
            class="px-4 py-3 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 active:scale-95 text-white font-black text-xs sm:text-sm shadow-xl shadow-orange-600/30 flex items-center gap-2 cursor-pointer transition-all border border-orange-400/30"
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
        <!-- Pestañas de Categoría -->
        <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-1 md:pb-0">
          <button
            v-for="cat in CATEGORIAS"
            :key="cat.id"
            type="button"
            :class="[
              'px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap border shrink-0',
              categoriaSeleccionada === cat.id
                ? 'bg-orange-500 text-white border-orange-400 shadow-md shadow-orange-500/20'
                : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 border-slate-200/80 dark:border-slate-700/60 hover:bg-slate-200 dark:hover:bg-slate-700'
            ]"
            @click="categoriaSeleccionada = cat.id"
          >
            {{ cat.label }}
          </button>
        </div>

        <!-- Buscador y Orden -->
        <div class="flex items-center gap-2.5">
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
            class="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 text-xs font-bold text-slate-700 dark:text-slate-300 focus:border-orange-500 outline-hidden transition-all cursor-pointer"
          >
            <option value="recientes">Más recientes</option>
            <option value="vistas">Más vistos</option>
            <option value="likes">Más likes</option>
          </select>
        </div>
      </div>

      <!-- Cuadrícula de Videos Estilo Twitch / YouTube -->
      <div v-if="clipsFiltrados.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-5">
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
        class="flex flex-col items-center justify-center p-12 bg-white dark:bg-[#0c1222] rounded-3xl border border-slate-200 dark:border-slate-800 text-center gap-3"
      >
        <div class="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-400 flex items-center justify-center">
          <Film class="w-7 h-7" />
        </div>
        <h3 class="text-base font-black text-slate-900 dark:text-white font-heading">
          No se encontraron videos
        </h3>
        <p class="text-xs text-slate-500 max-w-sm">
          No hay clips que coincidan con el filtro seleccionado. Prueba con otra categoría o publica el primero.
        </p>
        <button
          type="button"
          class="mt-2 px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs cursor-pointer shadow-md transition-all"
          @click="mostrarModalSubir = true"
        >
          Subir el primer clip
        </button>
      </div>
    </main>

    <!-- Modal Reproductor de Video -->
    <ModalReproductorVideo
      :clip="clipSeleccionado"
      @cerrar="clipSeleccionado = null"
      @like="darLike"
    />

    <!-- Modal para Subir o Enlazar Nuevo Clip -->
    <ModalSubirClip
      :visible="mostrarModalSubir"
      @cerrar="mostrarModalSubir = false"
      @clip-creado="handleClipCreado"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Film, Plus, Search } from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import FondoEstadioCancha from '@/components/FondoEstadioCancha.vue'
import TarjetaVideoBiblioteca from '../components/TarjetaVideoBiblioteca.vue'
import ModalReproductorVideo from '../components/ModalReproductorVideo.vue'
import ModalSubirClip from '../components/ModalSubirClip.vue'
import { useBibliotecaVideos } from '../composables/useBibliotecaVideos'
import type { ClipBiblioteca, CategoriaClip } from '../types'

const {
  clipsFiltrados,
  categoriaSeleccionada,
  busquedaTexto,
  ordenSeleccionado,
  agregarClip,
  incrementarVistas,
  darLike,
} = useBibliotecaVideos()

const clipSeleccionado = ref<ClipBiblioteca | null>(null)
const mostrarModalSubir = ref(false)

const CATEGORIAS: { id: CategoriaClip; label: string }[] = [
  { id: 'todos', label: '🔥 Todos' },
  { id: 'mejor_jugada', label: '⭐ Mejores Jugadas' },
  { id: 'transmision_completa', label: '🔴 Transmisiones' },
  { id: 'saque_as', label: '⚡ Saques As' },
  { id: 'punto_campeonato', label: '🏆 Puntos de Match' },
]

const handleReproducirClip = (clip: ClipBiblioteca) => {
  clipSeleccionado.value = clip
  incrementarVistas(clip.id)
}

const handleClipCreado = async (nuevo: Omit<ClipBiblioteca, 'id' | 'vistas' | 'likes' | 'fechaCreacion'>) => {
  await agregarClip(nuevo)
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

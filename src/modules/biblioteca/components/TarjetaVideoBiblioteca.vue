<template>
  <div
    class="group flex flex-col bg-white dark:bg-[#0c1222] border border-slate-200 dark:border-slate-800/90 rounded-2xl overflow-hidden shadow-xs hover:shadow-xl hover:border-slate-300 dark:hover:border-slate-700/80 transition-all duration-300 cursor-pointer select-none"
    @click="$emit('reproducir', clip)"
  >
    <!-- Contenedor de Miniatura y Badges Superpuestos -->
    <div class="relative w-full aspect-video bg-slate-950 overflow-hidden">
      <img
        :src="clip.miniaturaUrl || '/images/table-vertical.jpg'"
        :alt="clip.titulo"
        class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        loading="lazy"
      />

      <!-- Gradiente oscuro en miniatura -->
      <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

      <!-- Badge de Tipo de Clip -->
      <div class="absolute top-2.5 left-2.5 flex items-center gap-1.5 z-10">
        <span
          class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shadow-md backdrop-blur-md"
          :class="tipoBadgeClases"
        >
          {{ tipoEtiqueta }}
        </span>

        <span
          v-if="clip.mesa"
          class="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-black/60 text-white backdrop-blur-md border border-white/10"
        >
          {{ clip.mesa }}
        </span>
      </div>

      <!-- Duración del Video (Esquina inferior derecha) -->
      <div
        class="absolute bottom-2.5 right-2.5 px-1.5 py-0.5 rounded-md bg-black/85 backdrop-blur-xs text-[10px] font-mono font-bold text-white shadow-md z-10 flex items-center gap-1"
      >
        <Clock class="w-2.5 h-2.5 text-slate-400" />
        <span>{{ formatearDuracion(clip.duracionSegundos) }}</span>
      </div>

      <!-- Botón de Play Central Flotante al Hover -->
      <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
        <div class="w-12 h-12 rounded-full bg-orange-500/90 text-white flex items-center justify-center shadow-xl shadow-orange-600/40 transform scale-90 group-hover:scale-100 transition-transform">
          <Play class="w-5 h-5 fill-current ml-0.5" />
        </div>
      </div>
    </div>

    <!-- Contenido y Metadatos -->
    <div class="p-3.5 sm:p-4 flex flex-col flex-1 justify-between gap-3">
      <div class="space-y-1.5">
        <!-- Título del Clip -->
        <h3
          class="text-xs sm:text-sm font-black text-slate-900 dark:text-white line-clamp-2 group-hover:text-orange-500 transition-colors leading-snug font-heading"
          :title="clip.titulo"
        >
          {{ clip.titulo }}
        </h3>

        <!-- Enfrentamiento de Jugadores -->
        <div
          v-if="clip.jugador1?.nombre && clip.jugador2?.nombre"
          class="flex items-center gap-1 text-[11px] font-bold text-slate-600 dark:text-slate-300 truncate"
        >
          <span class="truncate">{{ clip.jugador1.nombre }}</span>
          <span class="text-orange-500 font-black text-[10px]">vs</span>
          <span class="truncate">{{ clip.jugador2.nombre }}</span>
        </div>

        <!-- Nombre del Torneo / Marcador del Momento -->
        <div class="flex items-center gap-1.5 text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          <Trophy class="w-3 h-3 text-orange-400 shrink-0" />
          <span class="truncate">{{ clip.torneoNombre || 'Torneo Oficial' }}</span>
          <span v-if="clip.marcadorMomento" class="font-mono text-slate-300 dark:text-slate-400">• {{ clip.marcadorMomento }}</span>
        </div>
      </div>

      <!-- Footer de la tarjeta con Vistas, Likes y Fecha -->
      <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-semibold">
        <div class="flex items-center gap-3">
          <span class="flex items-center gap-1 hover:text-slate-200 transition-colors">
            <Eye class="w-3 h-3 text-slate-400" />
            {{ clip.vistas }}
          </span>
          <button
            type="button"
            class="flex items-center gap-1 hover:text-rose-400 transition-colors cursor-pointer"
            title="Me gusta"
            @click.stop="$emit('like', clip.id)"
          >
            <Heart class="w-3 h-3 text-rose-500 fill-current" />
            {{ clip.likes }}
          </button>
        </div>

        <span class="text-[10px] text-slate-500 font-mono">
          {{ formatearFechaRelativa(clip.fechaCreacion) }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Play, Clock, Trophy, Eye, Heart } from 'lucide-vue-next'
import type { ClipBiblioteca } from '../types'

const props = defineProps<{
  clip: ClipBiblioteca
}>()

defineEmits<{
  (e: 'reproducir', clip: ClipBiblioteca): void
  (e: 'like', clipId: string): void
}>()

const tipoBadgeClases = computed(() => {
  switch (props.clip.tipo) {
    case 'transmision_completa':
      return 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
    case 'saque_as':
      return 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
    case 'punto_campeonato':
      return 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
    case 'mejor_jugada':
    default:
      return 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
  }
})

const tipoEtiqueta = computed(() => {
  switch (props.clip.tipo) {
    case 'transmision_completa':
      return 'Transmisión Completa'
    case 'saque_as':
      return 'Saque As'
    case 'punto_campeonato':
      return 'Punto de Match'
    case 'mejor_jugada':
    default:
      return 'Mejor Jugada'
  }
})

function formatearDuracion(segundos: number): string {
  if (!segundos) return '0:00'
  const mins = Math.floor(segundos / 60)
  const secs = Math.floor(segundos % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}

function formatearFechaRelativa(ts: number): string {
  if (!ts) return ''
  const diffSecs = Math.floor((Date.now() - ts) / 1000)
  if (diffSecs < 60) return 'Hace un momento'
  const diffMins = Math.floor(diffSecs / 60)
  if (diffMins < 60) return `Hace ${diffMins} min`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `Hace ${diffHours} h`
  const diffDays = Math.floor(diffHours / 24)
  return `Hace ${diffDays} d`
}
</script>

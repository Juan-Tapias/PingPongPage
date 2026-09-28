<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="clip"
        class="fixed inset-0 z-[80] flex items-center justify-center p-0 sm:p-4 bg-black/90 backdrop-blur-md select-none overflow-y-auto"
        @click.self="cerrar"
      >
        <div
          class="relative w-full max-w-5xl bg-slate-950 border-0 sm:border border-slate-800 rounded-none sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[100dvh] sm:max-h-[92dvh] animate-in zoom-in-95 duration-200 text-white"
        >
          <!-- Barra superior del reproductor -->
          <div class="px-4 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between shrink-0">
            <div class="flex items-center gap-2 min-w-0">
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/40">
                Reproductor Oficial
              </span>
              <h4 class="text-xs sm:text-sm font-bold text-slate-200 truncate">
                {{ clip.titulo }}
              </h4>
            </div>

            <button
              type="button"
              class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
              title="Cerrar video (Esc)"
              @click="cerrar"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Área del Reproductor de Video -->
          <div class="relative w-full bg-black aspect-video flex items-center justify-center overflow-hidden group">
            <video
              ref="videoRef"
              :src="clip.videoUrl"
              class="w-full h-full object-contain"
              playsinline
              autoplay
              @timeupdate="handleTimeUpdate"
              @loadedmetadata="handleLoadedMetadata"
              @ended="estaPausado = true"
              @click="alternarReproduccion"
            ></video>

            <!-- Overlay de Play/Pausa central al hacer clic -->
            <button
              v-if="estaPausado"
              type="button"
              class="absolute inset-0 m-auto w-16 h-16 rounded-full bg-orange-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer pointer-events-auto"
              @click.stop="alternarReproduccion"
            >
              <Play class="w-8 h-8 fill-current ml-1" />
            </button>

            <!-- Barra de Controles Inferior Integrada en el Video -->
            <div class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <!-- Barra de Progreso del Video -->
              <div class="relative w-full flex items-center">
                <input
                  type="range"
                  min="0"
                  :max="duracionTotal || 100"
                  step="0.1"
                  :value="tiempoActual"
                  class="w-full h-1 bg-white/20 hover:bg-white/40 rounded-full appearance-none cursor-pointer accent-orange-500 transition-all"
                  @input="handleSeek(($event.target as HTMLInputElement).valueAsNumber)"
                />
              </div>

              <!-- Controles de Reproducción, Tiempo, Sonido y Velocidad -->
              <div class="flex items-center justify-between gap-2 text-xs">
                <div class="flex items-center gap-3">
                  <!-- Play / Pausa -->
                  <button
                    type="button"
                    class="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                    :title="estaPausado ? 'Reproducir' : 'Pausar'"
                    @click="alternarReproduccion"
                  >
                    <Play v-if="estaPausado" class="w-4 h-4 fill-current" />
                    <Pause v-else class="w-4 h-4 fill-current" />
                  </button>

                  <!-- Control de Volumen -->
                  <div class="flex items-center gap-1.5 group/vol">
                    <button
                      type="button"
                      class="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                      @click="alternarMute"
                    >
                      <VolumeX v-if="muteado || volumen === 0" class="w-4 h-4 text-rose-400" />
                      <Volume2 v-else class="w-4 h-4 text-white" />
                    </button>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.05"
                      :value="muteado ? 0 : volumen"
                      class="hidden sm:inline-block w-14 sm:w-16 h-1 bg-white/20 rounded-full appearance-none cursor-pointer accent-orange-500"
                      @input="handleCambiarVolumen(($event.target as HTMLInputElement).valueAsNumber)"
                    />
                  </div>

                  <!-- Tiempo transcurrido / Total -->
                  <span class="font-mono text-[11px] text-slate-300">
                    {{ formatearSegundos(tiempoActual) }} / {{ formatearSegundos(duracionTotal) }}
                  </span>
                </div>

                <div class="flex items-center gap-2">
                  <!-- Selector de Velocidad (0.5x, 1x, 1.5x, 2x) -->
                  <button
                    type="button"
                    class="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-[11px] transition-colors cursor-pointer"
                    title="Cambiar velocidad de reproducción"
                    @click="ciclarVelocidad"
                  >
                    {{ velocidadActual }}x
                  </button>

                  <!-- Pantalla Completa del Reproductor -->
                  <button
                    type="button"
                    class="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                    title="Pantalla completa"
                    @click="alternarPantallaCompleta"
                  >
                    <Maximize class="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Detalles y Metadatos del Video -->
          <div class="p-4 sm:p-6 bg-slate-900/60 overflow-y-auto space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div class="space-y-1">
                <h2 class="text-base sm:text-xl font-black text-white font-heading">
                  {{ clip.titulo }}
                </h2>
                <p v-if="clip.descripcion" class="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  {{ clip.descripcion }}
                </p>
              </div>

              <!-- Botón Like -->
              <button
                type="button"
                class="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-2 cursor-pointer transition-all border border-slate-700/60 self-start shrink-0"
                @click="$emit('like', clip.id)"
              >
                <Heart class="w-4 h-4 text-rose-500 fill-current" />
                <span>{{ clip.likes }} Likes</span>
              </button>
            </div>

            <!-- Ficha Técnica del Partido -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800 text-xs">
              <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Torneo</span>
                <span class="font-extrabold text-white truncate block">{{ clip.torneoNombre || 'Oficial' }}</span>
              </div>

              <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Mesa</span>
                <span class="font-extrabold text-orange-400 block">{{ clip.mesa || 'Mesa Central' }}</span>
              </div>

              <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Momento</span>
                <span class="font-mono font-bold text-emerald-400 block">{{ clip.marcadorMomento || 'En Vivo' }}</span>
              </div>

              <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Grabado por</span>
                <span class="font-bold text-slate-300 truncate block">{{ clip.creadorNombre }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onUnmounted } from 'vue'
import { X, Play, Pause, Volume2, VolumeX, Maximize, Heart } from 'lucide-vue-next'
import type { ClipBiblioteca } from '../types'

const props = defineProps<{
  clip: ClipBiblioteca | null
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'like', clipId: string): void
}>()

const videoRef = ref<HTMLVideoElement | null>(null)
const estaPausado = ref(false)
const tiempoActual = ref(0)
const duracionTotal = ref(0)
const volumen = ref(0.8)
const muteado = ref(false)
const velocidadActual = ref(1)

const VELOCIDADES = [0.5, 1, 1.25, 1.5, 2]

watch(
  () => props.clip,
  (nuevoClip) => {
    if (nuevoClip) {
      tiempoActual.value = 0
      estaPausado.value = false
      velocidadActual.value = 1
    }
  },
)

const alternarReproduccion = () => {
  const v = videoRef.value
  if (!v) return
  if (v.paused) {
    v.play()
    estaPausado.value = false
  } else {
    v.pause()
    estaPausado.value = true
  }
}

const handleTimeUpdate = () => {
  if (videoRef.value) {
    tiempoActual.value = videoRef.value.currentTime
  }
}

const handleLoadedMetadata = () => {
  if (videoRef.value) {
    duracionTotal.value = videoRef.value.duration
    videoRef.value.volume = volumen.value
    videoRef.value.muted = muteado.value
  }
}

const handleSeek = (segundo: number) => {
  if (videoRef.value) {
    videoRef.value.currentTime = segundo
    tiempoActual.value = segundo
  }
}

const alternarMute = () => {
  muteado.value = !muteado.value
  if (videoRef.value) {
    videoRef.value.muted = muteado.value
  }
}

const handleCambiarVolumen = (nuevoVol: number) => {
  volumen.value = nuevoVol
  muteado.value = nuevoVol === 0
  if (videoRef.value) {
    videoRef.value.volume = nuevoVol
    videoRef.value.muted = muteado.value
  }
}

const ciclarVelocidad = () => {
  const idx = VELOCIDADES.indexOf(velocidadActual.value)
  const siguiente = VELOCIDADES[(idx + 1) % VELOCIDADES.length] ?? 1
  velocidadActual.value = siguiente
  if (videoRef.value) {
    videoRef.value.playbackRate = siguiente
  }
}

const alternarPantallaCompleta = () => {
  const el = videoRef.value
  if (!el) return
  if (document.fullscreenElement) {
    document.exitFullscreen().catch(() => {})
  } else {
    el.requestFullscreen().catch(() => {})
  }
}

const cerrar = () => {
  if (videoRef.value) {
    videoRef.value.pause()
  }
  emit('cerrar')
}

const handleKeydown = (e: KeyboardEvent) => {
  if (!props.clip) return
  if (e.key === 'Escape') {
    cerrar()
  } else if (e.key === ' ' && e.target === document.body) {
    e.preventDefault()
    alternarReproduccion()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})

function formatearSegundos(s: number): string {
  if (!s || isNaN(s)) return '0:00'
  const mins = Math.floor(s / 60)
  const secs = Math.floor(s % 60)
  return `${mins}:${secs.toString().padStart(2, '0')}`
}
</script>

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
              <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/40 shrink-0">
                Reproductor Oficial
              </span>
              <h4 class="text-xs sm:text-sm font-bold text-slate-200 truncate">
                {{ clip.titulo }}
              </h4>
            </div>

            <div class="flex items-center gap-2">
              <button
                type="button"
                class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer shrink-0"
                title="Cerrar video (Esc)"
                @click="cerrar"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- Área del Reproductor de Video -->
          <div class="relative w-full bg-black aspect-video flex items-center justify-center overflow-hidden group">
            <!-- REPRODUCTOR DE YOUTUBE SI EL ENLACE ES DE YOUTUBE -->
            <iframe
              v-if="youtubeId"
              :src="`https://www.youtube-nocookie.com/embed/${youtubeId}?autoplay=1&rel=0`"
              title="Reproductor de YouTube"
              class="w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowfullscreen
            ></iframe>

            <!-- REPRODUCTOR NATIVO HTML5 PARA MP4 / WEBM -->
            <template v-else>
              <video
                ref="videoRef"
                :src="clip.videoUrl"
                class="w-full h-full object-contain"
                playsinline
                autoplay
                @timeupdate="handleTimeUpdate"
                @loadedmetadata="handleLoadedMetadata"
                @ended="estaPausado = true"
                @error="handleVideoError"
                @click="alternarReproduccion"
              ></video>

              <!-- Aviso si el video es un blob local inaccesible en este equipo -->
              <div
                v-if="errorReproduccion"
                class="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center gap-3 z-30"
              >
                <div class="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                  <AlertTriangle class="w-6 h-6" />
                </div>
                <h4 class="text-sm font-bold text-white">Video no disponible en este dispositivo</h4>
                <p class="text-xs text-slate-400 max-w-md leading-relaxed">
                  Este archivo fue seleccionado temporalmente en otro computador y no fue subido a la nube.
                  <span v-if="authStore.esAdmin" class="text-orange-400 block mt-1">
                    Como administrador, puedes eliminar este registro y volver a subirlo con el nuevo sistema de nube.
                  </span>
                </p>
                <button
                  v-if="authStore.esAdmin"
                  type="button"
                  class="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                  @click="abrirConfirmacionEliminar"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                  <span>Eliminar Registro Roto</span>
                </button>
              </div>

              <!-- Overlay de Play/Pausa central al hacer clic -->
              <button
                v-if="estaPausado && !errorReproduccion"
                type="button"
                class="absolute inset-0 m-auto w-16 h-16 rounded-full bg-orange-600/90 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all cursor-pointer pointer-events-auto"
                @click.stop="alternarReproduccion"
              >
                <Play class="w-8 h-8 fill-current ml-1" />
              </button>

              <!-- Barra de Controles Inferior Integrada en el Video -->
              <div
                v-if="!errorReproduccion"
                class="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 sm:p-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              >
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
                    <button
                      type="button"
                      class="p-1 rounded-lg hover:bg-white/10 text-white transition-colors cursor-pointer"
                      :title="estaPausado ? 'Reproducir' : 'Pausar'"
                      @click="alternarReproduccion"
                    >
                      <Play v-if="estaPausado" class="w-4 h-4 fill-current" />
                      <Pause v-else class="w-4 h-4 fill-current" />
                    </button>

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

                    <span class="font-mono text-[11px] text-slate-300">
                      {{ formatearSegundos(tiempoActual) }} / {{ formatearSegundos(duracionTotal) }}
                    </span>
                  </div>

                  <div class="flex items-center gap-2">
                    <button
                      type="button"
                      class="px-2 py-0.5 rounded-lg bg-white/10 hover:bg-white/20 text-white font-mono font-bold text-[11px] transition-colors cursor-pointer"
                      title="Cambiar velocidad de reproducción"
                      @click="ciclarVelocidad"
                    >
                      {{ velocidadActual }}x
                    </button>

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
            </template>
          </div>

          <!-- Detalles y Metadatos del Video -->
          <div class="p-4 sm:p-6 bg-slate-900/60 overflow-y-auto space-y-4">
            <div class="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
              <div class="space-y-1 flex-1">
                <h2 class="text-base sm:text-xl font-black text-white font-heading">
                  {{ clip.titulo }}
                </h2>
                <p v-if="clip.descripcion" class="text-xs sm:text-sm text-slate-300 font-medium leading-relaxed">
                  {{ clip.descripcion }}
                </p>
              </div>

              <!-- Botones de Acción (Like, Compartir, Eliminar Admin) -->
              <div class="flex items-center gap-2 shrink-0 flex-wrap">
                <!-- Botón Like con Estado Reactivo y Animación -->
                <button
                  type="button"
                  class="px-3.5 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 cursor-pointer transition-all active:scale-95 border"
                  :class="[
                    yaDioLike
                      ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 shadow-md shadow-rose-500/10'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white border-slate-700/60'
                  ]"
                  @click="handleLike"
                >
                  <Heart
                    class="w-4 h-4 transition-transform duration-200"
                    :class="[
                      yaDioLike ? 'text-rose-500 fill-rose-500 scale-110' : 'text-slate-400',
                      animandoLike ? 'scale-125' : ''
                    ]"
                  />
                  <span>{{ clip.likes }} Likes</span>
                </button>

                <!-- Botón Compartir / Copiar Enlace -->
                <button
                  type="button"
                  class="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-slate-700/60"
                  title="Compartir o copiar enlace"
                  @click="copiarEnlace"
                >
                  <Share2 class="w-3.5 h-3.5 text-sky-400" />
                  <span>{{ copiado ? '¡Copiado!' : 'Compartir' }}</span>
                </button>

                <!-- Botón Eliminar Clip (SOLO PARA ADMINS) -->
                <button
                  v-if="authStore.esAdmin"
                  type="button"
                  class="px-3 py-1.5 rounded-xl bg-rose-500/15 hover:bg-rose-500/25 text-rose-400 hover:text-rose-300 font-bold text-xs flex items-center gap-1.5 cursor-pointer transition-all border border-rose-500/30"
                  title="Eliminar este clip permanentemente"
                  @click="abrirConfirmacionEliminar"
                >
                  <Trash2 class="w-3.5 h-3.5" />
                  <span>Eliminar</span>
                </button>
              </div>
            </div>

            <!-- Ficha Técnica del Partido -->
            <div class="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-slate-800 text-xs">
              <div class="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                <span class="text-[10px] uppercase font-bold text-slate-400 block">Torneo</span>
                <span class="font-extrabold text-white truncate block">{{ clip.torneoNombre || 'Torneo Oficial' }}</span>
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
                <span class="font-bold text-slate-300 truncate block">{{ clip.creadorNombre || 'Oficial' }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Modal Secundario de Confirmación de Eliminación (Solo Admin) -->
        <div
          v-if="mostrarConfirmacionEliminar"
          class="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs"
          @click.self="mostrarConfirmacionEliminar = false"
        >
          <div class="w-full max-w-sm bg-slate-900 border border-slate-700 rounded-2xl p-5 shadow-2xl space-y-3 text-center">
            <div class="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto">
              <Trash2 class="w-6 h-6" />
            </div>
            <h3 class="text-sm font-black text-white">¿Eliminar este clip?</h3>
            <p class="text-xs text-slate-400 leading-relaxed">
              Esta acción borrará el clip permanentemente de la biblioteca para todos los usuarios.
            </p>
            <div class="flex items-center gap-2 pt-2">
              <button
                type="button"
                class="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer transition-colors"
                @click="mostrarConfirmacionEliminar = false"
              >
                Cancelar
              </button>
              <button
                type="button"
                class="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-black text-xs cursor-pointer shadow-md transition-colors"
                @click="confirmarEliminar"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted, onUnmounted } from 'vue'
import {
  X,
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Heart,
  Share2,
  Trash2,
  AlertTriangle,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import { extraerIdYoutube, esUrlBlobLocal } from '../service/storageService'
import type { ClipBiblioteca } from '../types'

const props = defineProps<{
  clip: ClipBiblioteca | null
  yaDioLike?: boolean
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'like', clipId: string): void
  (e: 'eliminar', clipId: string): void
}>()

const authStore = useAuthStore()

const videoRef = ref<HTMLVideoElement | null>(null)
const estaPausado = ref(false)
const tiempoActual = ref(0)
const duracionTotal = ref(0)
const volumen = ref(0.8)
const muteado = ref(false)
const velocidadActual = ref(1)
const errorReproduccion = ref(false)
const animandoLike = ref(false)
const copiado = ref(false)
const mostrarConfirmacionEliminar = ref(false)

const VELOCIDADES = [0.5, 1, 1.25, 1.5, 2]

const youtubeId = computed(() => {
  if (!props.clip?.videoUrl) return null
  return extraerIdYoutube(props.clip.videoUrl)
})

watch(
  () => props.clip,
  (nuevoClip) => {
    if (nuevoClip) {
      tiempoActual.value = 0
      estaPausado.value = false
      velocidadActual.value = 1
      errorReproduccion.value = false
      mostrarConfirmacionEliminar.value = false

      // Si es un blob local y no estamos en la misma sesión, anticipar error
      if (esUrlBlobLocal(nuevoClip.videoUrl)) {
        // Permitir que intente cargarlo; si falla, el evento @error lo atrapará
      }
    }
  },
)

const alternarReproduccion = () => {
  const v = videoRef.value
  if (!v) return
  if (v.paused) {
    v.play().catch(() => {})
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
    errorReproduccion.value = false
  }
}

const handleVideoError = () => {
  errorReproduccion.value = true
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

const handleLike = () => {
  if (!props.clip) return
  animandoLike.value = true
  setTimeout(() => (animandoLike.value = false), 300)
  emit('like', props.clip.id)
}

const copiarEnlace = async () => {
  try {
    const url = window.location.href
    await navigator.clipboard.writeText(url)
    copiado.value = true
    setTimeout(() => (copiado.value = false), 2500)
  } catch {}
}

const abrirConfirmacionEliminar = () => {
  if (!authStore.esAdmin) return
  mostrarConfirmacionEliminar.value = true
}

const confirmarEliminar = () => {
  if (!props.clip || !authStore.esAdmin) return
  mostrarConfirmacionEliminar.value = false
  emit('eliminar', props.clip.id)
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
  } else if (e.key === ' ' && e.target === document.body && !youtubeId.value) {
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

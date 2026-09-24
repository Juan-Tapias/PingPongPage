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
        v-if="visible"
        ref="modalContainerRef"
        class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md select-none overflow-y-auto"
      >
        <div
          class="relative w-full max-w-5xl bg-slate-950 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96dvh]"
        >
          <!-- CABECERA DE INFORMACIÓN DEL PARTIDO -->
          <div
            class="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3.5 bg-slate-900/95 border-b border-slate-800/80 z-20"
          >
            <!-- Badge En Vivo y Espectadores -->
            <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs"
              >
                <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                En Vivo
              </span>

              <span
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-slate-300 bg-slate-800/80 border border-slate-700/60"
              >
                <Eye class="w-3.5 h-3.5 text-sky-400" />
                <span>{{ totalEspectadores }} {{ totalEspectadores === 1 ? 'espectador' : 'espectadores' }}</span>
              </span>

              <span
                v-if="partido?.transmisorNombre"
                class="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium"
              >
                Árbitro: <strong class="text-white font-bold">{{ partido.transmisorNombre }}</strong>
              </span>
            </div>

            <!-- Botones de Navegación y Cierre -->
            <div class="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar transmisión"
                @click="close"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- ÁREA DE VIDEO PRINCIPAL (RESPONSIVE) -->
          <div
            ref="videoContainerRef"
            class="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden group"
          >
            <!-- Elemento de Video WebRTC Remoto -->
            <video
              ref="videoElementRef"
              autoplay
              playsinline
              class="w-full h-full object-cover"
              @volumechange="handleVolumeChange"
            ></video>

            <!-- ESTADO DE CARGA / CONECTANDO -->
            <div
              v-if="cargandoConexion && !streamRemoto"
              class="absolute inset-0 bg-slate-950/80 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white z-10 p-4 text-center"
            >
              <div class="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
              <p class="text-xs sm:text-sm font-extrabold uppercase tracking-wide">
                Conectando con la cámara de la mesa...
              </p>
              <span class="text-[11px] text-slate-400">Latencia ultra-baja WebRTC P2P</span>
            </div>

            <!-- ALERTA SI LA TRANSMISIÓN NO ESTÁ DISPONIBLE -->
            <div
              v-else-if="!streamRemoto"
              class="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2 text-slate-400 p-4 text-center"
            >
              <VideoOff class="w-12 h-12 text-slate-600" />
              <p class="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                La transmisión ha finalizado o está en pausa
              </p>
              <span class="text-[11px] text-slate-500">
                El árbitro o administrador reactivará la señal pronto.
              </span>
            </div>

            <!-- OVERLAY DE AUDIO SILENCIADO (POLÍTICA AUTOPLAY DEL NAVEGADOR) -->
            <button
              v-if="audioSilenciadoPorNavegador"
              type="button"
              class="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs shadow-2xl flex items-center gap-2 cursor-pointer transition-all animate-bounce"
              @click="activarAudioNativo"
            >
              <VolumeX class="w-4 h-4" />
              <span>Toca aquí para activar el sonido 🔊</span>
            </button>

            <!-- MARCADOR DEPORTIVO SUPERPUESTO (HUD OFICIAL ESTILO TV DEPORTIVA) -->
            <div
              v-if="partido"
              class="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 flex flex-col gap-1 max-w-[88%] sm:max-w-md pointer-events-none drop-shadow-2xl"
            >
              <div
                class="bg-black/85 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-2xl text-white"
              >
                <!-- Jugador 1 -->
                <div
                  class="flex items-center justify-between px-2.5 sm:px-3.5 py-1.5 border-b border-white/10 gap-3"
                  :class="{ 'bg-emerald-500/20': partido.marcador && Number(puntosJ1) > Number(puntosJ2) }"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                    <span class="text-xs sm:text-sm font-black truncate max-w-28 sm:max-w-44">
                      {{ partido.jugador1?.nombre || 'Jugador 1' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 font-mono font-black text-xs sm:text-sm shrink-0">
                    <span class="text-slate-400 text-[10px] sm:text-xs">({{ setsGanadosJ1 }})</span>
                    <span class="px-2 py-0.5 rounded bg-white/10 text-white min-w-6 text-center">
                      {{ puntosJ1 }}
                    </span>
                  </div>
                </div>

                <!-- Jugador 2 -->
                <div
                  class="flex items-center justify-between px-2.5 sm:px-3.5 py-1.5 gap-3"
                  :class="{ 'bg-sky-500/20': partido.marcador && Number(puntosJ2) > Number(puntosJ1) }"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="w-2 h-2 rounded-full bg-sky-400 shrink-0"></span>
                    <span class="text-xs sm:text-sm font-black truncate max-w-28 sm:max-w-44">
                      {{ partido.jugador2?.nombre || 'Jugador 2' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-2 font-mono font-black text-xs sm:text-sm shrink-0">
                    <span class="text-slate-400 text-[10px] sm:text-xs">({{ setsGanadosJ2 }})</span>
                    <span class="px-2 py-0.5 rounded bg-white/10 text-white min-w-6 text-center">
                      {{ puntosJ2 }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Badge de Ronda / Estado -->
              <div class="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase text-white/90">
                <span class="px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs border border-white/10">
                  Ronda {{ partido.ronda || partido.jornada || 1 }}
                </span>
                <span class="px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs border border-white/10">
                  SpinApp Torneo Live
                </span>
              </div>
            </div>

            <!-- LLUVIA DE REACCIONES FLOTANTES (EMOJIS) -->
            <div class="absolute right-3 sm:right-6 bottom-16 sm:bottom-20 z-20 flex flex-col items-center gap-2 pointer-events-none">
              <TransitionGroup
                enter-active-class="transition duration-500 ease-out"
                enter-from-class="opacity-0 translate-y-8 scale-50"
                enter-to-class="opacity-100 translate-y-0 scale-125"
                leave-active-class="transition duration-1000 ease-in"
                leave-from-class="opacity-100 translate-y-0 scale-125"
                leave-to-class="opacity-0 -translate-y-28 scale-150"
              >
                <div
                  v-for="reac in ultimasReacciones"
                  :key="reac.id || reac.timestamp"
                  class="text-2xl sm:text-4xl filter drop-shadow-[0_0_12px_rgba(0,0,0,0.9)] select-none animate-bounce"
                >
                  {{ reac.emoji }}
                </div>
              </TransitionGroup>
            </div>

            <!-- BARRA DE REACCIONES RÁPIDAS (ACCESIBLE CON UN SOLO TOQUE) -->
            <div
              class="absolute bottom-2 left-2 sm:bottom-4 sm:left-4 z-20 flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/15"
            >
              <button
                v-for="btn in botonesReaccion"
                :key="btn.emoji"
                type="button"
                class="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/10 hover:bg-white/20 active:scale-125 transition-all text-base sm:text-xl flex items-center justify-center cursor-pointer shadow-xs"
                :title="btn.nombre"
                @click="enviarReaccionLocal(btn.emoji)"
              >
                {{ btn.emoji }}
              </button>
            </div>

            <!-- CONTROLES FLOTANTES EN LA ESQUINA INFERIOR DERECHA -->
            <div
              class="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/15"
            >
              <!-- Silenciar / Activar Sonido -->
              <button
                type="button"
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                :title="audioMuteado ? 'Activar sonido' : 'Silenciar sonido'"
                @click="alternarSonido"
              >
                <VolumeX v-if="audioMuteado" class="w-4 h-4 text-rose-400" />
                <Volume2 v-else class="w-4 h-4 text-emerald-400" />
              </button>

              <!-- Picture-in-Picture (PiP) -->
              <button
                v-if="soportaPiP"
                type="button"
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Ver en ventana flotante (Picture-in-Picture)"
                @click="alternarPiP"
              >
                <PictureInPicture2 class="w-4 h-4 text-sky-400" />
              </button>

              <!-- Pantalla Completa -->
              <button
                type="button"
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Pantalla completa"
                @click="alternarPantallaCompleta"
              >
                <Maximize v-if="!esPantallaCompleta" class="w-4 h-4 text-white" />
                <Minimize v-else class="w-4 h-4 text-white" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import {
  Eye,
  X,
  VideoOff,
  Volume2,
  VolumeX,
  PictureInPicture2,
  Maximize,
  Minimize,
} from 'lucide-vue-next'
import type { PartidoGrupo, ReaccionLive, TipoReaccionLive } from '@/types'

const props = defineProps<{
  partido: PartidoGrupo | null
  streamRemoto: MediaStream | null
  totalEspectadores: number
  cargandoConexion: boolean
  reacciones: ReaccionLive[]
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'enviar-reaccion', emoji: TipoReaccionLive): void
}>()

const visible = ref(false)
const videoContainerRef = ref<HTMLDivElement | null>(null)
const videoElementRef = ref<HTMLVideoElement | null>(null)
const audioMuteado = ref(false)
const audioSilenciadoPorNavegador = ref(false)
const esPantallaCompleta = ref(false)
const soportaPiP = ref(false)

const botonesReaccion: { emoji: TipoReaccionLive; nombre: string }[] = [
  { emoji: '🏓', nombre: 'Punto de Ping Pong' },
  { emoji: '🔥', nombre: '¡Gran Jugada!' },
  { emoji: '👏', nombre: 'Aplausos' },
  { emoji: '🏆', nombre: '¡Punto de Partido!' },
]

// Vincular el MediaStream recibido a la etiqueta <video>
watch(
  () => props.streamRemoto,
  (nuevoStream) => {
    if (videoElementRef.value && nuevoStream) {
      videoElementRef.value.srcObject = nuevoStream
      videoElementRef.value.play().catch(() => {
        // El navegador requiere interacción para desmutear
        audioSilenciadoPorNavegador.value = true
        if (videoElementRef.value) {
          videoElementRef.value.muted = true
          videoElementRef.value.play().catch(() => {})
        }
      })
    }
  },
  { immediate: true },
)

const ultimasReacciones = computed(() => {
  return props.reacciones.slice(0, 5)
})

const setsGanadosJ1 = computed(() => {
  if (!props.partido?.sets) return 0
  return props.partido.sets.filter((s) => s.ganadorId === props.partido?.jugador1Id).length
})

const setsGanadosJ2 = computed(() => {
  if (!props.partido?.sets) return 0
  return props.partido.sets.filter((s) => s.ganadorId === props.partido?.jugador2Id).length
})

const setActual = computed(() => {
  if (!props.partido?.sets || props.partido.sets.length === 0) return null
  return props.partido.sets[props.partido.sets.length - 1]
})

const puntosJ1 = computed(() => {
  if (setActual.value) return setActual.value.puntosJugador1
  return 0
})

const puntosJ2 = computed(() => {
  if (setActual.value) return setActual.value.puntosJugador2
  return 0
})

const activarAudioNativo = () => {
  if (videoElementRef.value) {
    videoElementRef.value.muted = false
    audioMuteado.value = false
    audioSilenciadoPorNavegador.value = false
    videoElementRef.value.play().catch(() => {})
  }
}

const alternarSonido = () => {
  if (videoElementRef.value) {
    videoElementRef.value.muted = !videoElementRef.value.muted
    audioMuteado.value = videoElementRef.value.muted
  }
}

const handleVolumeChange = () => {
  if (videoElementRef.value) {
    audioMuteado.value = videoElementRef.value.muted
  }
}

const alternarPiP = async () => {
  if (!videoElementRef.value) return
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
    } else {
      await videoElementRef.value.requestPictureInPicture()
    }
  } catch (err) {
    console.warn('Error al activar Picture-in-Picture:', err)
  }
}

const alternarPantallaCompleta = () => {
  const container = videoContainerRef.value
  if (!container) return

  if (!document.fullscreenElement) {
    container.requestFullscreen().then(() => {
      esPantallaCompleta.value = true
    }).catch(() => {})
  } else {
    document.exitFullscreen().then(() => {
      esPantallaCompleta.value = false
    }).catch(() => {})
  }
}

const enviarReaccionLocal = (emoji: TipoReaccionLive) => {
  emit('enviar-reaccion', emoji)
}

const open = () => {
  visible.value = true
  setTimeout(() => {
    soportaPiP.value = 'pictureInPictureEnabled' in document
    if (videoElementRef.value && props.streamRemoto) {
      videoElementRef.value.srcObject = props.streamRemoto
      videoElementRef.value.play().catch(() => {
        audioSilenciadoPorNavegador.value = true
      })
    }
  }, 100)
}

const close = () => {
  visible.value = false
  emit('cerrar')
}

defineExpose({
  open,
  close,
})
</script>

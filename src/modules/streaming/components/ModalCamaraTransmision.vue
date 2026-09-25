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
        class="fixed inset-0 z-[70] flex items-center justify-center p-2 sm:p-4 bg-black/90 backdrop-blur-md select-none overflow-y-auto"
      >
        <div
          class="relative w-full max-w-4xl bg-slate-950 border border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[96dvh]"
        >
          <!-- CABECERA DE TRANSMISIÓN -->
          <div
            class="flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3.5 bg-slate-900/90 border-b border-slate-800/80 z-20"
          >
            <!-- Badge En Vivo, Temporizador 1 Hora y Espectadores -->
            <div class="flex items-center gap-2 sm:gap-3 flex-wrap">
              <span
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs"
              >
                <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                Transmitiendo en Vivo
              </span>

              <!-- Límite de llamada: 1 hora -->
              <span
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40"
                title="Límite máximo de llamada: 1 hora (60 minutos)"
              >
                <Clock class="w-3.5 h-3.5 text-amber-400" />
                <span>{{ tiempoTranscurridoInterno || tiempoFormateado || '00:00' }} / 60:00</span>
              </span>

              <span
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-slate-300 bg-slate-800/80 border border-slate-700/60"
              >
                <Users class="w-3.5 h-3.5 text-sky-400" />
                <span>{{ totalEspectadores }} {{ totalEspectadores === 1 ? 'espectador' : 'espectadores' }}</span>
              </span>
            </div>

            <!-- Botones de Acción Rápida -->
            <div class="flex items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                class="px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-extrabold text-xs transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                title="Minimizar cámara (seguirás transmitiendo en segundo plano)"
                @click="visible = false"
              >
                <Minimize2 class="w-3.5 h-3.5" />
                <span class="hidden sm:inline">Minimizar</span>
              </button>

              <button
                type="button"
                class="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                @click="confirmarFinalizarTransmision"
              >
                <Square class="w-3 h-3 fill-current" />
                <span class="hidden sm:inline">Finalizar</span>
              </button>
            </div>
          </div>

          <!-- ÁREA DE VIDEO / CÁMARA LOCAL -->
          <div class="relative w-full aspect-video bg-black flex items-center justify-center overflow-hidden">
            <!-- Video en tiempo real del emisor -->
            <video
              ref="videoElementRef"
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover transform transition-transform"
              :class="{ '-scale-x-100': !camaraTrasera }"
            ></video>

            <!-- Overlay cuando el stream local está inicializándose -->
            <div
              v-if="!streamLocal"
              class="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center gap-3 text-slate-300 p-4 text-center z-10"
            >
              <div class="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <p class="text-xs font-black uppercase tracking-wider text-emerald-400">
                Iniciando Cámara y Micrófono...
              </p>
              <p class="text-[11px] text-slate-400 max-w-xs">
                Asegúrate de conceder permisos de cámara y micrófono si tu navegador lo solicita.
              </p>
            </div>

            <!-- Overlay cuando el video está desactivado -->
            <div
              v-else-if="!videoActivo"
              class="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2 text-slate-400"
            >
              <VideoOff class="w-12 h-12 text-slate-600" />
              <p class="text-xs font-bold uppercase tracking-wider">Cámara en Pausa</p>
            </div>

            <!-- MARCADOR DEPORTIVO SUPERPUESTO (HUD OFICIAL DE TV) -->
            <div
              v-if="partidoActivo"
              class="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 flex flex-col gap-1 max-w-[85%] sm:max-w-md pointer-events-none drop-shadow-2xl"
            >
              <div
                class="bg-black/80 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-2xl text-white"
              >
                <!-- Jugador 1 -->
                <div
                  class="flex items-center justify-between px-2.5 sm:px-3.5 py-1.5 border-b border-white/10 gap-3"
                  :class="{ 'bg-emerald-500/20': Number(puntosJ1) > Number(puntosJ2) }"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                    <span v-if="servidorActual === 1" class="text-[11px]" title="Al Saque">🏓</span>
                    <span class="text-xs sm:text-sm font-black truncate max-w-28 sm:max-w-44">
                      {{ partidoActivo.jugador1?.nombre || 'Jugador 1' }}
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
                  :class="{ 'bg-sky-500/20': Number(puntosJ2) > Number(puntosJ1) }"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="w-2 h-2 rounded-full bg-sky-400"></span>
                    <span v-if="servidorActual === 2" class="text-[11px]" title="Al Saque">🏓</span>
                    <span class="text-xs sm:text-sm font-black truncate max-w-28 sm:max-w-44">
                      {{ partidoActivo.jugador2?.nombre || 'Jugador 2' }}
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

              <!-- Badge de Ronda / Estado / Mesa -->
              <div class="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase text-white/90">
                <span class="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs border border-white/10 text-emerald-400 font-bold">
                  {{ marcadorEnVivo?.setActual || 'Set 1' }}
                </span>
                <span class="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs border border-white/10">
                  {{ marcadorEnVivo?.mesa || partidoActivo.mesa || 'Mesa 1' }}
                </span>
                <span class="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs border border-white/10">
                  Ronda {{ partidoActivo.ronda || partidoActivo.jornada || 1 }}
                </span>
              </div>
            </div>

            <!-- LLUVIA DE REACCIONES DE ESPECTADORES -->
            <div class="absolute right-3 sm:right-6 bottom-16 sm:bottom-20 z-10 flex flex-col items-center gap-2 pointer-events-none">
              <TransitionGroup
                enter-active-class="transition duration-500 ease-out"
                enter-from-class="opacity-0 translate-y-8 scale-50"
                enter-to-class="opacity-100 translate-y-0 scale-125"
                leave-active-class="transition duration-1000 ease-in"
                leave-from-class="opacity-100 translate-y-0 scale-125"
                leave-to-class="opacity-0 -translate-y-24 scale-150"
              >
                <div
                  v-for="reac in ultimasReacciones"
                  :key="reac.id || reac.timestamp"
                  class="text-2xl sm:text-4xl filter drop-shadow-[0_0_10px_rgba(0,0,0,0.8)] select-none"
                >
                  {{ reac.emoji }}
                </div>
              </TransitionGroup>
            </div>
          </div>

          <!-- BARRA DE CONTROLES INFERIOR (100% RESPONSIVE) -->
          <div
            class="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 z-20"
          >
            <!-- Controles de Medios Hardware -->
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Alternar Cámara (Frontal / Trasera) -->
              <button
                type="button"
                class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-slate-700/60 shadow-xs"
                :title="camaraTrasera ? 'Cambiar a cámara frontal' : 'Cambiar a cámara trasera'"
                @click="alternarCamara"
              >
                <SwitchCamera class="w-4 h-4 text-sky-400" />
                <span class="hidden xs:inline">{{ camaraTrasera ? 'Cámara Trasera' : 'Cámara Frontal' }}</span>
              </button>

              <!-- Silenciar / Activar Micrófono -->
              <button
                type="button"
                class="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer border shadow-xs"
                :class="audioActivo ? 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border-emerald-500/50' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'"
                @click="alternarAudio"
              >
                <Mic v-if="audioActivo" class="w-4 h-4 text-emerald-400" />
                <MicOff v-else class="w-4 h-4 text-rose-400" />
                <span>{{ audioActivo ? 'Micrófono ON' : 'Mic Silenciado' }}</span>
              </button>

              <!-- Pausar / Activar Video -->
              <button
                type="button"
                class="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border shadow-xs"
                :class="videoActivo ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700/60' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'"
                @click="alternarVideo"
              >
                <Video v-if="videoActivo" class="w-4 h-4 text-emerald-400" />
                <VideoOff v-else class="w-4 h-4 text-rose-400" />
                <span class="hidden sm:inline">{{ videoActivo ? 'Cámara ON' : 'Cámara OFF' }}</span>
              </button>
            </div>

            <p class="text-[11px] text-slate-400 font-medium text-right hidden md:block">
              Consejo: Ubica el celular en posición horizontal apuntando a la mesa de ping pong.
            </p>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  Users,
  Square,
  SwitchCamera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Clock,
  Minimize2,
} from 'lucide-vue-next'
import { doc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { PartidoGrupo, ReaccionLive } from '@/types'

const props = defineProps<{
  partido: PartidoGrupo | null
  streamLocal: MediaStream | null
  totalEspectadores: number
  camaraTrasera: boolean
  audioActivo: boolean
  videoActivo: boolean
  reacciones: ReaccionLive[]
  tiempoFormateado?: string
}>()

const emit = defineEmits<{
  (e: 'finalizar'): void
  (e: 'alternar-camara'): void
  (e: 'alternar-audio'): void
  (e: 'alternar-video'): void
}>()

const visible = ref(false)
const videoElementRef = ref<HTMLVideoElement | null>(null)

// Temporizador visual interno del modal
const segundosModal = ref(0)
let timerModal: any = null

const tiempoTranscurridoInterno = computed(() => {
  const mins = Math.floor(segundosModal.value / 60)
  const secs = segundosModal.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

// Sincronización en tiempo real del partido y marcador en vivo
const partidoRealTime = ref<any>(null)
let unsubPartido: Unsubscribe | null = null
let syncBroadcastTimer: any = null

const sincronizarEstadoTransmisionEnFirestore = async () => {
  const p = props.partido
  if (!p?.id || !visible.value) return

  const ahora = Date.now()
  const payload: any = {
    estado: 'en_curso',
    enVivo: true,
    transmisionActiva: true,
    ultimaSenalEnVivo: ahora,
    mesa: p.mesa || 'Mesa 1',
  }

  const pAny = p as any
  if (p.jugador1) payload.jugador1 = p.jugador1
  if (p.jugador2) payload.jugador2 = p.jugador2
  if (p.jugador1Id) payload.jugador1Id = p.jugador1Id
  if (p.jugador2Id) payload.jugador2Id = p.jugador2Id
  if (pAny.torneoId) payload.torneoId = pAny.torneoId
  if (p.ronda) payload.ronda = p.ronda
  if (p.jornada) payload.jornada = p.jornada
  if (p.numeroPartido) payload.numeroPartido = p.numeroPartido
  if (p.marcadorEnVivo) payload.marcadorEnVivo = p.marcadorEnVivo

  try {
    await setDoc(doc(db, 'partidos', p.id), payload, { merge: true })
  } catch (err) {
    console.warn('[ModalCamaraTransmision] Error al registrar partido activo en Firestore:', err)
  }
}

watch(
  visible,
  (esVisible) => {
    if (syncBroadcastTimer) {
      clearInterval(syncBroadcastTimer)
      syncBroadcastTimer = null
    }
    if (timerModal) {
      clearInterval(timerModal)
      timerModal = null
    }

    if (esVisible) {
      segundosModal.value = 0
      timerModal = setInterval(() => {
        segundosModal.value++
      }, 1000)

      sincronizarEstadoTransmisionEnFirestore()
      syncBroadcastTimer = setInterval(sincronizarEstadoTransmisionEnFirestore, 4000)
    }
  },
  { immediate: true },
)

const iniciarSuscripcionPartido = (id: string) => {
  if (unsubPartido) {
    unsubPartido()
    unsubPartido = null
  }
  if (!id) {
    partidoRealTime.value = null
    return
  }
  unsubPartido = onSnapshot(
    doc(db, 'partidos', id),
    (docSnap) => {
      if (docSnap.exists()) {
        partidoRealTime.value = { id: docSnap.id, ...docSnap.data() }
      }
    },
    (err) => {
      console.warn('[ModalCamaraTransmision] Error en suscripción a partido en vivo:', err)
    },
  )
}

watch(
  () => props.partido?.id,
  (nuevoId) => {
    if (nuevoId) {
      partidoRealTime.value = props.partido
      iniciarSuscripcionPartido(nuevoId)
      if (visible.value) {
        sincronizarEstadoTransmisionEnFirestore()
      }
    } else {
      if (unsubPartido) {
        unsubPartido()
        unsubPartido = null
      }
      partidoRealTime.value = null
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (unsubPartido) {
    unsubPartido()
    unsubPartido = null
  }
  if (syncBroadcastTimer) {
    clearInterval(syncBroadcastTimer)
    syncBroadcastTimer = null
  }
  if (timerModal) {
    clearInterval(timerModal)
    timerModal = null
  }
})

const partidoActivo = computed(() => partidoRealTime.value || props.partido)
const marcadorEnVivo = computed(() => partidoActivo.value?.marcadorEnVivo)

// Función robusta para vincular y reproducir el stream local de video
const acoplarVideoLocal = () => {
  if (videoElementRef.value && props.streamLocal) {
    videoElementRef.value.muted = true
    if (videoElementRef.value.srcObject !== props.streamLocal) {
      videoElementRef.value.srcObject = props.streamLocal
    }
    videoElementRef.value.play().catch((err) => {
      console.warn('Reproducción de cámara local esperando interacción o permiso:', err)
    })
  }
}

// Vincular el MediaStream local a la etiqueta <video> cuando cambie el stream o la visibilidad
watch(
  [visible, () => props.streamLocal],
  ([esVisible, stream]) => {
    if (esVisible && stream) {
      nextTick(() => {
        acoplarVideoLocal()
      })
    }
  },
  { immediate: true },
)

const ultimasReacciones = computed(() => {
  return props.reacciones.slice(0, 5)
})

const setsGanadosJ1 = computed(() => {
  if (marcadorEnVivo.value?.setsGanadosJ1 !== undefined) {
    return Number(marcadorEnVivo.value.setsGanadosJ1)
  }
  if (partidoActivo.value?.sets) {
    return partidoActivo.value.sets.filter((s: any) => s.ganadorId === partidoActivo.value?.jugador1Id).length
  }
  return 0
})

const setsGanadosJ2 = computed(() => {
  if (marcadorEnVivo.value?.setsGanadosJ2 !== undefined) {
    return Number(marcadorEnVivo.value.setsGanadosJ2)
  }
  if (partidoActivo.value?.sets) {
    return partidoActivo.value.sets.filter((s: any) => s.ganadorId === partidoActivo.value?.jugador2Id).length
  }
  return 0
})

const setActual = computed(() => {
  if (!partidoActivo.value?.sets || partidoActivo.value.sets.length === 0) return null
  return partidoActivo.value.sets[partidoActivo.value.sets.length - 1]
})

const puntosJ1 = computed(() => {
  if (marcadorEnVivo.value?.puntosJ1 !== undefined) {
    return Number(marcadorEnVivo.value.puntosJ1)
  }
  if (setActual.value?.puntosJugador1 !== undefined) {
    return Number(setActual.value.puntosJugador1)
  }
  return 0
})

const puntosJ2 = computed(() => {
  if (marcadorEnVivo.value?.puntosJ2 !== undefined) {
    return Number(marcadorEnVivo.value.puntosJ2)
  }
  if (setActual.value?.puntosJugador2 !== undefined) {
    return Number(setActual.value.puntosJugador2)
  }
  return 0
})

const servidorActual = computed(() => marcadorEnVivo.value?.servidorActual || 1)

const alternarCamara = () => emit('alternar-camara')
const alternarAudio = () => emit('alternar-audio')
const alternarVideo = () => emit('alternar-video')

const confirmarFinalizarTransmision = () => {
  if (window.confirm('¿Seguro que deseas finalizar la transmisión en vivo para todos los espectadores?')) {
    visible.value = false
    emit('finalizar')
  }
}

const open = () => {
  visible.value = true
  nextTick(() => {
    acoplarVideoLocal()
    setTimeout(acoplarVideoLocal, 150)
  })
}

const close = () => {
  visible.value = false
}

onMounted(() => {
  if (visible.value) {
    acoplarVideoLocal()
  }
})

defineExpose({
  open,
  close,
})
</script>

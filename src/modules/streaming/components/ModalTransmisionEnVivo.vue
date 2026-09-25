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
        :class="[
          'fixed inset-0 z-50 select-none transition-all duration-300',
          contenedorModalClases
        ]"
      >
        <div
          :class="[
            'relative flex flex-col transition-all duration-300 overflow-hidden',
            tarjetaModalClases
          ]"
        >
          <!-- CABECERA DE INFORMACIÓN DEL PARTIDO (MODO NORMAL Y FULLSCREEN) -->
          <div
            v-if="!modoMiniplayer"
            :class="[
              'flex items-center justify-between px-3 sm:px-5 py-2.5 sm:py-3.5 z-30 transition-all duration-300',
              esPantallaCompleta
                ? 'absolute top-0 inset-x-0 bg-gradient-to-b from-black/90 via-black/50 to-transparent'
                : 'bg-slate-900/95 border-b border-slate-800/80',
              !mostrarControles && esPantallaCompleta ? 'opacity-0 -translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'
            ]"
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
                <span>{{ totalEspectadoresReal }} {{ totalEspectadoresReal === 1 ? 'espectador' : 'espectadores' }}</span>
              </span>

              <!-- Duración de la llamada / transmisión (1 hora) -->
              <span
                v-if="partido?.fechaInicioTransmision"
                class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40"
                title="Límite máximo de llamada: 1 hora (60 minutos)"
              >
                <Clock class="w-3.5 h-3.5 text-amber-400" />
                <span>{{ tiempoTranscurridoViewer }} / 60:00</span>
              </span>

              <span
                v-if="partido?.transmisorNombre"
                class="hidden sm:inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium"
              >
                Árbitro: <strong class="text-white font-bold">{{ partido.transmisorNombre }}</strong>
              </span>
            </div>

            <!-- Botones de Navegación y Cierre -->
            <div class="flex items-center gap-1.5 sm:gap-2">
              <!-- Botón Minirreproductor en Cabecera -->
              <button
                type="button"
                class="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Minirreproductor flotante (i)"
                @click="alternarMiniplayer"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="15" rx="2" />
                  <rect x="6" y="7" width="5" height="4" rx="0.5" fill="currentColor" fill-opacity="0.25" />
                  <line x1="12" y1="12" x2="16.5" y2="16.5" />
                  <polyline points="13 16.5 16.5 16.5 16.5 13" />
                </svg>
                <span class="hidden sm:inline">Minirreproductor</span>
              </button>

              <button
                v-if="esPantallaCompleta"
                type="button"
                class="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Salir de pantalla completa (f)"
                @click="alternarPantallaCompleta"
              >
                <Minimize class="w-3.5 h-3.5" />
                <span class="hidden sm:inline">Salir</span>
              </button>

              <button
                type="button"
                class="w-8 h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar transmisión"
                @click="close"
              >
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- ÁREA DE VIDEO PRINCIPAL (RESPONSIVE & FLOTANTE) -->
          <div
            ref="videoContainerRef"
            :class="[
              'relative w-full bg-black flex items-center justify-center overflow-hidden group select-none',
              modoMiniplayer
                ? 'aspect-video cursor-pointer'
                : esPantallaCompleta
                  ? 'flex-1 h-full'
                  : 'aspect-video flex-1 sm:flex-initial'
            ]"
            @mousemove="resetearInactividad"
            @touchstart="handleTouchVideo"
            @dblclick="modoMiniplayer ? alternarMiniplayer() : alternarPantallaCompleta()"
            @click="modoMiniplayer ? alternarMiniplayer() : undefined"
          >
            <!-- Elemento de Video WebRTC Remoto -->
            <video
              ref="videoElementRef"
              autoplay
              playsinline
              :class="[
                'w-full h-full transition-all duration-300',
                ajusteVideo === 'contain' ? 'object-contain' : 'object-cover'
              ]"
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
              v-if="audioSilenciadoPorNavegador && !modoMiniplayer"
              type="button"
              class="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 px-4 py-2 rounded-full bg-sky-500 hover:bg-sky-400 text-white font-extrabold text-xs shadow-2xl flex items-center gap-2 cursor-pointer transition-all animate-bounce"
              @click.stop="activarAudioNativo"
            >
              <VolumeX class="w-4 h-4" />
              <span>Toca aquí para activar el sonido 🔊</span>
            </button>

            <!-- OVERLAY HOVER DEL MINIREPRODUCTOR (ESTILO YOUTUBE) -->
            <div
              v-if="modoMiniplayer"
              class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/85 opacity-0 group-hover/mini:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5 z-20 pointer-events-none"
            >
              <!-- Barra superior del minirreproductor -->
              <div class="flex items-center justify-between w-full pointer-events-auto">
                <span
                  class="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-xs"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  En Vivo
                </span>

                <div class="flex items-center gap-1">
                  <!-- Expandir a modal completo -->
                  <button
                    type="button"
                    class="w-7 h-7 rounded-lg bg-black/70 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Expandir (i)"
                    @click.stop="alternarMiniplayer"
                  >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="15" rx="2" />
                      <rect x="13" y="12" width="5" height="4" rx="0.5" fill="currentColor" fill-opacity="0.25" />
                      <line x1="12" y1="12" x2="7.5" y2="7.5" />
                      <polyline points="11 7.5 7.5 7.5 7.5 11" />
                    </svg>
                  </button>

                  <!-- Pantalla completa -->
                  <button
                    type="button"
                    class="w-7 h-7 rounded-lg bg-black/70 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Pantalla completa (f)"
                    @click.stop="alternarPantallaCompleta"
                  >
                    <Maximize class="w-3.5 h-3.5" />
                  </button>

                  <!-- Cerrar -->
                  <button
                    type="button"
                    class="w-7 h-7 rounded-lg bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Cerrar transmisión"
                    @click.stop="close"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <!-- Centro del minirreproductor (Feedback visual para expandir) -->
              <div class="flex items-center justify-center pointer-events-none">
                <div class="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-xs border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
                  <svg class="w-3.5 h-3.5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="15" rx="2" />
                    <rect x="13" y="12" width="5" height="4" rx="0.5" fill="currentColor" fill-opacity="0.25" />
                    <line x1="12" y1="12" x2="7.5" y2="7.5" />
                    <polyline points="11 7.5 7.5 7.5 7.5 11" />
                  </svg>
                  <span>Clic para expandir</span>
                </div>
              </div>

              <div class="h-1"></div>
            </div>

            <!-- MARCADOR DEPORTIVO SUPERPUESTO (HUD OFICIAL ESTILO TV DEPORTIVA) -->
            <div
              v-if="partidoActivo && !modoMiniplayer"
              :class="[
                'absolute top-2 left-2 sm:top-4 sm:left-4 z-20 flex flex-col gap-1 transition-all duration-300 pointer-events-none drop-shadow-2xl max-w-[88%] sm:max-w-md',
                esPantallaCompleta ? 'top-12 sm:top-14 scale-90 sm:scale-100 origin-top-left' : '',
                !mostrarControles && esPantallaCompleta ? 'opacity-0 -translate-x-2' : 'opacity-100 translate-x-0'
              ]"
            >
              <div
                class="bg-black/85 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-2xl text-white"
              >
                <!-- Jugador 1 -->
                <div
                  class="flex items-center justify-between px-2.5 sm:px-3.5 py-1.5 border-b border-white/10 gap-3"
                  :class="{ 'bg-emerald-500/20': Number(puntosJ1) > Number(puntosJ2) }"
                >
                  <div class="flex items-center gap-2 min-w-0">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
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
                    <span class="w-2 h-2 rounded-full bg-sky-400 shrink-0"></span>
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
                <span class="px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs border border-white/10 text-emerald-400 font-bold">
                  {{ marcadorEnVivo?.setActual || 'Set 1' }}
                </span>
                <span class="px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs border border-white/10">
                  {{ marcadorEnVivo?.mesa || partidoActivo.mesa || 'Mesa 1' }}
                </span>
                <span class="px-2 py-0.5 rounded bg-black/70 backdrop-blur-xs border border-white/10">
                  Ronda {{ partidoActivo.ronda || partidoActivo.jornada || 1 }}
                </span>
              </div>
            </div>

            <!-- CONTROLES FLOTANTES EN LA ESQUINA INFERIOR DERECHA (MODO NORMAL Y FULLSCREEN) -->
            <div
              v-if="!modoMiniplayer"
              :class="[
                'absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md p-1.5 rounded-full border border-white/15 transition-all duration-300',
                !mostrarControles && esPantallaCompleta ? 'opacity-0 translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'
              ]"
            >
              <!-- Silenciar / Activar Sonido -->
              <button
                type="button"
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                :title="audioMuteado ? 'Activar sonido (m)' : 'Silenciar sonido (m)'"
                @click="alternarSonido"
              >
                <VolumeX v-if="audioMuteado" class="w-4 h-4 text-rose-400" />
                <Volume2 v-else class="w-4 h-4 text-emerald-400" />
              </button>

              <!-- Ajustar al marco / Llenar pantalla (Fit/Fill) -->
              <button
                type="button"
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                :title="ajusteVideo === 'contain' ? 'Llenar pantalla' : 'Ajustar al marco'"
                @click="alternarAjusteVideo"
              >
                <svg v-if="ajusteVideo === 'contain'" class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
                <svg v-else class="w-4 h-4 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                  <path d="M9 3v18M15 3v18"/>
                </svg>
              </button>

              <!-- Minirreproductor Flotante en Página (Estilo YouTube) -->
              <button
                type="button"
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Minirreproductor (i)"
                @click="alternarMiniplayer"
              >
                <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="15" rx="2" />
                  <rect x="6" y="7" width="5" height="4" rx="0.5" fill="currentColor" fill-opacity="0.25" />
                  <line x1="12" y1="12" x2="16.5" y2="16.5" />
                  <polyline points="13 16.5 16.5 16.5 16.5 13" />
                </svg>
              </button>

              <!-- Picture-in-Picture Nativo Externo (PiP) -->
              <button
                v-if="soportaPiP"
                type="button"
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Ventana externa fuera del navegador (PiP)"
                @click="alternarPiP"
              >
                <PictureInPicture2 class="w-4 h-4 text-sky-400" />
              </button>

              <!-- Pantalla Completa (Mobile & PC) -->
              <button
                type="button"
                class="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                :title="esPantallaCompleta ? 'Salir de pantalla completa (f)' : 'Pantalla completa (f)'"
                @click="alternarPantallaCompleta"
              >
                <Maximize v-if="!esPantallaCompleta" class="w-4 h-4 text-white" />
                <Minimize v-else class="w-4 h-4 text-white" />
              </button>
            </div>
          </div>

          <!-- BARRA INFERIOR DEL MINIREPRODUCTOR FLOTANTE -->
          <div
            v-if="modoMiniplayer"
            class="px-3 py-2 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-2.5 select-none"
            @click.stop
          >
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 truncate">
                  <span class="text-xs font-black text-white truncate">
                    {{ partido?.jugador1?.nombre || 'Jugador 1' }}
                  </span>
                  <span class="text-[10px] font-black text-slate-400">vs</span>
                  <span class="text-xs font-black text-white truncate">
                    {{ partido?.jugador2?.nombre || 'Jugador 2' }}
                  </span>
                </div>
                <div class="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                  <span class="font-mono text-sky-400 font-bold">
                    Sets {{ setsGanadosJ1 }}-{{ setsGanadosJ2 }} ({{ puntosJ1 }}-{{ puntosJ2 }})
                  </span>
                  <span v-if="partido?.mesa" class="text-slate-500">• Mesa {{ partido.mesa }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <button
                type="button"
                class="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                :title="audioMuteado ? 'Activar sonido (m)' : 'Silenciar sonido (m)'"
                @click.stop="alternarSonido"
              >
                <VolumeX v-if="audioMuteado" class="w-3.5 h-3.5 text-rose-400" />
                <Volume2 v-else class="w-3.5 h-3.5 text-emerald-400" />
              </button>
              <button
                type="button"
                class="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 hover:text-sky-300 border border-sky-500/30 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                title="Expandir transmisión (i)"
                @click.stop="alternarMiniplayer"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="15" rx="2" />
                  <rect x="13" y="12" width="5" height="4" rx="0.5" fill="currentColor" fill-opacity="0.25" />
                  <line x1="12" y1="12" x2="7.5" y2="7.5" />
                  <polyline points="11 7.5 7.5 7.5 7.5 11" />
                </svg>
                <span class="hidden sm:inline text-[11px]">Expandir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  Eye,
  X,
  VideoOff,
  Volume2,
  VolumeX,
  PictureInPicture2,
  Maximize,
  Minimize,
  Clock,
} from 'lucide-vue-next'
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { PartidoGrupo } from '@/types'

const props = defineProps<{
  partido: PartidoGrupo | null
  streamRemoto: MediaStream | null
  totalEspectadores: number
  cargandoConexion: boolean
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
}>()

const visible = ref(false)
const modalContainerRef = ref<HTMLDivElement | null>(null)
const videoContainerRef = ref<HTMLDivElement | null>(null)
const videoElementRef = ref<HTMLVideoElement | null>(null)
const audioMuteado = ref(false)
const audioSilenciadoPorNavegador = ref(false)
const esPantallaCompleta = ref(false)
const modoMiniplayer = ref(false)

const contenedorModalClases = computed(() => {
  if (modoMiniplayer.value) {
    return 'pointer-events-none bg-transparent flex items-end justify-end p-3 sm:p-5'
  }
  if (esPantallaCompleta.value) {
    return 'p-0 bg-black w-screen h-[100dvh] overflow-hidden flex items-center justify-center'
  }
  return 'p-0 sm:p-4 bg-black/90 backdrop-blur-md overflow-hidden max-h-[100dvh] flex items-center justify-center'
})

const tarjetaModalClases = computed(() => {
  if (modoMiniplayer.value) {
    return 'pointer-events-auto w-[310px] sm:w-[390px] max-w-[calc(100vw-24px)] rounded-2xl bg-slate-950 border border-slate-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.85)] ring-1 ring-white/10 group/mini animate-in fade-in slide-in-from-bottom-6'
  }
  if (esPantallaCompleta.value) {
    return 'w-screen h-[100dvh] max-w-none max-h-none rounded-none border-none bg-black'
  }
  return 'w-full max-w-5xl rounded-none sm:rounded-3xl border-0 sm:border border-slate-800 shadow-2xl h-[100dvh] sm:h-auto sm:max-h-[94dvh] bg-slate-950'
})

const ajusteVideo = ref<'contain' | 'cover'>('contain')
const soportaPiP = ref(false)
const mostrarControles = ref(true)
let timeoutInactividad: any = null
let ultimoToque = 0

const tiempoTranscurridoViewer = ref('00:00')
let timerViewer: any = null

const actualizarTiempoViewer = () => {
  if (props.partido?.fechaInicioTransmision) {
    const elapsedSecs = Math.max(0, Math.floor((Date.now() - props.partido.fechaInicioTransmision) / 1000))
    const capped = Math.min(3600, elapsedSecs)
    const mins = Math.floor(capped / 60)
    const secs = capped % 60
    tiempoTranscurridoViewer.value = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

onMounted(() => {
  actualizarTiempoViewer()
  timerViewer = setInterval(actualizarTiempoViewer, 1000)
})

onUnmounted(() => {
  if (timerViewer) {
    clearInterval(timerViewer)
    timerViewer = null
  }
})

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

const totalEspectadoresReal = computed(() => {
  const deProps = Number(props.totalEspectadores || 0)
  const dePartido = Number(partidoActivo.value?.totalEspectadores || 0)
  return Math.max(1, Math.max(deProps, dePartido))
})

// Sincronización en tiempo real del partido y marcador en vivo
const partidoRealTime = ref<any>(null)
let unsubPartido: Unsubscribe | null = null

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
      console.warn('[ModalTransmisionEnVivo] Error en suscripción a partido en vivo:', err)
    },
  )
}

watch(
  () => props.partido?.id,
  (nuevoId) => {
    if (nuevoId) {
      partidoRealTime.value = props.partido
      iniciarSuscripcionPartido(nuevoId)
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
})

const partidoActivo = computed(() => partidoRealTime.value || props.partido)
const marcadorEnVivo = computed(() => partidoActivo.value?.marcadorEnVivo)

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

const activarAudioNativo = () => {
  if (videoElementRef.value) {
    videoElementRef.value.muted = false
    videoElementRef.value.volume = 1.0
    audioMuteado.value = false
    audioSilenciadoPorNavegador.value = false
    videoElementRef.value.play().catch(() => {})
  }
}

const alternarSonido = () => {
  if (videoElementRef.value) {
    videoElementRef.value.muted = !videoElementRef.value.muted
    videoElementRef.value.volume = 1.0
    audioMuteado.value = videoElementRef.value.muted
    if (!videoElementRef.value.muted) {
      audioSilenciadoPorNavegador.value = false
      videoElementRef.value.play().catch(() => {})
    }
  }
}

const handleVolumeChange = () => {
  if (videoElementRef.value) {
    audioMuteado.value = videoElementRef.value.muted
  }
}

const alternarAjusteVideo = () => {
  ajusteVideo.value = ajusteVideo.value === 'contain' ? 'cover' : 'contain'
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

const resetearInactividad = () => {
  mostrarControles.value = true
  if (timeoutInactividad) clearTimeout(timeoutInactividad)
  if (esPantallaCompleta.value) {
    timeoutInactividad = setTimeout(() => {
      mostrarControles.value = false
    }, 3500)
  }
}

const handleTouchVideo = () => {
  resetearInactividad()
  if (audioSilenciadoPorNavegador.value || audioMuteado.value) {
    activarAudioNativo()
  }
  const ahora = Date.now()
  if (ahora - ultimoToque < 320) {
    alternarPantallaCompleta()
    ultimoToque = 0
  } else {
    ultimoToque = ahora
  }
}

const alternarMiniplayer = async () => {
  if (esPantallaCompleta.value) {
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        }
      } catch {}
    }
    esPantallaCompleta.value = false
  }
  modoMiniplayer.value = !modoMiniplayer.value
}

const alternarPantallaCompleta = async () => {
  if (modoMiniplayer.value) {
    modoMiniplayer.value = false
  }

  const container = modalContainerRef.value || videoContainerRef.value
  const video = videoElementRef.value

  // Salir de pantalla completa si ya está activa
  if (esPantallaCompleta.value || document.fullscreenElement || (document as any).webkitFullscreenElement) {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      }
    } catch (e) {
      console.warn('Error al salir de fullscreen nativo:', e)
    }

    try {
      if (screen.orientation && 'unlock' in screen.orientation) {
        (screen.orientation as any).unlock()
      }
    } catch {}

    esPantallaCompleta.value = false
    return
  }

  // Activar pantalla completa
  let nativoExitoso = false
  if (container) {
    try {
      if (container.requestFullscreen) {
        await container.requestFullscreen()
        nativoExitoso = true
      } else if ((container as any).webkitRequestFullscreen) {
        await (container as any).webkitRequestFullscreen()
        nativoExitoso = true
      }
    } catch (e) {
      console.warn('requestFullscreen en container no disponible:', e)
    }
  }

  // Fallback especial para video en iOS Safari
  if (!nativoExitoso && video && (video as any).webkitEnterFullscreen) {
    try {
      (video as any).webkitEnterFullscreen()
      nativoExitoso = true
    } catch (e) {
      console.warn('webkitEnterFullscreen falló:', e)
    }
  }

  // En celulares, sugerir orientación horizontal para modo TV
  try {
    if (screen.orientation && 'lock' in screen.orientation) {
      await (screen.orientation as any).lock('landscape').catch(() => {})
    }
  } catch {}

  esPantallaCompleta.value = true
  resetearInactividad()
}

const handleFullscreenChange = () => {
  const isFs = Boolean(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  )
  if (!isFs && esPantallaCompleta.value) {
    esPantallaCompleta.value = false
  }
}

const handleKeydown = (e: KeyboardEvent) => {
  if (!visible.value) return

  // No interceptar si el usuario está escribiendo en un input, textarea o editable
  const target = e.target as HTMLElement | null
  if (
    target &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable)
  ) {
    return
  }

  if (e.key === 'i' || e.key === 'I') {
    e.preventDefault()
    alternarMiniplayer()
  } else if (e.key === 'f' || e.key === 'F') {
    e.preventDefault()
    alternarPantallaCompleta()
  } else if (e.key === 'm' || e.key === 'M') {
    e.preventDefault()
    alternarSonido()
  } else if (e.key === 'Escape') {
    if (esPantallaCompleta.value) {
      e.preventDefault()
      alternarPantallaCompleta()
    } else if (modoMiniplayer.value) {
      e.preventDefault()
      alternarMiniplayer()
    }
  }
}

onMounted(() => {
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  window.removeEventListener('keydown', handleKeydown)
  if (timeoutInactividad) clearTimeout(timeoutInactividad)
})

const open = () => {
  visible.value = true
  mostrarControles.value = true
  setTimeout(() => {
    soportaPiP.value = 'pictureInPictureEnabled' in document
    if (videoElementRef.value && props.streamRemoto) {
      videoElementRef.value.srcObject = props.streamRemoto
      videoElementRef.value.play().catch(() => {
        audioSilenciadoPorNavegador.value = true
        if (videoElementRef.value) {
          videoElementRef.value.muted = true
          videoElementRef.value.play().catch(() => {})
        }
      })
    }
  }, 100)
}

const close = () => {
  if (esPantallaCompleta.value) {
    alternarPantallaCompleta()
  }
  modoMiniplayer.value = false
  visible.value = false
  emit('cerrar')
}

defineExpose({
  open,
  close,
  alternarMiniplayer,
  alternarPantallaCompleta,
  modoMiniplayer,
})
</script>

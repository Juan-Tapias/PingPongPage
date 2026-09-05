<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="visible && match"
        class="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
        <!-- CONTENEDOR PRINCIPAL ESTILO TABLET / MESA DE PING PONG -->
        <div
          class="w-full max-w-5xl bg-[#0096c7] p-2 sm:p-3.5 rounded-3xl sm:rounded-[36px] shadow-[0_0_50px_rgba(0,150,199,0.3)] border-4 sm:border-6 border-[#0077b6] flex flex-col gap-2 relative animate-in zoom-in-95 duration-200 select-none">

          <!-- BARRA SUPERIOR DE INFORMACIÓN -->
          <div class="flex items-center justify-between px-3 py-1 text-white font-heading">
            <div class="flex items-center gap-2">
              <span class="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span class="text-xs sm:text-sm font-black tracking-wide uppercase">
                Marcador Virtual Oficial • Set {{ numeroSetActual }} (Mejor de 3)
              </span>
            </div>

            <div class="flex items-center gap-2">
              <span class="text-[11px] font-bold bg-black/30 px-2.5 py-0.5 rounded-full text-sky-100 hidden sm:inline">
                Primero en ganar 2 sets gana el partido
              </span>
              <button type="button"
                class="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar marcador" @click="handleCerrarConConfirmacion">
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- MESA / CUADRÍCULA DE 3 COLUMNAS RESPONSIVE -->
          <div
            class="grid grid-cols-[1fr_88px_1fr] xs:grid-cols-[1fr_105px_1fr] sm:grid-cols-[1fr_160px_1fr] md:grid-cols-[1fr_200px_1fr] gap-1.5 sm:gap-3 items-stretch min-h-80 sm:min-h-110">

            <div
              class="bg-black rounded-xl sm:rounded-3xl border border-white/10 p-2 sm:p-4 md:p-5 flex flex-col justify-between items-center relative overflow-hidden shadow-2xl">

              <div
                class="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 border-b border-white/10 pb-1.5 sm:pb-2">
                <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <div
                    class="w-7 h-7 sm:w-9 sm:h-9 rounded-full text-white font-black text-[11px] sm:text-sm flex items-center justify-center shrink-0 border border-white/30"
                    :class="ladoA.esJugador1 ? 'bg-emerald-600' : 'bg-sky-600'">
                    {{ ladoA.jugador.iniciales }}
                  </div>
                  <div class="min-w-0">
                    <p
                      class="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-wider leading-none">
                      {{ ladoA.esJugador1 ? 'J1' : 'J2' }}
                    </p>
                    <h3
                      class="text-xs sm:text-sm font-black text-white truncate max-w-17.5 xs:max-w-[85px] sm:max-w-32.5"
                      :title="ladoA.jugador.nombre">
                      {{ ladoA.jugador.nombre }}
                    </h3>
                  </div>
                </div>

                <!-- BOTÓN EASTER EGG: CONTADOR DE MALLAS LADO IZQUIERDO -->
                <button type="button"
                  class="w-full sm:w-auto px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400/40 text-amber-300 text-[9px] sm:text-xs font-black flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
                  title="Registrar toque de malla (Easter Egg)" @click="registrarMalla(ladoA.esJugador1 ? 1 : 2)">
                  <Flame class="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
                  <span class="truncate">Malla: {{ ladoA.esJugador1 ? mallasJ1 : mallasJ2 }}</span>
                </button>
              </div>

              <div class="flex-1 flex items-center justify-center select-none py-1 sm:py-2 transition-all"
                :class="puedeSumarPunto(ladoA.esJugador1 ? 1 : 2) ? 'cursor-pointer active:scale-95' : 'cursor-not-allowed opacity-80'"
                :title="puedeSumarPunto(ladoA.esJugador1 ? 1 : 2) ? 'Toca para sumar punto' : 'Diferencia de 2 alcanzada • Finaliza el set o descuenta puntos'"
                @click="sumarPunto(ladoA.esJugador1 ? 1 : 2)">
                <span
                  class="text-5xl xs:text-6xl sm:text-8xl md:text-9xl font-black font-mono tracking-tighter text-white drop-shadow-[0_8px_24px_rgba(255,255,255,0.15)] leading-none transition-transform select-none">
                  {{ ladoA.esJugador1 ? puntosJ1 : puntosJ2 }}
                </span>
              </div>

              <div class="w-full flex items-center justify-between px-0.5 sm:px-3 pt-1">
                <button type="button" :disabled="(ladoA.esJugador1 ? puntosJ1 : puntosJ2) <= 0"
                  class="w-8 h-8 xs:w-9 xs:h-9 sm:w-12 sm:h-12 rounded-full border border-white/40 hover:border-white text-white flex items-center justify-center text-lg sm:text-2xl font-black hover:bg-white/10 active:scale-90 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                  title="Restar 1 punto" @click.stop="restarPunto(ladoA.esJugador1 ? 1 : 2)">
                  <Minus class="w-4 h-4 sm:w-6 sm:h-6" />
                </button>

                <span
                  class="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden sm:inline">Puntos</span>

                <button type="button" :disabled="!puedeSumarPunto(ladoA.esJugador1 ? 1 : 2)"
                  class="w-8 h-8 xs:w-9 xs:h-9 sm:w-12 sm:h-12 rounded-full border border-white/40 hover:border-white text-white flex items-center justify-center text-lg sm:text-2xl font-black hover:bg-white/10 active:scale-90 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                  :title="puedeSumarPunto(ladoA.esJugador1 ? 1 : 2) ? 'Sumar 1 punto' : 'Diferencia máxima de 2 alcanzada'"
                  @click.stop="sumarPunto(ladoA.esJugador1 ? 1 : 2)">
                  <Plus class="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>


            <div class="flex flex-col justify-between gap-1.5 sm:gap-2">

              <div class="grid grid-cols-2 gap-1 sm:gap-2 flex-1 max-h-27.5 sm:max-h-40">
                <div
                  class="bg-black rounded-lg sm:rounded-2xl border border-white/10 p-1 sm:p-2.5 flex flex-col items-center justify-between">
                  <span
                    class="text-[8px] sm:text-[10px] text-slate-400 font-black uppercase tracking-wider text-center truncate w-full">
                    {{ ladoA.jugador.iniciales }}
                  </span>
                  <span class="text-2xl sm:text-5xl font-black font-mono text-white leading-none my-0.5 sm:my-1">
                    {{ ladoA.esJugador1 ? setsGanadosJ1 : setsGanadosJ2 }}
                  </span>
                  <div class="flex items-center gap-0.5 sm:gap-1">
                    <span v-for="s in 2" :key="s" :class="[
                      'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all',
                      (ladoA.esJugador1 ? setsGanadosJ1 : setsGanadosJ2) >= s ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-white/20'
                    ]" />
                  </div>
                </div>

                <div
                  class="bg-black rounded-lg sm:rounded-2xl border border-white/10 p-1 sm:p-2.5 flex flex-col items-center justify-between">
                  <span
                    class="text-[8px] sm:text-[10px] text-slate-400 font-black uppercase tracking-wider text-center truncate w-full">
                    {{ ladoB.jugador.iniciales }}
                  </span>
                  <span class="text-2xl sm:text-5xl font-black font-mono text-white leading-none my-0.5 sm:my-1">
                    {{ ladoB.esJugador1 ? setsGanadosJ1 : setsGanadosJ2 }}
                  </span>
                  <div class="flex items-center gap-0.5 sm:gap-1">
                    <span v-for="s in 2" :key="s" :class="[
                      'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all',
                      (ladoB.esJugador1 ? setsGanadosJ1 : setsGanadosJ2) >= s ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-white/20'
                    ]" />
                  </div>
                </div>
              </div>

              <button type="button"
                class="w-full py-2 sm:py-3.5 bg-black hover:bg-slate-900 active:scale-95 border border-white/15 rounded-lg sm:rounded-2xl text-white flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md group"
                title="Cambiar de lado en la mesa" @click="invertirLados">
                <ArrowLeftRight
                  class="w-4 h-4 sm:w-5 sm:h-5 text-sky-400 group-hover:rotate-180 transition-transform duration-300" />
                <span class="text-[8px] sm:text-xs font-black uppercase tracking-wider hidden xs:inline">Cambiar</span>
              </button>

              <button type="button"
                class="w-full py-2 sm:py-3.5 bg-black hover:bg-slate-900 active:scale-95 border border-white/15 rounded-lg sm:rounded-2xl text-white flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md"
                title="Reiniciar puntos del set actual a 0 - 0" @click="reiniciarSetActual">
                <RotateCcw class="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
                <span class="text-[8px] sm:text-xs font-black uppercase tracking-wider hidden xs:inline">Reset</span>
              </button>

              <button type="button" :disabled="!puedeFinalizarSet" :class="[
                'w-full py-2 sm:py-3.5 border rounded-lg sm:rounded-2xl font-black flex flex-col items-center justify-center gap-0.5 transition-all shadow-xl',
                puedeFinalizarSet
                  ? 'bg-emerald-600 hover:bg-emerald-500 border-2 border-white text-white cursor-pointer active:scale-95 animate-pulse'
                  : 'bg-slate-900 border-white/10 text-slate-500 cursor-not-allowed opacity-50'
              ]" :title="puedeFinalizarSet ? 'Finalizar set y sumar al marcador' : textoEstadoSet"
                @click="handleTerminarSet">
                <CheckCircle2 class="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                  :class="puedeFinalizarSet ? 'text-white' : 'text-slate-500'" />
                <span
                  class="text-[8px] sm:text-xs md:text-sm font-black uppercase tracking-wider text-center leading-none">
                  {{ puedeFinalizarSet ? 'Terminar Set' : 'Fin Set' }}
                </span>
                <span class="text-[7px] sm:text-[9px] font-normal leading-tight text-center truncate w-full px-1"
                  :class="puedeFinalizarSet ? 'text-emerald-100' : 'text-slate-500'">
                  {{ textoEstadoSet }}
                </span>
              </button>
            </div>

            <div
              class="bg-black rounded-xl sm:rounded-3xl border border-white/10 p-2 sm:p-4 md:p-5 flex flex-col justify-between items-center relative overflow-hidden shadow-2xl">
              -->
              <div
                class="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 border-b border-white/10 pb-1.5 sm:pb-2">
                <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <div
                    class="w-7 h-7 sm:w-9 sm:h-9 rounded-full text-white font-black text-[11px] sm:text-sm flex items-center justify-center shrink-0 border border-white/30"
                    :class="ladoB.esJugador1 ? 'bg-emerald-600' : 'bg-sky-600'">
                    {{ ladoB.jugador.iniciales }}
                  </div>
                  <div class="min-w-0">
                    <p
                      class="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-wider leading-none">
                      {{ ladoB.esJugador1 ? 'J1' : 'J2' }}
                    </p>
                    <h3
                      class="text-xs sm:text-sm font-black text-white truncate max-w-17.5 xs:max-w-[85px] sm:max-w-32.5"
                      :title="ladoB.jugador.nombre">
                      {{ ladoB.jugador.nombre }}
                    </h3>
                  </div>
                </div>

                <button type="button"
                  class="w-full sm:w-auto px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400/40 text-amber-300 text-[9px] sm:text-xs font-black flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
                  title="Registrar toque de malla (Easter Egg)" @click="registrarMalla(ladoB.esJugador1 ? 1 : 2)">
                  <Flame class="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
                  <span class="truncate">Malla: {{ ladoB.esJugador1 ? mallasJ1 : mallasJ2 }}</span>
                </button>
              </div>

              <div class="flex-1 flex items-center justify-center select-none py-1 sm:py-2 transition-all"
                :class="puedeSumarPunto(ladoB.esJugador1 ? 1 : 2) ? 'cursor-pointer active:scale-95' : 'cursor-not-allowed opacity-80'"
                :title="puedeSumarPunto(ladoB.esJugador1 ? 1 : 2) ? 'Toca para sumar punto' : 'Diferencia de 2 alcanzada • Finaliza el set o descuenta puntos'"
                @click="sumarPunto(ladoB.esJugador1 ? 1 : 2)">
                <span
                  class="text-5xl xs:text-6xl sm:text-8xl md:text-9xl font-black font-mono tracking-tighter text-white drop-shadow-[0_8px_24px_rgba(255,255,255,0.15)] leading-none transition-transform select-none">
                  {{ ladoB.esJugador1 ? puntosJ1 : puntosJ2 }}
                </span>
              </div>

              <div class="w-full flex items-center justify-between px-0.5 sm:px-3 pt-1">
                <button type="button" :disabled="(ladoB.esJugador1 ? puntosJ1 : puntosJ2) <= 0"
                  class="w-8 h-8 xs:w-9 xs:h-9 sm:w-12 sm:h-12 rounded-full border border-white/40 hover:border-white text-white flex items-center justify-center text-lg sm:text-2xl font-black hover:bg-white/10 active:scale-90 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                  title="Restar 1 punto" @click.stop="restarPunto(ladoB.esJugador1 ? 1 : 2)">
                  <Minus class="w-4 h-4 sm:w-6 sm:h-6" />
                </button>

                <span
                  class="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden sm:inline">Puntos</span>

                <button type="button" :disabled="!puedeSumarPunto(ladoB.esJugador1 ? 1 : 2)"
                  class="w-8 h-8 xs:w-9 xs:h-9 sm:w-12 sm:h-12 rounded-full border border-white/40 hover:border-white text-white flex items-center justify-center text-lg sm:text-2xl font-black hover:bg-white/10 active:scale-90 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                  :title="puedeSumarPunto(ladoB.esJugador1 ? 1 : 2) ? 'Sumar 1 punto' : 'Diferencia máxima de 2 alcanzada'"
                  @click.stop="sumarPunto(ladoB.esJugador1 ? 1 : 2)">
                  <Plus class="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

          </div>

          <!-- HISTORIAL DE SETS ANTERIORES -->
          <div v-if="historialSets.length > 0" class="flex flex-wrap items-center justify-center gap-2 py-1">
            <span class="text-[11px] font-extrabold text-sky-950 uppercase tracking-wider">Sets jugados:</span>
            <span v-for="(s, idx) in historialSets" :key="idx"
              class="px-3 py-1 rounded-xl bg-black/60 border border-white/20 font-mono font-bold text-xs text-white shadow-xs">
              Set {{ s.setNumero }}: {{ s.puntosJugador1 }} - {{ s.puntosJugador2 }}
            </span>
          </div>

          <!-- BANNER DE ALERTA EASTER EGG DE MALLAS -->
          <Transition enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95">
            <div v-if="easterEggMensaje"
              class="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 rounded-2xl bg-linear-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2 border-2 border-white pointer-events-none animate-bounce">
              <Sparkles class="w-5 h-5 shrink-0" />
              <span>{{ easterEggMensaje }}</span>
            </div>
          </Transition>

        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- MODAL DE PARTIDO FINALIZADO (ESTILO ESTÁNDAR LIMPIO DEL SISTEMA) -->
  <Modal
    ref="modalFinPartidoRef"
    title="Resultado del Partido"
    sub-title="Partido oficial concluido al mejor de tres sets"
    width="md"
    :footer="false"
    :close-on-click-modal="false"
    :show-close="false"
  >
    <div v-if="ganadorPartido" class="flex flex-col items-center text-center gap-4 py-2">
      <!-- Icono de Trofeo limpio -->
      <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
        <Trophy class="w-7 h-7" />
      </div>

      <!-- Ganador -->
      <div class="space-y-0.5">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Ganador del Encuentro
        </span>
        <h3 class="text-xl font-black text-slate-900">
          {{ ganadorPartido.nombre }}
        </h3>
      </div>

      <!-- Tarjeta resumen limpia idéntica al diseño del resto del sistema -->
      <div class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Marcador Final (Sets)
        </span>
        <span class="text-3xl font-black font-mono text-emerald-700 tracking-tight">
          {{ setsGanadosJ1 }} - {{ setsGanadosJ2 }}
        </span>

        <!-- Desglose de sets -->
        <div class="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          <span
            v-for="(s, idx) in historialSets"
            :key="idx"
            class="px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-mono font-bold text-xs text-slate-700 shadow-2xs"
          >
            Set {{ s.setNumero }}: {{ s.puntosJugador1 }} - {{ s.puntosJugador2 }}
          </span>
        </div>

        <p class="text-xs text-slate-500 mt-1">
          Los datos se actualizarán automáticamente en la tabla de posiciones del torneo.
        </p>
      </div>

      <!-- Botón de Confirmación -->
      <div class="w-full pt-1">
        <Button
          variant="emerald"
          size="md"
          class="w-full justify-center font-bold gap-2"
          @click="confirmarRegistroFinal"
        >
          <CheckCircle2 class="w-4 h-4" />
          <span>Registrar en Tabla de Posiciones y Cerrar</span>
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  X,
  Minus,
  Plus,
  RotateCcw,
  ArrowLeftRight,
  CheckCircle2,
  Trophy,
  Flame,
  Sparkles,
} from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import type { PartidoArbitrable, SetPartido, JugadorTorneo } from '@/types'

const props = defineProps<{
  match: PartidoArbitrable | null
}>()

const emit = defineEmits<{
  (
    e: 'partido-finalizado',
    datos: {
      partidoId: string
      sets: SetPartido[]
      ganadorId: string
    },
  ): void
  (e: 'close'): void
}>()

const visible = ref(false)

const puntosJ1 = ref(0)
const puntosJ2 = ref(0)

const ladosInvertidos = ref(false)

const mallasJ1 = ref(0)
const mallasJ2 = ref(0)
const easterEggMensaje = ref('')
let timerEasterEgg: ReturnType<typeof setTimeout> | null = null

const historialSets = ref<SetPartido[]>([])
const numeroSetActual = computed(() => historialSets.value.length + 1)

const setsGanadosJ1 = computed(() => {
  if (!props.match) return 0
  return historialSets.value.filter((s) => s.ganadorId === props.match?.jugador1.id).length
})

const setsGanadosJ2 = computed(() => {
  if (!props.match) return 0
  return historialSets.value.filter((s) => s.ganadorId === props.match?.jugador2.id).length
})

// Mejor de 3 sets (primer jugador que alcance 2 sets)
const partidoTerminado = computed(() => {
  return setsGanadosJ1.value >= 2 || setsGanadosJ2.value >= 2
})

const ganadorPartido = computed<JugadorTorneo | null>(() => {
  if (!props.match) return null
  if (setsGanadosJ1.value >= 2) return props.match.jugador1
  if (setsGanadosJ2.value >= 2) return props.match.jugador2
  return null
})

// Mapeo dinámico de qué jugador está en qué lado de la pantalla
const ladoA = computed(() => {
  if (!props.match) {
    return {
      jugador: { id: '', nombre: '', iniciales: '', telefono: '' },
      esJugador1: true,
    }
  }
  return ladosInvertidos.value
    ? { jugador: props.match.jugador2, esJugador1: false }
    : { jugador: props.match.jugador1, esJugador1: true }
})

const ladoB = computed(() => {
  if (!props.match) {
    return {
      jugador: { id: '', nombre: '', iniciales: '', telefono: '' },
      esJugador1: false,
    }
  }
  return ladosInvertidos.value
    ? { jugador: props.match.jugador1, esJugador1: true }
    : { jugador: props.match.jugador2, esJugador1: false }
})

const modalFinPartidoRef = ref<InstanceType<typeof Modal> | null>(null)

watch(partidoTerminado, (terminado) => {
  if (terminado) {
    modalFinPartidoRef.value?.open()
  } else {
    modalFinPartidoRef.value?.close()
  }
})

const open = () => {
  puntosJ1.value = 0
  puntosJ2.value = 0
  mallasJ1.value = 0
  mallasJ2.value = 0
  historialSets.value = []
  ladosInvertidos.value = false
  easterEggMensaje.value = ''
  modalFinPartidoRef.value?.close()
  visible.value = true
}

const close = () => {
  visible.value = false
  modalFinPartidoRef.value?.close()
  emit('close')
}

const handleCerrarConConfirmacion = () => {
  if (historialSets.value.length > 0 && !partidoTerminado.value) {
    const salir = window.confirm('Hay un partido en curso. ¿Deseas salir del marcador virtual?')
    if (!salir) return
  }
  close()
}

const invertirLados = () => {
  ladosInvertidos.value = !ladosInvertidos.value
}

const puedeFinalizarSet = computed<boolean>(() => {
  const maxPts = Math.max(puntosJ1.value, puntosJ2.value)
  const diff = Math.abs(puntosJ1.value - puntosJ2.value)
  return maxPts >= 11 && diff >= 2
})

const textoEstadoSet = computed<string>(() => {
  const maxPts = Math.max(puntosJ1.value, puntosJ2.value)
  const minPts = Math.min(puntosJ1.value, puntosJ2.value)
  const diff = Math.abs(puntosJ1.value - puntosJ2.value)

  if (puedeFinalizarSet.value) {
    const lider =
      puntosJ1.value > puntosJ2.value
        ? props.match?.jugador1.nombre || 'J1'
        : props.match?.jugador2.nombre || 'J2'
    return `Listo: Gana ${lider}`
  }

  if (maxPts < 11) {
    return `Mín. 11 pts (${maxPts}/11)`
  }

  if (maxPts >= 10 && minPts >= 10) {
    if (diff === 0) return 'Deuce (Empate 10+)'
    if (diff === 1) return 'Ventaja (+1) • Requiere +2'
  }

  if (diff < 2) {
    return 'Requiere ventaja de +2'
  }

  return 'Set en juego'
})

const puedeSumarPunto = (jugador: 1 | 2): boolean => {
  const ptsActuales = jugador === 1 ? puntosJ1.value : puntosJ2.value
  const ptsRival = jugador === 1 ? puntosJ2.value : puntosJ1.value
  const nuevoPts = ptsActuales + 1
  const nuevaDiferencia = nuevoPts - ptsRival

  if (ptsRival >= 10 && nuevaDiferencia > 2) {
    return false
  }

  if (ptsRival < 10 && ptsActuales >= 11) {
    return false
  }

  if (nuevoPts > 11 && nuevaDiferencia > 2) {
    return false
  }

  return true
}

const sumarPunto = (jugador: 1 | 2) => {
  if (!puedeSumarPunto(jugador)) return
  if (jugador === 1) {
    puntosJ1.value += 1
  } else {
    puntosJ2.value += 1
  }
}

const restarPunto = (jugador: 1 | 2) => {
  if (jugador === 1) {
    puntosJ1.value = Math.max(0, puntosJ1.value - 1)
  } else {
    puntosJ2.value = Math.max(0, puntosJ2.value - 1)
  }
}

const reiniciarSetActual = () => {
  puntosJ1.value = 0
  puntosJ2.value = 0
}

const registrarMalla = (jugador: 1 | 2) => {
  if (jugador === 1) {
    mallasJ1.value += 1
  } else {
    mallasJ2.value += 1
  }

  const nombreJugador = jugador === 1 ? props.match?.jugador1.nombre : props.match?.jugador2.nombre
  const totalMallas = jugador === 1 ? mallasJ1.value : mallasJ2.value

  if (totalMallas % 2 === 1) {
    easterEggMensaje.value = `¡Malla con suerte para ${nombreJugador}! 🏓🍀`
  } else {
    easterEggMensaje.value = `¡Easter Egg: El Rey de la Malla! ✨ ${nombreJugador} suma ${totalMallas} toques`
  }

  if (timerEasterEgg) clearTimeout(timerEasterEgg)
  timerEasterEgg = setTimeout(() => {
    easterEggMensaje.value = ''
  }, 2500)
}

const handleTerminarSet = () => {
  if (!props.match) return

  if (puntosJ1.value === puntosJ2.value) {
    window.alert('El set está empatado. Debe haber un jugador con mayor puntuación para definir el ganador del set.')
    return
  }

  const ganadorSetId = puntosJ1.value > puntosJ2.value ? props.match.jugador1.id : props.match.jugador2.id

  const nuevoSet: SetPartido = {
    setNumero: numeroSetActual.value,
    puntosJugador1: puntosJ1.value,
    puntosJugador2: puntosJ2.value,
    mallasJugador1: mallasJ1.value,
    mallasJugador2: mallasJ2.value,
    ganadorId: ganadorSetId,
  }

  historialSets.value.push(nuevoSet)
  puntosJ1.value = 0
  puntosJ2.value = 0
  mallasJ1.value = 0
  mallasJ2.value = 0

  ladosInvertidos.value = !ladosInvertidos.value
}

const confirmarRegistroFinal = () => {
  if (!props.match || !ganadorPartido.value) return

  modalFinPartidoRef.value?.close()

  emit('partido-finalizado', {
    partidoId: props.match.partido.id,
    sets: historialSets.value,
    ganadorId: ganadorPartido.value.id,
  })

  close()
}

defineExpose({
  open,
  close,
})
</script>

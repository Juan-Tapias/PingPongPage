<template>
  <div class="w-full max-w-full overflow-x-hidden flex flex-col gap-6 animate-in fade-in duration-200">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
      <div class="flex items-center gap-3">
        <button
          type="button"
          class="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
          @click="$emit('volver')"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Volver a mis torneos</span>
        </button>

        <div class="h-6 w-px bg-slate-200 hidden sm:block"></div>

        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-lg sm:text-xl font-black font-heading text-slate-900 tracking-tight">
              {{ torneo.nombre }}
            </h2>
            <span
              class="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md tracking-wider"
              :class="torneo.estado === 'en curso' ? 'bg-sky-100 text-sky-800' : 'bg-slate-100 text-slate-700'"
            >
              {{ torneo.estado }}
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Organizado por {{ torneo.organizador }} • Modalidad Todos contra todos (Round Robin)
          </p>
        </div>
      </div>

      <div class="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          class="gap-1.5 border-emerald-600 text-emerald-800 hover:bg-emerald-50 cursor-pointer font-bold"
          @click="abrirModalArbitraje"
        >
          <ShieldCheck class="w-4 h-4 text-emerald-700" />
          <span>Arbitrar un partido</span>
        </Button>

        <div class="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          <button
            type="button"
            :class="[
              'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer',
              tabActiva === 'grafica'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            ]"
            @click="tabActiva = 'grafica'"
          >
            <Activity class="w-3.5 h-3.5" />
            <span>Gráfica</span>
          </button>

          <button
            type="button"
            :class="[
              'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer',
              tabActiva === 'posiciones'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            ]"
            @click="tabActiva = 'posiciones'"
          >
            <ListOrdered class="w-3.5 h-3.5" />
            <span>Tabla de posiciones</span>
          </button>

          <button
            type="button"
            :class="[
              'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer',
              tabActiva === 'playoffs'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            ]"
            @click="tabActiva = 'playoffs'"
          >
            <Crown class="w-3.5 h-3.5 text-amber-300" />
            <span>Playoffs (Concéntrico)</span>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="esVistaRival"
      class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-sky-50 border border-sky-200 text-sky-900"
    >
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
          {{ jugadorEnCentro.iniciales }}
        </div>
        <div>
          <p class="text-xs font-semibold text-sky-700 uppercase tracking-wide">
            Vista Sincronizada de Rival
          </p>
          <h4 class="text-sm font-extrabold text-sky-950">
            Estás viendo la rueda de {{ jugadorEnCentro.nombre }}
          </h4>
        </div>
      </div>

      <Button
        variant="primary"
        size="sm"
        class="gap-2 cursor-pointer w-full sm:w-auto"
        @click="volverAMiVista"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        <span>← Volver a mi vista</span>
      </Button>
    </div>

    <div v-show="tabActiva === 'grafica'" class="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <div class="lg:col-span-7 w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col items-center overflow-hidden">
        <div class="w-full flex flex-wrap items-center justify-center sm:justify-between pb-3 border-b border-slate-100 gap-2.5 text-[11px] font-bold text-slate-600">
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3.5">
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 bg-emerald-50 shrink-0"></span>
              Partido Ganado
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full border-2 border-rose-500 bg-rose-50 shrink-0"></span>
              Partido Perdido
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full border-2 border-slate-400 bg-slate-50 shrink-0"></span>
              No Jugado (Pendiente)
            </span>
            <span v-if="torneo.estado === 'en curso'" class="flex items-center gap-1.5 text-sky-800">
              <span class="w-2 h-2 rounded-full bg-sky-500 animate-pulse shrink-0"></span>
              Luz Azul: Rival a las 12
            </span>
          </div>

          <p class="text-[11px] text-slate-400 font-medium text-center sm:text-right">
            <span v-if="!esVistaRival">Toca cualquier burbuja para ver detalles y plazo.</span>
            <span v-else>Toca una burbuja verde o roja para ver marcador y ganador.</span>
          </p>
        </div>

        <RuedaBurbujas
          :torneo="torneo"
          :jugador-centro="jugadorEnCentro"
          :rivales="rivalesPerimetro"
          :es-vista-rival="esVistaRival"
          @seleccionar-rival="handleAbrirDetalleRival"
          @seleccionar-enfrentamiento-rival="handleAbrirMarcadorRival"
        />
      </div>

      <div class="lg:col-span-5 w-full flex flex-col gap-4">
        <CardAvanceTorneo
          :torneo="torneo"
          :partidos="partidos"
        />

        <CardInfoRival
          :rival="rivalDeTurno"
        />
      </div>
    </div>

    <div v-show="tabActiva === 'posiciones'" class="w-full">
      <TablaPosicionesGrupo :posiciones="tablaPosiciones" />
    </div>

    <!-- VISTA DE PLAYOFFS EN CÍRCULOS CONCÉNTRICOS -->
    <div v-show="tabActiva === 'playoffs'" class="w-full">
      <EliminatoriasConcentric
        :filas-posiciones="tablaPosiciones"
        @abrir-espectador="handleAbrirEspectador"
      />
    </div>

    <ModalDetalleRival
      ref="modalDetalleRef"
      :burbuja="burbujaSeleccionada"
      @ver-rival="verVistaRival"
    />

    <ModalMarcadorRival
      ref="modalMarcadorRef"
      :burbuja="burbujaMarcadorSeleccionada"
    />

    <!-- MODAL PARA QUE UN JUGADOR REGISTRADO ARBITRE (EXCLUYE SU PARTIDO) -->
    <ModalArbitraje
      ref="modalArbitrajeRef"
      :arbitro="arbitroActual"
      :jugadores-torneo="jugadores"
      :partidos-disponibles="partidosDisponiblesParaArbitrar"
      @cambiar-arbitro="setArbitroActual"
      @validar-codigos="handleValidarCodigos"
      @iniciar-partido="handleIniciarPartidoArbitrado"
    />

    <!-- MODAL MARCADOR VIRTUAL TEMÁTICO DE MESA DE PING PONG -->
    <ModalMarcadorVirtual
      ref="modalMarcadorVirtualRef"
      :match="partidoEnMarcador"
      @partido-finalizado="handlePartidoFinalizado"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, Activity, ListOrdered, Crown, RotateCcw, ShieldCheck } from 'lucide-vue-next'
import Button from '@/components/Button.vue'
import RuedaBurbujas from './RuedaBurbujas.vue'
import TablaPosicionesGrupo from './TablaPosicionesGrupo.vue'
import EliminatoriasConcentric from './EliminatoriasConcentric.vue'
import ModalDetalleRival from './ModalDetalleRival.vue'
import ModalMarcadorRival from './ModalMarcadorRival.vue'
import ModalArbitraje from '../arbitraje/ModalArbitraje.vue'
import ModalMarcadorVirtual from '../arbitraje/ModalMarcadorVirtual.vue'
import CardAvanceTorneo from './CardAvanceTorneo.vue'
import CardInfoRival from './CardInfoRival.vue'
import { useTorneoGrupo } from '@/modules/dashboard/composables/useTorneoGrupo'
import type { Torneo, BurbujaRival, PartidoArbitrable, SetPartido } from '@/types'

const props = defineProps<{
  torneo: Torneo
}>()

defineEmits<{
  (e: 'volver'): void
}>()

const tabActiva = ref<'grafica' | 'posiciones' | 'playoffs'>('grafica')

const {
  usuarioActual,
  jugadores,
  jugadorEnCentro,
  rivalesPerimetro,
  rivalDeTurno,
  partidos,
  esVistaRival,
  verVistaRival,
  volverAMiVista,
  tablaPosiciones,
  arbitroActual,
  setArbitroActual,
  partidosDisponiblesParaArbitrar,
  validarCodigosArbitraje,
  registrarResultadoPartido,
} = useTorneoGrupo(props.torneo)

const modalDetalleRef = ref<InstanceType<typeof ModalDetalleRival> | null>(null)
const modalMarcadorRef = ref<InstanceType<typeof ModalMarcadorRival> | null>(null)
const modalArbitrajeRef = ref<InstanceType<typeof ModalArbitraje> | null>(null)
const modalMarcadorVirtualRef = ref<InstanceType<typeof ModalMarcadorVirtual> | null>(null)

const burbujaSeleccionada = ref<BurbujaRival | null>(null)
const burbujaMarcadorSeleccionada = ref<BurbujaRival | null>(null)
const partidoEnMarcador = ref<PartidoArbitrable | null>(null)

const abrirModalArbitraje = () => {
  modalArbitrajeRef.value?.open()
}

const handleAbrirDetalleRival = (burbuja: BurbujaRival) => {
  burbujaSeleccionada.value = burbuja
  modalDetalleRef.value?.open()
}

const handleAbrirMarcadorRival = (burbuja: BurbujaRival) => {
  burbujaMarcadorSeleccionada.value = burbuja
  modalMarcadorRef.value?.open()
}

const handleValidarCodigos = (
  datos: { partidoId: string; codigo1: string; codigo2: string },
  callback: (res: { valido: boolean; mensaje: string }) => void,
) => {
  const resultado = validarCodigosArbitraje(datos.partidoId, datos.codigo1, datos.codigo2)
  callback(resultado)
}

const handleIniciarPartidoArbitrado = (datos: { partidoArbitrable: PartidoArbitrable }) => {
  partidoEnMarcador.value = datos.partidoArbitrable
  modalMarcadorVirtualRef.value?.open()
}

const handlePartidoFinalizado = (datos: {
  partidoId: string
  sets: SetPartido[]
  ganadorId: string
}) => {
  registrarResultadoPartido(datos.partidoId, datos.sets, datos.ganadorId)
}

const handleAbrirEspectador = (partidoId: string) => {
  const match = partidosDisponiblesParaArbitrar.value.find((p) => p.partido.id === partidoId)
  if (match) {
    partidoEnMarcador.value = match
    modalMarcadorVirtualRef.value?.open()
  } else {
    // Si es un partido de playoff, configuramos la sala en vivo
    window.alert(`Ingresando a la sala en vivo como Espectador (Partido ${partidoId})`)
  }
}
</script>

<template>
  <div class="w-full max-w-full overflow-x-hidden flex flex-col gap-6 animate-in fade-in duration-200">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-300">
      <div class="flex items-center gap-3">
        <button
          type="button"
          title="Volver a mis torneos"
          aria-label="Volver a mis torneos"
          class="w-10 h-10 flex items-center justify-center rounded-xl text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200/60 dark:border-slate-700/60 transition-colors cursor-pointer shrink-0 shadow-xs"
          @click="$emit('volver')"
        >
          <ArrowLeft class="w-5 h-5" />
        </button>

        <div class="h-6 w-px bg-slate-200 dark:bg-slate-800 hidden sm:block"></div>

        <div>
          <div class="flex items-center gap-2">
            <h2 class="text-lg sm:text-xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
              {{ torneo.nombre }}
            </h2>
            <span
              class="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md tracking-wider"
              :class="torneo.estado === 'en curso' ? 'bg-sky-100 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300' : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'"
            >
              {{ torneo.estado }}
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organizado por {{ torneo.organizador }} • Modalidad Todos contra todos (Round Robin)
          </p>
        </div>
      </div>

      <div v-if="torneo.estado !== 'por iniciar'" class="flex flex-wrap items-center gap-2.5 self-start sm:self-auto">
        <Button
          variant="outline"
          size="sm"
          class="gap-1.5 border-emerald-600 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer font-bold"
          @click="abrirModalArbitraje"
        >
          <ShieldCheck class="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>Arbitrar un partido</span>
        </Button>

        <div class="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            :class="[
              'flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer',
              tabActiva === 'grafica'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
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
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
            @click="tabActiva = 'playoffs'"
          >
            <Crown class="w-3.5 h-3.5 text-amber-300" />
            <span>Eliminatorias</span>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="torneo.estado === 'finalizado'"
      class="w-full grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300"
    >
      <div
        v-if="jugadorMasMallero"
        class="flex items-center justify-between gap-4 p-4.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-white dark:to-[#0f172a] border border-emerald-300 dark:border-emerald-800/80 shadow-xs transition-colors duration-300"
      >
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
            🏓
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              Reconocimiento Especial
            </span>
            <h4 class="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate mt-1">
              {{ jugadorMasMallero.titulo }}
            </h4>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                {{ jugadorMasMallero.jugador.nombre }}
              </span>
              <span
                v-if="jugadorMasMallero.jugador.esUsuarioActual"
                class="text-[9px] font-black bg-emerald-700 text-white px-1.5 py-0.2 rounded shrink-0"
              >
                Tú
              </span>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-end shrink-0 pl-2">
          <span class="text-2xl sm:text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400 leading-none">
            {{ jugadorMasMallero.totalMallas }}
          </span>
          <span class="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
            Mallas
          </span>
        </div>
      </div>

      <!-- RECONOCIMIENTO: CAMPEÓN DEL TORNEO -->
      <div class="flex items-center justify-between gap-4 p-4.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white dark:to-[#0f172a] border border-amber-300 dark:border-amber-800/80 shadow-xs transition-colors duration-300">
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-xs shrink-0">
            👑
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
              Gran Campeón
            </span>
            <h4 class="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate mt-1">
              Ganador del Torneo
            </h4>
            <p class="text-xs text-slate-600 dark:text-slate-300 font-bold">
              Bolsa acumulada: $90.000 COP
            </p>
          </div>
        </div>

        <div class="flex flex-col items-end shrink-0 pl-2">
          <span class="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400 leading-none">
            100%
          </span>
          <span class="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider mt-1">
            Bolsa
          </span>
        </div>
      </div>
    </div>

    <!-- ESTADO DE ESPERA: TORNEO POR INICIAR (FASE DE CONVOCATORIA) -->
    <div
      v-if="torneo.estado === 'por iniciar'"
      class="w-full bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 sm:p-10 flex flex-col items-center justify-center text-center gap-5"
    >
      <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20 shadow-xs">
        <Clock class="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
      </div>

      <div class="max-w-xl space-y-2">
        <span class="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 inline-block">
          Fase de Convocatoria Activa
        </span>
        <h3 class="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
          ¡Tu cupo está asegurado y validado!
        </h3>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          El torneo se encuentra actualmente en periodo de inscripciones y validación de comprobantes. Tan pronto el comité organizador cierre la convocatoria y presione <strong>Generar Partidos</strong>, se habilitará tu rueda de enfrentamientos, rivales asignados y la tabla de posiciones oficial.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg pt-2 text-xs">
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-center">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Tu Estado</span>
          <span class="font-black text-emerald-600 dark:text-emerald-400 text-sm">✓ Inscrito Oficial</span>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-center">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Modalidad</span>
          <span class="font-black text-slate-900 dark:text-white text-sm">Round Robin</span>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-center">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Plazo por Partido</span>
          <span class="font-black text-amber-600 dark:text-amber-400 text-sm">48 Horas</span>
        </div>
      </div>
    </div>

    <!-- VISTA COMPETITIVA ACTIVA (EN CURSO O FINALIZADO) -->
    <template v-else>
    <div
      v-if="esVistaRival"
      class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200"
    >
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
          {{ jugadorEnCentro.iniciales }}
        </div>
        <div>
          <p class="text-xs font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wide">
            Vista Sincronizada de Rival
          </p>
          <h4 class="text-sm font-extrabold text-sky-950 dark:text-white">
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
      <div class="lg:col-span-7 w-full bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-5 flex flex-col items-center overflow-hidden transition-colors duration-300">
        <div class="w-full flex flex-wrap items-center justify-center sm:justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3.5">
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950 shrink-0"></span>
              Partido Ganado
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full border-2 border-rose-500 bg-rose-50 dark:bg-rose-950 shrink-0"></span>
              Partido Perdido
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full border-2 border-orange-500 bg-orange-50 dark:bg-orange-950 shrink-0"></span>
              Pendiente Decisión Admin (>48h)
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full border-2 border-slate-400 bg-slate-50 dark:bg-slate-800 shrink-0"></span>
              No Jugado (Pendiente)
            </span>
            <span v-if="torneo.estado === 'en curso'" class="flex items-center gap-1.5 text-sky-800 dark:text-sky-300">
              <span class="w-2 h-2 rounded-full bg-sky-500 animate-pulse shrink-0"></span>
              Luz Azul: Rival a las 12
            </span>
          </div>

          <p class="text-[11px] text-slate-400 dark:text-slate-500 font-medium text-center sm:text-right">
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

    <!-- VISTA DE ELIMINATORIAS (PLAYOFFS) -->
    <div v-show="tabActiva === 'playoffs'" class="w-full">
      <EliminatoriasConcentric
        :filas-posiciones="tablaPosiciones"
        :cantidad-clasificados="props.torneo?.clasificadosPlayoffs || 4"
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
      @validar-codigos="handleValidarCodigos"
      @iniciar-partido="handleIniciarPartidoArbitrado"
    />

    <!-- MODAL MARCADOR VIRTUAL TEMÁTICO DE MESA DE PING PONG -->
    <ModalMarcadorVirtual
      ref="modalMarcadorVirtualRef"
      :match="partidoEnMarcador"
      @partido-finalizado="handlePartidoFinalizado"
    />
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ArrowLeft, Activity, ListOrdered, Crown, RotateCcw, ShieldCheck, Clock } from 'lucide-vue-next'
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
  jugadorMasMallero,
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
</script>

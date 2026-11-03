<template>
  <div class="flex flex-col gap-6 w-full animate-in fade-in duration-200">

    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-300">
      <div class="flex items-start sm:items-center gap-3">
        <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200/80 dark:border-amber-800 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
          <Crown class="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white font-heading tracking-tight leading-snug">
              Cuadro Oficial de Eliminatorias (Playoffs)
            </h3>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800 shrink-0">
              Fase 2 • Eliminación Directa
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ textoSubtituloPlayoffs }}
          </p>
        </div>
      </div>

      <!-- Tarjeta de Bolsa y Conmutador de Modo -->
      <div class="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 w-full lg:w-auto">
        <!-- Bolsa Acumulada $90.000 COP -->
        <div class="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-300">
          <Trophy class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <div class="flex flex-col">
            <span class="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">Premio Acumulado</span>
            <span class="text-xs font-black font-mono text-amber-950 dark:text-amber-200">
              ${{ playoffs.bolsaPremioFormateada }} COP
            </span>
          </div>
          <span class="text-[9px] font-extrabold bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded ml-1 shrink-0">
            100% Ganador
          </span>
        </div>

        <!-- Conmutador: Todas las llaves vs Mi Camino -->
        <div class="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700">
          <button
            type="button"
            :class="[
              'px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
              modoVista === 'completo'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
            @click="modoVista = 'completo'"
          >
            <Sparkles class="w-3.5 h-3.5 text-amber-500" />
            <span>Todas las llaves</span>
          </button>

          <button
            type="button"
            :class="[
              'px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
              modoVista === 'mi-camino'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
            @click="modoVista = 'mi-camino'"
          >
            <Compass class="w-3.5 h-3.5" />
            <span>Mi Camino</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Estado del cuadro: oficial (persistido) vs proyección -->
    <div
      v-if="playoffs.campeon.value"
      class="p-4 rounded-2xl border-2 border-amber-400 bg-gradient-to-r from-amber-100 to-white dark:from-amber-950/50 dark:to-[#0f172a] flex items-center gap-3"
    >
      <AvatarJugador
        :foto-url="playoffs.campeon.value.fotoUrl"
        :nombre="playoffs.campeon.value.nombre"
        :iniciales="playoffs.campeon.value.iniciales"
        size="md"
        ring-class="ring-2 ring-amber-400"
      />
      <div>
        <span class="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">🏆 Campeón del torneo</span>
        <p class="text-sm font-black text-slate-900 dark:text-white">{{ playoffs.campeon.value.nombre }}</p>
      </div>
    </div>
    <div
      v-else-if="!playoffs.esOficial.value"
      class="p-3 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/40 text-xs text-slate-600 dark:text-slate-300 font-semibold"
    >
      <template v-if="playoffs.partidos.value.length > 0">
        Eliminatorias a?n no abiertas. Este es solo el formato del cuadro; los cruces con nombres se publican cuando el administrador cierre la fase de grupos.
      </template>
      <template v-else-if="playoffs.errorProyeccion.value">
        {{ playoffs.errorProyeccion.value }}
      </template>
      <template v-else>
        Las eliminatorias aún no han comenzado. El cuadro aparecerá cuando se jueguen partidos de la fase de grupos.
      </template>
    </div>
    <p v-if="playoffs.errorCarga.value" class="text-xs font-bold text-red-600 dark:text-red-400">
      {{ playoffs.errorCarga.value }}
    </p>

    <!-- SELECTOR DE RONDAS PARA MÓVIL (Pills) -->
    <div v-if="playoffs.rondas.value.length > 0" class="flex lg:hidden items-center gap-2 overflow-x-auto pb-1">
      <button
        v-for="ronda in rondasNavegacion"
        :key="ronda.id"
        type="button"
        :class="[
          'px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer',
          rondaMovilActiva === ronda.id
            ? 'bg-slate-900 dark:bg-sky-600 text-white shadow-xs'
            : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
        ]"
        @click="rondaMovilActiva = ronda.id"
      >
        {{ ronda.nombre }} ({{ ronda.cantidad }})
      </button>
    </div>

    <!-- CUADRO DE LLAVES DINÁMICO (columnas según el formato real) -->
    <div
      v-if="playoffs.rondas.value.length > 0"
      class="w-full bg-slate-50/70 dark:bg-[#070e1e] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-6 overflow-x-auto shadow-xs transition-colors duration-300"
    >
      <div
        :class="[
          rondaMovilActiva === 'todas' ? (playoffs.rondas.value.length > 2 ? 'min-w-[900px]' : 'min-w-[480px]') : 'w-full min-w-full',
          'flex items-stretch gap-4 lg:gap-6 justify-between'
        ]"
      >
        <div
          v-for="(columna, idxCol) in playoffs.rondas.value"
          :key="columna.ronda"
          :class="[
            'flex-1 flex flex-col gap-4 transition-all duration-200',
            rondaMovilActiva !== 'todas' && rondaMovilActiva !== columna.ronda ? 'hidden lg:flex' : 'flex'
          ]"
        >
          <div class="flex flex-col gap-1 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Crown v-if="columna.ronda === 'final'" class="w-3.5 h-3.5 text-amber-500" />
                {{ idxCol + 1 }}. {{ columna.nombre }}
              </span>
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {{ columna.partidos.length }} {{ columna.partidos.length === 1 ? 'Llave' : 'Llaves' }}
              </span>
            </div>
            <p v-if="columna.ronda === 'final'" class="text-[11px] text-amber-700 dark:text-amber-400 font-medium">
              El ganador se lleva ${{ playoffs.bolsaPremioFormateada }} COP
            </p>
          </div>

          <div class="flex flex-col gap-4 justify-around h-full">
            <div
              v-for="partido in columna.partidos"
              :key="partido.id"
              :class="[
                'group relative rounded-xl border p-3.5 transition-all duration-200 cursor-pointer shadow-2xs',
                columna.ronda === 'final' ? 'border-2 border-amber-400/90 dark:border-amber-500/80' : '',
                obtenerEstiloTarjeta(partido)
              ]"
              @click="abrirDetallePartido(partido)"
            >
              <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold">
                <span class="text-slate-500 dark:text-slate-400 uppercase">
                  {{ columna.ronda === 'final' ? 'Por el Campeonato' : `Llave ${partido.numeroLlave}` }}
                </span>
                <span :class="obtenerClaseBadgeEstado(partido.estado)" class="px-1.5 py-0.5 rounded">
                  {{ formatearEstado(partido.estado) }}
                </span>
              </div>

              <div
                v-for="slot in ([1, 2] as const)"
                :key="slot"
                class="flex items-center justify-between gap-2 py-1.5"
              >
                <div class="flex items-center gap-2 min-w-0">
                  <AvatarJugador
                    :foto-url="jugadorSlot(partido, slot)?.fotoUrl"
                    :nombre="jugadorSlot(partido, slot)?.nombre"
                    :iniciales="jugadorSlot(partido, slot)?.iniciales"
                    size="sm"
                    :ring-class="jugadorSlot(partido, slot)?.esUsuarioActual ? 'ring-2 ring-emerald-500' : ''"
                  />
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span
                      class="text-xs font-bold truncate"
                      :class="[
                        jugadorSlot(partido, slot) ? 'text-slate-800 dark:text-slate-200' : 'text-slate-400 italic',
                        jugadorSlot(partido, slot)?.esUsuarioActual ? 'text-emerald-950 dark:text-emerald-300 font-black' : '',
                        partido.estado === 'jugado' && partido.ganadorId && partido.ganadorId !== jugadorSlot(partido, slot)?.id ? 'line-through opacity-60' : ''
                      ]"
                    >
                      {{ jugadorSlot(partido, slot)?.nombre || textoEsperando(partido, slot) }}
                    </span>
                    <span
                      v-if="semillaSlot(partido, slot)"
                      class="text-[9px] font-black px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0"
                    >
                      #{{ semillaSlot(partido, slot) }}
                    </span>
                    <span
                      v-if="jugadorSlot(partido, slot)?.esUsuarioActual"
                      class="text-[9px] font-black bg-emerald-700 text-white px-1.5 py-0.2 rounded shrink-0"
                    >
                      Tú
                    </span>
                  </div>
                </div>
                <span
                  class="font-mono text-xs font-black shrink-0 px-2 py-0.5 rounded"
                  :class="partido.ganadorId && partido.ganadorId === jugadorSlot(partido, slot)?.id ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' : 'text-slate-500 dark:text-slate-400'"
                >
                  {{ obtenerScoreJugador(partido, slot) }}
                </span>
              </div>

              <div class="mt-2 pt-2 border-t border-slate-100/80 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
                <span>{{ textoDestino(partido) }}</span>
                <ChevronRight v-if="partido.siguientePartidoId" class="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
                <Crown v-else class="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <Modal
      ref="modalPlayoffRef"
      title="Marcador del Partido"
      :sub-title="partidoSeleccionado ? `${formatearRonda(partidoSeleccionado.ronda)} • Llave ${partidoSeleccionado.numeroLlave}` : 'Información del encuentro'"
      width="sm"
      :footer="false"
    >
      <div v-if="partidoSeleccionado" class="flex flex-col items-center text-center gap-4 py-2">
        <!-- Ícono de Estado / Trofeo -->
        <div
          class="w-13 h-13 rounded-full flex items-center justify-center font-bold text-white shadow-sm"
          :class="partidoSeleccionado.estado === 'jugado' ? 'bg-emerald-600' : partidoSeleccionado.estado === 'en_curso' ? 'bg-sky-600' : 'bg-slate-700'"
        >
          <Trophy v-if="partidoSeleccionado.estado === 'jugado'" class="w-6 h-6 text-white" />
          <Activity v-else-if="partidoSeleccionado.estado === 'en_curso'" class="w-6 h-6 text-white animate-pulse" />
          <Clock v-else class="w-6 h-6 text-slate-300" />
        </div>

        <!-- Nombre del Ganador o Título del Estado -->
        <div class="space-y-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {{ partidoSeleccionado.estado === 'jugado' ? 'Ganador del Encuentro' : partidoSeleccionado.estado === 'en_curso' ? 'Partido en Mesa' : 'Partido Programado' }}
          </span>
          <h3 class="text-base sm:text-lg font-black text-slate-900">
            {{ obtenerNombreGanador(partidoSeleccionado) }}
          </h3>
        </div>

        <!-- Cuadro Destacado del Marcador -->
        <div class="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 shadow-2xs">
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            {{ partidoSeleccionado.estado === 'jugado' ? 'Marcador Final (Sets)' : partidoSeleccionado.estado === 'en_curso' ? 'Marcador en Vivo' : 'Marcador' }}
          </span>
          <span
            class="text-3xl sm:text-4xl font-black font-mono tracking-tight"
            :class="partidoSeleccionado.estado === 'jugado' ? 'text-emerald-700 dark:text-emerald-400' : partidoSeleccionado.estado === 'en_curso' ? 'text-sky-700 dark:text-sky-400' : 'text-slate-400'"
          >
            {{ partidoSeleccionado.marcador || '0 - 0' }}
          </span>
          <span v-if="partidoSeleccionado.marcadorDetallado" class="text-xs text-slate-600 dark:text-slate-300 font-mono font-bold mt-1 bg-white dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600">
            Sets: {{ partidoSeleccionado.marcadorDetallado }}
          </span>
        </div>

        <!-- Desglose de Jugadores y Sets -->
        <div class="w-full grid grid-cols-2 gap-2 text-xs">
          <div
            class="p-2.5 rounded-xl border flex flex-col items-center gap-1"
            :class="partidoSeleccionado.ganadorId === partidoSeleccionado.jugador1?.id ? 'bg-emerald-50/70 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'"
          >
            <span class="font-bold truncate w-full text-center">
              {{ partidoSeleccionado.jugador1?.nombre || 'Por definir' }}
            </span>
            <span
              class="font-mono text-sm font-black"
              :class="partidoSeleccionado.ganadorId === partidoSeleccionado.jugador1?.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'"
            >
              {{ obtenerScoreJugador(partidoSeleccionado, 1) }} sets
            </span>
          </div>

          <div
            class="p-2.5 rounded-xl border flex flex-col items-center gap-1"
            :class="partidoSeleccionado.ganadorId === partidoSeleccionado.jugador2?.id ? 'bg-emerald-50/70 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'"
          >
            <span class="font-bold truncate w-full text-center">
              {{ partidoSeleccionado.jugador2?.nombre || 'Por definir' }}
            </span>
            <span
              class="font-mono text-sm font-black"
              :class="partidoSeleccionado.ganadorId === partidoSeleccionado.jugador2?.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'"
            >
              {{ obtenerScoreJugador(partidoSeleccionado, 2) }} sets
            </span>
          </div>
        </div>

        <!-- Botón Cerrar Único -->
        <div class="w-full pt-2">
          <Button
            variant="outline"
            size="md"
            class="w-full justify-center cursor-pointer font-bold"
            @click="modalPlayoffRef?.close()"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Crown, Trophy, Compass, Sparkles, ChevronRight, Activity, Clock } from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import AvatarJugador from '@/components/AvatarJugador.vue'
import { usePlayoffs } from '@/modules/dashboard/composables/usePlayoffs'
import type { FilaPosicion, PartidoPlayoff, RondaPlayoff, EstadoPartido, Torneo } from '@/types'

const props = withDefaults(
  defineProps<{
    filasPosiciones: FilaPosicion[]
    cantidadClasificados?: number
    torneo?: Torneo | null
  }>(),
  {
    cantidadClasificados: 4,
    torneo: null,
  }
)

const modoVista = ref<'completo' | 'mi-camino'>('completo')
const rondaMovilActiva = ref<'todas' | RondaPlayoff>('todas')
const modalPlayoffRef = ref<InstanceType<typeof Modal> | null>(null)
const partidoSeleccionado = ref<PartidoPlayoff | null>(null)

const playoffs = usePlayoffs(
  () => props.filasPosiciones,
  () => props.cantidadClasificados,
  () => props.torneo
)

const textoSubtituloPlayoffs = computed(() => {
  const c = props.cantidadClasificados
  if (c === 2) return 'Top 2 disputan la Gran Final directa por la Corona'
  if (c === 6) return 'Top 1° y 2° avanzan directo a Semis (BYE) • Puestos 3° al 6° disputan Cuartos'
  if (c === 8) return 'Top 8 clasificados de la fase regular disputan Cuartos de Final'
  if (c === 12) return 'Top 4 directos a Cuartos (BYE) • Puestos 5° al 12° disputan el Play-In'
  return 'Top 4 clasificados de la fase regular disputan Semifinales y Gran Final • Al mejor de 3 sets'
})

// Pills móviles generadas a partir de las rondas reales del formato
const rondasNavegacion = computed(() => [
  { id: 'todas' as const, nombre: 'Todas', cantidad: playoffs.partidos.value.length },
  ...playoffs.rondas.value.map((r) => ({
    id: r.ronda,
    nombre: r.ronda === 'final' ? 'Final 👑' : r.nombre,
    cantidad: r.partidos.length,
  })),
])

const jugadorSlot = (partido: PartidoPlayoff, slot: 1 | 2) =>
  (slot === 1 ? partido.jugador1 : partido.jugador2) || null

const semillaSlot = (partido: PartidoPlayoff, slot: 1 | 2) =>
  (slot === 1 ? partido.semilla1 : partido.semilla2) || null

// Texto para un slot vacío: indica de qué llave llega el ganador
const textoEsperando = (partido: PartidoPlayoff, slot: 1 | 2): string => {
  const origen = playoffs.partidos.value.find(
    (p) => p.siguientePartidoId === partido.id && (p.siguienteSlot || 1) === slot,
  )
  if (!origen) {
    const semilla = semillaSlot(partido, slot)
    if (!playoffs.esOficial.value && semilla) return partido.esBye ? `Top ${semilla} (BYE)` : `Top ${semilla}`
    return 'Por definir'
  }
  return `Ganador ${formatearRonda(origen.ronda)} ${origen.numeroLlave}`
}

const textoDestino = (partido: PartidoPlayoff): string => {
  if (!partido.siguientePartidoId) return 'El ganador se corona campeón'
  const destino = playoffs.partidos.value.find((p) => p.id === partido.siguientePartidoId)
  return destino ? `Avanza a ${formatearRonda(destino.ronda)} ${destino.numeroLlave}` : 'Avanza a la siguiente ronda'
}

const obtenerScoreJugador = (partido: PartidoPlayoff, jugadorNumero: 1 | 2): string => {
  if (!partido.marcador) return '-'
  const partes = partido.marcador.split('-').map((s) => s.trim())
  return jugadorNumero === 1 ? partes[0] ?? '-' : partes[1] ?? '-'
}

const obtenerEstiloTarjeta = (partido: PartidoPlayoff): string => {
  const esMiPartido = partido.jugador1?.esUsuarioActual || partido.jugador2?.esUsuarioActual

  if (modoVista.value === 'mi-camino') {
    if (esMiPartido) {
      return 'bg-emerald-50/60 dark:bg-emerald-950/50 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
    }
    return 'bg-white/40 dark:bg-slate-800/40 border-slate-200/60 dark:border-slate-700/60 opacity-40 hover:opacity-100'
  }

  if (esMiPartido) {
    return 'bg-emerald-50/40 dark:bg-emerald-950/40 border-emerald-400 dark:border-emerald-600 shadow-2xs hover:border-emerald-500'
  }

  return 'bg-white dark:bg-[#0f172a] border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
}

const obtenerClaseBadgeEstado = (estado: EstadoPartido): string => {
  switch (estado) {
    case 'jugado':
      return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
    case 'en_curso':
      return 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 animate-pulse'
    case 'pendiente_admin':
      return 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300'
    case 'pendiente':
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
  }
}

const formatearEstado = (estado: EstadoPartido): string => {
  switch (estado) {
    case 'jugado':
      return 'Finalizado'
    case 'en_curso':
      return 'En Vivo'
    case 'pendiente_admin':
      return 'Pendiente Admin'
    case 'pendiente':
    default:
      return 'Por Jugar'
  }
}

const formatearRonda = (ronda: RondaPlayoff): string => {
  switch (ronda) {
    case 'play_in':
      return 'Play-In (Octavos de Final)'
    case 'cuartos':
      return 'Cuartos de Final'
    case 'semifinal':
      return 'Semifinal'
    case 'final':
      return 'Gran Final 👑'
  }
}

const obtenerNombreGanador = (partido: PartidoPlayoff | null): string => {
  if (!partido) return ''
  if (partido.ganadorId) {
    if (partido.jugador1?.id === partido.ganadorId) return partido.jugador1.nombre
    if (partido.jugador2?.id === partido.ganadorId) return partido.jugador2.nombre
  }
  return `${partido.jugador1?.nombre || 'Por definir'} vs ${partido.jugador2?.nombre || 'Por definir'}`
}

const abrirDetallePartido = (partido: PartidoPlayoff) => {
  partidoSeleccionado.value = partido
  modalPlayoffRef.value?.open()
}
</script>

<template>
  <Modal
    ref="modalRef"
    title="Detalle del Rival"
    sub-title="Información reglamentaria y estado del enfrentamiento"
    max-width="md"
    :footer="false"
  >
    <div v-if="burbuja" class="flex flex-col gap-5 py-1">
      <div class="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
        <div
          class="w-14 h-14 rounded-full flex items-center justify-center font-black text-lg text-white shadow-md select-none shrink-0"
          :class="burbuja.esRivalDeTurno && burbuja.partido.estado !== 'jugado' ? 'border-2 border-sky-400 shadow-[0_0_12px_rgba(56,189,248,0.7)]' : ''"
          :style="{ backgroundColor: colorBurbuja }"
        >
          {{ burbuja.jugador.iniciales }}
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-base font-extrabold text-slate-900 dark:text-white truncate">
            {{ burbuja.jugador.nombre }}
          </h4>
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold mt-1"
            :class="badgeEstadoClase"
          >
            {{ textoEstadoEnfrentamiento }}
          </span>
        </div>
      </div>

      <div class="space-y-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 p-4 divide-y divide-slate-100 dark:divide-slate-700">
        <div class="flex items-center justify-between py-1.5">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Jornada / Fecha:</span>
          <span class="text-xs font-bold font-mono text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
            Ronda {{ burbuja.partido?.ronda || 1 }}
          </span>
        </div>

        <div class="flex items-center justify-between py-1.5">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Nombre completo:</span>
          <span class="text-xs font-bold text-slate-800 dark:text-slate-200 text-right">{{ burbuja.jugador.nombre }}</span>
        </div>

        <div class="flex items-center justify-between py-2">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Teléfono de contacto:</span>
          <span class="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 tracking-wide select-all">
            {{ burbuja.jugador.telefono }}
          </span>
        </div>

        <div class="flex items-center justify-between py-2">
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Plazo límite:</span>
            <span class="text-[10px] text-slate-400 dark:text-slate-500">Reglamento: 48 horas máx.</span>
          </div>

          <div class="text-right">
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold"
              :class="estiloFechaLimite"
            >
              <Hourglass v-if="burbuja.rivalTienePartidosPendientes" class="w-3.5 h-3.5" />
              <Clock v-else-if="burbuja.diasRestantes > 0" class="w-3.5 h-3.5" />
              <AlertTriangle v-else class="w-3.5 h-3.5" />
              {{ textoFechaLimite }}
            </span>
          </div>
        </div>

        <div v-if="burbuja.rivalTienePartidosPendientes && burbuja.partido.estado !== 'jugado'" class="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 text-[11px] text-sky-900 dark:text-sky-200">
          <p class="font-bold flex items-center gap-1">
            <Hourglass class="w-3.5 h-3.5 text-sky-600 shrink-0" />
            Partido en espera de rival
          </p>
          <p class="text-[10px] text-sky-800 dark:text-sky-300 mt-0.5">
            Tu rival aún tiene partidos pendientes por disputar en rondas previas. El plazo reglamentario de 48 horas iniciará en cuanto ambos queden habilitados.
          </p>
        </div>

        <div v-else-if="burbuja.partido.estado === 'pendiente_admin' || (burbuja.diasRestantes <= 0 && burbuja.partido.estado === 'pendiente')" class="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
          <p class="font-bold flex items-center gap-1">
            <AlertTriangle class="w-3.5 h-3.5 text-amber-600 shrink-0" />
            Plazo reglamentario cumplido
          </p>
          <p class="text-[10px] text-amber-800 dark:text-amber-300 mt-0.5">
            Si tu rival no se presentó o no es posible disputar el partido, solicita al árbitro registrar victoria por W.O. (11-6, 11-6).
          </p>
        </div>

        <div v-if="!props.esVistaRival && burbuja.partido.estado === 'pendiente' && burbuja.codigoSeguridadPropio" class="flex items-center justify-between py-2">
          <div class="flex items-center gap-1.5">
            <KeyRound class="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Tu PIN para árbitro:</span>
          </div>
          <span class="text-xs font-black font-mono tracking-widest text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-md border border-sky-200 dark:border-sky-800 select-all">
            {{ burbuja.codigoSeguridadPropio }}
          </span>
        </div>

        <!-- RESULTADO DEL PARTIDO Y DESGLOSE DE SETS EN ORDEN -->
        <div v-if="burbuja.partido.estado === 'jugado'" class="pt-3 space-y-3">
          <!-- Tarjeta Destacada de Marcador Final -->
          <div class="rounded-xl p-3 bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700/80 flex flex-col gap-2.5">
            <div class="flex items-center justify-between">
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Trophy class="w-3.5 h-3.5 text-amber-500" />
                Marcador final
              </span>
              <span
                class="text-[11px] font-extrabold px-2 py-0.5 rounded-md border"
                :class="resumenSets?.ganoYo 
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/80 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800' 
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border-rose-200 dark:border-rose-800'"
              >
                {{ resumenSets?.textoResultado || (burbuja.resultadoParaCentro === 'ganado' ? 'Victoria' : 'Derrota') }}
              </span>
            </div>

            <!-- Comparativo de Sets Ganados -->
            <div class="grid grid-cols-2 gap-2 text-center">
              <!-- Tú / Centro -->
              <div
                class="p-2 rounded-lg border flex flex-col items-center justify-center transition-all"
                :class="resumenSets?.ganoYo 
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 shadow-2xs' 
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'"
              >
                <div class="flex items-center gap-1">
                  <span class="text-xs font-bold truncate max-w-[120px]" :class="resumenSets?.ganoYo ? 'text-emerald-900 dark:text-emerald-200 font-extrabold' : 'text-slate-700 dark:text-slate-300'">
                    {{ resumenSets?.nombreYo || 'Tú' }}
                  </span>
                  <Trophy v-if="resumenSets?.ganoYo" class="w-3 h-3 text-amber-500 shrink-0" />
                </div>
                <span class="text-2xl font-black font-mono leading-none my-1" :class="resumenSets?.ganoYo ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'">
                  {{ resumenSets?.setsYo ?? 0 }}
                </span>
                <span class="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                  {{ (resumenSets?.setsYo === 1) ? 'Set ganado' : 'Sets ganados' }}
                </span>
              </div>

              <!-- Rival -->
              <div
                class="p-2 rounded-lg border flex flex-col items-center justify-center transition-all"
                :class="!resumenSets?.ganoYo 
                  ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700 shadow-2xs' 
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'"
              >
                <div class="flex items-center gap-1">
                  <span class="text-xs font-bold truncate max-w-[120px]" :class="!resumenSets?.ganoYo ? 'text-emerald-900 dark:text-emerald-200 font-extrabold' : 'text-slate-700 dark:text-slate-300'">
                    {{ resumenSets?.nombreRival || burbuja.jugador.nombre }}
                  </span>
                  <Trophy v-if="!resumenSets?.ganoYo" class="w-3 h-3 text-amber-500 shrink-0" />
                </div>
                <span class="text-2xl font-black font-mono leading-none my-1" :class="!resumenSets?.ganoYo ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-300'">
                  {{ resumenSets?.setsRival ?? 0 }}
                </span>
                <span class="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
                  {{ (resumenSets?.setsRival === 1) ? 'Set ganado' : 'Sets ganados' }}
                </span>
              </div>
            </div>

            <!-- Aviso Walkover si aplica -->
            <div v-if="burbuja.partido.esWalkover" class="text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800/60 flex items-center gap-1.5">
              <AlertTriangle class="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span>Resuelto por inasistencia / W.O. (Sets reglamentarios: 11-6, 11-6)</span>
            </div>
          </div>

          <!-- Desglose de Sets en Orden Cronológico -->
          <div v-if="listaSets.length > 0" class="flex flex-col gap-2">
            <div class="flex items-center justify-between px-0.5">
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <ListOrdered class="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                Sets en orden cronológico
              </span>
              <span class="text-[10px] font-mono text-slate-400 font-semibold">
                {{ listaSets.length }} {{ listaSets.length === 1 ? 'set disputado' : 'sets disputados' }}
              </span>
            </div>

            <div class="space-y-1.5">
              <div
                v-for="s in listaSets"
                :key="s.numero"
                class="flex items-center justify-between p-2.5 rounded-lg border transition-colors"
                :class="s.ganador === 'yo' 
                  ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60' 
                  : s.ganador === 'rival' 
                    ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'"
              >
                <!-- Identificador del Set y Puntuación -->
                <div class="flex items-center gap-2.5">
                  <span class="px-2 py-0.5 rounded font-mono font-extrabold text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600 shadow-2xs">
                    Set {{ s.numero }}
                  </span>

                  <!-- Marcador numérico del set con nombres claros -->
                  <div class="flex items-center gap-2">
                    <!-- Tú / Centro -->
                    <div class="flex items-center gap-1">
                      <span class="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        {{ s.nombreYo }}:
                      </span>
                      <span 
                        class="text-sm font-black font-mono"
                        :class="s.ganador === 'yo' ? 'text-emerald-700 dark:text-emerald-400 underline decoration-2' : 'text-slate-700 dark:text-slate-300'"
                      >
                        {{ s.puntosYo }}
                      </span>
                    </div>

                    <span class="text-slate-300 dark:text-slate-600 text-xs">-</span>

                    <!-- Rival -->
                    <div class="flex items-center gap-1">
                      <span class="text-[11px] font-semibold text-slate-400 dark:text-slate-500">
                        {{ s.nombreRival }}:
                      </span>
                      <span 
                        class="text-sm font-black font-mono"
                        :class="s.ganador === 'rival' ? 'text-emerald-700 dark:text-emerald-400 underline decoration-2' : 'text-slate-700 dark:text-slate-300'"
                      >
                        {{ s.puntosRival }}
                      </span>
                    </div>

                    <span v-if="s.esWO" class="text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/50 px-1 py-0.5 rounded border border-amber-200 dark:border-amber-800">
                      W.O.
                    </span>
                  </div>
                </div>

                <!-- Ganador del Set -->
                <div>
                  <span
                    class="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold border"
                    :class="s.ganador === 'yo' 
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800' 
                      : s.ganador === 'rival' 
                        ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800' 
                        : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600'"
                  >
                    <CheckCircle2 v-if="s.ganador === 'yo'" class="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <Trophy v-else-if="s.ganador === 'rival'" class="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
                    {{ s.textoGanador }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          @click="close"
        >
          Cerrar
        </Button>

        <Button
          variant="primary"
          size="sm"
          class="gap-1.5"
          @click="handleVerRival"
        >
          <Eye class="w-4 h-4" />
          <span>Ver</span>
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Clock, AlertTriangle, Eye, KeyRound, Calendar, Hourglass, Trophy, CheckCircle2, ListOrdered } from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import type { BurbujaRival, JugadorTorneo } from '@/types'
import { sonMismoJugador } from '@/services/torneoAlgoritmos'

const props = defineProps<{
  burbuja: BurbujaRival | null
  esVistaRival?: boolean
  jugadorCentro?: JugadorTorneo | null
}>()

const emit = defineEmits<{
  (e: 'ver-rival', rival: JugadorTorneo): void
}>()

const modalRef = ref<InstanceType<typeof Modal> | null>(null)

const open = () => {
  modalRef.value?.open()
}

const close = () => {
  modalRef.value?.close()
}

const colorBurbuja = computed(() => {
  if (!props.burbuja) return '#1e293b'
  if (props.burbuja.resultadoParaCentro === 'ganado') return '#10b981'
  if (props.burbuja.resultadoParaCentro === 'perdido') return '#ef4444'
  if (props.burbuja.esRivalDeTurno && props.burbuja.partido.estado !== 'jugado') return '#0284c7'
  return '#1e293b'
})

const textoEstadoEnfrentamiento = computed(() => {
  if (!props.burbuja) return ''
  if (props.burbuja.partido.estado === 'jugado') {
    if (props.burbuja.resultadoParaCentro === 'ganado') {
      return props.esVistaRival ? 'Partido Ganado por Centro' : '¡Victoria! Ganaste este partido'
    }
    if (props.burbuja.resultadoParaCentro === 'perdido') {
      const nomRival = props.burbuja.jugador.nombre.trim().split(' ')[0]
      return props.esVistaRival ? `Victoria de ${nomRival}` : `Derrota (Ganó ${nomRival})`
    }
    return 'Partido Finalizado'
  }
  if (props.burbuja.esRivalDeTurno) return 'Rival de Turno (A las 12)'
  return 'Partido Pendiente'
})

const badgeEstadoClase = computed(() => {
  if (!props.burbuja) return 'bg-slate-100 text-slate-700'
  if (props.burbuja.partido.estado === 'jugado') {
    if (props.burbuja.resultadoParaCentro === 'ganado') {
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
    }
    if (props.burbuja.resultadoParaCentro === 'perdido') {
      return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
    }
    return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  }
  if (props.burbuja.esRivalDeTurno) return 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
})

const textoFechaLimite = computed(() => {
  if (!props.burbuja) return ''
  if (props.burbuja.partido.esWalkover) return 'Finalizado por W (11-6, 11-6)'
  if (props.burbuja.partido.estado === 'jugado') return 'Partido finalizado'
  if (props.burbuja.rivalTienePartidosPendientes) return 'En espera (rival con partidos previos)'
  if (props.burbuja.partido.horasRestantes !== undefined && props.burbuja.partido.horasRestantes > 0 && props.burbuja.partido.horasRestantes <= 24) {
    return `${props.burbuja.partido.horasRestantes}h restantes`
  }
  if (props.burbuja.diasRestantes >= 2) return '2 días'
  if (props.burbuja.diasRestantes === 1) return '1 día'
  return 'Plazo 48h vencido (W.O.)'
})

const estiloFechaLimite = computed(() => {
  if (!props.burbuja) return 'bg-slate-100 text-slate-700'
  if (props.burbuja.partido.esWalkover || props.burbuja.partido.estado === 'jugado') {
    return 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
  }
  if (props.burbuja.rivalTienePartidosPendientes) {
    return 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  }
  if (props.burbuja.diasRestantes >= 2) return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  if (props.burbuja.diasRestantes === 1) return 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
  return 'bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
})

interface DetalleSetVisual {
  numero: number
  puntosYo: number
  puntosRival: number
  nombreYo: string
  nombreRival: string
  ganador: 'yo' | 'rival' | 'empate'
  textoGanador: string
  esWO?: boolean
  mallasYo?: number
  mallasRival?: number
}

const listaSets = computed<DetalleSetVisual[]>(() => {
  if (!props.burbuja || !props.burbuja.partido) return []
  const partido = props.burbuja.partido
  const rival = props.burbuja.jugador
  if (partido.estado !== 'jugado' && !partido.marcador) return []

  const rivalEsJ1 = sonMismoJugador(partido.jugador1Id, rival.id)
  
  const nombreYo = props.esVistaRival 
    ? (props.jugadorCentro?.nombre?.trim().split(' ')[0] || (rivalEsJ1 ? partido.jugador2?.nombre?.trim().split(' ')[0] : partido.jugador1?.nombre?.trim().split(' ')[0]) || 'Centro')
    : 'Tú'
  const nombreRival = rival.nombre.trim().split(' ')[0] || rival.nombre

  // Caso 1: partido.sets estructurados
  if (Array.isArray(partido.sets) && partido.sets.length > 0) {
    return partido.sets.map((s, idx) => {
      const pRival = Number(rivalEsJ1 ? s.puntosJugador1 : s.puntosJugador2) || 0
      const pYo = Number(rivalEsJ1 ? s.puntosJugador2 : s.puntosJugador1) || 0
      const mRival = Number(rivalEsJ1 ? s.mallasJugador1 : s.mallasJugador2) || 0
      const mYo = Number(rivalEsJ1 ? s.mallasJugador2 : s.mallasJugador1) || 0

      let ganador: 'yo' | 'rival' | 'empate' = 'empate'
      if (s.ganadorId) {
        ganador = sonMismoJugador(s.ganadorId, rival.id) ? 'rival' : 'yo'
      } else if (pYo > pRival) {
        ganador = 'yo'
      } else if (pRival > pYo) {
        ganador = 'rival'
      }

      const textoGanador = ganador === 'yo' 
        ? (props.esVistaRival ? `Ganó ${nombreYo}` : 'Ganaste tú')
        : ganador === 'rival' 
          ? `Ganó ${nombreRival}` 
          : 'Empate'

      return {
        numero: s.setNumero || idx + 1,
        puntosYo: pYo,
        puntosRival: pRival,
        nombreYo,
        nombreRival,
        ganador,
        textoGanador,
        esWO: partido.esWalkover,
        mallasYo: mYo,
        mallasRival: mRival,
      }
    })
  }

  // Caso 2: partido.marcadorDetallado (ej: "11-8, 9-11, 11-7" o "11-6, 11-6")
  if (partido.marcadorDetallado && partido.marcadorDetallado.includes('-')) {
    const rawSets = partido.marcadorDetallado.split(',').map(item => item.trim()).filter(Boolean)
    if (rawSets.length > 0) {
      return rawSets.map((setItem, idx) => {
        const partes = setItem.split('-').map(p => parseInt(p.trim(), 10))
        const p1 = isNaN(partes[0] ?? NaN) ? 0 : (partes[0] ?? 0)
        const p2 = isNaN(partes[1] ?? NaN) ? 0 : (partes[1] ?? 0)

        const pRival = rivalEsJ1 ? p1 : p2
        const pYo = rivalEsJ1 ? p2 : p1

        let ganador: 'yo' | 'rival' | 'empate' = 'empate'
        if (pYo > pRival) {
          ganador = 'yo'
        } else if (pRival > pYo) {
          ganador = 'rival'
        }

        const textoGanador = ganador === 'yo' 
          ? (props.esVistaRival ? `Ganó ${nombreYo}` : 'Ganaste tú')
          : ganador === 'rival' 
            ? `Ganó ${nombreRival}` 
            : 'Empate'

        return {
          numero: idx + 1,
          puntosYo: pYo,
          puntosRival: pRival,
          nombreYo,
          nombreRival,
          ganador,
          textoGanador,
          esWO: partido.esWalkover,
        }
      })
    }
  }

  // Caso 3: Es Walkover sin sets detallados
  if (partido.esWalkover) {
    const ganoYo = props.burbuja.resultadoParaCentro === 'ganado'
    return [1, 2].map((num) => ({
      numero: num,
      puntosYo: ganoYo ? 11 : 6,
      puntosRival: ganoYo ? 6 : 11,
      nombreYo,
      nombreRival,
      ganador: ganoYo ? 'yo' : 'rival',
      textoGanador: ganoYo ? (props.esVistaRival ? `Ganó ${nombreYo}` : 'Ganaste tú') : `Ganó ${nombreRival}`,
      esWO: true,
    }))
  }

  return []
})

const resumenSets = computed(() => {
  if (!props.burbuja) return null
  const sets = listaSets.value
  const rival = props.burbuja.jugador
  const partido = props.burbuja.partido
  const rivalEsJ1 = sonMismoJugador(partido.jugador1Id, rival.id)
  const nombreYo = props.esVistaRival 
    ? (props.jugadorCentro?.nombre?.trim().split(' ')[0] || (rivalEsJ1 ? partido.jugador2?.nombre?.trim().split(' ')[0] : partido.jugador1?.nombre?.trim().split(' ')[0]) || 'Centro')
    : 'Tú'
  const nombreRival = rival.nombre.trim().split(' ')[0] || rival.nombre
  const ganoYo = props.burbuja.resultadoParaCentro === 'ganado'

  if (sets.length > 0) {
    const setsYo = sets.filter(s => s.ganador === 'yo').length
    const setsRival = sets.filter(s => s.ganador === 'rival').length
    return {
      setsYo,
      setsRival,
      nombreYo,
      nombreRival,
      ganoYo,
      textoResultado: ganoYo 
        ? (props.esVistaRival ? `Victoria: ${nombreYo}` : '¡Victoria! Ganaste el partido')
        : (props.esVistaRival ? `Victoria: ${nombreRival}` : `Ganó ${nombreRival}`),
    }
  }

  // Fallback si no hay sets pero sí partido.marcador (ej: "0 - 2" o "2 - 1")
  if (partido.marcador) {
    const match = partido.marcador.match(/(\d+)\s*-\s*(\d+)/)
    if (match) {
      const s1 = parseInt(match[1] || '0', 10)
      const s2 = parseInt(match[2] || '0', 10)
      const setsRival = rivalEsJ1 ? s1 : s2
      const setsYo = rivalEsJ1 ? s2 : s1
      return {
        setsYo,
        setsRival,
        nombreYo,
        nombreRival,
        ganoYo,
        textoResultado: ganoYo 
          ? (props.esVistaRival ? `Victoria: ${nombreYo}` : '¡Victoria! Ganaste el partido')
          : (props.esVistaRival ? `Victoria: ${nombreRival}` : `Ganó ${nombreRival}`),
      }
    }
  }

  return null
})

const handleVerRival = () => {
  if (props.burbuja) {
    emit('ver-rival', props.burbuja.jugador)
    close()
  }
}

defineExpose({
  open,
  close,
})
</script>

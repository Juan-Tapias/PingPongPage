<template>
  <Modal
    ref="modalRef"
    title="Resultado del Partido"
    sub-title="Información pública del enfrentamiento"
    max-width="md"
    :footer="false"
  >
    <div v-if="burbuja" class="flex flex-col items-center text-center gap-4 py-2">
      <div
        class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md"
        :class="burbuja.resultadoParaCentro === 'ganado' ? 'bg-emerald-600' : 'bg-rose-600'"
      >
        <Trophy v-if="burbuja.resultadoParaCentro === 'ganado'" class="w-6 h-6" />
        <XCircle v-else class="w-6 h-6" />
      </div>

      <div class="space-y-1">
        <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ganador</span>
        <h3 class="text-lg font-black text-slate-900 dark:text-white">
          {{ burbuja.ganadorNombre || burbuja.jugador.nombre }}
        </h3>
      </div>

      <!-- Tarjeta Resumen Marcador -->
      <div class="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/60 rounded-xl p-4 flex flex-col items-center justify-center gap-2">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Marcador Final</span>
        
        <!-- Comparativo de Sets Ganados -->
        <div class="w-full grid grid-cols-2 gap-2 text-center mt-1">
          <div
            class="p-2 rounded-lg border flex flex-col items-center justify-center"
            :class="resumenSets?.ganoYo 
              ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700' 
              : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'"
          >
            <div class="flex items-center gap-1">
              <span class="text-xs font-bold truncate max-w-[120px]" :class="resumenSets?.ganoYo ? 'text-emerald-900 dark:text-emerald-200 font-extrabold' : 'text-slate-700 dark:text-slate-300'">
                {{ resumenSets?.nombreYo || 'Jugador' }}
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

          <div
            class="p-2 rounded-lg border flex flex-col items-center justify-center"
            :class="!resumenSets?.ganoYo 
              ? 'bg-emerald-50/80 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-700' 
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

        <div v-if="burbuja.partido.esWalkover" class="w-full text-[11px] font-medium text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2 rounded-lg border border-amber-200 dark:border-amber-800/60 flex items-center justify-center gap-1.5 mt-1">
          <AlertTriangle class="w-3.5 h-3.5 text-amber-600 shrink-0" />
          <span>Resuelto por inasistencia / W.O. (11-6, 11-6)</span>
        </div>
      </div>

      <!-- Desglose Cronológico de Sets -->
      <div v-if="listaSets.length > 0" class="w-full flex flex-col gap-2 text-left">
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
            class="flex items-center justify-between p-2.5 rounded-lg border transition-colors text-xs"
            :class="s.ganador === 'yo' 
              ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800/60' 
              : s.ganador === 'rival' 
                ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700/60'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700'"
          >
            <div class="flex items-center gap-2.5">
              <span class="px-2 py-0.5 rounded font-mono font-extrabold text-[11px] bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
                Set {{ s.numero }}
              </span>

              <div class="flex items-center gap-2">
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

      <div class="w-full pt-2">
        <Button
          variant="outline"
          size="sm"
          class="w-full"
          @click="close"
        >
          Cerrar
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Trophy, XCircle, CheckCircle2, ListOrdered, AlertTriangle } from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import type { BurbujaRival, JugadorTorneo } from '@/types'
import { sonMismoJugador } from '@/services/torneoAlgoritmos'

const props = defineProps<{
  burbuja: BurbujaRival | null
  jugadorCentro?: JugadorTorneo | null
}>()

const modalRef = ref<InstanceType<typeof Modal> | null>(null)

const open = () => {
  modalRef.value?.open()
}

const close = () => {
  modalRef.value?.close()
}

interface DetalleSetVisual {
  numero: number
  puntosYo: number
  puntosRival: number
  nombreYo: string
  nombreRival: string
  ganador: 'yo' | 'rival' | 'empate'
  textoGanador: string
  esWO?: boolean
}

const listaSets = computed<DetalleSetVisual[]>(() => {
  if (!props.burbuja || !props.burbuja.partido) return []
  const partido = props.burbuja.partido
  const rival = props.burbuja.jugador
  if (partido.estado !== 'jugado' && !partido.marcador) return []

  const rivalEsJ1 = sonMismoJugador(partido.jugador1Id, rival.id)
  const nombreYo = props.jugadorCentro?.nombre?.trim().split(' ')[0] || (rivalEsJ1 ? partido.jugador2?.nombre?.trim().split(' ')[0] : partido.jugador1?.nombre?.trim().split(' ')[0]) || 'Jugador'
  const nombreRival = rival.nombre.trim().split(' ')[0] || rival.nombre

  // Caso 1: sets estructurados
  if (Array.isArray(partido.sets) && partido.sets.length > 0) {
    return partido.sets.map((s, idx) => {
      const pRival = Number(rivalEsJ1 ? s.puntosJugador1 : s.puntosJugador2) || 0
      const pYo = Number(rivalEsJ1 ? s.puntosJugador2 : s.puntosJugador1) || 0

      let ganador: 'yo' | 'rival' | 'empate' = 'empate'
      if (s.ganadorId) {
        ganador = sonMismoJugador(s.ganadorId, rival.id) ? 'rival' : 'yo'
      } else if (pYo > pRival) {
        ganador = 'yo'
      } else if (pRival > pYo) {
        ganador = 'rival'
      }

      return {
        numero: s.setNumero || idx + 1,
        puntosYo: pYo,
        puntosRival: pRival,
        nombreYo,
        nombreRival,
        ganador,
        textoGanador: ganador === 'yo' ? `Ganó ${nombreYo}` : ganador === 'rival' ? `Ganó ${nombreRival}` : 'Empate',
        esWO: partido.esWalkover,
      }
    })
  }

  // Caso 2: marcadorDetallado
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

        return {
          numero: idx + 1,
          puntosYo: pYo,
          puntosRival: pRival,
          nombreYo,
          nombreRival,
          ganador,
          textoGanador: ganador === 'yo' ? `Ganó ${nombreYo}` : ganador === 'rival' ? `Ganó ${nombreRival}` : 'Empate',
          esWO: partido.esWalkover,
        }
      })
    }
  }

  // Caso 3: Walkover
  if (partido.esWalkover) {
    const ganoYo = props.burbuja.resultadoParaCentro === 'ganado'
    return [1, 2].map((num) => ({
      numero: num,
      puntosYo: ganoYo ? 11 : 6,
      puntosRival: ganoYo ? 6 : 11,
      nombreYo,
      nombreRival,
      ganador: ganoYo ? 'yo' : 'rival',
      textoGanador: ganoYo ? `Ganó ${nombreYo}` : `Ganó ${nombreRival}`,
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
  const nombreYo = props.jugadorCentro?.nombre?.trim().split(' ')[0] || (rivalEsJ1 ? partido.jugador2?.nombre?.trim().split(' ')[0] : partido.jugador1?.nombre?.trim().split(' ')[0]) || 'Jugador'
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
    }
  }

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
      }
    }
  }

  return null
})

defineExpose({
  open,
  close,
})
</script>

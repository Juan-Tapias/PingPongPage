<template>
  <div v-if="rival" class="w-full bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-5 flex flex-col gap-3 transition-colors duration-300">
    <div class="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-slate-900 dark:bg-sky-600 text-white flex items-center justify-center font-black text-xs shadow-md shrink-0">
          {{ rival.jugador.iniciales }}
        </div>
        <div>
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
            {{ rival.esRivalDeTurno ? 'Rival de Turno (A las 12)' : 'Partido Pendiente' }}
          </span>
          <h4 class="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug mt-0.5">
            {{ rival.jugador.nombre }}
          </h4>
        </div>
      </div>
    </div>

    <div class="space-y-2 text-xs">
      <div class="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800">
        <span class="font-semibold text-slate-500 dark:text-slate-400">Teléfono:</span>
        <span class="font-bold font-mono text-slate-800 dark:text-slate-200 select-all">{{ rival.jugador.telefono }}</span>
      </div>

      <div class="flex items-center justify-between py-1">
        <span class="font-semibold text-slate-500 dark:text-slate-400">Plazo para jugar:</span>
        <span class="inline-flex items-center gap-1 font-extrabold text-amber-900 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-800">
          <Clock class="w-3 h-3 text-amber-700 dark:text-amber-400 shrink-0" />
          {{ rival.diasRestantes >= 2 ? '2 días' : rival.diasRestantes === 1 ? '1 día' : 'Partido perdido' }}
        </span>
      </div>

      <div v-if="rival.codigoSeguridadPropio" class="flex items-center justify-between py-1 border-t border-slate-100 dark:border-slate-800">
        <div class="flex items-center gap-1.5">
          <KeyRound class="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
          <span class="font-semibold text-slate-500 dark:text-slate-400">Tu PIN para árbitro:</span>
        </div>
        <span class="font-black font-mono tracking-widest text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-md border border-sky-200 dark:border-sky-800 select-all">
          {{ rival.codigoSeguridadPropio }}
        </span>
      </div>
    </div>

    <div class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 flex flex-col gap-1.5">
      <div class="flex items-center justify-between text-xs">
        <span class="font-bold text-slate-700 dark:text-slate-300">Probabilidad para ganarle</span>
        <span class="font-black font-mono text-emerald-700 dark:text-emerald-400">{{ probabilidadGanancia }}%</span>
      </div>

      <div class="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
        <div
          class="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
          :style="{ width: `${probabilidadGanancia}%` }"
        />
      </div>

      <span class="text-[10px] text-slate-400 dark:text-slate-400 font-medium">
        {{ leyendaProbabilidad }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Clock, KeyRound } from 'lucide-vue-next'
import type { BurbujaRival, FilaPosicion, JugadorTorneo } from '@/types'

const props = defineProps<{
  rival: BurbujaRival | null | undefined
  tablaPosiciones?: FilaPosicion[]
  jugadorCentro?: JugadorTorneo
}>()

function sonMismoJugador(a?: string, b?: string): boolean {
  if (!a || !b) return false
  return a === b || a.endsWith(b) || b.endsWith(a)
}

const probabilidadCalculada = computed(() => {
  if (!props.rival) {
    return { porcentaje: 50, leyenda: 'Probabilidad neutral inicial (50% / 50%)' }
  }

  // Si el partido ya fue jugado directamente entre ambos:
  if (props.rival.estadoPartido === 'jugado' || props.rival.marcador) {
    if (props.rival.resultadoParaCentro === 'ganado') {
      return { porcentaje: 100, leyenda: '¡Victoria obtenida! Partido finalizado.' }
    } else if (props.rival.resultadoParaCentro === 'perdido') {
      return { porcentaje: 0, leyenda: 'Partido finalizado: Derrota registrada.' }
    }
  }

  // Si la partida está PENDIENTE:
  if (props.tablaPosiciones && props.tablaPosiciones.length > 0) {
    const statsCentro = props.tablaPosiciones.find((f) => sonMismoJugador(f.jugadorId, props.jugadorCentro?.id))
    const statsRival = props.tablaPosiciones.find((f) => sonMismoJugador(f.jugadorId, props.rival?.jugador.id))

    const pjCentro = statsCentro?.pj || 0
    const pgCentro = statsCentro?.pg || 0
    const pjRival = statsRival?.pj || 0
    const pgRival = statsRival?.pg || 0

    // Si ninguno ha jugado partidos aún en el torneo:
    if (pjCentro === 0 && pjRival === 0) {
      return { porcentaje: 50, leyenda: 'Probabilidad neutral inicial (Sin partidos jugados: 50% / 50%)' }
    }

    const effCentro = pjCentro > 0 ? pgCentro / pjCentro : 0.5
    const effRival = pjRival > 0 ? pgRival / pjRival : 0.5

    const diff = effCentro - effRival
    const calc = Math.round(50 + diff * 40)
    const porcentajePonderado = Math.max(10, Math.min(90, calc))

    return {
      porcentaje: porcentajePonderado,
      leyenda: `Calculado por rendimiento: ${pgCentro}/${pjCentro} victorias vs ${pgRival}/${pjRival} rival.`,
    }
  }

  return { porcentaje: 50, leyenda: 'Probabilidad neutral inicial (50% / 50%)' }
})

const probabilidadGanancia = computed(() => probabilidadCalculada.value.porcentaje)
const leyendaProbabilidad = computed(() => probabilidadCalculada.value.leyenda)
</script>

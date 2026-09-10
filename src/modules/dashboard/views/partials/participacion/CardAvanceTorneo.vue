<template>
  <div class="w-full bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-5 flex flex-col gap-4 transition-colors duration-300">
    <div class="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center font-bold">
          <Trophy class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-sm font-extrabold text-slate-900 dark:text-white font-heading">
            Avance del Torneo
          </h3>
          <p class="text-[11px] text-slate-400 dark:text-slate-500">
            Seguimiento de rondas y progreso general
          </p>
        </div>
      </div>

      <span class="text-xs font-black text-emerald-700 dark:text-emerald-300 font-mono bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200/60 dark:border-emerald-800">
        {{ porcentajeAvance }}%
      </span>
    </div>

    <div class="space-y-1.5">
      <div class="flex justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
        <span>Partidos Jugados</span>
        <span class="font-mono text-slate-900 dark:text-white">{{ partidosJugados }} de {{ totalPartidos }}</span>
      </div>
      <div class="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
        <div
          class="h-full bg-emerald-600 rounded-full transition-all duration-500 ease-out"
          :style="{ width: `${porcentajeAvance}%` }"
        />
      </div>
    </div>

    <div class="grid grid-cols-3 gap-2 pt-1">
      <div class="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
        <span class="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Victorias</span>
        <span class="text-base font-black text-emerald-700 dark:text-emerald-400 font-mono">{{ victorias }}</span>
      </div>

      <div class="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
        <span class="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Derrotas</span>
        <span class="text-base font-black text-rose-600 dark:text-rose-400 font-mono">{{ derrotas }}</span>
      </div>

      <div class="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/60">
        <span class="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase tracking-wider">Pendientes</span>
        <span class="text-base font-black text-slate-700 dark:text-slate-200 font-mono">{{ pendientes }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Trophy } from 'lucide-vue-next'
import type { Torneo, PartidoGrupo, JugadorTorneo } from '@/types'

const props = defineProps<{
  torneo: Torneo
  partidos: PartidoGrupo[]
  jugadorCentro?: JugadorTorneo
}>()

function sonMismoJugador(a?: string, b?: string): boolean {
  if (!a || !b) return false
  return a === b || a.endsWith(b) || b.endsWith(a)
}

const targetId = computed(() => props.jugadorCentro?.id || 'jugador-sesion')

const partidosUsuario = computed(() => {
  return props.partidos.filter((p) => {
    return sonMismoJugador(p.jugador1Id, targetId.value) || sonMismoJugador(p.jugador2Id, targetId.value)
  })
})

const totalPartidos = computed(() => partidosUsuario.value.length)

const partidosJugados = computed(() => {
  return partidosUsuario.value.filter((p) => p.estado === 'jugado' || !!p.marcador).length
})

const porcentajeAvance = computed(() => {
  if (totalPartidos.value === 0) return 0
  return Math.round((partidosJugados.value / totalPartidos.value) * 100)
})

const victorias = computed(() => {
  return partidosUsuario.value.filter((p) => sonMismoJugador(p.jugadorGanadorId, targetId.value)).length
})

const derrotas = computed(() => {
  return partidosUsuario.value.filter(
    (p) => (p.estado === 'jugado' || !!p.marcador) && p.jugadorGanadorId && !sonMismoJugador(p.jugadorGanadorId, targetId.value),
  ).length
})

const pendientes = computed(() => {
  return partidosUsuario.value.filter((p) => p.estado !== 'jugado' && !p.marcador).length
})
</script>

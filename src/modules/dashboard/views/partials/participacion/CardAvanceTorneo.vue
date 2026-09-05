<template>
  <div class="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 flex flex-col gap-4">
    <div class="flex items-center justify-between pb-3 border-b border-slate-100">
      <div class="flex items-center gap-2">
        <div class="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold">
          <Trophy class="w-4 h-4" />
        </div>
        <div>
          <h3 class="text-sm font-extrabold text-slate-900 font-heading">
            Avance del Torneo
          </h3>
          <p class="text-[11px] text-slate-400">
            Seguimiento de rondas y progreso general
          </p>
        </div>
      </div>

      <span class="text-xs font-black text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
        {{ porcentajeAvance }}%
      </span>
    </div>

    <div class="space-y-1.5">
      <div class="flex justify-between text-xs font-bold text-slate-700">
        <span>Partidos Jugados</span>
        <span class="font-mono text-slate-900">{{ partidosJugados }} de {{ totalPartidos }}</span>
      </div>
      <div class="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
        <div
          class="h-full bg-emerald-600 rounded-full transition-all duration-500 ease-out"
          :style="{ width: `${porcentajeAvance}%` }"
        />
      </div>
    </div>

    <div class="grid grid-cols-3 gap-2 pt-1">
      <div class="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Victorias</span>
        <span class="text-base font-black text-emerald-700 font-mono">{{ victorias }}</span>
      </div>

      <div class="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Derrotas</span>
        <span class="text-base font-black text-rose-600 font-mono">{{ derrotas }}</span>
      </div>

      <div class="flex flex-col items-center p-2.5 rounded-xl bg-slate-50 border border-slate-100">
        <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Pendientes</span>
        <span class="text-base font-black text-slate-700 font-mono">{{ pendientes }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Trophy } from 'lucide-vue-next'
import type { Torneo, PartidoGrupo } from '@/types'

const props = defineProps<{
  torneo: Torneo
  partidos: PartidoGrupo[]
}>()

const partidosUsuario = computed(() => {
  return props.partidos.filter((p) => p.jugador1Id === 'j-yo' || p.jugador2Id === 'j-yo')
})

const totalPartidos = computed(() => partidosUsuario.value.length)

const partidosJugados = computed(() => {
  return partidosUsuario.value.filter((p) => p.estado === 'jugado').length
})

const porcentajeAvance = computed(() => {
  if (totalPartidos.value === 0) return 0
  return Math.round((partidosJugados.value / totalPartidos.value) * 100)
})

const victorias = computed(() => {
  return partidosUsuario.value.filter((p) => p.jugadorGanadorId === 'j-yo').length
})

const derrotas = computed(() => {
  return partidosUsuario.value.filter(
    (p) => p.estado === 'jugado' && p.jugadorGanadorId && p.jugadorGanadorId !== 'j-yo',
  ).length
})

const pendientes = computed(() => {
  return partidosUsuario.value.filter((p) => p.estado === 'pendiente').length
})
</script>

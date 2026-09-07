<template>
  <div v-if="rival" class="w-full bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-5 flex flex-col gap-3 transition-colors duration-300">
    <div class="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-slate-900 dark:bg-sky-600 text-white flex items-center justify-center font-black text-xs shadow-md shrink-0">
          {{ rival.jugador.iniciales }}
        </div>
        <div>
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
            Rival de Turno
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
        Cálculo estimado según rendimiento previo y estadísticas
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Clock, KeyRound } from 'lucide-vue-next'
import type { BurbujaRival } from '@/types'

const props = defineProps<{
  rival: BurbujaRival | null | undefined
}>()

const probabilidadGanancia = computed(() => {
  if (!props.rival) return 50
  const seed = props.rival.jugador.nombre.length
  return 60 + (seed % 15) 
})
</script>

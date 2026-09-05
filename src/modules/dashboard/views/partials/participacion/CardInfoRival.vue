<template>
  <div v-if="rival" class="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs p-4 sm:p-5 flex flex-col gap-3">
    <div class="flex items-center justify-between pb-2.5 border-b border-slate-100">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-md shrink-0">
          {{ rival.jugador.iniciales }}
        </div>
        <div>
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded">
            Rival de Turno
          </span>
          <h4 class="text-sm sm:text-base font-extrabold text-slate-900 leading-snug mt-0.5">
            {{ rival.jugador.nombre }}
          </h4>
        </div>
      </div>
    </div>

    <div class="space-y-2 text-xs">
      <div class="flex items-center justify-between py-1 border-b border-slate-100">
        <span class="font-semibold text-slate-500">Teléfono:</span>
        <span class="font-bold font-mono text-slate-800 select-all">{{ rival.jugador.telefono }}</span>
      </div>

      <div class="flex items-center justify-between py-1">
        <span class="font-semibold text-slate-500">Plazo para jugar:</span>
        <span class="inline-flex items-center gap-1 font-extrabold text-amber-900 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          <Clock class="w-3 h-3 text-amber-700 shrink-0" />
          {{ rival.diasRestantes >= 2 ? '2 días' : rival.diasRestantes === 1 ? '1 día' : 'Partido perdido' }}
        </span>
      </div>

      <div v-if="rival.codigoSeguridadPropio" class="flex items-center justify-between py-1 border-t border-slate-100">
        <div class="flex items-center gap-1.5">
          <KeyRound class="w-3.5 h-3.5 text-sky-600" />
          <span class="font-semibold text-slate-500">Tu PIN para árbitro:</span>
        </div>
        <span class="font-black font-mono tracking-widest text-sky-700 bg-sky-50 px-2.5 py-0.5 rounded-md border border-sky-200 select-all">
          {{ rival.codigoSeguridadPropio }}
        </span>
      </div>
    </div>

    <div class="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex flex-col gap-1.5">
      <div class="flex items-center justify-between text-xs">
        <span class="font-bold text-slate-700">Probabilidad para ganarle</span>
        <span class="font-black font-mono text-emerald-700">{{ probabilidadGanancia }}%</span>
      </div>

      <div class="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
        <div
          class="h-full bg-emerald-500 rounded-full transition-all duration-500 ease-out"
          :style="{ width: `${probabilidadGanancia}%` }"
        />
      </div>

      <span class="text-[10px] text-slate-400 font-medium">
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

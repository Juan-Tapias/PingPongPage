<template>
  <!-- ============================================================ -->
  <!-- BARRA UNIFICADA DE RENDIMIENTO DEPORTIVO (OPCIÓN B)          -->
  <!-- ============================================================ -->
  <div class="w-full rounded-2xl sm:rounded-3xl bg-white/90 dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 shadow-sm dark:shadow-xl p-3.5 sm:p-5 backdrop-blur-md transition-all duration-300">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-0 sm:divide-x divide-slate-200/80 dark:divide-slate-800/80">
      <!-- Métrica 1: Torneos Jugados & En Curso -->
      <div class="flex items-center gap-3 sm:px-4 py-1">
        <div class="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 border border-blue-500/20 flex items-center justify-center shrink-0 shadow-2xs">
          <Trophy class="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div class="min-w-0">
          <div class="flex items-baseline gap-1.5 flex-wrap">
            <span class="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white leading-none">
              {{ torneosJugados }}
            </span>
            <span
              v-if="torneosEnCurso > 0"
              class="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-md"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              +{{ torneosEnCurso }} en curso
            </span>
          </div>
          <span class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate block mt-0.5">
            Torneos disputados
          </span>
        </div>
      </div>

      <!-- Métrica 2: Efectividad de Sets -->
      <div class="flex items-center gap-3 sm:px-4 py-1">
        <div class="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center shrink-0 shadow-2xs">
          <Activity class="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div class="min-w-0">
          <div class="flex items-baseline gap-1.5 flex-wrap">
            <span class="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white leading-none">
              {{ efectividad }}%
            </span>
            <span class="text-[10px] font-semibold text-slate-400">
              {{ efectividad > 0 ? `${setsGanados}W - ${setsPerdidos}L` : 'Temporada 2026' }}
            </span>
          </div>
          <span class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate block mt-0.5">
            Efectividad de Sets
          </span>
        </div>
      </div>

      <!-- Métrica 3: Podios y Reconocimientos -->
      <div class="flex items-center gap-3 sm:px-4 py-1">
        <div class="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center shrink-0 shadow-2xs">
          <Award class="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div class="min-w-0">
          <div class="flex items-baseline gap-1.5 flex-wrap">
            <span class="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white leading-none">
              {{ podios }}
            </span>
            <span v-if="podios > 0" class="text-[11px] font-bold text-amber-500">
              🥇 🥈 🥉
            </span>
            <span v-else class="text-[10px] font-semibold text-slate-400">
              A por el 1er podio 🏆
            </span>
          </div>
          <span class="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium truncate block mt-0.5">
            Podios Oficiales
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trophy, Activity, Award } from 'lucide-vue-next'

interface Props {
  torneosJugados?: number
  torneosEnCurso?: number
  efectividad?: number
  setsGanados?: number
  setsPerdidos?: number
  podios?: number
}

withDefaults(defineProps<Props>(), {
  torneosJugados: 0,
  torneosEnCurso: 0,
  efectividad: 0,
  setsGanados: 0,
  setsPerdidos: 0,
  podios: 0,
})
</script>

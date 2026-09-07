<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5 transition-colors duration-300">
      <div class="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center shrink-0">
        <Trophy class="w-5 h-5" />
      </div>
      <div>
        <span class="text-xl font-extrabold font-heading text-slate-900 dark:text-white block leading-tight">14</span>
        <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Torneos jugados</span>
      </div>
    </div>

    <div class="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5 transition-colors duration-300">
      <div class="w-11 h-11 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
        <Activity class="w-5 h-5" />
      </div>
      <div>
        <span class="text-xl font-extrabold font-heading text-slate-900 dark:text-white block leading-tight">78%</span>
        <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Efectividad de Sets</span>
      </div>
    </div>

    <div class="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5 transition-colors duration-300">
      <div class="w-11 h-11 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
        <TrendingUp class="w-5 h-5" />
      </div>
      <div>
        <span class="text-xl font-extrabold font-heading text-slate-900 dark:text-white block leading-tight">1,420</span>
        <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Puntos de Ranking</span>
      </div>
    </div>

    <div class="p-4 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-3.5 transition-colors duration-300">
      <div class="w-11 h-11 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center shrink-0">
        <Award class="w-5 h-5" />
      </div>
      <div>
        <span class="text-xl font-extrabold font-heading text-slate-900 dark:text-white block leading-tight">5</span>
        <span class="text-xs text-slate-500 dark:text-slate-400 font-medium">Podios Oficiales</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trophy, Activity, TrendingUp, Award } from 'lucide-vue-next'
</script>

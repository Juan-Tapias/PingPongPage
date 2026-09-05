<template>
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
    <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
      <div class="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
        <Trophy class="w-5 h-5" />
      </div>
      <div>
        <span class="text-xl font-extrabold font-heading text-slate-900 block leading-tight">14</span>
        <span class="text-xs text-slate-500 font-medium">Torneos jugados</span>
      </div>
    </div>

    <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
      <div class="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
        <Activity class="w-5 h-5" />
      </div>
      <div>
        <span class="text-xl font-extrabold font-heading text-slate-900 block leading-tight">78%</span>
        <span class="text-xs text-slate-500 font-medium">Efectividad de Sets</span>
      </div>
    </div>

    <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
      <div class="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
        <TrendingUp class="w-5 h-5" />
      </div>
      <div>
        <span class="text-xl font-extrabold font-heading text-slate-900 block leading-tight">1,420</span>
        <span class="text-xs text-slate-500 font-medium">Puntos de Ranking</span>
      </div>
    </div>

    <div class="p-4 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center gap-3.5">
      <div class="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
        <Award class="w-5 h-5" />
      </div>
      <div>
        <span class="text-xl font-extrabold font-heading text-slate-900 block leading-tight">5</span>
        <span class="text-xs text-slate-500 font-medium">Podios Oficiales</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trophy, Activity, TrendingUp, Award } from 'lucide-vue-next'
</script>

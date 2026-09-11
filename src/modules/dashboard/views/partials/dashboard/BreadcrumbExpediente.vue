<template>
  <div class="w-full bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between text-xs">
      <div class="flex items-center gap-1.5 text-slate-400">
        <Trophy class="w-3.5 h-3.5 text-orange-500" />
        <span class="text-slate-600 dark:text-slate-400 font-bold">SpinApp Ping Pong Challenge</span>
        <span>&gt;</span>
        <span class="text-slate-600 dark:text-slate-400 font-medium">Jugadores</span>
        <span>&gt;</span>
        <strong class="text-slate-800 dark:text-slate-200 font-semibold">Mi Expediente Deportivo</strong>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'
</script>

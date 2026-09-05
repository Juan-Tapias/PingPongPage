<template>
  <div class="w-full bg-white border-b border-slate-200/60">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between text-xs">
      <div class="flex items-center gap-1.5 text-slate-400">
        <Trophy class="w-3.5 h-3.5 text-slate-400" />
        <span class="text-slate-600 font-medium">SpinApp</span>
        <span>&gt;</span>
        <span class="text-slate-600 font-medium">Jugadores</span>
        <span>&gt;</span>
        <strong class="text-slate-800 font-semibold">Mi Expediente Deportivo</strong>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trophy } from 'lucide-vue-next'
</script>

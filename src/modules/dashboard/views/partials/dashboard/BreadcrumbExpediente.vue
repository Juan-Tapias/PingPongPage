<template>
  <div class="w-full bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 py-2 flex items-center justify-between text-xs gap-2">
      <div class="flex items-center gap-1.5 text-slate-400 min-w-0 flex-wrap">
        <Trophy class="w-3.5 h-3.5 text-orange-500 shrink-0" />
        <button
          v-if="torneoNombre"
          type="button"
          class="text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 font-bold cursor-pointer transition-colors"
          @click="$emit('volver')"
        >
          SpinApp Ping Pong
        </button>
        <span v-else class="text-slate-600 dark:text-slate-400 font-bold">SpinApp Ping Pong</span>

        <span>&gt;</span>

        <button
          v-if="torneoNombre"
          type="button"
          class="text-slate-600 dark:text-slate-400 hover:text-orange-500 dark:hover:text-orange-400 font-medium cursor-pointer transition-colors"
          @click="$emit('volver')"
        >
          Mis Torneos
        </button>
        <span v-else class="text-slate-600 dark:text-slate-400 font-medium">Jugadores</span>

        <span>&gt;</span>

        <strong class="text-slate-800 dark:text-slate-200 font-semibold truncate max-w-[150px] sm:max-w-none">
          {{ torneoNombre || 'Mi Expediente Deportivo' }}
        </strong>
      </div>

      <button
        v-if="torneoNombre"
        type="button"
        class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 hover:bg-orange-500/20 active:scale-95 transition-all cursor-pointer shrink-0"
        title="Volver a mis torneos"
        @click="$emit('volver')"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Volver</span>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Trophy, ArrowLeft } from 'lucide-vue-next'

defineProps<{
  torneoNombre?: string
}>()

defineEmits<{
  (e: 'volver'): void
}>()
</script>

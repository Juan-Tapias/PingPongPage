<template>
  <div class="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-xs space-y-3 transition-colors duration-300">
    <div class="relative w-full">
      <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
      <input
        :value="modelValue"
        type="text"
        placeholder="Buscar torneo por nombre o organizador..."
        class="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
      />
    </div>

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs">
      <div class="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium flex-wrap">
        <CheckCircle2 class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        <span>Mostrando</span>
        <span class="px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/80 font-bold">
          {{ totalEncontrados }} torneos
        </span>
        <span>con cupos disponibles</span>
      </div>

      <button
        type="button"
        class="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-semibold cursor-pointer self-start sm:self-auto text-xs underline sm:no-underline"
        @click="emit('restablecer')"
      >
        Restablecer filtros
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search, CheckCircle2 } from 'lucide-vue-next'

interface Props {
  modelValue: string
  totalEncontrados: number
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'restablecer'): void
}>()
</script>

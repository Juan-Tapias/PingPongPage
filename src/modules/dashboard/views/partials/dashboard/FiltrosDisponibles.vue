<template>
  <div class="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-xs space-y-3 transition-colors duration-300">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
      <div class="relative sm:col-span-2">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          :value="modelValue"
          type="text"
          placeholder="Buscar torneo por nombre, sede o categoría..."
          class="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <select
        :value="categoria"
        class="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none cursor-pointer"
        @change="emit('update:categoria', ($event.target as HTMLSelectElement).value)"
      >
        <option value="todas">Categoría: Todas</option>
        <option value="master">Categoría Máster</option>
        <option value="abierta">Todo Competidor</option>
      </select>
    </div>

    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
      <span class="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-medium">
        <CheckCircle2 class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
        Mostrando <strong class="text-slate-900 dark:text-white">{{ totalEncontrados }} torneos encontrados</strong> con cupos disponibles para tu ranking
      </span>

      <button
        type="button"
        class="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 font-semibold cursor-pointer self-start sm:self-auto"
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
  categoria: string
  totalEncontrados: number
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'update:categoria', val: string): void
  (e: 'restablecer'): void
}>()
</script>

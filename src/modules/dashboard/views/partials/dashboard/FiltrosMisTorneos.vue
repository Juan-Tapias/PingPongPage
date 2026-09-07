<template>
  <div class="bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 rounded-xl p-3 sm:p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3 transition-colors duration-300">
    <div class="flex flex-col sm:flex-row flex-1 items-stretch sm:items-center gap-2.5 sm:gap-3">
      <div class="relative flex-1">
        <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          :value="modelValue"
          type="text"
          placeholder="Buscar en mis torneos..."
          class="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
          @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)"
        />
      </div>

      <select
        :value="estado"
        class="text-xs border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none cursor-pointer shrink-0"
        @change="emit('update:estado', ($event.target as HTMLSelectElement).value)"
      >
        <option value="todos">Todos los estados</option>
        <option value="en verificacion">En verificación</option>
        <option value="en curso">En curso</option>
        <option value="por iniciar">Por iniciar</option>
        <option value="finalizado">Finalizado</option>
      </select>
    </div>

    <div class="flex flex-wrap items-center gap-2 sm:gap-3 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 font-medium pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
      <span>Estado:</span>
      <span class="flex items-center gap-1 text-slate-700 dark:text-slate-300">
        <span class="w-2 h-2 rounded-full bg-amber-500" /> {{ conteoEnVerificacion }} En verificación
      </span>
      <span class="flex items-center gap-1 text-slate-700 dark:text-slate-300">
        <span class="w-2 h-2 rounded-full bg-emerald-500" /> {{ conteoEnCurso }} En curso
      </span>
      <span class="flex items-center gap-1 text-slate-700 dark:text-slate-300">
        <span class="w-2 h-2 rounded-full bg-blue-500" /> {{ conteoPorIniciar }} Por iniciar
      </span>
      <span class="flex items-center gap-1 text-slate-700 dark:text-slate-300">
        <span class="w-2 h-2 rounded-full bg-slate-400" /> {{ conteoFinalizado }} Finalizado
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Search } from 'lucide-vue-next'

interface Props {
  modelValue: string
  estado: string
  conteoEnVerificacion?: number
  conteoEnCurso?: number
  conteoPorIniciar?: number
  conteoFinalizado?: number
}

withDefaults(defineProps<Props>(), {
  conteoEnVerificacion: 0,
  conteoEnCurso: 1,
  conteoPorIniciar: 1,
  conteoFinalizado: 1,
})

const emit = defineEmits<{
  (e: 'update:modelValue', val: string): void
  (e: 'update:estado', val: string): void
  (e: 'restablecer'): void
}>()
</script>

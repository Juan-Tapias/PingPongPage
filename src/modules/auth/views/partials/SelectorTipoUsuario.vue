<script setup lang="ts">
import type { TipoUsuario } from '@/types'
import { GraduationCap, Briefcase } from 'lucide-vue-next'

interface Props {
  modelValue: TipoUsuario | ''
  error?: string
}

defineProps<Props>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: TipoUsuario): void
}>()

const seleccionar = (tipo: TipoUsuario) => {
  emit('update:modelValue', tipo)
}
</script>

<template>
  <div class="w-full flex flex-col gap-2">
    <span class="text-xs font-semibold uppercase tracking-wider text-gray-400 font-heading">
      Tipo de Participante <span class="text-red-400">*</span>
    </span>

    <div class="grid grid-cols-2 gap-3">
      <button
        type="button"
        :class="[
          'flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none',
          modelValue === 'camper'
            ? 'bg-primary/10 border-primary text-primary ring-2 ring-primary/20 shadow-md shadow-green-950/20'
            : 'bg-surface border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200',
        ]"
        @click="seleccionar('camper')"
      >
        <GraduationCap class="w-6 h-6 mb-1" />
        <span class="text-sm font-semibold font-heading">Camper</span>
        <span class="text-[10px] text-gray-400 mt-0.5">Estudiante</span>
      </button>

      <button
        type="button"
        :class="[
          'flex flex-col items-center justify-center p-3 rounded-xl border transition-all duration-200 cursor-pointer select-none',
          modelValue === 'trabajador'
            ? 'bg-secondary/10 border-secondary text-secondary ring-2 ring-secondary/20 shadow-md shadow-blue-950/20'
            : 'bg-surface border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200',
        ]"
        @click="seleccionar('trabajador')"
      >
        <Briefcase class="w-6 h-6 mb-1" />
        <span class="text-sm font-semibold font-heading">Trabajador</span>
        <span class="text-[10px] text-gray-400 mt-0.5">Staff / Trainer</span>
      </button>
    </div>

    <span v-if="error" class="text-xs text-red-400 font-medium mt-0.5">
      {{ error }}
    </span>
  </div>
</template>

<template>
  <footer class="w-full bg-white dark:bg-[#0f172a] border-t border-slate-200 dark:border-slate-800 mt-auto py-5 text-xs text-slate-500 dark:text-slate-400 transition-colors duration-300">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
      <span>© 2025 SpinApp Torneo. Plataforma de Arbitraje y Gestión de Tenis de Mesa.</span>
      <div class="flex items-center gap-5 font-medium text-slate-600 dark:text-slate-400">
        <button
          type="button"
          class="hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-semibold underline decoration-orange-500/40 underline-offset-4"
          @click="abrirReglamento"
        >
          Reglamento Oficial ITTF
        </button>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { useReglamento } from '@/composables/useReglamento'

const { abrirReglamento } = useReglamento()
</script>

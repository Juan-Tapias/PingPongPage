<template>
  <div class="w-full rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4 transition-colors duration-300">
    <div class="space-y-1.5">
      <span class="text-[11px] font-extrabold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
        <FileText class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        REGLAMENTO Y NORMATIVA
      </span>
      <h2 class="text-lg sm:text-xl font-bold font-heading text-slate-900 dark:text-white">
        ¿Tienes dudas sobre las reglas oficiales y sistema de puntuación?
      </h2>
      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
        Consulta el reglamento unificado de la liga SpinApp, lineamientos de indumentaria, paletas autorizadas y tablas de asignación de rating ITTF.
      </p>
    </div>

    <Button variant="outline" size="md" class="border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 shrink-0 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700">
      <span>Ver Reglamento</span>
      <ExternalLink class="w-4 h-4 ml-1.5" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { FileText, ExternalLink } from 'lucide-vue-next'
import Button from '@/components/Button.vue'
</script>

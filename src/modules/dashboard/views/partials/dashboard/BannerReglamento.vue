<template>
  <div class="w-full rounded-2xl bg-white border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
    <div class="space-y-1.5">
      <span class="text-[11px] font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-1.5">
        <FileText class="w-3.5 h-3.5 text-emerald-600" />
        REGLAMENTO Y NORMATIVA
      </span>
      <h2 class="text-lg sm:text-xl font-bold font-heading text-slate-900">
        ¿Tienes dudas sobre las reglas oficiales y sistema de puntuación?
      </h2>
      <p class="text-xs sm:text-sm text-slate-600 max-w-2xl">
        Consulta el reglamento unificado de la liga SpinApp, lineamientos de indumentaria, paletas autorizadas y tablas de asignación de rating ITTF.
      </p>
    </div>

    <Button variant="outline" size="md" class="border-slate-300 text-slate-800 shrink-0 bg-white">
      <span>Ver Reglamento</span>
      <ExternalLink class="w-4 h-4 ml-1.5" />
    </Button>
  </div>
</template>

<script setup lang="ts">
import { FileText, ExternalLink } from 'lucide-vue-next'
import Button from '@/components/Button.vue'
</script>

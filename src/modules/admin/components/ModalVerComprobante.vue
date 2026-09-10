<template>
  <Modal
    ref="modalRef"
    width="md"
    :footer="false"
    :show-close="true"
    custom-class="w-full !max-w-[480px] 2xl:!max-w-[540px]"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center border border-blue-500/20 shrink-0">
          <Receipt class="w-4.5 h-4.5 sm:w-5 sm:h-5 text-blue-600" />
        </div>
        <div class="min-w-0">
          <h3 class="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white tracking-tight truncate">
            Comprobante de Pago
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
            Validación de transferencia para torneo
          </p>
        </div>
      </div>
    </template>

    <div v-if="solicitud" class="flex flex-col gap-3.5 sm:gap-4 pt-1 sm:pt-2">
      <!-- Tarjeta informativa del jugador y torneo -->
      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2">
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Jugador:</span>
          <span class="text-xs font-bold text-slate-900 dark:text-white">{{ solicitud.jugadorNombre }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Torneo:</span>
          <span class="text-xs font-bold text-slate-900 dark:text-white truncate max-w-45 sm:max-w-60">{{ solicitud.torneoNombre }}</span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Monto:</span>
          <span class="text-xs font-black text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
            ${{ solicitud.monto.toLocaleString('es-CO') }} COP
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Referencia:</span>
          <span class="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">{{ solicitud.referencia }}</span>
        </div>
      </div>

      <!-- Simulación gráfica del Comprobante -->
      <div class="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-100/70 dark:bg-slate-900/60 p-4 flex flex-col items-center justify-center min-h-40 sm:min-h-44 text-center overflow-hidden">
        <div class="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white dark:bg-slate-800 shadow-md flex items-center justify-center mb-2.5 border border-slate-200/80 dark:border-slate-700">
          <FileCheck2 class="w-7 h-7 sm:w-8 sm:h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
        <p class="text-xs font-bold text-slate-800 dark:text-slate-200">Comprobante Bancolombia / Nequi</p>
        <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Transferencia exitosa aprobada por entidad bancaria</p>
        <div class="mt-2.5 px-3 py-1 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 text-[10px] font-mono text-slate-600 dark:text-slate-300">
          ID: TRX-{{ solicitud.referencia }}
        </div>
      </div>

      <!-- Acciones de Decisión -->
      <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          class="flex items-center justify-center gap-1 px-3.5 py-2 text-xs font-bold text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-xl transition-colors cursor-pointer text-center"
          @click="handleRechazar"
        >
          <X class="w-3.5 h-3.5" />
          <span>Rechazar Pago</span>
        </button>
        <button
          type="button"
          class="flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors cursor-pointer text-center"
          @click="handleAprobar"
        >
          <Check class="w-3.5 h-3.5" />
          <span>Aprobar e Inscribir</span>
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Receipt, FileCheck2, Check, X } from 'lucide-vue-next'

const modalRef = ref()
const solicitud = ref<any>(null)

const emit = defineEmits<{
  (e: 'aprobar', id: string): void
  (e: 'rechazar', id: string): void
}>()

const open = (item: any) => {
  solicitud.value = item
  modalRef.value?.open()
}

const close = () => {
  modalRef.value?.close()
}

const handleAprobar = () => {
  if (solicitud.value) {
    emit('aprobar', solicitud.value.id)
  }
  close()
}

const handleRechazar = () => {
  if (solicitud.value) {
    emit('rechazar', solicitud.value.id)
  }
  close()
}

defineExpose({ open, close })
</script>

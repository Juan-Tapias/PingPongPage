<template>
  <Modal
    ref="modalRef"
    title="El administrador está verificando el pago"
    sub-title="Revisión de comprobante en proceso"
    action="Entendido"
    :btn-cancel="false"
    width="sm"
    @action="close"
  >
    <div v-if="torneo" class="space-y-4 text-center py-2">
      <div class="inline-flex w-14 h-14 min-w-14 min-h-14 max-w-14 max-h-14 rounded-2xl bg-amber-50 border border-amber-300 text-amber-700 items-center justify-center mx-auto shadow-xs shrink-0">
        <Clock class="w-7 h-7 animate-pulse text-amber-700" />
      </div>

      <div class="space-y-1">
        <h4 class="text-base font-bold text-slate-900 font-heading">
          {{ torneo.nombre }}
        </h4>
        <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
          Estado: Pendiente de verificación
        </span>
      </div>

      <p class="text-xs sm:text-sm text-slate-600 leading-relaxed px-2">
        El administrador está verificando el comprobante de pago de tu inscripción. Una vez sea validado satisfactoriamente, tu cupo quedará oficialmente registrado en estado <strong class="text-slate-800 font-semibold">Inscrito</strong>.
      </p>

      <div class="p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-left text-xs space-y-2 text-slate-600">
        <div class="flex items-center justify-between">
          <span class="text-slate-500">Valor de inscripción:</span>
          <strong class="text-slate-900 font-bold">{{ formatearMoneda(torneo.costoInscripcion) }} COP</strong>
        </div>
        <div class="flex items-center justify-between pt-1.5 border-t border-slate-200/70">
          <span class="text-slate-500">Línea de soporte WhatsApp:</span>
          <strong class="text-emerald-700 font-mono font-semibold">{{ torneo.whatsappContacto }}</strong>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Clock } from 'lucide-vue-next'
import type { Torneo } from '@/types'

interface Props {
  torneo: Torneo | null
}

const props = defineProps<Props>()

const modalRef = ref()

const formatearMoneda = (monto: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(monto)
}

const open = () => {
  modalRef.value?.open()
}

const close = () => {
  modalRef.value?.close()
}

defineExpose({
  open,
  close,
})
</script>

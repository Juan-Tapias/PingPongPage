<template>
  <Modal
    ref="modalRef"
    title="Resultado del Partido"
    sub-title="Información pública del enfrentamiento"
    max-width="sm"
    :footer="false"
  >
    <div v-if="burbuja" class="flex flex-col items-center text-center gap-4 py-2">
      <div
        class="w-12 h-12 rounded-full flex items-center justify-center font-bold text-white shadow-md"
        :class="burbuja.resultadoParaCentro === 'ganado' ? 'bg-emerald-600' : 'bg-rose-600'"
      >
        <Trophy v-if="burbuja.resultadoParaCentro === 'ganado'" class="w-6 h-6" />
        <XCircle v-else class="w-6 h-6" />
      </div>

      <div class="space-y-1">
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ganador</span>
        <h3 class="text-lg font-black text-slate-900">
          {{ burbuja.ganadorNombre || burbuja.jugador.nombre }}
        </h3>
      </div>

      <div class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-1">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Marcador Final</span>
        <span class="text-3xl font-black font-mono text-emerald-700 tracking-tight">
          {{ burbuja.marcador || '3 - 1' }}
        </span>
        <span v-if="burbuja.partido.marcadorDetallado" class="text-xs text-slate-500 font-mono mt-1">
          Sets: {{ burbuja.partido.marcadorDetallado }}
        </span>
      </div>

      <div class="w-full pt-2">
        <Button
          variant="outline"
          size="sm"
          class="w-full"
          @click="close"
        >
          Cerrar
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Trophy, XCircle } from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import type { BurbujaRival } from '@/types'

defineProps<{
  burbuja: BurbujaRival | null
}>()

const modalRef = ref<InstanceType<typeof Modal> | null>(null)

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

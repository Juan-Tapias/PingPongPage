<template>
  <Modal
    ref="modalRef"
    title="Detalle del Rival"
    sub-title="Información reglamentaria y estado del enfrentamiento"
    max-width="md"
    :footer="false"
  >
    <div v-if="burbuja" class="flex flex-col gap-5 py-1">
      <div class="flex items-center gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
        <div
          class="w-14 h-14 rounded-full flex items-center justify-center font-black text-lg text-white shadow-md select-none shrink-0"
          :style="{ backgroundColor: colorBurbuja }"
        >
          {{ burbuja.jugador.iniciales }}
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-base font-extrabold text-slate-900 truncate">
            {{ burbuja.jugador.nombre }}
          </h4>
          <span
            class="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold mt-1"
            :class="badgeEstadoClase"
          >
            {{ textoEstadoEnfrentamiento }}
          </span>
        </div>
      </div>

      <div class="space-y-3 bg-white rounded-xl border border-slate-200/80 p-4 divide-y">
        <div class="flex items-center justify-between py-1.5">
          <span class="text-xs font-semibold text-slate-500">Nombre completo:</span>
          <span class="text-xs font-bold text-slate-800 text-right">{{ burbuja.jugador.nombre }}</span>
        </div>

        <div class="flex items-center justify-between py-2">
          <span class="text-xs font-semibold text-slate-500">Teléfono de contacto:</span>
          <span class="text-xs font-bold font-mono text-slate-800 tracking-wide select-all">
            {{ burbuja.jugador.telefono }}
          </span>
        </div>

        <div class="flex items-center justify-between py-2">
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-slate-500">Plazo límite:</span>
            <span class="text-[10px] text-slate-400">Reglamento: 2 días máx.</span>
          </div>

          <div class="text-right">
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold"
              :class="estiloFechaLimite"
            >
              <Clock v-if="burbuja.diasRestantes > 0" class="w-3.5 h-3.5" />
              <AlertTriangle v-else class="w-3.5 h-3.5" />
              {{ textoFechaLimite }}
            </span>
          </div>
        </div>

        <div v-if="burbuja.partido.estado === 'jugado'" class="flex items-center justify-between py-2">
          <span class="text-xs font-semibold text-slate-500">Marcador final:</span>
          <span class="text-xs font-extrabold font-mono text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md">
            {{ burbuja.marcador || 'Finalizado' }}
          </span>
        </div>
      </div>

      <div class="flex items-center justify-end gap-3 pt-2">
        <Button
          variant="outline"
          size="sm"
          @click="close"
        >
          Cerrar
        </Button>

        <Button
          variant="primary"
          size="sm"
          class="gap-1.5"
          @click="handleVerRival"
        >
          <Eye class="w-4 h-4" />
          <span>Ver</span>
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Clock, AlertTriangle, Eye } from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import type { BurbujaRival, JugadorTorneo } from '@/types'

const props = defineProps<{
  burbuja: BurbujaRival | null
}>()

const emit = defineEmits<{
  (e: 'ver-rival', rival: JugadorTorneo): void
}>()

const modalRef = ref<InstanceType<typeof Modal> | null>(null)

const open = () => {
  modalRef.value?.open()
}

const close = () => {
  modalRef.value?.close()
}

const colorBurbuja = computed(() => {
  if (!props.burbuja) return '#1e293b'
  if (props.burbuja.resultadoParaCentro === 'ganado') return '#10b981'
  if (props.burbuja.resultadoParaCentro === 'perdido') return '#ef4444'
  return '#1e293b'
})

const textoEstadoEnfrentamiento = computed(() => {
  if (!props.burbuja) return ''
  if (props.burbuja.esRivalDeTurno) return 'Rival de Turno (A las 12)'
  if (props.burbuja.resultadoParaCentro === 'ganado') return 'Partido Ganado'
  if (props.burbuja.resultadoParaCentro === 'perdido') return 'Partido Perdido'
  return 'Partido Pendiente'
})

const badgeEstadoClase = computed(() => {
  if (!props.burbuja) return 'bg-slate-100 text-slate-700'
  if (props.burbuja.esRivalDeTurno) return 'bg-sky-100 text-sky-800'
  if (props.burbuja.resultadoParaCentro === 'ganado') return 'bg-emerald-100 text-emerald-800'
  if (props.burbuja.resultadoParaCentro === 'perdido') return 'bg-rose-100 text-rose-800'
  return 'bg-slate-100 text-slate-700'
})

const textoFechaLimite = computed(() => {
  if (!props.burbuja) return ''
  if (props.burbuja.diasRestantes >= 2) return '2 días'
  if (props.burbuja.diasRestantes === 1) return '1 día'
  return 'Partido perdido'
})

const estiloFechaLimite = computed(() => {
  if (!props.burbuja) return 'bg-slate-100 text-slate-700'
  if (props.burbuja.diasRestantes >= 2) return 'bg-slate-100 text-slate-700'
  if (props.burbuja.diasRestantes === 1) return 'bg-amber-100 text-amber-900 border border-amber-300'
  return 'bg-rose-100 text-rose-900 border border-rose-300'
})

const handleVerRival = () => {
  if (props.burbuja) {
    emit('ver-rival', props.burbuja.jugador)
    close()
  }
}

defineExpose({
  open,
  close,
})
</script>

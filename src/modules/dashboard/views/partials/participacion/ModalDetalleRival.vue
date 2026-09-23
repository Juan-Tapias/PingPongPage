<template>
  <Modal
    ref="modalRef"
    title="Detalle del Rival"
    sub-title="Información reglamentaria y estado del enfrentamiento"
    max-width="md"
    :footer="false"
  >
    <div v-if="burbuja" class="flex flex-col gap-5 py-1">
      <div class="flex items-center gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60">
        <div
          class="w-14 h-14 rounded-full flex items-center justify-center font-black text-lg text-white shadow-md select-none shrink-0"
          :style="{ backgroundColor: colorBurbuja }"
        >
          {{ burbuja.jugador.iniciales }}
        </div>
        <div class="flex-1 min-w-0">
          <h4 class="text-base font-extrabold text-slate-900 dark:text-white truncate">
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

      <div class="space-y-3 bg-white dark:bg-slate-800/60 rounded-xl border border-slate-200/80 dark:border-slate-700/60 p-4 divide-y divide-slate-100 dark:divide-slate-700">
        <div class="flex items-center justify-between py-1.5">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Jornada / Fecha:</span>
          <span class="text-xs font-bold font-mono text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded border border-sky-200 dark:border-sky-800">
            Ronda {{ burbuja.partido?.ronda || 1 }}
          </span>
        </div>

        <div class="flex items-center justify-between py-1.5">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Nombre completo:</span>
          <span class="text-xs font-bold text-slate-800 dark:text-slate-200 text-right">{{ burbuja.jugador.nombre }}</span>
        </div>

        <div class="flex items-center justify-between py-2">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Teléfono de contacto:</span>
          <span class="text-xs font-bold font-mono text-slate-800 dark:text-slate-200 tracking-wide select-all">
            {{ burbuja.jugador.telefono }}
          </span>
        </div>

        <div class="flex items-center justify-between py-2">
          <div class="flex flex-col">
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Plazo límite:</span>
            <span class="text-[10px] text-slate-400 dark:text-slate-500">Reglamento: 48 horas máx.</span>
          </div>

          <div class="text-right">
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-extrabold"
              :class="estiloFechaLimite"
            >
              <Hourglass v-if="burbuja.rivalTienePartidosPendientes" class="w-3.5 h-3.5" />
              <Clock v-else-if="burbuja.diasRestantes > 0" class="w-3.5 h-3.5" />
              <AlertTriangle v-else class="w-3.5 h-3.5" />
              {{ textoFechaLimite }}
            </span>
          </div>
        </div>

        <div v-if="burbuja.rivalTienePartidosPendientes && burbuja.partido.estado !== 'jugado'" class="p-2.5 rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-300 dark:border-sky-800 text-[11px] text-sky-900 dark:text-sky-200">
          <p class="font-bold flex items-center gap-1">
            <Hourglass class="w-3.5 h-3.5 text-sky-600 shrink-0" />
            Partido en espera de rival
          </p>
          <p class="text-[10px] text-sky-800 dark:text-sky-300 mt-0.5">
            Tu rival aún tiene partidos pendientes por disputar en rondas previas. El plazo reglamentario de 48 horas iniciará en cuanto ambos queden habilitados.
          </p>
        </div>

        <div v-else-if="burbuja.partido.estado === 'pendiente_admin' || (burbuja.diasRestantes <= 0 && burbuja.partido.estado === 'pendiente')" class="p-2.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-[11px] text-amber-900 dark:text-amber-200">
          <p class="font-bold flex items-center gap-1">
            <AlertTriangle class="w-3.5 h-3.5 text-amber-600 shrink-0" />
            Plazo reglamentario cumplido
          </p>
          <p class="text-[10px] text-amber-800 dark:text-amber-300 mt-0.5">
            Si tu rival no se presentó o no es posible disputar el partido, solicita al árbitro registrar victoria por W.O. (11-6, 11-6).
          </p>
        </div>

        <div v-if="!props.esVistaRival && burbuja.partido.estado === 'pendiente' && burbuja.codigoSeguridadPropio" class="flex items-center justify-between py-2">
          <div class="flex items-center gap-1.5">
            <KeyRound class="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Tu PIN para árbitro:</span>
          </div>
          <span class="text-xs font-black font-mono tracking-widest text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2.5 py-0.5 rounded-md border border-sky-200 dark:border-sky-800 select-all">
            {{ burbuja.codigoSeguridadPropio }}
          </span>
        </div>

        <div v-if="burbuja.partido.estado === 'jugado'" class="flex items-center justify-between py-2">
          <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">Marcador final:</span>
          <div class="text-right">
            <span class="text-xs font-extrabold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-md">
              {{ burbuja.marcador || 'Finalizado' }}
            </span>
            <p v-if="burbuja.partido.esWalkover" class="text-[10px] text-slate-400 mt-0.5 font-bold">
              Resuelto por W.O. (Sets: 11-6, 11-6)
            </p>
          </div>
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
import { Clock, AlertTriangle, Eye, KeyRound, Calendar, Hourglass } from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import type { BurbujaRival, JugadorTorneo } from '@/types'

const props = defineProps<{
  burbuja: BurbujaRival | null
  esVistaRival?: boolean
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
  if (props.burbuja.esRivalDeTurno) return 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
  if (props.burbuja.resultadoParaCentro === 'ganado') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
  if (props.burbuja.resultadoParaCentro === 'perdido') return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
  return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
})

const textoFechaLimite = computed(() => {
  if (!props.burbuja) return ''
  if (props.burbuja.partido.esWalkover) return 'Finalizado por W (11-6, 11-6)'
  if (props.burbuja.partido.estado === 'jugado') return 'Partido finalizado'
  if (props.burbuja.rivalTienePartidosPendientes) return 'En espera (rival con partidos previos)'
  if (props.burbuja.partido.horasRestantes !== undefined && props.burbuja.partido.horasRestantes > 0 && props.burbuja.partido.horasRestantes <= 24) {
    return `${props.burbuja.partido.horasRestantes}h restantes`
  }
  if (props.burbuja.diasRestantes >= 2) return '2 días'
  if (props.burbuja.diasRestantes === 1) return '1 día'
  return 'Plazo 48h vencido (W.O.)'
})

const estiloFechaLimite = computed(() => {
  if (!props.burbuja) return 'bg-slate-100 text-slate-700'
  if (props.burbuja.partido.esWalkover || props.burbuja.partido.estado === 'jugado') {
    return 'bg-emerald-100 text-emerald-900 border border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300'
  }
  if (props.burbuja.rivalTienePartidosPendientes) {
    return 'bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700'
  }
  if (props.burbuja.diasRestantes >= 2) return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
  if (props.burbuja.diasRestantes === 1) return 'bg-amber-100 text-amber-900 border border-amber-300 dark:bg-amber-950/60 dark:text-amber-300'
  return 'bg-rose-100 text-rose-900 border border-rose-300 dark:bg-rose-950/60 dark:text-rose-300'
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

<template>
  <Modal
    ref="modalRef"
    width="lg"
    :footer="false"
    :show-close="true"
    custom-class="w-full !max-w-[560px] 2xl:!max-w-[640px]"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div
          :class="[
            'w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center border shrink-0',
            marcador === 'Reprogramar'
              ? 'bg-amber-500/10 text-amber-600 border-amber-500/20'
              : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'
          ]"
        >
          <Clock v-if="marcador === 'Reprogramar'" class="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-600" />
          <AlertTriangle v-else class="w-4.5 h-4.5 sm:w-5 sm:h-5 text-amber-600" />
        </div>
        <div class="min-w-0">
          <h3 class="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white tracking-tight truncate">
            {{ marcador === 'Reprogramar' ? 'Prórroga de Tiempo de Juego' : 'Resolución de Partido en Conflicto' }}
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
            {{ marcador === 'Reprogramar' ? 'Otorga 24h hábiles adicionales sin cerrar el partido' : 'Dictamen administrativo para partidos vencidos (>48h)' }}
          </p>
        </div>
      </div>
    </template>

    <div v-if="partido" class="flex flex-col gap-4 sm:gap-5 pt-1 sm:pt-2">
      <!-- Banner informativo cuando es prórroga -->
      <div
        v-if="marcador === 'Reprogramar'"
        class="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2.5"
      >
        <Clock class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span class="font-bold">Modo Prórroga (+24h hábiles):</span>
          <p class="text-[11px] text-amber-800/90 dark:text-amber-300/90 mt-0.5 leading-relaxed">
            El partido <strong>se mantendrá en estado pendiente</strong> para que los jugadores puedan disputarlo. <strong>No se otorgará victoria a ninguno</strong> ni se alterarán los puntos de la tabla.
          </p>
        </div>
      </div>

      <!-- Duelo de Jugadores: Stacks on mobile, inline on desktop -->
      <div class="p-3 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-4">
        <!-- Jugador 1 -->
        <button
          type="button"
          :disabled="marcador === 'Reprogramar'"
          :class="[
            'flex-1 flex flex-col items-center p-3 rounded-xl border text-center transition-all',
            marcador === 'Reprogramar'
              ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-default opacity-90'
              : (ganadorSeleccionadoId === partido.jugador1.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-950 dark:text-emerald-200 cursor-pointer'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200 cursor-pointer')
          ]"
          @click="marcador !== 'Reprogramar' ? (ganadorSeleccionadoId = partido.jugador1.id) : null"
        >
          <div class="w-10 h-10 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs mb-1.5 shadow-xs">
            {{ partido.jugador1.iniciales }}
          </div>
          <span class="text-xs font-bold truncate max-w-full">{{ partido.jugador1.nombre }}</span>
          <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase mt-0.5 font-semibold">Jugador 1</span>
          <span
            v-if="ganadorSeleccionadoId === partido.jugador1.id && marcador !== 'Reprogramar'"
            class="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full mt-2"
          >
            Ganador Asignado
          </span>
          <span
            v-else-if="marcador === 'Reprogramar'"
            class="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full mt-2"
          >
            En Juego
          </span>
        </button>

        <div class="flex sm:flex-col items-center justify-center gap-1 shrink-0 py-1 sm:py-0">
          <span class="text-xs font-black text-slate-400">VS</span>
          <span
            :class="[
              'text-[10px] font-bold px-2 py-0.5 rounded-md',
              marcador === 'Reprogramar'
                ? 'text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40'
                : 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-900/40'
            ]"
          >
            {{ marcador === 'Reprogramar' ? '+24h Prórroga' : '48h Excedidas' }}
          </span>
        </div>

        <!-- Jugador 2 -->
        <button
          type="button"
          :disabled="marcador === 'Reprogramar'"
          :class="[
            'flex-1 flex flex-col items-center p-3 rounded-xl border text-center transition-all',
            marcador === 'Reprogramar'
              ? 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 cursor-default opacity-90'
              : (ganadorSeleccionadoId === partido.jugador2.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 ring-2 ring-emerald-500/30 text-emerald-950 dark:text-emerald-200 cursor-pointer'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 text-slate-800 dark:text-slate-200 cursor-pointer')
          ]"
          @click="marcador !== 'Reprogramar' ? (ganadorSeleccionadoId = partido.jugador2.id) : null"
        >
          <div class="w-10 h-10 rounded-full bg-indigo-600 text-white font-bold flex items-center justify-center text-xs mb-1.5 shadow-xs">
            {{ partido.jugador2.iniciales }}
          </div>
          <span class="text-xs font-bold truncate max-w-full">{{ partido.jugador2.nombre }}</span>
          <span class="text-[10px] text-slate-500 dark:text-slate-400 uppercase mt-0.5 font-semibold">Jugador 2</span>
          <span
            v-if="ganadorSeleccionadoId === partido.jugador2.id && marcador !== 'Reprogramar'"
            class="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-900/60 px-2 py-0.5 rounded-full mt-2"
          >
            Ganador Asignado
          </span>
          <span
            v-else-if="marcador === 'Reprogramar'"
            class="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/60 px-2 py-0.5 rounded-full mt-2"
          >
            En Juego
          </span>
        </button>
      </div>

      <!-- Acción o Dictamen a Asignar -->
      <div class="space-y-2">
        <label class="block text-xs font-bold text-slate-700 dark:text-slate-200">
          Acción o Dictamen
        </label>
        <div class="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <button
            type="button"
            :class="[
              'p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
              marcador === '2 - 0 (W.O.)'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200'
            ]"
            @click="seleccionarOpcion('2 - 0 (W.O.)')"
          >
            2 - 0 (Por W.O.)
          </button>
          <button
            type="button"
            :class="[
              'p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
              marcador === '2 - 1'
                ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200'
            ]"
            @click="seleccionarOpcion('2 - 1')"
          >
            2 - 1 (Sets Reales)
          </button>
          <button
            type="button"
            :class="[
              'p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer text-center',
              marcador === 'Reprogramar'
                ? 'bg-amber-600 text-white border-amber-600 shadow-xs'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 text-slate-700 dark:text-slate-200'
            ]"
            @click="seleccionarOpcion('Reprogramar')"
          >
            Dar Prórroga +24h
          </button>
        </div>
      </div>

      <!-- Justificación o Motivo -->
      <div class="space-y-1.5">
        <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200">
          Nota del Administrador / Observaciones
        </label>
        <textarea
          v-model="observaciones"
          rows="2"
          :placeholder="marcador === 'Reprogramar' ? 'Ej: Se otorga prórroga de 24h hábiles para coordinar el partido.' : 'Ej: Jugador 2 no se presentó en la mesa asignada tras convocatoria oficial. Se otorga victoria 2-0 por W.O.'"
          class="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-600/20 focus:border-emerald-600 transition-colors"
        ></textarea>
      </div>

      <!-- Acciones -->
      <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          class="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-center"
          @click="close"
        >
          Cancelar
        </button>
        <button
          type="button"
          :disabled="!ganadorSeleccionadoId && marcador !== 'Reprogramar'"
          :class="[
            'flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white disabled:opacity-50 disabled:pointer-events-none rounded-xl shadow-xs transition-colors cursor-pointer text-center',
            marcador === 'Reprogramar'
              ? 'bg-amber-600 hover:bg-amber-700'
              : 'bg-emerald-700 hover:bg-emerald-800'
          ]"
          @click="handleGuardar"
        >
          <Clock v-if="marcador === 'Reprogramar'" class="w-3.5 h-3.5" />
          <Check v-else class="w-3.5 h-3.5" />
          <span>{{ marcador === 'Reprogramar' ? 'Confirmar Prórroga (+24h)' : 'Confirmar Dictamen' }}</span>
        </button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { AlertTriangle, Check, Clock } from 'lucide-vue-next'

const modalRef = ref()
const partido = ref<any>(null)
const ganadorSeleccionadoId = ref<string>('')
const marcador = ref<string>('2 - 0 (W.O.)')
const observaciones = ref<string>('')

const emit = defineEmits<{
  (e: 'resolver', payload: { partidoId: string; partido?: any; ganadorId: string; marcador: string; observaciones: string }): void
}>()

const open = (item: any) => {
  partido.value = item
  ganadorSeleccionadoId.value = item?.jugador1?.id || ''
  marcador.value = '2 - 0 (W.O.)'
  observaciones.value = 'Resolución administrativa por tiempo límite excedido.'
  modalRef.value?.open()
}

const seleccionarOpcion = (opcion: string) => {
  marcador.value = opcion
  if (opcion === 'Reprogramar') {
    if (!observaciones.value || observaciones.value === 'Resolución administrativa por tiempo límite excedido.') {
      observaciones.value = 'Prórroga de +24h hábiles otorgada por el administrador.'
    }
  } else {
    if (observaciones.value === 'Prórroga de +24h hábiles otorgada por el administrador.') {
      observaciones.value = 'Resolución administrativa por tiempo límite excedido.'
    }
    if (!ganadorSeleccionadoId.value && partido.value?.jugador1?.id) {
      ganadorSeleccionadoId.value = partido.value.jugador1.id
    }
  }
}

const close = () => {
  modalRef.value?.close()
}

const handleGuardar = () => {
  if (!partido.value) return
  emit('resolver', {
    partidoId: partido.value.id,
    partido: partido.value,
    ganadorId: marcador.value === 'Reprogramar' ? '' : ganadorSeleccionadoId.value,
    marcador: marcador.value,
    observaciones:
      observaciones.value ||
      (marcador.value === 'Reprogramar'
        ? 'Prórroga de +24h hábiles otorgada por el administrador.'
        : 'Resolución administrativa por tiempo límite excedido.'),
  })
  close()
}

defineExpose({ open, close })
</script>

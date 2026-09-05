<template>
  <Modal
    ref="modalRef"
    :title="paso === 'seleccion' ? 'Arbitraje de Torneo' : 'Confirmación de Seguridad (PINs)'"
    :sub-title="paso === 'seleccion' ? 'Selecciona un partido pendiente para arbitrar' : 'Ingresa los códigos de 5 dígitos de ambos rivales'"
    width="xl"
    :footer="false"
  >
    <!-- PASO 1: SELECCIÓN DE PARTIDO DISPONIBLE -->
    <div v-if="paso === 'seleccion'" class="space-y-4 py-1">
      <!-- Badge de Árbitro Elegible y Cambio de Cuenta -->
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
            {{ arbitro.iniciales }}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-slate-800">{{ arbitro.nombre }}</span>
              <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                Árbitro Habilitado
              </span>
            </div>
            <p class="text-[11px] text-slate-500">
              Registrado en el torneo • No participa en los partidos listados abajo
            </p>
          </div>
        </div>

        <!-- Selector de cuenta de árbitro para simulación -->
        <div v-if="jugadoresTorneo && jugadoresTorneo.length > 0" class="flex items-center gap-2 shrink-0">
          <label class="text-[11px] font-bold text-slate-500 whitespace-nowrap">Árbitro:</label>
          <select
            :value="arbitro.id"
            class="text-xs font-bold bg-white border border-slate-200 rounded-lg px-2.5 py-1 text-slate-800 focus:outline-hidden cursor-pointer shadow-2xs"
            @change="handleCambiarArbitro($event)"
          >
            <option v-for="j in jugadoresTorneo" :key="j.id" :value="j.id">
              {{ j.nombre }} {{ j.esUsuarioActual ? '(Tú)' : '' }}
            </option>
          </select>
        </div>
      </div>

      <!-- Lista de partidos disponibles -->
      <div v-if="partidosDisponibles.length > 0" class="space-y-2.5">
        <h4 class="text-xs font-black uppercase tracking-wider text-slate-400">
          Partidos pendientes por jugar ({{ partidosDisponibles.length }})
        </h4>

        <div
          v-for="item in partidosDisponibles"
          :key="item.partido.id"
          class="p-3.5 sm:p-4 rounded-xl border border-slate-200 hover:border-emerald-500/50 hover:bg-emerald-50/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-white shadow-xs"
        >
          <!-- Grid equilibrado de los dos jugadores -->
          <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 flex-1 min-w-0 pr-1 md:pr-4">
            <!-- Jugador 1 -->
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                {{ item.jugador1.iniciales }}
              </span>
              <span class="text-xs font-bold text-slate-800 truncate" :title="item.jugador1.nombre">
                {{ item.jugador1.nombre }}
              </span>
            </div>

            <!-- Divisor VS -->
            <span class="text-[10px] font-black font-mono text-slate-400 px-2 py-0.5 bg-slate-100 rounded-md shrink-0 select-none">
              VS
            </span>

            <!-- Jugador 2 -->
            <div class="flex items-center gap-2 min-w-0">
              <span class="w-8 h-8 rounded-full bg-sky-700 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                {{ item.jugador2.iniciales }}
              </span>
              <span class="text-xs font-bold text-slate-800 truncate" :title="item.jugador2.nombre">
                {{ item.jugador2.nombre }}
              </span>
            </div>
          </div>

          <!-- Botón de Acción -->
          <Button
            variant="emerald"
            size="sm"
            class="gap-1.5 shrink-0 self-end md:self-auto font-bold shadow-xs cursor-pointer"
            @click="seleccionarPartido(item)"
          >
            <ShieldCheck class="w-3.5 h-3.5" />
            <span>Arbitrar este partido</span>
          </Button>
        </div>
      </div>

      <div
        v-else
        class="text-center py-8 px-4 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-slate-500 flex flex-col items-center gap-2"
      >
        <AlertCircle class="w-8 h-8 text-slate-400" />
        <p class="text-sm font-bold text-slate-700">No hay partidos disponibles para arbitrar</p>
        <p class="text-xs text-slate-400 max-w-sm">
          Todos los partidos restantes ya fueron jugados o involucran tu participación en esta ronda.
        </p>
      </div>

      <div class="flex justify-end pt-2">
        <Button variant="ghost" size="sm" @click="close">
          Cerrar
        </Button>
      </div>
    </div>

    <div v-else-if="paso === 'confirmacion' && partidoSeleccionado" class="space-y-4 py-1">
      <button
        type="button"
        class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
        @click="paso = 'seleccion'"
      >
        <ArrowLeft class="w-3.5 h-3.5" />
        <span>Elegir otro partido</span>
      </button>

      <div class="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-around text-center">
        <div>
          <p class="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Jugador 1</p>
          <p class="text-xs font-black">{{ partidoSeleccionado.jugador1.nombre }}</p>
        </div>
        <span class="text-xs font-black font-mono text-emerald-400 px-2 py-0.5 bg-slate-800 rounded">
          VS
        </span>
        <div>
          <p class="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Jugador 2</p>
          <p class="text-xs font-black">{{ partidoSeleccionado.jugador2.nombre }}</p>
        </div>
      </div>

      <div class="p-3.5 rounded-xl bg-sky-50 border border-sky-200/80 text-sky-900 flex items-start gap-3">
        <KeyRound class="w-5 h-5 text-sky-700 shrink-0 mt-0.5" />
        <div class="text-xs space-y-1">
          <p class="font-extrabold">Protocolo de Validación de Presencia</p>
          <p class="text-sky-800">
            Pide a cada jugador el código numérico de 5 dígitos que aparece en su pantalla para este enfrentamiento. Ambos deben coincidir para abrir el marcador.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700">
            PIN de {{ partidoSeleccionado.jugador1.nombre }}
          </label>
          <input
            v-model="codigoJ1"
            type="text"
            maxlength="5"
            placeholder="5 dígitos (ej. 58214)"
            class="w-full text-center tracking-widest font-mono text-base font-black px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 outline-hidden uppercase focus:bg-white transition-all"
            @input="limpiarError"
          />
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700">
            PIN de {{ partidoSeleccionado.jugador2.nombre }}
          </label>
          <input
            v-model="codigoJ2"
            type="text"
            maxlength="5"
            placeholder="5 dígitos (ej. 91042)"
            class="w-full text-center tracking-widest font-mono text-base font-black px-3 py-2 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500/20 outline-hidden uppercase bg-slate-50 transition-all"
            @input="limpiarError"
          />
        </div>
      </div>

      <div
        v-if="mensajeError"
        class="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-2 animate-in fade-in"
      >
        <AlertTriangle class="w-4 h-4 text-rose-600 shrink-0" />
        <span>{{ mensajeError }}</span>
      </div>

      <details class="text-[11px] text-slate-500 bg-slate-50 p-2.5 rounded-lg border border-slate-200/80 cursor-pointer">
        <summary class="font-bold text-slate-600">Ver códigos de prueba generados por el sistema</summary>
        <div class="mt-2 pt-2 border-t border-slate-200 flex flex-col gap-1 font-mono">
          <p><span class="text-slate-400">PIN J1 ({{ partidoSeleccionado.jugador1.nombre }}):</span> <strong class="text-emerald-700">{{ partidoSeleccionado.partido.codigoJugador1 }}</strong></p>
          <p><span class="text-slate-400">PIN J2 ({{ partidoSeleccionado.jugador2.nombre }}):</span> <strong class="text-emerald-700">{{ partidoSeleccionado.partido.codigoJugador2 }}</strong></p>
          <button
            type="button"
            class="mt-1.5 text-xs text-sky-700 underline font-sans font-bold hover:text-sky-900 cursor-pointer text-left"
            @click="autocompletarCodigos"
          >
            Autocompletar códigos correctos
          </button>
        </div>
      </details>

      <div class="flex items-center justify-end gap-2.5 pt-2">
        <Button variant="ghost" size="sm" @click="paso = 'seleccion'">
          Atrás
        </Button>

        <Button
          variant="emerald"
          size="sm"
          class="gap-2"
          :disabled="codigoJ1.length !== 5 || codigoJ2.length !== 5"
          @click="handleConfirmarInicio"
        >
          <Play class="w-4 h-4" />
          <span>Validar e Iniciar Marcador</span>
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import {
  ShieldCheck,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  AlertTriangle,
  Play,
} from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import type { PartidoArbitrable, JugadorTorneo } from '@/types'

const props = defineProps<{
  arbitro: JugadorTorneo
  partidosDisponibles: PartidoArbitrable[]
  jugadoresTorneo?: JugadorTorneo[]
}>()

const emit = defineEmits<{
  (
    e: 'iniciar-partido',
    datos: {
      partidoArbitrable: PartidoArbitrable
    },
  ): void
  (
    e: 'validar-codigos',
    datos: {
      partidoId: string
      codigo1: string
      codigo2: string
    },
    callback: (resultado: { valido: boolean; mensaje: string }) => void,
  ): void
  (e: 'cambiar-arbitro', jugador: JugadorTorneo): void
}>()

const handleCambiarArbitro = (event: Event) => {
  const target = event.target as HTMLSelectElement
  const encontrado = props.jugadoresTorneo?.find((j) => j.id === target.value)
  if (encontrado) {
    emit('cambiar-arbitro', encontrado)
  }
}

const modalRef = ref<InstanceType<typeof Modal> | null>(null)
const paso = ref<'seleccion' | 'confirmacion'>('seleccion')
const partidoSeleccionado = ref<PartidoArbitrable | null>(null)

const codigoJ1 = ref('')
const codigoJ2 = ref('')
const mensajeError = ref('')

const open = () => {
  paso.value = 'seleccion'
  partidoSeleccionado.value = null
  codigoJ1.value = ''
  codigoJ2.value = ''
  mensajeError.value = ''
  modalRef.value?.open()
}

const close = () => {
  modalRef.value?.close()
}

const seleccionarPartido = (partido: PartidoArbitrable) => {
  partidoSeleccionado.value = partido
  codigoJ1.value = ''
  codigoJ2.value = ''
  mensajeError.value = ''
  paso.value = 'confirmacion'
}

const limpiarError = () => {
  mensajeError.value = ''
}

const autocompletarCodigos = () => {
  if (partidoSeleccionado.value) {
    codigoJ1.value = partidoSeleccionado.value.partido.codigoJugador1 || ''
    codigoJ2.value = partidoSeleccionado.value.partido.codigoJugador2 || ''
    mensajeError.value = ''
  }
}

const handleConfirmarInicio = () => {
  if (!partidoSeleccionado.value) return

  emit(
    'validar-codigos',
    {
      partidoId: partidoSeleccionado.value.partido.id,
      codigo1: codigoJ1.value,
      codigo2: codigoJ2.value,
    },
    (resultado) => {
      if (resultado.valido) {
        mensajeError.value = ''
        const match = partidoSeleccionado.value
        close()
        if (match) {
          emit('iniciar-partido', { partidoArbitrable: match })
        }
      } else {
        mensajeError.value = resultado.mensaje
      }
    },
  )
}

defineExpose({
  open,
  close,
})
</script>

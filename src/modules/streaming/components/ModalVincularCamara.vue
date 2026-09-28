<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm select-none overflow-y-auto"
        @click.self="close"
      >
        <div
          class="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden flex flex-col p-5 sm:p-6"
        >
          <!-- Botón de Cerrar -->
          <button
            type="button"
            class="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            @click="close"
          >
            <X class="w-4 h-4" />
          </button>

          <!-- Cabecera -->
          <div class="flex items-center gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div class="w-11 h-11 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0 shadow-inner">
              <Radio class="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                  Cámara de Mesa • Trípode
                </span>
              </div>
              <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-tight mt-0.5">
                Transmitir Mesa con este Dispositivo
              </h3>
            </div>
          </div>

          <!-- Cuerpo -->
          <div class="space-y-4 py-3">
            <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Usa este teléfono como <strong>cámara fija en trípode</strong>. El árbitro anotará los puntos en su propio móvil y el marcador se verá superpuesto en tu video en vivo automáticamente.
            </p>

            <!-- Si viene preseleccionado un partido específico -->
            <div
              v-if="partidoPreseleccionado"
              class="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs"
            >
              <div>
                <span class="text-[10px] font-extrabold uppercase text-slate-400">Mesa asignada</span>
                <p class="font-black text-slate-800 dark:text-slate-200">
                  {{ partidoPreseleccionado.mesa || 'Mesa 1' }} • {{ partidoPreseleccionado.jugador1?.nombre || 'J1' }} vs {{ partidoPreseleccionado.jugador2?.nombre || 'J2' }}
                </p>
              </div>
              <span class="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-mono font-black bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping"></span>
                <span>En juego</span>
              </span>
            </div>

            <!-- Entrada de Código de Cámara de 4 dígitos -->
            <div class="space-y-1.5">
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Código de Cámara (4 dígitos)
              </label>
              <div class="relative">
                <input
                  ref="inputCodigoRef"
                  v-model.trim="codigoInput"
                  type="text"
                  inputmode="numeric"
                  pattern="[0-9]*"
                  maxlength="4"
                  placeholder="Ej: 4826"
                  class="w-full text-center tracking-[0.4em] font-mono text-2xl font-black px-4 py-3 rounded-2xl border-2 border-slate-300 dark:border-slate-700 focus:border-rose-500 focus:ring-4 focus:ring-rose-500/20 outline-hidden bg-slate-50 dark:bg-slate-800/90 text-slate-900 dark:text-white transition-all shadow-inner"
                  @input="limpiarError"
                  @keydown.enter="handleVincular"
                />
              </div>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 text-center">
                Pídele al árbitro en la mesa el código de 4 dígitos que aparece en su pantalla de marcador.
              </p>
            </div>

            <!-- Mensaje de Error -->
            <div
              v-if="mensajeError"
              class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-start gap-2 animate-in fade-in"
            >
              <AlertTriangle class="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{{ mensajeError }}</span>
            </div>

            <!-- Recomendación de Ubicación -->
            <div class="p-3 rounded-xl bg-sky-50 dark:bg-sky-950/30 border border-sky-200 dark:border-sky-800/60 text-sky-900 dark:text-sky-300 text-[11px] flex items-start gap-2">
              <Smartphone class="w-4 h-4 text-sky-500 shrink-0 mt-0.5" />
              <p>
                <strong>Consejo:</strong> Ubica el celular en horizontal apuntando a la mesa antes de iniciar la transmisión.
              </p>
            </div>
          </div>

          <!-- Acciones -->
          <div class="flex items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="ghost" size="sm" @click="close">
              Cancelar
            </Button>

            <Button
              variant="danger"
              size="sm"
              class="gap-2 font-black shadow-md cursor-pointer bg-rose-600 hover:bg-rose-500 active:scale-95"
              :loading="cargando"
              :disabled="cargando || codigoInput.length !== 4"
              @click="handleVincular"
            >
              <Radio class="w-4 h-4 text-white animate-pulse" />
              <span>{{ cargando ? 'Verificando...' : 'Iniciar Cámara de Mesa' }}</span>
            </Button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, nextTick } from 'vue'
import { X, Radio, AlertTriangle, Smartphone } from 'lucide-vue-next'
import Button from '@/components/Button.vue'
import { buscarPartidoPorCodigoCamaraDB } from '@/services/torneoDatabaseService'
import type { PartidoGrupo } from '@/types'

const props = defineProps<{
  partidosEnCurso?: PartidoGrupo[]
}>()

const emit = defineEmits<{
  (e: 'vincular-exito', payload: { partido: PartidoGrupo; codigo: string }): void
  (e: 'close'): void
}>()

const visible = ref(false)
const codigoInput = ref('')
const cargando = ref(false)
const mensajeError = ref<string | null>(null)
const partidoPreseleccionado = ref<PartidoGrupo | null>(null)
const inputCodigoRef = ref<HTMLInputElement | null>(null)

const open = (partido?: PartidoGrupo | null) => {
  codigoInput.value = '' // NUNCA autocompletar el PIN para evitar que se filtre a otros celulares
  partidoPreseleccionado.value = partido || null
  mensajeError.value = null
  cargando.value = false
  visible.value = true

  nextTick(() => {
    inputCodigoRef.value?.focus()
  })
}

const close = () => {
  visible.value = false
  codigoInput.value = ''
  mensajeError.value = null
  cargando.value = false
  emit('close')
}

const limpiarError = () => {
  mensajeError.value = null
}

const handleVincular = async () => {
  const pin = codigoInput.value.trim()
  if (pin.length !== 4) {
    mensajeError.value = 'Ingresa el código numérico de 4 dígitos.'
    return
  }

  cargando.value = true
  mensajeError.value = null

  try {
    let partidoEncontrado: PartidoGrupo | null = null

    // 1. Si hay un partido preseleccionado (ej. Mesa 1), validar que el PIN pertenezca a esta mesa
    if (partidoPreseleccionado.value) {
      if (partidoPreseleccionado.value.codigoCamara && partidoPreseleccionado.value.codigoCamara !== pin) {
        mensajeError.value = 'El código ingresado no coincide con el partido de esta mesa. Pídele el PIN de 4 dígitos al árbitro.'
        cargando.value = false
        return
      }
      partidoEncontrado = partidoPreseleccionado.value
    } else if (props.partidosEnCurso && props.partidosEnCurso.length > 0) {
      partidoEncontrado = props.partidosEnCurso.find((p) => p.codigoCamara === pin) || null
    }

    // 2. Si no lo encontramos localmente, buscar en Firestore
    if (!partidoEncontrado) {
      partidoEncontrado = await buscarPartidoPorCodigoCamaraDB(pin)
    }

    if (!partidoEncontrado) {
      mensajeError.value = 'Código no encontrado. Asegúrate de que el árbitro haya iniciado el partido en la mesa.'
      cargando.value = false
      return
    }

    if (partidoEncontrado.estado === 'jugado') {
      mensajeError.value = 'Este partido ya ha finalizado.'
      cargando.value = false
      return
    }

    // Éxito: cerrar y emitir para abrir la cámara de transmisión en este dispositivo
    visible.value = false
    cargando.value = false
    emit('vincular-exito', { partido: partidoEncontrado, codigo: pin })
  } catch (err: any) {
    console.error('Error al vincular cámara por código:', err)
    mensajeError.value = 'Ocurrió un error al verificar el código. Inténtalo de nuevo.'
    cargando.value = false
  }
}

defineExpose({
  open,
  close,
})
</script>

<template>
  <Modal
    ref="modalRef"
    title="Este torneo tiene costo de inscripción"
    sub-title="Instrucciones para completar tu registro oficial"
    action="Enviar comprobante por WhatsApp"
    cancel="Cerrar"
    width="md"
    @action="handleEnviarWhatsApp"
  >
    <div v-if="torneo" class="space-y-4">
      <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
        <div>
          <span class="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Torneo seleccionado</span>
          <span class="text-sm font-bold text-slate-900 dark:text-white">{{ torneo.nombre }}</span>
        </div>
        <div class="text-right">
          <span class="text-[11px] text-slate-500 dark:text-slate-400 block font-medium">Costo de inscripción</span>
          <span class="text-base font-extrabold text-emerald-600 dark:text-emerald-400 font-heading">
            {{ formatearMoneda(torneo.costoInscripcion) }}
          </span>
        </div>
      </div>

      <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        El torneo <strong class="text-slate-900 dark:text-white">{{ torneo.nombre }}</strong> tiene costo de inscripción por un valor de
        <strong class="text-emerald-600 dark:text-emerald-400">{{ formatearMoneda(torneo.costoInscripcion) }}</strong>.
      </p>

      <div class="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-3 text-xs text-slate-700 dark:text-slate-300">
        <!-- Caso 1: Sin cuenta bancaria (Efectivo / En sede) -->
        <div v-if="torneo.tipoCuenta === 'ninguna' || !torneo.numeroCuenta" class="flex items-start gap-2.5">
          <Banknote class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-900 dark:text-white">Pago en Efectivo / En Sede</span>
              <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                Presencial
              </span>
            </div>
            <p class="text-xs text-slate-600 dark:text-slate-300 mt-1">
              No se requiere transferencia bancaria. Puedes realizar el pago de inscripción en efectivo directamente con el comité organizador o en la mesa de control oficial antes del inicio.
            </p>
          </div>
        </div>

        <!-- Caso 2: Cuenta bancaria (Ahorros o Corriente) -->
        <div v-else class="flex items-start gap-2.5">
          <CreditCard class="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
          <div class="flex-1">
            <div class="flex items-center gap-2">
              <span class="font-bold text-slate-900 dark:text-white">
                {{ torneo.tipoCuenta === 'corriente' ? 'Cuenta Corriente' : 'Cuenta de Ahorros' }}
              </span>
              <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                {{ torneo.tipoCuenta === 'corriente' ? 'Cta. Corriente' : 'Cta. de Ahorros' }}
              </span>
            </div>
            <span class="text-xs text-slate-600 dark:text-slate-300 block mt-0.5">
              Para ingresar al torneo debes transferir el valor a esta <strong>{{ torneo.tipoCuenta === 'corriente' ? 'Cuenta Corriente' : 'Cuenta de Ahorros' }}</strong>:
            </span>
            <div class="flex items-center justify-between mt-1.5 p-2.5 rounded-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 font-mono text-slate-900 dark:text-white text-xs">
              <div class="flex flex-col">
                <span class="text-[10px] text-slate-400 uppercase font-sans font-semibold">
                  Tipo: {{ torneo.tipoCuenta === 'corriente' ? 'Cuenta Corriente' : 'Cuenta de Ahorros' }}
                </span>
                <span class="font-bold tracking-wider text-sm">{{ torneo.numeroCuenta }}</span>
              </div>
              <button
                type="button"
                class="text-xs text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer font-sans font-semibold"
                @click="copiarCuenta"
              >
                <Check v-if="copiado" class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <Copy v-else class="w-3.5 h-3.5" />
                <span>{{ copiado ? '¡Copiado!' : 'Copiar' }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-start gap-2.5 pt-2 border-t border-slate-200/80 dark:border-slate-700">
          <MessageSquare class="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <span>Enviar comprobante a este número de WhatsApp:</span>
            <strong class="text-slate-900 dark:text-white block mt-0.5 font-mono text-xs">{{ torneo.whatsappContacto }}</strong>
            <span class="text-[11px] text-slate-500 dark:text-slate-400 block mt-1">
              Después será validado por el administrador e ingresará al torneo.
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2 border-t border-slate-200/80 dark:border-slate-700 text-amber-800 dark:text-amber-400">
          <Clock class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          <span>Tiene fecha límite hasta: <strong class="text-slate-900 dark:text-white font-semibold">{{ torneo.fechaLimiteInscripcion }}</strong></span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full">
        <Button
          variant="outline"
          size="sm"
          class="border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950/40"
          @click="handleEnviarWhatsApp"
        >
          <MessageSquare class="w-3.5 h-3.5 mr-1.5" />
          <span>Enviar comprobante por WhatsApp</span>
        </Button>
        <Button variant="emerald" size="sm" @click="handleInscribirme">
          <Check class="w-3.5 h-3.5 mr-1" />
          <span>Inscribirme</span>
        </Button>
      </div>
    </template>
  </Modal>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { CreditCard, MessageSquare, Clock, Copy, Check, Banknote } from 'lucide-vue-next'
import Button from '@/components/Button.vue'
import type { Torneo } from '@/types'

interface Props {
  torneo: Torneo | null
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'inscribir', torneo: Torneo): void
}>()

const modalRef = ref()
const copiado = ref(false)

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

const copiarCuenta = async () => {
  if (!props.torneo?.numeroCuenta) return
  try {
    await navigator.clipboard.writeText(props.torneo.numeroCuenta)
    copiado.value = true
    setTimeout(() => {
      copiado.value = false
    }, 2000)
  } catch (err) {
    console.error('Error al copiar:', err)
  }
}

const handleEnviarWhatsApp = () => {
  if (!props.torneo) return
  const numeroLimpio = props.torneo.whatsappContacto.replace(/\D/g, '')
  const mensaje = encodeURIComponent(
    `Hola! Acabo de realizar el pago de inscripción para el torneo "${props.torneo.nombre}". Adjunto el comprobante.`
  )
  window.open(`https://wa.me/${numeroLimpio}?text=${mensaje}`, '_blank')
}

const handleInscribirme = () => {
  if (!props.torneo) return
  emit('inscribir', props.torneo)
  close()
}

defineExpose({
  open,
  close,
})
</script>

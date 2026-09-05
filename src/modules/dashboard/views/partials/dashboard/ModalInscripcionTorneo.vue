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
      <div class="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
        <div>
          <span class="text-[11px] text-slate-500 block font-medium">Torneo seleccionado</span>
          <span class="text-sm font-bold text-slate-900">{{ torneo.nombre }}</span>
        </div>
        <div class="text-right">
          <span class="text-[11px] text-slate-500 block font-medium">Costo de inscripción</span>
          <span class="text-base font-extrabold text-emerald-700 font-heading">
            {{ formatearMoneda(torneo.costoInscripcion) }}
          </span>
        </div>
      </div>

      <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
        El torneo <strong class="text-slate-900">{{ torneo.nombre }}</strong> tiene costo de inscripción por un valor de
        <strong class="text-emerald-700">{{ formatearMoneda(torneo.costoInscripcion) }}</strong>.
      </p>

      <div class="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs text-slate-700">
        <div class="flex items-start gap-2.5">
          <CreditCard class="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
          <div class="flex-1">
            <span>Para ingresar al torneo tiene que mandar el costo a este número de cuenta:</span>
            <div class="flex items-center justify-between mt-1.5 p-2.5 rounded-lg bg-white border border-slate-200 font-mono text-slate-900 text-xs">
              <span class="font-bold tracking-wider">{{ torneo.numeroCuenta }}</span>
              <button
                type="button"
                class="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 cursor-pointer font-sans font-semibold"
                @click="copiarCuenta"
              >
                <Check v-if="copiado" class="w-3.5 h-3.5 text-emerald-600" />
                <Copy v-else class="w-3.5 h-3.5" />
                <span>{{ copiado ? '¡Copiado!' : 'Copiar' }}</span>
              </button>
            </div>
          </div>
        </div>

        <div class="flex items-start gap-2.5 pt-2 border-t border-slate-200/80">
          <MessageSquare class="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <span>Enviar comprobante a este número de WhatsApp:</span>
            <strong class="text-slate-900 block mt-0.5 font-mono text-xs">{{ torneo.whatsappContacto }}</strong>
            <span class="text-[11px] text-slate-500 block mt-1">
              Después será validado por el administrador e ingresará al torneo.
            </span>
          </div>
        </div>

        <div class="flex items-center gap-2 pt-2 border-t border-slate-200/80 text-amber-800">
          <Clock class="w-4 h-4 text-amber-600 shrink-0" />
          <span>Tiene fecha límite hasta: <strong class="text-slate-900 font-semibold">{{ torneo.fechaLimiteInscripcion }}</strong></span>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 w-full">
        <Button variant="ghost" size="sm" @click="close">
          Cerrar
        </Button>
        <Button
          variant="outline"
          size="sm"
          class="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
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
import { CreditCard, MessageSquare, Clock, Copy, Check } from 'lucide-vue-next'
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

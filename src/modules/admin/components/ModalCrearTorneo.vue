<template>
  <Modal
    ref="modalRef"
    width="2xl"
    :show-close="true"
    custom-class="w-full !max-w-[760px] 2xl:!max-w-[860px]"
  >
    <template #header>
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20 shrink-0">
          <Trophy class="w-4.5 h-4.5 sm:w-5 sm:h-5 text-orange-500" />
        </div>
        <div class="min-w-0">
          <h3 class="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white tracking-tight truncate">
            Crear Nuevo Torneo
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
            Información que verán los jugadores en su tarjeta y en el proceso de inscripción.
          </p>
        </div>
      </div>
    </template>

    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 sm:gap-5 pt-1 sm:pt-2">
      <!-- 1. INFORMACIÓN PRINCIPAL (Card del Jugador) -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <FileText class="w-3.5 h-3.5" />
          Información del Torneo
        </h4>

        <div class="grid grid-cols-1 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Nombre del Torneo <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formulario.nombre"
              type="text"
              required
              placeholder="Ej: Torneo Relámpago ITTF Bucaramanga 2026"
              class="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Organizador Oficial <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <User class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                v-model="formulario.organizador"
                type="text"
                required
                placeholder="Ej: Juan Martinez"
                class="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <div class="h-px bg-slate-100 dark:bg-slate-800" />

      <!-- 2. CALENDARIO (Card del Jugador) -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Calendar class="w-3.5 h-3.5" />
          Fechas del Torneo
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Fecha de Inicio <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formulario.fechaInicio"
              type="date"
              required
              class="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Cierre de Inscripción <span class="text-red-500">*</span>
            </label>
            <input
              v-model="formulario.fechaLimiteInscripcion"
              type="date"
              required
              class="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div class="h-px bg-slate-100 dark:bg-slate-800" />

      <!-- 3. FINANZAS Y PAGO (Consumido por el Modal de Inscripción del Jugador) -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <DollarSign class="w-3.5 h-3.5" />
          Pago e Inscripción del Jugador
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Costo de Inscripción (COP) <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <span class="absolute left-3 top-2 text-xs text-slate-400 font-bold">$</span>
              <input
                v-model.number="formulario.costoInscripcion"
                type="number"
                required
                step="1000"
                min="0"
                placeholder="Ej: 6000"
                class="w-full pl-7 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Cuenta Bancolombia / Nequi <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <CreditCard class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                v-model="formulario.numeroCuenta"
                type="text"
                required
                placeholder="Ej: 310-9876543 (Nequi)"
                class="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              WhatsApp de Comprobantes <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <MessageSquare class="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
              <input
                v-model="formulario.whatsappContacto"
                type="text"
                required
                placeholder="Ej: +57 300 123 4567"
                class="w-full pl-9 pr-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Footer con botones -->
      <div class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          class="px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-center"
          @click="close"
        >
          Cancelar
        </button>
        <button
          type="submit"
          class="flex items-center justify-center gap-2 px-5 py-2.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md shadow-orange-950/20 transition-all duration-200 cursor-pointer"
        >
          <Trophy class="w-4 h-4" />
          <span>Crear y Publicar Torneo</span>
        </button>
      </div>
    </form>
  </Modal>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import {
  Trophy,
  FileText,
  Calendar,
  DollarSign,
  User,
  CreditCard,
  MessageSquare,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import type { Torneo } from '@/types'

const modalRef = ref()
const authStore = useAuthStore()

const emit = defineEmits<{
  (e: 'crear', torneo: Torneo): void
}>()

interface FormularioTorneo {
  nombre: string
  organizador: string
  fechaInicio: string
  fechaLimiteInscripcion: string
  costoInscripcion?: number
  numeroCuenta: string
  whatsappContacto: string
}

const initialForm: FormularioTorneo = {
  nombre: '',
  organizador: '',
  fechaInicio: '',
  fechaLimiteInscripcion: '',
  costoInscripcion: 6000,
  numeroCuenta: '',
  whatsappContacto: '',
}

const formulario = reactive<FormularioTorneo>({ ...initialForm })

const open = () => {
  const adminNombre = authStore.usuario?.nombre
    ? `${authStore.usuario.nombre} ${authStore.usuario.apellido || ''}`.trim()
    : 'Comité Organizador'

  Object.assign(formulario, {
    ...initialForm,
    organizador: adminNombre,
  })
  modalRef.value?.open()
}

const close = () => {
  modalRef.value?.close()
}

const handleSubmit = () => {
  const nuevoTorneo: Torneo = {
    id: `torneo-${Date.now()}`,
    nombre: formulario.nombre.trim(),
    organizador: formulario.organizador.trim() || 'Comité Organizador',
    fechaInicio: formulario.fechaInicio,
    fechaLimiteInscripcion: formulario.fechaLimiteInscripcion,
    costoInscripcion: formulario.costoInscripcion ?? 0,
    numeroCuenta: formulario.numeroCuenta.trim(),
    whatsappContacto: formulario.whatsappContacto.trim(),
    categoria: 'CATEGORÍA ABIERTA',
    modalidad: 'INDIVIDUAL MASCULINO',
    estado: 'por iniciar',
    subestado: 'INSCRITO',
    estaInscrito: false,
  }

  emit('crear', nuevoTorneo)
  close()
}

defineExpose({ open, close })
</script>

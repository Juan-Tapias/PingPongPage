<template>
  <Modal
    ref="modalRef"
    width="2xl"
    :show-close="true"
    custom-class="w-full !max-w-[740px] 2xl:!max-w-[860px]"
  >
    <template #header>
      <div class="flex items-center gap-2.5 sm:gap-3">
        <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center border border-orange-500/20 shrink-0">
          <Trophy class="w-4.5 h-4.5 sm:w-5 sm:h-5 text-orange-500" />
        </div>
        <div class="min-w-0">
          <h3 class="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white tracking-tight truncate">
            Crear Nuevo Torneo / Proyecto
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
            Define la información, fechas, cupos y condiciones del torneo
          </p>
        </div>
      </div>
    </template>

    <form @submit.prevent="handleSubmit" class="flex flex-col gap-4 sm:gap-5 pt-1 sm:pt-2">
      <!-- Sección: Información Básica -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <FileText class="w-3.5 h-3.5" />
          Información General
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
              placeholder="Ej: Torneo Relámpago Campers & Trainers 2026"
              class="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Descripción y Formato
            </label>
            <textarea
              v-model="formulario.descripcion"
              rows="2"
              placeholder="Fase de grupos radial y eliminatoria directa. Partidos al mejor de 3 sets..."
              class="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            ></textarea>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Categoría</label>
              <select
                v-model="formulario.categoria"
                class="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              >
                <option value="" disabled>Selecciona una categoría</option>
                <option value="CATEGORÍA MÁSTER">Categoría Máster</option>
                <option value="CATEGORÍA AMATEUR">Categoría Amateur</option>
                <option value="CAMPERS VS TRAINERS">Campers vs Trainers</option>
                <option value="CATEGORÍA ABIERTA">Categoría Abierta / Open</option>
              </select>
            </div>

            <div>
              <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">Modalidad</label>
              <select
                v-model="formulario.modalidad"
                class="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              >
                <option value="" disabled>Selecciona una modalidad</option>
                <option value="INDIVIDUAL MASCULINO">Individual Masculino</option>
                <option value="INDIVIDUAL FEMENINO">Individual Femenino</option>
                <option value="MIXTO GENERAL">Mixto General</option>
                <option value="DOBLES">Dobles</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div class="h-px bg-slate-100 dark:bg-slate-800" />

      <!-- Sección: Sede, Cupos y Fechas -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <Calendar class="w-3.5 h-3.5" />
          Sede, Cupos y Calendario
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Sede del Evento
            </label>
            <input
              v-model="formulario.sede"
              type="text"
              placeholder="Ej: Sala de Juegos - Sede Bucaramanga"
              class="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Cupos Totales de Jugadores
            </label>
            <select
              v-model.number="formulario.cuposTotales"
              class="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            >
              <option :value="undefined" disabled>Selecciona cantidad de cupos</option>
              <option :value="16">16 Jugadores (Cuadro 16)</option>
              <option :value="24">24 Jugadores (Grupos)</option>
              <option :value="32">32 Jugadores (Cuadro 32)</option>
              <option :value="48">48 Jugadores</option>
              <option :value="64">64 Jugadores</option>
            </select>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Fecha de Inicio del Torneo
            </label>
            <input
              v-model="formulario.fechaInicio"
              type="date"
              class="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Límite de Inscripción
            </label>
            <input
              v-model="formulario.fechaLimiteInscripcion"
              type="date"
              class="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
          </div>
        </div>
      </div>

      <div class="h-px bg-slate-100 dark:bg-slate-800" />

      <!-- Sección: Recaudación y Contacto -->
      <div class="space-y-3">
        <h4 class="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
          <DollarSign class="w-3.5 h-3.5" />
          Finanzas y Pagos
        </h4>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Costo de Inscripción (COP)
            </label>
            <div class="relative">
              <span class="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">$</span>
              <input
                v-model.number="formulario.costoInscripcion"
                type="number"
                step="1000"
                min="0"
                placeholder="Ej: 6000"
                class="w-full pl-7 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              Cuenta Bancolombia / Nequi
            </label>
            <input
              v-model="formulario.numeroCuenta"
              type="text"
              placeholder="Ej: 310-9876543 (Nequi / Bancolombia)"
              class="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
          </div>

          <div>
            <label class="block text-xs font-semibold text-slate-700 dark:text-slate-200 mb-1">
              WhatsApp del Organizador
            </label>
            <input
              v-model="formulario.whatsappContacto"
              type="text"
              placeholder="Ej: +57 300 123 4567"
              class="w-full px-3.5 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors"
            />
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
import { Trophy, FileText, Calendar, DollarSign } from 'lucide-vue-next'
import type { Torneo } from '@/types'

const modalRef = ref()

const emit = defineEmits<{
  (e: 'crear', torneo: Torneo): void
}>()

interface FormularioTorneo {
  nombre: string
  descripcion: string
  categoria: string
  modalidad: string
  sede: string
  cuposTotales?: number
  fechaInicio: string
  fechaLimiteInscripcion: string
  costoInscripcion?: number
  numeroCuenta: string
  whatsappContacto: string
  organizador: string
}

const initialForm: FormularioTorneo = {
  nombre: '',
  descripcion: '',
  categoria: '',
  modalidad: '',
  sede: '',
  cuposTotales: undefined,
  fechaInicio: '',
  fechaLimiteInscripcion: '',
  costoInscripcion: undefined,
  numeroCuenta: '',
  whatsappContacto: '',
  organizador: '',
}

const formulario = reactive<FormularioTorneo>({ ...initialForm })

const open = () => {
  Object.assign(formulario, initialForm)
  modalRef.value?.open()
}

const close = () => {
  modalRef.value?.close()
}

const handleSubmit = () => {
  const nuevoTorneo: Torneo = {
    id: `torneo-${Date.now()}`,
    nombre: formulario.nombre,
    descripcion: formulario.descripcion,
    categoria: formulario.categoria || 'CATEGORÍA ABIERTA',
    modalidad: formulario.modalidad || 'INDIVIDUAL MASCULINO',
    sede: formulario.sede || 'Sede Principal',
    cuposTotales: formulario.cuposTotales || 32,
    cuposTomados: 0,
    fechaInicio: formulario.fechaInicio,
    fechaLimiteInscripcion: formulario.fechaLimiteInscripcion,
    costoInscripcion: formulario.costoInscripcion || 0,
    numeroCuenta: formulario.numeroCuenta,
    whatsappContacto: formulario.whatsappContacto,
    organizador: formulario.organizador || 'Comité Organizador',
    estado: 'por iniciar',
    subestado: 'INSCRITO',
    estaInscrito: false,
  }

  emit('crear', nuevoTorneo)
  close()
}

defineExpose({ open, close })
</script>

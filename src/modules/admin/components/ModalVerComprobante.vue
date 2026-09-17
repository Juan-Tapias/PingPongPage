<template>
  <Modal
    ref="modalRef"
    width="lg"
    :footer="false"
    :show-close="true"
    custom-class="w-full !max-w-[560px] 2xl:!max-w-[620px]"
  >
    <template #header>
      <div class="flex items-center justify-between w-full pr-6">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20 shrink-0 shadow-xs">
            <ShieldCheck class="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div class="min-w-0">
            <div class="flex items-center gap-2">
              <h3 class="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white tracking-tight truncate">
                Comprobante de Pago
              </h3>
              <span
                class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-2xs"
                :class="estadoBadgeClasses"
              >
                {{ estadoTexto }}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">
              Auditoría financiera oficial del torneo
            </p>
          </div>
        </div>
      </div>
    </template>

    <div v-if="solicitud" class="flex flex-col gap-4 pt-1">
      <!-- Selector de Vistas / Pestañas internas -->
      <div class="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/80 text-xs font-semibold">
        <button
          type="button"
          class="flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          :class="vistaActiva === 'voucher' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
          @click="vistaActiva = 'voucher'"
        >
          <Receipt class="w-3.5 h-3.5" />
          <span>Voucher Digital</span>
        </button>
        <button
          type="button"
          class="flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer relative"
          :class="vistaActiva === 'captura' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
          @click="vistaActiva = 'captura'"
        >
          <ImageIcon class="w-3.5 h-3.5" />
          <span>Captura / Adjunto</span>
          <span v-if="imagenActual" class="w-2 h-2 rounded-full bg-emerald-500"></span>
        </button>
        <button
          type="button"
          class="flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          :class="vistaActiva === 'auditoria' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs font-bold' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'"
          @click="vistaActiva = 'auditoria'"
        >
          <CheckCircle2 class="w-3.5 h-3.5" />
          <span>Checklist & WhatsApp</span>
        </button>
      </div>

      <!-- ============================================== -->
      <!-- VISTA 1: VOUCHER DIGITAL BANCARIO (FINTECH PRO) -->
      <!-- ============================================== -->
      <div v-show="vistaActiva === 'voucher'" class="space-y-3">
        <!-- Selector rápido de Banco (para simulación / verificación multientidad) -->
        <div class="flex items-center justify-between px-1">
          <span class="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Entidad Emisora:
          </span>
          <div class="flex items-center gap-1">
            <button
              v-for="b in bancosDisponibles"
              :key="b.id"
              type="button"
              class="px-2 py-0.5 text-[10px] font-black rounded-md transition-all cursor-pointer border"
              :class="bancoSeleccionado === b.id ? b.activeClasses : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-200/70'"
              @click="bancoSeleccionado = b.id"
            >
              {{ b.nombre }}
            </button>
          </div>
        </div>

        <!-- Tarjeta Boleto Voucher FinTech con bordes perforados -->
        <div class="relative rounded-2xl bg-gradient-to-b from-white to-slate-50 dark:from-slate-800/90 dark:to-slate-900/90 border border-slate-200/90 dark:border-slate-700/80 shadow-md overflow-hidden transition-all">
          <!-- Banda de Entidad Bancaria -->
          <div
            class="px-4 py-2.5 flex items-center justify-between text-white transition-colors duration-300"
            :class="bancoActivoConfig.headerBg"
          >
            <div class="flex items-center gap-2">
              <div class="w-6 h-6 rounded-lg bg-white/20 backdrop-blur-xs flex items-center justify-center font-black text-xs">
                {{ bancoActivoConfig.iconoInicial }}
              </div>
              <span class="text-xs font-black tracking-wide">{{ bancoActivoConfig.nombreCompleto }}</span>
            </div>
            <span class="text-[10px] font-mono uppercase font-extrabold bg-black/20 px-2 py-0.5 rounded backdrop-blur-xs">
              Comprobante Verificado
            </span>
          </div>

          <!-- Monto Principal -->
          <div class="p-5 text-center relative border-b border-dashed border-slate-200 dark:border-slate-700">
            <div class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold border border-emerald-200/80 dark:border-emerald-800/80 mb-2">
              <CheckCircle2 class="w-3.5 h-3.5" />
              <span>Transferencia Exitosa</span>
            </div>

            <div class="flex items-baseline justify-center gap-1.5">
              <span class="text-3xl sm:text-4xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
                ${{ (solicitud.monto || 6000).toLocaleString('es-CO') }}
              </span>
              <span class="text-xs font-extrabold font-mono text-slate-400 dark:text-slate-500">COP</span>
            </div>

            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Inscripción oficial al torneo <strong class="text-slate-800 dark:text-slate-200">{{ solicitud.torneoNombre }}</strong>
            </p>

            <!-- Círculos decorativos de perforación de recibo -->
            <div class="absolute -left-3 -bottom-3 w-6 h-6 rounded-full bg-white dark:bg-[#0f172a] border-r border-slate-200 dark:border-slate-700"></div>
            <div class="absolute -right-3 -bottom-3 w-6 h-6 rounded-full bg-white dark:bg-[#0f172a] border-l border-slate-200 dark:border-slate-700"></div>
          </div>

          <!-- Metadatos de la Transacción -->
          <div class="p-4 sm:p-5 space-y-3 bg-slate-50/50 dark:bg-slate-900/40 text-xs">
            <!-- Referencia con 1-Click Copy -->
            <div class="flex items-center justify-between p-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200/80 dark:border-slate-700">
              <div class="min-w-0 pr-2">
                <span class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">
                  Referencia Bancaria / CUS
                </span>
                <span class="font-mono font-bold text-slate-900 dark:text-white text-xs tracking-wider select-all">
                  {{ solicitud.referencia || 'TRX-7829104' }}
                </span>
              </div>
              <button
                type="button"
                class="shrink-0 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer"
                :class="copiado ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300' : 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 text-slate-700 dark:text-slate-200'"
                @click="copiarReferencia"
              >
                <Check v-if="copiado" class="w-3.5 h-3.5" />
                <Copy v-else class="w-3.5 h-3.5" />
                <span>{{ copiado ? 'Copiado' : 'Copiar' }}</span>
              </button>
            </div>

            <!-- Tabla de Detalles -->
            <div class="grid grid-cols-2 gap-2.5 pt-1">
              <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70">
                <span class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block flex items-center gap-1">
                  <User class="w-3 h-3 text-slate-400" />
                  Jugador Emisor
                </span>
                <span class="font-bold text-slate-900 dark:text-white truncate block mt-0.5">
                  {{ solicitud.jugadorNombre }}
                </span>
                <span v-if="solicitud.jugadorTelefono" class="text-[11px] font-mono text-slate-500 dark:text-slate-400 block">
                  {{ solicitud.jugadorTelefono }}
                </span>
              </div>

              <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70">
                <span class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block flex items-center gap-1">
                  <Calendar class="w-3 h-3 text-slate-400" />
                  Fecha & Hora
                </span>
                <span class="font-bold text-slate-900 dark:text-white block mt-0.5">
                  {{ fechaFormateada }}
                </span>
                <span class="text-[10px] font-mono text-slate-400">
                  Canal: Transf. Móvil
                </span>
              </div>

              <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70">
                <span class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block flex items-center gap-1">
                  <CreditCard class="w-3 h-3 text-slate-400" />
                  Cuenta Destino
                </span>
                <span class="font-mono font-bold text-slate-900 dark:text-white block mt-0.5 truncate">
                  {{ solicitud.cuentaDestino || 'Pago en Efectivo / Sede' }}
                </span>
                <span class="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  {{ solicitud.cuentaDestino ? (solicitud.tipoCuenta === 'corriente' ? 'Cuenta Corriente Oficial' : 'Cuenta de Ahorros Oficial') : 'Pago en Efectivo' }}
                </span>
              </div>

              <div class="p-2.5 rounded-xl bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-slate-700/70">
                <span class="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block flex items-center gap-1">
                  <Hash class="w-3 h-3 text-slate-400" />
                  Hash de Seguridad
                </span>
                <span class="font-mono text-[10px] text-slate-600 dark:text-slate-300 truncate block mt-0.5">
                  {{ hashSeguridad }}
                </span>
                <span class="text-[10px] text-slate-400">
                  Cifrado SHA-256
                </span>
              </div>
            </div>

            <!-- Sello de Autenticidad en pie de recibo -->
            <div class="pt-2 flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 border-t border-slate-200/60 dark:border-slate-700/60 font-mono">
              <span>ESTADO: AUDITADO</span>
              <span class="tracking-widest">||| | |||| | ||||| ||</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- VISTA 2: CAPTURA REAL / ADJUNTO DE IMAGEN -->
      <!-- ============================================== -->
      <div v-show="vistaActiva === 'captura'" class="space-y-3">
        <!-- Si existe imagen cargada -->
        <div v-if="imagenActual" class="space-y-2.5">
          <div class="relative rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-950 overflow-hidden group flex items-center justify-center min-h-[260px] max-h-[380px]">
            <img
              :src="imagenActual"
              alt="Comprobante de pago adjunto"
              class="max-h-[360px] w-auto object-contain transition-transform duration-200"
              :style="{ transform: `scale(${zoomNivel}) rotate(${rotacion}deg)` }"
            />

            <!-- Barra flotante de herramientas de visualización -->
            <div class="absolute bottom-3 inset-x-3 flex items-center justify-between bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-white text-xs">
              <span class="font-mono text-[11px] text-slate-300">Zoom: {{ Math.round(zoomNivel * 100) }}%</span>
              <div class="flex items-center gap-1">
                <button
                  type="button"
                  class="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Alejar"
                  @click="zoomOut"
                >
                  <ZoomOut class="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  class="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Acercar"
                  @click="zoomIn"
                >
                  <ZoomIn class="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  class="p-1 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
                  title="Rotar 90°"
                  @click="rotarImagen"
                >
                  <RotateCw class="w-3.5 h-3.5" />
                </button>
                <a
                  :href="imagenActual"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="p-1 rounded-lg hover:bg-white/10 transition-colors inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 ml-1 font-semibold"
                  title="Ver tamaño original"
                >
                  <ExternalLink class="w-3.5 h-3.5" />
                  <span class="text-[11px]">Ampliar</span>
                </a>
              </div>
            </div>
          </div>

          <div class="flex items-center justify-between px-1 text-xs">
            <button
              type="button"
              class="text-red-500 hover:text-red-600 font-semibold cursor-pointer flex items-center gap-1"
              @click="imagenActual = null"
            >
              <X class="w-3.5 h-3.5" />
              <span>Remover captura</span>
            </button>
            <span class="text-slate-400">Captura adjunta por el usuario</span>
          </div>
        </div>

        <!-- Dropzone para adjuntar o pegar captura si aún no hay imagen -->
        <div
          v-else
          class="rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 bg-slate-50/70 dark:bg-slate-900/50 p-6 flex flex-col items-center justify-center text-center transition-all hover:border-emerald-500/50"
          @dragover.prevent
          @drop.prevent="handleFileDrop"
        >
          <div class="w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-2.5 border border-emerald-200 dark:border-emerald-800">
            <UploadCloud class="w-6 h-6" />
          </div>
          <h4 class="text-xs font-bold text-slate-800 dark:text-slate-200">
            Adjuntar Captura de Comprobante
          </h4>
          <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            Arrastra la imagen del comprobante de WhatsApp o selecciónala de tu equipo para auditarla
          </p>

          <label class="mt-3 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-xs cursor-pointer transition-all">
            <input
              type="file"
              accept="image/*"
              class="hidden"
              @change="handleFileInput"
            />
            <ImageIcon class="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Seleccionar Archivo</span>
          </label>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- VISTA 3: AUDITORÍA, CHECKLIST & WHATSAPP -->
      <!-- ============================================== -->
      <div v-show="vistaActiva === 'auditoria'" class="space-y-3">
        <!-- Checklist de Verificación Rápida -->
        <div class="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
          <h4 class="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <CheckCircle2 class="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>Criterios de Validación Oficial</span>
          </h4>
          <div class="space-y-2 pt-1 text-xs">
            <label class="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                v-model="checks.monto"
                type="checkbox"
                class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600"
              />
              <span>Monto coincide con el costo del torneo (<strong>${{ (solicitud.monto || 6000).toLocaleString('es-CO') }} COP</strong>)</span>
            </label>
            <label class="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                v-model="checks.referencia"
                type="checkbox"
                class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600"
              />
              <span>Referencia única y no duplicada en base de datos</span>
            </label>
            <label class="flex items-center gap-2.5 text-slate-700 dark:text-slate-300 cursor-pointer">
              <input
                v-model="checks.identidad"
                type="checkbox"
                class="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300 dark:border-slate-600"
              />
              <span>Identidad del jugador coincide con la inscripción (<strong>{{ solicitud.jugadorNombre }}</strong>)</span>
            </label>
          </div>
        </div>

        <!-- Tarjeta de Contacto Directo por WhatsApp -->
        <div class="p-3.5 rounded-2xl bg-emerald-50/70 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 flex items-center justify-between gap-3">
          <div class="min-w-0">
            <span class="text-xs font-bold text-emerald-900 dark:text-emerald-300 block">
              ¿Dudas con el comprobante?
            </span>
            <p class="text-[11px] text-emerald-700 dark:text-emerald-400 mt-0.5 truncate">
              Escríbele directamente a {{ solicitud.jugadorNombre }}
            </p>
          </div>
          <button
            type="button"
            class="shrink-0 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-xs inline-flex items-center gap-1.5 cursor-pointer"
            @click="contactarWhatsApp"
          >
            <MessageSquare class="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </button>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- MODO RECHAZO ASISTIDO (SI SE ACTIVA) -->
      <!-- ============================================== -->
      <div
        v-if="modoRechazo"
        class="p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/70 space-y-2.5 animate-in fade-in duration-200"
      >
        <div class="flex items-center justify-between">
          <span class="text-xs font-bold text-rose-900 dark:text-rose-300 flex items-center gap-1.5">
            <AlertCircle class="w-4 h-4 text-rose-600 dark:text-rose-400" />
            <span>Motivo de Rechazo del Comprobante</span>
          </span>
          <button
            type="button"
            class="text-[11px] font-bold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
            @click="modoRechazo = false"
          >
            Cancelar rechazo
          </button>
        </div>

        <div class="flex flex-wrap gap-1.5">
          <button
            v-for="motivo in motivosRechazo"
            :key="motivo"
            type="button"
            class="px-2.5 py-1 text-[11px] font-medium rounded-lg border transition-all cursor-pointer"
            :class="motivoSeleccionado === motivo ? 'bg-rose-600 text-white border-rose-600 font-bold shadow-2xs' : 'bg-white dark:bg-slate-800 text-rose-800 dark:text-rose-200 border-rose-200 dark:border-rose-800 hover:bg-rose-100/60'"
            @click="motivoSeleccionado = motivo"
          >
            {{ motivo }}
          </button>
        </div>

        <div class="flex items-center justify-end gap-2 pt-1">
          <button
            type="button"
            class="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl cursor-pointer"
            @click="modoRechazo = false"
          >
            Volver
          </button>
          <button
            type="button"
            class="px-3.5 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl shadow-xs transition-colors cursor-pointer flex items-center gap-1"
            @click="confirmarRechazo"
          >
            <X class="w-3.5 h-3.5" />
            <span>Confirmar Rechazo Definitivo</span>
          </button>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- BARRA DE ACCIONES PRINCIPAL -->
      <!-- ============================================== -->
      <div v-else class="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
        <button
          type="button"
          class="px-3.5 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer text-center"
          @click="close"
        >
          Cerrar
        </button>

        <div class="flex items-center gap-2">
          <button
            type="button"
            class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3.5 py-2 text-xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/60 border border-rose-200 dark:border-rose-900 rounded-xl transition-all cursor-pointer shadow-2xs"
            @click="iniciarRechazo"
          >
            <X class="w-3.5 h-3.5" />
            <span>Rechazar Pago</span>
          </button>

          <button
            type="button"
            class="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-xs hover:shadow-emerald-500/20 transition-all cursor-pointer ring-2 ring-emerald-500/30"
            @click="handleAprobar"
          >
            <Check class="w-4 h-4 stroke-[2.5]" />
            <span>Aprobar e Inscribir</span>
          </button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  Receipt,
  ShieldCheck,
  CheckCircle2,
  Check,
  X,
  Copy,
  User,
  Calendar,
  CreditCard,
  Hash,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ExternalLink,
  UploadCloud,
  MessageSquare,
  AlertCircle,
} from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'

const modalRef = ref()
const solicitud = ref<any>(null)
const vistaActiva = ref<'voucher' | 'captura' | 'auditoria'>('voucher')
const copiado = ref(false)
const modoRechazo = ref(false)
const motivoSeleccionado = ref('Referencia no encontrada o inválida')
const zoomNivel = ref(1)
const rotacion = ref(0)
const imagenActual = ref<string | null>(null)

const checks = ref({
  monto: true,
  referencia: true,
  identidad: true,
})

const bancosDisponibles = [
  {
    id: 'nequi',
    nombre: 'Nequi',
    nombreCompleto: 'Nequi Colombia',
    iconoInicial: 'N',
    headerBg: 'bg-gradient-to-r from-[#20002c] via-[#5b0042] to-[#da0081]',
    activeClasses: 'bg-fuchsia-600 text-white border-fuchsia-600',
  },
  {
    id: 'bancolombia',
    nombre: 'Bancolombia',
    nombreCompleto: 'Bancolombia a la Mano',
    iconoInicial: 'B',
    headerBg: 'bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600',
    activeClasses: 'bg-amber-500 text-slate-950 font-black border-amber-500',
  },
  {
    id: 'daviplata',
    nombre: 'Daviplata',
    nombreCompleto: 'Daviplata Davivienda',
    iconoInicial: 'D',
    headerBg: 'bg-gradient-to-r from-red-800 via-red-700 to-red-600',
    activeClasses: 'bg-red-600 text-white border-red-600',
  },
  {
    id: 'transfiya',
    nombre: 'Transfiya / PSE',
    nombreCompleto: 'Transfiya Interbancario',
    iconoInicial: 'T',
    headerBg: 'bg-gradient-to-r from-emerald-800 via-teal-700 to-emerald-600',
    activeClasses: 'bg-teal-600 text-white border-teal-600',
  },
]

const bancoSeleccionado = ref('nequi')

const bancoActivoConfig = computed(() => {
  return bancosDisponibles.find(b => b.id === bancoSeleccionado.value) || bancosDisponibles[0]!
})

const motivosRechazo = [
  'Referencia no encontrada o inválida',
  'Monto transferido no coincide ($6.000 COP)',
  'Comprobante duplicado o ya utilizado',
  'Comprobante ilegible o adulterado',
]

const emit = defineEmits<{
  (e: 'aprobar', id: string): void
  (e: 'rechazar', id: string, motivo?: string): void
}>()

const estadoTexto = computed(() => {
  if (!solicitud.value) return 'Pendiente'
  if (solicitud.value.estado === 'aprobado' || solicitud.value.pagoValidado) return 'Aprobado'
  if (solicitud.value.estado === 'rechazado') return 'Rechazado'
  return 'Por Auditar'
})

const estadoBadgeClasses = computed(() => {
  if (estadoTexto.value === 'Aprobado') {
    return 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
  }
  if (estadoTexto.value === 'Rechazado') {
    return 'bg-rose-50 dark:bg-rose-950/80 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800'
  }
  return 'bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 animate-pulse'
})

const fechaFormateada = computed(() => {
  if (solicitud.value?.fecha) return solicitud.value.fecha
  return new Date().toLocaleDateString('es-CO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
})

const hashSeguridad = computed(() => {
  const seed = solicitud.value?.referencia || 'PINGPONG'
  let hash = 0
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i)
    hash |= 0
  }
  const hex = Math.abs(hash).toString(16).padStart(8, '0')
  return `0x${hex.toUpperCase()}•SEC-ITTF`
})

const open = (item: any) => {
  solicitud.value = item || {}
  vistaActiva.value = 'voucher'
  modoRechazo.value = false
  zoomNivel.value = 1
  rotacion.value = 0

  // Asignar imagen existente si la solicitud la contiene
  imagenActual.value = item?.comprobanteUrl || item?.imagenUrl || null

  // Deducir banco a partir de referencia o asignar Nequi por defecto
  if (item?.banco) {
    const bId = item.banco.toLowerCase()
    if (bancosDisponibles.some(b => b.id === bId)) {
      bancoSeleccionado.value = bId
    }
  } else if (item?.referencia?.startsWith('NQ') || item?.referencia?.includes('NEQUI')) {
    bancoSeleccionado.value = 'nequi'
  } else if (item?.referencia?.startsWith('BC') || item?.referencia?.includes('BANCO')) {
    bancoSeleccionado.value = 'bancolombia'
  }

  modalRef.value?.open()
}

const close = () => {
  modalRef.value?.close()
}

const copiarReferencia = async () => {
  const refText = solicitud.value?.referencia || 'TRX-7829104'
  try {
    await navigator.clipboard.writeText(refText)
    copiado.value = true
    setTimeout(() => {
      copiado.value = false
    }, 2000)
  } catch (err) {
    console.error('Error al copiar:', err)
  }
}

const zoomIn = () => {
  if (zoomNivel.value < 2.5) zoomNivel.value += 0.25
}

const zoomOut = () => {
  if (zoomNivel.value > 0.5) zoomNivel.value -= 0.25
}

const rotarImagen = () => {
  rotacion.value = (rotacion.value + 90) % 360
}

const handleFileInput = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    const file = target.files[0]
    imagenActual.value = URL.createObjectURL(file)
    vistaActiva.value = 'captura'
  }
}

const handleFileDrop = (e: DragEvent) => {
  if (e.dataTransfer?.files && e.dataTransfer.files[0]) {
    const file = e.dataTransfer.files[0]
    imagenActual.value = URL.createObjectURL(file)
    vistaActiva.value = 'captura'
  }
}

const contactarWhatsApp = () => {
  if (!solicitud.value) return
  const tel = (solicitud.value.jugadorTelefono || solicitud.value.telefono || '').replace(/\D/g, '')
  const ref = solicitud.value.referencia || 'TRX-7829104'
  const torneo = solicitud.value.torneoNombre || 'Torneo'
  const mensaje = encodeURIComponent(
    `Hola ${solicitud.value.jugadorNombre}! Te escribimos del comité organizador de Ping Pong respecto a tu comprobante de pago (#${ref}) para el torneo "${torneo}".`
  )
  if (tel) {
    window.open(`https://wa.me/57${tel}?text=${mensaje}`, '_blank')
  } else {
    window.open(`https://wa.me/?text=${mensaje}`, '_blank')
  }
}

const iniciarRechazo = () => {
  modoRechazo.value = true
}

const confirmarRechazo = () => {
  if (solicitud.value) {
    emit('rechazar', solicitud.value.id, motivoSeleccionado.value)
  }
  close()
}

const handleAprobar = () => {
  if (solicitud.value) {
    emit('aprobar', solicitud.value.id)
  }
  close()
}

defineExpose({ open, close })
</script>

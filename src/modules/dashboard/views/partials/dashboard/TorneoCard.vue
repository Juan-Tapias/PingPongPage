<template>
  <!-- ============================================================ -->
  <!-- MODO: INSCRITO (Tournament Pass / Ficha Oficial de Torneo)    -->
  <!-- ============================================================ -->
  <div
    v-if="modo === 'inscrito'"
    class="relative flex flex-col justify-between h-full rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 dark:hover:shadow-emerald-500/10 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group"
  >
    <!-- Barra superior con gradiente de luz dinámico según estado -->
    <div :class="['h-1.5 w-full shrink-0', topGradientClass]" />

    <!-- Marca de agua decorativa sutil de fondo -->
    <div class="pointer-events-none absolute -right-6 -bottom-6 w-36 h-36 opacity-5 dark:opacity-10 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
      <Trophy class="w-full h-full text-current" />
    </div>

    <div class="p-5 sm:p-6 flex-1 flex flex-col justify-between relative z-10">
      <!-- Header: Badges & Estado -->
      <div>
        <div class="flex items-center justify-between gap-2 mb-3.5">
          <div class="flex items-center gap-2 flex-wrap">
            <!-- Badge Estado Principal con pulso neón -->
            <span
              :class="[
                'inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border tracking-wide uppercase',
                estadoConfig.badgeClass,
              ]"
            >
              <span :class="['w-2 h-2 rounded-full shrink-0', estadoConfig.dotClass]" />
              {{ estadoConfig.texto }}
            </span>

            <!-- Pill de Mesa Asignada si aplica -->
            <span
              v-if="(torneo as any).mesaAsignada"
              class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-orange-500/15 border border-orange-500/30 text-orange-400"
            >
              MESA {{ (torneo as any).mesaAsignada }}
            </span>
          </div>

          <!-- Subestado (INSCRITO / CONFIRMADO / EN VERIFICACIÓN) -->
          <span
            :class="[
              'inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border shadow-2xs',
              subestadoConfig.badgeClass,
            ]"
          >
            <component :is="subestadoConfig.icono" class="w-3 h-3" />
            {{ subestadoConfig.texto }}
          </span>
        </div>

        <!-- Título e Identidad del Torneo -->
        <div class="flex items-start gap-3.5 mt-2">
          <div
            :class="[
              'w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm transition-transform duration-300 group-hover:scale-105',
              estadoConfig.iconBoxClass,
            ]"
          >
            <component :is="estadoConfig.icono" class="w-5 h-5" />
          </div>

          <div class="flex-1 min-w-0">
            <span class="text-[10px] font-extrabold uppercase tracking-widest text-orange-500 dark:text-orange-400 block mb-0.5">
              SpinApp Tournament Cup
            </span>
            <h3 class="text-base sm:text-lg font-black font-heading text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-emerald-500 dark:group-hover:text-emerald-400 transition-colors">
              {{ torneo.nombre }}
            </h3>
          </div>
        </div>

        <!-- Ticket Data: Metadatos ordenados y limpios -->
        <div class="mt-4 rounded-2xl bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/80 p-3.5 space-y-2.5">
          <!-- Organizador & Fecha en 2 columnas -->
          <div class="grid grid-cols-2 gap-2 text-xs">
            <div class="flex flex-col">
              <span class="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <User class="w-3 h-3 text-slate-400" /> Organizador
              </span>
              <strong class="text-slate-800 dark:text-slate-200 font-bold truncate mt-0.5">
                {{ torneo.organizador }}
              </strong>
            </div>
            <div class="flex flex-col">
              <span class="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                <Calendar class="w-3 h-3 text-slate-400" /> Fecha Inicio
              </span>
              <strong class="text-slate-800 dark:text-slate-200 font-bold truncate mt-0.5">
                {{ torneo.fechaInicio }}
              </strong>
            </div>
          </div>

          <!-- Ficha de Posición Actual / Logro (Estilo Trofeo) -->
          <div
            v-if="(torneo.estado === 'en curso' || torneo.estado === 'finalizado') && torneo.subestado !== 'PENDIENTE'"
            class="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between"
          >
            <span class="text-[11px] font-medium text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
              <Award class="w-3.5 h-3.5 text-amber-500" />
              {{ torneo.estado === 'finalizado' ? 'Posición Oficial:' : 'Tu Posición Actual:' }}
            </span>
            <span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-black bg-gradient-to-r from-amber-500/15 to-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 shadow-2xs">
              {{ posicionTexto }}
            </span>
          </div>

          <!-- Micro-barra de Progreso del Torneo -->
          <div class="pt-2 border-t border-slate-200/60 dark:border-slate-800/80">
            <div class="flex items-center justify-between text-[10px] font-bold text-slate-400 mb-1.5">
              <span>Progreso del Torneo</span>
              <span class="text-orange-500 dark:text-orange-400 font-semibold">{{ progresoTexto }}</span>
            </div>
            <div class="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div
                :class="['h-full rounded-full transition-all duration-500', barraProgresoClass]"
                :style="{ width: barraProgresoAncho }"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Botón de Acción con Punch Deportivo -->
      <div class="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <button
          v-if="torneo.subestado === 'PENDIENTE'"
          type="button"
          class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white shadow-md shadow-amber-500/30 hover:shadow-lg hover:shadow-amber-500/40 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all duration-200"
          @click="emit('verEstado', torneo)"
        >
          <Clock class="w-4 h-4 shrink-0" />
          <span>Verificando Pago</span>
          <ArrowRight class="w-4 h-4 shrink-0 ml-auto" />
        </button>

        <button
          v-else-if="torneo.estado === 'en curso'"
          type="button"
          class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all duration-200"
          @click="emit('verTorneo', torneo)"
        >
          <Flag class="w-4 h-4 shrink-0" />
          <span>Ver Mi Participación</span>
          <ArrowRight class="w-4 h-4 shrink-0 ml-auto group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          v-else-if="torneo.estado === 'por iniciar'"
          type="button"
          class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-slate-800 hover:bg-slate-700 text-white shadow-md hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all duration-200"
          @click="emit('verTorneo', torneo)"
        >
          <Eye class="w-4 h-4 shrink-0 text-slate-300" />
          <span>Ver Mi Participación</span>
          <ArrowRight class="w-4 h-4 shrink-0 ml-auto group-hover:translate-x-1 transition-transform" />
        </button>

        <button
          v-else-if="torneo.estado === 'finalizado'"
          type="button"
          class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider border-2 border-slate-300 dark:border-slate-700 hover:border-amber-500 dark:hover:border-amber-500 text-slate-700 dark:text-slate-200 hover:text-amber-600 dark:hover:text-amber-400 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all duration-200"
          @click="emit('verTorneo', torneo)"
        >
          <Trophy class="w-4 h-4 text-amber-500 shrink-0" />
          <span>Ver Resultados Finales</span>
          <ArrowRight class="w-4 h-4 shrink-0 ml-auto group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  </div>

  <!-- ============================================================ -->
  <!-- MODO: DISPONIBLE (Ficha de Inscripción Abierta)               -->
  <!-- ============================================================ -->
  <div
    v-else
    class="relative flex flex-col justify-between h-full rounded-2xl sm:rounded-3xl bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 dark:hover:shadow-blue-500/10 hover:-translate-y-1.5 transition-all duration-300 overflow-hidden group"
  >
    <!-- Barra superior con gradiente de luz -->
    <div class="h-1.5 w-full shrink-0 bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-600" />

    <div class="p-5 sm:p-6 flex-1 flex flex-col justify-between relative z-10">
      <div>
        <div class="flex items-center justify-between gap-2 mb-3.5">
          <span
            v-if="torneo.estaInscrito"
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60"
          >
            <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
            INSCRITO
          </span>
          <span
            v-else
            class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800/60"
          >
            <span class="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
            INSCRIPCIÓN ABIERTA
          </span>

          <!-- Tarifa destacada -->
          <span class="text-base sm:text-lg font-black font-heading text-emerald-600 dark:text-emerald-400 flex items-baseline gap-1">
            {{ formatearMoneda(torneo.costoInscripcion) }}
            <span class="text-[10px] uppercase font-bold text-slate-400">COP</span>
          </span>
        </div>

        <span class="text-[10px] font-extrabold uppercase tracking-widest text-orange-500 dark:text-orange-400 block mb-0.5">
          Torneo Oficial Abierto
        </span>
        <h3 class="text-base sm:text-lg font-black font-heading text-slate-900 dark:text-white leading-snug line-clamp-2 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
          {{ torneo.nombre }}
        </h3>

        <!-- Ficha técnica del torneo -->
        <div class="mt-4 p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/70 border border-slate-200/60 dark:border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div class="flex flex-col">
            <span class="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
              <User class="w-3 h-3 text-slate-400" /> Organizador
            </span>
            <strong class="text-slate-800 dark:text-slate-200 font-bold truncate mt-0.5">{{ torneo.organizador }}</strong>
          </div>

          <div class="flex flex-col">
            <span class="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
              <Calendar class="w-3 h-3 text-slate-400" /> Inicio
            </span>
            <strong class="text-slate-800 dark:text-slate-200 font-bold mt-0.5">{{ torneo.fechaInicio }}</strong>
          </div>

          <div class="flex flex-col">
            <span class="text-[10px] text-red-500 font-bold flex items-center gap-1">
              <AlertTriangle class="w-3 h-3 text-red-500" /> Cierre
            </span>
            <strong class="text-red-500 font-bold mt-0.5 truncate">{{ torneo.fechaLimiteInscripcion }}</strong>
          </div>
        </div>
      </div>

      <!-- Botón de Inscripción -->
      <div class="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <button
          v-if="torneo.estaInscrito"
          type="button"
          disabled
          class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-300 dark:border-slate-700 cursor-not-allowed"
        >
          <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Ya Estás Inscrito</span>
        </button>

        <button
          v-else
          type="button"
          class="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-xs font-black uppercase tracking-wider bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-lg shadow-emerald-600/30 hover:shadow-emerald-500/50 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer transition-all duration-200"
          @click="emit('inscribir', torneo)"
        >
          <span>Inscribirme al Torneo</span>
          <ArrowRight class="w-4 h-4 ml-auto group-hover:translate-x-1 transition-transform" />
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import {
  Calendar,
  User,
  Trophy,
  ArrowRight,
  Zap,
  Award,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flag,
  Eye,
} from 'lucide-vue-next'
import type { Torneo } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { obtenerPartidosDB } from '@/services/torneoDatabaseService'

interface Props {
  torneo: Torneo
  modo: 'inscrito' | 'disponible'
}

const props = defineProps<Props>()

const emit = defineEmits<{
  (e: 'inscribir', torneo: Torneo): void
  (e: 'verTorneo', torneo: Torneo): void
  (e: 'verEstado', torneo: Torneo): void
}>()

const authStore = useAuthStore()

// Partidos reales del torneo para calcular avance matemático real
const totalPartidos = ref<number | null>(null)
const partidosJugados = ref<number | null>(null)

const cargarProgresoReal = async () => {
  if (!props.torneo?.id) return
  try {
    const partidos = await obtenerPartidosDB(props.torneo.id)
    if (partidos && partidos.length > 0) {
      totalPartidos.value = partidos.length
      partidosJugados.value = partidos.filter((p: any) => p.estado === 'jugado').length
    } else {
      totalPartidos.value = 0
      partidosJugados.value = 0
    }
  } catch {
    totalPartidos.value = null
    partidosJugados.value = null
  }
}

onMounted(() => {
  cargarProgresoReal()
})

watch(() => props.torneo.id, () => {
  cargarProgresoReal()
})

const formatearPosicionOrdinal = (val?: string | number) => {
  if (!val) return 'En Clasificación'
  const str = String(val).trim()
  if (str.includes('Lugar')) return str

  const num = parseInt(str, 10)
  if (isNaN(num) || num <= 0) return str

  if (num === 1) return '1er Lugar 🏆'
  if (num === 2) return '2do Lugar 🥈'
  if (num === 3) return '3er Lugar 🥉'
  return `${num}to Lugar`
}

const posicionTexto = computed(() => {
  if (props.torneo.posicionFinal) {
    return formatearPosicionOrdinal(props.torneo.posicionFinal)
  }

  if (props.torneo.posicionActual) {
    return formatearPosicionOrdinal(props.torneo.posicionActual)
  }

  const tabla = (props.torneo as any).tablaPosiciones
  if (tabla && Array.isArray(tabla) && tabla.length > 0) {
    const userId = authStore.usuario?.id
    if (userId) {
      const miFila = tabla.find((f: any) => f.jugadorId === userId || f.id === userId)
      if (miFila && miFila.posicion) {
        return formatearPosicionOrdinal(miFila.posicion)
      }
    }
  }

  if (props.torneo.estado === 'en curso') {
    return 'En Competencia'
  }

  return 'Por Disputar'
})

// Gradiente superior dinámico para el borde del pase
const topGradientClass = computed(() => {
  if (props.torneo.subestado === 'PENDIENTE') {
    return 'bg-gradient-to-r from-amber-500 via-orange-400 to-amber-600'
  }
  switch (props.torneo.estado) {
    case 'en curso':
      return 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600'
    case 'por iniciar':
      return 'bg-gradient-to-r from-blue-500 via-indigo-400 to-blue-600'
    case 'finalizado':
    default:
      return 'bg-gradient-to-r from-slate-400 via-slate-500 to-slate-400'
  }
})

// Progreso textual y visual del torneo con cálculos matemáticos reales
const porcentajeReal = computed(() => {
  if (props.torneo.estado === 'finalizado') return 100
  if (totalPartidos.value !== null && totalPartidos.value > 0) {
    return Math.min(100, Math.round(((partidosJugados.value || 0) / totalPartidos.value) * 100))
  }
  return 0
})

const progresoTexto = computed(() => {
  if (props.torneo.subestado === 'PENDIENTE') return 'En verificación'
  if (props.torneo.estado === 'finalizado') return 'Torneo Finalizado (100%)'
  if (props.torneo.estado === 'por iniciar') return 'Fase de Sorteo (0%)'

  if (totalPartidos.value !== null && totalPartidos.value > 0) {
    return `${partidosJugados.value} de ${totalPartidos.value} partidos (${porcentajeReal.value}%)`
  }

  return 'Fase Activa (Sin partidos jugados)'
})

const barraProgresoAncho = computed(() => {
  if (props.torneo.subestado === 'PENDIENTE') return '20%'
  if (props.torneo.estado === 'finalizado') return '100%'
  if (props.torneo.estado === 'por iniciar') return '5%'
  if (totalPartidos.value !== null && totalPartidos.value > 0) {
    return `${Math.max(6, porcentajeReal.value)}%`
  }
  return '5%'
})

const barraProgresoClass = computed(() => {
  if (props.torneo.subestado === 'PENDIENTE') return 'bg-amber-500'
  if (props.torneo.estado === 'finalizado') return 'bg-emerald-500'
  if (props.torneo.estado === 'por iniciar') return 'bg-blue-500'
  return 'bg-gradient-to-r from-orange-500 to-emerald-500'
})

// Configuración de Badges e Iconos según estado
const estadoConfig = computed(() => {
  if (props.torneo.subestado === 'PENDIENTE') {
    return {
      texto: 'En verificación',
      badgeClass: 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30',
      dotClass: 'bg-amber-500 animate-pulse',
      icono: Clock,
      iconBoxClass: 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/10',
    }
  }
  switch (props.torneo.estado) {
    case 'en curso':
      return {
        texto: 'En curso',
        badgeClass: 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
        dotClass: 'bg-emerald-500 animate-pulse',
        icono: Trophy,
        iconBoxClass: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 shadow-emerald-500/10',
      }
    case 'finalizado':
      return {
        texto: 'Finalizado',
        badgeClass: 'bg-slate-500/15 text-slate-600 dark:text-slate-400 border-slate-500/30',
        dotClass: 'bg-slate-400',
        icono: Award,
        iconBoxClass: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
      }
    case 'por iniciar':
    default:
      return {
        texto: 'Por iniciar',
        badgeClass: 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30',
        dotClass: 'bg-blue-500',
        icono: Zap,
        iconBoxClass: 'bg-blue-500/10 text-blue-500 border-blue-500/20 shadow-blue-500/10',
      }
  }
})

const subestadoConfig = computed(() => {
  if (props.torneo.subestado === 'PENDIENTE') {
    return {
      texto: 'EN VERIFICACIÓN',
      badgeClass: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30',
      icono: Clock,
    }
  }
  if (props.torneo.estado === 'en curso') {
    return {
      texto: props.torneo.subestado || 'INSCRITO',
      badgeClass: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30',
      icono: CheckCircle2,
    }
  }
  if (props.torneo.estado === 'por iniciar') {
    return {
      texto: props.torneo.subestado || 'CONFIRMADO',
      badgeClass: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30',
      icono: CheckCircle2,
    }
  }
  return {
    texto: props.torneo.subestado || 'COMPLETADO',
    badgeClass: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30',
    icono: CheckCircle2,
  }
})

const formatearMoneda = (monto: number) => {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0,
  }).format(monto)
}
</script>
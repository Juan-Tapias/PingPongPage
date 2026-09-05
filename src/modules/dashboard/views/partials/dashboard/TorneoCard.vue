<template>
  <div
    v-if="modo === 'inscrito'"
    :class="[
      'flex flex-col justify-between h-full rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 p-5 sm:p-6 overflow-hidden',
      topBorderClass,
    ]"
  >
    <div>
      <div class="flex items-center justify-between gap-2 mb-3.5">
        <span
          :class="[
            'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border',
            estadoConfig.badgeClass,
          ]"
        >
          <span :class="['w-1.5 h-1.5 rounded-full', estadoConfig.dotClass]" />
          {{ estadoConfig.texto }}
        </span>

        <span
          :class="[
            'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wide border',
            subestadoConfig.badgeClass,
          ]"
        >
          <component :is="subestadoConfig.icono" class="w-3 h-3" />
          {{ subestadoConfig.texto }}
        </span>
      </div>

      <div class="flex items-start gap-3 mt-1">
        <div
          :class="[
            'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border mt-0.5',
            estadoConfig.iconBoxClass,
          ]"
        >
          <component :is="estadoConfig.icono" class="w-5 h-5" />
        </div>

        <div class="flex-1 min-w-0">
          <h3 class="text-base sm:text-lg font-bold font-heading text-slate-900 leading-snug line-clamp-2">
            {{ torneo.nombre }}
          </h3>
        </div>
      </div>

      <div class="mt-4 p-3.5 rounded-xl bg-slate-50 border border-slate-100 space-y-2 text-xs">
        <div class="flex items-center justify-between text-slate-600">
          <span class="flex items-center gap-1.5 text-slate-500">
            <User class="w-3.5 h-3.5 text-slate-400" />
            Organizador:
          </span>
          <strong class="text-slate-800 font-semibold truncate ml-2">{{ torneo.organizador }}</strong>
        </div>

        <div class="flex items-center justify-between text-slate-600 pt-1.5 border-t border-slate-200/60">
          <span class="flex items-center gap-1.5 text-slate-500">
            <Calendar class="w-3.5 h-3.5 text-slate-400" />
            Inicio:
          </span>
          <strong class="text-slate-800 font-semibold">{{ torneo.fechaInicio }}</strong>
        </div>

        <div
          v-if="torneo.estado === 'finalizado'"
          class="flex items-center justify-between pt-1.5 border-t border-slate-200/60"
        >
          <span class="flex items-center gap-1.5 text-slate-500">
            <Award class="w-3.5 h-3.5 text-amber-500" />
            Posición final:
          </span>
          <strong class="text-emerald-700 font-bold">{{ torneo.posicionFinal || 'Completado' }}</strong>
        </div>
      </div>
    </div>

    <div class="mt-5 pt-3 border-t border-slate-100">
      <Button
        v-if="torneo.subestado === 'PENDIENTE'"
        variant="amber"
        size="md"
        block
        @click="emit('verEstado', torneo)"
      >
        <Clock class="w-3.5 h-3.5 mr-2 text-amber-800 shrink-0" />
        <span class="text-amber-950 font-bold">Verificando pago</span>
        <ArrowRight class="w-3.5 h-3.5 ml-1.5 text-amber-800 shrink-0" />
      </Button>

      <Button
        v-else-if="torneo.estado === 'en curso'"
        variant="emerald"
        size="md"
        block
        @click="emit('verTorneo', torneo)"
      >
        <Flag class="w-3.5 h-3.5 mr-2 text-white" />
        <span>Ver mi participación</span>
        <ArrowRight class="w-3.5 h-3.5 ml-1.5" />
      </Button>

      <Button
        v-else-if="torneo.estado === 'por iniciar'"
        variant="dark"
        size="md"
        block
        @click="emit('verTorneo', torneo)"
      >
        <Eye class="w-3.5 h-3.5 mr-2 text-slate-300" />
        <span>Ver mi participación</span>
        <ArrowRight class="w-3.5 h-3.5 ml-1.5" />
      </Button>

      <Button
        v-else-if="torneo.estado === 'finalizado'"
        variant="outline"
        size="md"
        block
        class="border-slate-300 text-slate-800 hover:bg-slate-100 font-bold cursor-pointer"
        @click="emit('verTorneo', torneo)"
      >
        <Trophy class="w-3.5 h-3.5 mr-2 text-amber-500" />
        <span>Ver resultados del torneo</span>
        <ArrowRight class="w-3.5 h-3.5 ml-1.5 text-slate-400" />
      </Button>
    </div>
  </div>

  <div
    v-else
    class="flex flex-col justify-between h-full rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:shadow-md transition-all duration-200 p-5 sm:p-6"
  >
    <div>
      <div class="flex items-center justify-between gap-2 mb-3">
        <span
          v-if="torneo.estaInscrito"
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200"
        >
          <CheckCircle2 class="w-3.5 h-3.5 text-emerald-600" />
          Inscrito
        </span>
        <span
          v-else
          class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-blue-500" />
          {{ estadoConfig.texto }}
        </span>

        <span class="text-base sm:text-lg font-extrabold font-heading text-emerald-700">
          {{ formatearMoneda(torneo.costoInscripcion) }}
          <span class="text-[10px] uppercase font-bold text-slate-400">COP</span>
        </span>
      </div>

      <h3 class="text-lg sm:text-xl font-bold font-heading text-slate-900 leading-snug line-clamp-2">
        {{ torneo.nombre }}
      </h3>

      <div class="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
        <div class="flex flex-col">
          <span class="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
            <User class="w-3 h-3" /> Organizador
          </span>
          <strong class="text-slate-800 font-bold truncate mt-0.5">{{ torneo.organizador }}</strong>
        </div>

        <div class="flex flex-col">
          <span class="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
            <Calendar class="w-3 h-3" /> Inicio
          </span>
          <strong class="text-slate-800 font-bold mt-0.5">{{ torneo.fechaInicio }}</strong>
        </div>

        <div class="flex flex-col">
          <span class="text-[10px] text-red-500 font-bold flex items-center gap-1">
            <AlertTriangle class="w-3 h-3" /> Cierre Inscrip.
          </span>
          <strong class="text-red-600 font-bold mt-0.5">{{ torneo.fechaLimiteInscripcion }}</strong>
        </div>
      </div>

      <div class="mt-3.5 flex items-center justify-end text-xs text-slate-500 pt-1">
        <span class="font-bold text-emerald-700">
          {{ torneo.cuposTomados || 14 }} / {{ torneo.cuposTotales || 32 }} cupos tomados
        </span>
      </div>
    </div>

    <div class="mt-5 pt-3 border-t border-slate-100">
      <Button
        v-if="torneo.estaInscrito"
        variant="outline"
        size="md"
        block
        disabled
        class="bg-slate-100 text-slate-800 border-slate-300 cursor-not-allowed font-bold"
      >
        <CheckCircle2 class="w-4 h-4 mr-2 text-emerald-700 shrink-0" />
        <span class="text-slate-800 font-bold">Ya estás inscrito</span>
      </Button>

      <Button
        v-else
        variant="emerald"
        size="md"
        block
        @click="emit('inscribir', torneo)"
      >
        <span>Inscribirme al Torneo</span>
        <ArrowRight class="w-4 h-4 ml-2" />
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
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
import Button from '@/components/Button.vue'
import type { Torneo } from '@/types'

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

// Borde superior de color para la tarjeta en "Mis Torneos"
const topBorderClass = computed(() => {
  if (props.torneo.subestado === 'PENDIENTE') {
    return 'border-t-4 border-t-amber-500'
  }
  switch (props.torneo.estado) {
    case 'en curso':
      return 'border-t-4 border-t-emerald-600'
    case 'por iniciar':
      return 'border-t-4 border-t-blue-600'
    case 'finalizado':
    default:
      return 'border-t-4 border-t-slate-400'
  }
})

// Configuración de Badges e Iconos según estado
const estadoConfig = computed(() => {
  if (props.torneo.subestado === 'PENDIENTE') {
    return {
      texto: 'Pendiente',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      dotClass: 'bg-amber-500 animate-pulse',
      icono: Clock,
      iconBoxClass: 'bg-amber-50 text-amber-600 border-amber-100',
    }
  }
  switch (props.torneo.estado) {
    case 'en curso':
      return {
        texto: 'En curso',
        badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        dotClass: 'bg-emerald-500 animate-pulse',
        icono: Trophy,
        iconBoxClass: 'bg-emerald-50 text-emerald-600 border-emerald-100',
      }
    case 'finalizado':
      return {
        texto: 'Finalizado',
        badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
        dotClass: 'bg-slate-400',
        icono: Award,
        iconBoxClass: 'bg-slate-100 text-slate-500 border-slate-200',
      }
    case 'por iniciar':
    default:
      return {
        texto: 'Por iniciar',
        badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
        dotClass: 'bg-blue-500',
        icono: Zap,
        iconBoxClass: 'bg-blue-50 text-blue-600 border-blue-100',
      }
  }
})

const subestadoConfig = computed(() => {
  if (props.torneo.subestado === 'PENDIENTE') {
    return {
      texto: 'EN VERIFICACIÓN',
      badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
      icono: Clock,
    }
  }
  if (props.torneo.estado === 'en curso') {
    return {
      texto: props.torneo.subestado || 'INSCRITO',
      badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icono: CheckCircle2,
    }
  }
  if (props.torneo.estado === 'por iniciar') {
    return {
      texto: props.torneo.subestado || 'CONFIRMADO',
      badgeClass: 'bg-blue-50 text-blue-700 border-blue-200',
      icono: CheckCircle2,
    }
  }
  return {
    texto: props.torneo.subestado || 'COMPLETADO',
    badgeClass: 'bg-slate-100 text-slate-600 border-slate-200',
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
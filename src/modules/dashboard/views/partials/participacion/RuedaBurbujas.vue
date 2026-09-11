<template>
  <div class="relative w-full max-w-105 mx-auto aspect-square select-none flex items-center justify-center p-1">
    <svg
      viewBox="0 0 540 540"
      class="w-full h-full overflow-hidden"
    >
      <defs>
        <filter id="glow-azul" x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="8" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        <linearGradient id="haz-luz-gradiente" x1="0.5" y1="1" x2="0.5" y2="0">
          <stop offset="0%" stop-color="#0284c7" stop-opacity="0.05" />
          <stop offset="50%" stop-color="#38bdf8" stop-opacity="0.5" />
          <stop offset="100%" stop-color="#60a5fa" stop-opacity="0.95" />
        </linearGradient>

        <linearGradient id="centro-gradiente" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#047857" />
          <stop offset="100%" stop-color="#065f46" />
        </linearGradient>

        <linearGradient id="centro-rival-gradiente" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>
      </defs>

      <g v-if="tieneLuzAzulActiva" class="haz-luz-12 pointer-events-none">
        <polygon
          points="252,270 288,270 302,75 238,75"
          fill="url(#haz-luz-gradiente)"
          class="animate-pulse"
          filter="url(#glow-azul)"
        />
        <line
          x1="270"
          y1="270"
          x2="270"
          y2="75"
          stroke="#38bdf8"
          stroke-width="3.5"
          stroke-linecap="round"
          class="animate-pulse drop-shadow-[0_0_10px_rgba(56,189,248,0.9)]"
        />
      </g>

      <g
        v-for="(item, idx) in posicionesRivales"
        :key="item.burbuja.jugador.id"
        :transform="`translate(${item.x}, ${item.y})`"
        :class="[
          'transition-all duration-300',
          puedeInteractuar(item.burbuja) ? 'cursor-pointer group' : 'cursor-default opacity-90'
        ]"
        @click="handleSeleccionar(item.burbuja)"
      >
        <g
          :class="idx % 2 === 0 ? 'animacion-flotar-1' : 'animacion-flotar-2'"
          :style="{ animationDelay: `${(idx * 0.45).toFixed(2)}s` }"
        >
          <circle
            :r="radioBurbuja + 2"
            fill="#000000"
            fill-opacity="0.35"
            class="filter drop-shadow-[0_12px_18px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-105"
          />

          <circle
            :r="radioBurbuja"
            fill="#1e293b"
            :stroke="obtenerColorBorde(item.burbuja)"
            :stroke-width="obtenerGrosorBorde(item.burbuja)"
            class="transition-all duration-300 group-hover:stroke-width-[5px]"
          />

          <circle
            v-if="item.burbuja.resultadoParaCentro === 'ganado'"
            :cx="badgeOffset"
            :cy="-badgeOffset"
            :r="badgeRadio"
            fill="#10b981"
            stroke="#ffffff"
            stroke-width="2"
          />
          <circle
            v-else-if="item.burbuja.resultadoParaCentro === 'perdido'"
            :cx="badgeOffset"
            :cy="-badgeOffset"
            :r="badgeRadio"
            fill="#ef4444"
            stroke="#ffffff"
            stroke-width="2"
          />
          <circle
            v-else-if="item.burbuja.colorBorde === 'naranja' || item.burbuja.partido.estado === 'pendiente_admin'"
            :cx="badgeOffset"
            :cy="-badgeOffset"
            :r="badgeRadio"
            fill="#f97316"
            stroke="#ffffff"
            stroke-width="2"
          />

          <text
            x="0"
            :y="radioBurbuja > 24 ? -6 : 0"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="#ffffff"
            :class="[
              'font-black tracking-wider uppercase pointer-events-none select-none',
              radioBurbuja > 30 ? 'text-sm' : radioBurbuja > 22 ? 'text-xs' : 'text-[9px]'
            ]"
          >
            {{ item.burbuja.jugador.iniciales }}
          </text>

          <text
            v-if="radioBurbuja > 24"
            x="0"
            y="12"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="#94a3b8"
            class="text-[9px] font-semibold pointer-events-none select-none"
          >
            {{ formatearNombre(item.burbuja.jugador.nombre) }}
          </text>
        </g>
      </g>

      <g
        transform="translate(270, 270)"
        class="burbuja-central cursor-default select-none"
      >
        <circle
          r="58"
          fill="#0f172a"
          class="drop-shadow-2xl"
        />

        <circle
          r="58"
          :fill="esVistaRival ? 'url(#centro-rival-gradiente)' : 'url(#centro-gradiente)'"
          :stroke="esVistaRival ? '#38bdf8' : '#10b981'"
          stroke-width="4"
          class="drop-shadow-lg"
        />

        <text
          x="0"
          y="-10"
          text-anchor="middle"
          dominant-baseline="middle"
          fill="#ffffff"
          class="text-2xl font-black tracking-wider uppercase drop-shadow-sm"
        >
          {{ jugadorCentro.iniciales }}
        </text>

        <text
          x="0"
          y="16"
          text-anchor="middle"
          dominant-baseline="middle"
          fill="#a7f3d0"
          class="text-[10px] font-bold uppercase tracking-wide"
        >
          {{ esVistaRival ? formatearNombre(jugadorCentro.nombre) : 'TÚ (CENTRAL)' }}
        </text>

        <text
          x="0"
          y="28"
          text-anchor="middle"
          dominant-baseline="middle"
          fill="#e2e8f0"
          class="text-[8px] font-medium opacity-80"
        >
          {{ esVistaRival ? 'Vista de Rival' : 'Jugador Principal' }}
        </text>
      </g>
    </svg>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BurbujaRival, JugadorTorneo, Torneo } from '@/types'

const props = defineProps<{
  torneo: Torneo
  jugadorCentro: JugadorTorneo
  rivales: BurbujaRival[]
  esVistaRival: boolean
}>()

const emit = defineEmits<{
  (e: 'seleccionar-rival', rival: BurbujaRival): void
  (e: 'seleccionar-enfrentamiento-rival', rival: BurbujaRival): void
}>()

const tieneLuzAzulActiva = computed(() => {
  return props.torneo.estado === 'en curso'
})

const radioBurbuja = computed(() => {
  const n = props.rivales.length
  if (n <= 6) return 38
  if (n <= 10) return 32
  if (n <= 16) return 26
  if (n <= 24) return 20
  return 16
})

const badgeOffset = computed(() => {
  const r = radioBurbuja.value
  return Math.round(r * 0.7)
})

const badgeRadio = computed(() => {
  const r = radioBurbuja.value
  return Math.max(5, Math.round(r * 0.22))
})

const posicionesRivales = computed(() => {
  const total = props.rivales.length
  if (total === 0) return []

  const cx = 270
  const cy = 270
  const radio = 195
  const offsetInicial = -Math.PI / 2 // -90 grados = 12 en punto

  return props.rivales.map((burbuja, index) => {
    const angulo = offsetInicial + (index * 2 * Math.PI) / total
    const x = cx + radio * Math.cos(angulo)
    const y = cy + radio * Math.sin(angulo)

    return {
      burbuja,
      x: Math.round(x * 100) / 100,
      y: Math.round(y * 100) / 100,
      index,
    }
  })
})

const obtenerColorBorde = (burbuja: BurbujaRival): string => {
  if (props.torneo.estado === 'por iniciar') {
    return '#64748b' // Gris para no jugados
  }

  if (burbuja.colorBorde) {
    switch (burbuja.colorBorde) {
      case 'verde':
        return '#10b981' // Verde: Victoria
      case 'rojo':
        return '#ef4444' // Rojo: Derrota
      case 'naranja':
        return '#f97316' // Naranja: Pendiente Admin (>48h)
      case 'gris':
      default:
        return '#64748b' // Gris: Pendiente
    }
  }

  switch (burbuja.resultadoParaCentro) {
    case 'ganado':
      return '#10b981'
    case 'perdido':
      return '#ef4444'
    default:
      return '#64748b'
  }
}

const obtenerGrosorBorde = (burbuja: BurbujaRival): string => {
  if (burbuja.esRivalDeTurno && tieneLuzAzulActiva.value) {
    return '4.5'
  }
  return '3.5'
}

const puedeInteractuar = (burbuja: BurbujaRival): boolean => {
  if (!props.esVistaRival) {
    return true
  }
  return burbuja.resultadoParaCentro === 'ganado' || burbuja.resultadoParaCentro === 'perdido'
}

const handleSeleccionar = (burbuja: BurbujaRival) => {
  if (!puedeInteractuar(burbuja)) return

  if (props.esVistaRival) {
    emit('seleccionar-enfrentamiento-rival', burbuja)
  } else {
    emit('seleccionar-rival', burbuja)
  }
}

const formatearNombre = (nombre: string): string => {
  const partes = nombre.trim().split(' ')
  const primerNombre = partes[0] ?? ''
  const segundoNombre = partes[1]
  if (!segundoNombre) return primerNombre
  return `${primerNombre} ${segundoNombre.charAt(0)}.`
}
</script>

<style scoped>
.animacion-flotar-1 {
  animation: flotar1 3.8s ease-in-out infinite;
}

.animacion-flotar-2 {
  animation: flotar2 4.4s ease-in-out infinite;
}

@keyframes flotar1 {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
  }
  50% {
    transform: translateY(-8px) translateX(2px);
  }
}

@keyframes flotar2 {
  0%, 100% {
    transform: translateY(0px) translateX(0px);
  }
  50% {
    transform: translateY(-6px) translateX(-3px);
  }
}
</style>

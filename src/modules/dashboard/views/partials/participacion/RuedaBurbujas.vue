<template>
  <div class="w-full max-w-105 mx-auto">
  <div class="relative w-full aspect-square select-none flex items-center justify-center p-1">
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

        <linearGradient id="fase-completa-gradiente" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stop-color="#f59e0b" />
          <stop offset="50%" stop-color="#fcd34d" />
          <stop offset="100%" stop-color="#f59e0b" />
        </linearGradient>

        <linearGradient id="centro-rival-gradiente" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stop-color="#1e293b" />
          <stop offset="100%" stop-color="#0f172a" />
        </linearGradient>


        <clipPath id="clip-centro">
          <circle cx="0" cy="0" r="58" />
        </clipPath>

        <clipPath
          v-for="(item, idx) in posicionesRivales"
          :key="'clip-r-' + idx"
          :id="'clip-rival-' + idx"
        >
          <circle cx="0" cy="0" :r="radioBurbuja" />
        </clipPath>
      </defs>

      <!-- HAZ DE LUZ RADIAL HACIA EL RIVAL DE TURNO (A LAS 12 EN PUNTO) -->
      <g v-if="tieneLuzAzulActiva" class="haz-luz-12 pointer-events-none">
        <polygon
          :points="conoPolygonPoints"
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

      <!-- FASE COMPLETADA: anillo de efectividad, rayos dorados, radios por resultado y destellos -->
      <g v-if="faseCompletada" class="pointer-events-none">
        <!-- Anillo exterior: verde = victorias, rojo = derrotas -->
        <circle cx="270" cy="270" r="238" fill="none" stroke="#1e293b" stroke-width="6" />
        <circle
          cx="270"
          cy="270"
          r="238"
          fill="none"
          stroke="#ef4444"
          stroke-opacity="0.75"
          stroke-width="6"
          pathLength="100"
          :stroke-dasharray="`${100 - efectividad} 100`"
          :stroke-dashoffset="-efectividad"
          transform="rotate(-90 270 270)"
          class="anillo-efectividad"
        />
        <circle
          cx="270"
          cy="270"
          r="238"
          fill="none"
          stroke="#10b981"
          stroke-width="6"
          stroke-linecap="round"
          pathLength="100"
          :stroke-dasharray="`${efectividad} 100`"
          transform="rotate(-90 270 270)"
          class="anillo-efectividad drop-shadow-[0_0_6px_rgba(16,185,129,0.7)]"
        />

        <!-- Cometa dorado recorriendo la órbita -->
        <g class="cometa-orbita">
          <circle cx="270" cy="32" r="9" fill="#fbbf24" fill-opacity="0.25" />
          <circle cx="270" cy="32" r="4" fill="#fde68a" class="drop-shadow-[0_0_6px_rgba(251,191,36,1)]" />
        </g>

        <!-- Radios del centro a cada rival, coloreados por resultado -->
        <line
          v-for="(item, idx) in posicionesRivales"
          :key="'radio-' + idx"
          x1="270"
          y1="270"
          :x2="item.x"
          :y2="item.y"
          :stroke="obtenerColorBorde(item.burbuja)"
          stroke-opacity="0.28"
          stroke-width="1.5"
          stroke-dasharray="3 5"
          class="radio-resultado"
          :style="{ animationDelay: `${idx * 60}ms` }"
        />

        <!-- Rayos dorados detrás del jugador central -->
        <g class="rayos-fase">
          <line
            v-for="i in 24"
            :key="'rayo-' + i"
            x1="270"
            y1="190"
            x2="270"
            :y2="i % 2 === 0 ? 150 : 165"
            stroke="#fbbf24"
            :stroke-opacity="i % 2 === 0 ? 0.55 : 0.3"
            stroke-width="2"
            stroke-linecap="round"
            :transform="`rotate(${i * 15} 270 270)`"
          />
        </g>

        <!-- Destellos -->
        <path
          v-for="(d, idx) in destellos"
          :key="'destello-' + idx"
          :d="`M 0 ${-d.s} Q 0 0 ${d.s} 0 Q 0 0 0 ${d.s} Q 0 0 ${-d.s} 0 Q 0 0 0 ${-d.s} Z`"
          :transform="`translate(${d.x} ${d.y})`"
          fill="#fde68a"
          class="destello"
          :style="{ animationDelay: `${d.delay}s` }"
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
        <g>
          <!-- Sombra base -->
          <circle
            :r="radioBurbuja + 2"
            fill="#000000"
            fill-opacity="0.35"
            class="filter drop-shadow-[0_12px_18px_rgba(0,0,0,0.4)] transition-transform duration-300 group-hover:scale-105"
          />

          <!-- Fondo del Rival: Avatar con foto/preset si existe, o gradiente dinámico con iniciales -->
          <image
            v-if="item.burbuja.jugador.fotoUrl"
            :href="item.burbuja.jugador.fotoUrl"
            :x="-radioBurbuja"
            :y="-radioBurbuja"
            :width="radioBurbuja * 2"
            :height="radioBurbuja * 2"
            preserveAspectRatio="xMidYMid slice"
            :clip-path="`url(#clip-rival-${idx})`"
          />
          <g v-else>
            <circle
              :r="radioBurbuja"
              fill="#1e293b"
            />
            <text
              x="0"
              :y="radioBurbuja > 24 ? -6 : 0"
              text-anchor="middle"
              dominant-baseline="middle"
              fill="#ffffff"
              :class="[
                'font-black tracking-wider uppercase pointer-events-none select-none drop-shadow-xs',
                radioBurbuja > 30 ? 'text-sm' : radioBurbuja > 22 ? 'text-xs' : 'text-[9px]'
              ]"
            >
              {{ item.burbuja.jugador.iniciales }}
            </text>
          </g>

          <!-- Halo exterior para victorias y derrotas -->
          <circle
            v-if="estadoVisual(item.burbuja) === 'ganado' || estadoVisual(item.burbuja) === 'perdido'"
            :r="radioBurbuja + 5"
            fill="none"
            :stroke="obtenerColorBorde(item.burbuja)"
            stroke-width="1.5"
            stroke-opacity="0.55"
            class="pointer-events-none"
          />

          <!-- Borde exterior de estado reglamentario (punteado si aún no se juega) -->
          <circle
            :r="radioBurbuja"
            fill="none"
            :stroke="obtenerColorBorde(item.burbuja)"
            :stroke-width="obtenerGrosorBorde(item.burbuja)"
            :stroke-dasharray="estadoVisual(item.burbuja) === 'pendiente' ? '5 4' : undefined"
            class="transition-all duration-300 group-hover:stroke-width-[5px]"
          />

          <!-- Insignia con ícono: ✓ victoria, ✕ derrota, ! pendiente de admin -->
          <g
            v-if="['ganado', 'perdido', 'admin'].includes(estadoVisual(item.burbuja))"
            :transform="`translate(${badgeOffset}, ${-badgeOffset})`"
            class="pointer-events-none"
          >
            <circle
              :r="badgeRadio"
              :fill="colorEstado[estadoVisual(item.burbuja)]"
              stroke="#0f172a"
              stroke-width="2"
            />
            <path
              v-if="estadoVisual(item.burbuja) === 'ganado'"
              :d="iconoCheck"
              fill="none"
              stroke="#ffffff"
              :stroke-width="trazoIcono"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              v-else-if="estadoVisual(item.burbuja) === 'perdido'"
              :d="iconoX"
              fill="none"
              stroke="#ffffff"
              :stroke-width="trazoIcono"
              stroke-linecap="round"
            />
            <text
              v-else
              x="0"
              y="1"
              text-anchor="middle"
              dominant-baseline="middle"
              fill="#ffffff"
              :font-size="badgeRadio * 1.4"
              font-weight="900"
            >!</text>
          </g>

          <!-- Etiqueta de Nombre del Rival -->
          <g v-if="radioBurbuja > 24">
            <rect
              x="-35"
              y="5"
              width="70"
              height="14"
              rx="4"
              fill="#0f172a"
              fill-opacity="0.85"
            />
            <text
              x="0"
              y="12"
              text-anchor="middle"
              dominant-baseline="middle"
              fill="#ffffff"
              class="text-[9px] font-bold pointer-events-none select-none"
            >
              {{ formatearNombre(item.burbuja.jugador.nombre) }}
            </text>
          </g>
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

        <!-- Foto del Jugador Central con Clip circular -->
        <image
          v-if="jugadorCentroFoto"
          :href="jugadorCentroFoto"
          x="-58"
          y="-58"
          width="116"
          height="116"
          preserveAspectRatio="xMidYMid slice"
          clip-path="url(#clip-centro)"
        />

        <!-- Sin foto: estilo clásico oscuro con iniciales y rótulo -->
        <g v-else>
          <circle
            r="58"
            :fill="esVistaRival ? 'url(#centro-rival-gradiente)' : 'url(#centro-gradiente)'"
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

        <!-- Anillo exterior de la burbuja central -->
        <circle
          r="58"
          fill="none"
          :stroke="esVistaRival ? '#38bdf8' : '#10b981'"
          stroke-width="4"
          class="drop-shadow-lg"
        />

        <!-- Pastilla de TÚ / Vista Rival (solo sobre foto) -->
        <rect
          v-if="jugadorCentroFoto"
          x="-45"
          y="18"
          width="90"
          height="22"
          rx="11"
          fill="#0f172a"
          fill-opacity="0.85"
          stroke="rgba(255,255,255,0.2)"
          stroke-width="1"
        />
        <text
          v-if="jugadorCentroFoto"
          x="0"
          y="29"
          text-anchor="middle"
          dominant-baseline="middle"
          :fill="esVistaRival ? '#38bdf8' : '#34d399'"
          class="text-[9px] font-black uppercase tracking-wider"
        >
          {{ esVistaRival ? formatearNombre(jugadorCentro.nombre) : 'TÚ' }}
        </text>

        <!-- Fase de grupos terminada: halo dorado, trofeo y cinta -->
        <g v-if="faseCompletada" class="pointer-events-none">
          <circle
            r="70"
            fill="none"
            stroke="#fbbf24"
            stroke-width="2"
            stroke-dasharray="4 7"
            stroke-linecap="round"
            class="halo-fase-completa"
          />
          <circle r="64" fill="none" stroke="#fbbf24" stroke-opacity="0.35" stroke-width="1.5" />

          <g transform="translate(0, -64)">
            <circle r="15" fill="#0f172a" stroke="url(#fase-completa-gradiente)" stroke-width="2.5" />
            <path
              d="M -6 -7 H 6 V -2 A 6 6 0 0 1 -6 -2 Z M -6 -5 H -9 A 3 3 0 0 0 -6 0 M 6 -5 H 9 A 3 3 0 0 1 6 0 M 0 4 V 7 M -4 8 H 4"
              fill="none"
              stroke="#fcd34d"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>

          <g transform="translate(0, 76)">
            <rect x="-66" y="-11" width="132" height="22" rx="11" fill="url(#fase-completa-gradiente)" />
            <text
              x="0"
              y="1"
              text-anchor="middle"
              dominant-baseline="middle"
              fill="#422006"
              class="text-[9.5px] font-black uppercase tracking-wider"
            >
              Fase 1 completada
            </text>
          </g>

          <!-- Mini marcador del balance final -->
          <g transform="translate(0, 101)">
            <rect x="-50" y="-9" width="100" height="18" rx="9" fill="#0f172a" fill-opacity="0.9" stroke="#334155" stroke-width="1" />
            <text x="-24" y="1" text-anchor="middle" dominant-baseline="middle" fill="#34d399" class="text-[9px] font-black">
              {{ resumen.ganado }}G
            </text>
            <text x="0" y="1" text-anchor="middle" dominant-baseline="middle" fill="#f87171" class="text-[9px] font-black">
              {{ resumen.perdido }}P
            </text>
            <text x="27" y="1" text-anchor="middle" dominant-baseline="middle" fill="#fcd34d" class="text-[9px] font-black">
              {{ efectividad }}%
            </text>
          </g>
        </g>
      </g>
    </svg>
  </div>

    <!-- Leyenda con conteo: deja claro cuántos partidos se ganaron y se perdieron -->
    <div
      v-if="rivales.length"
      class="mt-2 flex flex-wrap items-center justify-center gap-2 text-[11px] font-bold select-none"
    >
      <span class="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/40 bg-emerald-500/15 px-2.5 py-1 text-emerald-300">
        <span class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500 text-[10px] leading-none text-white">✓</span>
        Ganados {{ resumen.ganado }}
      </span>
      <span class="inline-flex items-center gap-1.5 rounded-full border border-red-500/40 bg-red-500/15 px-2.5 py-1 text-red-300">
        <span class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] leading-none text-white">✕</span>
        Perdidos {{ resumen.perdido }}
      </span>
      <span
        v-if="!faseCompletada"
        class="inline-flex items-center gap-1.5 rounded-full border border-slate-500/40 bg-slate-500/15 px-2.5 py-1 text-slate-300"
      >
        <span class="h-3.5 w-3.5 rounded-full border-2 border-dashed border-slate-400"></span>
        Por jugar {{ resumen.pendiente }}
      </span>
    </div>

    <!-- Mensaje de cierre cuando ya no quedan partidos por jugar -->
    <div
      v-if="faseCompletada"
      class="mt-3 mx-auto flex max-w-sm items-center gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-4 py-3 text-left select-none"
    >
      <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-amber-400 text-lg leading-none">🏆</span>
      <div class="min-w-0">
        <p class="text-[13px] font-extrabold text-amber-700 dark:text-amber-300">
          {{ esVistaRival ? `${formatearNombre(jugadorCentro.nombre)} terminó la primera fase` : '¡Has finalizado la primera fase!' }}
        </p>
        <p class="text-[11px] font-medium text-slate-600 dark:text-slate-400">
          {{ resumen.ganado + resumen.perdido }} partidos jugados ·
          {{ resumen.ganado }} {{ resumen.ganado === 1 ? 'victoria' : 'victorias' }}.
          Revisa la tabla de posiciones para ver la clasificación.
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { BurbujaRival, JugadorTorneo, Torneo } from '@/types'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()

const props = defineProps<{
  torneo: Torneo
  jugadorCentro: JugadorTorneo
  rivales: BurbujaRival[]
  esVistaRival: boolean
}>()

const jugadorCentroFoto = computed(() => {
  return (
    props.jugadorCentro.fotoUrl ||
    (props.jugadorCentro.esUsuarioActual ? authStore.usuario?.fotoUrl : undefined)
  )
})

const emit = defineEmits<{
  (e: 'seleccionar-rival', rival: BurbujaRival): void
  (e: 'seleccionar-enfrentamiento-rival', rival: BurbujaRival): void
}>()

const tieneLuzAzulActiva = computed(() => {
  return props.torneo.estado === 'en curso' && !faseCompletada.value
})

/** El jugador central ya disputó todos sus partidos de la fase de grupos. */
const faseCompletada = computed(() => {
  return props.rivales.length > 0 && resumen.value.pendiente === 0
})

/** Porcentaje de victorias sobre partidos jugados (0-100). */
const efectividad = computed(() => {
  const jugados = resumen.value.ganado + resumen.value.perdido
  return jugados ? Math.round((resumen.value.ganado / jugados) * 100) : 0
})

/** Destellos fijos repartidos entre el centro y la órbita de rivales. */
const destellos = [
  { x: 178, y: 178, s: 6, delay: 0 },
  { x: 362, y: 193, s: 5, delay: 0.7 },
  { x: 397, y: 316, s: 7, delay: 1.4 },
  { x: 153, y: 313, s: 5, delay: 2.1 },
  { x: 258, y: 409, s: 5, delay: 0.4 },
  { x: 246, y: 132, s: 4, delay: 1.8 },
  { x: 327, y: 370, s: 4, delay: 1.1 },
  { x: 143, y: 224, s: 4, delay: 2.5 },
  { x: 408, y: 246, s: 4, delay: 0.9 },
]

const radioBurbuja = computed(() => {
  const n = props.rivales.length
  if (n <= 6) return 38
  if (n <= 10) return 32
  if (n <= 16) return 26
  if (n <= 24) return 20
  return 16
})

const conoPolygonPoints = computed(() => {
  const r = radioBurbuja.value
  // La cima del cono es una línea recta horizontal que sobrepasa y envuelve toda la bola sin cortarla a la mitad
  const yTop = Math.max(10, 75 - r - 12)
  const halfWidthTop = Math.max(46, r + 20)
  const halfWidthBottom = 20
  const xLeftBottom = 270 - halfWidthBottom
  const xRightBottom = 270 + halfWidthBottom
  const xLeftTop = 270 - halfWidthTop
  const xRightTop = 270 + halfWidthTop

  return `${xLeftBottom},270 ${xRightBottom},270 ${xRightTop},${yTop} ${xLeftTop},${yTop}`
})

const badgeOffset = computed(() => {
  const r = radioBurbuja.value
  return Math.round(r * 0.7)
})

const badgeRadio = computed(() => {
  const r = radioBurbuja.value
  return Math.max(8, Math.round(r * 0.34))
})

/** Íconos de la insignia, escalados al radio para que se lean en cualquier tamaño de rueda. */
const iconoCheck = computed(() => {
  const s = badgeRadio.value * 0.5
  return `M ${-s} 0 L ${-s * 0.25} ${s * 0.75} L ${s} ${-s * 0.7}`
})
const iconoX = computed(() => {
  const s = badgeRadio.value * 0.42
  return `M ${-s} ${-s} L ${s} ${s} M ${s} ${-s} L ${-s} ${s}`
})
const trazoIcono = computed(() => Math.max(2, badgeRadio.value * 0.28))

type EstadoVisual = 'ganado' | 'perdido' | 'admin' | 'turno' | 'pendiente'

const colorEstado: Record<EstadoVisual, string> = {
  ganado: '#10b981',
  perdido: '#ef4444',
  admin: '#f97316',
  turno: '#38bdf8',
  pendiente: '#64748b',
}

/** Estado único de cada burbuja: decide color, velo, línea punteada e insignia. */
const estadoVisual = (burbuja: BurbujaRival): EstadoVisual => {
  if (burbuja.resultadoParaCentro === 'ganado' || burbuja.colorBorde === 'verde') return 'ganado'
  if (burbuja.resultadoParaCentro === 'perdido' || burbuja.colorBorde === 'rojo') return 'perdido'
  if (props.torneo.estado === 'por iniciar') return 'pendiente'
  if (burbuja.colorBorde === 'naranja' || burbuja.partido?.estado === 'pendiente_admin') return 'admin'
  if (burbuja.colorBorde === 'azul_pulsante' || esRivalDeTurnoActivo(burbuja)) return 'turno'
  return 'pendiente'
}

/** Conteo para la leyenda bajo la rueda. */
const resumen = computed(() => {
  const conteo = { ganado: 0, perdido: 0, pendiente: 0 }
  for (const b of props.rivales) {
    const e = estadoVisual(b)
    if (e === 'ganado') conteo.ganado++
    else if (e === 'perdido') conteo.perdido++
    else conteo.pendiente++
  }
  return conteo
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

const esRivalDeTurnoActivo = (burbuja: BurbujaRival): boolean => {
  return (
    props.torneo.estado === 'en curso' &&
    burbuja.esRivalDeTurno &&
    burbuja.partido?.estado !== 'jugado' &&
    burbuja.resultadoParaCentro === 'pendiente'
  )
}

const obtenerColorBorde = (burbuja: BurbujaRival): string => colorEstado[estadoVisual(burbuja)]

const obtenerGrosorBorde = (burbuja: BurbujaRival): string => {
  const estado = estadoVisual(burbuja)
  if (estado === 'turno' || estado === 'ganado' || estado === 'perdido') return '4.5'
  return '3'
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
.halo-fase-completa {
  transform-box: fill-box;
  transform-origin: center;
  animation: girar-halo 18s linear infinite;
}

@keyframes girar-halo {
  to {
    transform: rotate(360deg);
  }
}

.rayos-fase,
.cometa-orbita {
  transform-box: view-box;
  transform-origin: 270px 270px;
}

.rayos-fase {
  animation: girar-halo 40s linear infinite reverse;
}

.cometa-orbita {
  animation: girar-halo 9s linear infinite;
}

.anillo-efectividad {
  animation: llenar-anillo 1.4s ease-out both;
}

@keyframes llenar-anillo {
  from {
    stroke-dasharray: 0 100;
  }
}

.radio-resultado {
  animation: aparecer-radio 0.6s ease-out both;
}

@keyframes aparecer-radio {
  from {
    opacity: 0;
  }
}

.destello {
  transform-box: fill-box;
  transform-origin: center;
  animation: titilar 2.8s ease-in-out infinite;
}

@keyframes titilar {
  0%,
  100% {
    opacity: 0;
    scale: 0.4;
  }
  50% {
    opacity: 0.9;
    scale: 1;
  }
}

@media (prefers-reduced-motion: reduce) {
  .halo-fase-completa,
  .rayos-fase,
  .cometa-orbita,
  .anillo-efectividad,
  .radio-resultado,
  .destello {
    animation: none;
  }
}
</style>

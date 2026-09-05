<template>
  <div class="flex flex-col gap-5 w-full">
    <!-- BARRA SUPERIOR DE CONTROL Y MODOS DE VISUALIZACIÓN -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 backdrop-blur-md shadow-xl">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-amber-400/20 border border-amber-400/40 text-amber-300 flex items-center justify-center shadow-[0_0_20px_rgba(251,191,36,0.3)]">
          <Crown class="w-5 h-5" />
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h3 class="text-sm sm:text-base font-black text-white tracking-tight">
              Playoffs en Círculos Concéntricos
            </h3>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400/20 text-amber-300 border border-amber-400/30">
              Fase 2
            </span>
          </div>
          <p class="text-xs text-slate-400">
            Eliminación directa adaptativa • El ganador se lleva el 100% de la bolsa
          </p>
        </div>
      </div>

      <!-- Conmutador de Modos: Mi Camino vs Cuadro Completo -->
      <div class="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800 shrink-0">
        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
            modoVista === 'mi-camino'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          ]"
          @click="modoVista = 'mi-camino'"
        >
          <Compass class="w-3.5 h-3.5" />
          <span>Mi Camino</span>
        </button>

        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
            modoVista === 'completo'
              ? 'bg-amber-500 text-slate-950 shadow-md'
              : 'text-slate-400 hover:text-white'
          ]"
          @click="modoVista = 'completo'"
        >
          <Sparkles class="w-3.5 h-3.5" />
          <span>Cuadro Completo</span>
        </button>
      </div>
    </div>

    <!-- ARENA VISUAL CONCÉNTRICA (SVG ORBITAL) -->
    <div class="relative w-full rounded-3xl bg-slate-950 border border-slate-800/80 p-4 sm:p-8 flex flex-col items-center justify-center overflow-hidden shadow-2xl min-h-140 sm:min-h-170">
      <!-- Fondo con gradiente radial y malla sutil -->
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(30,58,138,0.25)_0%,rgba(2,6,23,0.98)_70%)] pointer-events-none" />

      <!-- SVG con los 3 Anillos Concéntricos -->
      <svg
        viewBox="0 0 800 800"
        class="w-full max-w-170 aspect-square relative z-10 select-none overflow-visible"
      >
        <defs>
          <!-- Gradiente de la Corona Central -->
          <radialGradient id="nucleoCorona" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stop-color="#fef08a" stop-opacity="1" />
            <stop offset="50%" stop-color="#eab308" stop-opacity="0.9" />
            <stop offset="100%" stop-color="#854d0e" stop-opacity="0.9" />
          </radialGradient>

          <!-- Filtro de resplandor dorado para la corona -->
          <filter id="resplandorCorona" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="16" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <!-- Filtro de halo orbital -->
          <filter id="haloAzul" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        <!-- ============================================== -->
        <!-- ANILLO 3 (EXTERIOR): PLAY-IN (RADIO 330px) -->
        <!-- ============================================== -->
        <circle
          cx="400"
          cy="400"
          r="330"
          fill="none"
          stroke="#334155"
          stroke-width="1.5"
          stroke-dasharray="6 6"
          class="opacity-60"
        />

        <!-- ============================================== -->
        <!-- ANILLO 2 (MEDIO): CUARTOS Y SEMIS (RADIO 220px) -->
        <!-- ============================================== -->
        <circle
          cx="400"
          cy="400"
          r="220"
          fill="none"
          stroke="#38bdf8"
          stroke-width="2"
          stroke-dasharray="8 8"
          class="opacity-70 animate-pulse"
        />

        <!-- ============================================== -->
        <!-- ANILLO 1 (INTERIOR): FINALISTAS (RADIO 115px) -->
        <!-- ============================================== -->
        <circle
          cx="400"
          cy="400"
          r="115"
          fill="none"
          stroke="#fbbf24"
          stroke-width="2.5"
          class="opacity-80"
        />

        <!-- LÍNEAS CONECTORAS LUMINOSAS HACIA EL CENTRO -->
        <g class="opacity-30">
          <line x1="400" y1="70" x2="400" y2="180" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 4" />
          <line x1="730" y1="400" x2="620" y2="400" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 4" />
          <line x1="400" y1="730" x2="400" y2="620" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 4" />
          <line x1="70" y1="400" x2="180" y2="400" stroke="#38bdf8" stroke-width="2" stroke-dasharray="4 4" />
        </g>

        <!-- ============================================== -->
        <!-- NÚCLEO: LA CORONA DEL CAMPEÓN Y BOLSA -->
        <!-- ============================================== -->
        <g
          transform="translate(400, 400)"
          class="cursor-pointer group"
          @click="handleDetalleCorona"
        >
          <!-- Resplandor pulsante -->
          <circle
            r="60"
            fill="#eab308"
            fill-opacity="0.18"
            filter="url(#resplandorCorona)"
            class="animate-pulse"
          />

          <circle
            r="48"
            fill="url(#nucleoCorona)"
            stroke="#ffffff"
            stroke-width="3"
            class="drop-shadow-2xl transition-transform duration-300 group-hover:scale-110"
          />

          <!-- Ícono de Corona Central -->
          <path
            d="M -16 6 L -20 -12 L -6 -2 L 0 -16 L 6 -2 L 20 -12 L 16 6 Z"
            fill="#78350f"
            stroke="#ffffff"
            stroke-width="2"
            stroke-linejoin="round"
          />

          <!-- Texto de premio acumulado -->
          <text
            x="0"
            y="18"
            text-anchor="middle"
            fill="#ffffff"
            class="text-[10px] font-black font-mono tracking-tight drop-shadow-md select-none"
          >
            $90.000
          </text>
        </g>

        <!-- ============================================== -->
        <!-- NODOS ANILLO 1 (FINALISTAS - RADIO 115) -->
        <!-- ============================================== -->
        <g
          v-for="(jugador, fIdx) in finalistasVisuales"
          :key="'finalista-' + fIdx"
          :transform="`translate(${jugador.x}, ${jugador.y})`"
          class="cursor-pointer group"
          @click="abrirDetallePartido(playoffs.granFinal.value)"
        >
          <circle
            r="28"
            :fill="jugador.esUsuario ? '#10b981' : '#0f172a'"
            :stroke="jugador.esUsuario ? '#34d399' : '#fbbf24'"
            stroke-width="3"
            class="transition-transform group-hover:scale-110 drop-shadow-lg"
          />
          <text
            x="0"
            y="-4"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="#ffffff"
            class="text-xs font-black select-none"
          >
            {{ jugador.iniciales }}
          </text>
          <text
            x="0"
            y="10"
            text-anchor="middle"
            fill="#fbbf24"
            class="text-[8px] font-extrabold uppercase select-none"
          >
            Final
          </text>
        </g>

        <!-- ============================================== -->
        <!-- NODOS ANILLO 2 (CUARTOS Y SEMIS - RADIO 220) -->
        <!-- ============================================== -->
        <g
          v-for="(nodo, qIdx) in nodosCuartosVisuales"
          :key="'cuartos-' + qIdx"
          :transform="`translate(${nodo.x}, ${nodo.y})`"
          :class="[
            'cursor-pointer group transition-opacity duration-300',
            modoVista === 'mi-camino' && !nodo.esDeMiCamino ? 'opacity-30' : 'opacity-100'
          ]"
          @click="abrirDetallePartido(nodo.partido)"
        >
          <circle
            r="26"
            :fill="nodo.esUsuario ? '#047857' : '#1e293b'"
            :stroke="nodo.esTop4 ? '#38bdf8' : '#64748b'"
            :stroke-width="nodo.esTop4 ? '3.5' : '2'"
            class="transition-transform group-hover:scale-110 drop-shadow-md"
          />
          <text
            x="0"
            y="-4"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="#ffffff"
            class="text-[11px] font-black select-none"
          >
            {{ nodo.iniciales }}
          </text>
          <text
            x="0"
            y="10"
            text-anchor="middle"
            :fill="nodo.esTop4 ? '#38bdf8' : '#94a3b8'"
            class="text-[7px] font-bold uppercase select-none"
          >
            {{ nodo.esTop4 ? 'Top 4' : 'Cuartos' }}
          </text>
        </g>

        <!-- ============================================== -->
        <!-- NODOS ANILLO 3 (PLAY-IN EXTERIOR - RADIO 330) -->
        <!-- ============================================== -->
        <g
          v-for="(nodo, pIdx) in nodosPlayInVisuales"
          :key="'playin-' + pIdx"
          :transform="`translate(${nodo.x}, ${nodo.y})`"
          :class="[
            'cursor-pointer group transition-opacity duration-300',
            modoVista === 'mi-camino' && !nodo.esDeMiCamino ? 'opacity-25' : 'opacity-100'
          ]"
          @click="abrirDetallePartido(nodo.partido)"
        >
          <circle
            r="23"
            :fill="nodo.esUsuario ? '#047857' : '#0f172a'"
            :stroke="nodo.colorBorde"
            stroke-width="2.5"
            class="transition-transform group-hover:scale-110 drop-shadow-sm"
          />
          <text
            x="0"
            y="-3"
            text-anchor="middle"
            dominant-baseline="middle"
            fill="#ffffff"
            class="text-[10px] font-black select-none"
          >
            {{ nodo.iniciales }}
          </text>
          <text
            x="0"
            y="9"
            text-anchor="middle"
            fill="#94a3b8"
            class="text-[7px] font-bold select-none"
          >
            {{ nodo.puestoLabel }}
          </text>
        </g>
      </svg>

      <!-- LEYENDA PEDAGÓGICA DE LOS 3 ANILLOS -->
      <div class="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-2 w-full max-w-xl z-20">
        <div class="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-center">
          <span class="text-[10px] font-black text-slate-400 uppercase block">Anillo 3 (Exterior)</span>
          <span class="text-xs font-bold text-white">Play-in (Puestos 5 al 12)</span>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-900/80 border border-sky-500/30 text-center">
          <span class="text-[10px] font-black text-sky-400 uppercase block">Anillo 2 (Medio)</span>
          <span class="text-xs font-bold text-white">Cuartos (Top 1-4 BYE) & Semis</span>
        </div>
        <div class="p-2.5 rounded-xl bg-slate-900/80 border border-amber-500/40 text-center shadow-[0_0_15px_rgba(251,191,36,0.15)]">
          <span class="text-[10px] font-black text-amber-400 uppercase block">Anillo 1 (El Núcleo)</span>
          <span class="text-xs font-bold text-amber-300">Gran Final • 👑 Corona</span>
        </div>
      </div>
    </div>

    <!-- MODAL DE DETALLE DEL PARTIDO DE PLAYOFF -->
    <Modal
      ref="modalPlayoffRef"
      title="Partido de Eliminatoria"
      :sub-title="partidoSeleccionado ? `Ronda: ${formatearRonda(partidoSeleccionado.ronda)}` : ''"
      width="md"
      :footer="false"
    >
      <div v-if="partidoSeleccionado" class="space-y-4 py-1">
        <!-- Enfrentamiento de jugadores -->
        <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          <!-- Jugador 1 -->
          <div class="flex flex-col items-center text-center gap-1.5 min-w-0">
            <div class="w-12 h-12 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center shadow-sm">
              {{ partidoSeleccionado.jugador1?.iniciales || '?' }}
            </div>
            <span class="text-xs font-black text-slate-800 truncate w-full">
              {{ partidoSeleccionado.jugador1?.nombre || 'Por definir' }}
            </span>
            <span v-if="partidoSeleccionado.esBye" class="text-[9px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">
              Clasificado con BYE
            </span>
          </div>

          <!-- VS / Marcador -->
          <div class="flex flex-col items-center justify-center px-2">
            <span v-if="partidoSeleccionado.marcador" class="text-2xl font-black font-mono text-emerald-600">
              {{ partidoSeleccionado.marcador }}
            </span>
            <span v-else class="text-xs font-black text-slate-400 uppercase">
              VS
            </span>
            <span class="text-[9px] font-bold text-slate-400 uppercase mt-1">
              {{ partidoSeleccionado.estado === 'jugado' ? 'Finalizado' : partidoSeleccionado.estado === 'en_curso' ? 'En Vivo' : 'Programado' }}
            </span>
          </div>

          <!-- Jugador 2 -->
          <div class="flex flex-col items-center text-center gap-1.5 min-w-0">
            <div class="w-12 h-12 rounded-full bg-slate-900 text-white font-black text-sm flex items-center justify-center shadow-sm">
              {{ partidoSeleccionado.jugador2?.iniciales || '?' }}
            </div>
            <span class="text-xs font-black text-slate-800 truncate w-full">
              {{ partidoSeleccionado.jugador2?.nombre || 'Por definir' }}
            </span>
          </div>
        </div>

        <!-- Botones de Acción -->
        <div class="flex items-center gap-2 pt-2">
          <Button
            variant="outline"
            size="md"
            class="flex-1 justify-center"
            @click="modalPlayoffRef?.close()"
          >
            Cerrar
          </Button>

          <Button
            v-if="partidoSeleccionado.estado === 'en_curso'"
            variant="emerald"
            size="md"
            class="flex-1 justify-center gap-1.5 font-bold"
            @click="entrarComoEspectador"
          >
            <Radio class="w-4 h-4 text-white animate-pulse" />
            <span>Ver como Espectador</span>
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { Crown, Compass, Sparkles, Radio } from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import { usePlayoffs } from '@/modules/dashboard/composables/usePlayoffs'
import type { FilaPosicion, PartidoPlayoff, RondaPlayoff } from '@/types'

const props = defineProps<{
  filasPosiciones: FilaPosicion[]
}>()

const emit = defineEmits<{
  (e: 'abrir-espectador', partidoId: string): void
}>()

const modoVista = ref<'completo' | 'mi-camino'>('completo')
const modalPlayoffRef = ref<InstanceType<typeof Modal> | null>(null)
const partidoSeleccionado = ref<PartidoPlayoff | null>(null)

const playoffs = usePlayoffs(props.filasPosiciones)

// Coordenadas polares a cartesianas centradas en (400, 400)
const calcPos = (radio: number, anguloGrados: number) => {
  const rad = ((anguloGrados - 90) * Math.PI) / 180
  return {
    x: Math.round(400 + radio * Math.cos(rad)),
    y: Math.round(400 + radio * Math.sin(rad)),
  }
}

// Finalistas en Anillo 1 (Radio 115px)
const finalistasVisuales = computed(() => {
  const final = playoffs.granFinal.value
  const p1 = calcPos(115, 270) // Lado izquierdo
  const p2 = calcPos(115, 90)  // Lado derecho

  return [
    {
      ...p1,
      iniciales: final.jugador1?.iniciales || 'F1',
      esUsuario: final.jugador1?.esUsuarioActual,
    },
    {
      ...p2,
      iniciales: final.jugador2?.iniciales || 'F2',
      esUsuario: final.jugador2?.esUsuarioActual,
    },
  ]
})

// Cuartos y Semis en Anillo 2 (Radio 220px, 8 nodos equidistantes a 45 grados)
const nodosCuartosVisuales = computed(() => {
  const cuartos = playoffs.partidosCuartos.value
  const angulos = [0, 45, 90, 135, 180, 225, 270, 315]

  return angulos.map((ang, idx) => {
    const coords = calcPos(220, ang)
    const pIndex = Math.floor(idx / 2)
    const partido = cuartos[pIndex] || cuartos[0]
    const esPrimerJugador = idx % 2 === 0
    const jugador = esPrimerJugador ? partido?.jugador1 : partido?.jugador2

    const esTop4 = esPrimerJugador // El primer jugador de cuartos es el top 1-4 con BYE
    const esDeMiCamino = partido?.jugador1?.esUsuarioActual || partido?.jugador2?.esUsuarioActual

    return {
      ...coords,
      iniciales: jugador?.iniciales || (esTop4 ? `T${pIndex + 1}` : `G${pIndex + 1}`),
      esTop4,
      esUsuario: jugador?.esUsuarioActual,
      esDeMiCamino,
      partido,
    }
  })
})

// Play-in en Anillo 3 (Radio 330px, 8 nodos en 4 parejas)
const nodosPlayInVisuales = computed(() => {
  const playIn = playoffs.partidosPlayIn.value
  // 8 ángulos agrupados
  const angulos = [20, 70, 110, 160, 200, 250, 290, 340]

  return angulos.map((ang, idx) => {
    const coords = calcPos(330, ang)
    const pIndex = Math.floor(idx / 2)
    const partido = playIn[pIndex] || playIn[0]
    const esPrimerJugador = idx % 2 === 0
    const jugador = esPrimerJugador ? partido?.jugador1 : partido?.jugador2

    const puestoNum = 5 + idx
    const esDeMiCamino = partido?.jugador1?.esUsuarioActual || partido?.jugador2?.esUsuarioActual

    let colorBorde = '#64748b'
    if (partido?.estado === 'jugado') {
      colorBorde = partido.ganadorId === jugador?.id ? '#10b981' : '#ef4444'
    } else if (partido?.estado === 'en_curso') {
      colorBorde = '#38bdf8'
    }

    return {
      ...coords,
      iniciales: jugador?.iniciales || `P${puestoNum}`,
      puestoLabel: `${puestoNum}°`,
      colorBorde,
      esUsuario: jugador?.esUsuarioActual,
      esDeMiCamino,
      partido,
    }
  })
})

const abrirDetallePartido = (partido?: PartidoPlayoff) => {
  if (!partido) return
  partidoSeleccionado.value = partido
  modalPlayoffRef.value?.open()
}

const handleDetalleCorona = () => {
  abrirDetallePartido(playoffs.granFinal.value)
}

const formatearRonda = (ronda: RondaPlayoff): string => {
  switch (ronda) {
    case 'play_in':
      return 'Play-in (Puestos 5 al 12)'
    case 'cuartos':
      return 'Cuartos de Final (Top 4 con BYE)'
    case 'semifinal':
      return 'Semifinal'
    case 'final':
      return 'Gran Final • Por la Corona'
  }
}

const entrarComoEspectador = () => {
  if (!partidoSeleccionado.value) return
  emit('abrir-espectador', partidoSeleccionado.value.id)
  modalPlayoffRef.value?.close()
}
</script>

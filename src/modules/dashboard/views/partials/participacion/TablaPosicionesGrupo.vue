<template>
  <div class="w-full bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors duration-300">
    <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <h3 class="text-base font-extrabold text-slate-900 dark:text-white font-heading">
          Tabla de Posiciones - Fase de Grupos
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Sistema Round Robin (Todos contra todos). 2 pts por victoria, 1 pt por derrota.
        </p>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <span class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-200 dark:border-emerald-800">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Grupo Único
        </span>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
        <thead class="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/60 dark:border-slate-800">
          <tr>
            <th scope="col" class="py-3 px-3 sm:px-4 text-center w-12">#</th>
            <th scope="col" class="py-3 px-4">Jugador</th>
            <th scope="col" class="py-3 px-2 sm:px-3 text-center" title="Partidos Jugados">PJ</th>
            <th scope="col" class="py-3 px-2 sm:px-3 text-center text-emerald-700 dark:text-emerald-400" title="Partidos Ganados">PG</th>
            <th scope="col" class="py-3 px-2 sm:px-3 text-center text-rose-700 dark:text-rose-400" title="Partidos Perdidos">PP</th>
            <th scope="col" class="py-3 px-2 sm:px-3 text-center text-slate-500 dark:text-slate-400" title="Sets a Favor">SF</th>
            <th scope="col" class="py-3 px-2 sm:px-3 text-center text-slate-500 dark:text-slate-400" title="Sets en Contra">SC</th>
            <th scope="col" class="py-3 px-3 sm:px-4 text-center font-black text-slate-800 dark:text-white" title="Puntos Totales">Pts</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
          <tr
            v-for="(fila, index) in posiciones"
            :key="fila.jugadorId"
            :class="[
              'transition-colors',
              fila.esUsuarioActual
                ? 'bg-emerald-50/70 dark:bg-emerald-950/40 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 font-bold text-slate-900 dark:text-white border-l-4 border-l-emerald-600'
                : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
            ]"
          >
            <td class="py-3 px-3 sm:px-4 text-center font-extrabold">
              <span
                :class="[
                  'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black',
                  (fila.posicion || index + 1) === 1 ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-700' :
                  (fila.posicion || index + 1) === 2 ? 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200' :
                  (fila.posicion || index + 1) === 3 ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300' :
                  'text-slate-500 dark:text-slate-400'
                ]"
              >
                {{ fila.posicion || index + 1 }}
              </span>
            </td>

            <!-- Jugador (con Fondito Banner Estilo Discord para quienes tienen Título) -->
            <td class="py-2.5 px-3">
              <!-- Jugador CON BANNER FONDITO DISCORD GAMING -->
              <div
                v-if="tieneBanner(fila)"
                class="relative overflow-hidden rounded-2xl py-2 px-3 sm:px-3.5 flex items-center justify-between gap-3 border shadow-md transition-all duration-300 group hover:scale-[1.01]"
                :class="[
                  esInvicto(fila)
                    ? 'banner-fondito-invicto'
                    : esReyMalla(fila)
                    ? 'banner-fondito-malla'
                    : 'banner-fondito-lucha'
                ]"
              >
                <!-- Acento superior luminoso estilo Discord Nitro (Specular Gloss) -->
                <div class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>

                <!-- Patrón de micro-malla carbon de fondo -->
                <div class="absolute inset-0 banner-texture opacity-15 pointer-events-none"></div>

                <!-- Resplandor dinámico de fondo detrás del avatar -->
                <div
                  class="absolute -left-3 -top-3 w-24 h-24 rounded-full blur-xl pointer-events-none"
                  :class="[
                    esInvicto(fila) ? 'bg-emerald-400/25' : esReyMalla(fila) ? 'bg-amber-400/25' : 'bg-rose-400/25'
                  ]"
                ></div>

                <!-- Marca de agua vectorial de fondo a la derecha -->
                <div class="absolute right-0 top-0 bottom-0 w-28 flex items-center justify-end pr-1 pointer-events-none overflow-hidden">
                  <!-- 1. Escudo para Invicto -->
                  <svg
                    v-if="esInvicto(fila)"
                    class="w-16 h-16 text-emerald-200/15 rotate-6 transform translate-x-1"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                  </svg>

                  <!-- 2. Corona para Rey de la Malla -->
                  <svg
                    v-else-if="esReyMalla(fila)"
                    class="w-16 h-16 text-amber-200/15 -rotate-6 transform translate-x-1"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                  </svg>

                  <!-- 3. Llamas para En la Lucha -->
                  <svg
                    v-else
                    class="w-16 h-16 text-rose-200/15 rotate-6 transform translate-x-1"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.48 12.35c-1.57-.56-2.92-.12-3.83.65-.63-.9-1.63-1.5-2.77-1.5-1.93 0-3.5 1.57-3.5 3.5 0 .63.17 1.22.46 1.73-.78.18-1.52.54-2.14 1.05C6.1 19.06 6 20.89 6 21h12c0-.52-.16-2.61-1.78-4.22.56-.7 1.43-1.15 2.4-1.15.53 0 1.03.14 1.46.38.38-.97.94-2.69-.6-3.66z" />
                  </svg>
                </div>

                <!-- Avatar + Nombre + Discord Status Subtitle -->
                <div class="relative z-10 flex items-center gap-2.5 min-w-0">
                  <!-- Avatar con aro metálico y micro-badge -->
                  <div class="relative shrink-0">
                    <div
                      class="w-7.5 h-7.5 rounded-full text-white font-black text-[10px] flex items-center justify-center shadow-md ring-2"
                      :class="[
                        esInvicto(fila)
                          ? 'bg-gradient-to-br from-emerald-500 to-teal-800 ring-emerald-300/80 shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                          : esReyMalla(fila)
                          ? 'bg-gradient-to-br from-amber-400 to-amber-800 ring-amber-300/80 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                          : 'bg-gradient-to-br from-rose-500 to-rose-900 ring-rose-300/80 shadow-[0_0_8px_rgba(251,113,133,0.4)]'
                      ]"
                    >
                      {{ obtenerIniciales(fila.nombre) }}
                    </div>
                    <!-- Micro badge status en esquina del avatar -->
                    <span
                      class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center text-[7px] text-white shadow-xs border border-slate-950 font-bold"
                      :class="[
                        esInvicto(fila) ? 'bg-emerald-500' : esReyMalla(fila) ? 'bg-amber-500' : 'bg-rose-500'
                      ]"
                    >
                      <span v-if="esInvicto(fila)">✓</span>
                      <span v-else-if="esReyMalla(fila)">👑</span>
                      <span v-else>🔥</span>
                    </span>
                  </div>

                  <div class="flex flex-col min-w-0">
                    <div class="flex items-center gap-1.5 min-w-0">
                      <span class="font-extrabold text-xs truncate text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-tight">
                        {{ fila.nombre }}
                      </span>
                      <span
                        v-if="fila.esUsuarioActual"
                        class="text-[9px] font-black px-1.5 py-0.2 rounded shrink-0 bg-white/25 text-white backdrop-blur-md border border-white/35 shadow-xs"
                      >
                        Tú
                      </span>
                    </div>

                    <!-- Subtítulo estilo Discord Status -->
                    <div class="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold leading-none mt-0.5">
                      <template v-if="esInvicto(fila)">
                        <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        <span class="text-emerald-200/90">{{ fila.pg }}V - 0D · Récord Invicto</span>
                      </template>
                      <template v-else-if="esReyMalla(fila)">
                        <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                        <span class="text-amber-200/90">{{ fila.mallas || maxMallasTorneo }} mallas · Rey de la Red</span>
                      </template>
                      <template v-else>
                        <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                        <span class="text-rose-200/90">{{ fila.pp }}D · En pie de lucha</span>
                      </template>
                    </div>
                  </div>
                </div>

                <!-- Insignia lateral Discord Badge Chip -->
                <div class="relative z-10 flex items-center shrink-0 pl-1.5">
                  <div
                    v-if="esInvicto(fila)"
                    class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/85 text-emerald-300 border border-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.35)] backdrop-blur-md"
                    title="¡Invicto! Ninguna derrota registrada en el torneo"
                  >
                    <span class="text-xs">🛡️</span>
                    <span>Invicto</span>
                  </div>

                  <div
                    v-else-if="esReyMalla(fila)"
                    class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/85 text-amber-300 border border-amber-400/80 shadow-[0_0_10px_rgba(245,158,11,0.35)] backdrop-blur-md"
                    :title="`¡Rey de la Malla! Máximo anotador con toque de red (${fila.mallas || maxMallasTorneo})`"
                  >
                    <span class="text-xs">👑</span>
                    <span>Rey Malla ({{ fila.mallas || maxMallasTorneo }})</span>
                  </div>

                  <div
                    v-else-if="esEnLucha(fila)"
                    class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/85 text-rose-300 border border-rose-400/80 shadow-[0_0_10px_rgba(244,63,94,0.35)] backdrop-blur-md"
                    title="Buscando su primera victoria: ¡Va con todo por la remontada!"
                  >
                    <span class="text-xs">🥊</span>
                    <span>En la Lucha</span>
                  </div>
                </div>
              </div>

              <!-- Jugador REGULAR (Sin banner fondito) -->
              <div v-else class="flex items-center gap-2.5 py-1 px-1">
                <div class="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                  {{ obtenerIniciales(fila.nombre) }}
                </div>
                <div class="flex items-center gap-1.5 min-w-0">
                  <span class="font-bold text-slate-900 dark:text-white truncate text-xs">{{ fila.nombre }}</span>
                  <span
                    v-if="fila.esUsuarioActual"
                    class="text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 bg-emerald-600 text-white"
                  >
                    Tú
                  </span>
                </div>
              </div>
            </td>

            <td class="py-3 px-2 sm:px-3 text-center font-mono">{{ fila.pj }}</td>
            <td class="py-3 px-2 sm:px-3 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400">{{ fila.pg }}</td>
            <td class="py-3 px-2 sm:px-3 text-center font-mono font-bold text-rose-700 dark:text-rose-400">{{ fila.pp }}</td>
            <td class="py-3 px-2 sm:px-3 text-center font-mono text-slate-500 dark:text-slate-400">{{ fila.sf }}</td>
            <td class="py-3 px-2 sm:px-3 text-center font-mono text-slate-500 dark:text-slate-400">{{ fila.sc }}</td>
            <td class="py-3 px-3 sm:px-4 text-center font-mono font-black text-sm text-slate-900 dark:text-white bg-slate-50/50 dark:bg-slate-900/40">
              {{ fila.puntos }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FilaPosicion } from '@/types'

const props = defineProps<{
  posiciones: FilaPosicion[]
}>()

const maxMallasTorneo = computed(() => {
  let max = 0
  props.posiciones.forEach((p) => {
    const m = p.mallas || 0
    if (m > max) max = m
  })
  return max
})

const maxPJTorneo = computed(() => {
  let max = 0
  props.posiciones.forEach((p) => {
    if (p.pj > max) max = p.pj
  })
  return max
})

// Mínimo de partidos para calificar a Invicto o En la Lucha:
// Si alguien ya jugó 2 o más partidos en el torneo, se exige al menos 2 partidos jugados.
const minPJParaInvicto = computed(() => {
  return maxPJTorneo.value >= 2 ? 2 : 1
})

const esInvicto = (pos: FilaPosicion) => {
  return pos.pj >= minPJParaInvicto.value && pos.pp === 0
}

const esReyMalla = (pos: FilaPosicion) => {
  return !esInvicto(pos) && maxMallasTorneo.value > 0 && (pos.mallas || 0) === maxMallasTorneo.value
}

const esEnLucha = (pos: FilaPosicion) => {
  return !esInvicto(pos) && !esReyMalla(pos) && pos.pj >= minPJParaInvicto.value && pos.pg === 0
}

const tieneBanner = (pos: FilaPosicion) => esInvicto(pos) || esReyMalla(pos) || esEnLucha(pos)

const obtenerIniciales = (nombre: string): string => {
  const partes = nombre.trim().split(' ')
  const p0 = partes[0] ?? ''
  const p1 = partes[1]
  if (!p1) return p0.substring(0, 2).toUpperCase()
  return (p0.charAt(0) + p1.charAt(0)).toUpperCase()
}
</script>

<style scoped>
/* Discord-style Tournament Gaming Banners - Rich Nitro Aesthetics */
.banner-texture {
  background-image: radial-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px);
  background-size: 8px 8px;
}

.banner-fondito-invicto {
  background: 
    radial-gradient(circle at 10% 50%, rgba(16, 185, 129, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 90% 50%, rgba(20, 184, 166, 0.3) 0%, transparent 60%),
    linear-gradient(135deg, #064e3b 0%, #065f46 25%, #0f766e 60%, #0f172a 100%);
  border: 1px solid rgba(52, 211, 153, 0.65);
  box-shadow: 
    0 4px 16px -2px rgba(16, 185, 129, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 0 12px rgba(16, 185, 129, 0.15);
}

.banner-fondito-malla {
  background: 
    radial-gradient(circle at 10% 50%, rgba(245, 158, 11, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 90% 50%, rgba(217, 119, 6, 0.3) 0%, transparent 60%),
    linear-gradient(135deg, #78350f 0%, #92400e 25%, #b45309 60%, #1c1917 100%);
  border: 1px solid rgba(251, 191, 36, 0.7);
  box-shadow: 
    0 4px 16px -2px rgba(245, 158, 11, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 0 12px rgba(245, 158, 11, 0.15);
}

.banner-fondito-lucha {
  background: 
    radial-gradient(circle at 10% 50%, rgba(244, 63, 94, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 90% 50%, rgba(225, 29, 72, 0.3) 0%, transparent 60%),
    linear-gradient(135deg, #881337 0%, #9f1239 25%, #be123c 60%, #1e112a 100%);
  border: 1px solid rgba(251, 113, 133, 0.65);
  box-shadow: 
    0 4px 16px -2px rgba(244, 63, 94, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 0 12px rgba(244, 63, 94, 0.15);
}
</style>


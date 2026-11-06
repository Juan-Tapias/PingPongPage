<template>
  <div class="w-full bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-hidden transition-colors duration-300">
    <div class="px-5 py-4 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <h3 class="text-base font-extrabold text-slate-900 dark:text-white font-heading">
          Tabla de Posiciones - Fase de Grupos
        </h3>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Sistema Round Robin (Todos contra todos). 2 pts por victoria, 1 pt por derrota. Las mallas son solo informativas.
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
            <th scope="col" class="py-3 px-2 sm:px-3 text-center text-amber-700 dark:text-amber-400" title="Mallas: toques de red. Solo informativo, no suma puntos ni desempata">Mallas</th>
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
              <BannerTituloJugador
                v-if="tituloPrincipal(fila)"
                :fila="fila"
                :resultado="resultado"
                :foto-url="obtenerFotoFila(fila)"
              />

              <!-- Jugador REGULAR (Sin banner fondito) -->
              <div v-else class="flex items-center gap-2.5 py-1 px-1">
                <AvatarJugador
                  :foto-url="obtenerFotoFila(fila)"
                  :nombre="fila.nombre"
                  size="sm"
                />
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
            <td
              class="py-3 px-2 sm:px-3 text-center font-mono font-bold"
              :class="(fila.mallas || 0) > 0 ? 'text-amber-700 dark:text-amber-400' : 'text-slate-400 dark:text-slate-600'"
            >
              {{ fila.mallas || 0 }}
            </td>
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
import type { FilaPosicion, PartidoGrupo } from '@/types'
import AvatarJugador from '@/components/AvatarJugador.vue'
import { useAuthStore } from '@/stores/auth'
import { calcularTitulos } from '../../../composables/titulosTabla'
import BannerTituloJugador from './BannerTituloJugador.vue'

const authStore = useAuthStore()

const props = withDefaults(
  defineProps<{
    posiciones: FilaPosicion[]
    /** Partidos del grupo: se usan para calcular las rachas de victorias/derrotas. */
    partidos?: PartidoGrupo[]
  }>(),
  { partidos: () => [] },
)

const obtenerFotoFila = (fila: FilaPosicion): string | undefined => {
  if (fila.fotoUrl) return fila.fotoUrl
  if (fila.esUsuarioActual && authStore.usuario?.fotoUrl) {
    return authStore.usuario.fotoUrl
  }
  return undefined
}

// Títulos (banners): solo reconocimientos visuales, no afectan puntos ni desempates
const resultado = computed(() => calcularTitulos(props.posiciones, props.partidos))
const tituloPrincipal = (fila: FilaPosicion) => resultado.value.titulos.get(fila.jugadorId)?.[0]
</script>



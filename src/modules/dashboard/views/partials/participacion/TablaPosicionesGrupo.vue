<template>
  <div class="w-full bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
    <div class="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
      <div>
        <h3 class="text-base font-extrabold text-slate-900 font-heading">
          Tabla de Posiciones - Fase de Grupos
        </h3>
        <p class="text-xs text-slate-500 mt-0.5">
          Sistema Round Robin (Todos contra todos). 2 pts por victoria, 1 pt por derrota.
        </p>
      </div>

      <div class="flex items-center gap-2 self-start sm:self-auto">
        <span class="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Grupo Único
        </span>
      </div>
    </div>

    <div class="overflow-x-auto">
      <table class="w-full text-left text-xs text-slate-600">
        <thead class="bg-slate-50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 border-b border-slate-200/60">
          <tr>
            <th scope="col" class="py-3 px-3 sm:px-4 text-center w-12">#</th>
            <th scope="col" class="py-3 px-4">Jugador</th>
            <th scope="col" class="py-3 px-2 sm:px-3 text-center" title="Partidos Jugados">PJ</th>
            <th scope="col" class="py-3 px-2 sm:px-3 text-center text-emerald-700" title="Partidos Ganados">PG</th>
            <th scope="col" class="py-3 px-2 sm:px-3 text-center text-rose-700" title="Partidos Perdidos">PP</th>
            <th scope="col" class="py-3 px-2 sm:px-3 text-center hidden sm:table-cell" title="Sets a Favor">SF</th>
            <th scope="col" class="py-3 px-2 sm:px-3 text-center hidden sm:table-cell" title="Sets en Contra">SC</th>
            <th scope="col" class="py-3 px-3 sm:px-4 text-center font-black text-slate-800" title="Puntos Totales">Pts</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 font-medium">
          <tr
            v-for="fila in posiciones"
            :key="fila.jugadorId"
            :class="[
              'transition-colors',
              fila.esUsuarioActual
                ? 'bg-emerald-50/70 hover:bg-emerald-50 font-bold text-slate-900 border-l-4 border-l-emerald-600'
                : 'hover:bg-slate-50/80 text-slate-700'
            ]"
          >
            <td class="py-3 px-3 sm:px-4 text-center font-extrabold">
              <span
                :class="[
                  'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black',
                  fila.posicion === 1 ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                  fila.posicion === 2 ? 'bg-slate-200 text-slate-800' :
                  fila.posicion === 3 ? 'bg-amber-50 text-amber-800' :
                  'text-slate-500'
                ]"
              >
                {{ fila.posicion }}
              </span>
            </td>

            <td class="py-3 px-4">
              <div class="flex items-center gap-2.5">
                <div
                  :class="[
                    'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0',
                    fila.esUsuarioActual ? 'bg-emerald-700' : 'bg-slate-700'
                  ]"
                >
                  {{ obtenerIniciales(fila.nombre) }}
                </div>
                <div class="flex items-center gap-2 min-w-0">
                  <span class="truncate font-bold" :class="fila.esUsuarioActual ? 'text-emerald-950 font-extrabold' : 'text-slate-900'">
                    {{ fila.nombre }}
                  </span>
                  <span
                    v-if="fila.esUsuarioActual"
                    class="inline-flex text-[9px] px-1.5 py-0.5 rounded-md font-extrabold bg-emerald-700 text-white shrink-0"
                  >
                    Tú
                  </span>
                </div>
              </div>
            </td>

            <td class="py-3 px-2 sm:px-3 text-center font-mono">{{ fila.pj }}</td>
            <td class="py-3 px-2 sm:px-3 text-center font-mono font-bold text-emerald-700">{{ fila.pg }}</td>
            <td class="py-3 px-2 sm:px-3 text-center font-mono font-bold text-rose-700">{{ fila.pp }}</td>
            <td class="py-3 px-2 sm:px-3 text-center font-mono hidden sm:table-cell text-slate-500">{{ fila.sf }}</td>
            <td class="py-3 px-2 sm:px-3 text-center font-mono hidden sm:table-cell text-slate-500">{{ fila.sc }}</td>
            <td class="py-3 px-3 sm:px-4 text-center font-mono font-black text-sm text-slate-900 bg-slate-50/50">
              {{ fila.puntos }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { FilaPosicion } from '@/types'

defineProps<{
  posiciones: FilaPosicion[]
}>()

const obtenerIniciales = (nombre: string): string => {
  const partes = nombre.trim().split(' ')
  const p0 = partes[0] ?? ''
  const p1 = partes[1]
  if (!p1) return p0.substring(0, 2).toUpperCase()
  return (p0.charAt(0) + p1.charAt(0)).toUpperCase()
}
</script>

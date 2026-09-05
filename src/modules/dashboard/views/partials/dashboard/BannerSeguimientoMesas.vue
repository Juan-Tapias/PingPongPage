<template>
  <div class="w-full rounded-2xl bg-white border border-slate-200 p-4 sm:p-6 shadow-xs overflow-hidden">

    <div
      v-if="partidos.length === 1 && primerPartido"
      class="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div class="space-y-1 max-w-lg">
        <div class="flex items-center gap-2">
          <span class="relative flex h-2.5 w-2.5">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
          </span>
          <h2 class="text-xl sm:text-2xl font-bold font-heading text-slate-900">
            En vivo
          </h2>
        </div>
        <p class="text-xs sm:text-sm text-slate-600 leading-relaxed">
          Consulta los marcadores y resultados de los partidos en tiempo real sincronizados con las mesas de juego.
        </p>
      </div>

      <div class="w-full md:w-80 max-w-full p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-md shrink-0">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <span class="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {{ primerPartido.mesa }}
          </span>
          <span class="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
            {{ primerPartido.setActual }}
          </span>
        </div>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between items-center gap-2">
            <span class="font-medium text-slate-200 truncate">{{ primerPartido.jugador1.nombre }}</span>
            <span class="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded shrink-0">
              {{ primerPartido.jugador1.puntos }}
            </span>
          </div>
          <div class="flex justify-between items-center gap-2">
            <span class="font-medium text-slate-400 truncate">{{ primerPartido.jugador2.nombre }}</span>
            <span class="font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded shrink-0">
              {{ primerPartido.jugador2.puntos }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
        <div>
          <div class="flex items-center gap-2">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <h2 class="text-xl sm:text-2xl font-bold font-heading text-slate-900">
              En vivo
            </h2>
            <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              {{ partidos.length }} en mesa
            </span>
          </div>
          <p class="text-xs sm:text-sm text-slate-600 mt-0.5">
            Consulta los marcadores y resultados de los partidos en tiempo real sincronizados con las mesas de juego.
          </p>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div
          v-for="partido in partidos"
          :key="partido.id"
          class="p-4 rounded-xl bg-slate-900 text-white border border-slate-800 shadow-md flex flex-col justify-between"
        >
          <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
            <span class="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              {{ partido.mesa }}
            </span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
              {{ partido.setActual }}
            </span>
          </div>

          <div class="space-y-2 text-xs">
            <div class="flex justify-between items-center gap-2">
              <span class="font-medium text-slate-200 truncate">{{ partido.jugador1.nombre }}</span>
              <span class="font-mono font-bold text-white bg-slate-800 px-2 py-0.5 rounded shrink-0">
                {{ partido.jugador1.puntos }}
              </span>
            </div>
            <div class="flex justify-between items-center gap-2">
              <span class="font-medium text-slate-400 truncate">{{ partido.jugador2.nombre }}</span>
              <span class="font-mono font-bold text-slate-400 bg-slate-800 px-2 py-0.5 rounded shrink-0">
                {{ partido.jugador2.puntos }}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

export interface JugadorMarcador {
  nombre: string
  puntos: number
}

export interface PartidoEnVivo {
  id: string | number
  mesa: string
  setActual: string
  jugador1: JugadorMarcador
  jugador2: JugadorMarcador
}

interface Props {
  partidos?: PartidoEnVivo[]
}

const props = withDefaults(defineProps<Props>(), {
  partidos: () => [
    {
      id: 1,
      mesa: 'Mesa 04',
      setActual: 'SET 3',
      jugador1: { nombre: 'Juan Martinez', puntos: 11 },
      jugador2: { nombre: 'Rival Directo', puntos: 9 },
    },
  ],
})

const primerPartido = computed(() => props.partidos[0])
</script>

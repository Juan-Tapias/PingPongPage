<template>
  <div class="w-full rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200 dark:border-slate-800 p-4 sm:p-6 shadow-xs overflow-hidden transition-colors duration-300">

    <div v-if="partidos.length === 0" class="flex flex-col items-center justify-center py-6 text-center gap-2">
      <div class="flex items-center gap-2 text-slate-500 dark:text-slate-400">
        <span class="w-2 h-2 rounded-full bg-slate-400"></span>
        <span class="text-xs font-bold uppercase tracking-wider">Mesas de Juego</span>
      </div>
      <p class="text-xs text-slate-500 dark:text-slate-400">No hay partidos en vivo en disputa en este momento.</p>
    </div>

    <div
      v-else-if="partidos.length === 1 && primerPartido"
      class="flex flex-col md:flex-row md:items-center justify-between gap-4"
    >
      <div class="space-y-1.5 max-w-lg">
        <div class="flex items-center justify-between gap-2">
          <div class="flex items-center gap-2">
            <span class="relative flex h-2.5 w-2.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <h2 class="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white">
              En vivo
            </h2>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer shrink-0"
            @click="emit('abrir-transmision-general')"
          >
            <Radio class="w-3.5 h-3.5 animate-pulse" />
            <span>Transmitir Mesa</span>
          </button>
        </div>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          Consulta los marcadores y resultados de los partidos en tiempo real sincronizados con las mesas de juego.
        </p>
      </div>

      <div class="w-full md:w-80 max-w-full p-4 rounded-xl bg-slate-900 dark:bg-[#080d1a] text-white border border-slate-800 shadow-md shrink-0">
        <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
          <span class="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            {{ primerPartido.mesa }}
          </span>
          <div class="flex items-center gap-1.5">
            <span v-if="primerPartido.transmisionActiva" class="text-[9px] px-2 py-0.5 rounded font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1 animate-pulse">
              <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
              EN VIVO
            </span>
            <span class="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
              {{ primerPartido.setActual }}
            </span>
          </div>
        </div>
        <div class="space-y-2 text-xs">
          <div class="flex justify-between items-center gap-2">
            <div class="flex items-center gap-1.5 min-w-0">
              <span v-if="primerPartido.jugador1.estaSacando" class="text-[11px]" title="Al Saque">🏓</span>
              <span class="font-medium text-slate-200 truncate">{{ primerPartido.jugador1.nombre }}</span>
              <span v-if="primerPartido.jugador1.setsGanados !== undefined && primerPartido.jugador1.setsGanados > 0" class="text-[10px] font-bold text-emerald-400">
                ({{ primerPartido.jugador1.setsGanados }} set{{ primerPartido.jugador1.setsGanados > 1 ? 's' : '' }})
              </span>
            </div>
            <span class="font-mono font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded shrink-0 shadow-xs text-sm">
              {{ primerPartido.jugador1.puntos }}
            </span>
          </div>
          <div class="flex justify-between items-center gap-2">
            <div class="flex items-center gap-1.5 min-w-0">
              <span v-if="primerPartido.jugador2.estaSacando" class="text-[11px]" title="Al Saque">🏓</span>
              <span class="font-medium text-slate-400 truncate">{{ primerPartido.jugador2.nombre }}</span>
              <span v-if="primerPartido.jugador2.setsGanados !== undefined && primerPartido.jugador2.setsGanados > 0" class="text-[10px] font-bold text-emerald-400">
                ({{ primerPartido.jugador2.setsGanados }} set{{ primerPartido.jugador2.setsGanados > 1 ? 's' : '' }})
              </span>
            </div>
            <span class="font-mono font-bold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded shrink-0 shadow-xs text-sm">
              {{ primerPartido.jugador2.puntos }}
            </span>
          </div>
        </div>

        <!-- Botón Ver o Iniciar Transmisión -->
        <div class="mt-3 pt-2.5 border-t border-slate-800/80">
          <button
            v-if="primerPartido.transmisionActiva"
            type="button"
            class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-98 text-white font-extrabold text-xs transition-all shadow-md shadow-rose-950/50 cursor-pointer"
            @click="emit('sintonizar-transmision', primerPartido.partidoOriginal || primerPartido)"
          >
            <Radio class="w-3.5 h-3.5 animate-pulse text-white" />
            <span>Ver Transmisión en Vivo</span>
          </button>
          <button
            v-else
            type="button"
            class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 active:scale-98 text-white font-extrabold text-xs transition-all shadow-md cursor-pointer border border-rose-500/30"
            @click="emit('iniciar-transmision-partido', primerPartido.partidoOriginal || primerPartido)"
          >
            <Radio class="w-3.5 h-3.5" />
            <span>Transmitir esta Mesa con tu Cámara 📹</span>
          </button>
        </div>
      </div>
    </div>

    <div v-else class="space-y-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
        <div class="flex items-center justify-between w-full">
          <div>
            <div class="flex items-center gap-2">
              <span class="relative flex h-2.5 w-2.5">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
              </span>
              <h2 class="text-xl sm:text-2xl font-bold font-heading text-slate-900 dark:text-white">
                En vivo
              </h2>
              <span class="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/60">
                {{ partidos.length }} en mesa
              </span>
            </div>
            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-0.5">
              Consulta los marcadores y resultados de los partidos en tiempo real sincronizados con las mesas de juego.
            </p>
          </div>
          <button
            type="button"
            class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-xs shadow-md transition-all cursor-pointer shrink-0"
            @click="emit('abrir-transmision-general')"
          >
            <Radio class="w-3.5 h-3.5 animate-pulse" />
            <span>Transmitir Mesa</span>
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
        <div
          v-for="partido in partidos"
          :key="partido.id"
          class="p-4 rounded-xl bg-slate-900 dark:bg-[#080d1a] text-white border border-slate-800 shadow-md flex flex-col justify-between"
        >
          <div>
            <div class="flex items-center justify-between border-b border-slate-800 pb-2 mb-3">
              <span class="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                {{ partido.mesa }}
              </span>
              <div class="flex items-center gap-1.5">
                <span v-if="partido.transmisionActiva" class="text-[9px] px-2 py-0.5 rounded font-black bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center gap-1 animate-pulse">
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
                  EN VIVO
                </span>
                <span class="text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-400 font-bold">
                  {{ partido.setActual }}
                </span>
              </div>
            </div>

            <div class="space-y-2 text-xs">
              <div class="flex justify-between items-center gap-2">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span v-if="partido.jugador1.estaSacando" class="text-[11px]" title="Al Saque">🏓</span>
                  <span class="font-medium text-slate-200 truncate">{{ partido.jugador1.nombre }}</span>
                  <span v-if="partido.jugador1.setsGanados !== undefined && partido.jugador1.setsGanados > 0" class="text-[10px] font-bold text-emerald-400">
                    ({{ partido.jugador1.setsGanados }} set{{ partido.jugador1.setsGanados > 1 ? 's' : '' }})
                  </span>
                </div>
                <span class="font-mono font-bold text-white bg-slate-800 px-2.5 py-0.5 rounded shrink-0 shadow-xs text-sm">
                  {{ partido.jugador1.puntos }}
                </span>
              </div>
              <div class="flex justify-between items-center gap-2">
                <div class="flex items-center gap-1.5 min-w-0">
                  <span v-if="partido.jugador2.estaSacando" class="text-[11px]" title="Al Saque">🏓</span>
                  <span class="font-medium text-slate-400 truncate">{{ partido.jugador2.nombre }}</span>
                  <span v-if="partido.jugador2.setsGanados !== undefined && partido.jugador2.setsGanados > 0" class="text-[10px] font-bold text-emerald-400">
                    ({{ partido.jugador2.setsGanados }} set{{ partido.jugador2.setsGanados > 1 ? 's' : '' }})
                  </span>
                </div>
                <span class="font-mono font-bold text-slate-300 bg-slate-800 px-2.5 py-0.5 rounded shrink-0 shadow-xs text-sm">
                  {{ partido.jugador2.puntos }}
                </span>
              </div>
            </div>
          </div>

          <!-- Botón Ver o Iniciar Transmisión -->
          <div class="mt-3 pt-2.5 border-t border-slate-800/80">
            <button
              v-if="partido.transmisionActiva"
              type="button"
              class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 active:scale-98 text-white font-extrabold text-xs transition-all shadow-md shadow-rose-950/50 cursor-pointer"
              @click="emit('sintonizar-transmision', partido.partidoOriginal || partido)"
            >
              <Radio class="w-3.5 h-3.5 animate-pulse text-white" />
              <span>Ver Transmisión en Vivo</span>
            </button>
            <button
              v-else
              type="button"
              class="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-98 text-rose-400 font-extrabold text-xs transition-all cursor-pointer border border-slate-700/60"
              @click="emit('iniciar-transmision-partido', partido.partidoOriginal || partido)"
            >
              <Radio class="w-3.5 h-3.5" />
              <span>Transmitir esta Mesa 📹</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Radio } from 'lucide-vue-next'

export interface JugadorMarcador {
  nombre: string
  puntos: number
  setsGanados?: number
  estaSacando?: boolean
}

export interface PartidoEnVivo {
  id: string | number
  mesa: string
  setActual: string
  jugador1: JugadorMarcador
  jugador2: JugadorMarcador
  transmisionActiva?: boolean
  partidoOriginal?: any
}

interface Props {
  partidos?: PartidoEnVivo[]
}

const props = withDefaults(defineProps<Props>(), {
  partidos: () => [],
})

const emit = defineEmits<{
  (e: 'sintonizar-transmision', partido: any): void
  (e: 'iniciar-transmision-partido', partido: any): void
  (e: 'abrir-transmision-general'): void
}>()

const primerPartido = computed(() => props.partidos[0])
</script>

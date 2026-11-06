<template>
  <!-- Jugador CON BANNER FONDITO DISCORD GAMING (título principal) -->
  <div
    class="relative overflow-hidden rounded-2xl py-2 px-3 sm:px-3.5 flex items-center justify-between gap-3 border shadow-md transition-all duration-300 group hover:scale-[1.01]"
    :class="cfg(fila).banner"
  >
    <!-- Acento superior luminoso estilo Discord Nitro (Specular Gloss) -->
    <div class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>

    <!-- Patrón de micro-malla carbon de fondo -->
    <div class="absolute inset-0 banner-texture opacity-15 pointer-events-none"></div>

    <!-- Resplandor dinámico de fondo detrás del avatar -->
    <div class="absolute -left-3 -top-3 w-24 h-24 rounded-full blur-xl pointer-events-none" :class="cfg(fila).resplandor"></div>

    <!-- Marca de agua vectorial de fondo a la derecha -->
    <div class="absolute right-0 top-0 bottom-0 w-28 flex items-center justify-end pr-1 pointer-events-none overflow-hidden">
      <svg class="w-16 h-16 rotate-6 transform translate-x-1" :class="cfg(fila).marcaAgua" viewBox="0 0 24 24" fill="currentColor">
        <path :d="cfg(fila).icono" />
      </svg>
    </div>

    <!-- Avatar + Nombre + Discord Status Subtitle -->
    <div class="relative z-10 flex items-center gap-2.5 min-w-0">
      <div class="relative shrink-0">
        <AvatarJugador
          :foto-url="fotoUrl"
          :nombre="fila.nombre"
          size="sm"
          :fondo-class="cfg(fila).avatarFondo"
          :ring-class="['ring-2', cfg(fila).avatarAro]"
        />
        <!-- Micro badge status en esquina del avatar -->
        <span
          class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center text-[7px] text-white shadow-xs border border-slate-950 font-bold"
          :class="cfg(fila).punto"
        >
          {{ cfg(fila).emoji }}
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
          <!-- Títulos adicionales como insignias pequeñas -->
          <span
            v-for="extra in titulosExtra(fila)"
            :key="extra"
            class="text-[10px] leading-none shrink-0 px-1 py-0.5 rounded bg-slate-950/50 border border-white/15"
            :title="CONFIG_TITULOS[extra].nombre + ': ' + CONFIG_TITULOS[extra].descripcion(fila)"
          >
            {{ CONFIG_TITULOS[extra].emoji }}
          </span>
        </div>

        <!-- Subtítulo estilo Discord Status -->
        <div class="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold leading-none mt-0.5">
          <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="cfg(fila).punto"></span>
          <span :class="cfg(fila).subtituloColor">{{ cfg(fila).subtitulo(fila) }}</span>
        </div>
      </div>
    </div>

    <!-- Insignia lateral Discord Badge Chip -->
    <div class="relative z-10 flex items-center shrink-0 pl-1.5">
      <div
        class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/85 border backdrop-blur-md"
        :class="cfg(fila).chip"
        :title="cfg(fila).descripcion(fila)"
      >
        <span class="text-xs">{{ cfg(fila).emoji }}</span>
        <span>{{ cfg(fila).etiqueta(fila) }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { FilaPosicion } from '@/types'
import AvatarJugador from '@/components/AvatarJugador.vue'
import { TOP_GIGANTES, type ResultadoTitulos, type TituloTabla } from '../../../composables/titulosTabla'

/**
 * Banner estilo Discord del título principal de un jugador en la tabla de posiciones
 * (jugador y panel admin). Los títulos extra se muestran como insignias junto al nombre.
 * Solo es visual: no afecta puntos ni desempates.
 */
const props = defineProps<{
  fila: FilaPosicion
  resultado: ResultadoTitulos
  fotoUrl?: string
}>()

const resultado = computed(() => props.resultado)
const racha = (fila: FilaPosicion) => resultado.value.rachas.get(fila.jugadorId) ?? { victorias: 0, derrotas: 0 }
const gigantes = (fila: FilaPosicion) => resultado.value.victoriasGigantes.get(fila.jugadorId) ?? 0
const remontadas = (fila: FilaPosicion) => resultado.value.remontadas.get(fila.jugadorId) ?? 0

interface ConfigTitulo {
  nombre: string
  emoji: string
  icono: string
  banner: string
  resplandor: string
  marcaAgua: string
  avatarFondo: string
  avatarAro: string
  punto: string
  subtituloColor: string
  chip: string
  etiqueta: (f: FilaPosicion) => string
  subtitulo: (f: FilaPosicion) => string
  descripcion: (f: FilaPosicion) => string
}

const ICONO_ESCUDO = 'M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z'
const ICONO_CORONA = 'M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z'
const ICONO_LLAMA = 'M19.48 12.35c-1.57-.56-2.92-.12-3.83.65-.63-.9-1.63-1.5-2.77-1.5-1.93 0-3.5 1.57-3.5 3.5 0 .63.17 1.22.46 1.73-.78.18-1.52.54-2.14 1.05C6.1 19.06 6 20.89 6 21h12c0-.52-.16-2.61-1.78-4.22.56-.7 1.43-1.15 2.4-1.15.53 0 1.03.14 1.46.38.38-.97.94-2.69-.6-3.66z'
const ICONO_RAYO = 'M13 2L4 14h7l-1 8 9-12h-7l1-8z'
const ICONO_DIANA = 'M12 2a10 10 0 100 20 10 10 0 000-20zm0 4a6 6 0 110 12 6 6 0 010-12zm0 3a3 3 0 100 6 3 3 0 000-6z'
const ICONO_MURO = 'M2 5h9v4H2V5zm11 0h9v4h-9V5zM2 11h4v4H2v-4zm6 0h8v4H8v-4zm10 0h4v4h-4v-4zM2 17h9v4H2v-4zm11 0h9v4h-9v-4z'
const ICONO_ESPADA = 'M6.9 14.4L3 18.3 5.7 21l3.9-3.9 1.4 1.4 1.4-1.4-1.4-1.4L20 6.7V3h-3.7l-9 9-1.4-1.4-1.4 1.4 1.4 1.4zM8.3 15.7l-1.4-1.4L17.1 4.1h.8v.8L8.3 15.7z'
const ICONO_FLECHA = 'M12 4V1L8 5l4 4V6a6 6 0 11-6 6H4a8 8 0 108-8z'
const ICONO_COPO ='M11 2h2v4.6l3.3-3.3 1.4 1.4L13 9.4V11h1.6l4.7-4.7 1.4 1.4L17.4 11H22v2h-4.6l3.3 3.3-1.4 1.4L14.6 13H13v1.6l4.7 4.7-1.4 1.4L13 17.4V22h-2v-4.6l-3.3 3.3-1.4-1.4L11 14.6V13H9.4l-4.7 4.7-1.4-1.4L6.6 13H2v-2h4.6L3.3 7.7l1.4-1.4L9.4 11H11V9.4L6.3 4.7l1.4-1.4L11 6.6V2z'

const CONFIG_TITULOS: Record<TituloTabla, ConfigTitulo> = {
  invicto: {
    nombre: 'Invicto',
    emoji: '🛡️',
    icono: ICONO_ESCUDO,
    banner: 'banner-fondito-invicto',
    resplandor: 'bg-emerald-400/25',
    marcaAgua: 'text-emerald-200/15',
    avatarFondo: 'bg-gradient-to-br from-emerald-500 to-teal-800',
    avatarAro: 'ring-emerald-300/80 shadow-[0_0_8px_rgba(52,211,153,0.4)]',
    punto: 'bg-emerald-500',
    subtituloColor: 'text-emerald-200/90',
    chip: 'text-emerald-300 border-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.35)]',
    etiqueta: () => 'Invicto',
    subtitulo: (f) => `${f.pg}V - 0D · Récord Invicto`,
    descripcion: () => '¡Invicto! Ninguna derrota registrada en el torneo',
  },
  reyMalla: {
    nombre: 'Rey de la Malla',
    emoji: '👑',
    icono: ICONO_CORONA,
    banner: 'banner-fondito-malla',
    resplandor: 'bg-amber-400/25',
    marcaAgua: 'text-amber-200/15',
    avatarFondo: 'bg-gradient-to-br from-amber-400 to-amber-800',
    avatarAro: 'ring-amber-300/80 shadow-[0_0_8px_rgba(251,191,36,0.4)]',
    punto: 'bg-amber-500',
    subtituloColor: 'text-amber-200/90',
    chip: 'text-amber-300 border-amber-400/80 shadow-[0_0_10px_rgba(245,158,11,0.35)]',
    etiqueta: (f) => `Rey Malla (${f.mallas || 0})`,
    subtitulo: (f) => `${f.mallas || 0} mallas · Rey de la Red`,
    descripcion: (f) => `¡Rey de la Malla! Máximo anotador con toque de red (${f.mallas || 0})`,
  },
  enRacha: {
    nombre: 'En Racha',
    emoji: '⚡',
    icono: ICONO_RAYO,
    banner: 'banner-fondito-racha',
    resplandor: 'bg-violet-400/25',
    marcaAgua: 'text-violet-200/15',
    avatarFondo: 'bg-gradient-to-br from-violet-500 to-purple-900',
    avatarAro: 'ring-violet-300/80 shadow-[0_0_8px_rgba(167,139,250,0.45)]',
    punto: 'bg-violet-500',
    subtituloColor: 'text-violet-200/90',
    chip: 'text-violet-300 border-violet-400/80 shadow-[0_0_10px_rgba(139,92,246,0.35)]',
    etiqueta: (f) => `En Racha (${racha(f).victorias})`,
    subtitulo: (f) => `${racha(f).victorias} victorias seguidas · Imparable`,
    descripcion: (f) => `La mejor racha actual del grupo: ${racha(f).victorias} victorias seguidas`,
  },
  cazagigantes: {
    nombre: 'Cazagigantes',
    emoji: '🗡️',
    icono: ICONO_ESPADA,
    banner: 'banner-fondito-cazagigantes',
    resplandor: 'bg-lime-400/25',
    marcaAgua: 'text-lime-200/15',
    avatarFondo: 'bg-gradient-to-br from-lime-500 to-green-900',
    avatarAro: 'ring-lime-300/80 shadow-[0_0_8px_rgba(190,242,100,0.45)]',
    punto: 'bg-lime-500',
    subtituloColor: 'text-lime-200/90',
    chip: 'text-lime-300 border-lime-400/80 shadow-[0_0_10px_rgba(132,204,22,0.35)]',
    etiqueta: (f) => `Cazagigantes (${gigantes(f)})`,
    subtitulo: (f) => `${gigantes(f)} victorias contra el top ${TOP_GIGANTES} · Sin miedo`,
    descripcion: (f) =>
      `Fuera del top ${TOP_GIGANTES}, es quien más le ha ganado a los ${TOP_GIGANTES} primeros (${gigantes(f)})`,
  },
  remontador: {
    nombre: 'Remontador',
    emoji: '🔄',
    icono: ICONO_FLECHA,
    banner: 'banner-fondito-remontador',
    resplandor: 'bg-orange-400/25',
    marcaAgua: 'text-orange-200/15',
    avatarFondo: 'bg-gradient-to-br from-orange-500 to-red-900',
    avatarAro: 'ring-orange-300/80 shadow-[0_0_8px_rgba(253,186,116,0.45)]',
    punto: 'bg-orange-500',
    subtituloColor: 'text-orange-200/90',
    chip: 'text-orange-300 border-orange-400/80 shadow-[0_0_10px_rgba(249,115,22,0.35)]',
    etiqueta: (f) => `Remontador (${remontadas(f)})`,
    subtitulo: (f) => `${remontadas(f)} partidos ganados tras perder el 1er set`,
    descripcion: (f) => `Más remontadas del grupo: ${remontadas(f)} victorias después de perder el primer set`,
  },
  canonero: {
    nombre: 'Cañonero',
    emoji: '🎯',
    icono: ICONO_DIANA,
    banner: 'banner-fondito-canonero',
    resplandor: 'bg-fuchsia-400/25',
    marcaAgua: 'text-fuchsia-200/15',
    avatarFondo: 'bg-gradient-to-br from-fuchsia-500 to-pink-900',
    avatarAro: 'ring-fuchsia-300/80 shadow-[0_0_8px_rgba(232,121,249,0.45)]',
    punto: 'bg-fuchsia-500',
    subtituloColor: 'text-fuchsia-200/90',
    chip: 'text-fuchsia-300 border-fuchsia-400/80 shadow-[0_0_10px_rgba(217,70,239,0.35)]',
    etiqueta: (f) => `Cañonero (${f.sf})`,
    subtitulo: (f) => `${f.sf} sets a favor · Máximo anotador`,
    descripcion: (f) => `Más sets ganados del grupo (${f.sf})`,
  },
  muralla: {
    nombre: 'La Muralla',
    emoji: '🧱',
    icono: ICONO_MURO,
    banner: 'banner-fondito-muralla',
    resplandor: 'bg-blue-400/25',
    marcaAgua: 'text-blue-200/15',
    avatarFondo: 'bg-gradient-to-br from-blue-500 to-indigo-900',
    avatarAro: 'ring-blue-300/80 shadow-[0_0_8px_rgba(96,165,250,0.45)]',
    punto: 'bg-blue-500',
    subtituloColor: 'text-blue-200/90',
    chip: 'text-blue-300 border-blue-400/80 shadow-[0_0_10px_rgba(59,130,246,0.35)]',
    etiqueta: () => 'La Muralla',
    subtitulo: (f) => `${f.sc} sets en contra en ${f.pj} partidos · Defensa de hierro`,
    descripcion: (f) => `Menos sets recibidos por partido del grupo (${f.sc} en ${f.pj})`,
  },
  rachaFria: {
    nombre: 'Racha Fría',
    emoji: '❄️',
    icono: ICONO_COPO,
    banner: 'banner-fondito-fria',
    resplandor: 'bg-cyan-400/25',
    marcaAgua: 'text-cyan-200/15',
    avatarFondo: 'bg-gradient-to-br from-cyan-500 to-sky-900',
    avatarAro: 'ring-cyan-300/80 shadow-[0_0_8px_rgba(103,232,249,0.45)]',
    punto: 'bg-cyan-500',
    subtituloColor: 'text-cyan-200/90',
    chip: 'text-cyan-300 border-cyan-400/80 shadow-[0_0_10px_rgba(6,182,212,0.35)]',
    etiqueta: (f) => `Racha Fría (${racha(f).derrotas})`,
    subtitulo: (f) => `${racha(f).derrotas} derrotas seguidas · A romper el hielo`,
    descripcion: (f) => `${racha(f).derrotas} derrotas seguidas: ¡el próximo partido es para remontar!`,
  },
  enLucha: {
    nombre: 'En la Lucha',
    emoji: '🥊',
    icono: ICONO_LLAMA,
    banner: 'banner-fondito-lucha',
    resplandor: 'bg-rose-400/25',
    marcaAgua: 'text-rose-200/15',
    avatarFondo: 'bg-gradient-to-br from-rose-500 to-rose-900',
    avatarAro: 'ring-rose-300/80 shadow-[0_0_8px_rgba(251,113,133,0.4)]',
    punto: 'bg-rose-500',
    subtituloColor: 'text-rose-200/90',
    chip: 'text-rose-300 border-rose-400/80 shadow-[0_0_10px_rgba(244,63,94,0.35)]',
    etiqueta: () => 'En la Lucha',
    subtitulo: (f) => `${f.pp}D · En pie de lucha`,
    descripcion: () => 'Buscando su primera victoria: ¡Va con todo por la remontada!',
  },
}

const tituloPrincipal = (fila: FilaPosicion): TituloTabla | undefined =>
  resultado.value.titulos.get(fila.jugadorId)?.[0]

const titulosExtra = (fila: FilaPosicion): TituloTabla[] =>
  resultado.value.titulos.get(fila.jugadorId)?.slice(1) ?? []

/** Configuración del título principal (solo se usa dentro del v-if del banner). */
const cfg = (fila: FilaPosicion): ConfigTitulo => CONFIG_TITULOS[tituloPrincipal(fila) ?? 'invicto']
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

.banner-fondito-racha {
  background:
    radial-gradient(circle at 10% 50%, rgba(139, 92, 246, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 90% 50%, rgba(124, 58, 237, 0.3) 0%, transparent 60%),
    linear-gradient(135deg, #4c1d95 0%, #5b21b6 25%, #6d28d9 60%, #1e1b4b 100%);
  border: 1px solid rgba(167, 139, 250, 0.7);
  box-shadow:
    0 4px 16px -2px rgba(139, 92, 246, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 0 12px rgba(139, 92, 246, 0.15);
}

.banner-fondito-canonero {
  background:
    radial-gradient(circle at 10% 50%, rgba(217, 70, 239, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 90% 50%, rgba(192, 38, 211, 0.3) 0%, transparent 60%),
    linear-gradient(135deg, #701a75 0%, #86198f 25%, #a21caf 60%, #1e112a 100%);
  border: 1px solid rgba(232, 121, 249, 0.7);
  box-shadow:
    0 4px 16px -2px rgba(217, 70, 239, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 0 12px rgba(217, 70, 239, 0.15);
}

.banner-fondito-muralla {
  background:
    radial-gradient(circle at 10% 50%, rgba(59, 130, 246, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 90% 50%, rgba(79, 70, 229, 0.3) 0%, transparent 60%),
    linear-gradient(135deg, #1e3a8a 0%, #1e40af 25%, #3730a3 60%, #0f172a 100%);
  border: 1px solid rgba(96, 165, 250, 0.7);
  box-shadow:
    0 4px 16px -2px rgba(59, 130, 246, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 0 12px rgba(59, 130, 246, 0.15);
}

.banner-fondito-cazagigantes {
  background:
    radial-gradient(circle at 10% 50%, rgba(132, 204, 22, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 90% 50%, rgba(22, 163, 74, 0.3) 0%, transparent 60%),
    linear-gradient(135deg, #365314 0%, #3f6212 25%, #4d7c0f 60%, #0f172a 100%);
  border: 1px solid rgba(190, 242, 100, 0.65);
  box-shadow:
    0 4px 16px -2px rgba(132, 204, 22, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 0 12px rgba(132, 204, 22, 0.15);
}

.banner-fondito-remontador {
  background:
    radial-gradient(circle at 10% 50%, rgba(249, 115, 22, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 90% 50%, rgba(220, 38, 38, 0.3) 0%, transparent 60%),
    linear-gradient(135deg, #7c2d12 0%, #9a3412 25%, #c2410c 60%, #1c1917 100%);
  border: 1px solid rgba(253, 186, 116, 0.65);
  box-shadow:
    0 4px 16px -2px rgba(249, 115, 22, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 0 12px rgba(249, 115, 22, 0.15);
}

.banner-fondito-fria {
  background:
    radial-gradient(circle at 10% 50%, rgba(6, 182, 212, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 90% 50%, rgba(14, 165, 233, 0.3) 0%, transparent 60%),
    linear-gradient(135deg, #164e63 0%, #155e75 25%, #0e7490 60%, #0f172a 100%);
  border: 1px solid rgba(103, 232, 249, 0.65);
  box-shadow:
    0 4px 16px -2px rgba(6, 182, 212, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 0 12px rgba(6, 182, 212, 0.15);
}
</style>

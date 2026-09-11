<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    variant?: 'full' | 'horizontal' | 'icon'
    size?: 'sm' | 'md' | 'lg' | 'xl'
  }>(),
  {
    variant: 'horizontal',
    size: 'md',
  }
)

const emblemSizes = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'w-8 h-8'
    case 'xl':
      return 'w-28 h-28 sm:w-36 sm:h-36'
    case 'lg':
      return 'w-20 h-20 sm:w-24 sm:h-24'
    case 'md':
    default:
      return 'w-10 h-10 sm:w-11 sm:h-11'
  }
})
</script>

<template>
  <!-- Variante ICON: Solo el escudo circular oficial en SVG -->
  <div v-if="variant === 'icon'" class="relative inline-flex items-center justify-center shrink-0 rounded-full overflow-hidden">
    <img
      src="/logo.svg"
      alt="SpinApp Torneo"
      :class="[emblemSizes, 'object-contain drop-shadow-md select-none pointer-events-none rounded-full']"
    />
  </div>

  <!-- Variante FULL: Logo Centrado con Escudo Circular SVG Oficial -->
  <div v-else-if="variant === 'full'" class="flex flex-col items-center justify-center text-center group select-none">
    <div class="relative flex items-center justify-center rounded-full overflow-hidden">
      <img
        src="/logo.svg"
        alt="SpinApp Torneo Ping Pong"
        class="w-24 h-24 sm:w-32 sm:h-32 object-contain drop-shadow-2xl transition-transform duration-300 group-hover:scale-105 rounded-full"
      />
    </div>
  </div>

  <!-- Variante HORIZONTAL: Escudo Circular SVG + Marca para Navbar y Footers -->
  <div v-else class="flex items-center gap-2.5 sm:gap-3 select-none group">
    <div class="relative flex items-center justify-center shrink-0 rounded-full overflow-hidden">
      <img
        src="/logo.svg"
        alt="SpinApp Torneo"
        :class="[emblemSizes, 'object-contain drop-shadow-xs transition-transform duration-200 group-hover:scale-105 rounded-full']"
      />
    </div>

    <div class="flex flex-col text-left leading-none">
      <div class="flex items-center font-black font-heading text-base sm:text-lg tracking-tight">
        <span class="text-orange-500">Spin</span>
        <span class="text-slate-900 dark:text-white">App</span>
      </div>
      <span class="text-[8px] sm:text-[9.5px] font-extrabold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400 mt-1">
        TORNEO PING PONG
      </span>
    </div>
  </div>
</template>

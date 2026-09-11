<script setup lang="ts">
import PingPongTable3D from '@/components/PingPongTable3D.vue'

defineProps<{
  mode: 'login' | 'register'
}>()
</script>

<template>
  <div class="relative w-full h-full min-h-0 lg:min-h-[620px] rounded-t-3xl rounded-b-none lg:rounded-l-3xl lg:rounded-r-none overflow-hidden p-4 sm:p-6 lg:p-8 flex flex-col justify-between select-none bg-gradient-to-br from-[#0c0f1d] via-[#1a1033] to-[#ea580c] text-white shadow-inner">
    <!-- Efectos de Fondo: Ondas Topográficas de Tenis de Mesa (SVG) -->
    <div class="absolute inset-0 pointer-events-none opacity-25 overflow-hidden">
      <svg
        class="w-full h-full object-cover"
        viewBox="0 0 500 500"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M-50 150 C100 50, 200 250, 550 100"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-dasharray="4 4"
        />
        <path
          d="M-30 220 C150 120, 250 320, 530 200"
          stroke="currentColor"
          stroke-width="1.8"
        />
        <path
          d="M-20 300 C180 200, 280 400, 520 310"
          stroke="currentColor"
          stroke-width="1.2"
        />
        <path
          d="M0 380 C200 300, 320 480, 550 420"
          stroke="currentColor"
          stroke-width="1.5"
        />
        <path
          d="M-10 450 C150 380, 350 490, 510 460"
          stroke="currentColor"
          stroke-width="1"
          stroke-dasharray="2 3"
        />
      </svg>
    </div>

    <!-- Patrón de Matriz de Puntos (Dot Matrix) -->
    <div class="absolute top-4 right-4 sm:top-8 sm:right-8 pointer-events-none opacity-30">
      <div class="grid grid-cols-5 gap-2 sm:gap-2.5">
        <span v-for="i in 25" :key="i" class="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white" />
      </div>
    </div>

    <!-- Elementos Geométricos Decorativos (visibles principalmente en desktop) -->
    <div class="hidden sm:block absolute top-28 left-10 text-white/40 text-sm font-mono select-none">+</div>
    <div class="hidden sm:block absolute bottom-24 right-14 text-white/40 text-lg font-mono select-none">+</div>
    <div class="hidden sm:block absolute top-1/2 left-8 w-4 h-4 rounded-full border-2 border-white/20 select-none"></div>

    <!-- Brillo radial ambiental -->
    <div class="absolute -bottom-20 -left-20 w-80 h-80 bg-orange-500/30 rounded-full blur-3xl pointer-events-none"></div>
    <div class="absolute top-1/4 -right-20 w-72 h-72 bg-purple-600/30 rounded-full blur-3xl pointer-events-none"></div>


    <!-- Modelo 3D de la Mesa de Ping Pong (Google Poly) -->
    <div class="relative z-10 w-full flex-1 flex flex-col items-center justify-center my-2 lg:my-3">
      <div class="w-full h-[180px] sm:h-[220px] lg:h-[320px] relative">
        <PingPongTable3D />
      </div>

      <!-- Subtítulo oficial bajo la mesa 3D -->
      <div class="text-center mt-1 lg:mt-2">
        <span class="text-[10px] sm:text-xs font-black uppercase tracking-widest text-orange-400">
          Mesa Reglamentaria ITTF
        </span>
        <h3 class="text-sm sm:text-base lg:text-lg font-black text-white tracking-tight leading-tight mt-0.5">
          SpinApp Table Tennis Arena
        </h3>
      </div>
    </div>

    <!-- Pie del Panel Artístico (Desktop) -->
    <div class="hidden lg:flex relative z-10 pt-4 items-center justify-between text-[11px] text-white/60 border-t border-white/10">
      <span>ITTF Regulation Standards</span>
      <span>Season 2026</span>
    </div>
  </div>
</template>

<style scoped>
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
}

.fade-slide-enter-from {
  opacity: 0;
  transform: translateY(12px);
}

.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(-12px);
}
</style>

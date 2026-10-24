<script setup lang="ts">
import { ref, onMounted, defineAsyncComponent } from 'vue'

const show3D = ref(false)
const esMobile = ref(false)
const PingPongTable3D = defineAsyncComponent(() => import('@/components/PingPongTable3D.vue'))

defineProps<{
  mode: 'login' | 'register'
}>()

onMounted(() => {
  if (typeof window !== 'undefined') {
    esMobile.value = window.innerWidth < 1024
    // Solo inicializar Three.js en pantallas desktop para aligerar la app en móviles (ahorro de ~633 kB de bundle)
    if (!esMobile.value) {
      setTimeout(() => {
        show3D.value = true
      }, 200)
    }
  }
})
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


    <!-- Modelo de Mesa de Ping Pong: 3D en Desktop y Vectorial Ligero en Móvil -->
    <div class="relative z-10 w-full flex-1 flex flex-col items-center justify-center my-2 lg:my-3">
      <div class="w-full h-[180px] sm:h-[220px] lg:h-[320px] relative flex items-center justify-center">
        <!-- Render 3D Three.js en Pantallas Grandes (Desktop) -->
        <Transition name="fade-slide">
          <PingPongTable3D v-if="show3D" />
        </Transition>

        <!-- Ilustración Vectorial Deportiva Ultra-Liviana para Celulares -->
        <div v-if="!show3D" class="w-full h-full flex items-center justify-center p-2 relative animate-in fade-in duration-300">
          <svg class="w-full max-w-[280px] sm:max-w-[340px] h-auto drop-shadow-2xl" viewBox="0 0 360 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="tableGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#0284c7" />
                <stop offset="100%" stop-color="#0369a1" />
              </linearGradient>
              <linearGradient id="ballGlow" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fdba74" />
                <stop offset="100%" stop-color="#ea580c" />
              </linearGradient>
            </defs>

            <!-- Sombra de la Mesa -->
            <polygon points="60,170 300,170 340,140 100,140" fill="rgba(0,0,0,0.35)" />

            <!-- Patas de la Mesa ITTF -->
            <line x1="80" y1="120" x2="80" y2="155" stroke="#475569" stroke-width="4" stroke-linecap="round" />
            <line x1="280" y1="120" x2="280" y2="155" stroke="#475569" stroke-width="4" stroke-linecap="round" />
            <line x1="180" y1="125" x2="180" y2="158" stroke="#334155" stroke-width="5" stroke-linecap="round" />
            <line x1="95" y1="145" x2="265" y2="145" stroke="#64748b" stroke-width="2" />

            <!-- Superficie de la Mesa en Perspectiva Isométrica -->
            <polygon points="50,115 310,115 340,65 80,65" fill="url(#tableGradient)" stroke="#ffffff" stroke-width="2" />

            <!-- Línea Central Reglamentaria ITTF -->
            <line x1="65" y1="90" x2="325" y2="90" stroke="#ffffff" stroke-width="1.5" stroke-dasharray="4 2" />

            <!-- Red de Tenis de Mesa Reglamentaria -->
            <polygon points="179,58 179,122 181,122 181,58" fill="#ffffff" />
            <polygon points="178,60 178,120 182,120 182,60" fill="rgba(255,255,255,0.4)" stroke="#e2e8f0" stroke-width="1" />
            <line x1="177" y1="60" x2="183" y2="60" stroke="#ffffff" stroke-width="2" />

            <!-- Pelota Neón de Competición ITTF 40mm+ con brillo -->
            <circle class="animate-pulse" cx="130" cy="74" r="6" fill="url(#ballGlow)" />
            <ellipse class="opacity-40" cx="130" cy="98" rx="7" ry="2.5" fill="#000000" />
          </svg>
        </div>
      </div>

      <!-- Subtítulo oficial bajo la mesa -->
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

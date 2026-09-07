<template>
  <button
    type="button"
    role="switch"
    :aria-checked="isDark"
    :title="isDark ? 'Cambiar a modo diurno' : 'Cambiar a modo nocturno de torneo'"
    class="relative inline-flex items-center select-none cursor-pointer outline-none group focus-visible:ring-2 focus-visible:ring-sky-500 focus-visible:ring-offset-2 rounded-full"
    @click="handleClick"
  >
    <!-- Mesa de Ping Pong Profesional (Contenedor de Alta Visibilidad) -->
    <div
      :class="[
        'w-[84px] h-[40px] rounded-full p-1 relative flex items-center justify-between transition-all duration-300 border-2 overflow-hidden shadow-lg',
        isDark
          ? 'bg-gradient-to-r from-[#070e1e] via-[#0c1a33] to-[#12284c] border-sky-400/60 shadow-[0_2px_14px_rgba(56,189,248,0.35),inset_0_1px_4px_rgba(0,0,0,0.6)]'
          : 'bg-gradient-to-r from-blue-700 via-blue-600 to-sky-600 border-blue-400 shadow-[0_2px_10px_rgba(29,78,216,0.4),inset_0_1px_3px_rgba(255,255,255,0.2)]'
      ]"
    >
      <!-- Línea blanca reglamentaria central de la mesa de tenis -->
      <div
        class="absolute left-3 right-3 top-1/2 -translate-y-1/2 h-[1.5px] pointer-events-none bg-white/45 shadow-[0_0_2px_rgba(255,255,255,0.4)]"
      />

      <!-- Malla / Red de Ping Pong Central Realista -->
      <div
        class="absolute left-1/2 -translate-x-1/2 top-1 bottom-1 w-[6px] flex flex-col items-center pointer-events-none z-10"
      >
        <!-- Cinta blanca superior reglamentaria de la red -->
        <span class="w-2.5 h-[3px] rounded-full bg-white shadow-[0_1px_2px_rgba(0,0,0,0.4)]" />
        <!-- Malla de red con borde de postes -->
        <div
          :class="[
            'flex-1 w-[2.5px] border-l-2 border-dotted transition-colors duration-300',
            isDark ? 'border-white/85 shadow-[0_0_3px_rgba(255,255,255,0.6)]' : 'border-white shadow-[0_0_2px_rgba(255,255,255,0.8)]'
          ]"
        />
        <!-- Soporte inferior metálico del poste -->
        <span class="w-2 h-[2.5px] rounded-full bg-slate-900 shadow-xs" />
      </div>

      <!-- Lado Izquierdo: Modo Diurno (Sol Dorado Brillante de Alto Contraste) -->
      <div
        :class="[
          'w-7 h-7 flex items-center justify-center transition-all duration-300 z-0 pl-0.5',
          !isDark
            ? 'text-amber-300 drop-shadow-[0_0_8px_rgba(252,211,77,0.9)] scale-110 opacity-100'
            : 'text-amber-300/80 drop-shadow-[0_0_4px_rgba(252,211,77,0.5)] scale-95 opacity-85'
        ]"
      >
        <Sun class="w-4 h-4 fill-amber-400" />
      </div>

      <!-- Lado Derecho: Modo Nocturno (Luna Lanza-Reflejos de Estadio de Alto Contraste) -->
      <div
        :class="[
          'w-7 h-7 flex items-center justify-center transition-all duration-300 z-0 pr-0.5',
          isDark
            ? 'text-cyan-300 drop-shadow-[0_0_10px_rgba(34,211,238,0.95)] scale-110 opacity-100'
            : 'text-white drop-shadow-[0_0_4px_rgba(255,255,255,0.8)] scale-95 opacity-90'
        ]"
      >
        <Moon class="w-4 h-4 fill-cyan-400/40" />
      </div>

      <!-- Pelota Oficial ITTF que Rebota sobre la Red -->
      <div
        :class="[
          'absolute top-[4.5px] w-[29px] h-[29px] rounded-full z-20 transition-all duration-300',
          'flex items-center justify-center cursor-pointer',
          bouncingClass,
        ]"
        :style="{
          left: isDark ? 'calc(100% - 34px)' : '4px',
        }"
      >
        <!-- Esfera 3D Volumétrica Ultranítida -->
        <div
          :class="[
            'w-full h-full rounded-full transition-all duration-300 relative flex items-center justify-center shadow-lg',
            isDark
              ? 'bg-gradient-to-br from-amber-300 via-orange-500 to-orange-600 shadow-[0_0_14px_rgba(249,115,22,0.9),inset_0_-2px_4px_rgba(154,52,18,0.7),inset_0_2px_4px_rgba(254,240,138,0.9)] border border-orange-300/60'
              : 'bg-gradient-to-br from-white via-slate-50 to-slate-200 shadow-[0_3px_10px_rgba(0,0,0,0.4),inset_0_-2px_4px_rgba(148,163,184,0.6),inset_0_2px_4px_rgba(255,255,255,1)] border border-white'
          ]"
        >
          <!-- Brillo especular 3D superior -->
          <div class="absolute top-1 left-1.5 w-2.5 h-1.5 rounded-full bg-white/95 blur-[0.2px]" />

          <!-- Icono Vectorial Nítido de Raqueta / ITTF en lugar de emoji borroso -->
          <svg
            viewBox="0 0 24 24"
            class="w-3.5 h-3.5 transition-colors duration-300 select-none pointer-events-none mt-0.5 ml-0.5"
            :class="isDark ? 'text-amber-950/85' : 'text-blue-900/80'"
            fill="currentColor"
          >
            <!-- Raqueta de Ping Pong estilizada en vector de alta definición -->
            <path d="M14.5 2C10.9 2 8 4.9 8 8.5c0 1.2.3 2.3.9 3.3L3.2 17.5c-.8.8-.8 2.1 0 2.8.8.8 2.1.8 2.8 0l5.7-5.7c1 .6 2.1.9 3.3.9 3.6 0 6.5-2.9 6.5-6.5S18.1 2 14.5 2zm-1 8c-.6 0-1-.4-1-1s.4-1 1-1 1 .4 1 1-.4 1-1 1z"/>
          </svg>
        </div>

        <!-- Onda expansiva de impacto al rebotar sobre la mesa -->
        <span
          v-if="impactEffect"
          :class="[
            'absolute -inset-1.5 rounded-full border-2 animate-ping pointer-events-none',
            isDark ? 'border-orange-400' : 'border-white'
          ]"
        />
      </div>
    </div>
  </button>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Sun, Moon } from 'lucide-vue-next'
import { useTheme } from '@/composables/useTheme'

const { isDark, toggleTheme } = useTheme()

const bouncingClass = ref('')
const impactEffect = ref(false)

// Sintetizador Web Audio API: Sonido auténtico de pelota de ping pong rebotando ("tok!")
const playPingPongBounceSound = () => {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext
    if (!AudioContextClass) return
    const ctx = new AudioContextClass()

    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    // Frecuencia típica del impacto de una pelota de celuloide/plástico (850Hz cayendo a 300Hz)
    osc.type = 'sine'
    osc.frequency.setValueAtTime(isDark.value ? 750 : 920, ctx.currentTime)
    osc.frequency.exponentialRampToValueAtTime(260, ctx.currentTime + 0.05)

    // Envolvente rápida y percusiva (50 milisegundos)
    gain.gain.setValueAtTime(0.08, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start()
    osc.stop(ctx.currentTime + 0.05)
  } catch {
    // Si el navegador bloquea audio sin interacción previa, se ignora silenciosamente
  }
}

const handleClick = () => {
  // Animación de arco parabólico (salto sobre la red)
  bouncingClass.value = 'animate-ping-pong-jump'
  playPingPongBounceSound()

  toggleTheme()

  setTimeout(() => {
    impactEffect.value = true
    bouncingClass.value = ''
    setTimeout(() => {
      impactEffect.value = false
    }, 400)
  }, 250)
}
</script>

<style scoped>
@keyframes pingPongJump {
  0% {
    transform: translateY(0) scale(1, 1);
  }
  30% {
    transform: translateY(-12px) scale(0.88, 1.18) rotate(16deg);
  }
  70% {
    transform: translateY(-12px) scale(0.88, 1.18) rotate(-16deg);
  }
  100% {
    transform: translateY(0) scale(1.18, 0.82);
  }
}

.animate-ping-pong-jump {
  animation: pingPongJump 0.28s cubic-bezier(0.34, 1.56, 0.64, 1);
}
</style>

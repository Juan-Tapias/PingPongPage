<script setup lang="ts">
import { RouterView } from 'vue-router'
import ModalReglamento from '@/components/ModalReglamento.vue'
import Logo from '@/components/Logo.vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
</script>

<template>
  <!-- Pantalla de Bienvenida / Splash Deportiva mientras inicializa Firebase -->
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="authStore.inicializando && !authStore.usuario"
      class="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-[#070b16] text-white select-none p-4"
    >
      <div class="relative flex flex-col items-center gap-4 animate-in zoom-in-95 duration-200">
        <!-- Logo con pulso ambiental -->
        <div class="relative">
          <div class="w-20 h-20 rounded-3xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 flex items-center justify-center shadow-[0_0_40px_rgba(249,115,22,0.4)] animate-pulse">
            <span class="text-4xl select-none">🏓</span>
          </div>
          <!-- Pelota orbitando -->
          <span class="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-white shadow-[0_0_12px_#ffffff] animate-ping" />
        </div>

        <div class="text-center space-y-1 mt-1">
          <Logo class="text-2xl font-black tracking-tight" />
          <p class="text-xs font-bold text-orange-400/90 tracking-widest uppercase">
            Plataforma Oficial de Tenis de Mesa
          </p>
        </div>

        <!-- Indicador de carga sutil -->
        <div class="flex items-center gap-2 mt-2">
          <div class="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style="animation-delay: 0s" />
          <div class="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style="animation-delay: 0.15s" />
          <div class="w-2 h-2 rounded-full bg-orange-500 animate-bounce" style="animation-delay: 0.3s" />
        </div>
      </div>
    </div>
  </Transition>

  <RouterView />
  <ModalReglamento />
</template>



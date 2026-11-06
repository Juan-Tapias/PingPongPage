<template>
  <div
    :class="[
      'relative shrink-0 rounded-full flex items-center justify-center select-none overflow-hidden transition-all',
      claseTamano,
      ringClass || '',
    ]"
    :style="estiloContenedor"
  >
    <!-- Imagen del avatar o preset si existe y no ha dado error de carga -->
    <img
      v-if="fotoUrlValida && !errorCarga"
      :src="fotoUrlValida"
      :alt="nombre || 'Avatar'"
      class="w-full h-full object-cover object-center pointer-events-none"
      loading="lazy"
      @error="handleErrorImagen"
    />

    <!-- Sin foto: fondo oscuro clásico con iniciales (cada vista puede pasar su propio fondo) -->
    <div
      v-else
      :class="[
        'w-full h-full flex items-center justify-center font-black tracking-wider uppercase text-white shadow-inner',
        fondoClass,
      ]"
    >
      <span :class="claseTexto">{{ textoIniciales }}</span>
    </div>

    <!-- Micro indicador opcional en esquina (online / en vivo / admin) -->
    <slot name="badge" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'

const props = withDefaults(
  defineProps<{
    fotoUrl?: string | null
    nombre?: string
    iniciales?: string
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
    ringClass?: string | string[]
    /** Fondo cuando no hay foto (clases de Tailwind). */
    fondoClass?: string
  }>(),
  {
    fondoClass: 'bg-slate-900 dark:bg-slate-800',
    fotoUrl: null,
    nombre: '',
    iniciales: '',
    size: 'md',
    ringClass: '',
  }
)

const errorCarga = ref(false)

watch(
  () => props.fotoUrl,
  () => {
    errorCarga.value = false
  }
)

const fotoUrlValida = computed(() => {
  if (!props.fotoUrl) return null
  const trim = props.fotoUrl.trim()
  if (!trim) return null
  return trim
})

const handleErrorImagen = () => {
  errorCarga.value = true
}

const textoIniciales = computed(() => {
  if (props.iniciales && props.iniciales.trim()) {
    return props.iniciales.trim().slice(0, 2).toUpperCase()
  }
  if (props.nombre && props.nombre.trim()) {
    const partes = props.nombre.trim().split(/\s+/)
    const p1 = partes[0]?.[0] || ''
    const p2 = partes[1]?.[0] || partes[0]?.[1] || ''
    return (p1 + p2).toUpperCase()
  }
  return 'SP'
})

const claseTamano = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'w-6 h-6'
    case 'sm':
      return 'w-7.5 h-7.5'
    case 'md':
      return 'w-9 h-9'
    case 'lg':
      return 'w-11 h-11'
    case 'xl':
      return 'w-14 h-14'
    case '2xl':
      return 'w-20 h-20'
    case '3xl':
      return 'w-28 h-28'
    default:
      return 'w-9 h-9'
  }
})

const claseTexto = computed(() => {
  switch (props.size) {
    case 'xs':
      return 'text-[9px]'
    case 'sm':
      return 'text-[10px]'
    case 'md':
      return 'text-xs'
    case 'lg':
      return 'text-sm'
    case 'xl':
      return 'text-lg'
    case '2xl':
      return 'text-2xl'
    case '3xl':
      return 'text-4xl'
    default:
      return 'text-xs'
  }
})

const estiloContenedor = computed(() => {
  return {}
})
</script>

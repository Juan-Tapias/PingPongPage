<script setup lang="ts">
import { computed } from 'vue'

export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline'
export type ButtonSize = 'sm' | 'md' | 'lg'
export type ButtonType = 'button' | 'submit' | 'reset'

interface Props {
  variant?: ButtonVariant
  size?: ButtonSize
  type?: ButtonType
  disabled?: boolean
  loading?: boolean
  block?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
  disabled: false,
  loading: false,
  block: false,
})

const emit = defineEmits<{
  (e: 'click', event: MouseEvent): void
}>()

const handleClick = (event: MouseEvent) => {
  if (props.disabled || props.loading) return
  emit('click', event)
}

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'primary':
      return 'bg-primary hover:bg-green-700 text-white shadow-md shadow-green-950/30 border border-green-500/20'
    case 'secondary':
      return 'bg-secondary hover:bg-blue-700 text-white shadow-md shadow-blue-950/30 border border-blue-500/20'
    case 'danger':
      return 'bg-danger hover:bg-red-700 text-white shadow-md shadow-red-950/30 border border-red-500/20'
    case 'ghost':
      return 'bg-transparent hover:bg-surface-hover text-gray-300 hover:text-white border border-transparent'
    case 'outline':
      return 'bg-transparent border border-gray-700 hover:border-gray-500 text-gray-200 hover:bg-surface-hover'
    default:
      return 'bg-primary text-white'
  }
})

const sizeClasses = computed(() => {
  switch (props.size) {
    case 'sm':
      return 'px-3 py-1.5 text-xs rounded-md'
    case 'lg':
      return 'px-6 py-3.5 text-base font-semibold rounded-xl'
    case 'md':
    default:
      return 'px-4 py-2.5 text-sm font-medium rounded-lg'
  }
})
</script>

<template>
  <button
    :type="type"
    :disabled="disabled || loading"
    :class="[
      'inline-flex items-center justify-center font-heading transition-all duration-200 ease-in-out select-none',
      'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background',
      variantClasses,
      sizeClasses,
      block ? 'w-full' : '',
      disabled || loading
        ? 'opacity-50 cursor-not-allowed transform-none shadow-none'
        : 'hover:-translate-y-0.5 active:translate-y-0 cursor-pointer',
    ]"
    @click="handleClick"
  >
    <svg
      v-if="loading"
      class="animate-spin -ml-1 mr-2.5 h-4 w-4 text-current"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle
        class="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        stroke-width="4"
      />
      <path
        class="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>

    <slot />
  </button>
</template>

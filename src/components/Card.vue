<script setup lang="ts">
import { computed } from 'vue'

export type CardVariant = 'default' | 'interactive' | 'glass'
export type CardPadding = 'none' | 'sm' | 'md' | 'lg'

interface Props {
  variant?: CardVariant
  padding?: CardPadding
  as?: string
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  padding: 'md',
  as: 'div',
})

const variantClasses = computed(() => {
  switch (props.variant) {
    case 'interactive':
      return 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 hover:shadow-xl transition-all duration-200 cursor-pointer'
    case 'glass':
      return 'bg-white/95 dark:bg-slate-900/90 backdrop-blur-md border border-slate-200/90 dark:border-slate-800 shadow-xl shadow-slate-300/40 dark:shadow-black/50'
    case 'default':
    default:
      return 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg shadow-slate-200/50 dark:shadow-black/40'
  }
})

const paddingClasses = computed(() => {
  switch (props.padding) {
    case 'none':
      return 'p-0'
    case 'sm':
      return 'p-3 sm:p-4'
    case 'lg':
      return 'p-6 sm:p-8 lg:p-10'
    case 'md':
    default:
      return 'p-5 sm:p-7'
  }
})
</script>

<template>
  <component
    :is="as"
    :class="[
      'rounded-2xl overflow-hidden transition-colors',
      variantClasses,
      paddingClasses,
    ]"
  >
    <header v-if="$slots.header" class="mb-5 pb-4 border-b border-slate-200 dark:border-slate-800">
      <slot name="header" />
    </header>

    <main>
      <slot />
    </main>

    <footer v-if="$slots.footer" class="mt-6 pt-4 border-t border-slate-200 dark:border-slate-800">
      <slot name="footer" />
    </footer>
  </component>
</template>

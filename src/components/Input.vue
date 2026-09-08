<script setup lang="ts">
import { ref, computed } from 'vue'
import { Eye, EyeOff } from 'lucide-vue-next'

interface Props {
  modelValue: string | number
  label?: string
  placeholder?: string
  type?: 'text' | 'email' | 'password' | 'tel' | 'number'
  error?: string
  hint?: string
  id?: string
  disabled?: boolean
  required?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  error: '',
  hint: '',
  id: '',
  disabled: false,
  required: false,
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const showPassword = ref(false)

const inputType = computed(() => {
  if (props.type !== 'password') return props.type
  return showPassword.value ? 'text' : 'password'
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  emit('update:modelValue', target.value)
}
</script>

<template>
  <div class="w-full flex flex-col gap-1.5">
    <label
      v-if="label"
      :for="id"
      class="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 font-heading"
    >
      {{ label }}
      <span v-if="required" class="text-red-500 ml-0.5">*</span>
    </label>

    <div class="relative flex items-center">
      <input
        :id="id"
        :type="inputType"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :required="required"
        :class="[
          'w-full bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 rounded-xl px-3.5 py-2.5 text-sm transition-all duration-200 outline-none',
          'border',
          error
            ? 'border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-slate-300 dark:border-slate-700 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20',
          disabled ? 'opacity-50 cursor-not-allowed bg-slate-100 dark:bg-slate-900' : 'hover:border-slate-400 dark:hover:border-slate-600',
          type === 'password' ? 'pr-10' : '',
        ]"
        @input="handleInput"
      />

      <button
        v-if="type === 'password'"
        type="button"
        tabindex="-1"
        class="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer p-1"
        @click="showPassword = !showPassword"
      >
        <EyeOff v-if="showPassword" class="w-4 h-4" />
        <Eye v-else class="w-4 h-4" />
      </button>
    </div>

    <span v-if="error" class="text-xs text-red-600 dark:text-red-400 font-medium mt-0.5">
      {{ error }}
    </span>
    <span v-else-if="hint" class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
      {{ hint }}
    </span>
  </div>
</template>

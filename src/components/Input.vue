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
      class="text-xs font-semibold uppercase tracking-wider text-gray-400 font-heading"
    >
      {{ label }}
      <span v-if="required" class="text-red-400 ml-0.5">*</span>
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
          'w-full bg-surface text-gray-100 placeholder-gray-500 rounded-lg px-3.5 py-2.5 text-sm transition-all duration-200 outline-none',
          'border',
          error
            ? 'border-red-500/80 focus:border-red-500 focus:ring-2 focus:ring-red-500/20'
            : 'border-gray-800 focus:border-primary focus:ring-2 focus:ring-primary/20',
          disabled ? 'opacity-50 cursor-not-allowed bg-gray-950' : 'hover:border-gray-700',
          type === 'password' ? 'pr-10' : '',
        ]"
        @input="handleInput"
      />

      <button
        v-if="type === 'password'"
        type="button"
        tabindex="-1"
        class="absolute right-3 text-gray-400 hover:text-gray-200 transition-colors cursor-pointer p-1"
        @click="showPassword = !showPassword"
      >
        <EyeOff v-if="showPassword" class="w-4 h-4" />
        <Eye v-else class="w-4 h-4" />
      </button>
    </div>

    <span v-if="error" class="text-xs text-red-400 font-medium mt-0.5">
      {{ error }}
    </span>
    <span v-else-if="hint" class="text-xs text-gray-500 mt-0.5">
      {{ hint }}
    </span>
  </div>
</template>

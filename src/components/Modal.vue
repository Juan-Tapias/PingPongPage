<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
        @click.self="handleOverlayClick"
      >
        <div
          :class="[
            'w-full bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col',
            'animate-in fade-in zoom-in-95 duration-200',
            maxWidthClass,
            customClass,
          ]"
        >
          <div
            v-if="title || $slots.header"
            class="px-6 py-4 flex items-start justify-between border-b border-slate-100 bg-white"
          >
            <slot name="header">
              <div class="text-left pr-4">
                <h3 class="text-base sm:text-lg font-bold font-heading text-slate-900 tracking-tight">
                  {{ title }}
                </h3>
                <p v-if="subTitle" class="text-xs text-slate-500 mt-0.5">
                  {{ subTitle }}
                </p>
              </div>
            </slot>

            <div class="flex items-center gap-2">
              <slot name="header-right" />
              <button
                v-if="showClose"
                type="button"
                :disabled="loading"
                class="text-slate-400 hover:text-slate-700 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                @click="close"
              >
                <X class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div class="px-6 py-5 overflow-y-auto max-h-[calc(100vh-220px)] text-sm text-slate-700">
            <slot />
          </div>

          <div
            v-if="footer"
            class="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5"
          >
            <slot name="footer">
              <Button
                v-if="btnCancel"
                :variant="btnCancelVariant"
                size="sm"
                :disabled="loading"
                @click="close"
              >
                {{ cancel }}
              </Button>

              <Button
                v-if="btnConfirm"
                :variant="btnActionVariant"
                size="sm"
                :loading="loading"
                :disabled="disableAction"
                @click="handleAction"
              >
                {{ action }}
              </Button>
            </slot>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { X } from 'lucide-vue-next'
import Button, { type ButtonVariant } from '@/components/Button.vue'

interface Props {
  modelValue?: boolean
  title?: string
  subTitle?: string
  action?: string
  cancel?: string
  btnConfirm?: boolean
  btnCancel?: boolean
  btnActionVariant?: ButtonVariant
  btnCancelVariant?: ButtonVariant
  width?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  loading?: boolean
  disableAction?: boolean
  closeOnClickModal?: boolean
  showClose?: boolean
  footer?: boolean
  customClass?: string
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  title: '',
  subTitle: '',
  action: 'Aceptar',
  cancel: 'Cancelar',
  btnConfirm: true,
  btnCancel: true,
  btnActionVariant: 'emerald',
  btnCancelVariant: 'ghost',
  width: 'md',
  loading: false,
  disableAction: false,
  closeOnClickModal: true,
  showClose: true,
  footer: true,
  customClass: '',
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'close'): void
  (e: 'action'): void
}>()

const visible = ref(props.modelValue)

watch(
  () => props.modelValue,
  (val) => {
    visible.value = val
  },
)

watch(visible, (val) => {
  emit('update:modelValue', val)
  if (!val) emit('close')
})

const maxWidthClass = computed(() => {
  switch (props.width) {
    case 'sm':
      return 'max-w-sm'
    case 'lg':
      return 'max-w-xl'
    case 'xl':
      return 'max-w-2xl'
    case '2xl':
      return 'max-w-4xl'
    case 'md':
    default:
      return 'max-w-lg'
  }
})

const open = () => {
  visible.value = true
}

const close = () => {
  if (props.loading) return
  visible.value = false
}

const handleOverlayClick = () => {
  if (props.closeOnClickModal && !props.loading) {
    close()
  }
}

const handleAction = () => {
  if (props.disableAction || props.loading) return
  emit('action')
}

defineExpose({
  open,
  close,
})
</script>

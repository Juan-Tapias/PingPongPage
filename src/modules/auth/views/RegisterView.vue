<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { useRouter, RouterLink } from 'vue-router'
import { BookOpen } from 'lucide-vue-next'
import Card from '@/components/Card.vue'
import Input from '@/components/Input.vue'
import Button from '@/components/Button.vue'
import SelectorTipoUsuario from './partials/SelectorTipoUsuario.vue'
import { registroSchema } from '@/modules/auth/schemas/authSchemas'
import { useAuthStore } from '@/stores/auth'
import { useReglamento } from '@/composables/useReglamento'
import type { TipoUsuario } from '@/types'

const router = useRouter()
const authStore = useAuthStore()
const { abrirReglamento } = useReglamento()

const { handleSubmit, errors } = useForm({
  validationSchema: registroSchema,
  initialValues: {
    nombre: '',
    apellido: '',
    email: '',
    telefono: '',
    tipo: '' as TipoUsuario,
    password: '',
    confirmPassword: '',
    aceptaReglamento: false,
  },
})

const { value: nombre } = useField<string>('nombre')
const { value: apellido } = useField<string>('apellido')
const { value: email } = useField<string>('email')
const { value: telefono } = useField<string>('telefono')
const { value: tipo } = useField<TipoUsuario | ''>('tipo')
const { value: password } = useField<string>('password')
const { value: confirmPassword } = useField<string>('confirmPassword')
const { value: aceptaReglamento } = useField<boolean>('aceptaReglamento')

const onSubmit = handleSubmit(async (values) => {
  try {
    await authStore.registro(values)
    router.push('/')
  } catch {
  }
})
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center p-4 bg-slate-100/90 dark:bg-[#080d1a] transition-colors duration-300 py-10">
    <div class="w-full max-w-lg flex flex-col gap-6">
      <header class="text-center flex flex-col items-center">
        <div class="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-xl shadow-md mb-2">
          🏓
        </div>
        <h1 class="text-3xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
          SpinApp Torneo
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
          Regístrate para participar en el torneo de ping pong
        </p>
      </header>

      <Card variant="glass" padding="lg">
        <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
          <div
            v-if="authStore.errorAuth"
            class="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2"
          >
            <span>{{ authStore.errorAuth }}</span>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="registro-nombre"
              v-model="nombre"
              label="Nombre"
              placeholder="Juan"
              :error="errors.nombre"
              required
            />
            <Input
              id="registro-apellido"
              v-model="apellido"
              label="Apellido"
              placeholder="Pérez"
              :error="errors.apellido"
              required
            />
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="registro-email"
              v-model="email"
              label="Correo Electrónico"
              type="email"
              placeholder="juan@campuslands.com"
              :error="errors.email"
              required
            />
            <Input
              id="registro-telefono"
              v-model="telefono"
              label="Teléfono / WhatsApp"
              type="tel"
              placeholder="3001234567"
              :error="errors.telefono"
              required
            />
          </div>

          <SelectorTipoUsuario
            v-model="tipo"
            :error="errors.tipo"
          />

          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              id="registro-password"
              v-model="password"
              label="Contraseña"
              type="password"
              placeholder="••••••••"
              :error="errors.password"
              required
            />
            <Input
              id="registro-confirm"
              v-model="confirmPassword"
              label="Confirmar"
              type="password"
              placeholder="••••••••"
              :error="errors.confirmPassword"
              required
            />
          </div>

          <!-- Aceptación del Reglamento Oficial -->
          <div class="flex flex-col gap-1 mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800">
            <label class="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 dark:text-slate-300 select-none">
              <input
                id="registro-acepta-reglamento"
                v-model="aceptaReglamento"
                type="checkbox"
                class="mt-0.5 rounded border-slate-300 dark:border-slate-700 text-orange-600 focus:ring-orange-500 shrink-0 cursor-pointer"
              />
              <span class="leading-relaxed">
                He leído y acepto el
                <button
                  type="button"
                  class="font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer inline-flex items-center gap-1 ml-0.5"
                  @click.prevent="abrirReglamento"
                >
                  <span>Reglamento Oficial ITTF / Torneo</span>
                  <BookOpen class="w-3.5 h-3.5 text-orange-500" />
                </button>
              </span>
            </label>
            <span v-if="errors.aceptaReglamento" class="text-[11px] text-red-500 dark:text-red-400 font-medium pl-6">
              {{ errors.aceptaReglamento }}
            </span>
          </div>

          <div class="mt-3 flex justify-center">
            <Button
              type="submit"
              variant="primary"
              size="md"
              block
              :loading="authStore.cargando"
            >
              Completar Registro
            </Button>
          </div>
        </form>

        <template #footer>
          <div class="text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
            ¿Ya tienes una cuenta registrada?
            <RouterLink
              to="/login"
              class="font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors ml-1"
            >
              Inicia sesión aquí
            </RouterLink>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { useRouter, RouterLink } from 'vue-router'
import { Trophy } from 'lucide-vue-next'
import Card from '@/components/Card.vue'
import Input from '@/components/Input.vue'
import Button from '@/components/Button.vue'
import SelectorTipoUsuario from './partials/SelectorTipoUsuario.vue'
import { registroSchema } from '@/modules/auth/schemas/authSchemas'
import { useAuthStore } from '@/stores/auth'
import type { TipoUsuario } from '@/types'

const router = useRouter()
const authStore = useAuthStore()

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
  },
})

const { value: nombre } = useField<string>('nombre')
const { value: apellido } = useField<string>('apellido')
const { value: email } = useField<string>('email')
const { value: telefono } = useField<string>('telefono')
const { value: tipo } = useField<TipoUsuario | ''>('tipo')
const { value: password } = useField<string>('password')
const { value: confirmPassword } = useField<string>('confirmPassword')

const onSubmit = handleSubmit(async (values) => {
  try {
    await authStore.registro(values)
    router.push('/')
  } catch {
  }
})
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center p-4 bg-background py-10">
    <div class="w-full max-w-lg flex flex-col gap-6">
      <header class="text-center flex flex-col items-center">
        <h1 class="text-3xl font-semibold font-heading text-white tracking-tight">
          SpinApp Torneo
        </h1>
        <p class="text-sm text-slate-300 mt-1">
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

          <div class="mt-3 flex justify-center">
            <Button
              type="submit"
              variant="primary"
              size="md"
              :loading="authStore.cargando"
            >
              Completar Registro
            </Button>
          </div>
        </form>

        <template #footer>
          <div class="text-center text-xs text-gray-400">
            ¿Ya tienes una cuenta registrada?
            <RouterLink
              to="/login"
              class="font-semibold text-emerald-400 hover:text-emerald-300 transition-colors ml-1"
            >
              Inicia sesión aquí
            </RouterLink>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

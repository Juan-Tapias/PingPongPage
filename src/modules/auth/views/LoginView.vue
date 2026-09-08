<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { useRouter, RouterLink } from 'vue-router'
import Card from '@/components/Card.vue'
import Input from '@/components/Input.vue'
import Button from '@/components/Button.vue'
import { loginSchema } from '@/modules/auth/schemas/authSchemas'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const { handleSubmit, errors } = useForm({
  validationSchema: loginSchema,
  initialValues: {
    email: '',
    password: '',
  },
})

const { value: email } = useField<string>('email')
const { value: password } = useField<string>('password')

const onSubmit = handleSubmit(async (values) => {
  try {
    await authStore.login(values)
    if (authStore.esAdmin) {
      router.push('/admin')
    } else {
      router.push('/')
    }
  } catch {
  }
})
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center p-4 bg-slate-100/90 dark:bg-[#080d1a] transition-colors duration-300">
    <div class="w-full max-w-md flex flex-col gap-6">
      <header class="text-center flex flex-col items-center">
        <div class="w-12 h-12 rounded-2xl bg-orange-600 text-white flex items-center justify-center font-black text-xl shadow-md mb-2">
          🏓
        </div>
        <h1 class="text-3xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
          SpinApp Torneo
        </h1>
        <p class="text-sm text-slate-600 dark:text-slate-400 mt-1 font-medium">
          Inicia sesión para acceder a tus partidos y tabla de posiciones
        </p>
      </header>

      <Card variant="glass" padding="lg">
        <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
          <div v-if="authStore.errorAuth"
            class="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2">
            <span>{{ authStore.errorAuth }}</span>
          </div>

          <Input id="login-email" v-model="email" label="Correo Electrónico" type="email"
            placeholder="ejemplo@campuslands.com" :error="errors.email" required />

          <Input id="login-password" v-model="password" label="Contraseña" type="password" placeholder="••••••••"
            :error="errors.password" required />

          <div class="mt-2 flex justify-center">
            <Button type="submit" variant="primary" size="md" block :loading="authStore.cargando">
              Iniciar Sesión
            </Button>
          </div>
        </form>

        <template #footer>
          <div class="text-center text-xs text-slate-600 dark:text-slate-400 font-medium">
            ¿Aún no estás inscrito?
            <RouterLink to="/registro" class="font-bold text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors ml-1">
              Crear cuenta de jugador
            </RouterLink>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

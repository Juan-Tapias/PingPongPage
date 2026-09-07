<script setup lang="ts">
import { useForm, useField } from 'vee-validate'
import { useRouter, RouterLink } from 'vue-router'
import { Trophy, ShieldCheck, UserCheck } from 'lucide-vue-next'
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

const iniciarComoAdminDemo = () => {
  authStore.loginDemoAdmin()
  router.push('/admin')
}

const iniciarComoJugadorDemo = () => {
  authStore.loginDemoJugador()
  router.push('/')
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center p-4 bg-background">
    <div class="w-full max-w-md flex flex-col gap-6">
      <header class="text-center flex flex-col items-center">
        <h1 class="text-3xl font-bold font-heading text-white tracking-tight">
          SpinApp Torneo
        </h1>
        <p class="text-sm text-slate-300 mt-1">
          Inicia sesión para acceder a tus partidos y tabla de posiciones
        </p>
      </header>

      <Card variant="glass" padding="lg">
        <form class="flex flex-col gap-4" @submit.prevent="onSubmit">
          <div v-if="authStore.errorAuth"
            class="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-medium flex items-center gap-2">
            <span>{{ authStore.errorAuth }}</span>
          </div>

          <Input id="login-email" v-model="email" label="Correo Electrónico" type="email"
            placeholder="ejemplo@campuslands.com" :error="errors.email" required />

          <Input id="login-password" v-model="password" label="Contraseña" type="password" placeholder="••••••••"
            :error="errors.password" required />

          <div class="mt-2 flex justify-center">
            <Button type="submit" variant="primary" size="md" :loading="authStore.cargando">
              Iniciar Sesión
            </Button>
          </div>
        </form>

        <!-- Botones de Acceso Rápido / Demo para Pruebas -->
        <div class="mt-5 pt-4 border-t border-slate-700/60 flex flex-col gap-2.5">
          <div class="flex items-center justify-center gap-2">
            <div class="h-px bg-slate-700 flex-1"></div>
            <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">
              Acceso Rápido de Prueba
            </span>
            <div class="h-px bg-slate-700 flex-1"></div>
          </div>

          <div class="grid grid-cols-2 gap-2">
            <button
              type="button"
              class="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900/80 border border-emerald-500/40 transition-all cursor-pointer shadow-xs"
              @click="iniciarComoAdminDemo"
              title="Entrar como Administrador de la plataforma"
            >
              <ShieldCheck class="w-4 h-4 text-emerald-400" />
              <span>Admin Demo</span>
            </button>

            <button
              type="button"
              class="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold text-blue-300 bg-blue-950/60 hover:bg-blue-900/80 border border-blue-500/40 transition-all cursor-pointer shadow-xs"
              @click="iniciarComoJugadorDemo"
              title="Entrar como Jugador del torneo"
            >
              <UserCheck class="w-4 h-4 text-blue-400" />
              <span>Jugador Demo</span>
            </button>
          </div>
        </div>

        <template #footer>
          <div class="text-center text-xs text-gray-400">
            ¿Aún no estás inscrito?
            <RouterLink to="/registro" class="font-semibold text-primary hover:text-green-400 transition-colors ml-1">
              Crear cuenta de jugador
            </RouterLink>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

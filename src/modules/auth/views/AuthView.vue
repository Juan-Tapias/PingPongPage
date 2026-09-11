<script setup lang="ts">
import { ref, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useForm, useField } from 'vee-validate'
import { BookOpen, LogIn, UserPlus, Sparkles } from 'lucide-vue-next'
import Input from '@/components/Input.vue'
import Button from '@/components/Button.vue'
import ThemeTogglePingPong from '@/components/ThemeTogglePingPong.vue'
import SelectorTipoUsuario from './partials/SelectorTipoUsuario.vue'
import AuthDecorativePanel from './partials/AuthDecorativePanel.vue'
import Logo from '@/components/Logo.vue'
import { loginSchema, registroSchema } from '@/modules/auth/schemas/authSchemas'
import { useAuthStore } from '@/stores/auth'
import { useReglamento } from '@/composables/useReglamento'
import type { TipoUsuario } from '@/types'

const props = withDefaults(
  defineProps<{
    initialMode?: 'login' | 'register'
  }>(),
  {
    initialMode: 'login',
  }
)

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()
const { abrirReglamento } = useReglamento()

const activeMode = ref<'login' | 'register'>(props.initialMode)

// Sincronizar con cambios de ruta si el usuario usa botones atrás/adelante del navegador
watch(
  () => route.path,
  (newPath) => {
    if (newPath.includes('registro')) {
      activeMode.value = 'register'
    } else if (newPath.includes('login')) {
      activeMode.value = 'login'
    }
  }
)

const cambiarModo = (nuevoModo: 'login' | 'register') => {
  activeMode.value = nuevoModo
  if (nuevoModo === 'register') {
    router.replace('/registro')
  } else {
    router.replace('/login')
  }
}

// ==========================================
// FORMULARIO DE LOGIN
// ==========================================
const { handleSubmit: handleLoginSubmit, errors: loginErrors } = useForm({
  validationSchema: loginSchema,
  initialValues: {
    email: '',
    password: '',
  },
})

const { value: loginEmail } = useField<string>('email')
const { value: loginPassword } = useField<string>('password')

const onLoginSubmit = handleLoginSubmit(async (values) => {
  try {
    await authStore.login(values)
    if (authStore.esAdmin) {
      router.push('/admin')
    } else {
      router.push('/')
    }
  } catch {
    // El error se gestiona mediante authStore.errorAuth
  }
})

// ==========================================
// FORMULARIO DE REGISTRO
// ==========================================
const { handleSubmit: handleRegisterSubmit, errors: registerErrors } = useForm({
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

const { value: regNombre } = useField<string>('nombre')
const { value: regApellido } = useField<string>('apellido')
const { value: regEmail } = useField<string>('email')
const { value: regTelefono } = useField<string>('telefono')
const { value: regTipo } = useField<TipoUsuario | ''>('tipo')
const { value: regPassword } = useField<string>('password')
const { value: regConfirmPassword } = useField<string>('confirmPassword')
const { value: regAceptaReglamento } = useField<boolean>('aceptaReglamento')

const onRegisterSubmit = handleRegisterSubmit(async (values) => {
  try {
    await authStore.registro(values)
    router.push('/')
  } catch {
    // El error se gestiona mediante authStore.errorAuth
  }
})
</script>

<template>
  <div class="min-h-screen w-full flex flex-col items-center justify-center p-2.5 sm:p-6 lg:p-8 py-3 sm:py-8 bg-slate-100 dark:bg-[#070b14] text-slate-800 dark:text-slate-100 transition-colors duration-500 relative overflow-x-hidden">
    <!-- Luces ambientales de fondo -->
    <div class="fixed top-0 -left-20 w-96 h-96 bg-orange-500/10 dark:bg-orange-600/15 rounded-full blur-3xl pointer-events-none"></div>
    <div class="fixed bottom-0 -right-20 w-96 h-96 bg-indigo-500/10 dark:bg-purple-900/20 rounded-full blur-3xl pointer-events-none"></div>

    <!-- Barra Superior Flotante con Selector de Tema (Mesa de Ping Pong) -->
    <header class="w-full max-w-5xl flex items-center justify-between py-1.5 px-1 mb-2.5 sm:mb-4 z-20">
      <div class="flex items-center gap-2">
        <span class="text-[11px] sm:text-xs font-black tracking-widest text-slate-400 dark:text-slate-500 uppercase flex items-center gap-1.5">
          <Sparkles class="w-3.5 h-3.5 text-orange-500" />
          SpinApp Arena
        </span>
      </div>

      <!-- Control de Modo Claro / Modo Oscuro con diseño de Mesa de Ping Pong -->
      <div class="flex items-center p-0.5 rounded-full bg-white/70 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800 shadow-md">
        <ThemeTogglePingPong />
      </div>
    </header>

    <!-- Contenedor Principal Split-Screen de 2 Columnas -->
    <main class="w-full max-w-5xl rounded-3xl bg-white dark:bg-[#0c1220] border border-slate-200/80 dark:border-slate-800/90 shadow-2xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 relative z-10 transition-all duration-300">
      
      <!-- Columna 1: Panel Decorativo Artístico (Lado Izquierdo en Desktop, Banner superior compacto en Mobile) -->
      <div class="lg:col-span-5 w-full">
        <AuthDecorativePanel :mode="activeMode" />
      </div>

      <!-- Columna 2: Panel de Formulario Dinámico (Lado Derecho en Desktop) -->
      <div class="lg:col-span-7 p-4 sm:p-8 lg:p-10 flex flex-col justify-center bg-white dark:bg-[#0c1220] transition-colors duration-300">
        <Transition name="form-slide" mode="out-in">
          
          <!-- ============================================== -->
          <!-- FORMULARIO DE INICIO DE SESIÓN (LOGIN)        -->
          <!-- ============================================== -->
          <div v-if="activeMode === 'login'" key="login-view" class="w-full max-w-md mx-auto flex flex-col gap-4 sm:gap-6">
            <div>
              <!-- Badge y Logo Oficial SpinApp solicitado por el usuario -->
              <div class="flex flex-col items-start gap-2.5 mb-4">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-white/10 backdrop-blur-md border border-orange-500/20 dark:border-white/15 text-[11px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-300">
                  <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  <span>Torneo Oficial • SpinApp</span>
                </div>
                <Logo variant="horizontal" size="md" />
              </div>

              <span class="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Acceso a Jugadores
              </span>
              <h1 class="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white tracking-tight mt-1">
                Iniciar Sesión
              </h1>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                Ingresa tus credenciales para acceder a tus torneos y partidos activos.
              </p>
            </div>

            <!-- Banner de Error de Firebase si existe -->
            <div
              v-if="authStore.errorAuth"
              class="p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 animate-in fade-in"
            >
              <span>{{ authStore.errorAuth }}</span>
            </div>

            <form class="flex flex-col gap-4" @submit.prevent="onLoginSubmit">
              <Input
                id="login-email"
                v-model="loginEmail"
                label="Correo Electrónico"
                type="email"
                placeholder="ejemplo@campuslands.com"
                :error="loginErrors.email"
                required
              />

              <Input
                id="login-password"
                v-model="loginPassword"
                label="Contraseña"
                type="password"
                placeholder="••••••••"
                :error="loginErrors.password"
                required
              />

              <div class="mt-2">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  block
                  :loading="authStore.cargando"
                  class="cursor-pointer shadow-md py-3 text-sm font-black tracking-wide"
                >
                  <LogIn class="w-4 h-4 mr-2" />
                  <span>Iniciar Sesión</span>
                </Button>
              </div>
            </form>

            <div class="text-center pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 font-medium">
              ¿Aún no estás inscrito en la liga?
              <button
                type="button"
                class="font-black text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors ml-1 cursor-pointer hover:underline inline-flex items-center gap-1"
                @click="cambiarModo('register')"
              >
                <span>Crear cuenta de jugador</span>
                <span>→</span>
              </button>
            </div>
          </div>

          <!-- ============================================== -->
          <!-- FORMULARIO DE REGISTRO                        -->
          <!-- ============================================== -->
          <div v-else key="register-view" class="w-full max-w-lg mx-auto flex flex-col gap-3.5 sm:gap-5">
            <div>
              <!-- Badge y Logo Oficial SpinApp -->
              <div class="flex flex-col items-start gap-2.5 mb-3">
                <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/10 dark:bg-white/10 backdrop-blur-md border border-orange-500/20 dark:border-white/15 text-[11px] font-black uppercase tracking-wider text-orange-600 dark:text-orange-300">
                  <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse"></span>
                  <span>Torneo Oficial • SpinApp</span>
                </div>
                <Logo variant="horizontal" size="md" />
              </div>

              <span class="text-xs font-black uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Nuevo Competidor
              </span>
              <h1 class="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white tracking-tight mt-1">
                Registro de Jugador
              </h1>
              <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
                Crea tu expediente para participar en las fases de grupos y playoffs.
              </p>
            </div>

            <!-- Banner de Error de Firebase si existe -->
            <div
              v-if="authStore.errorAuth"
              class="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-2 animate-in fade-in"
            >
              <span>{{ authStore.errorAuth }}</span>
            </div>

            <form class="flex flex-col gap-2.5 sm:gap-3.5" @submit.prevent="onRegisterSubmit">
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                <Input
                  id="reg-nombre"
                  v-model="regNombre"
                  label="Nombre"
                  placeholder="Juan"
                  :error="registerErrors.nombre"
                  required
                />
                <Input
                  id="reg-apellido"
                  v-model="regApellido"
                  label="Apellido"
                  placeholder="Pérez"
                  :error="registerErrors.apellido"
                  required
                />
              </div>

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  id="reg-email"
                  v-model="regEmail"
                  label="Correo Electrónico"
                  type="email"
                  placeholder="juan@campuslands.com"
                  :error="registerErrors.email"
                  required
                />
                <Input
                  id="reg-telefono"
                  v-model="regTelefono"
                  label="Teléfono / WhatsApp"
                  type="tel"
                  placeholder="3001234567"
                  :error="registerErrors.telefono"
                  required
                />
              </div>

              <!-- Selector Tipo Usuario: Camper / Trabajador -->
              <SelectorTipoUsuario
                v-model="regTipo"
                :error="registerErrors.tipo"
              />

              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  id="reg-password"
                  v-model="regPassword"
                  label="Contraseña"
                  type="password"
                  placeholder="••••••••"
                  :error="registerErrors.password"
                  required
                />
                <Input
                  id="reg-confirm"
                  v-model="regConfirmPassword"
                  label="Confirmar"
                  type="password"
                  placeholder="••••••••"
                  :error="registerErrors.confirmPassword"
                  required
                />
              </div>

              <!-- Checkbox personalizado de Raqueta Roja con Pelota Blanca -->
              <div
                class="flex flex-col gap-1 p-3 rounded-xl transition-all duration-200"
                :class="regAceptaReglamento 
                  ? 'bg-red-500/5 dark:bg-red-950/20 border border-red-500/40 shadow-xs' 
                  : 'bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800/60 hover:border-slate-300 dark:hover:border-slate-700'"
              >
                <label class="flex items-center gap-3 cursor-pointer text-xs text-slate-700 dark:text-slate-300 select-none group">
                  <div class="relative flex items-center justify-center shrink-0">
                    <input
                      id="reg-acepta-reglamento"
                      v-model="regAceptaReglamento"
                      type="checkbox"
                      class="sr-only peer"
                    />
                    <div
                      class="w-8 h-8 rounded-xl border-2 transition-all duration-300 flex items-center justify-center shadow-xs cursor-pointer overflow-visible"
                      :class="regAceptaReglamento 
                        ? 'bg-slate-900 border-red-500 ring-2 ring-red-500/30 scale-110 shadow-red-500/20' 
                        : 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 group-hover:border-red-400/60'"
                    >
                      <!-- Raqueta Roja Activa -->
                      <svg
                        v-if="regAceptaReglamento"
                        class="w-5 h-5 animate-in zoom-in-75 duration-200 drop-shadow-md overflow-visible"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M13.5 13.5 L19.5 19.5 C20.2 20.2 19.8 21.5 18.8 21.8 L17.8 22 C17 22.2 16 21.8 15.5 21 L11 16" fill="#D97706" stroke="#78350F" stroke-width="1.2" stroke-linejoin="round" />
                        <line x1="14" y1="15" x2="17.5" y2="18.5" stroke="#B45309" stroke-width="1" />
                        <circle cx="10" cy="10" r="7" fill="#EF4444" stroke="#B91C1C" stroke-width="1.2" />
                        <path d="M6 8 C6.5 6 9 5.5 11 6.5" stroke="#F87171" stroke-width="1" stroke-linecap="round" fill="none" opacity="0.8" />
                        <circle cx="18.5" cy="5.5" r="2.8" fill="#FFFFFF" stroke="#94A3B8" stroke-width="0.8" class="animate-pulse" />
                      </svg>
                      <!-- Silueta Inactiva -->
                      <svg
                        v-else
                        class="w-5 h-5 opacity-40 group-hover:opacity-70 transition-opacity"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M13.5 13.5 L19.5 19.5 C20.2 20.2 19.8 21.5 18.8 21.8 L17.8 22 C17 22.2 16 21.8 15.5 21 L11 16" fill="#64748B" stroke="#475569" stroke-width="1.2" stroke-linejoin="round" />
                        <circle cx="10" cy="10" r="7" fill="#94A3B8" stroke="#64748B" stroke-width="1.2" />
                        <circle cx="18.5" cy="5.5" r="2.5" fill="#CBD5E1" stroke="#94A3B8" stroke-width="0.6" />
                      </svg>
                    </div>
                  </div>

                  <span class="leading-relaxed">
                    He leído y acepto el
                    <button
                      type="button"
                      class="font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer inline-flex items-center gap-1 ml-0.5"
                      @click.prevent="abrirReglamento"
                    >
                      <span>Reglamento Oficial ITTF</span>
                      <BookOpen class="w-3.5 h-3.5 text-orange-500" />
                    </button>
                  </span>
                </label>
                <span v-if="registerErrors.aceptaReglamento" class="text-[11px] text-red-500 dark:text-red-400 font-medium pl-11">
                  {{ registerErrors.aceptaReglamento }}
                </span>
              </div>

              <div class="mt-1">
                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  block
                  :loading="authStore.cargando"
                  class="cursor-pointer shadow-md py-3 text-sm font-black tracking-wide"
                >
                  <UserPlus class="w-4 h-4 mr-2" />
                  <span>Completar Registro Oficial</span>
                </Button>
              </div>
            </form>

            <div class="text-center pt-2 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-600 dark:text-slate-400 font-medium">
              ¿Ya tienes una cuenta registrada?
              <button
                type="button"
                class="font-black text-orange-600 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-300 transition-colors ml-1 cursor-pointer hover:underline inline-flex items-center gap-1"
                @click="cambiarModo('login')"
              >
                <span>Inicia sesión aquí</span>
                <span>→</span>
              </button>
            </div>
          </div>
        </Transition>
      </div>
    </main>
  </div>
</template>

<style scoped>
.form-slide-enter-active,
.form-slide-leave-active {
  transition: all 0.28s cubic-bezier(0.16, 1, 0.3, 1);
}

.form-slide-enter-from {
  opacity: 0;
  transform: translateX(20px);
}

.form-slide-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style>

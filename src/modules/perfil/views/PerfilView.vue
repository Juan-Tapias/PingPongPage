<template>
  <div class="min-h-screen w-full bg-slate-100 dark:bg-[#060a14] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 relative overflow-x-hidden">
    <FondoEstadioCancha />

    <Navbar class="relative z-10" />

    <main class="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 relative z-10">
      <!-- Breadcrumb de Retorno -->
      <div class="flex items-center justify-between">
        <RouterLink
          to="/"
          class="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          <ArrowLeft class="w-4 h-4" />
          <span>Volver al Panel Principal</span>
        </RouterLink>

        <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
          spinApp 2026 • Identidad Oficial
        </span>
      </div>

      <!-- Tarjeta de Identidad del Jugador (Hero Passport) -->
      <div class="relative overflow-hidden rounded-3xl bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 shadow-xl p-6 sm:p-8">
        <!-- Acento superior de gradiente naranja a azul cielo -->
        <div class="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-orange-500 via-amber-400 to-sky-400" />

        <div class="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8 pt-2">
          <!-- Avatar Principal: clic o "Editar" abre el menú; también acepta arrastrar una foto -->
          <div
            class="relative shrink-0"
            @dragover.prevent="arrastrando = true"
            @dragleave.prevent="arrastrando = false"
            @drop.prevent="handleDrop"
          >
            <input
              ref="inputArchivoRef"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              class="hidden"
              @change="handleSeleccionArchivo"
            />

            <button
              type="button"
              class="relative block rounded-full cursor-pointer focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-500/40"
              :disabled="ocupado"
              aria-label="Cambiar foto de perfil"
              @click="menuFotoAbierto = !menuFotoAbierto"
            >
              <AvatarJugador
                :foto-url="previsualizacionUrl || authStore.usuario?.fotoUrl"
                :nombre="authStore.usuario?.nombre"
                size="3xl"
                :ring-class="arrastrando ? 'ring-4 ring-sky-400 shadow-2xl' : 'ring-4 ring-orange-500/30 shadow-2xl'"
              />
              <!-- Capa de carga mientras sube -->
              <span
                v-if="ocupado"
                class="absolute inset-0 rounded-full bg-black/55 flex items-center justify-center"
              >
                <Loader2 class="w-7 h-7 text-white animate-spin" />
              </span>
            </button>

            <!-- Botón Editar (estilo discreto, abajo a la izquierda) -->
            <button
              type="button"
              :disabled="ocupado"
              class="absolute bottom-1 left-0 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-white/95 dark:bg-[#0c1222]/95 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-700 shadow-sm hover:border-slate-400 dark:hover:border-slate-500 transition-colors cursor-pointer disabled:opacity-60"
              @click="menuFotoAbierto = !menuFotoAbierto"
            >
              <Pencil class="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>

            <!-- Menú de opciones de foto -->
            <template v-if="menuFotoAbierto">
              <div class="fixed inset-0 z-20" @click="menuFotoAbierto = false" />
              <div
                class="absolute left-0 top-full mt-2 z-30 w-52 py-1.5 rounded-xl bg-white dark:bg-[#111a2e] border border-slate-200 dark:border-slate-700 shadow-xl text-sm"
                role="menu"
              >
                <button
                  type="button"
                  role="menuitem"
                  class="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer"
                  @click="abrirSelectorArchivo"
                >
                  <Upload class="w-4 h-4 text-slate-400" />
                  <span>Subir una foto…</span>
                </button>
                <button
                  type="button"
                  role="menuitem"
                  class="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer"
                  @click="irAPresets"
                >
                  <Sparkles class="w-4 h-4 text-slate-400" />
                  <span>Elegir un avatar</span>
                </button>
                <template v-if="authStore.usuario?.fotoUrl">
                  <div class="my-1 border-t border-slate-200 dark:border-slate-700" />
                  <button
                    type="button"
                    role="menuitem"
                    class="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer"
                    @click="menuFotoAbierto = false; quitarFotoPerfil()"
                  >
                    <Trash2 class="w-4 h-4" />
                    <span>Quitar foto</span>
                  </button>
                </template>
              </div>
            </template>
          </div>

          <!-- Información del Usuario -->
          <div class="flex-1 text-center sm:text-left space-y-2">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 class="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
                  {{ authStore.usuario?.nombre }} {{ authStore.usuario?.apellido }}
                </h1>
                <p class="text-xs sm:text-sm font-mono text-slate-500 dark:text-slate-400 mt-0.5">
                  {{ authStore.usuario?.email }}
                </p>
              </div>

              <div class="flex items-center justify-center sm:justify-end gap-2">
                <span
                  v-if="authStore.esAdmin"
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30"
                >
                  <ShieldCheck class="w-3.5 h-3.5" />
                  <span>Admin</span>
                </span>
                <span
                  v-else
                  class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-sky-500/15 text-sky-600 dark:text-sky-400 border border-sky-500/30"
                >
                  <Trophy class="w-3.5 h-3.5" />
                  <span>Jugador Oficial</span>
                </span>
              </div>
            </div>

            <!-- Chips de Tipo de Usuario y Teléfono -->
            <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2 pt-2">
              <span
                v-if="authStore.usuario?.tipo === 'camper'"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30"
              >
                <GraduationCap class="w-3.5 h-3.5" />
                <span>Camper</span>
              </span>
              <span
                v-else-if="authStore.usuario?.tipo === 'trabajador'"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold uppercase tracking-wider bg-purple-500/15 text-purple-700 dark:text-purple-300 border border-purple-500/30"
              >
                <Briefcase class="w-3.5 h-3.5" />
                <span>Colaborador</span>
              </span>

              <span
                v-if="authStore.usuario?.telefono"
                class="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 font-mono"
              >
                <Phone class="w-3 h-3 text-slate-400" />
                <span>{{ authStore.usuario.telefono }}</span>
              </span>
            </div>

            <p class="text-xs text-slate-500 dark:text-slate-400 pt-1">
              Tu foto o avatar se sincroniza en vivo en la Rueda de Burbujas, la Tabla de Posiciones, el cuadro de Playoffs y en el correo estelar de la Gran Final.
            </p>
          </div>
        </div>
      </div>

      <!-- Alertas de Estado -->
      <div
        v-if="mensajeExito"
        class="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-in fade-in"
      >
        <div class="flex items-center gap-2.5">
          <CheckCircle2 class="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{{ mensajeExito }}</span>
        </div>
        <button type="button" class="text-emerald-700 dark:text-emerald-300 hover:opacity-80" @click="mensajeExito = ''">
          <X class="w-4 h-4" />
        </button>
      </div>

      <div
        v-if="errorOperacion"
        class="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs sm:text-sm font-bold flex items-center justify-between gap-3 animate-in fade-in"
      >
        <div class="flex items-center gap-2.5">
          <AlertTriangle class="w-5 h-5 text-rose-600 shrink-0" />
          <span>{{ errorOperacion }}</span>
        </div>
        <button type="button" class="text-rose-700 dark:text-rose-300 hover:opacity-80" @click="errorOperacion = ''">
          <X class="w-4 h-4" />
        </button>
      </div>

      <!-- Avatares deportivos (presets) -->
      <section
        ref="seccionPresetsRef"
        class="p-6 rounded-3xl bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 shadow-sm space-y-4 scroll-mt-24"
      >
        <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h3 class="text-base font-black text-slate-900 dark:text-white font-heading">
              Avatares deportivos
            </h3>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              ¿Prefieres no usar tu foto? Elige uno de campeonato.
            </p>
          </div>
          <button
            type="button"
            :disabled="!presetSeleccionadoId || guardandoPreset"
            class="self-start sm:self-auto inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
            @click="guardarPresetSeleccionado"
          >
            <Loader2 v-if="guardandoPreset" class="w-3.5 h-3.5 animate-spin" />
            <Check v-else class="w-3.5 h-3.5" />
            <span>{{ guardandoPreset ? 'Guardando...' : 'Aplicar avatar' }}</span>
          </button>
        </div>

        <div class="grid grid-cols-3 sm:grid-cols-5 gap-3">
          <button
            v-for="preset in AVATARES_PRESET"
            :key="preset.id"
            type="button"
            :title="preset.descripcion"
            :class="[
              'group p-3 rounded-2xl border transition-all text-center flex flex-col items-center gap-2 cursor-pointer',
              presetSeleccionadoId === preset.id
                ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/40 ring-2 ring-sky-500/30'
                : 'border-slate-200 dark:border-slate-800 hover:border-sky-400 bg-slate-50/50 dark:bg-slate-900/40'
            ]"
            @click="seleccionarPreset(preset)"
          >
            <div class="w-12 h-12 rounded-full overflow-hidden shadow-md group-hover:scale-105 transition-transform">
              <img :src="preset.dataUrl" :alt="preset.nombre" class="w-full h-full object-cover" />
            </div>
            <span class="text-[11px] font-bold text-slate-800 dark:text-slate-200 leading-tight">
              {{ preset.nombre }}
            </span>
          </button>
        </div>
      </section>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ArrowLeft,
  Upload,
  Pencil,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  X,
  Check,
  Loader2,
  Trash2,
  ShieldCheck,
  Trophy,
  GraduationCap,
  Briefcase,
  Phone,
} from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import FondoEstadioCancha from '@/components/FondoEstadioCancha.vue'
import AvatarJugador from '@/components/AvatarJugador.vue'
import { useAuthStore } from '@/stores/auth'
import {
  AVATARES_PRESET,
  subirFotoPerfil,
  guardarFotoPerfilUsuario,
  validarArchivoImagen,
  type AvatarPreset,
} from '@/services/perfilService'

const authStore = useAuthStore()

const inputArchivoRef = ref<HTMLInputElement | null>(null)
const archivoSeleccionado = ref<File | null>(null)
const previsualizacionUrl = ref<string | null>(null)
const arrastrando = ref(false)
const guardandoFoto = ref(false)
const guardandoPreset = ref(false)
const eliminandoFoto = ref(false)

const presetSeleccionadoId = ref<string | null>(null)
const mensajeExito = ref('')
const errorOperacion = ref('')

const menuFotoAbierto = ref(false)
const seccionPresetsRef = ref<HTMLElement | null>(null)

const ocupado = computed(() => guardandoFoto.value || eliminandoFoto.value)

const abrirSelectorArchivo = () => {
  menuFotoAbierto.value = false
  inputArchivoRef.value?.click()
}

const irAPresets = () => {
  menuFotoAbierto.value = false
  seccionPresetsRef.value?.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

const procesarArchivo = (archivo: File) => {
  errorOperacion.value = ''
  mensajeExito.value = ''

  const validacion = validarArchivoImagen(archivo)
  if (!validacion.valido) {
    errorOperacion.value = validacion.error || 'Archivo no válido.'
    return
  }

  archivoSeleccionado.value = archivo
  presetSeleccionadoId.value = null

  // Previsualización local inmediata
  const reader = new FileReader()
  reader.onload = (e) => {
    previsualizacionUrl.value = e.target?.result as string
  }
  reader.readAsDataURL(archivo)

  // Se guarda de inmediato: sin botón extra de "Guardar"
  void guardarFotoSubida()
}

const handleSeleccionArchivo = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    procesarArchivo(target.files[0])
  }
  // Permite volver a elegir el mismo archivo
  target.value = ''
}

const handleDrop = (e: DragEvent) => {
  arrastrando.value = false
  if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
    procesarArchivo(e.dataTransfer.files[0])
  }
}

const seleccionarPreset = (preset: AvatarPreset) => {
  presetSeleccionadoId.value = preset.id
  archivoSeleccionado.value = null
  previsualizacionUrl.value = preset.dataUrl
  errorOperacion.value = ''
  mensajeExito.value = ''
}

const guardarFotoSubida = async () => {
  if (!archivoSeleccionado.value || !authStore.usuario?.id) return

  guardandoFoto.value = true
  errorOperacion.value = ''
  mensajeExito.value = ''

  try {
    const urlDescarga = await subirFotoPerfil(
      authStore.usuario.id,
      archivoSeleccionado.value
    )

    await guardarFotoPerfilUsuario(authStore.usuario.id, urlDescarga, authStore.usuario.fotoUrl)

    // Actualizar el estado global del usuario en el store
    authStore.usuario.fotoUrl = urlDescarga
    previsualizacionUrl.value = urlDescarga
    archivoSeleccionado.value = null
    mensajeExito.value = '¡Foto de perfil actualizada exitosamente!'
  } catch (err: any) {
    console.error('Error al subir avatar:', err)
    previsualizacionUrl.value = null
    archivoSeleccionado.value = null
    errorOperacion.value = err.message || 'No fue posible subir la imagen. Inténtalo de nuevo.'
  } finally {
    guardandoFoto.value = false
  }
}

const guardarPresetSeleccionado = async () => {
  if (!presetSeleccionadoId.value || !authStore.usuario?.id) return

  const preset = AVATARES_PRESET.find((p) => p.id === presetSeleccionadoId.value)
  if (!preset) return

  guardandoPreset.value = true
  errorOperacion.value = ''
  mensajeExito.value = ''

  try {
    await guardarFotoPerfilUsuario(authStore.usuario.id, preset.dataUrl, authStore.usuario.fotoUrl)
    authStore.usuario.fotoUrl = preset.dataUrl
    previsualizacionUrl.value = preset.dataUrl
    mensajeExito.value = `¡Avatar "${preset.nombre}" aplicado con éxito!`
  } catch (err: any) {
    console.error('Error al guardar preset:', err)
    errorOperacion.value = err.message || 'No fue posible guardar el avatar elegido.'
  } finally {
    guardandoPreset.value = false
  }
}

const quitarFotoPerfil = async () => {
  if (!authStore.usuario?.id) return

  eliminandoFoto.value = true
  errorOperacion.value = ''
  mensajeExito.value = ''

  try {
    await guardarFotoPerfilUsuario(authStore.usuario.id, '', authStore.usuario.fotoUrl)
    authStore.usuario.fotoUrl = ''
    previsualizacionUrl.value = null
    archivoSeleccionado.value = null
    presetSeleccionadoId.value = null
    mensajeExito.value = 'Se restablecieron las iniciales con el fondo degradado reglamentario.'
  } catch (err: any) {
    console.error('Error al quitar foto:', err)
    errorOperacion.value = err.message || 'Error al restablecer avatar.'
  } finally {
    eliminandoFoto.value = false
  }
}

</script>


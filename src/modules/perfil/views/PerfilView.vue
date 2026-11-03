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
          <!-- Avatar Principal con Previsualización Reactiva -->
          <div class="relative group">
            <AvatarJugador
              :foto-url="previsualizacionUrl || authStore.usuario?.fotoUrl"
              :nombre="authStore.usuario?.nombre"
              size="3xl"
              ring-class="ring-4 ring-orange-500/30 shadow-2xl"
            />

            <!-- Badge de estado -->
            <span
              class="absolute bottom-1 right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-[#0c1222] shadow-md flex items-center justify-center text-[10px] text-white font-bold"
              title="Jugador Activo"
            >
              ✓
            </span>
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

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- ============================================== -->
        <!-- SECCIÓN 1: SUBIDA DE FOTO PERSONAL             -->
        <!-- ============================================== -->
        <div class="p-6 rounded-3xl bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex flex-col justify-between gap-5">
          <div class="space-y-3">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                <Camera class="w-5 h-5 text-orange-500" />
              </div>
              <div>
                <h3 class="text-base font-black text-slate-900 dark:text-white font-heading">
                  1. Subir Foto Personal
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Archivos .jpg, .png o .webp (máx. 3 MB)
                </p>
              </div>
            </div>

            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              Sube una imagen cuadrada o nítida de tu rostro para que tus rivales te identifiquen de inmediato en las burbujas de partido y en el correo oficial de la Gran Final.
            </p>

            <!-- Zona Dropzone / Selector de Archivo -->
            <div
              class="relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
              :class="[
                arrastrando
                  ? 'border-orange-500 bg-orange-50/40 dark:bg-orange-950/20'
                  : 'border-slate-300 dark:border-slate-700 hover:border-orange-500/70 bg-slate-50/50 dark:bg-slate-900/30'
              ]"
              @dragover.prevent="arrastrando = true"
              @dragleave.prevent="arrastrando = false"
              @drop.prevent="handleDrop"
              @click="abrirSelectorArchivo"
            >
              <input
                ref="inputArchivoRef"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                class="hidden"
                @change="handleSeleccionArchivo"
              />

              <div class="w-12 h-12 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                <UploadCloud class="w-6 h-6" />
              </div>

              <div class="space-y-0.5">
                <p class="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200">
                  <span class="text-orange-600 dark:text-orange-400 underline">Haz clic para elegir</span> o arrastra tu foto aquí
                </p>
                <p class="text-[11px] text-slate-400">
                  JPG, PNG o WEBP de hasta 3MB
                </p>
              </div>

              <div v-if="archivoSeleccionado" class="mt-2 px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-800 flex items-center gap-2 text-xs font-bold text-orange-700 dark:text-orange-300">
                <ImageIcon class="w-3.5 h-3.5" />
                <span class="truncate max-w-[200px]">{{ archivoSeleccionado.name }}</span>
                <span class="text-[10px] text-orange-500 font-mono">({{ formatearTamano(archivoSeleccionado.size) }})</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button
              type="button"
              :disabled="!archivoSeleccionado || guardandoFoto"
              class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-orange-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              @click="guardarFotoSubida"
            >
              <Loader2 v-if="guardandoFoto" class="w-4 h-4 animate-spin" />
              <Check v-else class="w-4 h-4" />
              <span>{{ guardandoFoto ? 'Subiendo a Storage...' : 'Guardar Foto Personal' }}</span>
            </button>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- SECCIÓN 2: CATÁLOGO DE AVATARES PRESET         -->
        <!-- ============================================== -->
        <div class="p-6 rounded-3xl bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex flex-col justify-between gap-5">
          <div class="space-y-3">
            <div class="flex items-center gap-2.5">
              <div class="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
                <Sparkles class="w-5 h-5 text-sky-500" />
              </div>
              <div>
                <h3 class="text-base font-black text-slate-900 dark:text-white font-heading">
                  2. Avatares Deportivos (Presets)
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400">
                  Temática oficial de tenis de mesa
                </p>
              </div>
            </div>

            <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              ¿Prefieres no subir tu foto personal? Elige uno de nuestros 5 avatares vectoriales de campeonato para lucirlo en el torneo:
            </p>

            <!-- Cuadrícula de Presets -->
            <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-1">
              <button
                v-for="preset in AVATARES_PRESET"
                :key="preset.id"
                type="button"
                :class="[
                  'group p-3 rounded-2xl border transition-all text-center flex flex-col items-center justify-center gap-2 cursor-pointer',
                  presetSeleccionadoId === preset.id
                    ? 'border-sky-500 bg-sky-50/60 dark:bg-sky-950/40 ring-2 ring-sky-500/30 shadow-md'
                    : 'border-slate-200 dark:border-slate-800 hover:border-sky-400 bg-slate-50/50 dark:bg-slate-900/40'
                ]"
                @click="seleccionarPreset(preset)"
              >
                <div class="w-14 h-14 rounded-full overflow-hidden shadow-md ring-2 ring-white/40 group-hover:scale-105 transition-transform">
                  <img :src="preset.dataUrl" :alt="preset.nombre" class="w-full h-full object-cover" />
                </div>
                <div class="min-w-0">
                  <span class="text-xs font-black text-slate-900 dark:text-white block truncate leading-tight">
                    {{ preset.nombre }}
                  </span>
                  <span class="text-[10px] text-slate-500 dark:text-slate-400 block line-clamp-1 mt-0.5">
                    {{ preset.descripcion }}
                  </span>
                </div>
              </button>
            </div>
          </div>

          <div class="flex items-center gap-3 pt-2">
            <button
              type="button"
              :disabled="!presetSeleccionadoId || guardandoPreset"
              class="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-2xl bg-gradient-to-r from-sky-600 to-blue-500 hover:from-sky-500 hover:to-blue-400 text-white font-black text-xs uppercase tracking-wider shadow-md shadow-sky-500/25 disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
              @click="guardarPresetSeleccionado"
            >
              <Loader2 v-if="guardandoPreset" class="w-4 h-4 animate-spin" />
              <Check v-else class="w-4 h-4" />
              <span>{{ guardandoPreset ? 'Guardando...' : 'Aplicar Avatar Elegido' }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- SECCIÓN 3: RESTAURAR INICIALES CON FONDO DEGRADADO NARANJA/AZUL -->
      <div class="p-6 rounded-3xl bg-white dark:bg-[#0c1222] border border-slate-200/90 dark:border-slate-800/90 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div class="flex items-center gap-4 text-center sm:text-left">
          <div
            class="w-12 h-12 rounded-full flex items-center justify-center font-black text-sm text-white shrink-0 shadow-md"
            style="background: linear-gradient(135deg, #f97316 0%, #38bdf8 100%);"
          >
            {{ userInitials }}
          </div>
          <div class="space-y-0.5">
            <h4 class="text-sm font-black text-slate-900 dark:text-white">
              3. Iniciales con Fondo Degradado Naranja/Azul
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Degradado oficial (#f97316 a #38bdf8). Si no tienes foto o deseas quitarla, volverás a este estilo clásico.
            </p>
          </div>
        </div>

        <button
          v-if="authStore.usuario?.fotoUrl"
          type="button"
          :disabled="eliminandoFoto"
          class="px-4 py-2.5 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-2 shrink-0 disabled:opacity-50"
          @click="quitarFotoPerfil"
        >
          <Trash2 class="w-3.5 h-3.5" />
          <span>{{ eliminandoFoto ? 'Quitando...' : 'Quitar Foto / Usar Iniciales' }}</span>
        </button>
      </div>
    </main>

    <Footer />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { RouterLink } from 'vue-router'
import {
  ArrowLeft,
  Camera,
  UploadCloud,
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
  ImageIcon,
} from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import FondoEstadioCancha from '@/components/FondoEstadioCancha.vue'
import AvatarJugador from '@/components/AvatarJugador.vue'
import { useAuthStore } from '@/stores/auth'
import {
  AVATARES_PRESET,
  subirFotoPerfilStorage,
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

const userInitials = computed(() => {
  const n = authStore.usuario?.nombre?.[0] || 'S'
  const a = authStore.usuario?.apellido?.[0] || 'P'
  return `${n}${a}`.toUpperCase()
})

const abrirSelectorArchivo = () => {
  inputArchivoRef.value?.click()
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
}

const handleSeleccionArchivo = (e: Event) => {
  const target = e.target as HTMLInputElement
  if (target.files && target.files[0]) {
    procesarArchivo(target.files[0])
  }
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
    const urlDescarga = await subirFotoPerfilStorage(
      authStore.usuario.id,
      archivoSeleccionado.value
    )

    await guardarFotoPerfilUsuario(authStore.usuario.id, urlDescarga, authStore.usuario.fotoUrl)

    // Actualizar el estado global del usuario en el store
    authStore.usuario.fotoUrl = urlDescarga
    previsualizacionUrl.value = urlDescarga
    archivoSeleccionado.value = null
    mensajeExito.value = '¡Foto de perfil actualizada exitosamente en Firebase Storage!'
  } catch (err: any) {
    console.error('Error al subir avatar:', err)
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

const formatearTamano = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`
}
</script>


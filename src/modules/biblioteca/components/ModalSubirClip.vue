<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="visible"
        class="fixed inset-0 z-[80] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto"
        @click.self="cerrar"
      >
        <div
          class="relative w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 text-white space-y-4 my-auto select-none max-h-[94dvh] overflow-y-auto"
        >
          <!-- Cabecera -->
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                <Film class="w-4 h-4" />
              </span>
              <div>
                <h3 class="text-sm sm:text-base font-black text-white font-heading flex items-center gap-2">
                  <span>Agregar Clip o Transmisión</span>
                  <span class="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-400 border border-orange-500/30">
                    Admin
                  </span>
                </h3>
                <p class="text-[11px] text-slate-400 font-medium">
                  Publica repeticiones en alta calidad accesibles desde cualquier dispositivo
                </p>
              </div>
            </div>

            <button
              type="button"
              class="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
              @click="cerrar"
            >
              <X class="w-4 h-4" />
            </button>
          </div>

          <!-- Mensaje de Restricción si no es Admin -->
          <div v-if="!authStore.esAdmin" class="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <ShieldAlert class="w-4 h-4 shrink-0 text-rose-400" />
            <span>Solo los administradores de la plataforma tienen permiso para subir o registrar clips manualmente.</span>
          </div>

          <!-- Formulario para Administradores -->
          <form v-else class="space-y-4" @submit.prevent="handleSubmit">
            <!-- Título -->
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Título de la jugada / clip *</label>
              <input
                v-model.trim="titulo"
                type="text"
                required
                maxlength="100"
                placeholder="Ej: Gran Final: Remate cruzado ganador"
                class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-hidden transition-all"
              />
            </div>

            <!-- Tipo de Clip -->
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Categoría del video</label>
              <select
                v-model="tipo"
                class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:border-orange-500 outline-hidden transition-all"
              >
                <option value="mejor_jugada">Mejor Jugada</option>
                <option value="saque_as">Saque As</option>
                <option value="punto_campeonato">Punto de Match / Campeonato</option>
                <option value="transmision_completa">Transmisión Completa</option>
              </select>
            </div>

            <!-- Selector de Origen del Video (Subir Archivo o Enlace YouTube/Directo) -->
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1.5">Origen del video *</label>
              
              <div class="flex items-center gap-2 mb-2 text-xs">
                <button
                  type="button"
                  :class="[
                    'flex-1 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border flex items-center justify-center gap-1.5',
                    modoVideo === 'archivo' ? 'bg-orange-500 text-white border-orange-400 shadow-xs' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  ]"
                  @click="modoVideo = 'archivo'"
                >
                  <Upload class="w-3.5 h-3.5" />
                  <span>Subir Archivo a la Nube (.mp4, .webm)</span>
                </button>
                <button
                  type="button"
                  :class="[
                    'flex-1 py-1.5 rounded-xl font-bold text-xs transition-colors cursor-pointer border flex items-center justify-center gap-1.5',
                    modoVideo === 'url' ? 'bg-orange-500 text-white border-orange-400 shadow-xs' : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
                  ]"
                  @click="modoVideo = 'url'"
                >
                  <Link2 class="w-3.5 h-3.5" />
                  <span>Enlace YouTube / Directo</span>
                </button>
              </div>

              <!-- Modo Archivo Local para Subir a Firebase Storage -->
              <div v-if="modoVideo === 'archivo'" class="space-y-2">
                <div class="p-3 rounded-2xl bg-slate-950 border border-dashed border-slate-700 hover:border-orange-500 transition-colors flex flex-col items-center justify-center text-center gap-1.5 cursor-pointer relative">
                  <input
                    type="file"
                    accept="video/mp4,video/webm,video/ogg"
                    class="absolute inset-0 opacity-0 cursor-pointer"
                    @change="handleSeleccionarArchivoVideo"
                  />
                  <UploadCloud class="w-7 h-7 text-orange-400" />
                  <div class="text-xs">
                    <span v-if="archivoVideoFile" class="font-bold text-emerald-400">
                      {{ archivoVideoFile.name }} ({{ formatearTamanoArchivo(archivoVideoFile.size) }})
                    </span>
                    <span v-else class="text-slate-300">
                      Haz clic para seleccionar el video desde tu equipo
                    </span>
                  </div>
                  <span class="text-[10px] text-slate-500 font-mono">Formatos recomendados: MP4 o WebM</span>
                </div>
              </div>

              <!-- Modo URL Externa (YouTube o enlace directo) -->
              <div v-else class="space-y-1.5">
                <input
                  v-model.trim="urlVideo"
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=... o https://ejemplo.com/video.mp4"
                  class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-orange-500 outline-hidden transition-all"
                  @input="handleInputUrl"
                />
                <p v-if="youtubeIdDetectado" class="text-[11px] text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 class="w-3 h-3 shrink-0" />
                  <span>Video de YouTube detectado. La portada y reproductor se sincronizarán automáticamente.</span>
                </p>
              </div>
            </div>

            <!-- Selector de Miniatura / Imagen de Portada -->
            <div class="p-3 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2.5">
              <div class="flex items-center justify-between">
                <label class="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Image class="w-3.5 h-3.5 text-orange-400" />
                  <span>Imagen de Portada (Miniatura)</span>
                </label>
                <span class="text-[10px] text-slate-400 font-medium">Requerida para la tarjeta</span>
              </div>

              <div class="flex items-start gap-3">
                <!-- Preview de la Miniatura -->
                <div class="w-28 sm:w-36 aspect-video rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0 relative flex items-center justify-center">
                  <img
                    v-if="miniaturaPreviewUrl"
                    :src="miniaturaPreviewUrl"
                    alt="Preview"
                    class="w-full h-full object-cover"
                  />
                  <span v-else class="text-[10px] text-slate-500 text-center px-1">Sin portada</span>
                  <div v-if="generandoMiniatura" class="absolute inset-0 bg-black/70 flex items-center justify-center text-[10px] font-bold text-orange-300">
                    Capturando...
                  </div>
                </div>

                <!-- Opciones para cambiar la miniatura -->
                <div class="flex-1 space-y-2">
                  <div class="flex flex-wrap gap-2">
                    <label class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5">
                      <Upload class="w-3 h-3 text-orange-400" />
                      <span>Cargar Imagen Propia</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        class="hidden"
                        @change="handleSeleccionarImagenMiniatura"
                      />
                    </label>

                    <button
                      v-if="archivoVideoFile"
                      type="button"
                      class="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-[11px] font-bold cursor-pointer transition-colors inline-flex items-center gap-1.5"
                      @click="capturarFotogramaManual"
                    >
                      <Camera class="w-3 h-3 text-sky-400" />
                      <span>Recapturar del Video</span>
                    </button>
                  </div>
                  <p class="text-[10px] text-slate-400 leading-tight">
                    Puedes subir tu propia foto (`.jpg`, `.png`, `.webp`) o usar la captura automática generada del video.
                  </p>
                </div>
              </div>
            </div>

            <!-- Enfrentamiento de Jugadores (Opcional) -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1">Jugador 1</label>
                <input
                  v-model.trim="jugador1"
                  type="text"
                  placeholder="Nombre Jugador 1"
                  class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-orange-500 outline-hidden transition-all"
                />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1">Jugador 2</label>
                <input
                  v-model.trim="jugador2"
                  type="text"
                  placeholder="Nombre Jugador 2"
                  class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-orange-500 outline-hidden transition-all"
                />
              </div>
            </div>

            <!-- Mesa y Marcador del Momento -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-2.5">
              <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1">Mesa</label>
                <input
                  v-model.trim="mesa"
                  type="text"
                  placeholder="Ej: Mesa 1"
                  class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-orange-500 outline-hidden transition-all"
                />
              </div>
              <div>
                <label class="block text-[11px] font-bold text-slate-300 mb-1">Marcador o Momento</label>
                <input
                  v-model.trim="marcadorMomento"
                  type="text"
                  placeholder="Ej: Set 2 (10 - 09)"
                  class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-orange-500 outline-hidden transition-all"
                />
              </div>
            </div>

            <!-- Barra de Progreso de Subida si está subiendo -->
            <div v-if="guardando && modoVideo === 'archivo'" class="space-y-1.5 p-3 rounded-2xl bg-slate-950 border border-orange-500/30">
              <div class="flex items-center justify-between text-xs font-bold text-orange-400">
                <span>Subiendo video a Firebase Storage...</span>
                <span>{{ progresoSubidaVideo }}%</span>
              </div>
              <div class="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  class="h-full bg-gradient-to-r from-orange-600 to-amber-400 transition-all duration-300"
                  :style="{ width: `${progresoSubidaVideo}%` }"
                ></div>
              </div>
              <p class="text-[10px] text-slate-400">El video quedará guardado en la nube para que cualquier jugador pueda verlo desde su equipo.</p>
            </div>

            <!-- Botones Guardar / Cancelar -->
            <div class="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                :disabled="guardando"
                class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs transition-colors cursor-pointer border border-slate-700 disabled:opacity-50"
                @click="cerrar"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="!esValido || guardando"
                class="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400 disabled:opacity-50 active:scale-95 text-white font-black text-xs transition-all cursor-pointer shadow-lg shadow-orange-950/40 flex items-center justify-center gap-2"
              >
                <span v-if="guardando" class="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                <span>{{ guardando ? (modoVideo === 'archivo' ? `Subiendo (${progresoSubidaVideo}%)` : 'Publicando...') : 'Publicar Clip' }}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  X,
  Film,
  Upload,
  Link2,
  UploadCloud,
  CheckCircle2,
  Image,
  Camera,
  ShieldAlert,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
import {
  subirArchivoVideo,
  subirArchivoImagen,
  generarMiniaturaDesdeArchivo,
  extraerIdYoutube,
  obtenerMiniaturaYoutube,
} from '../service/storageService'
import type { ClipBiblioteca } from '../types'

const props = defineProps<{
  visible: boolean
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
  (e: 'clip-creado', clip: Omit<ClipBiblioteca, 'id' | 'vistas' | 'likes' | 'fechaCreacion'>): void
}>()

const authStore = useAuthStore()

const titulo = ref('')
const tipo = ref<ClipBiblioteca['tipo']>('mejor_jugada')
const modoVideo = ref<'archivo' | 'url'>('archivo')
const urlVideo = ref('')
const archivoVideoFile = ref<File | null>(null)
const archivoMiniaturaFile = ref<File | null>(null)
const miniaturaPreviewUrl = ref('')
const generandoMiniatura = ref(false)
const duracionCalculada = ref(20)
const jugador1 = ref('')
const jugador2 = ref('')
const mesa = ref('Mesa 1')
const marcadorMomento = ref('')
const guardando = ref(false)
const progresoSubidaVideo = ref(0)

const youtubeIdDetectado = computed(() => {
  if (modoVideo.value !== 'url') return null
  return extraerIdYoutube(urlVideo.value)
})

const esValido = computed(() => {
  if (!titulo.value.trim()) return false
  if (modoVideo.value === 'archivo' && !archivoVideoFile.value) return false
  if (modoVideo.value === 'url' && !urlVideo.value.trim()) return false
  return true
})

const handleSeleccionarArchivoVideo = async (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  archivoVideoFile.value = file

  // Calcular duración del archivo de video
  const tempVideo = document.createElement('video')
  const objUrl = URL.createObjectURL(file)
  tempVideo.src = objUrl
  tempVideo.onloadedmetadata = () => {
    duracionCalculada.value = Math.round(tempVideo.duration) || 20
    URL.revokeObjectURL(objUrl)
  }

  // Auto-capturar miniatura desde el video si no ha subido una personalizada
  if (!archivoMiniaturaFile.value) {
    generandoMiniatura.value = true
    try {
      const snap = await generarMiniaturaDesdeArchivo(file)
      miniaturaPreviewUrl.value = snap
    } finally {
      generandoMiniatura.value = false
    }
  }
}

const capturarFotogramaManual = async () => {
  if (!archivoVideoFile.value) return
  generandoMiniatura.value = true
  try {
    const snap = await generarMiniaturaDesdeArchivo(archivoVideoFile.value)
    miniaturaPreviewUrl.value = snap
    archivoMiniaturaFile.value = null
  } finally {
    generandoMiniatura.value = false
  }
}

const handleSeleccionarImagenMiniatura = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  archivoMiniaturaFile.value = file
  miniaturaPreviewUrl.value = URL.createObjectURL(file)
}

const handleInputUrl = () => {
  const ytId = extraerIdYoutube(urlVideo.value)
  if (ytId && !archivoMiniaturaFile.value) {
    miniaturaPreviewUrl.value = obtenerMiniaturaYoutube(ytId)
  }
}

const formatearTamanoArchivo = (bytes: number): string => {
  if (!bytes) return '0 B'
  const mb = bytes / (1024 * 1024)
  if (mb >= 1) return `${mb.toFixed(1)} MB`
  return `${(bytes / 1024).toFixed(0)} KB`
}

const handleSubmit = async () => {
  if (!esValido.value || !authStore.esAdmin) return

  guardando.value = true
  progresoSubidaVideo.value = 0

  try {
    let finalVideoUrl = ''
    let finalMiniaturaUrl = miniaturaPreviewUrl.value || '/images/table-vertical.jpg'

    // 1. Subida del archivo de video a Firebase Storage si aplica
    if (modoVideo.value === 'archivo' && archivoVideoFile.value) {
      finalVideoUrl = await subirArchivoVideo(archivoVideoFile.value, (pct) => {
        progresoSubidaVideo.value = pct
      })
    } else {
      finalVideoUrl = urlVideo.value.trim()
    }

    // 2. Subida de imagen personalizada a Storage si se cargó un archivo de imagen
    if (archivoMiniaturaFile.value) {
      finalMiniaturaUrl = await subirArchivoImagen(archivoMiniaturaFile.value)
    }

    const payload: Omit<ClipBiblioteca, 'id' | 'vistas' | 'likes' | 'fechaCreacion'> = {
      titulo: titulo.value.trim(),
      tipo: tipo.value,
      videoUrl: finalVideoUrl,
      miniaturaUrl: finalMiniaturaUrl,
      duracionSegundos: duracionCalculada.value,
      torneoNombre: 'Torneo Oficial',
      mesa: mesa.value.trim() || undefined,
      jugador1: jugador1.value.trim() ? { nombre: jugador1.value.trim() } : undefined,
      jugador2: jugador2.value.trim() ? { nombre: jugador2.value.trim() } : undefined,
      marcadorMomento: marcadorMomento.value.trim() || undefined,
      creadorNombre: authStore.usuario?.nombre || 'Administrador',
      creadorId: authStore.usuario?.id || 'admin',
    }

    emit('clip-creado', payload)
    cerrar()
  } catch (err: any) {
    console.error('[ModalSubirClip] Error al publicar video:', err)
    alert('Error al subir el video a la nube. Por favor verifica tu conexión o tamaño de archivo.')
  } finally {
    guardando.value = false
  }
}

const cerrar = () => {
  titulo.value = ''
  urlVideo.value = ''
  archivoVideoFile.value = null
  archivoMiniaturaFile.value = null
  miniaturaPreviewUrl.value = ''
  jugador1.value = ''
  jugador2.value = ''
  marcadorMomento.value = ''
  guardando.value = false
  progresoSubidaVideo.value = 0
  emit('cerrar')
}
</script>

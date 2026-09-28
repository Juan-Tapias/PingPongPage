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
          class="relative w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl shadow-2xl p-4 sm:p-6 text-white space-y-4 my-auto select-none max-h-[92dvh] overflow-y-auto"
        >
          <!-- Cabecera -->
          <div class="flex items-center justify-between border-b border-slate-800 pb-3">
            <div class="flex items-center gap-2">
              <span class="w-8 h-8 rounded-xl bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                <Film class="w-4 h-4" />
              </span>
              <div>
                <h3 class="text-sm sm:text-base font-black text-white font-heading">
                  Agregar Clip a la Biblioteca
                </h3>
                <p class="text-[11px] text-slate-400 font-medium">
                  Guarda tus mejores jugadas, saques o repeticiones de la mesa
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

          <!-- Formulario -->
          <form class="space-y-3.5" @submit.prevent="handleSubmit">
            <!-- Título -->
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Título de la jugada / clip *</label>
              <input
                v-model.trim="titulo"
                type="text"
                required
                maxlength="100"
                placeholder="Ej: Remate imparable en set decisivo"
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

            <!-- Cargar Archivo de Video o Enlace URL -->
            <div>
              <label class="block text-xs font-bold text-slate-300 mb-1">Video del clip *</label>
              
              <div class="flex items-center gap-2 mb-2 text-xs">
                <button
                  type="button"
                  :class="[
                    'px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer border',
                    modoVideo === 'archivo' ? 'bg-orange-500 text-white border-orange-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                  ]"
                  @click="modoVideo = 'archivo'"
                >
                  Subir Archivo (.mp4, .webm)
                </button>
                <button
                  type="button"
                  :class="[
                    'px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer border',
                    modoVideo === 'url' ? 'bg-orange-500 text-white border-orange-400' : 'bg-slate-800 text-slate-300 border-slate-700'
                  ]"
                  @click="modoVideo = 'url'"
                >
                  Enlace URL de Video
                </button>
              </div>

              <div v-if="modoVideo === 'archivo'">
                <input
                  type="file"
                  accept="video/mp4,video/webm,video/ogg"
                  class="w-full text-xs text-slate-400 file:mr-3 file:py-1.5 file:px-3 file:rounded-xl file:border-0 file:text-xs file:font-black file:bg-orange-600 file:text-white hover:file:bg-orange-500 file:cursor-pointer bg-slate-950 p-2 rounded-xl border border-slate-700"
                  @change="handleSeleccionarArchivo"
                />
              </div>

              <div v-else>
                <input
                  v-model.trim="urlVideo"
                  type="url"
                  placeholder="https://ejemplo.com/video.mp4"
                  class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-orange-500 outline-hidden transition-all"
                />
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
                <label class="block text-[11px] font-bold text-slate-300 mb-1">Marcador en el punto</label>
                <input
                  v-model.trim="marcadorMomento"
                  type="text"
                  placeholder="Ej: Set 2 (10 - 09)"
                  class="w-full px-3 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white placeholder-slate-500 focus:border-orange-500 outline-hidden transition-all"
                />
              </div>
            </div>

            <!-- Botones Guardar / Cancelar -->
            <div class="flex items-center gap-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-bold text-xs transition-colors cursor-pointer border border-slate-700"
                @click="cerrar"
              >
                Cancelar
              </button>
              <button
                type="submit"
                :disabled="!esValido || guardando"
                class="flex-1 py-2.5 rounded-xl bg-orange-600 hover:bg-orange-500 disabled:opacity-50 active:scale-95 text-white font-black text-xs transition-all cursor-pointer shadow-lg shadow-orange-950/40"
              >
                {{ guardando ? 'Guardando...' : 'Publicar Clip' }}
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
import { X, Film } from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
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
const archivoSeleccionadoUrl = ref('')
const duracionCalculada = ref(20)
const jugador1 = ref('')
const jugador2 = ref('')
const mesa = ref('Mesa 1')
const marcadorMomento = ref('')
const guardando = ref(false)

const esValido = computed(() => {
  if (!titulo.value.trim()) return false
  if (modoVideo.value === 'archivo' && !archivoSeleccionadoUrl.value) return false
  if (modoVideo.value === 'url' && !urlVideo.value.trim()) return false
  return true
})

const handleSeleccionarArchivo = (e: Event) => {
  const target = e.target as HTMLInputElement
  const file = target.files?.[0]
  if (!file) return

  // Crear URL de objeto para reproducción inmediata
  const objUrl = URL.createObjectURL(file)
  archivoSeleccionadoUrl.value = objUrl

  // Calcular duración real
  const tempVideo = document.createElement('video')
  tempVideo.src = objUrl
  tempVideo.onloadedmetadata = () => {
    duracionCalculada.value = Math.round(tempVideo.duration) || 20
  }
}

const handleSubmit = async () => {
  if (!esValido.value) return

  guardando.value = true
  const finalVideoUrl = modoVideo.value === 'archivo' ? archivoSeleccionadoUrl.value : urlVideo.value.trim()

  const payload: Omit<ClipBiblioteca, 'id' | 'vistas' | 'likes' | 'fechaCreacion'> = {
    titulo: titulo.value.trim(),
    tipo: tipo.value,
    videoUrl: finalVideoUrl,
    miniaturaUrl: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=800&q=80',
    duracionSegundos: duracionCalculada.value,
    torneoNombre: 'Torneo Oficial',
    mesa: mesa.value.trim() || undefined,
    jugador1: jugador1.value.trim() ? { nombre: jugador1.value.trim() } : undefined,
    jugador2: jugador2.value.trim() ? { nombre: jugador2.value.trim() } : undefined,
    marcadorMomento: marcadorMomento.value.trim() || undefined,
    creadorNombre: authStore.usuario?.nombre || 'Espectador',
    creadorId: authStore.usuario?.id || 'anon',
  }

  emit('clip-creado', payload)
  guardando.value = false
  cerrar()
}

const cerrar = () => {
  titulo.value = ''
  urlVideo.value = ''
  archivoSeleccionadoUrl.value = ''
  jugador1.value = ''
  jugador2.value = ''
  marcadorMomento.value = ''
  guardando.value = false
  emit('cerrar')
}
</script>

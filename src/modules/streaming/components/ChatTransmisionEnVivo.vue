<template>
  <div
    :class="[
      'flex flex-col text-white select-none transition-all duration-300 min-h-0',
      esPantallaCompleta || esHorizontal
        ? 'h-full w-full rounded-2xl sm:rounded-3xl bg-[#0c1527]/95 border border-slate-700/60 shadow-2xl overflow-hidden'
        : 'w-full lg:w-80 xl:w-96 flex-1 lg:flex-none h-full bg-slate-950/95 border-t lg:border-t-0 lg:border-l border-slate-800/80'
    ]"
  >
    <!-- CABECERA DEL CHAT (ESTILO EXACTO AL MOCKUP: "LIVE CHAT") -->
    <div
      class="flex items-center justify-between px-3 sm:px-4 py-2 sm:py-2.5 bg-[#091120] border-b border-white/10 shrink-0"
    >
      <div class="flex items-center gap-2">
        <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
        <h3 class="text-xs sm:text-sm font-black uppercase tracking-widest text-white">
          LIVE CHAT
        </h3>
      </div>

      <div class="flex items-center gap-1.5">
        <button
          type="button"
          class="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Cerrar chat"
          @click="emit('cerrar-chat')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- FEED DE MENSAJES (CON AVATARES CIRCULARES ESTILO MOCKUP) -->
    <div
      ref="mensajesContainerRef"
      class="flex-1 overflow-y-auto px-2.5 sm:px-3 py-2 sm:py-2.5 space-y-2 text-xs font-medium leading-relaxed custom-scrollbar select-text"
      @scroll="handleScroll"
    >
      <!-- Lista de Mensajes (reales o de demostración inicial) -->
      <div
        v-for="msg in mensajesRenderizados"
        :key="msg.id || msg.timestamp"
        class="flex items-start gap-2 sm:gap-2.5 py-1 px-1 rounded-xl hover:bg-white/[0.04] transition-colors"
      >
        <!-- Avatar circular con gradiente llamativo -->
        <div
          class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-linear-to-tr shrink-0 flex items-center justify-center text-xs shadow-md border border-white/20 select-none"
          :class="obtenerAvatarUsuario(msg.usuarioNombre).bg"
        >
          <span>{{ msg.avatar || obtenerAvatarUsuario(msg.usuarioNombre).icon }}</span>
        </div>

        <!-- Contenido del mensaje -->
        <div class="min-w-0 flex-1 leading-snug">
          <div class="flex items-center gap-1.5 flex-wrap">
            <span
              class="font-black text-xs hover:underline cursor-pointer select-none"
              :style="{ color: msg.colorNombre || obtenerColorUsuario(msg.usuarioNombre) }"
            >
              {{ msg.usuarioNombre }}:
            </span>
            <span
              v-if="msg.esArbitro"
              class="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40"
            >
              ÁRBITRO
            </span>
            <span
              v-else-if="msg.esJugador"
              class="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] font-black uppercase bg-rose-500/20 text-rose-300 border border-rose-500/40"
            >
              JUGADOR
            </span>
          </div>
          <p class="text-xs sm:text-[13px] text-slate-100 font-medium break-words mt-0.5 select-text">
            {{ msg.mensaje }}
          </p>
        </div>
      </div>
    </div>

    <!-- BOTÓN VOLVER ABAJO SI EL USUARIO HIZO SCROLL HACIA ARRIBA -->
    <div
      v-if="mostrarBotonBajar"
      class="px-3 py-1 flex items-center justify-center bg-slate-900/90 border-t border-slate-800"
    >
      <button
        type="button"
        class="px-3 py-1 rounded-full bg-sky-500 hover:bg-sky-400 active:scale-95 text-slate-950 font-black text-[11px] shadow-lg flex items-center gap-1 cursor-pointer transition-all"
        @click="hacerScrollAlFinal(true)"
      >
        <span>Nuevos mensajes ↓</span>
      </button>
    </div>

    <!-- BARRA DE EMOJIS RÁPIDOS (EXACTAMENTE: 🏓 💪 🔥 😍 🏆) -->
    <div
      class="flex items-center justify-center gap-2.5 sm:gap-4 px-3 py-1.5 bg-[#0a1120]/90 border-t border-white/10 shrink-0"
    >
      <button
        v-for="emoji in EMOJIS_RAPIDOS"
        :key="emoji"
        type="button"
        class="p-1 sm:p-1.5 rounded-xl hover:bg-white/10 active:scale-125 text-lg sm:text-xl transition-all cursor-pointer select-none"
        :title="`Reaccionar con ${emoji}`"
        @click="enviarReaccionRapida(emoji)"
      >
        {{ emoji }}
      </button>
    </div>

    <!-- ÁREA DE INPUT PARA ENVIAR MENSAJE -->
    <form
      class="p-2 sm:p-2.5 bg-[#090f1d] border-t border-white/10 shrink-0"
      @submit.prevent="handleEnviarMensaje"
    >
      <!-- Alerta visual si falla el envío -->
      <div
        v-if="errorEnvio"
        class="mb-2 px-2.5 py-1.5 rounded-lg bg-rose-500/20 border border-rose-500/40 text-[11px] text-rose-300 font-semibold flex items-center justify-between animate-in fade-in"
      >
        <span>{{ errorEnvio }}</span>
        <button type="button" class="text-rose-300 hover:text-white font-bold ml-2 cursor-pointer" @click="errorEnvio = ''">×</button>
      </div>

      <div class="relative flex items-center bg-[#070e1b] border border-slate-700/90 rounded-full px-3.5 py-1.5 focus-within:border-emerald-400/80 focus-within:ring-2 focus-within:ring-emerald-400/20 shadow-inner">
        <input
          ref="inputMensajeRef"
          v-model.trim="textoMensaje"
          type="text"
          maxlength="200"
          placeholder="Escribe tu comentario..."
          class="w-full bg-transparent outline-hidden text-xs text-white placeholder-slate-400 font-medium pr-22 py-0.5"
          :disabled="enviando"
          @keydown.enter.prevent="handleEnviarMensaje"
        />

        <button
          type="submit"
          class="absolute right-2 px-2 py-0.5 rounded-full hover:bg-emerald-500/10 active:scale-95 disabled:opacity-40 text-emerald-400 hover:text-emerald-300 font-black text-xs transition-all cursor-pointer flex items-center gap-1 shrink-0"
          :disabled="!textoMensaje || enviando"
          title="Enviar comentario"
        >
          <span>[Enviar</span>
          <Send class="w-3 h-3 text-emerald-400" />
          <span>]</span>
        </button>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  Send,
  X,
} from 'lucide-vue-next'
import {
  collection,
  addDoc,
  query,
  orderBy,
  limitToLast,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import { useAuthStore } from '@/stores/auth'
import type { PartidoGrupo } from '@/types'

export interface MensajeChatStream {
  id?: string
  usuarioId: string
  usuarioNombre: string
  mensaje: string
  timestamp: number
  colorNombre?: string
  esArbitro?: boolean
  esJugador?: boolean
  avatar?: string
}

const props = defineProps<{
  partidoId?: string
  partido?: PartidoGrupo | null
  esPantallaCompleta?: boolean
  esHorizontal?: boolean
}>()

const emit = defineEmits<{
  (e: 'cerrar-chat'): void
}>()

const authStore = useAuthStore()

const mensajes = ref<MensajeChatStream[]>([])
const textoMensaje = ref('')
const enviando = ref(false)
const mensajesContainerRef = ref<HTMLDivElement | null>(null)
const inputMensajeRef = ref<HTMLInputElement | null>(null)
const mostrarBotonBajar = ref(false)

// Exactamente los 5 emojis de reacción rápida del diseño de referencia
const EMOJIS_RAPIDOS = ['🏓', '💪', '🔥', '😍', '🏆']

const MENSAJES_INICIALES_DEMO: MensajeChatStream[] = [
  {
    id: 'demo-1',
    usuarioId: 'u_fan',
    usuarioNombre: 'Fan_451',
    mensaje: '🔥🏆 Qué puntazo!',
    timestamp: Date.now() - 90000,
    colorNombre: '#38bdf8',
  },
  {
    id: 'demo-2',
    usuarioId: 'u_spin',
    usuarioNombre: 'SpinMaster',
    mensaje: '🏓 ¡Vamos, María!',
    timestamp: Date.now() - 60000,
    colorNombre: '#fbbf24',
  },
  {
    id: 'demo-3',
    usuarioId: 'u_esport',
    usuarioNombre: 'Esport_Pro',
    mensaje: '💪 ¡Increíble!',
    timestamp: Date.now() - 30000,
    colorNombre: '#a855f7',
  },
  {
    id: 'demo-4',
    usuarioId: 'u_speed',
    usuarioNombre: 'Speedster',
    mensaje: '¡Ese revés! 🤩',
    timestamp: Date.now() - 10000,
    colorNombre: '#34d399',
  },
]

const mensajesRenderizados = computed(() => {
  if (mensajes.value.length === 0) {
    return MENSAJES_INICIALES_DEMO
  }
  return mensajes.value
})

const AVATARES_PREDETERMINADOS = [
  { bg: 'from-cyan-400 to-blue-600', icon: '👤' },
  { bg: 'from-amber-400 to-orange-600', icon: '🏓' },
  { bg: 'from-purple-400 to-pink-600', icon: '⚡' },
  { bg: 'from-emerald-400 to-teal-600', icon: '🎾' },
  { bg: 'from-rose-400 to-red-600', icon: '🔥' },
  { bg: 'from-indigo-400 to-violet-600', icon: '🏆' },
]

function obtenerAvatarUsuario(nombre: string): { bg: string; icon: string } {
  const fallback = AVATARES_PREDETERMINADOS[0] || { bg: 'from-cyan-400 to-blue-600', icon: '👤' }
  if (!nombre) return fallback
  const n = nombre.toLowerCase()
  if (n.includes('spin')) return { bg: 'from-amber-400 to-orange-500', icon: '🏓' }
  if (n.includes('esport')) return { bg: 'from-purple-400 to-pink-500', icon: '🎮' }
  if (n.includes('speed')) return { bg: 'from-emerald-400 to-teal-500', icon: '⚡' }
  if (n.includes('fan')) return { bg: 'from-cyan-400 to-blue-500', icon: '🔥' }

  let hash = 0
  for (let i = 0; i < nombre.length; i++) {
    hash = (hash << 5) - hash + nombre.charCodeAt(i)
  }
  const idx = Math.abs(hash) % AVATARES_PREDETERMINADOS.length
  return AVATARES_PREDETERMINADOS[idx] || fallback
}

const enviarReaccionRapida = async (emoji: string) => {
  textoMensaje.value = emoji
  await handleEnviarMensaje()
}

const PALETA_COLORES_TWITCH = [
  '#38bdf8', // Sky
  '#a855f7', // Purple
  '#34d399', // Emerald
  '#f43f5e', // Rose
  '#fbbf24', // Amber
  '#ec4899', // Pink
  '#22d3ee', // Cyan
  '#818cf8', // Indigo
  '#4ade80', // Green
  '#f97316', // Orange
]

function obtenerColorUsuario(nombre: string): string {
  if (!nombre) return '#38bdf8'
  let hash = 0
  for (let i = 0; i < nombre.length; i++) {
    hash = nombre.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % PALETA_COLORES_TWITCH.length
  return PALETA_COLORES_TWITCH[index] ?? '#38bdf8'
}

const usuarioActual = computed(() => authStore.usuario)

const nombreUsuarioActual = computed(() => {
  return usuarioActual.value?.nombre || 'Espectador'
})

const idUsuarioActual = computed(() => {
  return usuarioActual.value?.id || `anon_${Math.random().toString(36).substring(2, 9)}`
})

const esArbitroActual = computed(() => {
  const rol = usuarioActual.value?.rol
  if (rol === 'admin') return true
  if (props.partido?.transmisorId && props.partido.transmisorId === idUsuarioActual.value) return true
  return false
})

const esJugadorActual = computed(() => {
  if (!props.partido) return false
  const uid = idUsuarioActual.value
  return (
    props.partido.jugador1Id === uid ||
    props.partido.jugador2Id === uid ||
    props.partido.jugador1?.nombre === nombreUsuarioActual.value ||
    props.partido.jugador2?.nombre === nombreUsuarioActual.value
  )
})

let unsubChat: Unsubscribe | null = null

// Usar subcolección con reglas ya desplegadas y permitidas (allow read, write: if true)
const COLECCION_CHAT_STREAM = 'reacciones'

const iniciarEscuchaChat = (pId: string) => {
  if (unsubChat) {
    unsubChat()
    unsubChat = null
  }

  if (!pId) {
    mensajes.value = []
    return
  }

  const chatColl = collection(db, 'partidos', pId, COLECCION_CHAT_STREAM)
  const q = query(chatColl, orderBy('timestamp', 'asc'), limitToLast(60))

  unsubChat = onSnapshot(
    q,
    (snapshot) => {
      const lista: MensajeChatStream[] = []
      snapshot.forEach((d) => {
        lista.push({
          id: d.id,
          ...(d.data() as Omit<MensajeChatStream, 'id'>),
        })
      })
      mensajes.value = lista

      // Auto-scroll si el usuario está cerca del final
      nextTick(() => {
        if (!mostrarBotonBajar.value) {
          hacerScrollAlFinal()
        }
      })
    },
    (err) => {
      console.warn('[ChatTransmisionEnVivo] Error al escuchar mensajes:', err)
    },
  )
}

const targetPartidoId = computed(() => {
  return (
    props.partidoId ||
    props.partido?.id ||
    (props.partido as any)?.partidoId ||
    ''
  )
})

watch(
  targetPartidoId,
  (nuevoId) => {
    if (nuevoId) {
      iniciarEscuchaChat(nuevoId)
    } else {
      if (unsubChat) {
        unsubChat()
        unsubChat = null
      }
      mensajes.value = []
    }
  },
  { immediate: true },
)

const handleScroll = () => {
  const el = mensajesContainerRef.value
  if (!el) return
  const distanciaDelFondo = el.scrollHeight - el.scrollTop - el.clientHeight
  mostrarBotonBajar.value = distanciaDelFondo > 80
}

const hacerScrollAlFinal = (forzar = false) => {
  const el = mensajesContainerRef.value
  if (!el) return
  if (forzar) {
    mostrarBotonBajar.value = false
  }
  el.scrollTo({
    top: el.scrollHeight,
    behavior: 'smooth',
  })
}

const insertarEmoji = (emoji: string) => {
  textoMensaje.value += emoji
  inputMensajeRef.value?.focus()
}

const errorEnvio = ref('')
let timerErrorEnvio: any = null

const mostrarErrorTemporal = (msg: string) => {
  errorEnvio.value = msg
  if (timerErrorEnvio) clearTimeout(timerErrorEnvio)
  timerErrorEnvio = setTimeout(() => {
    errorEnvio.value = ''
  }, 4000)
}

const handleEnviarMensaje = async () => {
  const pId = targetPartidoId.value
  const texto = textoMensaje.value.trim()
  if (!texto || enviando.value) return

  if (!pId) {
    console.warn('[ChatTransmisionEnVivo] Advertencia: ID del partido aún no está disponible:', {
      partidoId: props.partidoId,
      partido: props.partido,
    })
    mostrarErrorTemporal('Sincronizando con la transmisión...')
    return
  }

  enviando.value = true
  errorEnvio.value = ''

  try {
    const chatColl = collection(db, 'partidos', pId, COLECCION_CHAT_STREAM)
    const payload: Omit<MensajeChatStream, 'id'> = {
      usuarioId: idUsuarioActual.value,
      usuarioNombre: nombreUsuarioActual.value,
      mensaje: texto,
      timestamp: Date.now(),
      colorNombre: obtenerColorUsuario(nombreUsuarioActual.value),
      esArbitro: esArbitroActual.value,
      esJugador: esJugadorActual.value,
    }

    await addDoc(chatColl, payload)
    textoMensaje.value = ''
    nextTick(() => {
      hacerScrollAlFinal(true)
    })
  } catch (err: any) {
    console.error('[ChatTransmisionEnVivo] Error al enviar mensaje:', err)
    mostrarErrorTemporal('No se pudo enviar el mensaje a la transmisión.')
  } finally {
    enviando.value = false
    inputMensajeRef.value?.focus()
  }
}

const formatearHora = (ts: number) => {
  if (!ts) return ''
  const d = new Date(ts)
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

onMounted(() => {
  nextTick(() => {
    hacerScrollAlFinal(true)
  })
})

onUnmounted(() => {
  if (unsubChat) {
    unsubChat()
    unsubChat = null
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.15);
  border-radius: 9999px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.25);
}
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>

<template>
  <div
    :class="[
      'flex flex-col bg-slate-950/95 dark:bg-[#080d1a]/95 text-white select-none transition-all duration-300 min-h-0',
      esPantallaCompleta
        ? 'absolute right-0 top-0 bottom-0 z-40 w-80 sm:w-96 bg-black/90 backdrop-blur-md border-l border-white/10 shadow-2xl animate-in slide-in-from-right'
        : 'w-full lg:w-80 xl:w-96 flex-1 lg:flex-none h-full border-t lg:border-t-0 lg:border-l border-slate-800/80'
    ]"
  >
    <!-- CABECERA DEL CHAT (ESTILO TWITCH) -->
    <div
      class="flex items-center justify-between px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800/80 shrink-0"
    >
      <div class="flex items-center gap-2">
        <button
          type="button"
          class="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Colapsar chat"
          @click="emit('cerrar-chat')"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
        <div class="flex items-center gap-1.5">
          <MessageSquare class="w-4 h-4 text-sky-400" />
          <h3 class="text-xs font-black uppercase tracking-wider text-slate-200">
            Chat del partido
          </h3>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <span class="flex items-center gap-1 text-[11px] font-bold text-slate-400">
          <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>En directo</span>
        </span>

        <button
          v-if="esPantallaCompleta"
          type="button"
          class="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
          title="Cerrar chat superpuesto"
          @click="emit('cerrar-chat')"
        >
          <X class="w-4 h-4" />
        </button>
      </div>
    </div>

    <!-- FEED DE MENSAJES (ESTILO TWITCH / KICK) -->
    <div
      ref="mensajesContainerRef"
      class="flex-1 overflow-y-auto px-3.5 py-3 space-y-2.5 text-xs font-medium leading-relaxed custom-scrollbar select-text"
      @scroll="handleScroll"
    >
      <!-- Estado vacío si aún no hay mensajes -->
      <div
        v-if="mensajes.length === 0"
        class="h-full flex flex-col items-center justify-center text-center text-slate-500 p-4 gap-2 select-none"
      >
        <div class="w-10 h-10 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
          <MessageSquare class="w-5 h-5 text-sky-400/80" />
        </div>
        <p class="text-xs font-bold text-slate-300">¡Bienvenido al chat en vivo!</p>
        <p class="text-[11px] text-slate-500 max-w-xs">
          Comenta las mejores jugadas, apoya a los competidores o saluda a los demás espectadores.
        </p>
      </div>

      <!-- Lista de Mensajes -->
      <div
        v-for="msg in mensajes"
        :key="msg.id || msg.timestamp"
        class="group/msg hover:bg-white/[0.03] -mx-2 px-2 py-1 rounded-lg transition-colors break-words"
      >
        <!-- Badge y Nombre del usuario -->
        <span
          v-if="msg.esArbitro"
          class="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 mr-1.5 align-middle select-none shadow-xs"
          title="Árbitro de mesa"
        >
          <Shield class="w-2.5 h-2.5 text-amber-400" />
          ÁRBITRO
        </span>

        <span
          v-else-if="msg.esJugador"
          class="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500/20 text-rose-300 border border-rose-500/40 mr-1.5 align-middle select-none shadow-xs"
          title="Jugador del torneo"
        >
          🏓 JUGADOR
        </span>

        <span
          class="font-black hover:underline cursor-pointer select-none"
          :style="{ color: msg.colorNombre || obtenerColorUsuario(msg.usuarioNombre) }"
        >
          {{ msg.usuarioNombre }}
        </span>
        <span class="text-slate-400 font-bold mr-1">:</span>

        <!-- Texto del Mensaje -->
        <span class="text-slate-200 font-medium select-text break-all">
          {{ msg.mensaje }}
        </span>

        <!-- Timestamp sutil al hover -->
        <span class="text-[9px] text-slate-500 ml-1.5 opacity-0 group-hover/msg:opacity-100 transition-opacity font-mono select-none">
          {{ formatearHora(msg.timestamp) }}
        </span>
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

    <!-- BARRA DE EMOJIS RÁPIDOS (DEPORTIVOS Y REACCIONES) -->
    <div
      class="flex items-center gap-1 px-3 py-1.5 bg-slate-900/60 border-t border-slate-800/80 overflow-x-auto no-scrollbar shrink-0"
    >
      <button
        v-for="emoji in EMOJIS_RAPIDOS"
        :key="emoji"
        type="button"
        class="px-2 py-0.5 rounded-lg hover:bg-white/10 active:scale-90 text-sm transition-all cursor-pointer select-none"
        :title="`Enviar ${emoji}`"
        @click="insertarEmoji(emoji)"
      >
        {{ emoji }}
      </button>
    </div>

    <!-- ÁREA DE INPUT PARA ENVIAR MENSAJE -->
    <form
      class="p-2.5 sm:p-3 bg-slate-900/90 border-t border-slate-800 shrink-0"
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

      <div class="relative flex items-center gap-2">
        <input
          ref="inputMensajeRef"
          v-model.trim="textoMensaje"
          type="text"
          maxlength="200"
          placeholder="Enviar un mensaje..."
          class="w-full pl-3.5 pr-10 py-2 rounded-xl bg-slate-950 border border-slate-700/80 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20 outline-hidden text-xs text-white placeholder-slate-500 transition-all font-medium"
          :disabled="enviando"
          @keydown.enter.prevent="handleEnviarMensaje"
        />

        <button
          type="submit"
          class="absolute right-1.5 p-1.5 rounded-lg bg-sky-500 hover:bg-sky-400 active:scale-95 disabled:opacity-40 disabled:hover:bg-sky-500 text-slate-950 transition-all cursor-pointer shadow-md disabled:cursor-not-allowed"
          :disabled="!textoMensaje || enviando"
          title="Enviar mensaje (Enter)"
        >
          <Send class="w-3.5 h-3.5" />
        </button>
      </div>

      <div class="flex items-center justify-between mt-1 px-1 text-[10px] text-slate-500 font-medium">
        <span>Pulsa Enter para enviar</span>
        <span>{{ textoMensaje.length }}/200</span>
      </div>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  MessageSquare,
  Send,
  ChevronRight,
  Shield,
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
}

const props = defineProps<{
  partidoId?: string
  partido?: PartidoGrupo | null
  esPantallaCompleta?: boolean
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

const EMOJIS_RAPIDOS = ['🏓', '🔥', '👏', '🎯', '⚡', '🏆', '😱', '💪']

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

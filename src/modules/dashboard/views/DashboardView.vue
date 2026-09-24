<template>
  <div class="min-h-screen w-full bg-slate-100 dark:bg-[#060a14] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 relative overflow-x-hidden">
    <!-- Fondo Oficial de Estadio WTT & Líneas de Cancha Reglamentarias -->
    <FondoEstadioCancha />

    <Navbar class="relative z-10" />

    <BreadcrumbExpediente class="relative z-10" />

    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6 relative z-10">
      <VistaParticipacionTorneo
        v-if="torneoParticipacion"
        :torneo="torneoParticipacion"
        @volver="handleVolverDeTorneo"
      />

      <template v-else>
        <!-- Hero Banner con Mesa de Ping Pong Vertical (Responsive & Light/Dark Ready) -->
        <div class="relative overflow-hidden rounded-2xl sm:rounded-3xl border border-slate-300/80 dark:border-slate-800/90 shadow-xl shadow-slate-900/10 dark:shadow-2xl dark:shadow-black/60 bg-[#080d1a] min-h-[210px] sm:min-h-[250px] flex flex-col justify-between sm:justify-end group transition-all duration-300">
          <!-- Fondo fotográfico con mesa en perspectiva vertical nítida -->
          <div
            class="absolute inset-0 bg-cover bg-center sm:bg-[center_35%] scale-100 group-hover:scale-105 transition-transform duration-700 ease-out pointer-events-none"
            style="background-image: url('/images/table-vertical.jpg');"
          ></div>

          <!-- Gradientes adaptativos: vertical en móvil para no tapar los tabs, horizontal en desktop para lucir la mesa -->
          <div class="absolute inset-0 bg-gradient-to-b from-[#080d1a]/90 via-[#080d1a]/50 to-[#080d1a]/95 sm:hidden"></div>
          <div class="hidden sm:block absolute inset-0 bg-gradient-to-r from-[#080d1a]/90 via-[#080d1a]/50 md:via-[#080d1a]/20 to-transparent"></div>
          <div class="hidden sm:block absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[#080d1a]/80 via-[#080d1a]/40 to-transparent"></div>
          <div class="hidden sm:block absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-[#080d1a]/40 to-transparent"></div>

          <!-- Contenido del Hero -->
          <div class="relative z-10 p-4 sm:p-6 md:p-8 flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6">
            <div class="space-y-1.5 sm:space-y-2 max-w-xl">
              <div class="inline-flex items-center gap-1.5 sm:gap-2 px-2.5 py-0.5 sm:py-1 rounded-full bg-orange-500/25 border border-orange-500/40 text-orange-300 text-[10px] sm:text-xs font-semibold backdrop-blur-md shadow-xs">
                <span class="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse"></span>
                <span>Expediente Deportivo Oficial</span>
              </div>
              <h1 class="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight font-heading drop-shadow-md">
                Panel del Jugador
              </h1>
              <p class="text-xs sm:text-sm text-slate-200 max-w-md leading-relaxed drop-shadow">
                <span v-if="authStore.usuario?.nombre" class="text-orange-400 font-bold block sm:inline sm:mr-1">
                  ¡Listo para el saque, {{ authStore.usuario.nombre }}! 🏓
                </span>
                Gestiona tus inscripciones y compite en torneos oficiales.
              </p>
            </div>

            <!-- Selector de Tabs con acabado Glassmorphic Adaptable -->
            <div class="grid grid-cols-2 sm:flex items-center p-1 sm:p-1.5 bg-black/60 backdrop-blur-lg rounded-xl sm:rounded-2xl border border-white/15 w-full sm:w-auto shadow-xl">
              <button
                type="button"
                :class="[
                  'flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer text-center',
                  tabActiva === 'mis-torneos'
                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md shadow-orange-600/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/10',
                ]"
                @click="tabActiva = 'mis-torneos'"
              >
                <Trophy class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span class="truncate">Mis Torneos</span>
                <span
                  :class="[
                    'text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full font-bold ml-0.5 shrink-0',
                    tabActiva === 'mis-torneos'
                      ? 'bg-orange-950/80 text-orange-100'
                      : 'bg-white/20 text-slate-200',
                  ]"
                >
                  {{ misTorneos.length }}
                </span>
              </button>

              <button
                type="button"
                :class="[
                  'flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold transition-all duration-200 cursor-pointer text-center',
                  tabActiva === 'disponibles'
                    ? 'bg-gradient-to-r from-orange-600 to-orange-500 text-white shadow-md shadow-orange-600/40'
                    : 'text-slate-300 hover:text-white hover:bg-white/10',
                ]"
                @click="tabActiva = 'disponibles'"
              >
                <Compass class="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                <span class="truncate">Disponibles</span>
                <span
                  :class="[
                    'text-[9px] sm:text-[10px] px-1 sm:px-1.5 py-0.5 rounded-full font-bold ml-0.5 shrink-0',
                    tabActiva === 'disponibles'
                      ? 'bg-orange-950/80 text-orange-100'
                      : 'bg-white/20 text-slate-200',
                  ]"
                >
                  {{ torneosDisponibles.length }}
                </span>
              </button>
            </div>
          </div>
        </div>

        <FiltrosMisTorneos
          v-if="tabActiva === 'mis-torneos'"
          v-model="busquedaMisTorneos"
          v-model:estado="filtroEstadoMisTorneos"
          :conteo-en-verificacion="conteoEnVerificacion"
          :conteo-en-curso="conteoEnCurso"
          :conteo-por-iniciar="conteoPorIniciar"
          :conteo-finalizado="conteoFinalizado"
        />

        <FiltrosDisponibles
          v-else
          v-model="busquedaDisponibles"
          :total-encontrados="torneosDisponiblesFiltrados.length"
          @restablecer="busquedaDisponibles = ''"
        />

        <section v-if="tabActiva === 'mis-torneos'" class="w-full">
          <div v-if="misTorneosFiltrados.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            <TorneoCard
              v-for="torneo in misTorneosFiltrados"
              :key="torneo.id"
              :torneo="torneo"
              modo="inscrito"
              @ver-torneo="handleVerTorneo"
              @ver-estado="handleAbrirVerificacion"
            />
          </div>

          <div
            v-else
            class="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f172a]"
          >
            <Trophy class="w-10 h-10 text-slate-400 dark:text-slate-500 mb-2" />
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">No se encontraron torneos inscritos</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Prueba cambiando los términos de búsqueda o filtros.</p>
          </div>
        </section>

        <section v-else class="w-full">
          <div v-if="torneosDisponiblesFiltrados.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <TorneoCard
              v-for="torneo in torneosDisponiblesFiltrados"
              :key="torneo.id"
              :torneo="torneo"
              modo="disponible"
              @inscribir="handleAbrirInscripcion"
              @ver-estado="handleAbrirVerificacion"
            />
          </div>

          <div
            v-else
            class="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f172a]"
          >
            <Compass class="w-10 h-10 text-slate-400 dark:text-slate-500 mb-2" />
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">No hay torneos disponibles con estos criterios</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Prueba cambiando los términos de búsqueda o restableciendo los filtros.</p>
          </div>
        </section>

        <BannerSeguimientoMesas v-if="tabActiva === 'mis-torneos'" :partidos="partidosEnVivoParaBanner" />
        <BannerReglamento v-else />

        <KpiEstadisticas
          v-if="tabActiva === 'mis-torneos'"
          :torneos-jugados="estadisticasJugador.torneosJugados || conteoFinalizado"
          :torneos-en-curso="estadisticasJugador.torneosEnCurso || conteoEnCurso"
          :efectividad="estadisticasJugador.efectividad"
          :sets-ganados="estadisticasJugador.setsGanados"
          :sets-perdidos="estadisticasJugador.setsPerdidos"
          :podios="estadisticasJugador.podios"
        />
      </template>
    </main>

    <Footer />

    <ModalInscripcionTorneo
      ref="modalInscripcionRef"
      :torneo="torneoSeleccionado"
      @inscribir="handleConfirmarInscripcion"
    />

    <ModalVerificacionPago
      ref="modalVerificacionRef"
      :torneo="torneoSeleccionado"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Trophy, Compass } from 'lucide-vue-next'
import FondoEstadioCancha from '@/components/FondoEstadioCancha.vue'
import TorneoCard from './partials/dashboard/TorneoCard.vue'
import BreadcrumbExpediente from './partials/dashboard/BreadcrumbExpediente.vue'
import FiltrosMisTorneos from './partials/dashboard/FiltrosMisTorneos.vue'
import FiltrosDisponibles from './partials/dashboard/FiltrosDisponibles.vue'
import BannerSeguimientoMesas, { type PartidoEnVivo } from './partials/dashboard/BannerSeguimientoMesas.vue'
import BannerReglamento from './partials/dashboard/BannerReglamento.vue'
import KpiEstadisticas from './partials/dashboard/KpiEstadisticas.vue'
import ModalInscripcionTorneo from './partials/dashboard/ModalInscripcionTorneo.vue'
import ModalVerificacionPago from './partials/dashboard/ModalVerificacionPago.vue'
import VistaParticipacionTorneo from './partials/participacion/VistaParticipacionTorneo.vue'
import type { Torneo } from '@/types'
import { useAuthStore } from '@/stores/auth'
import {
  obtenerTorneosDB,
  obtenerInscripcionesDB,
  guardarInscripcionDB,
  obtenerEstadisticasJugadorDB,
  suscribirPartidosEnVivoDB,
  type EstadisticasJugador,
} from '@/services/torneoDatabaseService'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const tabGuardada = (route.query.tab as string) || localStorage.getItem('spinapp_dashboard_tab')
const tabActiva = ref<'mis-torneos' | 'disponibles'>(
  tabGuardada === 'disponibles' || tabGuardada === 'mis-torneos' ? tabGuardada : 'mis-torneos'
)

watch(tabActiva, (nuevaTab) => {
  try {
    localStorage.setItem('spinapp_dashboard_tab', nuevaTab)
  } catch {
    // ignorar error
  }
  router.replace({ query: { ...route.query, tab: nuevaTab } })
})

const torneoParticipacion = ref<Torneo | null>(null)
const cargando = ref(false)

const busquedaMisTorneos = ref('')
const filtroEstadoMisTorneos = ref('todos')

const busquedaDisponibles = ref('')
const filtroCategoria = ref('todas')
const filtroModalidad = ref('todas')

const modalInscripcionRef = ref()
const modalVerificacionRef = ref()
const torneoSeleccionado = ref<Torneo | null>(null)

const misTorneos = ref<Torneo[]>([])
const torneosDisponibles = ref<Torneo[]>([])

const estadisticasJugador = ref<EstadisticasJugador>({
  torneosJugados: 0,
  torneosEnCurso: 0,
  partidosJugados: 0,
  partidosGanados: 0,
  partidosPerdidos: 0,
  setsGanados: 0,
  setsPerdidos: 0,
  efectividad: 0,
  puntosRanking: 1000,
  podios: 0,
  etiquetaElo: 'ELO Base',
})

const cargarEstadisticas = async () => {
  const usuario = authStore.usuario
  if (!usuario?.id) return
  try {
    const nombreCompleto = `${usuario.nombre} ${usuario.apellido || ''}`.trim()
    const stats = await obtenerEstadisticasJugadorDB(
      usuario.id,
      nombreCompleto,
      misTorneos.value,
      (usuario as any).puntosRanking || (usuario as any).elo || 1000,
    )
    estadisticasJugador.value = stats
  } catch (err) {
    console.warn('Error al calcular estadísticas del jugador:', err)
  }
}

watch(torneoParticipacion, (nuevo) => {
  if (!nuevo) {
    cargarEstadisticas()
  }
})

const conteoEnVerificacion = computed(() => misTorneos.value.filter((t) => t.subestado === 'PENDIENTE').length)
const conteoEnCurso = computed(() => misTorneos.value.filter((t) => t.subestado !== 'PENDIENTE' && t.estado === 'en curso').length)
const conteoPorIniciar = computed(() => misTorneos.value.filter((t) => t.subestado !== 'PENDIENTE' && t.estado === 'por iniciar').length)
const conteoFinalizado = computed(() => misTorneos.value.filter((t) => t.subestado !== 'PENDIENTE' && t.estado === 'finalizado').length)

// Estado y sincronización en tiempo real de mesas en vivo
const partidosEnVivoDB = ref<any[]>([])
let unsubscribeMesasEnVivo: (() => void) | null = null

const partidosEnVivoParaBanner = computed<PartidoEnVivo[]>(() => {
  return partidosEnVivoDB.value.map((p) => {
    const m = p.marcadorEnVivo
    const j1Nombre = p.jugador1?.nombre || 'Jugador 1'
    const j2Nombre = p.jugador2?.nombre || 'Jugador 2'
    return {
      id: p.id,
      mesa: m?.mesa || p.mesa || 'Mesa 1',
      setActual: m?.setActual || 'Set 1',
      jugador1: {
        nombre: j1Nombre,
        puntos: m?.puntosJ1 ?? 0,
        setsGanados: m?.setsGanadosJ1,
        estaSacando: m?.servidorActual === 1,
      },
      jugador2: {
        nombre: j2Nombre,
        puntos: m?.puntosJ2 ?? 0,
        setsGanados: m?.setsGanadosJ2,
        estaSacando: m?.servidorActual === 2,
      },
    }
  })
})

// Carga de torneos reales desde Firestore
onMounted(async () => {
  // Iniciar suscripción en tiempo real a las mesas de juego con partidos en vivo de inmediato
  unsubscribeMesasEnVivo = suscribirPartidosEnVivoDB((partidos) => {
    partidosEnVivoDB.value = partidos
  })

  cargando.value = true
  try {
    const torneosRemotos = await obtenerTorneosDB()
    const userId = authStore.usuario?.id

    const inscritos: Torneo[] = []
    const disponibles: Torneo[] = []

    for (const t of torneosRemotos) {
      let estaInscrito = false
      if (userId) {
        const inscripciones = await obtenerInscripcionesDB(t.id)
        estaInscrito = inscripciones.some((ins: any) => ins.jugadorId === userId || ins.id === userId)
      }

      if (estaInscrito) {
        inscritos.push({ ...t, estaInscrito: true })
      } else {
        disponibles.push({ ...t, estaInscrito: false })
      }
    }

    misTorneos.value = inscritos
    torneosDisponibles.value = disponibles
    await cargarEstadisticas()

    // Restaurar torneo activo persistido en URL o localStorage tras recarga
    const torneoIdPersistido = (route.query.torneo as string) || localStorage.getItem('spinapp_torneo_activo_id')
    if (torneoIdPersistido) {
      const encontrado = [...inscritos, ...disponibles].find((t) => t.id === torneoIdPersistido)
      if (encontrado && encontrado.subestado !== 'PENDIENTE') {
        torneoParticipacion.value = encontrado
      }
    }
  } catch (err) {
    console.error('Error al cargar torneos desde la base de datos:', err)
  } finally {
    cargando.value = false
  }
})

const misTorneosFiltrados = computed(() => {
  return misTorneos.value.filter((t) => {
    const coincideTexto =
      t.nombre.toLowerCase().includes(busquedaMisTorneos.value.toLowerCase()) ||
      t.organizador.toLowerCase().includes(busquedaMisTorneos.value.toLowerCase())

    let coincideEstado = true
    if (filtroEstadoMisTorneos.value === 'en verificacion') {
      coincideEstado = t.subestado === 'PENDIENTE'
    } else if (filtroEstadoMisTorneos.value !== 'todos') {
      coincideEstado = t.subestado !== 'PENDIENTE' && t.estado === filtroEstadoMisTorneos.value
    }

    return coincideTexto && coincideEstado
  })
})

const torneosDisponiblesFiltrados = computed(() => {
  return torneosDisponibles.value.filter((t) => {
    const coincideTexto =
      t.nombre.toLowerCase().includes(busquedaDisponibles.value.toLowerCase()) ||
      t.organizador.toLowerCase().includes(busquedaDisponibles.value.toLowerCase()) ||
      (t.sede && t.sede.toLowerCase().includes(busquedaDisponibles.value.toLowerCase()))

    return coincideTexto
  })
})

const handleAbrirInscripcion = (torneo: Torneo) => {
  torneoSeleccionado.value = torneo
  modalInscripcionRef.value?.open()
}

const handleConfirmarInscripcion = async (torneo: Torneo) => {
  const usuario = authStore.usuario
  if (!usuario) return

  // 1. Crear documento de inscripción en Firestore vinculado al usuario autenticado
  const nuevaInscripcion = {
    id: `${torneo.id}_${usuario.id}`,
    torneoId: torneo.id,
    jugadorId: usuario.id,
    nombre: `${usuario.nombre} ${usuario.apellido || ''}`.trim(),
    iniciales: `${usuario.nombre?.[0] || 'J'}${usuario.apellido?.[0] || ''}`.toUpperCase(),
    telefono: usuario.telefono || '',
    tipo: usuario.tipo || 'camper',
    pagoValidado: false,
    subestado: 'PENDIENTE',
    fechaInscripcion: new Date().toISOString(),
  }

  try {
    await guardarInscripcionDB(nuevaInscripcion)
  } catch (err) {
    console.error('Error al guardar inscripción en base de datos:', err)
  }

  // 2. Actualizar estado reactivo local
  const torneoEnDisponibles = torneosDisponibles.value.find((t) => t.id === torneo.id)
  if (torneoEnDisponibles) {
    torneoEnDisponibles.estaInscrito = true
    torneoEnDisponibles.subestado = 'PENDIENTE'
  }

  const existe = misTorneos.value.some((t) => t.id === torneo.id)
  if (!existe) {
    misTorneos.value.unshift({
      ...torneo,
      estaInscrito: true,
      subestado: 'PENDIENTE',
    })
  }

  torneoSeleccionado.value = torneo
  tabActiva.value = 'mis-torneos'
  modalVerificacionRef.value?.open()
}

const handleAbrirVerificacion = (torneo: Torneo) => {
  torneoSeleccionado.value = torneo
  modalVerificacionRef.value?.open()
}

const handleVerTorneo = (torneo: Torneo) => {
  if (torneo.subestado === 'PENDIENTE') {
    handleAbrirVerificacion(torneo)
    return
  }
  torneoParticipacion.value = torneo
  try {
    localStorage.setItem('spinapp_torneo_activo_id', torneo.id)
  } catch {
    // ignorar error
  }
  router.replace({ query: { ...route.query, torneo: torneo.id } })
}

const handleVolverDeTorneo = () => {
  torneoParticipacion.value = null
  try {
    localStorage.removeItem('spinapp_torneo_activo_id')
  } catch {
    // ignorar error
  }
  const q = { ...route.query }
  delete q.torneo
  delete q.vista
  router.replace({ query: q })
}

onUnmounted(() => {
  if (unsubscribeMesasEnVivo) {
    unsubscribeMesasEnVivo()
    unsubscribeMesasEnVivo = null
  }
})
</script>

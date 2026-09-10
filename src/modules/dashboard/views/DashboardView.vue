<template>
  <div class="min-h-screen w-full bg-slate-100 dark:bg-[#080d1a] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
    <Navbar />

    <BreadcrumbExpediente />

    <main class="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 flex flex-col gap-6">
      <VistaParticipacionTorneo
        v-if="torneoParticipacion"
        :torneo="torneoParticipacion"
        @volver="torneoParticipacion = null"
      />

      <template v-else>
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 class="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight">
              Panel del Jugador
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Gestiona tus inscripciones y descubre nuevos torneos disponibles.
            </p>
          </div>

          <div
            class="grid grid-cols-2 sm:flex items-center p-1 bg-slate-200/80 dark:bg-slate-800 rounded-xl border border-slate-300/70 dark:border-slate-700 w-full sm:w-auto">
            <button type="button" :class="[
              'flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer',
              tabActiva === 'mis-torneos'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
            ]" @click="tabActiva = 'mis-torneos'">
              <Trophy class="w-3.5 h-3.5" />
              <span>Mis Torneos</span>
              <span :class="[
                'text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5',
                tabActiva === 'mis-torneos'
                  ? 'bg-orange-900 text-orange-100'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
              ]">
                {{ misTorneos.length }}
              </span>
            </button>

            <button type="button" :class="[
              'flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer',
              tabActiva === 'disponibles'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white',
            ]" @click="tabActiva = 'disponibles'">
              <Compass class="w-3.5 h-3.5" />
              <span>Torneos Disponibles</span>
              <span :class="[
                'text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5',
                tabActiva === 'disponibles'
                  ? 'bg-orange-900 text-orange-100'
                  : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300',
              ]">
                {{ torneosDisponibles.length }}
              </span>
            </button>
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

        <BannerSeguimientoMesas v-if="tabActiva === 'mis-torneos'" />
        <BannerReglamento v-else />

        <KpiEstadisticas v-if="tabActiva === 'mis-torneos'" :torneos-jugados="conteoFinalizado" />
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
import { ref, computed, onMounted } from 'vue'
import { Trophy, Compass } from 'lucide-vue-next'
import TorneoCard from './partials/dashboard/TorneoCard.vue'
import BreadcrumbExpediente from './partials/dashboard/BreadcrumbExpediente.vue'
import FiltrosMisTorneos from './partials/dashboard/FiltrosMisTorneos.vue'
import FiltrosDisponibles from './partials/dashboard/FiltrosDisponibles.vue'
import BannerSeguimientoMesas from './partials/dashboard/BannerSeguimientoMesas.vue'
import BannerReglamento from './partials/dashboard/BannerReglamento.vue'
import KpiEstadisticas from './partials/dashboard/KpiEstadisticas.vue'
import ModalInscripcionTorneo from './partials/dashboard/ModalInscripcionTorneo.vue'
import ModalVerificacionPago from './partials/dashboard/ModalVerificacionPago.vue'
import VistaParticipacionTorneo from './partials/participacion/VistaParticipacionTorneo.vue'
import type { Torneo } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { obtenerTorneosDB, obtenerInscripcionesDB, guardarInscripcionDB } from '@/services/torneoDatabaseService'

const authStore = useAuthStore()

const tabActiva = ref<'mis-torneos' | 'disponibles'>('mis-torneos')
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

const conteoEnVerificacion = computed(() => misTorneos.value.filter((t) => t.subestado === 'PENDIENTE').length)
const conteoEnCurso = computed(() => misTorneos.value.filter((t) => t.subestado !== 'PENDIENTE' && t.estado === 'en curso').length)
const conteoPorIniciar = computed(() => misTorneos.value.filter((t) => t.subestado !== 'PENDIENTE' && t.estado === 'por iniciar').length)
const conteoFinalizado = computed(() => misTorneos.value.filter((t) => t.subestado !== 'PENDIENTE' && t.estado === 'finalizado').length)

// Carga de torneos reales desde Firestore
onMounted(async () => {
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
}
</script>

<template>
  <div class="min-h-screen w-full bg-text text-slate-800 flex flex-col font-sans">
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
            <h1 class="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 tracking-tight">
              Panel del Jugador
            </h1>
            <p class="text-xs sm:text-sm text-slate-500 mt-1">
              Gestiona tus inscripciones y descubre nuevos torneos disponibles.
            </p>
          </div>

          <div
            class="grid grid-cols-2 sm:flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80 w-full sm:w-auto">
            <button type="button" :class="[
              'flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer',
              tabActiva === 'mis-torneos'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900',
            ]" @click="tabActiva = 'mis-torneos'">
              <Trophy class="w-3.5 h-3.5" />
              <span>Mis Torneos</span>
              <span :class="[
                'text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5',
                tabActiva === 'mis-torneos'
                  ? 'bg-emerald-900 text-emerald-100'
                  : 'bg-slate-200 text-slate-700',
              ]">
                {{ misTorneos.length }}
              </span>
            </button>

            <button type="button" :class="[
              'flex items-center justify-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer',
              tabActiva === 'disponibles'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900',
            ]" @click="tabActiva = 'disponibles'">
              <Compass class="w-3.5 h-3.5" />
              <span>Torneos Disponibles</span>
              <span :class="[
                'text-[10px] px-1.5 py-0.5 rounded-full font-bold ml-0.5',
                tabActiva === 'disponibles'
                  ? 'bg-emerald-900 text-emerald-100'
                  : 'bg-slate-200 text-slate-700',
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
          v-model:categoria="filtroCategoria"
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
            class="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-slate-300 bg-white"
          >
            <Trophy class="w-10 h-10 text-slate-400 mb-2" />
            <h3 class="text-sm font-bold text-slate-800">No se encontraron torneos inscritos</h3>
            <p class="text-xs text-slate-500 mt-1">Prueba cambiando los términos de búsqueda o filtros.</p>
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
            class="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-slate-300 bg-white"
          >
            <Compass class="w-10 h-10 text-slate-400 mb-2" />
            <h3 class="text-sm font-bold text-slate-800">No hay torneos disponibles con estos criterios</h3>
            <p class="text-xs text-slate-500 mt-1">Prueba cambiando los términos de búsqueda o restableciendo los filtros.</p>
          </div>
        </section>

        <BannerSeguimientoMesas v-if="tabActiva === 'mis-torneos'" />
        <BannerReglamento v-else />

        <KpiEstadisticas v-if="tabActiva === 'mis-torneos'" />
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
import { ref, computed } from 'vue'
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

const tabActiva = ref<'mis-torneos' | 'disponibles'>('mis-torneos')
const torneoParticipacion = ref<Torneo | null>(null)

const busquedaMisTorneos = ref('')
const filtroEstadoMisTorneos = ref('todos')

const busquedaDisponibles = ref('')
const filtroCategoria = ref('todas')
const filtroModalidad = ref('todas')

const modalInscripcionRef = ref()
const modalVerificacionRef = ref()
const torneoSeleccionado = ref<Torneo | null>(null)

const conteoEnVerificacion = computed(() => misTorneos.value.filter((t) => t.subestado === 'PENDIENTE').length)
const conteoEnCurso = computed(() => misTorneos.value.filter((t) => t.subestado !== 'PENDIENTE' && t.estado === 'en curso').length)
const conteoPorIniciar = computed(() => misTorneos.value.filter((t) => t.subestado !== 'PENDIENTE' && t.estado === 'por iniciar').length)
const conteoFinalizado = computed(() => misTorneos.value.filter((t) => t.subestado !== 'PENDIENTE' && t.estado === 'finalizado').length)

const misTorneos = ref<Torneo[]>([
  {
    id: 't-1',
    nombre: 'Torneo Apertura Campers & Trainers 2026',
    organizador: 'Comité Campuslands',
    fechaInicio: '15 de Marzo, 2026',
    estado: 'en curso',
    subestado: 'INSCRITO',
    descripcion: 'Fase de eliminación directa. Cuadro de 32 jugadores. Modalidad individual masculina y femenina.',
    costoInscripcion: 6000,
    fechaLimiteInscripcion: '10 de Marzo, 2026',
    numeroCuenta: '031-987654-21 (Bancolombia Ahorros)',
    whatsappContacto: '+57 300 123 4567',
    mesaAsignada: 'MESA 04 (16:30)',
    estaInscrito: true,
  },
  {
    id: 't-2',
    nombre: 'Torneo Relámpago Ping Pong Fin de Semana',
    organizador: 'Andrés Galvis',
    fechaInicio: '28 de Marzo, 2026',
    estado: 'por iniciar',
    subestado: 'CONFIRMADO',
    descripcion: 'Formato relámpago con partidos al mejor de 3 sets. Premiación inmediata y ranking federado.',
    costoInscripcion: 6000,
    fechaLimiteInscripcion: '25 de Marzo, 2026',
    numeroCuenta: '031-987654-21 (Bancolombia Ahorros)',
    whatsappContacto: '+57 310 987 6543',
    sorteoLlaves: 'En 4 días',
    estaInscrito: true,
  },
  {
    id: 't-3',
    nombre: 'Copa Verano 2025 - Edición Anterior',
    organizador: 'Staff Ping Pong',
    fechaInicio: '10 de Diciembre, 2025',
    estado: 'finalizado',
    subestado: 'COMPLETADO',
    descripcion: 'Finalista en semifinales de llave plata. Resultado global: 4 victorias, 1 derrota.',
    costoInscripcion: 6000,
    fechaLimiteInscripcion: '05 de Diciembre, 2025',
    numeroCuenta: '031-987654-21 (Bancolombia Ahorros)',
    whatsappContacto: '+57 300 123 4567',
    posicionFinal: '3er Lugar (Bronce)',
    estaInscrito: true,
  },
])

const torneosDisponibles = ref<Torneo[]>([
  {
    id: 't-4',
    nombre: 'Gran Torneo Máster SpinApp 2026',
    categoria: 'CATEGORÍA MÁSTER',
    modalidad: 'INDIVIDUAL MASCULINO',
    descripcion: 'Competencia estelar de apertura con puntuación federada nacional, mesas de alta competición y transmisión oficial por streaming.',
    organizador: 'Dirección Deportiva',
    fechaInicio: '01 Abr, 2026',
    fechaLimiteInscripcion: '28 Mar, 2026',
    sede: 'Sede Central Olimpia',
    cuposTomados: 14,
    cuposTotales: 32,
    estado: 'por iniciar',
    costoInscripcion: 6000,
    numeroCuenta: '912-345678-09 (Nequi / Bancolombia)',
    whatsappContacto: '+57 315 555 7890',
    estaInscrito: false,
  },
  {
    id: 't-5',
    nombre: 'Torneo Dobles e Individual Inter-Sedes',
    categoria: 'TODO COMPETIDOR',
    modalidad: 'INDIVIDUAL & DOBLES',
    descripcion: 'Jornada recreativa y competitiva mixta entre sedes afiliadas. Modalidades continuas y premiación especial para clubes invitados.',
    organizador: 'Área de Bienestar',
    fechaInicio: '15 Abr, 2026',
    fechaLimiteInscripcion: '10 Abr, 2026',
    sede: 'Gimnasio Polideportivo Norte',
    cuposTomados: 22,
    cuposTotales: 48,
    estado: 'por iniciar',
    costoInscripcion: 6000,
    numeroCuenta: '912-345678-09 (Nequi / Bancolombia)',
    whatsappContacto: '+57 315 555 7890',
    estaInscrito: false,
  },
])

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

    const coincideCategoria =
      filtroCategoria.value === 'todas' ||
      (t.categoria && t.categoria.toLowerCase().includes(filtroCategoria.value.toLowerCase()))

    const coincideModalidad =
      filtroModalidad.value === 'todas' ||
      (t.modalidad && t.modalidad.toLowerCase().includes(filtroModalidad.value.toLowerCase()))

    return coincideTexto && coincideCategoria && coincideModalidad
  })
})

const handleAbrirInscripcion = (torneo: Torneo) => {
  torneoSeleccionado.value = torneo
  modalInscripcionRef.value?.open()
}

const handleConfirmarInscripcion = (torneo: Torneo) => {
  const torneoEnDisponibles = torneosDisponibles.value.find((t) => t.id === torneo.id)
  if (torneoEnDisponibles) {
    torneoEnDisponibles.estaInscrito = true
    torneoEnDisponibles.subestado = 'PENDIENTE'
    if (torneoEnDisponibles.cuposTomados) {
      torneoEnDisponibles.cuposTomados += 1
    }
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

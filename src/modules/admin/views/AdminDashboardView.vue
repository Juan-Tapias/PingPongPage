<template>
  <div class="min-h-screen w-full bg-slate-50 dark:bg-[#080d1a] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
    <Navbar />

    <!-- Cabecera de Gestión Administrativa -->
    <header class="w-full bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-300">
      <div class="max-w-7xl 2xl:max-w-[1720px] mx-auto px-4 sm:px-6 2xl:px-8 py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 class="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
            Torneos Creados
          </h1>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Administra los torneos del club, sus estados y los cupos disponibles.
          </p>
        </div>

        <!-- Acciones Rápidas del Admin -->
        <div class="flex items-center gap-3">
          <RouterLink
            to="/"
            class="flex items-center justify-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <UserCheck class="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Ver como Jugador</span>
          </RouterLink>

          <button
            type="button"
            class="flex items-center justify-center gap-2 px-4 py-2 text-xs sm:text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md shadow-orange-950/20 transition-all cursor-pointer"
            @click="abrirModalCrearTorneo"
          >
            <Plus class="w-4 h-4" />
            <span>+ Crear Torneo / Proyecto</span>
          </button>
        </div>
      </div>
    </header>

    <!-- Contenido Principal: Solo Torneos Creados -->
    <main class="flex-1 max-w-7xl 2xl:max-w-[1720px] w-full mx-auto px-4 sm:px-6 2xl:px-8 py-6 flex flex-col gap-6">
      <section class="space-y-5">
        <!-- Barra de Búsqueda y Filtros de Torneo -->
        <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
          <div class="relative flex-1">
            <Search class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              v-model="busquedaTorneo"
              type="text"
              placeholder="Buscar torneo por nombre o categoría..."
              class="w-full pl-9 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 placeholder:text-slate-400"
            />
          </div>

          <div class="flex items-center gap-2 overflow-x-auto scrollbar-none pb-0.5 sm:pb-0">
            <div class="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold shrink-0">
              <button
                type="button"
                :class="['px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap', filtroEstado === 'todos' ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400']"
                @click="filtroEstado = 'todos'"
              >
                Todos ({{ torneos.length }})
              </button>
              <button
                type="button"
                :class="['px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap', filtroEstado === 'en curso' ? 'bg-white dark:bg-slate-700 shadow-xs text-emerald-600 dark:text-emerald-400 font-bold' : 'text-slate-600 dark:text-slate-400']"
                @click="filtroEstado = 'en curso'"
              >
                En Curso
              </button>
              <button
                type="button"
                :class="['px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap', filtroEstado === 'por iniciar' ? 'bg-white dark:bg-slate-700 shadow-xs text-sky-600 dark:text-sky-400 font-bold' : 'text-slate-600 dark:text-slate-400']"
                @click="filtroEstado = 'por iniciar'"
              >
                Por Iniciar
              </button>
              <button
                type="button"
                :class="['px-2.5 sm:px-3 py-1.5 rounded-lg transition-colors cursor-pointer whitespace-nowrap', filtroEstado === 'finalizado' ? 'bg-white dark:bg-slate-700 shadow-xs text-slate-900 dark:text-white font-bold' : 'text-slate-600 dark:text-slate-400']"
                @click="filtroEstado = 'finalizado'"
              >
                Finalizados
              </button>
            </div>
          </div>
        </div>

        <!-- Grid de Torneos Administrativos: 1 col móvil, 2 cols tablet/laptop, 3 cols desktop 24", 4 cols widescreen 27" -->
        <div v-if="torneosFiltrados.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5 2xl:gap-6">
          <div
            v-for="torneo in torneosFiltrados"
            :key="torneo.id"
            class="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-lg dark:hover:shadow-sky-950/20 hover:border-sky-500/40 transition-all duration-200 flex flex-col justify-between overflow-hidden"
          >
            <!-- Encabezado de la Tarjeta -->
            <div class="p-4 sm:p-5 space-y-3">
              <div class="flex items-start justify-between gap-2 flex-wrap sm:flex-nowrap">
                <span class="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 truncate max-w-[180px]">
                  {{ torneo.categoria || 'TORNEO OFICIAL' }}
                </span>

                <!-- Badge de Estado Dinámico con selector rápido -->
                <select
                  :value="torneo.estado"
                  @change="cambiarEstadoTorneo(torneo.id, ($event.target as HTMLSelectElement).value as any)"
                  :class="[
                    'text-[11px] font-bold px-2 py-1 rounded-lg border focus:outline-none cursor-pointer shrink-0',
                    torneo.estado === 'en curso' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/60' :
                    torneo.estado === 'por iniciar' ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-800/60' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                  ]"
                >
                  <option value="por iniciar">⏳ Por Iniciar</option>
                  <option value="en curso">🟢 En Curso</option>
                  <option value="finalizado">🏁 Finalizado</option>
                </select>
              </div>

              <div>
                <h3 class="text-base font-bold font-heading text-slate-900 dark:text-white tracking-tight line-clamp-1">
                  {{ torneo.nombre }}
                </h3>
                <p class="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                  {{ torneo.descripcion || 'Sin descripción especificada para este torneo.' }}
                </p>
              </div>

              <!-- Metadatos (Organizador y Fechas) -->
              <div class="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <div class="flex items-center gap-1.5 truncate">
                  <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span class="truncate">{{ torneo.organizador || 'Comité Organizador' }}</span>
                </div>
                <div class="flex items-center gap-1.5 truncate">
                  <Calendar class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span class="truncate">Inicio: {{ torneo.fechaInicio }}</span>
                </div>
              </div>
            </div>

            <!-- Footer de la Tarjeta con Costo de Inscripción y Acciones -->
            <div class="px-4 sm:px-5 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <div class="text-xs min-w-0">
                <span class="text-slate-400 dark:text-slate-500 block text-[10px] font-bold uppercase truncate">Inscripción</span>
                <span class="font-extrabold text-emerald-600 dark:text-emerald-400 truncate block">
                  ${{ (torneo.costoInscripcion || 0).toLocaleString('es-CO') }} COP
                </span>
              </div>

              <div class="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  class="p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                  title="Eliminar Torneo"
                  @click="eliminarTorneo(torneo.id)"
                >
                  <Trash2 class="w-4 h-4" />
                </button>
                <button
                  type="button"
                  class="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                  @click="abrirDetalleTorneo(torneo)"
                >
                  <Eye class="w-3.5 h-3.5 text-orange-500" />
                  <span>Gestionar</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="flex flex-col items-center justify-center py-16 px-4 text-center rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white dark:bg-[#0f172a]"
        >
          <Trophy class="w-10 h-10 text-slate-300 dark:text-slate-600 mb-2" />
          <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">No hay torneos con los filtros seleccionados</h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">Crea un nuevo torneo con el botón superior o cambia los términos de búsqueda.</p>
        </div>
      </section>
    </main>

    <!-- Footer -->
    <Footer />

    <!-- Modales del Administrador -->
    <ModalCrearTorneo
      ref="modalCrearTorneoRef"
      @crear="handleCrearTorneo"
    />

    <ModalResolverPartidoAdmin
      ref="modalResolverRef"
      @resolver="handleResolverPartido"
    />

    <ModalVerComprobante
      ref="modalComprobanteRef"
      @aprobar="aprobarPago"
      @rechazar="rechazarPago"
    />

    <!-- MODAL CENTRO DE MANDO Y GESTIÓN INTEGRAL DE TORNEO -->
    <ModalGestionarTorneo
      ref="modalGestionarRef"
      :torneo="torneoSeleccionado"
      @actualizar-estado="cambiarEstadoTorneo"
      @abrir-resolver-partido="abrirResolverPartido"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Trophy,
  UserCheck,
  Plus,
  Search,
  Calendar,
  User,
  Trash2,
  Eye,
} from 'lucide-vue-next'
import Navbar from '@/components/Navbar.vue'
import Footer from '@/components/Footer.vue'
import ModalCrearTorneo from '../components/ModalCrearTorneo.vue'
import ModalResolverPartidoAdmin from '../components/ModalResolverPartidoAdmin.vue'
import ModalVerComprobante from '../components/ModalVerComprobante.vue'
import ModalGestionarTorneo from '../components/ModalGestionarTorneo.vue'
import type { Torneo } from '@/types'
import {
  obtenerTorneosDB,
  guardarTorneoDB,
  actualizarEstadoTorneoDB,
  eliminarTorneoDB,
} from '@/services/torneoDatabaseService'

const busquedaTorneo = ref('')
const filtroEstado = ref<'todos' | 'en curso' | 'por iniciar' | 'finalizado'>('todos')
const cargandoTorneos = ref(false)

const modalCrearTorneoRef = ref()
const modalResolverRef = ref()
const modalComprobanteRef = ref()
const modalGestionarRef = ref()
const torneoSeleccionado = ref<Torneo | null>(null)

const torneos = ref<Torneo[]>([])

onMounted(async () => {
  cargandoTorneos.value = true
  try {
    torneos.value = await obtenerTorneosDB()
  } catch (error) {
    console.error('Error al cargar datos desde la base de datos:', error)
  } finally {
    cargandoTorneos.value = false
  }
})

// Solicitudes y disputas para modales de gestión
const solicitudesPago = ref<any[]>([])
const partidosConflicto = ref<any[]>([])

const torneosFiltrados = computed(() => {
  return torneos.value.filter(t => {
    const coincideBusqueda =
      t.nombre.toLowerCase().includes(busquedaTorneo.value.toLowerCase()) ||
      (t.categoria && t.categoria.toLowerCase().includes(busquedaTorneo.value.toLowerCase())) ||
      (t.organizador && t.organizador.toLowerCase().includes(busquedaTorneo.value.toLowerCase()))

    const coincideEstado = filtroEstado.value === 'todos' || t.estado === filtroEstado.value
    return coincideBusqueda && coincideEstado
  })
})

// Handlers de acciones vinculados a la Base de Datos
const abrirModalCrearTorneo = () => {
  modalCrearTorneoRef.value?.open()
}

const handleCrearTorneo = async (nuevoTorneo: Torneo) => {
  torneos.value.unshift(nuevoTorneo)
  try {
    await guardarTorneoDB(nuevoTorneo)
  } catch (err) {
    console.error('Error al persistir torneo en base de datos:', err)
  }
}

const cambiarEstadoTorneo = async (id: string, nuevoEstado: 'por iniciar' | 'en curso' | 'finalizado') => {
  const torneo = torneos.value.find(t => t.id === id)
  if (torneo) {
    torneo.estado = nuevoEstado
    try {
      await actualizarEstadoTorneoDB(id, nuevoEstado)
    } catch (err) {
      console.error('Error al actualizar estado en base de datos:', err)
    }
  }
}

const eliminarTorneo = async (id: string) => {
  torneos.value = torneos.value.filter(t => t.id !== id)
  try {
    await eliminarTorneoDB(id)
  } catch (err) {
    console.error('Error al eliminar torneo de base de datos:', err)
  }
}

const abrirDetalleTorneo = (torneo: Torneo) => {
  torneoSeleccionado.value = torneo
  modalGestionarRef.value?.open()
}

const abrirComprobante = (solicitud: any) => {
  modalComprobanteRef.value?.open(solicitud)
}

const aprobarPago = (id: string) => {
  const solicitud = solicitudesPago.value.find(s => s.id === id)
  if (solicitud) {
    // Sincronizar cupo tomado en el torneo correspondiente
    const torneoAsociado = torneos.value.find(t => t.nombre === solicitud.torneoNombre)
    if (torneoAsociado) {
      torneoAsociado.cuposTomados = (torneoAsociado.cuposTomados || 0) + 1
      guardarTorneoDB(torneoAsociado)
    }
  }
  solicitudesPago.value = solicitudesPago.value.filter(s => s.id !== id)
}

const rechazarPago = (id: string) => {
  solicitudesPago.value = solicitudesPago.value.filter(s => s.id !== id)
}

const abrirResolverPartido = (partido: any) => {
  modalResolverRef.value?.open(partido)
}

const handleResolverPartido = (payload: any) => {
  partidosConflicto.value = partidosConflicto.value.filter(p => p.id !== payload.partidoId)
}
</script>

<template>
  <div class="min-h-screen w-full bg-[#f8fafc] dark:bg-[#070b16] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300 relative overflow-x-hidden">
    <!-- Efecto de Fondo Ambiental Deportivo (Luces de Arena Tenis de Mesa) -->
    <div class="absolute top-0 left-1/4 w-96 h-96 bg-orange-500/10 dark:bg-orange-600/15 rounded-full blur-3xl pointer-events-none -z-10" />
    <div class="absolute top-48 right-10 w-96 h-96 bg-blue-500/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none -z-10" />

    <Navbar />

    <!-- Hero Banner de Mando Deportivo -->
    <section class="relative w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white via-slate-50/50 to-transparent dark:from-[#0d1326] dark:via-[#090e1c] dark:to-transparent transition-colors">
      <div class="max-w-7xl 2xl:max-w-[1720px] mx-auto px-4 sm:px-6 2xl:px-8 pt-8 pb-10">
        <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div class="max-w-3xl space-y-2">
            <!-- Badge Superior Oficial -->
            <div class="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/25 text-orange-600 dark:text-orange-400 text-[11px] font-black uppercase tracking-wider shadow-2xs">
              <span class="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <Flame class="w-3.5 h-3.5" />
              <span>Centro de Mando Oficial • SpinApp Arena</span>
            </div>

            <!-- Título Principal con Gradiente -->
            <h1 class="text-2xl sm:text-3xl lg:text-4xl font-black font-heading tracking-tight text-slate-900 dark:text-white leading-tight">
              Gestión y Control de <span class="text-transparent bg-clip-text bg-gradient-to-r from-orange-600 via-amber-500 to-orange-500">Torneos Oficiales</span>
            </h1>

            <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 font-medium leading-relaxed max-w-2xl">
              Supervisa las fases competitivas, valida los pagos de inscripción ($6.000 COP), genera enfrentamientos con Algoritmo Berger y gestiona la tabla de posiciones en tiempo real.
            </p>
          </div>

          <!-- Acciones Principales con Alto Impacto Visual -->
          <div class="flex items-center flex-wrap sm:flex-nowrap gap-3 shrink-0">
            <RouterLink
              to="/"
              class="flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-white dark:bg-slate-800/90 hover:bg-slate-100 dark:hover:bg-slate-750 border border-slate-200 dark:border-slate-700/80 rounded-2xl shadow-xs transition-all cursor-pointer backdrop-blur-md"
            >
              <UserCheck class="w-4 h-4 text-slate-500 dark:text-slate-400" />
              <span>Ver como Jugador</span>
            </RouterLink>

            <button
              type="button"
              class="flex items-center justify-center gap-2.5 px-5 py-2.5 text-xs sm:text-sm font-black text-white bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 hover:from-orange-500 hover:to-amber-400 rounded-2xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer ring-2 ring-orange-500/20"
              @click="abrirModalCrearTorneo"
            >
              <Plus class="w-4 h-4" />
              <span>Crear Nuevo Torneo</span>
            </button>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- CUADRÍCULA DE MÉTRICAS KPI (EN TIEMPO REAL)     -->
        <!-- ============================================== -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4 pt-8">
          <!-- KPI 1: Torneos en Curso -->
          <div class="relative p-4 sm:p-4.5 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-xs flex flex-col justify-between overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                En Competencia
              </span>
              <div class="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center border border-emerald-500/20">
                <Activity class="w-4 h-4" />
              </div>
            </div>
            <div class="mt-3 flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                {{ statsCircuito.enCurso }}
              </span>
              <span class="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>En Vivo</span>
              </span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              Partidos Round Robin y llaves de eliminación
            </p>
          </div>

          <!-- KPI 2: Bolsa Acumulada -->
          <div class="relative p-4 sm:p-4.5 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-xs flex flex-col justify-between overflow-hidden group hover:border-amber-500/40 transition-all">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
                Bolsa Acumulada
              </span>
              <div class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center border border-amber-500/20">
                <Crown class="w-4 h-4 text-amber-500" />
              </div>
            </div>
            <div class="mt-3">
              <span class="text-xl sm:text-2xl font-black font-mono text-amber-600 dark:text-amber-300">
                ${{ statsCircuito.bolsaTotal.toLocaleString('es-CO') }} COP
              </span>
            </div>
            <p class="text-[11px] text-amber-700/80 dark:text-amber-400/80 mt-1 font-bold">
              👑 100% garantizado para el Campeón
            </p>
          </div>

          <!-- KPI 3: Capacidad y Convocatoria -->
          <div class="relative p-4 sm:p-4.5 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-xs flex flex-col justify-between overflow-hidden group hover:border-sky-500/40 transition-all">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Aspirantes & Cupos
              </span>
              <div class="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20">
                <Users class="w-4 h-4" />
              </div>
            </div>
            <div class="mt-3 flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                {{ statsCircuito.cuposTomados }}
              </span>
              <span class="text-xs text-slate-400">/ {{ statsCircuito.cuposTotales }} cupos</span>
            </div>
            <!-- Barra de Ocupación Visual -->
            <div class="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
              <div
                class="bg-gradient-to-r from-sky-500 to-indigo-500 h-1.5 rounded-full transition-all duration-500"
                :style="{ width: `${statsCircuito.cuposTotales > 0 ? Math.min(100, Math.round((statsCircuito.cuposTomados / statsCircuito.cuposTotales) * 100)) : 0}%` }"
              />
            </div>
          </div>

          <!-- KPI 4: Torneos Totales -->
          <div class="relative p-4 sm:p-4.5 rounded-2xl bg-white/80 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md shadow-xs flex flex-col justify-between overflow-hidden group hover:border-orange-500/40 transition-all">
            <div class="flex items-center justify-between gap-2">
              <span class="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Circuitos Registrados
              </span>
              <div class="w-8 h-8 rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20">
                <Trophy class="w-4 h-4" />
              </div>
            </div>
            <div class="mt-3 flex items-baseline gap-2">
              <span class="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
                {{ statsCircuito.total }}
              </span>
              <span class="text-xs text-slate-400">creados</span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
              {{ statsCircuito.porIniciar }} por iniciar • {{ statsCircuito.finalizados }} finalizados
            </p>
          </div>
        </div>
      </div>
    </section>

    <!-- Contenido Principal: Torneos y Filtros -->
    <main class="flex-1 max-w-7xl 2xl:max-w-[1720px] w-full mx-auto px-4 sm:px-6 2xl:px-8 py-8 flex flex-col gap-6">
      <section class="space-y-6">
        <!-- Barra de Búsqueda y Filtros de Torneo con Efecto Glassmorphic -->
        <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors">
          <div class="relative flex-1">
            <Search class="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              v-model="busquedaTorneo"
              type="text"
              placeholder="Buscar por nombre de torneo, sede, organizador o categoría..."
              class="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/80 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 placeholder:text-slate-400 transition-colors"
            />
          </div>

          <!-- Filtros de Estado con Contador Dinámico -->
          <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 sm:pb-0 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-2xl text-xs font-bold shrink-0">
            <button
              type="button"
              :class="[
                'px-3 sm:px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                filtroEstado === 'todos'
                  ? 'bg-white dark:bg-[#070b16] shadow-xs text-slate-900 dark:text-white font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              ]"
              @click="filtroEstado = 'todos'"
            >
              <span>Todos</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {{ torneos.length }}
              </span>
            </button>

            <button
              type="button"
              :class="[
                'px-3 sm:px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                filtroEstado === 'en curso'
                  ? 'bg-white dark:bg-[#070b16] shadow-xs text-emerald-600 dark:text-emerald-400 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-emerald-500'
              ]"
              @click="filtroEstado = 'en curso'"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>En Curso</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                {{ statsCircuito.enCurso }}
              </span>
            </button>

            <button
              type="button"
              :class="[
                'px-3 sm:px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                filtroEstado === 'por iniciar'
                  ? 'bg-white dark:bg-[#070b16] shadow-xs text-sky-600 dark:text-sky-400 font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-sky-500'
              ]"
              @click="filtroEstado = 'por iniciar'"
            >
              <span>Por Iniciar</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                {{ statsCircuito.porIniciar }}
              </span>
            </button>

            <button
              type="button"
              :class="[
                'px-3 sm:px-3.5 py-2 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
                filtroEstado === 'finalizado'
                  ? 'bg-white dark:bg-[#070b16] shadow-xs text-slate-900 dark:text-white font-black'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              ]"
              @click="filtroEstado = 'finalizado'"
            >
              <span>Finalizados</span>
              <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300">
                {{ statsCircuito.finalizados }}
              </span>
            </button>
          </div>
        </div>

        <!-- ============================================== -->
        <!-- GRID DE TARJETAS DE TORNEO (ESTILO ESPORTS)   -->
        <!-- ============================================== -->
        <div v-if="torneosFiltrados.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-5 sm:gap-6">
          <div
            v-for="torneo in torneosFiltrados"
            :key="torneo.id"
            class="group relative bg-white dark:bg-[#0f172a] rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs hover:shadow-xl hover:border-orange-500/40 dark:hover:border-orange-500/40 transition-all duration-300 flex flex-col justify-between overflow-hidden hover:-translate-y-1"
          >
            <!-- Banda de Acento Superior con Estado Dinámico -->
            <div
              class="h-1.5 w-full"
              :class="[
                torneo.estado === 'en curso' ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-600' :
                torneo.estado === 'por iniciar' ? 'bg-gradient-to-r from-sky-500 via-blue-400 to-indigo-500' :
                'bg-gradient-to-r from-slate-400 to-slate-600'
              ]"
            />

            <!-- Contenido Superior de la Tarjeta -->
            <div class="p-5 sm:p-6 flex flex-col gap-4">
              <!-- Fila 1: Badges y Selector Rápido de Estado -->
              <div class="flex items-center justify-between gap-2">
                <span class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-md bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20">
                  <Flame class="w-3 h-3" />
                  <span>Torneo Oficial</span>
                </span>

                <select
                  :value="torneo.estado"
                  class="text-[11px] font-bold px-2.5 py-1 rounded-xl border focus:outline-none cursor-pointer shrink-0 transition-colors"
                  :class="[
                    torneo.estado === 'en curso' ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-700' :
                    torneo.estado === 'por iniciar' ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-300 dark:border-sky-700' :
                    'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  ]"
                  @change="cambiarEstadoTorneo(torneo.id, ($event.target as HTMLSelectElement).value as any)"
                >
                  <option value="por iniciar">⏳ Por Iniciar</option>
                  <option value="en curso">🟢 En Curso</option>
                  <option value="finalizado">🏁 Finalizado</option>
                </select>
              </div>

              <!-- Fila 2: Nombre del Torneo -->
              <div>
                <h3 class="text-lg font-black font-heading text-slate-900 dark:text-white tracking-tight leading-snug group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors line-clamp-2">
                  {{ torneo.nombre }}
                </h3>
              </div>

              <!-- Fila 3: Categoría, Modalidad y Sede en Chips -->
              <div class="flex flex-wrap items-center gap-1.5">
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                  {{ torneo.categoria || 'Categoría Abierta' }}
                </span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700">
                  {{ torneo.modalidad || 'Individual' }}
                </span>
                <span class="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-50 dark:bg-orange-950/40 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 flex items-center gap-1">
                  <MapPin class="w-2.5 h-2.5" />
                  <span>{{ torneo.sede || 'Campuslands' }}</span>
                </span>
              </div>

              <!-- Fila 4: Caja de Bolsa Acumulada 100% -->
              <div class="p-3 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent border border-amber-300/80 dark:border-amber-700/60 flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-xs shadow-2xs">
                    👑
                  </div>
                  <div>
                    <span class="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300 block leading-tight">
                      Bolsa 100% Campeón
                    </span>
                    <span class="text-xs font-black font-mono text-amber-950 dark:text-amber-100">
                      ${{ calcularBolsaTorneo(torneo).toLocaleString('es-CO') }} COP
                    </span>
                  </div>
                </div>
                <span class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                  ${{ (torneo.costoInscripcion || 6000).toLocaleString('es-CO') }} c/u
                </span>
              </div>

              <!-- Fila 5: Organizador y Fecha -->
              <div class="pt-2 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 gap-2 text-xs text-slate-500 dark:text-slate-400">
                <div class="flex items-center gap-1.5 truncate">
                  <User class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span class="truncate font-medium">{{ torneo.organizador || 'Comité SpinApp' }}</span>
                </div>
                <div class="flex items-center gap-1.5 truncate">
                  <Calendar class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span class="truncate font-medium">{{ torneo.fechaInicio }}</span>
                </div>
              </div>
            </div>

            <!-- Footer con Acciones de Gestión y Eliminación -->
            <div class="px-5 py-3.5 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800/90 flex items-center justify-between gap-2">
              <button
                type="button"
                class="p-2 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition-colors cursor-pointer"
                title="Eliminar este torneo"
                @click="eliminarTorneo(torneo.id)"
              >
                <Trash2 class="w-4 h-4" />
              </button>

              <button
                type="button"
                class="group/btn flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-black tracking-wide shadow-xs hover:shadow-md hover:shadow-orange-500/20 transition-all cursor-pointer"
                @click="abrirDetalleTorneo(torneo)"
              >
                <Swords class="w-3.5 h-3.5 text-orange-200" />
                <span>Gestionar Torneo</span>
                <ArrowRight class="w-3.5 h-3.5 text-orange-200 group-hover/btn:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>

        <!-- Empty State Deportivo cuando no hay coincidencias -->
        <div
          v-else
          class="flex flex-col items-center justify-center py-20 px-6 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/60 dark:bg-[#0f172a]/60 backdrop-blur-md space-y-4"
        >
          <div class="w-16 h-16 rounded-3xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20 shadow-xs">
            <Trophy class="w-8 h-8" />
          </div>
          <div class="max-w-md space-y-1">
            <h3 class="text-base sm:text-lg font-black font-heading text-slate-900 dark:text-white">
              No se encontraron torneos
            </h3>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              No hay competencias activas que coincidan con "{{ busquedaTorneo }}" en el filtro seleccionado.
            </p>
          </div>
          <div class="flex items-center gap-3 pt-2">
            <button
              v-if="busquedaTorneo || filtroEstado !== 'todos'"
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              @click="busquedaTorneo = ''; filtroEstado = 'todos'"
            >
              Limpiar Filtros
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-xl text-xs font-black text-white bg-orange-600 hover:bg-orange-700 transition-colors cursor-pointer shadow-xs"
              @click="abrirModalCrearTorneo"
            >
              + Crear Torneo
            </button>
          </div>
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
  Activity,
  Crown,
  Users,
  Flame,
  Swords,
  ArrowRight,
  MapPin,
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
  actualizarPartidoDB,
  obtenerInscripcionesDB,
  obtenerPartidosDB,
  calcularTablaDesdePartidos,
  guardarTablaPosicionesDB,
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

// Estadísticas del circuito en tiempo real para las tarjetas KPI
const statsCircuito = computed(() => {
  const total = torneos.value.length
  const enCurso = torneos.value.filter(t => t.estado === 'en curso').length
  const porIniciar = torneos.value.filter(t => t.estado === 'por iniciar').length
  const finalizados = torneos.value.filter(t => t.estado === 'finalizado').length

  const bolsaTotal = torneos.value.reduce((acc, t) => {
    const cupos = t.cuposTomados || (t.estado === 'en curso' ? 6 : (t.cuposTotales ? Math.floor(t.cuposTotales * 0.4) : 4))
    return acc + (cupos * (t.costoInscripcion || 6000))
  }, 0)

  const cuposTotales = torneos.value.reduce((acc, t) => acc + (t.cuposTotales || 16), 0)
  const cuposTomados = torneos.value.reduce((acc, t) => acc + (t.cuposTomados || (t.estado === 'en curso' ? 6 : 0)), 0)

  return {
    total,
    enCurso,
    porIniciar,
    finalizados,
    bolsaTotal,
    cuposTotales,
    cuposTomados,
  }
})

const calcularBolsaTorneo = (torneo: Torneo): number => {
  const cupos = torneo.cuposTomados || (torneo.estado === 'en curso' ? 6 : 0)
  return cupos * (torneo.costoInscripcion || 6000)
}

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

const handleResolverPartido = async (payload: any) => {
  partidosConflicto.value = partidosConflicto.value.filter(p => p.id !== payload.partidoId)
  try {
    await actualizarPartidoDB(payload.partidoId, {
      estado: 'jugado',
      jugadorGanadorId: payload.ganadorId,
      marcador: payload.marcador,
      observaciones: payload.observaciones,
      diasRestantes: 0,
    })
    if (torneoSeleccionado.value?.id) {
      const inscritos = await obtenerInscripcionesDB(torneoSeleccionado.value.id)
      const partidos = await obtenerPartidosDB(torneoSeleccionado.value.id)
      const tabla = calcularTablaDesdePartidos(
        inscritos.filter((j: any) => j.pagoValidado),
        partidos,
        torneoSeleccionado.value.clasificadosPlayoffs || 4,
      )
      await guardarTablaPosicionesDB(torneoSeleccionado.value.id, tabla)
    }
  } catch (err) {
    console.warn('Error al actualizar resolución de partido y tabla en base de datos:', err)
  }
}
</script>

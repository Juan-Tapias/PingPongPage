<template>
  <div class="min-h-screen w-full bg-slate-50 dark:bg-[#080d1a] text-slate-800 dark:text-slate-100 flex flex-col font-sans transition-colors duration-300">
    <!-- Barra Superior / Navbar del Admin -->
    <Navbar />

    <!-- Sub-barra Administrativa con Hero del Perfil Admin -->
    <header class="w-full bg-white dark:bg-[#0f172a] border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-300">
      <div class="max-w-7xl 2xl:max-w-[1720px] mx-auto px-4 sm:px-6 2xl:px-8 py-5 sm:py-7 flex flex-col lg:flex-row lg:items-center justify-between gap-5 sm:gap-6">
        <!-- Información del Perfil Administrador -->
        <div class="flex items-center gap-3.5 sm:gap-4">
          <div class="relative shrink-0">
            <div class="w-13 h-13 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-orange-600 via-orange-500 to-amber-400 text-white flex items-center justify-center font-extrabold text-xl sm:text-2xl shadow-md border-2 border-white dark:border-slate-800">
              {{ adminInitials }}
            </div>
            <div class="absolute -bottom-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center shadow-xs border-2 border-white dark:border-slate-800" title="Rol Administrador">
              <ShieldCheck class="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-900" />
            </div>
          </div>

          <div class="space-y-1 min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h1 class="text-lg sm:text-2xl 2xl:text-3xl font-black font-heading text-slate-900 dark:text-white tracking-tight truncate">
                {{ authStore.usuario?.nombre || 'Administrador' }} {{ authStore.usuario?.apellido || 'General' }}
              </h1>
              <span class="inline-flex items-center gap-1 text-[10px] sm:text-xs font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 shrink-0">
                <Shield class="w-3 h-3 text-orange-500" />
                ADMIN PANEL
              </span>
            </div>
            <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span class="truncate max-w-[200px] sm:max-w-none">{{ authStore.usuario?.email || 'admin@campuslands.com' }}</span>
              <span class="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-600 hidden sm:inline-block"></span>
              <span class="text-sky-600 dark:text-sky-400 font-semibold truncate">Sede Bucaramanga / Olimpia</span>
            </p>
          </div>
        </div>

        <!-- Acciones Rápidas del Admin -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap items-center gap-2.5 sm:gap-3 w-full lg:w-auto">
          <!-- Botón para alternar a vista de Jugador -->
          <RouterLink
            to="/"
            class="flex items-center justify-center gap-2 px-3.5 py-2.5 sm:py-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-all cursor-pointer"
          >
            <UserCheck class="w-4 h-4 text-slate-600 dark:text-slate-400" />
            <span>Ver como Jugador</span>
          </RouterLink>

          <!-- Botón principal Crear Torneo -->
          <button
            type="button"
            class="flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-xs sm:text-sm font-bold text-white bg-orange-600 hover:bg-orange-700 rounded-xl shadow-md shadow-orange-950/20 transition-all cursor-pointer"
            @click="abrirModalCrearTorneo"
          >
            <Plus class="w-4 h-4" />
            <span>Crear Torneo / Proyecto</span>
          </button>
        </div>
      </div>

      <!-- Tarjetas de Métricas Globales (KPIs) -->
      <div class="max-w-7xl 2xl:max-w-[1720px] mx-auto px-4 sm:px-6 2xl:px-8 pb-5 sm:pb-6">
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 2xl:gap-5">
          <!-- KPI 1: Torneos Totales -->
          <div class="p-3 sm:p-4 2xl:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2.5 sm:gap-3.5 2xl:gap-4 transition-colors">
            <div class="w-9 h-9 sm:w-10 sm:h-10 2xl:w-12 2xl:h-12 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center shrink-0">
              <Trophy class="w-4.5 h-4.5 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] sm:text-[11px] 2xl:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">Torneos</p>
              <div class="flex flex-wrap items-baseline gap-1 sm:gap-2">
                <span class="text-base sm:text-xl 2xl:text-2xl font-extrabold text-slate-900 dark:text-white">{{ torneos.length }}</span>
                <span class="text-[10px] sm:text-[11px] 2xl:text-xs text-emerald-600 dark:text-emerald-400 font-semibold truncate">{{ torneosEnCursoCount }} activos</span>
              </div>
            </div>
          </div>

          <!-- KPI 2: Total Jugadores -->
          <div class="p-3 sm:p-4 2xl:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2.5 sm:gap-3.5 2xl:gap-4 transition-colors">
            <div class="w-9 h-9 sm:w-10 sm:h-10 2xl:w-12 2xl:h-12 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center shrink-0">
              <Users class="w-4.5 h-4.5 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] sm:text-[11px] 2xl:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">Inscritos</p>
              <div class="flex flex-wrap items-baseline gap-1 sm:gap-2">
                <span class="text-base sm:text-xl 2xl:text-2xl font-extrabold text-slate-900 dark:text-white">{{ totalJugadoresInscritos }}</span>
                <span class="text-[10px] sm:text-[11px] 2xl:text-xs text-sky-600 dark:text-sky-400 font-semibold truncate">Comunidad</span>
              </div>
            </div>
          </div>

          <!-- KPI 3: Recaudación Acumulada -->
          <div class="p-3 sm:p-4 2xl:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2.5 sm:gap-3.5 2xl:gap-4 transition-colors">
            <div class="w-9 h-9 sm:w-10 sm:h-10 2xl:w-12 2xl:h-12 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <DollarSign class="w-4.5 h-4.5 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] sm:text-[11px] 2xl:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">Bolsa Total</p>
              <div class="flex items-baseline gap-1">
                <span class="text-sm sm:text-xl 2xl:text-2xl font-extrabold text-slate-900 dark:text-white truncate">${{ recaudacionTotal.toLocaleString('es-CO') }}</span>
                <span class="text-[9px] sm:text-[10px] text-slate-500 dark:text-slate-400 hidden xs:inline">COP</span>
              </div>
            </div>
          </div>

          <!-- KPI 4: Pagos por Validar -->
          <div class="p-3 sm:p-4 2xl:p-5 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/60 flex items-center gap-2.5 sm:gap-3.5 2xl:gap-4 transition-colors">
            <div :class="[
              'w-9 h-9 sm:w-10 sm:h-10 2xl:w-12 2xl:h-12 rounded-xl flex items-center justify-center shrink-0',
              solicitudesPago.length > 0 ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'
            ]">
              <Clock class="w-4.5 h-4.5 sm:w-5 sm:h-5 2xl:w-6 2xl:h-6" />
            </div>
            <div class="min-w-0 flex-1">
              <p class="text-[10px] sm:text-[11px] 2xl:text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">Por Validar</p>
              <div class="flex flex-wrap items-baseline gap-1 sm:gap-2">
                <span class="text-base sm:text-xl 2xl:text-2xl font-extrabold text-slate-900 dark:text-white">{{ solicitudesPago.length }}</span>
                <span v-if="solicitudesPago.length > 0" class="text-[10px] sm:text-[11px] 2xl:text-xs text-red-500 font-bold truncate">Revisar</span>
                <span v-else class="text-[10px] sm:text-[11px] 2xl:text-xs text-emerald-500 font-semibold truncate">Al día</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Pestañas de Gestión -->
    <main class="flex-1 max-w-7xl 2xl:max-w-[1720px] w-full mx-auto px-4 sm:px-6 2xl:px-8 py-5 sm:py-7 flex flex-col gap-6">
      <div class="border-b border-slate-200 dark:border-slate-800 pb-3 w-full">
        <div class="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-1 scrollbar-none w-full">
          <button
            type="button"
            :class="[
              'shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap',
              tabActiva === 'torneos'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            ]"
            @click="tabActiva = 'torneos'"
          >
            <Trophy class="w-4 h-4" />
            <span>Gestión de Torneos</span>
            <span class="text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 bg-white/20 text-white">
              {{ torneos.length }}
            </span>
          </button>

          <button
            type="button"
            :class="[
              'shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap',
              tabActiva === 'pagos'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            ]"
            @click="tabActiva = 'pagos'"
          >
            <Receipt class="w-4 h-4" />
            <span>Verificación de Pagos</span>
            <span v-if="solicitudesPago.length > 0" class="text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 bg-red-500 text-white">
              {{ solicitudesPago.length }}
            </span>
          </button>

          <button
            type="button"
            :class="[
              'shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap',
              tabActiva === 'mesas'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            ]"
            @click="tabActiva = 'mesas'"
          >
            <Activity class="w-4 h-4" />
            <span>Mesas & Conflictos</span>
            <span v-if="partidosConflicto.length > 0" class="text-[10px] px-1.5 py-0.2 rounded-full font-bold ml-1 bg-red-500 text-white">
              {{ partidosConflicto.length }}
            </span>
          </button>

          <button
            type="button"
            :class="[
              'shrink-0 flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer whitespace-nowrap',
              tabActiva === 'jugadores'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800'
            ]"
            @click="tabActiva = 'jugadores'"
          >
            <Users class="w-4 h-4" />
            <span>Comunidad de Jugadores</span>
          </button>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- TAB 1: GESTIÓN DE TORNEOS / PROYECTOS -->
      <!-- ============================================== -->
      <section v-if="tabActiva === 'torneos'" class="space-y-5">
        <!-- Barra de Búsqueda y Filtros de Torneo -->
        <div class="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 bg-white dark:bg-[#0f172a] p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 transition-colors">
          <div class="relative flex-1">
            <Search class="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              v-model="busquedaTorneo"
              type="text"
              placeholder="Buscar torneo por nombre, categoría o sede..."
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

              <!-- Barra de Progreso de Cupos -->
              <div class="space-y-1.5 pt-1">
                <div class="flex items-center justify-between text-xs">
                  <span class="text-slate-500 dark:text-slate-400 font-semibold">Cupos Ocupados:</span>
                  <span class="font-bold text-slate-900 dark:text-white">
                    {{ torneo.cuposTomados || 0 }} / {{ torneo.cuposTotales || 32 }}
                    <span class="text-orange-500 font-bold">({{ calcularPorcentajeCupos(torneo) }}%)</span>
                  </span>
                </div>
                <div class="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    class="h-full bg-orange-500 rounded-full transition-all duration-500 shadow-sm"
                    :style="{ width: `${calcularPorcentajeCupos(torneo)}%` }"
                  ></div>
                </div>
              </div>

              <!-- Metadatos (Fechas y Sede) -->
              <div class="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400">
                <div class="flex items-center gap-1.5 truncate">
                  <Calendar class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span class="truncate">{{ torneo.fechaInicio }}</span>
                </div>
                <div class="flex items-center gap-1.5 truncate">
                  <MapPin class="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span class="truncate">{{ torneo.sede || 'Sede Principal' }}</span>
                </div>
              </div>
            </div>

            <!-- Footer de la Tarjeta con Recaudación y Acciones -->
            <div class="px-4 sm:px-5 py-3 bg-slate-50 dark:bg-slate-900/60 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <div class="text-xs min-w-0">
                <span class="text-slate-400 dark:text-slate-500 block text-[10px] font-bold uppercase truncate">Recaudado</span>
                <span class="font-extrabold text-slate-900 dark:text-white truncate block">
                  ${{ ((torneo.cuposTomados || 0) * (torneo.costoInscripcion || 6000)).toLocaleString('es-CO') }}
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

      <!-- ============================================== -->
      <!-- TAB 2: VERIFICACIÓN DE PAGOS -->
      <!-- ============================================== -->
      <section v-if="tabActiva === 'pagos'" class="space-y-4">
        <div class="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 2xl:p-6 transition-colors">
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div>
              <h2 class="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white tracking-tight">
                Solicitudes de Inscripción y Validación de Pagos
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Revisa los comprobantes de transferencias bancarias o Nequi para aprobar los cupos oficiales.
              </p>
            </div>
            <span class="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 self-start sm:self-auto shrink-0">
              {{ solicitudesPago.length }} pendientes de revisión
            </span>
          </div>

          <div v-if="solicitudesPago.length > 0">
            <!-- Vista Móvil para Teléfonos (< 640px) -->
            <div class="block sm:hidden space-y-3">
              <div
                v-for="solicitud in solicitudesPago"
                :key="solicitud.id"
                class="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-3"
              >
                <div class="flex items-center justify-between gap-2">
                  <div class="flex items-center gap-2.5 min-w-0">
                    <div class="w-8 h-8 rounded-full bg-orange-500/10 text-orange-500 font-bold flex items-center justify-center text-xs shrink-0">
                      {{ solicitud.jugadorNombre.slice(0, 2).toUpperCase() }}
                    </div>
                    <div class="min-w-0">
                      <p class="font-bold text-xs text-slate-900 dark:text-white truncate">{{ solicitud.jugadorNombre }}</p>
                      <p class="text-[10px] text-slate-500 dark:text-slate-400 truncate">{{ solicitud.torneoNombre }}</p>
                    </div>
                  </div>
                  <span :class="[
                    'px-2 py-0.5 rounded-md font-bold text-[10px] uppercase shrink-0',
                    solicitud.tipo === 'camper' ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-500/20' : 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                  ]">
                    {{ solicitud.tipo }}
                  </span>
                </div>

                <div class="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800">
                  <div>
                    <span class="text-[10px] text-slate-400 uppercase font-semibold block">Monto</span>
                    <span class="font-extrabold text-emerald-600 dark:text-emerald-400">${{ solicitud.monto.toLocaleString('es-CO') }}</span>
                  </div>
                  <div>
                    <span class="text-[10px] text-slate-400 uppercase font-semibold block">Referencia</span>
                    <span class="font-mono text-slate-600 dark:text-slate-300 truncate block">{{ solicitud.referencia }}</span>
                  </div>
                </div>

                <div class="grid grid-cols-3 gap-1.5 pt-2">
                  <button
                    type="button"
                    class="py-1.5 px-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-semibold text-xs text-center cursor-pointer"
                    @click="abrirComprobante(solicitud)"
                  >
                    Detalle
                  </button>
                  <button
                    type="button"
                    class="py-1.5 px-2 rounded-lg bg-orange-600 text-white font-bold text-xs text-center shadow-xs cursor-pointer"
                    @click="aprobarPago(solicitud.id)"
                  >
                    Aprobar
                  </button>
                  <button
                    type="button"
                    class="py-1.5 px-2 rounded-lg bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 font-bold text-xs text-center cursor-pointer"
                    @click="rechazarPago(solicitud.id)"
                  >
                    Rechazar
                  </button>
                </div>
              </div>
            </div>

            <!-- Vista Tabla para Portátiles, 24" y 27" Widescreen (>= 640px) -->
            <div class="hidden sm:block overflow-x-auto">
              <table class="w-full text-left text-xs 2xl:text-sm">
                <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-y border-slate-200 dark:border-slate-800">
                  <tr>
                    <th class="py-3 px-3 sm:px-4 2xl:py-4">Jugador</th>
                    <th class="py-3 px-3 sm:px-4 2xl:py-4">Torneo</th>
                    <th class="py-3 px-3 sm:px-4 2xl:py-4">Tipo</th>
                    <th class="py-3 px-3 sm:px-4 2xl:py-4">Monto</th>
                    <th class="py-3 px-3 sm:px-4 2xl:py-4">Referencia</th>
                    <th class="py-3 px-3 sm:px-4 2xl:py-4">Fecha</th>
                    <th class="py-3 px-3 sm:px-4 2xl:py-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                  <tr v-for="solicitud in solicitudesPago" :key="solicitud.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                    <td class="py-3 px-3 sm:px-4 font-bold text-slate-900 dark:text-white">
                      <div class="flex items-center gap-2">
                        <div class="w-7 h-7 rounded-full bg-orange-500/10 text-orange-500 font-bold flex items-center justify-center text-[10px] shrink-0">
                          {{ solicitud.jugadorNombre.slice(0, 2).toUpperCase() }}
                        </div>
                        <span class="truncate">{{ solicitud.jugadorNombre }}</span>
                      </div>
                    </td>
                    <td class="py-3 px-3 sm:px-4 text-slate-700 dark:text-slate-300 font-medium max-w-45 truncate">
                      {{ solicitud.torneoNombre }}
                    </td>
                    <td class="py-3 px-3 sm:px-4">
                      <span :class="[
                        'px-2 py-0.5 rounded-md font-bold text-[10px] uppercase',
                        solicitud.tipo === 'camper' ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-500/20' : 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                      ]">
                        {{ solicitud.tipo }}
                      </span>
                    </td>
                    <td class="py-3 px-3 sm:px-4 font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                      ${{ solicitud.monto.toLocaleString('es-CO') }}
                    </td>
                    <td class="py-3 px-3 sm:px-4 font-mono text-slate-500 dark:text-slate-400">
                      {{ solicitud.referencia }}
                    </td>
                    <td class="py-3 px-3 sm:px-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {{ solicitud.fecha }}
                    </td>
                    <td class="py-3 px-3 sm:px-4 text-right">
                      <div class="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          class="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 font-semibold text-[11px] transition-colors cursor-pointer"
                          @click="abrirComprobante(solicitud)"
                        >
                          Detalle
                        </button>
                        <button
                          type="button"
                          class="px-2.5 py-1 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-bold text-[11px] transition-colors cursor-pointer shadow-xs"
                          @click="aprobarPago(solicitud.id)"
                        >
                          Aprobar
                        </button>
                        <button
                          type="button"
                          class="px-2 py-1 rounded-lg bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/50 text-red-600 dark:text-red-400 font-bold text-[11px] transition-colors cursor-pointer"
                          @click="rechazarPago(solicitud.id)"
                        >
                          Rechazar
                        </button>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            v-else
            class="flex flex-col items-center justify-center py-12 text-center rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700"
          >
            <CheckCircle2 class="w-8 h-8 text-emerald-500 mb-2" />
            <h3 class="text-sm font-bold text-slate-800 dark:text-slate-200">No hay pagos pendientes</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Todas las inscripciones y comprobantes han sido validados.</p>
          </div>
        </div>
      </section>

      <!-- ============================================== -->
      <!-- TAB 3: MESAS & PARTIDOS EN CONFLICTO -->
      <!-- ============================================== -->
      <section v-if="tabActiva === 'mesas'" class="space-y-6">
        <!-- Estado de Mesas Físicas -->
        <div class="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 2xl:p-6 space-y-4 transition-colors">
          <div>
            <h2 class="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white tracking-tight">
              Monitoreo en Tiempo Real de Mesas
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Disponibilidad de las mesas oficiales de competición en la sede.
            </p>
          </div>

          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-3.5 sm:gap-4 2xl:gap-5">
            <div
              v-for="mesa in mesas"
              :key="mesa.id"
              class="p-4 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col justify-between gap-3 bg-slate-50 dark:bg-slate-800/40"
            >
              <div class="flex items-center justify-between">
                <span class="text-xs font-black font-heading text-slate-900 dark:text-white">{{ mesa.nombre }}</span>
                <span :class="[
                  'text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full',
                  mesa.estado === 'en_juego' ? 'bg-orange-500/10 text-orange-500 border border-orange-500/20' :
                  mesa.estado === 'libre' ? 'bg-sky-500/10 text-sky-500 border border-sky-500/20' :
                  'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
                ]">
                  {{ mesa.estado === 'en_juego' ? 'En Juego' : mesa.estado === 'libre' ? 'Disponible' : 'Mantenimiento' }}
                </span>
              </div>

              <div class="text-xs text-slate-600 dark:text-slate-400 space-y-1">
                <p v-if="mesa.partidoActual" class="font-bold text-slate-800 dark:text-slate-200">
                  {{ mesa.partidoActual }}
                </p>
                <p v-else class="text-slate-400 dark:text-slate-500 italic">
                  Mesa lista para próximo llamado
                </p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400">
                  Árbitro: {{ mesa.arbitro || 'Sin asignar' }}
                </p>
              </div>

              <button
                type="button"
                class="w-full py-1.5 text-center text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                {{ mesa.estado === 'en_juego' ? 'Liberar Mesa' : 'Asignar Partido' }}
              </button>
            </div>
          </div>
        </div>

        <!-- Partidos en Conflicto / Pendiente Admin -->
        <div class="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 2xl:p-6 space-y-4 transition-colors">
          <div class="flex items-center justify-between">
            <div>
              <h2 class="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                <AlertTriangle class="w-4 h-4 text-amber-500 shrink-0" />
                Partidos con Alerta: Pendiente Decisión Admin (>48h)
              </h2>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Partidos no disputados a tiempo o con discrepancias en el arbitraje que requieren intervención.
              </p>
            </div>
          </div>

          <div v-if="partidosConflicto.length > 0" class="grid grid-cols-1 md:grid-cols-2 2xl:grid-cols-3 gap-4 2xl:gap-5">
            <div
              v-for="partido in partidosConflicto"
              :key="partido.id"
              class="p-4 rounded-2xl border border-amber-300 dark:border-amber-500/30 bg-amber-50/60 dark:bg-amber-950/20 flex flex-col justify-between gap-4"
            >
              <div class="flex items-center justify-between">
                <span class="text-[10px] font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/40 px-2 py-0.5 rounded-md">
                  Vencido > 48h
                </span>
                <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Ronda {{ partido.ronda }}
                </span>
              </div>

              <div class="flex items-center justify-between gap-2 text-xs">
                <div class="flex items-center gap-2 font-bold text-slate-900 dark:text-white min-w-0 flex-1">
                  <div class="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-[10px] shrink-0">
                    {{ partido.jugador1.iniciales }}
                  </div>
                  <span class="truncate">{{ partido.jugador1.nombre }}</span>
                </div>

                <span class="text-xs font-black text-slate-400 px-1 shrink-0">VS</span>

                <div class="flex items-center justify-end gap-2 font-bold text-slate-900 dark:text-white min-w-0 flex-1 text-right">
                  <span class="truncate">{{ partido.jugador2.nombre }}</span>
                  <div class="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] shrink-0">
                    {{ partido.jugador2.iniciales }}
                  </div>
                </div>
              </div>

              <div class="flex items-center justify-end gap-2 pt-2 border-t border-amber-200/60 dark:border-amber-500/20">
                <button
                  type="button"
                  class="w-full sm:w-auto px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer text-center shadow-xs"
                  @click="abrirResolverPartido(partido)"
                >
                  Dictar Veredicto / Resolver
                </button>
              </div>
            </div>
          </div>

          <div
            v-else
            class="py-8 text-center text-xs text-slate-500 dark:text-slate-400 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-dashed border-slate-200 dark:border-slate-700"
          >
            No hay partidos con conflictos o plazos vencidos en este momento.
          </div>
        </div>
      </section>

      <!-- ============================================== -->
      <!-- TAB 4: COMUNIDAD DE JUGADORES -->
      <!-- ============================================== -->
      <section v-if="tabActiva === 'jugadores'" class="bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 2xl:p-6 space-y-4 transition-colors">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 class="text-base sm:text-lg font-bold font-heading text-slate-900 dark:text-white tracking-tight">
              Directorio de Jugadores Inscritos
            </h2>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Campers y Trabajadores registrados en el ecosistema de torneos.
            </p>
          </div>
          <div class="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total: {{ jugadoresComunidad.length }} registrados
          </div>
        </div>

        <!-- Vista Móvil de Jugadores (< 640px) -->
        <div class="block sm:hidden space-y-2.5">
          <div
            v-for="jugador in jugadoresComunidad"
            :key="jugador.id"
            class="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40 space-y-2"
          >
            <div class="flex items-center justify-between gap-2">
              <div class="flex items-center gap-2.5 min-w-0">
                <div class="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center text-xs shrink-0">
                  {{ jugador.iniciales }}
                </div>
                <div class="min-w-0">
                  <p class="font-bold text-xs text-slate-900 dark:text-white truncate">{{ jugador.nombre }}</p>
                  <p class="text-[10px] text-slate-400 dark:text-slate-500 truncate">{{ jugador.email }}</p>
                </div>
              </div>
              <span :class="[
                'px-2 py-0.5 rounded-md font-bold text-[10px] uppercase shrink-0',
                jugador.tipo === 'camper' ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-500/20' : 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-500/20'
              ]">
                {{ jugador.tipo }}
              </span>
            </div>

            <div class="grid grid-cols-3 gap-2 text-xs pt-2 border-t border-slate-200/60 dark:border-slate-800 text-center">
              <div>
                <span class="text-[10px] text-slate-400 uppercase font-semibold block">Teléfono</span>
                <span class="font-mono text-slate-600 dark:text-slate-300 text-[11px] truncate block">{{ jugador.telefono }}</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 uppercase font-semibold block">Récord</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400 text-[11px] block">{{ jugador.victorias }}W - {{ jugador.derrotas }}L</span>
              </div>
              <div>
                <span class="text-[10px] text-slate-400 uppercase font-semibold block">Rol</span>
                <span class="font-bold text-slate-700 dark:text-slate-300 text-[11px] block">{{ jugador.rol }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Vista Tabla para Pantallas Grandes (>= 640px) -->
        <div class="hidden sm:block overflow-x-auto">
          <table class="w-full text-left text-xs 2xl:text-sm">
            <thead class="bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider border-y border-slate-200 dark:border-slate-800">
              <tr>
                <th class="py-3 px-3 sm:px-4 2xl:py-4">Jugador</th>
                <th class="py-3 px-3 sm:px-4 2xl:py-4">Tipo</th>
                <th class="py-3 px-3 sm:px-4 2xl:py-4">Teléfono</th>
                <th class="py-3 px-3 sm:px-4 2xl:py-4">Partidos</th>
                <th class="py-3 px-3 sm:px-4 2xl:py-4">Récord</th>
                <th class="py-3 px-3 sm:px-4 2xl:py-4">Rol en Sistema</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
              <tr v-for="jugador in jugadoresComunidad" :key="jugador.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                <td class="py-3 px-3 sm:px-4 font-bold text-slate-900 dark:text-white">
                  <div class="flex items-center gap-2">
                    <div class="w-7 h-7 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold flex items-center justify-center text-[10px] shrink-0">
                      {{ jugador.iniciales }}
                    </div>
                    <div class="min-w-0">
                      <p class="leading-tight truncate">{{ jugador.nombre }}</p>
                      <p class="text-[10px] text-slate-400 dark:text-slate-500 font-normal truncate">{{ jugador.email }}</p>
                    </div>
                  </div>
                </td>
                <td class="py-3 px-3 sm:px-4">
                  <span :class="[
                    'px-2 py-0.5 rounded-md font-bold text-[10px] uppercase',
                    jugador.tipo === 'camper' ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border border-sky-500/20' : 'bg-purple-50 dark:bg-purple-950/40 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                  ]">
                    {{ jugador.tipo }}
                  </span>
                </td>
                <td class="py-3 px-3 sm:px-4 text-slate-600 dark:text-slate-400 font-mono">
                  {{ jugador.telefono }}
                </td>
                <td class="py-3 px-3 sm:px-4 text-slate-700 dark:text-slate-300 font-bold">
                  {{ jugador.partidosJugados }}
                </td>
                <td class="py-3 px-3 sm:px-4 text-emerald-600 dark:text-emerald-400 font-bold whitespace-nowrap">
                  {{ jugador.victorias }}W - {{ jugador.derrotas }}L
                </td>
                <td class="py-3 px-3 sm:px-4">
                  <span class="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {{ jugador.rol }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
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
      @ver-comprobante="abrirComprobante"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import {
  Trophy,
  ShieldCheck,
  Shield,
  UserCheck,
  Plus,
  Users,
  DollarSign,
  Clock,
  Receipt,
  Activity,
  Search,
  Calendar,
  MapPin,
  Trash2,
  Eye,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-vue-next'
import { useAuthStore } from '@/stores/auth'
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

const authStore = useAuthStore()

const tabActiva = ref<'torneos' | 'pagos' | 'mesas' | 'jugadores'>('torneos')
const busquedaTorneo = ref('')
const filtroEstado = ref<'todos' | 'en curso' | 'por iniciar' | 'finalizado'>('todos')
const cargandoTorneos = ref(false)

const modalCrearTorneoRef = ref()
const modalResolverRef = ref()
const modalComprobanteRef = ref()
const modalGestionarRef = ref()
const torneoSeleccionado = ref<Torneo | null>(null)

const adminInitials = computed(() => {
  const n = authStore.usuario?.nombre?.[0] || 'A'
  const a = authStore.usuario?.apellido?.[0] || 'D'
  return `${n}${a}`.toUpperCase()
})

// Lista reactiva de Torneos administrados (conectada a la base de datos)
const torneos = ref<Torneo[]>([])

// Cargar torneos reales desde la base de datos al montar
onMounted(async () => {
  cargandoTorneos.value = true
  try {
    const torneosRemotos = await obtenerTorneosDB()
    torneos.value = torneosRemotos
  } catch (error) {
    console.error('Error al cargar torneos desde la base de datos:', error)
  } finally {
    cargandoTorneos.value = false
  }
})

// Solicitudes de pago reales
const solicitudesPago = ref<any[]>([])

// Mesas físicas de Campuslands (disponibles en limpio)
const mesas = ref([
  { id: 'm-1', nombre: 'Mesa 01 (Principal)', estado: 'libre', partidoActual: null, arbitro: null },
  { id: 'm-2', nombre: 'Mesa 02 (Olimpia)', estado: 'libre', partidoActual: null, arbitro: null },
  { id: 'm-3', nombre: 'Mesa 03 (Training A)', estado: 'libre', partidoActual: null, arbitro: null },
  { id: 'm-4', nombre: 'Mesa 04 (Training B)', estado: 'libre', partidoActual: null, arbitro: null },
])

// Partidos en Conflicto
const partidosConflicto = ref<any[]>([])

// Directorio de Jugadores
const jugadoresComunidad = ref<any[]>([])

// Computados para KPIs
const torneosEnCursoCount = computed(() => torneos.value.filter(t => t.estado === 'en curso').length)
const totalJugadoresInscritos = computed(() => torneos.value.reduce((acc, t) => acc + (t.cuposTomados || 0), 0))
const recaudacionTotal = computed(() => torneos.value.reduce((acc, t) => acc + ((t.cuposTomados || 0) * (t.costoInscripcion || 6000)), 0))

const torneosFiltrados = computed(() => {
  return torneos.value.filter(t => {
    const coincideBusqueda =
      t.nombre.toLowerCase().includes(busquedaTorneo.value.toLowerCase()) ||
      (t.categoria && t.categoria.toLowerCase().includes(busquedaTorneo.value.toLowerCase())) ||
      (t.sede && t.sede.toLowerCase().includes(busquedaTorneo.value.toLowerCase()))

    const coincideEstado = filtroEstado.value === 'todos' || t.estado === filtroEstado.value
    return coincideBusqueda && coincideEstado
  })
})

const calcularPorcentajeCupos = (torneo: Torneo) => {
  const tomados = torneo.cuposTomados || 0
  const totales = torneo.cuposTotales || 32
  return Math.min(100, Math.round((tomados / totales) * 100))
}

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

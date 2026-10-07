<template>
  <div class="flex flex-col gap-6">
    <!-- ======================================================== -->
    <!-- CABECERA DEL APARTADO: TÍTULO, MÉTRICAS KPI Y ACCIONES    -->
    <!-- ======================================================== -->
    <div class="flex flex-col gap-4">
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-500/15 border border-orange-500/30 text-orange-600 dark:text-orange-400 text-[11px] font-black uppercase tracking-wider mb-1.5">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <Clock class="w-3.5 h-3.5" />
            <span>Monitoreo en Tiempo Real • Partidos y Plazos</span>
          </div>
          <h2 class="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
            Control de Partidos, Vencimientos y En Espera
          </h2>
          <p class="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5 max-w-2xl">
            Supervisa los partidos vencidos (>2 días) de primero, el tiempo restante al segundo para los habilitados, y el motivo exacto de aquellos que están en espera de rondas previas.
          </p>
        </div>

        <!-- Botón de Recarga -->
        <div class="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:text-orange-500 hover:border-orange-500/40 text-xs font-bold transition-colors cursor-pointer shadow-2xs"
            title="Recargar partidos"
            :disabled="cargando"
            @click="recargarPartidos"
          >
            <RefreshCw class="w-4 h-4" :class="cargando ? 'animate-spin text-orange-500' : ''" />
            <span class="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      <!-- Cuadrícula de Métricas Clave de Plazos -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <!-- Vencidos (>2 días) -->
        <div class="p-3.5 sm:p-4 rounded-2xl bg-red-500/10 dark:bg-red-950/30 border border-red-500/30 dark:border-red-800/60 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between gap-1.5">
            <span class="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-red-700 dark:text-red-400">
              Vencidos (>2 días)
            </span>
            <AlertTriangle class="w-4 h-4 text-red-600 dark:text-red-400 shrink-0" />
          </div>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="text-2xl sm:text-3xl font-black font-mono text-red-600 dark:text-red-400">
              {{ metricas.totalVencidos }}
            </span>
            <span class="text-[10px] sm:text-xs font-bold text-red-600 dark:text-red-400">requieren W.O.</span>
          </div>
        </div>

        <!-- En Plazo Crítico (<12h) -->
        <div class="p-3.5 sm:p-4 rounded-2xl bg-amber-500/10 dark:bg-amber-950/30 border border-amber-500/30 dark:border-amber-800/60 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between gap-1.5">
            <span class="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Por Vencer (&lt;12h)
            </span>
            <Hourglass class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
          </div>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400">
              {{ metricas.totalPorVencerCritico }}
            </span>
            <span class="text-[10px] sm:text-xs font-bold text-amber-600 dark:text-amber-400">en riesgo</span>
          </div>
        </div>

        <!-- En Plazo Activo -->
        <div class="p-3.5 sm:p-4 rounded-2xl bg-sky-500/10 dark:bg-sky-950/30 border border-sky-500/30 dark:border-sky-800/60 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between gap-1.5">
            <span class="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-sky-700 dark:text-sky-400">
              En Plazo Normal
            </span>
            <Clock class="w-4 h-4 text-sky-600 dark:text-sky-400 shrink-0" />
          </div>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="text-2xl sm:text-3xl font-black font-mono text-sky-600 dark:text-sky-400">
              {{ metricas.totalEnPlazo }}
            </span>
            <span class="text-[10px] sm:text-xs font-bold text-sky-600 dark:text-sky-400">en tiempo</span>
          </div>
        </div>

        <!-- Partidos Actuales en Disputa -->
        <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 shadow-xs flex flex-col justify-between">
          <div class="flex items-center justify-between gap-1.5">
            <span class="text-[10px] sm:text-[11px] font-black uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Partidos Actuales
            </span>
            <Swords class="w-4 h-4 text-orange-500 shrink-0" />
          </div>
          <div class="mt-2 flex items-baseline gap-1.5">
            <span class="text-2xl sm:text-3xl font-black font-mono text-slate-900 dark:text-white">
              {{ metricas.totalActuales }}
            </span>
            <span class="text-[10px] sm:text-xs font-bold text-slate-500 dark:text-slate-400">en disputa</span>
          </div>
        </div>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- BARRA DE FILTROS, SELECTOR DE TORNEO Y BÚSQUEDA          -->
    <!-- ======================================================== -->
    <div class="bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md p-3.5 sm:p-4 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
      <!-- Selector de Torneo y Buscador -->
      <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 flex-1">
        <!-- Selector de Torneo -->
        <div class="relative min-w-[200px] sm:max-w-xs">
          <Trophy class="w-4 h-4 text-orange-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <select
            v-model="torneoSeleccionado"
            class="w-full appearance-none pl-9 pr-8 py-2 text-xs font-bold rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 cursor-pointer shadow-2xs"
          >
            <option value="todos">Todos los Torneos ({{ torneos.length }})</option>
            <option
              v-for="torneo in torneos"
              :key="torneo.id"
              :value="torneo.id"
            >
              {{ torneo.nombre }}
            </option>
          </select>
          <ChevronDown class="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        <!-- Buscador por Jugador -->
        <div class="relative flex-1">
          <Search class="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            v-model="busquedaTexto"
            type="text"
            placeholder="Buscar por jugador (ej: Kevin, Daniel), iniciales o torneo..."
            class="w-full pl-9 pr-8 py-2 text-xs rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 transition-colors shadow-2xs"
          />
          <button
            v-if="busquedaTexto"
            type="button"
            class="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-0.5"
            @click="busquedaTexto = ''"
          >
            <X class="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <!-- Filtro Rápido por Estado -->
      <div class="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5 sm:pb-0 p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl text-xs font-bold shrink-0">
        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
            filtroEstado === 'todos'
              ? 'bg-white dark:bg-[#070b16] text-slate-900 dark:text-white shadow-xs font-black'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          ]"
          @click="filtroEstado = 'todos'"
        >
          <span>Todos los Actuales</span>
          <span class="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700">
            {{ partidosFiltradosYOrdenados.length }}
          </span>
        </button>

        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
            filtroEstado === 'vencidos'
              ? 'bg-red-500 text-white shadow-xs font-black'
              : 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40'
          ]"
          @click="filtroEstado = 'vencidos'"
        >
          <AlertTriangle class="w-3 h-3" />
          <span>Vencidos (&gt;2d)</span>
          <span
            :class="[
              'text-[10px] px-1.5 py-0.5 rounded-full',
              filtroEstado === 'vencidos' ? 'bg-red-700 text-white' : 'bg-red-100 dark:bg-red-900/60 text-red-700 dark:text-red-300'
            ]"
          >
            {{ metricas.totalVencidos }}
          </span>
        </button>

        <button
          type="button"
          :class="[
            'px-3 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5',
            filtroEstado === 'pendientes'
              ? 'bg-sky-600 text-white shadow-xs font-black'
              : 'text-sky-600 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-950/40'
          ]"
          @click="filtroEstado = 'pendientes'"
        >
          <Clock class="w-3 h-3" />
          <span>En Plazo</span>
          <span
            :class="[
              'text-[10px] px-1.5 py-0.5 rounded-full',
              filtroEstado === 'pendientes' ? 'bg-sky-800 text-white' : 'bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300'
            ]"
          >
            {{ metricas.totalEnPlazo }}
          </span>
        </button>
      </div>
    </div>

    <!-- ======================================================== -->
    <!-- ESTADO VACÍO CUANDO NO HAY COINCIDENCIAS                 -->
    <!-- ======================================================== -->
    <div
      v-if="partidosFiltradosYOrdenados.length === 0"
      class="flex flex-col items-center justify-center py-16 px-6 text-center rounded-3xl border border-dashed border-slate-300 dark:border-slate-800 bg-white/50 dark:bg-[#0f172a]/50 backdrop-blur-md space-y-3"
    >
      <div class="w-14 h-14 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20">
        <Clock class="w-7 h-7" />
      </div>
      <h3 class="text-base font-bold text-slate-900 dark:text-white">
        No hay partidos con los criterios seleccionados
      </h3>
      <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
        No se encontraron partidos para el filtro actual. Prueba seleccionando "Todos" o limpiando el buscador.
      </p>
      <button
        type="button"
        class="mt-2 px-4 py-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer"
        @click="limpiarFiltros"
      >
        Restablecer Filtros
      </button>
    </div>

    <template v-else>
      <!-- ======================================================== -->
      <!-- TABLA GENERAL DE PARTIDOS Y VENCIMIENTOS (RESPONSIVE)     -->
      <!-- ======================================================== -->
      <div
        class="overflow-hidden rounded-3xl border border-slate-200/90 dark:border-slate-800/90 bg-white dark:bg-[#0c1222] shadow-sm backdrop-blur-md transition-colors"
      >
        <div class="overflow-x-auto scrollbar-thin">
          <table class="w-full text-left text-xs border-collapse">
            <thead>
              <tr class="bg-slate-50/90 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th class="py-3.5 px-4">Prioridad & Estado</th>
                <th class="py-3.5 px-4">Torneo & Ronda</th>
                <th class="py-3.5 px-4">Enfrentamiento (J1 vs J2)</th>
                <th class="py-3.5 px-4 min-w-[240px]">Plazo & Tiempo Exacto (En Vivo)</th>
                <th class="py-3.5 px-4 hidden lg:table-cell">Límite Oficial</th>
                <th class="py-3.5 px-4 text-right">Acción</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-800/70">
              <tr
                v-for="partido in partidosFiltradosYOrdenados"
                :key="partido.id"
                :class="[
                  'group transition-colors',
                  partido.esVencido
                    ? 'bg-red-500/5 dark:bg-red-950/20 hover:bg-red-500/10 dark:hover:bg-red-950/30'
                    : partido.enEspera
                      ? 'bg-amber-500/5 dark:bg-amber-950/20 hover:bg-amber-500/10 dark:hover:bg-amber-950/30'
                      : partido.estado === 'en_curso'
                        ? 'bg-sky-500/5 dark:bg-sky-950/20 hover:bg-sky-500/10 dark:hover:bg-sky-950/30'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-900/60'
                ]"
              >
                <!-- Columna 1: Prioridad & Estado -->
                <td class="py-3.5 px-4 align-middle">
                  <div class="flex items-center gap-2">
                    <!-- Badge Vencido (>2 días) -->
                    <span
                      v-if="partido.esVencido"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-red-500/15 border border-red-500/35 text-red-700 dark:text-red-400 font-black text-[11px] uppercase tracking-wider animate-pulse shadow-xs"
                      title="Plazo reglamentario de 48 horas superado. Requiere resolución por W.O. o dictamen arbitral."
                    >
                      <AlertTriangle class="w-3.5 h-3.5 text-red-600 dark:text-red-400 shrink-0" />
                      <span>VENCIDO &gt;2D</span>
                    </span>

                    <!-- Badge En Espera de Ronda Previa -->
                    <span
                      v-else-if="partido.enEspera"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-700 dark:text-amber-300 font-black text-[11px] uppercase tracking-wider"
                      :title="partido.motivoEspera"
                    >
                      <PauseCircle class="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                      <span>EN ESPERA</span>
                    </span>

                    <!-- Badge En Vivo -->
                    <span
                      v-else-if="partido.estado === 'en_curso'"
                      class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-sky-500/15 border border-sky-500/35 text-sky-700 dark:text-sky-300 font-black text-[11px] uppercase tracking-wider"
                    >
                      <span class="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                      <span>EN JUEGO</span>
                    </span>

                    <!-- Badge En Plazo (Jugable) -->
                    <span
                      v-else
                      :class="[
                        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl font-bold text-[11px]',
                        partido.horasRestantesCalculadas <= 12
                          ? 'bg-amber-500/15 border border-amber-500/35 text-amber-700 dark:text-amber-300'
                          : 'bg-emerald-500/15 border border-emerald-500/35 text-emerald-700 dark:text-emerald-300'
                      ]"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" :class="partido.horasRestantesCalculadas <= 12 ? 'bg-amber-500 animate-ping' : 'bg-emerald-500 animate-pulse'" />
                      <span>{{ partido.horasRestantesCalculadas <= 12 ? 'POR VENCER' : 'JUGABLE' }}</span>
                    </span>
                  </div>
                </td>

                <!-- Columna 2: Torneo & Ronda -->
                <td class="py-3.5 px-4 align-middle">
                  <div class="flex flex-col">
                    <span class="font-extrabold text-slate-900 dark:text-white line-clamp-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {{ partido.torneoNombre }}
                    </span>
                    <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Ronda {{ partido.ronda || 1 }} • Partido #{{ partido.numeroPartido || '—' }}
                    </span>
                  </div>
                </td>

                <!-- Columna 3: Enfrentamiento (Jugador 1 vs Jugador 2) -->
                <td class="py-3.5 px-4 align-middle">
                  <div class="flex flex-col gap-1">
                    <div class="flex items-center gap-2">
                      <!-- Jugador 1 -->
                      <div class="flex items-center gap-1.5 min-w-0 max-w-[140px] sm:max-w-[170px]">
                        <span class="w-6 h-6 rounded-lg bg-orange-500/15 text-orange-600 dark:text-orange-400 font-black text-[10px] flex items-center justify-center shrink-0 border border-orange-500/30">
                          {{ partido.jugador1?.iniciales || 'J1' }}
                        </span>
                        <span class="truncate font-bold text-slate-900 dark:text-white" :title="partido.jugador1?.nombre">
                          {{ partido.jugador1?.nombre || 'Jugador 1' }}
                        </span>
                      </div>

                      <!-- VS o Marcador -->
                      <span
                        v-if="partido.marcador"
                        class="px-2 py-0.5 rounded-md font-mono text-[11px] font-black bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25 shrink-0"
                      >
                        {{ partido.marcador }}
                      </span>
                      <span
                        v-else
                        class="text-[10px] font-mono font-black text-slate-400 dark:text-slate-500 shrink-0 px-1"
                      >
                        VS
                      </span>

                      <!-- Jugador 2 -->
                      <div class="flex items-center gap-1.5 min-w-0 max-w-[140px] sm:max-w-[170px]">
                        <span class="w-6 h-6 rounded-lg bg-sky-500/15 text-sky-600 dark:text-sky-400 font-black text-[10px] flex items-center justify-center shrink-0 border border-sky-500/30">
                          {{ partido.jugador2?.iniciales || 'J2' }}
                        </span>
                        <span class="truncate font-bold text-slate-900 dark:text-white" :title="partido.jugador2?.nombre">
                          {{ partido.jugador2?.nombre || 'Jugador 2' }}
                        </span>
                      </div>
                    </div>

                    <!-- Nota explicativa si está en espera -->
                    <span v-if="partido.enEspera" class="text-[10px] font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <AlertCircle class="w-3 h-3 shrink-0" />
                      <span class="truncate">{{ partido.motivoEspera }}</span>
                    </span>
                  </div>
                </td>

                <!-- Columna 4: Plazo & Tiempo Exacto (Reloj Dinámico al Segundo) -->
                <td class="py-3.5 px-4 align-middle">
                  <div class="flex flex-col gap-1">
                    <!-- Si ya está vencido (>2 días) -->
                    <div v-if="partido.esVencido" class="flex flex-col">
                      <div class="flex items-center gap-1 font-mono text-xs font-black text-red-600 dark:text-red-400">
                        <span class="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping inline-block mr-1" />
                        <span>{{ partido.tiempoTranscurridoVencido }}</span>
                      </div>
                      <span class="text-[10px] text-red-700/80 dark:text-red-400/80 font-semibold">
                        ⚠️ +48h hábiles expiradas
                      </span>
                    </div>

                    <!-- Si está en espera de ronda previa -->
                    <div v-else-if="partido.enEspera" class="flex flex-col">
                      <div class="flex items-center gap-1 text-xs font-bold text-amber-700 dark:text-amber-300">
                        <PauseCircle class="w-3.5 h-3.5 shrink-0 text-amber-500" />
                        <span>Plazo de 48h en pausa</span>
                      </div>
                      <span class="text-[10px] text-slate-500 dark:text-slate-400">
                        Iniciará al resolverse la ronda anterior
                      </span>
                    </div>

                    <!-- Si está en plazo (cuenta regresiva exacta en vivo) -->
                    <div v-else class="flex flex-col">
                      <div class="flex items-center gap-1 font-mono text-xs font-black" :class="partido.horasRestantesCalculadas <= 12 ? 'text-amber-600 dark:text-amber-400' : 'text-sky-600 dark:text-sky-400'">
                        <span class="w-1.5 h-1.5 rounded-full inline-block mr-1" :class="partido.horasRestantesCalculadas <= 12 ? 'bg-amber-500 animate-ping' : 'bg-sky-500 animate-pulse'" />
                        <span>{{ partido.tiempoRestanteExacto }}</span>
                      </div>

                      <!-- Barra de consumo de las 48 horas -->
                      <div class="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          class="h-full rounded-full transition-all duration-300"
                          :class="[
                            partido.porcentajeTiempoConsumido >= 80 ? 'bg-red-500' :
                            partido.porcentajeTiempoConsumido >= 50 ? 'bg-amber-500' :
                            'bg-sky-500'
                          ]"
                          :style="{ width: `${Math.min(100, Math.max(5, partido.porcentajeTiempoConsumido))}%` }"
                        />
                      </div>
                    </div>
                  </div>
                </td>

                <!-- Columna 5: Límite Oficial -->
                <td class="py-3.5 px-4 align-middle hidden lg:table-cell text-slate-600 dark:text-slate-300 font-mono text-[11px]">
                  <span v-if="partido.enEspera" class="text-amber-600 dark:text-amber-400 font-sans italic text-[10px]">
                    Pendiente habilitar
                  </span>
                  <div v-else class="flex flex-col">
                    <span class="font-bold text-slate-900 dark:text-white">{{ formatearFechaLegible(partido.fechaLimite) }}</span>
                    <span v-if="partido.fechaHabilitacion" class="text-[10px] text-slate-400 dark:text-slate-500 font-sans">
                      Hab: {{ formatearFechaLegible(partido.fechaHabilitacion) }}
                    </span>
                  </div>
                </td>

                <!-- Columna 6: Acciones -->
                <td class="py-3.5 px-4 align-middle text-right">
                  <div class="flex items-center justify-end gap-1.5">
                    <!-- Botón Resolver Partido / W.O. -->
                    <button
                      type="button"
                      :class="[
                        'inline-flex items-center gap-1 px-3 py-1.5 rounded-xl font-black text-xs transition-all cursor-pointer shadow-xs',
                        partido.esVencido
                          ? 'bg-red-600 hover:bg-red-700 text-white shadow-red-600/30'
                          : partido.enEspera
                            ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
                            : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                      ]"
                      :title="partido.enEspera ? 'Dictaminar o desbloquear partido administrativamente' : 'Resolver partido por W.O. o resultado oficial'"
                      @click="$emit('resolver-partido', partido)"
                    >
                      <Gavel class="w-3.5 h-3.5 shrink-0" />
                      <span>{{ partido.esVencido ? 'Resolver W.O.' : (partido.enEspera ? 'Resolver' : 'Resolver') }}</span>
                    </button>

                    <!-- Botón Ver Torneo -->
                    <button
                      type="button"
                      class="p-1.5 rounded-xl text-slate-400 hover:text-orange-500 hover:bg-orange-500/10 border border-transparent hover:border-orange-500/20 transition-all cursor-pointer"
                      title="Abrir Centro de Mando de este Torneo"
                      @click="handleVerTorneo(partido.torneoId)"
                    >
                      <ExternalLink class="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted } from 'vue'
import {
  Clock,
  AlertTriangle,
  Hourglass,
  Trophy,
  Search,
  X,
  ChevronDown,
  RefreshCw,
  Gavel,
  ExternalLink,
  PauseCircle,
  AlertCircle,
  Swords,
} from 'lucide-vue-next'
import type { Torneo } from '@/types'
import {
  obtenerTodosLosPartidosDB,
  suscribirTodosLosPartidosDB,
} from '@/services/torneoDatabaseService'
import {
  sonMismoJugador,
  calcularFechaLimiteHabiles,
  calcularTiempoRestanteHabil,
  estanJugadoresLibresParaPartido,
} from '@/services/torneoAlgoritmos'

const props = defineProps<{
  torneos: Torneo[]
  torneoSeleccionadoId?: string
}>()

const emit = defineEmits<{
  (e: 'resolver-partido', partido: any): void
  (e: 'ver-torneo', torneo: Torneo): void
  (e: 'update:conteo-vencidos', conteo: number): void
}>()

// Estado interno
const cargando = ref(false)
const partidosCrudos = ref<any[]>([])
const torneoSeleccionado = ref<string>(props.torneoSeleccionadoId || 'todos')
const filtroEstado = ref<'todos' | 'vencidos' | 'pendientes'>('todos')
const busquedaTexto = ref('')
const ahoraTimestamp = ref<number>(Date.now())

let timerInterval: ReturnType<typeof setInterval> | null = null
let unsubscribeListener: (() => void) | null = null

const parseTimestampMs = (val: any): number => {
  if (!val) return 0
  if (typeof val === 'number') return val
  if (typeof val.toMillis === 'function') return val.toMillis()
  if (typeof val.seconds === 'number') return val.seconds * 1000
  if (typeof val.toDate === 'function') return val.toDate().getTime()
  if (typeof val === 'string') {
    const parsed = new Date(val).getTime()
    return isNaN(parsed) ? 0 : parsed
  }
  return 0
}

/**
 * Obtiene la marca de tiempo de culminación de un partido jugado para deducir cuándo se habilitó la siguiente ronda
 */
const obtenerTimestampFinPartido = (m: any): number => {
  if (!m) return 0
  const fin = parseTimestampMs(m.fechaFinTransmision)
  if (fin > 0) return fin
  const envivo = parseTimestampMs(m.marcadorEnVivo?.actualizadoEn)
  if (envivo > 0) return envivo
  const act = parseTimestampMs(m.actualizadoEn)
  if (act > 0) return act
  const crea = parseTimestampMs(m.fechaCreacion)
  if (crea > 0) return crea
  return 0
}

/**
 * Resuelve las fechas base del partido de forma determinista para garantizar
 * que la cuenta regresiva disminuya exactamente 1 segundo cada 1000ms y respete el tiempo transcurrido real
 * (deducido del momento exacto en que ambos jugadores completaron su ronda previa).
 */
const resolverFechasFijasPartido = (p: any, todos: any[], ahoraInicial: number) => {
  const rawLimite = parseTimestampMs(p.fechaLimite)
  const rawHab = parseTimestampMs(p.fechaHabilitacion)
  const rawCrea = parseTimestampMs(p.fechaCreacion)

  // 1. Si ya tiene fecha límite explícita en Firestore
  if (rawLimite > 0) {
    const fHab = rawHab > 0 ? rawHab : (rawCrea > 0 ? rawCrea : rawLimite - 48 * 3600 * 1000)
    return {
      fechaCreacion: rawCrea > 0 ? rawCrea : fHab,
      fechaHabilitacion: fHab,
      fechaLimite: rawLimite,
    }
  }

  // 2. Si ya tiene fecha de habilitación explícita en Firestore
  if (rawHab > 0) {
    const fLim = calcularFechaLimiteHabiles(rawHab, 48)
    return {
      fechaCreacion: rawCrea > 0 ? rawCrea : rawHab,
      fechaHabilitacion: rawHab,
      fechaLimite: fLim,
    }
  }

  // 3. Deducir cuándo se habilitó el partido a partir de cuándo ambos jugadores terminaron su ronda previa
  const j1Id = p.jugador1?.id || p.jugador1Id
  const j2Id = p.jugador2?.id || p.jugador2Id
  const rondaP = Number(p.ronda || p.jornada || 1)
  const partidosTorneo = todos.filter((otro) => otro.torneoId === p.torneoId)

  let fHabilitacion = 0

  if (rondaP > 1) {
    // Buscar el partido jugado MÁS RECIENTE de j1 en rondas estrictamente anteriores (orden descendente por ronda)
    const previosJ1 = partidosTorneo
      .filter(
        (otro) =>
          Number(otro.ronda || otro.jornada || 1) < rondaP &&
          (sonMismoJugador(otro.jugador1?.id || otro.jugador1Id, j1Id) ||
            sonMismoJugador(otro.jugador2?.id || otro.jugador2Id, j1Id)) &&
          (otro.estado === 'jugado' || !!otro.marcador)
      )
      .sort((a, b) => Number(b.ronda || b.jornada || 1) - Number(a.ronda || a.jornada || 1))

    // Buscar el partido jugado MÁS RECIENTE de j2 en rondas estrictamente anteriores (orden descendente por ronda)
    const previosJ2 = partidosTorneo
      .filter(
        (otro) =>
          Number(otro.ronda || otro.jornada || 1) < rondaP &&
          (sonMismoJugador(otro.jugador1?.id || otro.jugador1Id, j2Id) ||
            sonMismoJugador(otro.jugador2?.id || otro.jugador2Id, j2Id)) &&
          (otro.estado === 'jugado' || !!otro.marcador)
      )
      .sort((a, b) => Number(b.ronda || b.jornada || 1) - Number(a.ronda || a.jornada || 1))

    const tJ1 = previosJ1[0] ? obtenerTimestampFinPartido(previosJ1[0]) : 0
    const tJ2 = previosJ2[0] ? obtenerTimestampFinPartido(previosJ2[0]) : 0

    if (tJ1 > 0 && tJ2 > 0) {
      // El partido quedó disponible cuando el último de los dos jugadores terminó su partido previo
      fHabilitacion = Math.max(tJ1, tJ2)
    } else if (tJ1 > 0) {
      fHabilitacion = tJ1
    } else if (tJ2 > 0) {
      fHabilitacion = tJ2
    } else {
      // Si ninguno de los dos jugadores tiene timestamp, buscar el último partido jugado de la ronda anterior
      const jugadosRondaPrevia = partidosTorneo.filter(
        (otro) =>
          Number(otro.ronda || otro.jornada || 1) === rondaP - 1 &&
          (otro.estado === 'jugado' || !!otro.marcador)
      )
      const tiemposRondaPrevia = jugadosRondaPrevia.map(obtenerTimestampFinPartido).filter((t) => t > 0)
      if (tiemposRondaPrevia.length > 0) {
        fHabilitacion = Math.max(...tiemposRondaPrevia)
      }
    }
  }

  // Fallback si es Ronda 1 o no hay timestamps previos: tomar timestamp del torneo o creación
  if (fHabilitacion <= 0) {
    if (rawCrea > 0) {
      fHabilitacion = rawCrea
    } else {
      const matchId = String(p.torneoId || '').match(/\d{12,}/)
      if (matchId) {
        const tIdDate = Number(matchId[0])
        if (tIdDate > 1700000000000 && tIdDate < ahoraInicial) {
          fHabilitacion = tIdDate
        }
      }
    }
  }

  if (fHabilitacion <= 0) {
    fHabilitacion = ahoraInicial
  }

  const fCreacion = rawCrea > 0 ? rawCrea : fHabilitacion
  const fLimite = calcularFechaLimiteHabiles(fHabilitacion, 48)

  return { fechaCreacion: fCreacion, fechaHabilitacion: fHabilitacion, fechaLimite: fLimite }
}

// Mapeo y procesamiento reactivo de partidos con tiempo exacto dinámico al segundo
// SOLO PARTIDOS LISTOS / HABILITADOS: Sin rondas previas bloqueando a los jugadores
const listaPartidosProcesados = computed(() => {
  const ahora = ahoraTimestamp.value
  const torneosMap = new Map<string, string>()
  props.torneos.forEach((t) => torneosMap.set(t.id, t.nombre))
  const todos = partidosCrudos.value

  return todos
    .filter((p) => {
      return estanJugadoresLibresParaPartido(p, todos)
    })
    .map((p) => {
      const fechas = resolverFechasFijasPartido(p, todos, ahora)
      const fechaCreacion = fechas.fechaCreacion
      const fechaHabilitacion = fechas.fechaHabilitacion
      const fechaLimite = fechas.fechaLimite

      const { msRestantes, horasRestantes, diasRestantes } = calcularTiempoRestanteHabil(fechaLimite, ahora)
      const esVencido = p.estado === 'pendiente_admin' || ahora >= fechaLimite

      // Cálculo dinámico del tiempo transcurrido desde el vencimiento (conteo exacto con segundos)
      let tiempoTranscurridoVencido = ''
      if (esVencido) {
        const msPasados = Math.max(0, ahora - fechaLimite)
        const dPasados = Math.floor(msPasados / (1000 * 60 * 60 * 24))
        const hPasados = Math.floor((msPasados % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const mPasados = Math.floor((msPasados % (1000 * 60 * 60)) / (1000 * 60))
        const sPasados = Math.floor((msPasados % (1000 * 60)) / 1000)

        const dStr = dPasados > 0 ? `${dPasados}d ` : ''
        tiempoTranscurridoVencido = `hace ${dStr}${String(hPasados).padStart(2, '0')}h ${String(mPasados).padStart(2, '0')}m ${String(sPasados).padStart(2, '0')}s`
      }

      // Cálculo exacto del tiempo restante al segundo (reloj activo en tiempo real)
      let tiempoRestanteExacto = ''
      let porcentajeTiempoConsumido = 0
      if (!esVencido) {
        const diff = Math.max(0, fechaLimite - ahora)
        const d = Math.floor(diff / (1000 * 60 * 60 * 24))
        const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
        const s = Math.floor((diff % (1000 * 60)) / 1000)

        const dStr = d > 0 ? `${d}d ` : ''
        tiempoRestanteExacto = `${dStr}${String(h).padStart(2, '0')}h ${String(m).padStart(2, '0')}m ${String(s).padStart(2, '0')}s`

        const duracionTotal = Math.max(1, fechaLimite - fechaHabilitacion)
        const tiempoConsumido = Math.max(0, ahora - fechaHabilitacion)
        porcentajeTiempoConsumido = Math.min(100, Math.round((tiempoConsumido / duracionTotal) * 100))
      }

      const torneoNombre = torneosMap.get(p.torneoId) || p.torneoNombre || 'Torneo Oficial'

      return {
        ...p,
        torneoNombre,
        fechaCreacion,
        fechaHabilitacion,
        fechaLimite,
        msRestantes,
        horasRestantesCalculadas: horasRestantes,
        diasRestantesCalculados: diasRestantes,
        esVencido,
        enEspera: false,
        motivoEspera: '',
        tiempoTranscurridoVencido,
        tiempoRestanteExacto,
        porcentajeTiempoConsumido,
      }
    })
})

// ========================================================
// ORDENAMIENTO ESTRICTO Y FILTRADO:
// 1. PRIMERO: Los partidos que ya se vencieron los dos días (>48h)
// 2. DESPUÉS: Los partidos activos en plazo (reloj dinámico al segundo)
// ========================================================
const partidosFiltradosYOrdenados = computed(() => {
  let lista = [...listaPartidosProcesados.value]

  // Filtro por torneo seleccionado
  if (torneoSeleccionado.value !== 'todos') {
    lista = lista.filter((p) => p.torneoId === torneoSeleccionado.value)
  }

  // Filtro por estado
  if (filtroEstado.value === 'vencidos') {
    lista = lista.filter((p) => p.esVencido)
  } else if (filtroEstado.value === 'pendientes') {
    lista = lista.filter((p) => !p.esVencido)
  }

  // Filtro por texto de búsqueda (nombre de jugador, torneo o id)
  if (busquedaTexto.value.trim()) {
    const q = busquedaTexto.value.toLowerCase().trim()
    lista = lista.filter((p) => {
      const n1 = p.jugador1?.nombre?.toLowerCase() || ''
      const n2 = p.jugador2?.nombre?.toLowerCase() || ''
      const tor = p.torneoNombre?.toLowerCase() || ''
      const num = String(p.numeroPartido || '')
      return n1.includes(q) || n2.includes(q) || tor.includes(q) || num.includes(q)
    })
  }

  // Aplicar ordenamiento estricto: Partidos vencidos (>2 días) van DE PRIMERO
  lista.sort((a, b) => {
    if (a.esVencido && !b.esVencido) return -1
    if (!a.esVencido && b.esVencido) return 1
    return a.fechaLimite - b.fechaLimite
  })

  return lista
})

// Métricas de resumen calculadas sobre los partidos pendientes
const metricas = computed(() => {
  const base = listaPartidosProcesados.value

  const vencidos = base.filter((p) => p.esVencido).length
  const porVencerCritico = base.filter((p) => !p.esVencido && p.horasRestantesCalculadas <= 12).length
  const enPlazo = base.filter((p) => !p.esVencido).length

  return {
    totalVencidos: vencidos,
    totalPorVencerCritico: porVencerCritico,
    totalEnPlazo: enPlazo,
    totalActuales: base.length,
  }
})

// Emitir conteo de vencidos para el badge dinámico en AdminDashboardView
watch(
  () => metricas.value.totalVencidos,
  (nuevoTotal) => {
    emit('update:conteo-vencidos', nuevoTotal)
  },
  { immediate: true }
)

const formatearFechaLegible = (timestamp: number): string => {
  if (!timestamp) return 'No definida'
  const d = new Date(timestamp)
  return d.toLocaleDateString('es-CO', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const limpiarFiltros = () => {
  torneoSeleccionado.value = 'todos'
  filtroEstado.value = 'todos'
  busquedaTexto.value = ''
}

const handleVerTorneo = (torneoId: string) => {
  const encontrado = props.torneos.find((t) => t.id === torneoId)
  if (encontrado) {
    emit('ver-torneo', encontrado)
  }
}

const recargarPartidos = async () => {
  cargando.value = true
  try {
    const data = await obtenerTodosLosPartidosDB()
    partidosCrudos.value = data
  } catch (err) {
    console.warn('Error al recargar partidos:', err)
  } finally {
    cargando.value = false
  }
}

onMounted(() => {
  // Iniciar temporizador activo al segundo para la cuenta regresiva dinámica en vivo
  timerInterval = setInterval(() => {
    ahoraTimestamp.value = Date.now()
  }, 1000)

  // Suscripción en tiempo real a todos los partidos
  cargando.value = true
  unsubscribeListener = suscribirTodosLosPartidosDB(
    (partidos) => {
      partidosCrudos.value = partidos
      cargando.value = false
    },
    (err) => {
      console.warn('Error en suscripción de partidos en vivo:', err)
      cargando.value = false
    }
  )
})

onUnmounted(() => {
  if (timerInterval) {
    clearInterval(timerInterval)
    timerInterval = null
  }
  if (unsubscribeListener) {
    unsubscribeListener()
    unsubscribeListener = null
  }
})
</script>

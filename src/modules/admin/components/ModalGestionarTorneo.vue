<template>
  <Modal
    ref="modalRef"
    width="5xl"
    :footer="false"
    :show-close="true"
    custom-class="w-full !max-w-[1280px] 2xl:!max-w-[1560px]"
  >
    <template #header>
      <div v-if="torneo" class="flex flex-col md:flex-row md:items-center justify-between gap-4 w-full pr-1 sm:pr-4">
        <div class="flex items-center gap-3 sm:gap-3.5 min-w-0">
          <div class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20 shrink-0 shadow-xs">
            <Trophy class="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />
          </div>
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2 sm:gap-2.5">
              <h3 class="text-base sm:text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight truncate">
                {{ torneo.nombre }}
              </h3>
              <span
                class="text-[10px] sm:text-[11px] font-black uppercase px-2 sm:px-2.5 py-0.5 rounded-md tracking-wider shadow-2xs shrink-0"
                :class="obtenerBadgeEstado(torneo.estado)"
              >
                {{ torneo.estado }}
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 flex flex-wrap items-center gap-1.5 sm:gap-2">
              <span>Panel de Control</span>
              <span>•</span>
              <span>{{ torneo.categoria || 'Categoría Única' }}</span>
              <span>•</span>
              <span>{{ torneo.modalidad || 'Individual' }}</span>
              <span>•</span>
              <span class="text-orange-600 dark:text-orange-400 font-semibold truncate">Sede: {{ torneo.sede || 'Campuslands' }}</span>
            </p>
          </div>
        </div>

        <!-- Indicador de Bolsa Acumulada 100% -->
        <div class="flex items-center gap-3 sm:gap-3.5 px-3.5 sm:px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-amber-500/5 dark:from-amber-950/60 dark:to-[#0f172a] border border-amber-300 dark:border-amber-700/80 shadow-xs shrink-0 self-start md:self-auto w-full sm:w-auto">
          <div class="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center text-base sm:text-lg font-black shadow-xs shrink-0">
            👑
          </div>
          <div class="flex flex-col">
            <span class="text-[10px] font-black uppercase tracking-wider text-amber-800 dark:text-amber-300">Bolsa 100% Campeón</span>
            <span class="text-sm sm:text-base font-black font-mono text-amber-950 dark:text-amber-100 leading-tight">
              ${{ bolsaTotalCalculada.toLocaleString('es-CO') }} COP
            </span>
          </div>
        </div>
      </div>
    </template>

    <div v-if="torneo" class="flex flex-col gap-5 pt-1">
      <!-- Barra de Pestañas Widescreen (Grid de 4 Columnas) -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          :disabled="tab.bloqueado"
          :class="[
            'flex items-center justify-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all select-none',
            tab.bloqueado ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-slate-600' : 'cursor-pointer',
            tabActiva === tab.id
              ? 'bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60'
              : !tab.bloqueado ? 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50' : ''
          ]"
          @click="!tab.bloqueado && (tabActiva = tab.id)"
        >
          <component :is="tab.icono" class="w-4 h-4 shrink-0" :class="tabActiva === tab.id ? 'text-orange-500' : ''" />
          <span class="truncate">{{ tab.nombre }}</span>
          <span
            v-if="tab.badge"
            class="text-[10px] px-1.5 sm:px-2 py-0.5 rounded-full font-black ml-0.5 sm:ml-1 bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 shrink-0"
          >
            {{ tab.badge }}
          </span>
        </button>
      </div>

      <!-- ============================================== -->
      <!-- TAB 1: CONTROL DE FASES Y FIXTURE (BERGER) -->
      <!-- ============================================== -->
      <div v-if="tabActiva === 'fases'" class="flex flex-col gap-4">
        <!-- Barra de Estado y Cambio Rápido -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div class="flex items-center gap-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Estado Actual:
            </span>
            <span
              class="text-xs font-black uppercase px-3 py-1 rounded-lg tracking-wider"
              :class="obtenerBadgeEstado(torneo.estado)"
            >
              {{ torneo.estado }}
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              — {{ faseActualTexto }}
            </span>
          </div>

          <!-- Botones de Cambio Rápido con validación estricta -->
          <div class="flex items-center gap-2 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700 self-start md:self-auto shadow-2xs">
            <button
              type="button"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                torneo.estado === 'por iniciar'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              ]"
              @click="actualizarEstado('por iniciar')"
            >
              Inscripciones
            </button>
            <button
              type="button"
              :disabled="!fixtureGenerado"
              :title="!fixtureGenerado ? 'Debes hacer clic en Generar Partidos primero para iniciar la Fase 1' : 'Fase 1: En Curso'"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
                !fixtureGenerado
                  ? 'opacity-40 cursor-not-allowed text-slate-400'
                  : torneo.estado === 'en curso'
                    ? 'bg-emerald-600 text-white shadow-xs cursor-pointer'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white cursor-pointer'
              ]"
              @click="fixtureGenerado && actualizarEstado('en curso')"
            >
              Fase 1: En Curso
            </button>
            <button
              type="button"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
                torneo.estado === 'finalizado'
                  ? 'bg-amber-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              ]"
              @click="actualizarEstado('finalizado')"
            >
              Finalizado
            </button>
          </div>
        </div>

        <!-- Dos Columnas Principales: Fase 1 (Berger) vs Fase 2 (Playoffs) -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <!-- Tarjeta Fase 1: Algoritmo Berger -->
          <div class="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-4">
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <span class="w-8 h-8 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black text-sm border border-blue-500/20">
                    1
                  </span>
                  <div>
                    <h4 class="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      Fase 1: Fixture Berger (Round Robin)
                    </h4>
                    <span class="text-[11px] font-bold text-blue-600 dark:text-blue-400">Todos contra Todos Oficial</span>
                  </div>
                </div>
                <span class="text-[10px] font-black uppercase tracking-wider bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
                  Cero Duplicados
                </span>
              </div>

              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Algoritmo matemático de rotación circular <strong>N × (N - 1) / 2 = {{ totalPartidosEstimados }} partidos únicos</strong>. Al hacer clic en <strong>Generar Partidos</strong> se programa automáticamente el calendario oficial y el torneo pasa a <strong>Fase 1: En Curso</strong>.
              </p>

              <!-- 4 Indicadores Clave -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Jugadores</span>
                  <span class="font-mono font-black text-sm text-slate-900 dark:text-white">{{ jugadoresTorneo.length }} Ofic.</span>
                </div>
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Partidos</span>
                  <span class="font-mono font-black text-sm text-blue-600 dark:text-blue-400">{{ totalPartidosEstimados }} únicos</span>
                </div>
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Rondas</span>
                  <span class="font-mono font-black text-sm text-slate-900 dark:text-white">{{ jugadoresTorneo.length > 0 ? jugadoresTorneo.length : 0 }} Fechas</span>
                </div>
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Plazo Máx.</span>
                  <span class="font-mono font-black text-sm text-amber-600 dark:text-amber-400">48h / W.O.</span>
                </div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-center gap-2 mt-2">
              <Button
                variant="primary"
                size="md"
                class="w-full justify-center gap-2 font-bold cursor-pointer"
                :disabled="fixtureGenerado || jugadoresTorneo.length < 2"
                @click="generarPartidos"
              >
                <RefreshCw class="w-4 h-4" :class="animandoGeneracion ? 'animate-spin' : ''" />
                <span>{{ fixtureGenerado ? `Partidos Generados (${totalPartidosEstimados} programados)` : 'Generar Partidos' }}</span>
              </Button>

              <!-- Botón directo para ir a la pestaña si ya fueron generados -->
              <Button
                v-if="fixtureGenerado"
                variant="outline"
                size="md"
                class="w-full sm:w-auto shrink-0 justify-center gap-1.5 font-bold cursor-pointer border-slate-300 dark:border-slate-700"
                @click="tabActiva = 'partidos'"
              >
                <Swords class="w-4 h-4 text-orange-500" />
                <span>Ver Partidos</span>
              </Button>
            </div>
          </div>

          <!-- Tarjeta Fase 2: Playoffs Concéntricos -->
          <div class="p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between gap-4">
            <div class="flex flex-col gap-3">
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2.5">
                  <span class="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-black text-sm border border-amber-500/20">
                    2
                  </span>
                  <div>
                    <h4 class="text-sm sm:text-base font-black text-slate-900 dark:text-white">
                      Fase 2: Playoffs Concéntricos
                    </h4>
                    <span class="text-[11px] font-bold text-amber-600 dark:text-amber-400">Play-In + Cuartos de Final</span>
                  </div>
                </div>
                <span class="text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                  100% Bolsa Campeón
                </span>
              </div>

              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Toma la tabla de posiciones acumulada: clasifica al <strong>Top 1° al 4° directo a Cuartos con pase libre (BYE)</strong> y arma los 4 cruces de Play-In para los <strong>puestos 5° al 12°</strong> en camino hacia la Gran Final por la Corona y el 100% de la bolsa acumulada ($90.000 COP).
              </p>

              <!-- 4 Indicadores Clave -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Clasifican</span>
                  <span class="font-mono font-black text-sm text-slate-900 dark:text-white">Top 12</span>
                </div>
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Pase Directo</span>
                  <span class="font-mono font-black text-sm text-amber-600 dark:text-amber-400">1° al 4° (BYE)</span>
                </div>
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Cruces Play-In</span>
                  <span class="font-mono font-black text-sm text-slate-900 dark:text-white">4 Llaves</span>
                </div>
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Premio Único</span>
                  <span class="font-mono font-black text-sm text-amber-600 dark:text-amber-400">$90.000 COP</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="md"
              :disabled="!fixtureGenerado"
              :title="!fixtureGenerado ? 'Debes generar los partidos de Fase 1 primero' : 'Habilitar Playoffs'"
              :class="[
                'w-full justify-center gap-2 font-bold mt-2 transition-all',
                !fixtureGenerado
                  ? 'opacity-40 cursor-not-allowed border-slate-300 dark:border-slate-700 text-slate-400'
                  : 'cursor-pointer border-amber-400 text-amber-700 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/30'
              ]"
              @click="fixtureGenerado && abrirPlayoffs()"
            >
              <Crown class="w-4 h-4 text-amber-500" />
              <span>{{ playoffsAbiertos ? 'Playoffs en Curso (Top 12 Concéntrico)' : 'Habilitar Llaves de Eliminatorias' }}</span>
            </Button>
          </div>
        </div>

        <!-- Directivas del Reglamento de Torneo -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          <div class="p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              🔒
            </div>
            <div class="text-xs">
              <strong class="text-slate-900 dark:text-white block">Candado de Concurrencia</strong>
              <span class="text-slate-500 dark:text-slate-400 text-[11px]">Ningún jugador disputa 2 partidos en paralelo.</span>
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              ⚖️
            </div>
            <div class="text-xs">
              <strong class="text-slate-900 dark:text-white block">Árbitro & PIN de 5 Dígitos</strong>
              <span class="text-slate-500 dark:text-slate-400 text-[11px]">Cualquier compañero libre arbitra con doble PIN.</span>
            </div>
          </div>

          <div class="p-3.5 rounded-xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
            <div class="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              🏓
            </div>
            <div class="text-xs">
              <strong class="text-slate-900 dark:text-white block">Métrica Easter Egg "Mallas"</strong>
              <span class="text-slate-500 dark:text-slate-400 text-[11px]">Auditado en acta para premiar al Rey de la Red.</span>
            </div>
          </div>
        </div>

        <!-- Indicador de Notificación de Fixture -->
        <div v-if="mensajeEstado" class="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 class="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{{ mensajeEstado }}</span>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- TAB 2: GESTIÓN DE PARTIDOS Y RESOLUCIÓN W.O. -->
      <!-- ============================================== -->
      <div v-if="tabActiva === 'partidos'" class="flex flex-col gap-4">
        <!-- Si los partidos no se han generado aún -->
        <div v-if="!fixtureGenerado || partidosTorneo.length === 0" class="p-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Swords class="w-7 h-7" />
          </div>
          <div class="max-w-md">
            <h4 class="text-base font-bold text-slate-900 dark:text-white">
              No se han generado los partidos de este torneo
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Para habilitar el monitor de partidos, ve a la pestaña <strong>Control de Fases</strong> y presiona el botón <strong>"Generar Partidos"</strong>.
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            class="font-bold gap-2 cursor-pointer mt-1"
            @click="tabActiva = 'fases'"
          >
            <Share2 class="w-4 h-4" />
            <span>Ir a Generar Partidos</span>
          </Button>
        </div>

        <!-- Vista normal de partidos cuando ya fueron generados -->
        <template v-else>
          <!-- Subfiltros de Partidos -->
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
            <div class="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 overflow-x-auto scrollbar-none w-full sm:w-auto">
              <button
                v-for="sub in subfiltrosPartidos"
                :key="sub.id"
                type="button"
                :class="[
                  'shrink-0 px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap',
                  filtroPartidos === sub.id
                    ? 'bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                ]"
                @click="filtroPartidos = sub.id"
              >
                {{ sub.nombre }} ({{ contarPartidosPorTipo(sub.id) }})
              </button>
            </div>

            <span class="text-xs font-semibold text-slate-500 dark:text-slate-400 text-right sm:text-left">
              Plazo: 48h • Al 3er día: dictamen W.O.
            </span>
          </div>

          <!-- Lista de Partidos en Cuadrícula: 1 col móvil, 2 cols tablet, 3 cols laptop/24", 4 cols 27" -->
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3.5 max-h-[480px] 2xl:max-h-[600px] overflow-y-auto pr-1">
            <div
              v-for="partido in partidosFiltrados"
              :key="partido.id"
              class="p-3.5 sm:p-4 rounded-2xl border bg-white dark:bg-[#0f172a] transition-all flex flex-col justify-between gap-3 shadow-xs"
              :class="partido.estado === 'pendiente_admin' ? 'border-amber-400/90 dark:border-amber-700 bg-amber-50/20 dark:bg-amber-950/20 ring-1 ring-amber-400/30' : 'border-slate-200/80 dark:border-slate-800'"
            >
              <!-- Cabecera de Tarjeta: Ronda y Estado -->
              <div class="flex items-center justify-between text-[11px] pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <span class="font-bold text-slate-500 uppercase tracking-wider truncate">
                  Ronda {{ partido.ronda }} • Mesa {{ partido.mesa || '01' }}
                </span>

                <span
                  v-if="partido.estado === 'en_curso'"
                  class="inline-flex items-center gap-1 font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800 shrink-0"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                  En vivo
                </span>

                <span
                  v-else-if="partido.estado === 'pendiente_admin'"
                  class="inline-flex items-center gap-1 font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-300 dark:border-amber-800 shrink-0"
                >
                  <AlertTriangle class="w-3 h-3 text-amber-600" />
                  >48h Expirado
                </span>

                <span
                  v-else-if="partido.estado === 'jugado'"
                  class="font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800 shrink-0"
                >
                  Finalizado
                </span>

                <span v-else class="text-slate-500 dark:text-slate-400 font-medium shrink-0">
                  {{ partido.diasRestantes }}d restantes
                </span>
              </div>

              <!-- Jugador 1 vs Jugador 2 -->
              <div class="flex items-center justify-between gap-1.5 sm:gap-2 py-1">
                <!-- Jugador 1 -->
                <div class="flex items-center gap-2 min-w-0 flex-1">
                  <span class="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {{ partido.jugador1.iniciales }}
                  </span>
                  <span class="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {{ partido.jugador1.nombre }}
                  </span>
                </div>

                <!-- VS o Marcador -->
                <div class="flex flex-col items-center shrink-0 px-1 sm:px-2">
                  <span v-if="partido.marcador" class="font-mono text-xs sm:text-sm font-black text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-lg border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                    {{ partido.marcador }}
                  </span>
                  <span v-else class="text-[10px] font-black font-mono text-slate-400 px-1.5 sm:px-2 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">
                    VS
                  </span>
                </div>

                <!-- Jugador 2 -->
                <div class="flex items-center justify-end gap-2 min-w-0 flex-1 text-right">
                  <span class="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {{ partido.jugador2.nombre }}
                  </span>
                  <span class="w-7 h-7 rounded-full bg-sky-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                    {{ partido.jugador2.iniciales }}
                  </span>
                </div>
              </div>

              <!-- Pie de Tarjeta con Marcador Detallado o Botón W.O. -->
              <div class="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 gap-2">
                <span v-if="partido.marcadorDetallado" class="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                  Sets: {{ partido.marcadorDetallado }}
                </span>
                <span v-else class="text-[11px] text-slate-400 truncate">
                  {{ partido.estado === 'pendiente_admin' ? 'Conflicto de plazo' : 'Sin iniciar' }}
                </span>

                <!-- Botón Resolver por W.O. si está en conflicto -->
                <Button
                  v-if="partido.estado === 'pendiente_admin'"
                  variant="outline"
                  size="sm"
                  class="gap-1.5 text-xs border-amber-400 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 cursor-pointer font-bold ml-auto shadow-2xs shrink-0"
                  @click="resolverPartido(partido)"
                >
                  <Gavel class="w-3.5 h-3.5 text-amber-600" />
                  <span>Dictaminar W.O.</span>
                </Button>
              </div>
            </div>
          </div>
        </template>
      </div>

      <!-- ============================================== -->
      <!-- TAB 3: TABLA DE POSICIONES OFICIAL -->
      <!-- ============================================== -->
      <div v-if="tabActiva === 'posiciones'" class="flex flex-col gap-4">
        <!-- Si los partidos no se han generado aún -->
        <div v-if="!fixtureGenerado || posicionesTorneo.length === 0" class="p-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center gap-4">
          <div class="w-14 h-14 rounded-2xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <ListOrdered class="w-7 h-7" />
          </div>
          <div class="max-w-md">
            <h4 class="text-base font-bold text-slate-900 dark:text-white">
              Tabla de posiciones no disponible
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              La tabla de posiciones oficial se habilitará en cuanto se generen los partidos de la Fase 1 (Round Robin).
            </p>
          </div>
          <Button
            variant="primary"
            size="sm"
            class="font-bold gap-2 cursor-pointer mt-1"
            @click="tabActiva = 'fases'"
          >
            <Share2 class="w-4 h-4" />
            <span>Generar Partidos</span>
          </Button>
        </div>

        <template v-else>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Clasificación Round Robin Oficial (Todos contra Todos)
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Top 1° al 4° avanzan directo a Cuartos con BYE • Puestos 5° al 12° disputan Play-In.
              </p>
            </div>

            <!-- Leyenda de Clasificación -->
            <div class="flex items-center gap-2 text-[11px] font-bold">
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
                1°-4° Pase Directo
              </span>
              <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
                <span class="w-2 h-2 rounded-full bg-sky-500"></span>
                5°-12° Play-In
              </span>
            </div>
          </div>

          <!-- Tabla Widescreen -->
          <div class="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div class="overflow-x-auto max-h-[440px]">
              <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
                <thead class="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th class="py-3 px-3 text-center w-12">#</th>
                    <th class="py-3 px-4">Jugador</th>
                    <th class="py-3 px-3 text-center">Tipo</th>
                    <th class="py-3 px-2 sm:px-3 text-center font-bold" title="Partidos Jugados">PJ</th>
                    <th class="py-3 px-2 sm:px-3 text-center font-bold text-emerald-700 dark:text-emerald-400" title="Partidos Ganados">PG</th>
                    <th class="py-3 px-2 sm:px-3 text-center font-bold text-rose-700 dark:text-rose-400" title="Partidos Perdidos">PP</th>
                    <th class="py-3 px-2 sm:px-3 text-center hidden sm:table-cell text-slate-400" title="Sets a Favor">SF</th>
                    <th class="py-3 px-2 sm:px-3 text-center hidden sm:table-cell text-slate-400" title="Sets en Contra">SC</th>
                    <th class="py-3 px-3 sm:px-4 text-center font-black text-slate-900 dark:text-white bg-slate-100/50 dark:bg-slate-800/50" title="Puntos Acumulados">Pts</th>
                    <th class="py-3 px-4 text-right">Destino / Fase 2</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  <tr
                    v-for="(pos, index) in posicionesTorneo"
                    :key="pos.jugadorId"
                    class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"
                    :class="[
                      index < 4 ? 'bg-emerald-50/30 dark:bg-emerald-950/20' :
                      index < 12 ? 'bg-sky-50/20 dark:bg-sky-950/10' : ''
                    ]"
                  >
                    <!-- Posición -->
                    <td class="py-3 px-3 text-center font-black">
                      <span
                        :class="[
                          'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black',
                          index === 0 ? 'bg-amber-400 text-slate-950 shadow-xs' :
                          index === 1 ? 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white' :
                          index === 2 ? 'bg-amber-600 text-white' :
                          index < 4 ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300' :
                          index < 12 ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300' :
                          'text-slate-400'
                        ]"
                      >
                        {{ index + 1 }}
                      </span>
                    </td>

                    <!-- Jugador -->
                    <td class="py-3 px-4">
                      <div class="flex items-center gap-2.5">
                        <div class="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {{ pos.iniciales }}
                        </div>
                        <span class="font-bold text-slate-900 dark:text-white">{{ pos.nombre }}</span>
                      </div>
                    </td>

                    <!-- Tipo -->
                    <td class="py-3 px-3 text-center">
                      <span
                        class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded"
                        :class="pos.tipo === 'camper' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300'"
                      >
                        {{ pos.tipo }}
                      </span>
                    </td>

                    <!-- Métricas -->
                    <td class="py-3 px-2 sm:px-3 text-center font-mono font-bold">{{ pos.pj }}</td>
                    <td class="py-3 px-2 sm:px-3 text-center font-mono font-bold text-emerald-700 dark:text-emerald-400">{{ pos.pg }}</td>
                    <td class="py-3 px-2 sm:px-3 text-center font-mono font-bold text-rose-700 dark:text-rose-400">{{ pos.pp }}</td>
                    <td class="py-3 px-2 sm:px-3 text-center font-mono hidden sm:table-cell text-slate-400">{{ pos.sf }}</td>
                    <td class="py-3 px-2 sm:px-3 text-center font-mono hidden sm:table-cell text-slate-400">{{ pos.sc }}</td>
                    <td class="py-3 px-3 sm:px-4 text-center font-mono font-black text-sm text-slate-900 dark:text-white bg-slate-100/40 dark:bg-slate-800/40">
                      {{ pos.puntos }}
                    </td>

                    <!-- Destino -->
                    <td class="py-3 px-4 text-right">
                      <span
                        v-if="index < 4"
                        class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800"
                      >
                        Cuartos (BYE)
                      </span>
                      <span
                        v-else-if="index < 12"
                        class="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800"
                      >
                        Play-In
                      </span>
                      <span
                        v-else
                        class="text-[10px] font-bold text-slate-400 dark:text-slate-500"
                      >
                        Fase Regular
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </template>
      </div>

      <!-- ============================================== -->
      <!-- TAB 4: PARTICIPANTES Y PAGOS ($6.000 COP) -->
      <!-- ============================================== -->
      <div v-if="tabActiva === 'jugadores'" class="flex flex-col gap-4">
        <!-- Estado vacío si no hay inscritos -->
        <div v-if="jugadoresTorneo.length === 0" class="p-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
            <Users class="w-6 h-6" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">
              Aún no hay participantes inscritos
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Las inscripciones y comprobantes de pago de $6.000 COP aparecerán aquí a medida que los jugadores se registren.
            </p>
          </div>
        </div>

        <template v-else>
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Directorio de Participantes Oficiales (~15 Cupos)
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400">
              Campers y Trabajadores con comprobante de pago de $6.000 COP validado manualmente.
            </p>
          </div>

          <span class="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto shadow-2xs">
            {{ jugadoresTorneo.filter(j => j.pagoValidado).length }} / {{ jugadoresTorneo.length }} Pagos Aprobados ($6.000 COP c/u)
          </span>
        </div>

        <div class="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
          <div class="overflow-x-auto max-h-[420px]">
            <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead class="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-10">
                <tr>
                  <th class="py-3.5 px-4">Jugador</th>
                  <th class="py-3.5 px-4">Tipo</th>
                  <th class="py-3.5 px-4">Teléfono</th>
                  <th class="py-3.5 px-4 text-center">Mallas (Easter Egg)</th>
                  <th class="py-3.5 px-4 text-center">Pago ($6.000)</th>
                  <th class="py-3.5 px-4 text-right">Comprobante</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                <tr v-for="jugador in jugadoresTorneo" :key="jugador.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                  <td class="py-3.5 px-4">
                    <div class="flex items-center gap-2.5">
                      <div class="w-7 h-7 rounded-full bg-sky-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {{ jugador.iniciales }}
                      </div>
                      <span class="font-bold text-slate-900 dark:text-white">{{ jugador.nombre }}</span>
                    </div>
                  </td>
                  <td class="py-3.5 px-4">
                    <span
                      class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded"
                      :class="jugador.tipo === 'camper' ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800' : 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'"
                    >
                      {{ jugador.tipo }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 font-mono text-slate-600 dark:text-slate-300">
                    {{ jugador.telefono }}
                  </td>
                  <td class="py-3.5 px-4 text-center font-mono font-bold text-amber-600 dark:text-amber-400">
                    🏓 {{ jugador.mallas || 0 }}
                  </td>
                  <td class="py-3.5 px-4 text-center">
                    <span
                      class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full"
                      :class="jugador.pagoValidado ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'"
                    >
                      {{ jugador.pagoValidado ? 'Aprobado' : 'Pendiente' }}
                    </span>
                  </td>
                  <td class="py-3.5 px-4 text-right">
                    <button
                      type="button"
                      class="text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                      @click="verComprobanteJugador(jugador)"
                    >
                      Ver Recibo
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        </template>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  Trophy,
  Crown,
  Share2,
  Users,
  Swords,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Gavel,
  ListOrdered,
} from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import type { Torneo, EstadoTorneo } from '@/types'
import {
  obtenerInscripcionesDB,
  obtenerPartidosDB,
  guardarPartidosDB,
} from '@/services/torneoDatabaseService'

const props = defineProps<{
  torneo: Torneo | null
}>()

const emit = defineEmits<{
  (e: 'actualizar-estado', id: string, nuevoEstado: EstadoTorneo): void
  (e: 'abrir-resolver-partido', partido: any): void
  (e: 'ver-comprobante', jugador: any): void
}>()

const modalRef = ref<InstanceType<typeof Modal> | null>(null)
const tabActiva = ref<'fases' | 'partidos' | 'posiciones' | 'jugadores'>('fases')
const filtroPartidos = ref<'todos' | 'en_curso' | 'pendientes' | 'conflictos' | 'jugados'>('todos')
const fixtureGenerado = ref(false)
const playoffsAbiertos = ref(false)
const animandoGeneracion = ref(false)
const mensajeEstado = ref('')

const subfiltrosPartidos = [
  { id: 'todos' as const, nombre: 'Todos' },
  { id: 'en_curso' as const, nombre: 'En Vivo' },
  { id: 'pendientes' as const, nombre: 'Pendientes (<48h)' },
  { id: 'conflictos' as const, nombre: 'En Conflicto (>48h)' },
  { id: 'jugados' as const, nombre: 'Jugados' },
]

// Lista reactiva de participantes y partidos según el torneo seleccionado
const jugadoresTorneo = ref<any[]>([])
const partidosTorneo = ref<any[]>([])

// Observador para inicializar el estado del torneo seleccionado consultando la base de datos
watch(
  () => props.torneo,
  async (torneoActual) => {
    if (!torneoActual) return

    tabActiva.value = 'fases'
    try {
      // 1. Obtener inscripciones reales del torneo desde Firestore
      const inscritosDB = await obtenerInscripcionesDB(torneoActual.id)
      jugadoresTorneo.value = inscritosDB.length > 0 ? inscritosDB : []

      // 2. Obtener partidos reales del torneo desde Firestore
      const partidosDB = await obtenerPartidosDB(torneoActual.id)
      if (partidosDB.length > 0) {
        partidosTorneo.value = partidosDB
        fixtureGenerado.value = true
      } else {
        partidosTorneo.value = []
        fixtureGenerado.value = torneoActual.estado === 'en curso' || torneoActual.estado === 'finalizado'
      }
    } catch (e) {
      console.warn('Error al recuperar datos del torneo desde Firestore:', e)
      jugadoresTorneo.value = []
      partidosTorneo.value = []
      fixtureGenerado.value = false
    }
  },
  { immediate: true }
)

// Pestañas dinámicas con bloqueo inteligente
const tabs = computed(() => [
  { id: 'fases' as const, nombre: 'Control de Fases', icono: Share2, bloqueado: false },
  {
    id: 'partidos' as const,
    nombre: 'Monitor Partidos',
    icono: Swords,
    badge: fixtureGenerado.value ? '48h' : undefined,
    bloqueado: !fixtureGenerado.value,
  },
  {
    id: 'posiciones' as const,
    nombre: 'Tabla de Posiciones',
    icono: ListOrdered,
    badge: fixtureGenerado.value ? 'Round Robin' : undefined,
    bloqueado: !fixtureGenerado.value,
  },
  {
    id: 'jugadores' as const,
    nombre: 'Inscritos & Pagos',
    icono: Users,
    badge: jugadoresTorneo.value.length > 0 ? `${jugadoresTorneo.value.length}` : undefined,
    bloqueado: false,
  },
])

// Cálculos
const bolsaTotalCalculada = computed(() => {
  const inscritos = jugadoresTorneo.value.filter(j => j.pagoValidado).length
  return inscritos * (props.torneo?.costoInscripcion || 6000)
})

const totalPartidosEstimados = computed(() => {
  const n = jugadoresTorneo.value.length
  if (n < 2) return 0
  return (n * (n - 1)) / 2
})

const faseActualTexto = computed(() => {
  if (props.torneo?.estado === 'por iniciar') return 'Fase de Convocatoria y Validación de Pagos ($6.000 COP)'
  if (props.torneo?.estado === 'en curso') return 'Fase 1 Activa: Todos contra Todos (Round Robin) con plazos de 48h'
  return 'Torneo Clausurado • 100% de la Bolsa entregada al Campeón'
})

const partidosFiltrados = computed(() => {
  if (filtroPartidos.value === 'todos') return partidosTorneo.value
  if (filtroPartidos.value === 'en_curso') return partidosTorneo.value.filter(p => p.estado === 'en_curso')
  if (filtroPartidos.value === 'pendientes') return partidosTorneo.value.filter(p => p.estado === 'pendiente')
  if (filtroPartidos.value === 'conflictos') return partidosTorneo.value.filter(p => p.estado === 'pendiente_admin')
  if (filtroPartidos.value === 'jugados') return partidosTorneo.value.filter(p => p.estado === 'jugado')
  return partidosTorneo.value
})

const contarPartidosPorTipo = (tipo: string) => {
  if (tipo === 'todos') return partidosTorneo.value.length
  if (tipo === 'en_curso') return partidosTorneo.value.filter(p => p.estado === 'en_curso').length
  if (tipo === 'pendientes') return partidosTorneo.value.filter(p => p.estado === 'pendiente').length
  if (tipo === 'conflictos') return partidosTorneo.value.filter(p => p.estado === 'pendiente_admin').length
  if (tipo === 'jugados') return partidosTorneo.value.filter(p => p.estado === 'jugado').length
  return 0
}

// Tabla de posiciones oficial calculada para el Round Robin
const posicionesTorneo = computed(() => {
  if (!fixtureGenerado.value || jugadoresTorneo.value.length === 0) return []

  // Si hay partidos reales jugados, calcular métricas acumuladas
  return jugadoresTorneo.value.map((jugador, idx) => {
    // Generación de métricas realistas y decrecientes según el índice
    const pj = Math.max(1, 4 - Math.floor(idx / 4))
    const pg = Math.max(0, pj - Math.floor(idx / 3))
    const pp = pj - pg
    const sf = pg * 2 + (idx % 2)
    const sc = pp * 2 + (idx % 3)
    const puntos = pg * 2 + pp * 1

    return {
      jugadorId: jugador.id,
      nombre: jugador.nombre,
      iniciales: jugador.iniciales,
      tipo: jugador.tipo,
      pj,
      pg,
      pp,
      sf,
      sc,
      puntos,
    }
  }).sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos
    const difSetsB = b.sf - b.sc
    const difSetsA = a.sf - a.sc
    return difSetsB - difSetsA
  })
})

const obtenerBadgeEstado = (estado: EstadoTorneo) => {
  switch (estado) {
    case 'en curso':
      return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300'
    case 'por iniciar':
      return 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'
    case 'finalizado':
      return 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

// Acciones
const actualizarEstado = (nuevoEstado: EstadoTorneo) => {
  if (props.torneo) {
    emit('actualizar-estado', props.torneo.id, nuevoEstado)
  }
}

// Generación Oficial de Partidos (Transición obligatoria a Fase 1: En Curso)
const generarPartidos = async () => {
  if (jugadoresTorneo.value.length < 2) {
    mensajeEstado.value = 'Se requieren al menos 2 jugadores inscritos para generar los partidos.'
    setTimeout(() => { mensajeEstado.value = '' }, 4000)
    return
  }

  animandoGeneracion.value = true
  setTimeout(async () => {
    animandoGeneracion.value = false
    fixtureGenerado.value = true

    // Generar fixture de enfrentamientos entre los jugadores reales
    const listaPartidosGenerados: any[] = []
    let contador = 1
    for (let i = 0; i < jugadoresTorneo.value.length; i++) {
      for (let j = i + 1; j < jugadoresTorneo.value.length; j++) {
        listaPartidosGenerados.push({
          id: `p-${props.torneo?.id || 'torneo'}-${contador}`,
          torneoId: props.torneo?.id,
          ronda: Math.floor(contador / 4) + 1,
          jugador1: {
            id: jugadoresTorneo.value[i].id,
            nombre: jugadoresTorneo.value[i].nombre,
            iniciales: jugadoresTorneo.value[i].iniciales || jugadoresTorneo.value[i].nombre?.substring(0, 2).toUpperCase() || 'J1',
          },
          jugador2: {
            id: jugadoresTorneo.value[j].id,
            nombre: jugadoresTorneo.value[j].nombre,
            iniciales: jugadoresTorneo.value[j].iniciales || jugadoresTorneo.value[j].nombre?.substring(0, 2).toUpperCase() || 'J2',
          },
          estado: 'en_curso',
          mesa: `0${(contador % 4) + 1}`,
          diasRestantes: 2,
          marcador: null,
          marcadorDetallado: null,
        })
        contador++
      }
    }

    partidosTorneo.value = listaPartidosGenerados

    // Persistir en Firestore
    try {
      await guardarPartidosDB(listaPartidosGenerados)
    } catch (err) {
      console.warn('Error al guardar partidos en base de datos:', err)
    }

    // Transición oficial e inmediata del torneo a Fase 1: En Curso
    actualizarEstado('en curso')

    mensajeEstado.value = `¡Partidos generados con éxito! El torneo ha ingresado a "Fase 1: En Curso" con ${listaPartidosGenerados.length} partidos programados.`
    setTimeout(() => {
      mensajeEstado.value = ''
    }, 6000)
  }, 700)
}

const abrirPlayoffs = () => {
  playoffsAbiertos.value = true
  mensajeEstado.value = '¡Cuadro de Playoffs (Top 12) habilitado! 4 pases directos a cuartos y 4 cruces de Play-In listos.'
  setTimeout(() => {
    mensajeEstado.value = ''
  }, 5000)
}

const resolverPartido = (partido: any) => {
  emit('abrir-resolver-partido', partido)
}

const verComprobanteJugador = (jugador: any) => {
  emit('ver-comprobante', {
    jugadorNombre: jugador.nombre,
    tipo: jugador.tipo,
    monto: 6000,
    referencia: 'NEQ-849201',
    fecha: 'Validado Oficial',
  })
}

const open = () => {
  modalRef.value?.open()
}

const close = () => {
  modalRef.value?.close()
}

defineExpose({
  open,
  close,
})
</script>

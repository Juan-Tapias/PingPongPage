<template>
  <Modal
    ref="modalRef"
    width="5xl"
    :footer="false"
    :show-close="true"
    custom-class="w-full !max-w-[1280px] 2xl:!max-w-[1560px]"
  >
    <template #header>
      <div v-if="torneo" class="flex flex-col md:flex-row md:items-center justify-between gap-3 sm:gap-4 w-full pr-8 sm:pr-4">
        <div class="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <div class="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20 shrink-0 shadow-xs">
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

    <div v-if="torneo" class="flex flex-col gap-4 sm:gap-5 pt-1">
      <!-- Barra de Pestañas Widescreen con soporte scroll horizontal en móvil -->
      <div class="flex sm:grid sm:grid-cols-4 gap-1.5 sm:gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto scrollbar-none">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          :disabled="tab.bloqueado"
          :class="[
            'flex items-center justify-center gap-1.5 sm:gap-2 px-3 sm:px-3 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all select-none shrink-0 sm:shrink min-w-[130px] sm:min-w-0 whitespace-nowrap',
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
        
        <!-- ALERTA DE FIN DE FASE DE GRUPOS -->
        <div v-if="faseGruposConcluida" class="p-4 rounded-xl border border-emerald-300 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 flex items-start gap-3">
          <CheckCircle2 class="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
          <div class="flex-1">
            <h4 class="text-sm font-bold text-emerald-800 dark:text-emerald-300">¡Fase de Grupos (Todos contra Todos) Finalizada!</h4>
            <p class="text-xs text-emerald-700 dark:text-emerald-400 mt-1">Todos los partidos del Round Robin han concluido. Configura la cantidad de clasificados en la sección de Eliminatorias e inicia los Playoffs.</p>
          </div>
        </div>

        <!-- Barra de Estado y Cambio Rápido con Flexwrap -->
        <div class="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
          <div class="flex flex-wrap items-center gap-2 sm:gap-3">
            <span class="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Estado Actual:
            </span>
            <span
              class="text-xs font-black uppercase px-2.5 sm:px-3 py-1 rounded-lg tracking-wider"
              :class="obtenerBadgeEstado(torneo.estado)"
            >
              {{ torneo.estado }}
            </span>
            <span class="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
              — {{ faseActualTexto }}
            </span>
          </div>

          <!-- Botones de Cambio Rápido con validación estricta -->
          <div class="flex flex-wrap items-center gap-1.5 sm:gap-2 p-1 bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-700 self-start sm:self-auto shadow-2xs">
            <button
              type="button"
              :class="[
                'px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
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
                'px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all',
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
                'px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer',
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

              <!-- 4 Indicadores Clave (Solo jugadores con pago verificado) -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Jugadores</span>
                  <span class="font-mono font-black text-sm text-slate-900 dark:text-white">{{ jugadoresAprobados.length }} Ofic.</span>
                </div>
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Partidos</span>
                  <span class="font-mono font-black text-sm text-blue-600 dark:text-blue-400">{{ totalPartidosEstimados }} únicos</span>
                </div>
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Rondas</span>
                  <span class="font-mono font-black text-sm text-slate-900 dark:text-white">{{ totalRondasEstimadas }} Fechas</span>
                </div>
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Plazo Máx.</span>
                  <span class="font-mono font-black text-sm text-amber-600 dark:text-amber-400">48h / W.O.</span>
                </div>
              </div>
            </div>

            <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mt-2">
              <Button
                variant="primary"
                size="md"
                class="flex-1 justify-center gap-2 font-bold cursor-pointer"
                :disabled="fixtureGenerado || jugadoresAprobados.length < 2 || animandoGeneracion"
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

              <!-- Botón para Limpiar / Reiniciar Partidos -->
              <Button
                v-if="fixtureGenerado"
                variant="outline"
                size="md"
                class="w-full sm:w-auto shrink-0 justify-center gap-1.5 font-bold cursor-pointer border-rose-300 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                :disabled="limpiandoPartidos"
                title="Eliminar los partidos generados y volver a dejar el torneo listo para generar"
                @click="solicitarLimpiezaPartidos"
              >
                <RotateCcw class="w-4 h-4 text-rose-500" :class="limpiandoPartidos ? 'animate-spin' : ''" />
                <span>Limpiar Partidos</span>
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
                    <span class="text-[11px] font-bold text-amber-600 dark:text-amber-400">{{ subtituloFase2 }}</span>
                  </div>
                </div>
                <span class="text-[10px] font-black uppercase tracking-wider bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                  100% Bolsa Campeón
                </span>
              </div>

              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Toma la tabla de posiciones acumulada para armar las llaves de eliminación directa en camino hacia la Gran Final por la Corona y el 100% de la bolsa acumulada (${{ bolsaTotalCalculada.toLocaleString('es-CO') }} COP).
              </p>

              <!-- Selector Administrativo de Clasificados a Playoffs -->
              <div class="flex flex-col gap-1.5 pt-1">
                <label class="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>¿Cuántos jugadores clasifican a Eliminatorias?</span>
                  <span class="text-[10px] text-amber-700 dark:text-amber-400 font-extrabold uppercase tracking-wider">Elegido por Admin</span>
                </label>
                <div class="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  <button
                    v-for="opc in opcionesClasificados"
                    :key="opc.valor"
                    type="button"
                    :disabled="opc.deshabilitado"
                    :class="[
                      'p-2 rounded-xl text-center border transition-all flex flex-col items-center justify-center gap-0.5',
                      opc.deshabilitado
                        ? 'opacity-40 cursor-not-allowed bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700 text-slate-400'
                        : 'cursor-pointer',
                      clasificadosSeleccionados === opc.valor
                        ? 'bg-amber-50 dark:bg-amber-950/50 border-amber-500 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20 shadow-xs'
                        : 'bg-white dark:bg-slate-800 border-slate-200/80 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    ]"
                    @click="!opc.deshabilitado && cambiarClasificadosPlayoffs(opc.valor)"
                  >
                    <span class="text-xs font-black">{{ opc.label }}</span>
                    <span class="text-[9px] text-slate-400 font-medium leading-none">{{ opc.descripcion }}</span>
                  </button>
                </div>
              </div>

              <!-- 4 Indicadores Clave -->
              <div class="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-center">
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Clasifican</span>
                  <span class="font-mono font-black text-sm text-slate-900 dark:text-white">{{ clasificadosPlayoffsTexto }}</span>
                </div>
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Pase Directo</span>
                  <span class="font-mono font-black text-sm text-amber-600 dark:text-amber-400">{{ paseDirectoTexto }}</span>
                </div>
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Cruces Play-In</span>
                  <span class="font-mono font-black text-sm text-slate-900 dark:text-white">{{ crucesPlayInTexto }}</span>
                </div>
                <div class="p-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/60 dark:border-slate-700">
                  <span class="text-[10px] text-slate-400 uppercase font-bold block">Premio Único</span>
                  <span class="font-mono font-black text-sm text-amber-600 dark:text-amber-400">${{ bolsaTotalCalculada.toLocaleString('es-CO') }} COP</span>
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
              <span>{{ playoffsAbiertos ? 'Playoffs en Curso' : 'Habilitar Llaves de Eliminatorias' }}</span>
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
          <!-- Fila 1: Subfiltros de Estado y Acción de Limpieza -->
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

            <div class="flex items-center justify-between sm:justify-end gap-2.5">
              <span class="text-xs font-semibold text-slate-500 dark:text-slate-400">
                Plazo: 48h • W.O.
              </span>
              <button
                type="button"
                class="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold rounded-lg border border-rose-300 dark:border-rose-800/80 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors cursor-pointer shrink-0"
                :disabled="limpiandoPartidos"
                title="Eliminar los partidos actuales para volver a generar un fixture nuevo"
                @click="solicitarLimpiezaPartidos"
              >
                <RotateCcw class="w-3.5 h-3.5 text-rose-500" :class="limpiandoPartidos ? 'animate-spin' : ''" />
                <span>Limpiar Partidos</span>
              </button>
            </div>
          </div>

          <!-- Fila 2: Selector y Navegación de Rondas + Buscador de Participantes -->
          <div class="p-3 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col gap-2.5">
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <!-- Navegación y Salto Directo a Ronda -->
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <Calendar class="w-3.5 h-3.5 text-sky-500" />
                  Rondas / Fechas:
                </span>

                <div class="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200/80 dark:border-slate-700">
                  <button
                    type="button"
                    :disabled="rondaSeleccionada === 'todas' || rondaSeleccionada <= 1"
                    class="p-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Ronda anterior"
                    @click="irARondaAnterior"
                  >
                    <ChevronLeft class="w-4 h-4" />
                  </button>

                  <span class="text-xs font-black px-2 text-slate-900 dark:text-white select-none whitespace-nowrap">
                    {{ rondaSeleccionada === 'todas' ? 'Todas las Rondas' : `Ronda ${rondaSeleccionada} de ${rondasDisponibles.length}` }}
                  </span>

                  <button
                    type="button"
                    :disabled="rondaSeleccionada === 'todas' || rondaSeleccionada >= rondasDisponibles.length"
                    class="p-1 rounded-md text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all cursor-pointer"
                    title="Ronda siguiente"
                    @click="irARondaSiguiente"
                  >
                    <ChevronRight class="w-4 h-4" />
                  </button>
                </div>

                <!-- Botón Salto a Ronda Actual si difiere de la seleccionada -->
                <button
                  v-if="rondaSeleccionada !== rondaActual"
                  type="button"
                  class="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-1 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-300 dark:border-sky-800 hover:bg-sky-100 dark:hover:bg-sky-900/40 transition-colors cursor-pointer"
                  title="Ir a la fecha que actualmente se está jugando"
                  @click="irARondaActual"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                  <span>Ir a Ronda Actual (R{{ rondaActual }})</span>
                </button>
              </div>

              <!-- Buscador de Participante -->
              <div class="relative w-full sm:w-64">
                <Search class="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  v-model="busquedaJugador"
                  type="text"
                  placeholder="Buscar jugador..."
                  class="w-full text-xs pl-8 pr-7 py-1.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 transition-all"
                />
                <button
                  v-if="busquedaJugador"
                  type="button"
                  class="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
                  @click="busquedaJugador = ''"
                >
                  <X class="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <!-- Scrollable Pills de Rondas -->
            <div class="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none pt-0.5">
              <button
                type="button"
                :class="[
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 border',
                  rondaSeleccionada === 'todas'
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                    : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                ]"
                @click="rondaSeleccionada = 'todas'"
              >
                <span>Todas</span>
                <span class="text-[10px] font-mono opacity-80">({{ partidosTorneo.length }})</span>
              </button>

              <button
                v-for="r in rondasDisponibles"
                :key="r"
                type="button"
                :class="[
                  'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer whitespace-nowrap shrink-0 flex items-center gap-1.5 border',
                  rondaSeleccionada === r
                    ? 'bg-sky-600 text-white border-sky-600 shadow-xs'
                    : r === rondaActual
                      ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-800 dark:text-sky-300 border-sky-300 dark:border-sky-800 hover:border-sky-400'
                      : estadoRonda(r) === 'completada'
                        ? 'bg-emerald-50/70 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 border-slate-200/80 dark:border-slate-700 hover:text-slate-900 dark:hover:text-white'
                ]"
                @click="rondaSeleccionada = r"
              >
                <span>Ronda {{ r }}</span>
                <span
                  v-if="r === rondaActual"
                  class="w-1.5 h-1.5 rounded-full bg-sky-400 animate-pulse"
                  title="Ronda en curso"
                ></span>
                <span
                  v-else-if="estadoRonda(r) === 'completada'"
                  class="text-[10px] text-emerald-600 dark:text-emerald-400"
                >✓</span>
                <span class="text-[10px] font-mono opacity-70">({{ contarPartidosPorRonda(r) }})</span>
              </button>
            </div>
          </div>

          <!-- Contenedor con Scroll de Partidos Agrupados por Ronda -->
          <div class="flex flex-col gap-5 max-h-[500px] 2xl:max-h-[620px] overflow-y-auto pr-1">
            <!-- Si no hay partidos con los filtros aplicados -->
            <div
              v-if="partidosAgrupadosPorRonda.length === 0"
              class="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center gap-2"
            >
              <Search class="w-8 h-8 text-slate-400" />
              <h4 class="text-sm font-bold text-slate-800 dark:text-slate-200">
                No se encontraron partidos con los filtros seleccionados
              </h4>
              <p class="text-xs text-slate-400">
                Prueba cambiando el estado, la ronda seleccionada o limpiando el buscador.
              </p>
              <button
                type="button"
                class="mt-2 text-xs font-bold text-sky-600 dark:text-sky-400 hover:underline cursor-pointer"
                @click="filtroPartidos = 'todos'; rondaSeleccionada = 'todas'; busquedaJugador = ''"
              >
                Restablecer todos los filtros
              </button>
            </div>

            <!-- Secciones de Ronda -->
            <div
              v-for="grupo in partidosAgrupadosPorRonda"
              :key="grupo.ronda"
              class="flex flex-col gap-3"
            >
              <!-- Encabezado de la Ronda -->
              <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-slate-100/90 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80">
                <div class="flex items-center gap-2.5 flex-wrap">
                  <span class="w-6 h-6 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-black text-xs border border-sky-500/20">
                    {{ grupo.ronda }}
                  </span>
                  <div>
                    <h4 class="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider">
                      Ronda {{ grupo.ronda }} • Fecha Oficial
                    </h4>
                    <span class="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      {{ grupo.partidos.length }} enfrentamiento{{ grupo.partidos.length === 1 ? '' : 's' }} programado{{ grupo.partidos.length === 1 ? '' : 's' }}
                    </span>
                  </div>

                  <span
                    v-if="grupo.ronda === rondaActual"
                    class="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-sky-700 dark:text-sky-300 bg-sky-100/80 dark:bg-sky-950/70 px-2 py-0.5 rounded border border-sky-300 dark:border-sky-800"
                  >
                    <span class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
                    En Juego (Fecha Activa)
                  </span>

                  <span
                    v-else-if="grupo.totalPendientes === 0 && grupo.partidos.length > 0"
                    class="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100/80 dark:bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-300 dark:border-emerald-800"
                  >
                    ✓ Fecha Completada
                  </span>
                </div>

                <!-- Resumen de Métricas de la Ronda -->
                <div class="flex items-center gap-2 text-[11px] font-bold self-end sm:self-auto">
                  <span class="text-slate-500 dark:text-slate-400">
                    <strong class="text-emerald-700 dark:text-emerald-400 font-mono">{{ grupo.totalJugados }}</strong>/{{ grupo.partidos.length }} jugados
                  </span>
                  <span class="text-slate-300 dark:text-slate-700">•</span>
                  <span class="text-slate-500 dark:text-slate-400">
                    <strong class="text-slate-800 dark:text-slate-200 font-mono">{{ grupo.totalPendientes }}</strong> pendientes
                  </span>
                  <span v-if="grupo.totalEnVivo > 0" class="text-slate-300 dark:text-slate-700">•</span>
                  <span v-if="grupo.totalEnVivo > 0" class="text-sky-700 dark:text-sky-400 font-bold">
                    {{ grupo.totalEnVivo }} en vivo
                  </span>
                </div>
              </div>

              <!-- Cuadrícula de Partidos de esta Ronda -->
              <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                <div
                  v-for="(partido, idxPart) in grupo.partidos"
                  :key="partido.id"
                  class="p-3.5 sm:p-4 rounded-2xl border bg-white dark:bg-[#0f172a] transition-all flex flex-col justify-between gap-3 shadow-xs hover:border-slate-300 dark:hover:border-slate-700"
                  :class="partido.estado === 'pendiente_admin' ? 'border-amber-400/90 dark:border-amber-700 bg-amber-50/20 dark:bg-amber-950/20 ring-1 ring-amber-400/30' : 'border-slate-200/80 dark:border-slate-800'"
                >
                  <!-- Cabecera de Tarjeta: Ronda, Índice y Estado -->
                  <div class="flex items-center justify-between text-[11px] pb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <span class="font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider truncate">
                      Ronda {{ partido.ronda }} • Partido {{ idxPart + 1 }} de {{ grupo.partidos.length }}
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
                        {{ partido.jugador1?.iniciales || 'J1' }}
                      </span>
                      <span
                        class="text-xs font-bold truncate"
                        :class="busquedaJugador && partido.jugador1?.nombre?.toLowerCase().includes(busquedaJugador.toLowerCase()) ? 'text-sky-700 dark:text-sky-300 underline font-black' : 'text-slate-900 dark:text-white'"
                      >
                        {{ partido.jugador1?.nombre || 'Jugador 1' }}
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
                      <span
                        class="text-xs font-bold truncate"
                        :class="busquedaJugador && partido.jugador2?.nombre?.toLowerCase().includes(busquedaJugador.toLowerCase()) ? 'text-sky-700 dark:text-sky-300 underline font-black' : 'text-slate-900 dark:text-white'"
                      >
                        {{ partido.jugador2?.nombre || 'Jugador 2' }}
                      </span>
                      <span class="w-7 h-7 rounded-full bg-sky-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                        {{ partido.jugador2?.iniciales || 'J2' }}
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
                      (pos.posicion || index + 1) <= 4 ? 'bg-emerald-50/30 dark:bg-emerald-950/20' :
                      (pos.posicion || index + 1) <= 12 ? 'bg-sky-50/20 dark:bg-sky-950/10' : ''
                    ]"
                  >
                    <!-- Posición -->
                    <td class="py-3 px-3 text-center font-black">
                      <span
                        :class="[
                          'inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-black',
                          (pos.posicion || index + 1) === 1 ? 'bg-amber-400 text-slate-950 shadow-xs' :
                          (pos.posicion || index + 1) === 2 ? 'bg-slate-300 dark:bg-slate-600 text-slate-900 dark:text-white' :
                          (pos.posicion || index + 1) === 3 ? 'bg-amber-600 text-white' :
                          (pos.posicion || index + 1) <= 4 ? 'bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300' :
                          (pos.posicion || index + 1) <= 12 ? 'bg-sky-100 dark:bg-sky-900/60 text-sky-800 dark:text-sky-300' :
                          'text-slate-400'
                        ]"
                      >
                        {{ pos.posicion || index + 1 }}
                      </span>
                    </td>

                    <!-- Jugador (con Fondito Banner Estilo Discord para quienes tienen Título) -->
                    <td class="py-2.5 px-3">
                      <!-- Jugador CON BANNER FONDITO DISCORD GAMING -->
                      <div
                        v-if="tieneBanner(pos)"
                        class="relative overflow-hidden rounded-2xl py-2 px-3 sm:px-3.5 flex items-center justify-between gap-3 border shadow-md transition-all duration-300 group hover:scale-[1.01]"
                        :class="[
                          esInvicto(pos)
                            ? 'banner-fondito-invicto'
                            : esReyMalla(pos)
                            ? 'banner-fondito-malla'
                            : 'banner-fondito-lucha'
                        ]"
                      >
                        <!-- Acento superior luminoso estilo Discord Nitro (Specular Gloss) -->
                        <div class="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-white/60 to-transparent"></div>

                        <!-- Patrón de micro-malla carbon de fondo -->
                        <div class="absolute inset-0 banner-texture opacity-15 pointer-events-none"></div>

                        <!-- Resplandor dinámico de fondo detrás del avatar -->
                        <div
                          class="absolute -left-3 -top-3 w-24 h-24 rounded-full blur-xl pointer-events-none"
                          :class="[
                            esInvicto(pos) ? 'bg-emerald-400/25' : esReyMalla(pos) ? 'bg-amber-400/25' : 'bg-rose-400/25'
                          ]"
                        ></div>

                        <!-- Marca de agua vectorial de fondo a la derecha -->
                        <div class="absolute right-0 top-0 bottom-0 w-28 flex items-center justify-end pr-1 pointer-events-none overflow-hidden">
                          <!-- 1. Escudo para Invicto -->
                          <svg
                            v-if="esInvicto(pos)"
                            class="w-16 h-16 text-emerald-200/15 rotate-6 transform translate-x-1"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" />
                          </svg>

                          <!-- 2. Corona para Rey de la Malla -->
                          <svg
                            v-else-if="esReyMalla(pos)"
                            class="w-16 h-16 text-amber-200/15 -rotate-6 transform translate-x-1"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M5 16L3 5l5.5 5L12 4l3.5 6L21 5l-2 11H5zm14 3c0 .6-.4 1-1 1H6c-.6 0-1-.4-1-1v-1h14v1z" />
                          </svg>

                          <!-- 3. Llamas para En la Lucha -->
                          <svg
                            v-else
                            class="w-16 h-16 text-rose-200/15 rotate-6 transform translate-x-1"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M19.48 12.35c-1.57-.56-2.92-.12-3.83.65-.63-.9-1.63-1.5-2.77-1.5-1.93 0-3.5 1.57-3.5 3.5 0 .63.17 1.22.46 1.73-.78.18-1.52.54-2.14 1.05C6.1 19.06 6 20.89 6 21h12c0-.52-.16-2.61-1.78-4.22.56-.7 1.43-1.15 2.4-1.15.53 0 1.03.14 1.46.38.38-.97.94-2.69-.6-3.66z" />
                          </svg>
                        </div>

                        <!-- Avatar + Nombre + Discord Status Subtitle -->
                        <div class="relative z-10 flex items-center gap-2.5 min-w-0">
                          <!-- Avatar con aro metálico y micro-badge -->
                          <div class="relative shrink-0">
                            <div
                              class="w-7.5 h-7.5 rounded-full text-white font-black text-[10px] flex items-center justify-center shadow-md ring-2"
                              :class="[
                                esInvicto(pos)
                                  ? 'bg-gradient-to-br from-emerald-500 to-teal-800 ring-emerald-300/80 shadow-[0_0_8px_rgba(52,211,153,0.4)]'
                                  : esReyMalla(pos)
                                  ? 'bg-gradient-to-br from-amber-400 to-amber-800 ring-amber-300/80 shadow-[0_0_8px_rgba(251,191,36,0.4)]'
                                  : 'bg-gradient-to-br from-rose-500 to-rose-900 ring-rose-300/80 shadow-[0_0_8px_rgba(251,113,133,0.4)]'
                              ]"
                            >
                              {{ pos.iniciales }}
                            </div>
                            <!-- Micro badge status en esquina del avatar -->
                            <span
                              class="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full flex items-center justify-center text-[7px] text-white shadow-xs border border-slate-950 font-bold"
                              :class="[
                                esInvicto(pos) ? 'bg-emerald-500' : esReyMalla(pos) ? 'bg-amber-500' : 'bg-rose-500'
                              ]"
                            >
                              <span v-if="esInvicto(pos)">✓</span>
                              <span v-else-if="esReyMalla(pos)">👑</span>
                              <span v-else>🔥</span>
                            </span>
                          </div>

                          <div class="flex flex-col min-w-0">
                            <div class="flex items-center gap-1.5 min-w-0">
                              <span class="font-extrabold text-xs truncate text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] tracking-tight">
                                {{ pos.nombre }}
                              </span>
                              <span
                                v-if="pos.esUsuarioActual"
                                class="text-[9px] font-black px-1.5 py-0.2 rounded shrink-0 bg-white/25 text-white backdrop-blur-md border border-white/35 shadow-xs"
                              >
                                Tú
                              </span>
                            </div>

                            <!-- Subtítulo estilo Discord Status -->
                            <div class="flex items-center gap-1 text-[9px] sm:text-[10px] font-semibold leading-none mt-0.5">
                              <template v-if="esInvicto(pos)">
                                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                                <span class="text-emerald-200/90">{{ pos.pg }}V - 0D · Récord Invicto</span>
                              </template>
                              <template v-else-if="esReyMalla(pos)">
                                <span class="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                                <span class="text-amber-200/90">{{ pos.mallas || maxMallasTorneo }} mallas · Rey de la Red</span>
                              </template>
                              <template v-else>
                                <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                                <span class="text-rose-200/90">{{ pos.pp }}D · En pie de lucha</span>
                              </template>
                            </div>
                          </div>
                        </div>

                        <!-- Insignia lateral Discord Badge Chip -->
                        <div class="relative z-10 flex items-center shrink-0 pl-1.5">
                          <div
                            v-if="esInvicto(pos)"
                            class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/85 text-emerald-300 border border-emerald-400/80 shadow-[0_0_10px_rgba(16,185,129,0.35)] backdrop-blur-md"
                            title="¡Invicto! Ninguna derrota registrada en el torneo"
                          >
                            <span class="text-xs">🛡️</span>
                            <span>Invicto</span>
                          </div>

                          <div
                            v-else-if="esReyMalla(pos)"
                            class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/85 text-amber-300 border border-amber-400/80 shadow-[0_0_10px_rgba(245,158,11,0.35)] backdrop-blur-md"
                            :title="`¡Rey de la Malla! Máximo anotador con toque de red (${pos.mallas || maxMallasTorneo})`"
                          >
                            <span class="text-xs">👑</span>
                            <span>Rey Malla ({{ pos.mallas || maxMallasTorneo }})</span>
                          </div>

                          <div
                            v-else-if="esEnLucha(pos)"
                            class="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-slate-950/85 text-rose-300 border border-rose-400/80 shadow-[0_0_10px_rgba(244,63,94,0.35)] backdrop-blur-md"
                            title="Buscando su primera victoria: ¡Va con todo por la remontada!"
                          >
                            <span class="text-xs">🥊</span>
                            <span>En la Lucha</span>
                          </div>
                        </div>
                      </div>

                      <!-- Jugador REGULAR (Sin banner fondito) -->
                      <div v-else class="flex items-center gap-2.5 py-1 px-1">
                        <div class="w-7 h-7 rounded-full bg-slate-900 dark:bg-slate-700 text-white font-bold text-[10px] flex items-center justify-center shrink-0">
                          {{ pos.iniciales }}
                        </div>
                        <div class="flex items-center gap-1.5 min-w-0">
                          <span class="font-bold text-slate-900 dark:text-white truncate text-xs">{{ pos.nombre }}</span>
                          <span
                            v-if="pos.esUsuarioActual"
                            class="text-[9px] font-black px-1.5 py-0.5 rounded shrink-0 bg-emerald-600 text-white"
                          >
                            Tú
                          </span>
                        </div>
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
                        class="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md inline-block"
                        :class="obtenerClaseDestino(pos.destino, index)"
                      >
                        {{ pos.destino || obtenerDestinoPorIndice(index) }}
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
        <!-- Estado vacío si no hay inscritos en absoluto -->
        <div v-if="jugadoresTorneo.length === 0" class="p-10 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col items-center justify-center text-center gap-3">
          <div class="w-12 h-12 rounded-2xl bg-slate-200 dark:bg-slate-800 text-slate-500 flex items-center justify-center">
            <Users class="w-6 h-6" />
          </div>
          <div>
            <h4 class="text-sm font-bold text-slate-900 dark:text-white">
              Aún no hay participantes registrados
            </h4>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Las inscripciones y comprobantes de pago aparecerán aquí a medida que los jugadores se registren.
            </p>
          </div>
        </div>

        <template v-else>
          <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h4 class="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Directorio de Participantes Oficiales
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400">
                Visualización de jugadores inscritos con validación de pago.
              </p>
            </div>

            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 self-start sm:self-auto shadow-2xs">
                {{ jugadoresAprobados.length }} Jugadores con Pago Verificado (${{ (torneo?.costoInscripcion || 6000).toLocaleString('es-CO') }} COP c/u)
              </span>
            </div>
          </div>

          <!-- Sub-filtros para Inscritos & Pagos (Por defecto muestra los verificados) -->
          <div class="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700">
            <button
              type="button"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                filtroInscritos === 'aprobados'
                  ? 'bg-white dark:bg-[#0f172a] text-emerald-700 dark:text-emerald-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              ]"
              @click="filtroInscritos = 'aprobados'"
            >
              <CheckCircle2 class="w-3.5 h-3.5 text-emerald-500" />
              <span>Inscritos y Pagos Verificados ({{ jugadoresAprobados.length }})</span>
            </button>

            <button
              type="button"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                filtroInscritos === 'pendientes'
                  ? 'bg-white dark:bg-[#0f172a] text-amber-700 dark:text-amber-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              ]"
              @click="filtroInscritos = 'pendientes'"
            >
              <Clock class="w-3.5 h-3.5 text-amber-500" />
              <span>Pendientes por Verificar ({{ jugadoresPendientes.length }})</span>
            </button>

            <button
              type="button"
              :class="[
                'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
                filtroInscritos === 'todos'
                  ? 'bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              ]"
              @click="filtroInscritos = 'todos'"
            >
              <span>Todos los Registros ({{ jugadoresTorneo.length }})</span>
            </button>
          </div>

          <!-- Estado si no hay registros en la vista activa -->
          <div v-if="jugadoresFiltrados.length === 0" class="p-8 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30 text-center text-xs text-slate-500">
            <span v-if="filtroInscritos === 'aprobados'">
              Aún no hay jugadores con pago verificado en este torneo. Puedes cambiar al filtro <strong>"Pendientes por Verificar"</strong> para revisar comprobantes y admitir jugadores.
            </span>
            <span v-else-if="filtroInscritos === 'pendientes'">
              ¡Al día! No hay comprobantes pendientes de validación.
            </span>
            <span v-else>
              No se encontraron participantes.
            </span>
          </div>

          <div v-else class="border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs">
            <div class="overflow-x-auto max-h-[420px]">
              <table class="w-full text-left text-xs text-slate-600 dark:text-slate-300 min-w-[560px]">
                <thead class="bg-slate-50 dark:bg-slate-900/80 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800 sticky top-0 z-10">
                  <tr>
                    <th class="py-3.5 px-4">Jugador</th>
                    <th class="py-3.5 px-4">Tipo</th>
                    <th class="py-3.5 px-4">Teléfono</th>
                    <th class="py-3.5 px-4 text-center">Estado de Pago</th>
                    <th class="py-3.5 px-4 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  <tr v-for="jugador in jugadoresFiltrados" :key="jugador.id" class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
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
                      {{ jugador.telefono || 'Sin teléfono' }}
                    </td>
                    <td class="py-3.5 px-4 text-center">
                      <span
                        class="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full"
                        :class="jugador.pagoValidado ? 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300' : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'"
                      >
                        {{ jugador.pagoValidado ? 'Pago Aprobado' : 'Pendiente' }}
                      </span>
                    </td>
                    <td class="py-3.5 px-4 text-right">
                      <div class="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          class="px-2.5 py-1 text-xs font-bold rounded-lg bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-600 text-blue-600 hover:text-white border border-blue-200 dark:border-blue-900 transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          title="Ver y auditar comprobante bancario"
                          @click="verComprobanteJugador(jugador)"
                        >
                          <Receipt class="w-3.5 h-3.5" />
                          <span>Comprobante</span>
                        </button>

                        <button
                          v-if="!jugador.pagoValidado"
                          type="button"
                          class="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white transition-colors cursor-pointer inline-flex items-center gap-1 shadow-2xs"
                          title="Aprobar jugador para el torneo"
                          @click="aprobarJugador(jugador)"
                        >
                          <Check class="w-3.5 h-3.5" />
                          <span>Aprobar</span>
                        </button>
                        <button
                          type="button"
                          class="px-2.5 py-1 text-xs font-bold rounded-lg bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-600 text-rose-600 hover:text-white border border-rose-200 dark:border-rose-900 transition-colors cursor-pointer inline-flex items-center gap-1"
                          :title="jugador.pagoValidado ? 'Excluir del torneo' : 'Rechazar inscripción'"
                          @click="rechazarJugador(jugador)"
                        >
                          <X class="w-3.5 h-3.5" />
                          <span>Rechazar</span>
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
    </div>
  </Modal>

  <!-- Modal Auditoría de Comprobante -->
  <ModalVerComprobante
    ref="modalComprobanteRef"
    @aprobar="handleAprobarComprobante"
    @rechazar="handleRechazarComprobante"
  />

  <!-- Modal de Confirmación Estilizado para Limpiar / Reiniciar Partidos -->
  <Modal
    ref="modalConfirmarLimpiarRef"
    width="md"
    title="¿Eliminar partidos y reiniciar fixture?"
    sub-title="Acción oficial de control del torneo"
    action="Sí, eliminar y reiniciar"
    cancel="Cancelar"
    btn-action-variant="danger"
    :loading="limpiandoPartidos"
    @action="confirmarYEliminarPartidos"
  >
    <div class="space-y-3.5 py-1">
      <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-rose-800 dark:text-rose-300">
        <div class="w-9 h-9 rounded-xl bg-rose-500/15 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
          <AlertTriangle class="w-5 h-5 text-rose-600 dark:text-rose-400" />
        </div>
        <div class="text-xs space-y-1">
          <strong class="font-bold text-slate-900 dark:text-white block text-sm">Esta acción es irreversible</strong>
          <p class="text-slate-600 dark:text-slate-300 leading-relaxed">
            Se eliminarán todos los enfrentamientos programados en la base de datos y la tabla de posiciones acumulada. El torneo volverá a estado <span class="font-bold text-sky-600 dark:text-sky-400">Por Iniciar</span> y quedará completamente limpio para volver a generarlo.
          </p>
        </div>
      </div>

      <div class="p-3 bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs space-y-2 text-slate-600 dark:text-slate-300">
        <div class="flex items-center justify-between">
          <span class="text-slate-500 dark:text-slate-400">Torneo:</span>
          <strong class="text-slate-900 dark:text-white truncate max-w-[240px]">{{ torneo?.nombre }}</strong>
        </div>
        <div class="flex items-center justify-between pt-1.5 border-t border-slate-200/60 dark:border-slate-700/60">
          <span class="text-slate-500 dark:text-slate-400">Partidos a eliminar:</span>
          <span class="font-mono font-bold text-rose-600 dark:text-rose-400">{{ partidosTorneo.length }} partidos</span>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue'
import {
  Trophy,
  Crown,
  Share2,
  Users,
  Swords,
  RefreshCw,
  RotateCcw,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Gavel,
  ListOrdered,
  Check,
  X,
  Receipt,
  Search,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import ModalVerComprobante from './ModalVerComprobante.vue'
import type { Torneo, EstadoTorneo } from '@/types'
import { useAuthStore } from '@/stores/auth'
import {
  obtenerInscripcionesDB,
  obtenerPartidosDB,
  suscribirPartidosDB,
  guardarPartidosDB,
  eliminarPartidosTorneoDB,
  actualizarEstadoTorneoDB,
  actualizarEstadoInscripcionDB,
  eliminarInscripcionDB,
  actualizarClasificadosPlayoffsDB,
  obtenerTablaPosicionesDB,
  suscribirTablaPosicionesDB,
  guardarTablaPosicionesDB,
  eliminarTablaPosicionesDB,
  ordenarPartidosNumerico,
} from '@/services/torneoDatabaseService'
import {
  calcularTablaDesdePartidos,
  generarFixtureBerger,
  generarCodigoSeguridad
} from '@/services/torneoAlgoritmos'
import type { FilaPosicionOficial } from '@/types'

const props = defineProps<{
  torneo: Torneo | null
}>()

const emit = defineEmits<{
  (e: 'actualizar-estado', id: string, nuevoEstado: EstadoTorneo): void
  (e: 'abrir-resolver-partido', partido: any): void
}>()

const modalRef = ref<InstanceType<typeof Modal> | null>(null)
const tabActiva = ref<'fases' | 'partidos' | 'posiciones' | 'jugadores'>('fases')
const filtroPartidos = ref<'todos' | 'en_curso' | 'pendientes' | 'conflictos' | 'jugados'>('todos')
const rondaSeleccionada = ref<'todas' | number>(1)
const busquedaJugador = ref('')
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
const tablaPosicionesRemota = ref<FilaPosicionOficial[]>([])

// Computada para saber si la fase de grupos ya terminó
const faseGruposConcluida = computed(() => {
  if (!fixtureGenerado.value || partidosTorneo.value.length === 0) return false
  const partidosFaseRegular = partidosTorneo.value.filter(p => p.ronda || typeof p.anilloOrbital === 'undefined')
  if (partidosFaseRegular.length === 0) return false
  return partidosFaseRegular.every(p => p.estado === 'jugado' || p.jugadorGanadorId)
})

let unsubscribeAdminPartidos: (() => void) | null = null
let unsubscribeAdminTabla: (() => void) | null = null

const limpiarAdminSuscripciones = () => {
  if (unsubscribeAdminPartidos) {
    unsubscribeAdminPartidos()
    unsubscribeAdminPartidos = null
  }
  if (unsubscribeAdminTabla) {
    unsubscribeAdminTabla()
    unsubscribeAdminTabla = null
  }
}

onUnmounted(() => {
  limpiarAdminSuscripciones()
})

// Cargar datos reales y suscripciones en tiempo real del torneo desde Firestore
watch(
  () => props.torneo,
  async (torneoActual) => {
    limpiarAdminSuscripciones()
    if (!torneoActual?.id) {
      jugadoresTorneo.value = []
      partidosTorneo.value = []
      tablaPosicionesRemota.value = []
      fixtureGenerado.value = false
      return
    }

    tabActiva.value = 'fases'
    try {
      // 1. Obtener inscripciones reales del torneo desde Firestore (colección 'inscripciones')
      const inscritosDB = await obtenerInscripcionesDB(torneoActual.id)
      jugadoresTorneo.value = inscritosDB.length > 0 ? inscritosDB : []

      // 2. Suscripción en tiempo real a partidos del torneo
      unsubscribeAdminPartidos = suscribirPartidosDB(torneoActual.id, (partidosDB) => {
        if (partidosDB.length > 0) {
          const mapeados = partidosDB.map((p) => {
            if (p.estado === 'en_curso' && !p.marcador && !p.enVivo) {
              return { ...p, estado: 'pendiente' }
            }
            return p
          })
          partidosTorneo.value = ordenarPartidosNumerico(mapeados)
          fixtureGenerado.value = true
          if (rondaSeleccionada.value === 'todas' || rondaSeleccionada.value === 1) {
            rondaSeleccionada.value = rondaActual.value || 1
          }
        } else {
          partidosTorneo.value = []
          fixtureGenerado.value = torneoActual.estado === 'en curso' || torneoActual.estado === 'finalizado'
        }
      })

      // 3. Suscripción en tiempo real a la tabla oficial de posiciones
      unsubscribeAdminTabla = suscribirTablaPosicionesDB(torneoActual.id, (tablaDoc) => {
        if (tablaDoc && tablaDoc.posiciones && tablaDoc.posiciones.length > 0) {
          tablaPosicionesRemota.value = tablaDoc.posiciones
        } else {
          const aprobados = jugadoresTorneo.value.filter((j) => j.pagoValidado)
          if (aprobados.length > 0 && partidosTorneo.value.length > 0) {
            const calculada = calcularTablaDesdePartidos(
              aprobados,
              partidosTorneo.value,
              clasificadosSeleccionados.value,
            )
            tablaPosicionesRemota.value = calculada
          } else {
            tablaPosicionesRemota.value = []
          }
        }
      })
    } catch (e) {
      console.warn('Error al recuperar datos del torneo desde Firestore:', e)
      jugadoresTorneo.value = []
      partidosTorneo.value = []
      tablaPosicionesRemota.value = []
      fixtureGenerado.value = false
    }
  },
  { immediate: true }
)

// Pestañas dinámicas con conteo de inscritos oficial
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
    badge: jugadoresAprobados.value.length > 0 ? `${jugadoresAprobados.value.length}` : undefined,
    bloqueado: false,
  },
])

// Cálculos y Participantes Aprobados
const jugadoresAprobados = computed(() => jugadoresTorneo.value.filter(j => j.pagoValidado))
const jugadoresPendientes = computed(() => jugadoresTorneo.value.filter(j => !j.pagoValidado))
const filtroInscritos = ref<'aprobados' | 'pendientes' | 'todos'>('aprobados')
const jugadoresFiltrados = computed(() => {
  if (filtroInscritos.value === 'aprobados') return jugadoresAprobados.value
  if (filtroInscritos.value === 'pendientes') return jugadoresPendientes.value
  return jugadoresTorneo.value
})

const limpiandoPartidos = ref(false)

const clasificadosSeleccionados = ref<number>(props.torneo?.clasificadosPlayoffs || 4)

watch(
  () => props.torneo?.clasificadosPlayoffs,
  (val) => {
    if (val) clasificadosSeleccionados.value = val
  }
)

const opcionesClasificados = computed(() => {
  const n = jugadoresAprobados.value.length
  return [
    { valor: 12, label: 'Top 12', descripcion: 'Play-In + Cuartos', deshabilitado: n < 12 },
    { valor: 8, label: 'Top 8', descripcion: 'Cuartos completos', deshabilitado: n < 8 },
    { valor: 6, label: 'Top 6', descripcion: 'Cuartos (BYE) + Semis', deshabilitado: n < 6 },
    { valor: 4, label: 'Top 4', descripcion: 'Semis + Gran Final', deshabilitado: n < 4 },
    { valor: 2, label: 'Top 2', descripcion: 'Gran Final directa', deshabilitado: n < 2 },
  ]
})

const subtituloFase2 = computed(() => {
  const c = clasificadosSeleccionados.value
  if (c === 12) return 'Play-In + Cuartos de Final'
  if (c === 8) return 'Cuartos de Final Completos'
  if (c === 6) return 'Cuartos (BYE) + Semifinales'
  if (c === 4) return 'Semifinales + Gran Final'
  if (c === 2) return 'Gran Final Directa'
  return 'Play-In + Cuartos de Final'
})

const obtenerDestinoPorIndice = (idx: number): string => {
  const c = clasificadosSeleccionados.value
  const pos = idx + 1
  if (c === 2) return pos <= 2 ? 'Gran Final' : 'Fase Regular'
  if (c === 4) return pos <= 4 ? 'Semifinales' : 'Fase Regular'
  if (c === 6) {
    if (pos <= 2) return 'Semis (BYE)'
    if (pos <= 6) return 'Cuartos'
    return 'Fase Regular'
  }
  if (c === 8) return pos <= 8 ? 'Cuartos de Final' : 'Fase Regular'
  if (pos <= 4) return 'Cuartos (BYE)'
  if (pos <= 12) return 'Play-In'
  return 'Fase Regular'
}

const obtenerClaseDestino = (destino?: string, idx: number = 0): string => {
  const d = destino || obtenerDestinoPorIndice(idx)
  if (d.includes('BYE') || d === 'Gran Final') {
    return 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 font-black'
  }
  if (d === 'Play-In' || d.includes('Cuartos') || d.includes('Semifinales')) {
    return 'bg-sky-100 dark:bg-sky-950/80 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 font-black'
  }
  return 'text-slate-400 dark:text-slate-500 font-bold border-transparent'
}

const cambiarClasificadosPlayoffs = async (valor: number) => {
  clasificadosSeleccionados.value = valor
  if (props.torneo?.id) {
    await actualizarClasificadosPlayoffsDB(props.torneo.id, valor)
    const tablaActualizada = calcularTablaDesdePartidos(
      jugadoresAprobados.value,
      partidosTorneo.value,
      valor,
    )
    tablaPosicionesRemota.value = tablaActualizada
    await guardarTablaPosicionesDB(props.torneo.id, tablaActualizada)
    mensajeEstado.value = `¡Formato de Playoffs actualizado! Clasifican Top ${valor}.`
    setTimeout(() => { mensajeEstado.value = '' }, 3500)
  }
}

const clasificadosPlayoffsTexto = computed(() => {
  return `Top ${clasificadosSeleccionados.value}`
})

const paseDirectoTexto = computed(() => {
  const c = clasificadosSeleccionados.value
  if (c === 6) return 'Top 1 y 2 (BYE)'
  if (c === 12) return 'Top 1 al 4 (BYE)'
  return 'N/A'
})

const crucesPlayInTexto = computed(() => {
  const c = clasificadosSeleccionados.value
  if (c === 2) return 'Final única'
  if (c === 4) return 'Semis (2 llaves)'
  if (c === 6) return 'Cuartos (2 llaves)'
  if (c === 8) return 'Cuartos (4 llaves)'
  if (c === 12) return 'Play-In (4 llaves)'
  return 'Play-In (4 llaves)'
})

const bolsaTotalCalculada = computed(() => {
  return jugadoresAprobados.value.length * (props.torneo?.costoInscripcion || 6000)
})

const totalPartidosEstimados = computed(() => {
  const n = jugadoresAprobados.value.length
  if (n < 2) return 0
  return (n * (n - 1)) / 2
})

const totalRondasEstimadas = computed(() => {
  const n = jugadoresAprobados.value.length
  if (n < 2) return 0
  return n % 2 === 0 ? n - 1 : n
})

const faseActualTexto = computed(() => {
  if (props.torneo?.estado === 'por iniciar') return 'Fase de Convocatoria y Validación de Pagos ($6.000 COP)'
  if (props.torneo?.estado === 'en curso') return 'Fase 1 Activa: Todos contra Todos (Round Robin) con plazos de 48h'
  return 'Torneo Clausurado • 100% de la Bolsa entregada al Campeón'
})

// Rondas disponibles calculadas numéricamente
const rondasDisponibles = computed<number[]>(() => {
  if (partidosTorneo.value.length === 0) {
    const n = totalRondasEstimadas.value
    return n > 0 ? Array.from({ length: n }, (_, i) => i + 1) : [1]
  }
  const setRondas = new Set<number>()
  partidosTorneo.value.forEach((p) => {
    const r = Number(p.ronda || p.jornada)
    if (r && !isNaN(r)) setRondas.add(r)
  })
  const arr = Array.from(setRondas).sort((a, b) => a - b)
  return arr.length > 0 ? arr : [1]
})

// Ronda activa/en curso (la primera con partidos pendientes o en vivo)
const rondaActual = computed<number>(() => {
  if (partidosTorneo.value.length === 0) return 1
  for (const r of rondasDisponibles.value) {
    const partidosDeRonda = partidosTorneo.value.filter(
      (p) => Number(p.ronda || p.jornada) === r
    )
    const tienePendientes = partidosDeRonda.some(
      (p) => p.estado !== 'jugado' && !p.marcador
    )
    if (tienePendientes) return r
  }
  return rondasDisponibles.value[rondasDisponibles.value.length - 1] || 1
})

// Acciones de navegación de rondas
const irARondaAnterior = () => {
  if (rondaSeleccionada.value === 'todas') {
    rondaSeleccionada.value = 1
    return
  }
  const idx = rondasDisponibles.value.indexOf(rondaSeleccionada.value)
  if (idx > 0) {
    const previa = rondasDisponibles.value[idx - 1]
    if (typeof previa === 'number') {
      rondaSeleccionada.value = previa
    }
  }
}

const irARondaSiguiente = () => {
  if (rondaSeleccionada.value === 'todas') {
    rondaSeleccionada.value = 1
    return
  }
  const idx = rondasDisponibles.value.indexOf(rondaSeleccionada.value)
  if (idx >= 0 && idx < rondasDisponibles.value.length - 1) {
    const siguiente = rondasDisponibles.value[idx + 1]
    if (typeof siguiente === 'number') {
      rondaSeleccionada.value = siguiente
    }
  }
}

const irARondaActual = () => {
  rondaSeleccionada.value = rondaActual.value
}

const contarPartidosPorRonda = (ronda: number) => {
  return partidosTorneo.value.filter((p) => Number(p.ronda || p.jornada) === ronda).length
}

const estadoRonda = (ronda: number): 'completada' | 'en_curso' | 'pendiente' => {
  const pts = partidosTorneo.value.filter((p) => Number(p.ronda || p.jornada) === ronda)
  if (pts.length === 0) return 'pendiente'
  const todosJugados = pts.every((p) => p.estado === 'jugado')
  if (todosJugados) return 'completada'
  const algunoIniciado = pts.some((p) => p.estado === 'en_curso' || p.estado === 'jugado')
  if (algunoIniciado || ronda === rondaActual.value) return 'en_curso'
  return 'pendiente'
}

const partidosFiltrados = computed(() => {
  let lista = [...partidosTorneo.value]

  // 1. Filtro por estado
  if (filtroPartidos.value === 'en_curso') {
    lista = lista.filter((p) => p.estado === 'en_curso' && (p.marcador || p.enVivo))
  } else if (filtroPartidos.value === 'pendientes') {
    lista = lista.filter((p) => p.estado === 'pendiente' || (p.estado === 'en_curso' && !p.marcador && !p.enVivo))
  } else if (filtroPartidos.value === 'conflictos') {
    lista = lista.filter((p) => p.estado === 'pendiente_admin')
  } else if (filtroPartidos.value === 'jugados') {
    lista = lista.filter((p) => p.estado === 'jugado')
  }

  // 2. Filtro por ronda (si no es 'todas')
  if (rondaSeleccionada.value !== 'todas') {
    lista = lista.filter((p) => Number(p.ronda || p.jornada) === rondaSeleccionada.value)
  }

  // 3. Filtro de búsqueda por participante
  if (busquedaJugador.value.trim()) {
    const q = busquedaJugador.value.trim().toLowerCase()
    lista = lista.filter((p) => {
      const n1 = (p.jugador1?.nombre || '').toLowerCase()
      const n2 = (p.jugador2?.nombre || '').toLowerCase()
      return n1.includes(q) || n2.includes(q)
    })
  }

  return ordenarPartidosNumerico(lista)
})

interface GrupoRonda {
  ronda: number
  partidos: any[]
  totalJugados: number
  totalPendientes: number
  totalEnVivo: number
}

const partidosAgrupadosPorRonda = computed<GrupoRonda[]>(() => {
  const mapa = new Map<number, any[]>()
  for (const p of partidosFiltrados.value) {
    const r = Number(p.ronda || p.jornada || 1)
    if (!mapa.has(r)) mapa.set(r, [])
    mapa.get(r)!.push(p)
  }

  const grupos: GrupoRonda[] = []
  const rondasOrdenadas = Array.from(mapa.keys()).sort((a, b) => a - b)
  for (const r of rondasOrdenadas) {
    const pts = mapa.get(r) || []
    grupos.push({
      ronda: r,
      partidos: pts,
      totalJugados: pts.filter((p) => p.estado === 'jugado').length,
      totalPendientes: pts.filter(
        (p) => p.estado === 'pendiente' || (p.estado === 'en_curso' && !p.marcador && !p.enVivo)
      ).length,
      totalEnVivo: pts.filter((p) => p.estado === 'en_curso' && (p.marcador || p.enVivo)).length,
    })
  }
  return grupos
})

const contarPartidosPorTipo = (tipo: string) => {
  if (tipo === 'todos') return partidosTorneo.value.length
  if (tipo === 'en_curso') return partidosTorneo.value.filter(p => p.estado === 'en_curso' && (p.marcador || p.enVivo)).length
  if (tipo === 'pendientes') return partidosTorneo.value.filter(p => p.estado === 'pendiente' || (p.estado === 'en_curso' && !p.marcador && !p.enVivo)).length
  if (tipo === 'conflictos') return partidosTorneo.value.filter(p => p.estado === 'pendiente_admin').length
  if (tipo === 'jugados') return partidosTorneo.value.filter(p => p.estado === 'jugado').length
  return 0
}

// Tabla de posiciones oficial calculada reactivamente desde los partidos reales disputados
const posicionesTorneo = computed<FilaPosicionOficial[]>(() => {
  if (jugadoresAprobados.value.length > 0 && partidosTorneo.value.length > 0) {
    return calcularTablaDesdePartidos(
      jugadoresAprobados.value,
      partidosTorneo.value,
      clasificadosSeleccionados.value,
    )
  }
  if (tablaPosicionesRemota.value && tablaPosicionesRemota.value.length > 0) {
    return tablaPosicionesRemota.value
  }
  return []
})

// Lógica de Banners / Fonditos Discord Oficiales del Torneo
const maxMallasTorneo = computed(() => {
  let max = 0
  posicionesTorneo.value.forEach((p) => {
    const m = p.mallas || 0
    if (m > max) max = m
  })
  return max
})

const maxPJTorneo = computed(() => {
  let max = 0
  posicionesTorneo.value.forEach((p) => {
    if (p.pj > max) max = p.pj
  })
  return max
})

// Mínimo de partidos para calificar a Invicto o En la Lucha:
// Si alguien ya jugó 2 o más partidos en el torneo, se exige al menos 2 partidos jugados.
const minPJParaInvicto = computed(() => {
  return maxPJTorneo.value >= 2 ? 2 : 1
})

const esInvicto = (pos: FilaPosicionOficial) => {
  return pos.pj >= minPJParaInvicto.value && pos.pp === 0
}

const esReyMalla = (pos: FilaPosicionOficial) => {
  return !esInvicto(pos) && maxMallasTorneo.value > 0 && (pos.mallas || 0) === maxMallasTorneo.value
}

const esEnLucha = (pos: FilaPosicionOficial) => {
  return !esInvicto(pos) && !esReyMalla(pos) && pos.pj >= minPJParaInvicto.value && pos.pg === 0
}

const tieneBanner = (pos: FilaPosicionOficial) => esInvicto(pos) || esReyMalla(pos) || esEnLucha(pos)

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

// Acciones para admitir o rechazar jugadores del torneo
const aprobarJugador = async (jugador: any) => {
  try {
    await actualizarEstadoInscripcionDB(jugador.id, true, 'INSCRITO')
    jugador.pagoValidado = true
    jugador.subestado = 'INSCRITO'
    mensajeEstado.value = `¡Jugador ${jugador.nombre} aprobado! Ya está admitido en el torneo.`
    setTimeout(() => {
      mensajeEstado.value = ''
    }, 4000)
  } catch (error) {
    console.error('Error al aprobar jugador:', error)
  }
}

const rechazarJugador = async (jugador: any) => {
  try {
    await eliminarInscripcionDB(jugador.id)
    jugadoresTorneo.value = jugadoresTorneo.value.filter((j) => j.id !== jugador.id)
    mensajeEstado.value = `Inscripción de ${jugador.nombre} rechazada y removida del torneo.`
    setTimeout(() => {
      mensajeEstado.value = ''
    }, 4000)
  } catch (error) {
    console.error('Error al rechazar jugador:', error)
  }
}

// Auditoría y Verificación de Comprobante
const modalComprobanteRef = ref()

const verComprobanteJugador = (jugador: any) => {
  modalComprobanteRef.value?.open({
    id: jugador.id,
    jugadorNombre: jugador.nombre,
    jugadorTelefono: jugador.telefono,
    torneoNombre: props.torneo?.nombre || 'Torneo Ping Pong',
    monto: props.torneo?.costoInscripcion || 6000,
    referencia: jugador.referencia || `TRX-${(jugador.id || '').substring(0, 8).toUpperCase()}`,
    cuentaDestino: props.torneo?.numeroCuenta || '',
    tipoCuenta: props.torneo?.tipoCuenta || 'ahorros',
    pagoValidado: jugador.pagoValidado,
    banco: jugador.banco || 'nequi',
    comprobanteUrl: jugador.comprobanteUrl || null,
  })
}

const handleAprobarComprobante = (id: string) => {
  const jugador = jugadoresTorneo.value.find(j => j.id === id)
  if (jugador) {
    aprobarJugador(jugador)
  }
}

const handleRechazarComprobante = (id: string) => {
  const jugador = jugadoresTorneo.value.find(j => j.id === id)
  if (jugador) {
    rechazarJugador(jugador)
  }
}


const modalConfirmarLimpiarRef = ref<InstanceType<typeof Modal> | null>(null)

// Limpieza y Reinicio de Partidos Generados (Modal estilizado sin alertas nativas)
const solicitarLimpiezaPartidos = () => {
  modalConfirmarLimpiarRef.value?.open()
}

const confirmarYEliminarPartidos = async () => {
  if (!props.torneo?.id) return

  limpiandoPartidos.value = true
  try {
    await eliminarPartidosTorneoDB(props.torneo.id)
    await eliminarTablaPosicionesDB(props.torneo.id)
    await actualizarEstadoTorneoDB(props.torneo.id, 'por iniciar')
    emit('actualizar-estado', props.torneo.id, 'por iniciar')

    partidosTorneo.value = []
    tablaPosicionesRemota.value = []
    fixtureGenerado.value = false
    playoffsAbiertos.value = false

    modalConfirmarLimpiarRef.value?.close()

    mensajeEstado.value = '¡Partidos eliminados correctamente! El torneo ha quedado limpio y listo para generar nuevo fixture.'
    setTimeout(() => {
      mensajeEstado.value = ''
    }, 5000)
  } catch (err) {
    console.error('Error al limpiar partidos:', err)
  } finally {
    limpiandoPartidos.value = false
  }
}

// Generación Oficial de Partidos (Transición obligatoria a Fase 1: En Curso)
const generarPartidos = async () => {
  const participantes = jugadoresAprobados.value.filter(j => j.pagoValidado === true && j.subestado !== 'PENDIENTE')
  if (participantes.length < 2) {
    mensajeEstado.value = 'Se requieren al menos 2 jugadores con pago verificado para generar los partidos.'
    setTimeout(() => { mensajeEstado.value = '' }, 4000)
    return
  }

  animandoGeneracion.value = true
  setTimeout(async () => {
    animandoGeneracion.value = false
    fixtureGenerado.value = true

    // Generar fixture de enfrentamientos con Algoritmo Berger (rondas y partidos simultáneos)
    const fixtureBerger = generarFixtureBerger(participantes)
    const listaPartidosGenerados = fixtureBerger.map((item, idx) => {
      const numPartido = idx + 1
      const numPadded = String(numPartido).padStart(4, '0')
      const j1Id = item.jugador1.jugadorId || item.jugador1.id || `J1-${idx}`
      const j2Id = item.jugador2.jugadorId || item.jugador2.id || `J2-${idx}`
      return {
        id: `p-${props.torneo?.id || 'torneo'}-${numPadded}`,
        numeroPartido: numPartido,
        torneoId: props.torneo?.id,
        ronda: item.ronda,
        jornada: item.ronda,
        jugador1Id: j1Id,
        jugador2Id: j2Id,
        jugador1: {
          id: j1Id,
          nombre: item.jugador1.nombre || 'Jugador 1',
          iniciales: item.jugador1.iniciales || item.jugador1.nombre?.substring(0, 2).toUpperCase() || 'J1',
          foto: (item.jugador1 as any).foto || null,
        },
        jugador2: {
          id: j2Id,
          nombre: item.jugador2.nombre || 'Jugador 2',
          iniciales: item.jugador2.iniciales || item.jugador2.nombre?.substring(0, 2).toUpperCase() || 'J2',
          foto: (item.jugador2 as any).foto || null,
        },
        estado: 'pendiente',
        diasRestantes: 2,
        marcador: null,
        marcadorDetallado: null,
        codigoJugador1: generarCodigoSeguridad(j1Id, j2Id),
        codigoJugador2: generarCodigoSeguridad(j2Id, j1Id),
      }
    })

    partidosTorneo.value = ordenarPartidosNumerico(listaPartidosGenerados)
    rondaSeleccionada.value = 1

    // Generar tabla inicial en la nueva colección independiente 'tablas_posiciones'
    const tablaInicial = calcularTablaDesdePartidos(
      participantes,
      listaPartidosGenerados,
      clasificadosSeleccionados.value,
    )
    tablaPosicionesRemota.value = tablaInicial

    // Persistir en Firestore en sus respectivas colecciones dedicadas
    try {
      await guardarPartidosDB(listaPartidosGenerados)
      if (props.torneo?.id) {
        await guardarTablaPosicionesDB(props.torneo.id, tablaInicial, 0)
      }
    } catch (err) {
      console.warn('Error al guardar partidos y tabla en base de datos:', err)
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
  mensajeEstado.value = '¡Cuadro de Playoffs habilitado para los clasificados de la fase regular!'
  setTimeout(() => {
    mensajeEstado.value = ''
  }, 5000)
}

const resolverPartido = (partido: any) => {
  emit('abrir-resolver-partido', partido)
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

<style scoped>
/* Discord-style Tournament Gaming Banners - Rich Nitro Aesthetics */
.banner-texture {
  background-image: radial-gradient(rgba(255, 255, 255, 0.22) 1px, transparent 1px);
  background-size: 8px 8px;
}

.banner-fondito-invicto {
  background: 
    radial-gradient(circle at 10% 50%, rgba(16, 185, 129, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 90% 50%, rgba(20, 184, 166, 0.3) 0%, transparent 60%),
    linear-gradient(135deg, #064e3b 0%, #065f46 25%, #0f766e 60%, #0f172a 100%);
  border: 1px solid rgba(52, 211, 153, 0.65);
  box-shadow: 
    0 4px 16px -2px rgba(16, 185, 129, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 0 12px rgba(16, 185, 129, 0.15);
}

.banner-fondito-malla {
  background: 
    radial-gradient(circle at 10% 50%, rgba(245, 158, 11, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 90% 50%, rgba(217, 119, 6, 0.3) 0%, transparent 60%),
    linear-gradient(135deg, #78350f 0%, #92400e 25%, #b45309 60%, #1c1917 100%);
  border: 1px solid rgba(251, 191, 36, 0.7);
  box-shadow: 
    0 4px 16px -2px rgba(245, 158, 11, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.35),
    inset 0 0 12px rgba(245, 158, 11, 0.15);
}

.banner-fondito-lucha {
  background: 
    radial-gradient(circle at 10% 50%, rgba(244, 63, 94, 0.4) 0%, transparent 50%),
    radial-gradient(circle at 90% 50%, rgba(225, 29, 72, 0.3) 0%, transparent 60%),
    linear-gradient(135deg, #881337 0%, #9f1239 25%, #be123c 60%, #1e112a 100%);
  border: 1px solid rgba(251, 113, 133, 0.65);
  box-shadow: 
    0 4px 16px -2px rgba(244, 63, 94, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.3),
    inset 0 0 12px rgba(244, 63, 94, 0.15);
}
</style>

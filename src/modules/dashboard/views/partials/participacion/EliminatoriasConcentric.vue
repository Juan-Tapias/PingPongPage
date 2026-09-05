<template>
  <div class="flex flex-col gap-6 w-full animate-in fade-in duration-200">

    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
      <div class="flex items-start sm:items-center gap-3.5">
        <div class="w-11 h-11 rounded-xl bg-amber-50 border border-amber-200/80 text-amber-600 flex items-center justify-center shrink-0 shadow-xs">
          <Crown class="w-6 h-6" />
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h3 class="text-base sm:text-lg font-black text-slate-900 font-heading tracking-tight">
              Cuadro Oficial de Eliminatorias (Playoffs)
            </h3>
            <span class="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-amber-100 text-amber-800 border border-amber-200">
              Fase 2 • Eliminación Directa
            </span>
          </div>
          <p class="text-xs text-slate-500 mt-0.5">
            Top 4 clasificados con pase directo (BYE) a Cuartos • Puestos 5° al 12° disputan el Play-In
          </p>
        </div>
      </div>

      <!-- Tarjeta de Bolsa y Conmutador de Modo -->
      <div class="flex flex-wrap items-center gap-3">
        <!-- Bolsa Acumulada $90.000 COP -->
        <div class="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900">
          <Trophy class="w-4 h-4 text-amber-600 shrink-0" />
          <div class="flex flex-col">
            <span class="text-[9px] font-black uppercase tracking-wider text-amber-700">Premio Acumulado</span>
            <span class="text-xs font-black font-mono text-amber-950">
              ${{ playoffs.bolsaPremio.toLocaleString('es-CO') }} COP
            </span>
          </div>
          <span class="text-[9px] font-extrabold bg-amber-200/70 text-amber-900 px-1.5 py-0.5 rounded ml-1">
            100% Ganador
          </span>
        </div>

        <!-- Conmutador: Todas las llaves vs Mi Camino -->
        <div class="flex items-center p-1 bg-slate-100 rounded-xl border border-slate-200/80">
          <button
            type="button"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
              modoVista === 'completo'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            ]"
            @click="modoVista = 'completo'"
          >
            <Sparkles class="w-3.5 h-3.5 text-amber-500" />
            <span>Todas las llaves</span>
          </button>

          <button
            type="button"
            :class="[
              'px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
              modoVista === 'mi-camino'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            ]"
            @click="modoVista = 'mi-camino'"
          >
            <Compass class="w-3.5 h-3.5" />
            <span>Mi Camino</span>
          </button>
        </div>
      </div>
    </div>

    <!-- SELECTOR DE RONDAS PARA MÓVIL (Pills) -->
    <div class="flex lg:hidden items-center gap-2 overflow-x-auto pb-1">
      <button
        v-for="ronda in rondasNavegacion"
        :key="ronda.id"
        type="button"
        :class="[
          'px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all cursor-pointer',
          rondaMovilActiva === ronda.id
            ? 'bg-slate-900 text-white shadow-xs'
            : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
        ]"
        @click="rondaMovilActiva = ronda.id"
      >
        {{ ronda.nombre }} ({{ ronda.cantidad }})
      </button>
    </div>

    <!-- ============================================== -->
    <!-- CUADRO DE LLAVES / BRACKET CLARO Y ESTRUCTURADO -->
    <!-- ============================================== -->
    <div class="w-full bg-slate-50/70 rounded-2xl border border-slate-200/80 p-4 sm:p-6 overflow-x-auto shadow-xs">
      <div class="min-w-280 flex items-start gap-5 lg:gap-6 justify-between">
        <!-- ========================================== -->
        <!-- COLUMNA 1: PLAY-IN (Puestos 5 al 12) -->
        <!-- ========================================== -->
        <div
          :class="[
            'flex-1 flex flex-col gap-4 transition-all duration-200',
            rondaMovilActiva !== 'todas' && rondaMovilActiva !== 'play_in' ? 'hidden lg:flex' : 'flex'
          ]"
        >
          <!-- Encabezado de Ronda -->
          <div class="flex flex-col gap-1 pb-2 border-b border-slate-200">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider text-slate-800">
                1. Play-In (Repechaje)
              </span>
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-200/80 text-slate-700">
                4 Llaves
              </span>
            </div>
            <p class="text-[11px] text-slate-500">
              Puestos 5° al 12° de la fase regular
            </p>
          </div>

          <!-- Tarjetas de Partidos Play-In -->
          <div class="flex flex-col gap-4">
            <div
              v-for="partido in playoffs.partidosPlayIn.value"
              :key="partido.id"
              :class="[
                'group relative rounded-xl border p-3.5 transition-all duration-200 cursor-pointer shadow-2xs',
                obtenerEstiloTarjeta(partido)
              ]"
              @click="abrirDetallePartido(partido)"
            >
              <!-- Cabecera de Llave -->
              <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[10px] font-extrabold">
                <span class="text-slate-500 uppercase">
                  Llave {{ partido.numeroLlave }}
                </span>
                <span :class="obtenerClaseBadgeEstado(partido.estado)">
                  {{ formatearEstado(partido.estado) }}
                </span>
              </div>

              <!-- Jugador 1 (Mejor Semilla) -->
              <div class="flex items-center justify-between gap-2 py-1.5">
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    :class="[
                      'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0',
                      partido.jugador1?.esUsuarioActual ? 'bg-emerald-700' : 'bg-slate-700'
                    ]"
                  >
                    {{ partido.jugador1?.iniciales || '?' }}
                  </div>
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span
                      class="text-xs font-bold truncate"
                      :class="partido.jugador1?.esUsuarioActual ? 'text-emerald-950 font-black' : 'text-slate-800'"
                    >
                      {{ partido.jugador1?.nombre || 'Por definir' }}
                    </span>
                    <span class="text-[9px] font-black px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0">
                      #{{ obtenerSemilla(partido.jugador1?.id) }}
                    </span>
                    <span
                      v-if="partido.jugador1?.esUsuarioActual"
                      class="text-[9px] font-black bg-emerald-700 text-white px-1.5 py-0.2 rounded shrink-0"
                    >
                      Tú
                    </span>
                  </div>
                </div>

                <span
                  class="font-mono text-xs font-black shrink-0 px-2 py-0.5 rounded"
                  :class="partido.ganadorId === partido.jugador1?.id ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'"
                >
                  {{ obtenerScoreJugador(partido, 1) }}
                </span>
              </div>

              <!-- Separador VS -->
              <div class="h-px w-full bg-slate-100 my-1"></div>

              <!-- Jugador 2 -->
              <div class="flex items-center justify-between gap-2 py-1.5">
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    :class="[
                      'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0',
                      partido.jugador2?.esUsuarioActual ? 'bg-emerald-700' : 'bg-slate-700'
                    ]"
                  >
                    {{ partido.jugador2?.iniciales || '?' }}
                  </div>
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span
                      class="text-xs font-bold truncate"
                      :class="partido.jugador2?.esUsuarioActual ? 'text-emerald-950 font-black' : 'text-slate-800'"
                    >
                      {{ partido.jugador2?.nombre || 'Por definir' }}
                    </span>
                    <span class="text-[9px] font-black px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0">
                      #{{ obtenerSemilla(partido.jugador2?.id) }}
                    </span>
                    <span
                      v-if="partido.jugador2?.esUsuarioActual"
                      class="text-[9px] font-black bg-emerald-700 text-white px-1.5 py-0.2 rounded shrink-0"
                    >
                      Tú
                    </span>
                  </div>
                </div>

                <span
                  class="font-mono text-xs font-black shrink-0 px-2 py-0.5 rounded"
                  :class="partido.ganadorId === partido.jugador2?.id ? 'text-emerald-700 bg-emerald-50' : 'text-slate-600'"
                >
                  {{ obtenerScoreJugador(partido, 2) }}
                </span>
              </div>

              <!-- Destino de avance -->
              <div class="mt-2 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>Avanza a Cuartos {{ partido.numeroLlave }}</span>
                <ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- COLUMNA 2: CUARTOS DE FINAL (Top 1-4 BYE) -->
        <!-- ========================================== -->
        <div
          :class="[
            'flex-1 flex flex-col gap-4 transition-all duration-200',
            rondaMovilActiva !== 'todas' && rondaMovilActiva !== 'cuartos' ? 'hidden lg:flex' : 'flex'
          ]"
        >
          <!-- Encabezado de Ronda -->
          <div class="flex flex-col gap-1 pb-2 border-b border-slate-200">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider text-sky-900">
                2. Cuartos de Final
              </span>
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-sky-100 text-sky-800">
                Top 4 BYE
              </span>
            </div>
            <p class="text-[11px] text-slate-500">
              Puestos 1° al 4° esperan a los ganadores
            </p>
          </div>

          <!-- Tarjetas de Partidos Cuartos -->
          <div class="flex flex-col gap-4">
            <div
              v-for="partido in playoffs.partidosCuartos.value"
              :key="partido.id"
              :class="[
                'group relative rounded-xl border p-3.5 transition-all duration-200 cursor-pointer shadow-2xs',
                obtenerEstiloTarjeta(partido)
              ]"
              @click="abrirDetallePartido(partido)"
            >
              <!-- Cabecera de Llave -->
              <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[10px] font-extrabold">
                <span class="text-sky-800 uppercase">
                  Cuartos {{ partido.numeroLlave }}
                </span>
                <span :class="obtenerClaseBadgeEstado(partido.estado)">
                  {{ formatearEstado(partido.estado) }}
                </span>
              </div>

              <!-- Jugador 1 (Top 1 al 4 con BYE) -->
              <div class="flex items-center justify-between gap-2 py-1.5">
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    :class="[
                      'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0',
                      partido.jugador1?.esUsuarioActual ? 'bg-emerald-700' : 'bg-sky-800'
                    ]"
                  >
                    {{ partido.jugador1?.iniciales || '?' }}
                  </div>
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span
                      class="text-xs font-bold truncate"
                      :class="partido.jugador1?.esUsuarioActual ? 'text-emerald-950 font-black' : 'text-slate-800'"
                    >
                      {{ partido.jugador1?.nombre || 'Por definir' }}
                    </span>
                    <span class="text-[9px] font-black px-1.5 py-0.2 rounded bg-sky-50 text-sky-700 border border-sky-200/60 shrink-0">
                      Top {{ obtenerSemilla(partido.jugador1?.id) }} (BYE)
                    </span>
                  </div>
                </div>

                <span class="font-mono text-xs font-black shrink-0 px-2 py-0.5 rounded text-slate-500">
                  {{ obtenerScoreJugador(partido, 1) }}
                </span>
              </div>

              <!-- Separador VS -->
              <div class="h-px w-full bg-slate-100 my-1"></div>

              <!-- Jugador 2 (Ganador Play-In) -->
              <div class="flex items-center justify-between gap-2 py-1.5">
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    :class="[
                      'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0',
                      partido.jugador2 ? 'bg-slate-700' : 'bg-slate-300 text-slate-600'
                    ]"
                  >
                    {{ partido.jugador2?.iniciales || '?' }}
                  </div>
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span
                      class="text-xs font-bold truncate"
                      :class="partido.jugador2 ? 'text-slate-800' : 'text-slate-400 italic'"
                    >
                      {{ partido.jugador2?.nombre || `Ganador Llave ${partido.numeroLlave}` }}
                    </span>
                    <span
                      v-if="partido.jugador2"
                      class="text-[9px] font-black px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 shrink-0"
                    >
                      #{{ obtenerSemilla(partido.jugador2?.id) }}
                    </span>
                  </div>
                </div>

                <span class="font-mono text-xs font-black shrink-0 px-2 py-0.5 rounded text-slate-500">
                  {{ obtenerScoreJugador(partido, 2) }}
                </span>
              </div>

              <!-- Destino de avance -->
              <div class="mt-2 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px] text-slate-400">
                <span>Avanza a Semifinal</span>
                <ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- COLUMNA 3: SEMIFINALES -->
        <!-- ========================================== -->
        <div
          :class="[
            'flex-1 flex flex-col gap-4 transition-all duration-200',
            rondaMovilActiva !== 'todas' && rondaMovilActiva !== 'semifinal' ? 'hidden lg:flex' : 'flex'
          ]"
        >
          <!-- Encabezado de Ronda -->
          <div class="flex flex-col gap-1 pb-2 border-b border-slate-200">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider text-amber-900">
                3. Semifinales
              </span>
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 text-amber-800">
                2 Llaves
              </span>
            </div>
            <p class="text-[11px] text-slate-500">
              Pase directo a la Gran Final por la Corona
            </p>
          </div>

          <!-- Tarjetas de Partidos Semifinal -->
          <div class="flex flex-col gap-6 justify-around h-full pt-4">
            <div
              v-for="partido in playoffs.partidosSemis.value"
              :key="partido.id"
              :class="[
                'group relative rounded-xl border p-3.5 transition-all duration-200 cursor-pointer shadow-2xs',
                obtenerEstiloTarjeta(partido)
              ]"
              @click="abrirDetallePartido(partido)"
            >
              <!-- Cabecera de Llave -->
              <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 text-[10px] font-extrabold">
                <span class="text-amber-800 uppercase">
                  Semifinal {{ partido.numeroLlave }}
                </span>
                <span :class="obtenerClaseBadgeEstado(partido.estado)">
                  {{ formatearEstado(partido.estado) }}
                </span>
              </div>

              <!-- Jugador 1 -->
              <div class="flex items-center justify-between gap-2 py-1.5">
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    {{ partido.jugador1?.iniciales || '?' }}
                  </div>
                  <span class="text-xs font-bold text-slate-800 truncate">
                    {{ partido.jugador1?.nombre || 'Ganador Cuartos' }}
                  </span>
                </div>
                <span class="font-mono text-xs font-black text-slate-400">
                  {{ obtenerScoreJugador(partido, 1) }}
                </span>
              </div>

              <!-- Separador VS -->
              <div class="h-px w-full bg-slate-100 my-1"></div>

              <!-- Jugador 2 -->
              <div class="flex items-center justify-between gap-2 py-1.5">
                <div class="flex items-center gap-2 min-w-0">
                  <div class="w-7 h-7 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-black shrink-0">
                    {{ partido.jugador2?.iniciales || '?' }}
                  </div>
                  <span class="text-xs font-bold text-slate-800 truncate">
                    {{ partido.jugador2?.nombre || 'Ganador Cuartos' }}
                  </span>
                </div>
                <span class="font-mono text-xs font-black text-slate-400">
                  {{ obtenerScoreJugador(partido, 2) }}
                </span>
              </div>

              <!-- Destino de avance -->
              <div class="mt-2 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[10px] text-amber-600 font-bold">
                <span>Pase a la Gran Final</span>
                <Crown class="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>
          </div>
        </div>

        <!-- ========================================== -->
        <!-- COLUMNA 4: GRAN FINAL Y CORONA 👑 -->
        <!-- ========================================== -->
        <div
          :class="[
            'flex-1 flex flex-col gap-4 transition-all duration-200',
            rondaMovilActiva !== 'todas' && rondaMovilActiva !== 'final' ? 'hidden lg:flex' : 'flex'
          ]"
        >
          <!-- Encabezado de Ronda -->
          <div class="flex flex-col gap-1 pb-2 border-b border-amber-300">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                <Crown class="w-3.5 h-3.5 text-amber-500" />
                4. Gran Final
              </span>
              <span class="text-[10px] font-black px-2 py-0.5 rounded bg-amber-500 text-slate-950 shadow-2xs">
                100% Premio
              </span>
            </div>
            <p class="text-[11px] text-amber-700 font-medium">
              El ganador se lleva ${{ playoffs.bolsaPremio.toLocaleString('es-CO') }} COP
            </p>
          </div>

          <!-- Tarjeta Estelar de la Final -->
          <div class="flex flex-col justify-center h-full pt-2">
            <div
              :class="[
                'relative rounded-2xl border-2 border-amber-400/90 bg-linear-to-b from-amber-50/70 to-white p-4.5 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg hover:border-amber-500',
                obtenerEstiloTarjeta(playoffs.granFinal.value)
              ]"
              @click="abrirDetallePartido(playoffs.granFinal.value)"
            >
              <!-- Corona central flotante -->
              <div class="flex items-center justify-between pb-3 mb-3 border-b border-amber-200/80">
                <div class="flex items-center gap-1.5">
                  <div class="w-6 h-6 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-black">
                    <Crown class="w-3.5 h-3.5" />
                  </div>
                  <span class="text-xs font-black text-amber-950 tracking-tight">
                    Por el Campeonato
                  </span>
                </div>

                <span class="text-[10px] font-black font-mono text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md border border-amber-200">
                  ${{ playoffs.bolsaPremio.toLocaleString('es-CO') }}
                </span>
              </div>

              <!-- Finalista 1 -->
              <div class="flex items-center justify-between gap-2 py-2">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                    {{ playoffs.granFinal.value.jugador1?.iniciales || 'F1' }}
                  </div>
                  <span class="text-xs font-black text-slate-900 truncate">
                    {{ playoffs.granFinal.value.jugador1?.nombre || 'Finalista 1' }}
                  </span>
                </div>
                <span class="font-mono text-sm font-black text-amber-900">
                  {{ obtenerScoreJugador(playoffs.granFinal.value, 1) }}
                </span>
              </div>

              <!-- Trofeo central decorativo -->
              <div class="flex items-center justify-center py-1">
                <span class="text-[10px] font-black text-amber-800 bg-amber-200/60 px-3 py-0.5 rounded-full uppercase tracking-wider">
                  VS
                </span>
              </div>

              <!-- Finalista 2 -->
              <div class="flex items-center justify-between gap-2 py-2">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                    {{ playoffs.granFinal.value.jugador2?.iniciales || 'F2' }}
                  </div>
                  <span class="text-xs font-black text-slate-900 truncate">
                    {{ playoffs.granFinal.value.jugador2?.nombre || 'Finalista 2' }}
                  </span>
                </div>
                <span class="font-mono text-sm font-black text-amber-900">
                  {{ obtenerScoreJugador(playoffs.granFinal.value, 2) }}
                </span>
              </div>

              <!-- Pie de Tarjeta -->
              <div class="mt-3 pt-2.5 border-t border-amber-200/80 flex items-center justify-center text-center">
                <p class="text-[10px] font-black text-amber-800 flex items-center gap-1">
                  <span>🏆</span>
                  <span>Toca para ver marcador y detalles</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


    <Modal
      ref="modalPlayoffRef"
      title="Marcador del Partido"
      :sub-title="partidoSeleccionado ? `${formatearRonda(partidoSeleccionado.ronda)} • Llave ${partidoSeleccionado.numeroLlave}` : 'Información del encuentro'"
      width="sm"
      :footer="false"
    >
      <div v-if="partidoSeleccionado" class="flex flex-col items-center text-center gap-4 py-2">
        <!-- Ícono de Estado / Trofeo -->
        <div
          class="w-13 h-13 rounded-full flex items-center justify-center font-bold text-white shadow-sm"
          :class="partidoSeleccionado.estado === 'jugado' ? 'bg-emerald-600' : partidoSeleccionado.estado === 'en_curso' ? 'bg-sky-600' : 'bg-slate-700'"
        >
          <Trophy v-if="partidoSeleccionado.estado === 'jugado'" class="w-6 h-6 text-white" />
          <Activity v-else-if="partidoSeleccionado.estado === 'en_curso'" class="w-6 h-6 text-white animate-pulse" />
          <Clock v-else class="w-6 h-6 text-slate-300" />
        </div>

        <!-- Nombre del Ganador o Título del Estado -->
        <div class="space-y-1">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {{ partidoSeleccionado.estado === 'jugado' ? 'Ganador del Encuentro' : partidoSeleccionado.estado === 'en_curso' ? 'Partido en Mesa' : 'Partido Programado' }}
          </span>
          <h3 class="text-base sm:text-lg font-black text-slate-900">
            {{ obtenerNombreGanador(partidoSeleccionado) }}
          </h3>
        </div>

        <!-- Cuadro Destacado del Marcador -->
        <div class="w-full bg-slate-50 border border-slate-200/90 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 shadow-2xs">
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            {{ partidoSeleccionado.estado === 'jugado' ? 'Marcador Final (Sets)' : partidoSeleccionado.estado === 'en_curso' ? 'Marcador en Vivo' : 'Marcador' }}
          </span>
          <span
            class="text-3xl sm:text-4xl font-black font-mono tracking-tight"
            :class="partidoSeleccionado.estado === 'jugado' ? 'text-emerald-700' : partidoSeleccionado.estado === 'en_curso' ? 'text-sky-700' : 'text-slate-400'"
          >
            {{ partidoSeleccionado.marcador || '0 - 0' }}
          </span>
          <span v-if="partidoSeleccionado.marcadorDetallado" class="text-xs text-slate-600 font-mono font-bold mt-1 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
            Sets: {{ partidoSeleccionado.marcadorDetallado }}
          </span>
        </div>

        <!-- Desglose de Jugadores y Sets -->
        <div class="w-full grid grid-cols-2 gap-2 text-xs">
          <div
            class="p-2.5 rounded-xl border flex flex-col items-center gap-1"
            :class="partidoSeleccionado.ganadorId === partidoSeleccionado.jugador1?.id ? 'bg-emerald-50/70 border-emerald-300' : 'bg-white border-slate-200'"
          >
            <span class="font-bold text-slate-800 truncate w-full text-center">
              {{ partidoSeleccionado.jugador1?.nombre || 'Por definir' }}
            </span>
            <span
              class="font-mono text-sm font-black"
              :class="partidoSeleccionado.ganadorId === partidoSeleccionado.jugador1?.id ? 'text-emerald-700' : 'text-slate-500'"
            >
              {{ obtenerScoreJugador(partidoSeleccionado, 1) }} sets
            </span>
          </div>

          <div
            class="p-2.5 rounded-xl border flex flex-col items-center gap-1"
            :class="partidoSeleccionado.ganadorId === partidoSeleccionado.jugador2?.id ? 'bg-emerald-50/70 border-emerald-300' : 'bg-white border-slate-200'"
          >
            <span class="font-bold text-slate-800 truncate w-full text-center">
              {{ partidoSeleccionado.jugador2?.nombre || 'Por definir' }}
            </span>
            <span
              class="font-mono text-sm font-black"
              :class="partidoSeleccionado.ganadorId === partidoSeleccionado.jugador2?.id ? 'text-emerald-700' : 'text-slate-500'"
            >
              {{ obtenerScoreJugador(partidoSeleccionado, 2) }} sets
            </span>
          </div>
        </div>

        <!-- Botón Cerrar Único -->
        <div class="w-full pt-2">
          <Button
            variant="outline"
            size="md"
            class="w-full justify-center cursor-pointer font-bold"
            @click="modalPlayoffRef?.close()"
          >
            Cerrar
          </Button>
        </div>
      </div>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Crown, Trophy, Compass, Sparkles, ChevronRight, Activity, Clock } from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import { usePlayoffs } from '@/modules/dashboard/composables/usePlayoffs'
import type { FilaPosicion, PartidoPlayoff, RondaPlayoff, EstadoPartido } from '@/types'

const props = defineProps<{
  filasPosiciones: FilaPosicion[]
}>()

const modoVista = ref<'completo' | 'mi-camino'>('completo')
const rondaMovilActiva = ref<'todas' | 'play_in' | 'cuartos' | 'semifinal' | 'final'>('todas')
const modalPlayoffRef = ref<InstanceType<typeof Modal> | null>(null)
const partidoSeleccionado = ref<PartidoPlayoff | null>(null)

const playoffs = usePlayoffs(props.filasPosiciones)

const rondasNavegacion = [
  { id: 'todas' as const, nombre: 'Todas', cantidad: 11 },
  { id: 'play_in' as const, nombre: 'Play-In', cantidad: 4 },
  { id: 'cuartos' as const, nombre: 'Cuartos', cantidad: 4 },
  { id: 'semifinal' as const, nombre: 'Semis', cantidad: 2 },
  { id: 'final' as const, nombre: 'Final 👑', cantidad: 1 },
]

const obtenerSemilla = (jugadorId?: string): number | string => {
  if (!jugadorId) return '?'
  const pos = props.filasPosiciones.findIndex((f) => f.jugadorId === jugadorId)
  return pos >= 0 ? pos + 1 : '?'
}

const obtenerScoreJugador = (partido: PartidoPlayoff, jugadorNumero: 1 | 2): string => {
  if (!partido.marcador) return '-'
  const partes = partido.marcador.split('-').map((s) => s.trim())
  return jugadorNumero === 1 ? partes[0] ?? '-' : partes[1] ?? '-'
}

const obtenerEstiloTarjeta = (partido: PartidoPlayoff): string => {
  const esMiPartido = partido.jugador1?.esUsuarioActual || partido.jugador2?.esUsuarioActual

  if (modoVista.value === 'mi-camino') {
    if (esMiPartido) {
      return 'bg-emerald-50/60 border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
    }
    return 'bg-white/40 border-slate-200/60 opacity-40 hover:opacity-100'
  }

  if (esMiPartido) {
    return 'bg-emerald-50/40 border-emerald-400 shadow-2xs hover:border-emerald-500'
  }

  return 'bg-white border-slate-200/90 hover:border-slate-300'
}

const obtenerClaseBadgeEstado = (estado: EstadoPartido): string => {
  switch (estado) {
    case 'jugado':
      return 'bg-emerald-100 text-emerald-800'
    case 'en_curso':
      return 'bg-sky-100 text-sky-800 animate-pulse'
    case 'pendiente_admin':
      return 'bg-orange-100 text-orange-800'
    case 'pendiente':
    default:
      return 'bg-slate-100 text-slate-600'
  }
}

const formatearEstado = (estado: EstadoPartido): string => {
  switch (estado) {
    case 'jugado':
      return 'Finalizado'
    case 'en_curso':
      return 'En Vivo'
    case 'pendiente_admin':
      return 'Pendiente Admin'
    case 'pendiente':
    default:
      return 'Por Jugar'
  }
}

const formatearRonda = (ronda: RondaPlayoff): string => {
  switch (ronda) {
    case 'play_in':
      return 'Play-In (Octavos de Final)'
    case 'cuartos':
      return 'Cuartos de Final'
    case 'semifinal':
      return 'Semifinal'
    case 'final':
      return 'Gran Final 👑'
  }
}

const obtenerNombreGanador = (partido: PartidoPlayoff | null): string => {
  if (!partido) return ''
  if (partido.ganadorId) {
    if (partido.jugador1?.id === partido.ganadorId) return partido.jugador1.nombre
    if (partido.jugador2?.id === partido.ganadorId) return partido.jugador2.nombre
  }
  if (partido.estado === 'jugado') {
    return partido.jugador1?.nombre ?? 'Ganador'
  }
  if (partido.estado === 'en_curso') {
    return `${partido.jugador1?.nombre || 'J1'} vs ${partido.jugador2?.nombre || 'J2'}`
  }
  return `${partido.jugador1?.nombre || 'Por definir'} vs ${partido.jugador2?.nombre || 'Por definir'}`
}

const abrirDetallePartido = (partido: PartidoPlayoff) => {
  partidoSeleccionado.value = partido
  modalPlayoffRef.value?.open()
}
</script>

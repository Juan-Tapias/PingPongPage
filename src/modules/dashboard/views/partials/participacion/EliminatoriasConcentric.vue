<template>
  <div class="flex flex-col gap-6 w-full animate-in fade-in duration-200">

    <!-- ========================================================================= -->
    <!-- CABECERA PRINCIPAL: TÍTULO, SUBTÍTULO, BOLSA Y MODO DE VISTA -->
    <!-- ========================================================================= -->
    <div class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#0f172a] border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-300">
      <div class="flex items-start sm:items-center gap-3">
        <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-500/10 dark:bg-amber-950/60 border border-amber-300/80 dark:border-amber-700 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 shadow-xs">
          <Crown class="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
        <div class="min-w-0">
          <div class="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white font-heading tracking-tight leading-snug">
              Cuadro Oficial de Eliminatorias (Playoffs)
            </h3>
            <span class="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300/70 dark:border-amber-700 shrink-0">
              Fase 2 • Eliminación Directa
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {{ textoSubtituloPlayoffs }}
          </p>
        </div>
      </div>

      <!-- Tarjeta de Bolsa y Conmutador de Modo -->
      <div class="flex flex-wrap items-center justify-between sm:justify-start gap-2.5 w-full lg:w-auto">
        <!-- Bolsa Acumulada $180.000 COP -->
        <div class="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-500/5 dark:from-amber-950/40 dark:to-amber-900/20 border border-amber-300/80 dark:border-amber-700/80 text-amber-900 dark:text-amber-300 shadow-2xs">
          <Trophy class="w-4 h-4 text-amber-500 shrink-0" />
          <div class="flex flex-col">
            <span class="text-[9px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-400">Premio Acumulado</span>
            <span class="text-xs font-black font-mono text-amber-950 dark:text-amber-200">
              ${{ playoffs.bolsaPremioFormateada }} COP
            </span>
          </div>
          <span class="text-[9px] font-extrabold bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded-md ml-1 shrink-0 font-sans">
            100% Ganador
          </span>
        </div>

        <!-- Conmutador: Todas las llaves vs Mi Camino -->
        <div class="flex items-center p-1 bg-slate-100 dark:bg-slate-800/90 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
          <button
            type="button"
            :class="[
              'px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
              modoVista === 'completo'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
            @click="modoVista = 'completo'"
          >
            <Sparkles class="w-3.5 h-3.5 text-amber-500" />
            <span>Todas las llaves</span>
          </button>

          <button
            type="button"
            :class="[
              'px-2.5 sm:px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5',
              modoVista === 'mi-camino'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
            @click="modoVista = 'mi-camino'"
          >
            <Compass class="w-3.5 h-3.5" />
            <span>Mi Camino</span>
          </button>
        </div>
      </div>
    </div>

    <!-- BANNER DE RUTA DEL USUARIO CUANDO SE ACTIVA "MI CAMINO" -->
    <div
      v-if="modoVista === 'mi-camino'"
      class="flex items-center justify-between gap-3 p-3.5 sm:p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/40 text-emerald-900 dark:text-emerald-300 text-xs font-medium animate-in fade-in slide-in-from-top-2 duration-200"
    >
      <div class="flex items-center gap-2.5">
        <div class="w-7 h-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0 font-bold">
          <Compass class="w-4 h-4" />
        </div>
        <div>
          <span class="font-bold text-emerald-950 dark:text-emerald-200">
            🎯 Ruta Personal Hacia la Corona:
          </span>
          <span class="ml-1 text-emerald-800 dark:text-emerald-300">
            {{ textoRutaUsuario }}
          </span>
        </div>
      </div>
      <button
        type="button"
        class="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 hover:underline shrink-0"
        @click="modoVista = 'completo'"
      >
        Ver cuadro general ✕
      </button>
    </div>

    <!-- ========================================================================= -->
    <!-- SELECTOR DE RONDAS / NAVEGACIÓN EN DISPOSITIVOS MÓVILES Y TABLETS (< 1024px) -->
    <!-- ========================================================================= -->
    <div class="flex lg:hidden items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
      <button
        v-for="ronda in rondasNavegacion"
        :key="ronda.id"
        type="button"
        :class="[
          'px-3.5 py-2 rounded-xl text-xs font-extrabold shrink-0 transition-all cursor-pointer flex items-center gap-1.5',
          rondaMovilActiva === ronda.id
            ? 'bg-slate-900 dark:bg-sky-600 text-white shadow-xs'
            : 'bg-white dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700'
        ]"
        @click="rondaMovilActiva = ronda.id"
      >
        <span>{{ ronda.nombre }}</span>
        <span
          class="text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold"
          :class="rondaMovilActiva === ronda.id ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'"
        >
          {{ ronda.cantidad }}
        </span>
      </button>
    </div>

    <!-- ========================================================================= -->
    <!-- CUADRO DE LLAVES / BRACKET RESPONSIVO Y ESTRUCTURADO -->
    <!-- ========================================================================= -->
    <div class="w-full bg-slate-50/70 dark:bg-[#070e1e] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-3 sm:p-6 overflow-x-auto shadow-xs transition-colors duration-300">
      
      <!-- CONTENEDOR EN REJILLA FLEXIBLE -->
      <div
        :class="[
          rondaMovilActiva === 'todas' ? 'min-w-[1080px]' : 'w-full min-w-full',
          'flex items-stretch gap-4 lg:gap-6 justify-between'
        ]"
      >

        <!-- =================================================================== -->
        <!-- COLUMNA 1: PLAY-IN (Puestos 5 al 12) -->
        <!-- =================================================================== -->
        <div
          v-if="playoffs.partidosPlayIn.value.length > 0"
          :class="[
            'flex-1 flex flex-col gap-4 transition-all duration-200 min-w-[260px]',
            rondaMovilActiva !== 'todas' && rondaMovilActiva !== 'play_in' ? 'hidden lg:flex' : 'flex'
          ]"
        >
          <!-- Encabezado de Ronda -->
          <div class="flex flex-col gap-1 pb-2 border-b border-slate-200 dark:border-slate-800">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-slate-400"></span>
                1. Play-In (Repechaje)
              </span>
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                {{ playoffs.partidosPlayIn.value.length }} Llaves
              </span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Puestos 5° al 12° de la fase regular
            </p>
          </div>

          <!-- Tarjetas de Partidos Play-In -->
          <div class="flex flex-col gap-4 h-full justify-between">
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
              <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold">
                <span class="text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
                      partido.jugador1?.esUsuarioActual ? 'bg-emerald-600 ring-2 ring-emerald-400' : 'bg-slate-700 dark:bg-slate-600'
                    ]"
                  >
                    {{ partido.jugador1?.iniciales || '?' }}
                  </div>
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span
                      class="text-xs font-bold truncate"
                      :class="partido.jugador1?.esUsuarioActual ? 'text-emerald-700 dark:text-emerald-400 font-black' : 'text-slate-900 dark:text-slate-100'"
                    >
                      {{ partido.jugador1?.nombre || 'Por definir' }}
                    </span>
                    <span class="text-[9px] font-black px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                      #{{ obtenerSemilla(partido.jugador1?.id) }}
                    </span>
                    <span
                      v-if="partido.jugador1?.esUsuarioActual"
                      class="text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.2 rounded shrink-0 shadow-2xs"
                    >
                      Tú
                    </span>
                  </div>
                </div>

                <span
                  class="font-mono text-xs font-black shrink-0 px-2 py-0.5 rounded"
                  :class="partido.ganadorId === partido.jugador1?.id ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' : 'text-slate-600 dark:text-slate-400'"
                >
                  {{ obtenerScoreJugador(partido, 1) }}
                </span>
              </div>

              <!-- Separador VS -->
              <div class="h-px w-full bg-slate-100 dark:bg-slate-800 my-1"></div>

              <!-- Jugador 2 -->
              <div class="flex items-center justify-between gap-2 py-1.5">
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    :class="[
                      'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0',
                      partido.jugador2?.esUsuarioActual ? 'bg-emerald-600 ring-2 ring-emerald-400' : 'bg-slate-700 dark:bg-slate-600'
                    ]"
                  >
                    {{ partido.jugador2?.iniciales || '?' }}
                  </div>
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span
                      class="text-xs font-bold truncate"
                      :class="partido.jugador2?.esUsuarioActual ? 'text-emerald-700 dark:text-emerald-400 font-black' : 'text-slate-900 dark:text-slate-100'"
                    >
                      {{ partido.jugador2?.nombre || 'Por definir' }}
                    </span>
                    <span class="text-[9px] font-black px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0">
                      #{{ obtenerSemilla(partido.jugador2?.id) }}
                    </span>
                    <span
                      v-if="partido.jugador2?.esUsuarioActual"
                      class="text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.2 rounded shrink-0 shadow-2xs"
                    >
                      Tú
                    </span>
                  </div>
                </div>

                <span
                  class="font-mono text-xs font-black shrink-0 px-2 py-0.5 rounded"
                  :class="partido.ganadorId === partido.jugador2?.id ? 'text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60' : 'text-slate-600 dark:text-slate-400'"
                >
                  {{ obtenerScoreJugador(partido, 2) }}
                </span>
              </div>

              <!-- Destino de avance -->
              <div class="mt-2 pt-2 border-t border-slate-100/80 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-sky-500 transition-colors">
                <span>Avanza a Cuartos {{ partido.numeroLlave }}</span>
                <ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        <!-- =================================================================== -->
        <!-- COLUMNA 2: CUARTOS DE FINAL (Top 1-4 BYE + Ganadores Play-In) -->
        <!-- =================================================================== -->
        <div
          v-if="playoffs.partidosCuartos.value.length > 0"
          :class="[
            'flex-1 flex flex-col gap-4 transition-all duration-200 min-w-[260px]',
            rondaMovilActiva !== 'todas' && rondaMovilActiva !== 'cuartos' ? 'hidden lg:flex' : 'flex'
          ]"
        >
          <!-- Encabezado de Ronda -->
          <div class="flex flex-col gap-1 pb-2 border-b border-sky-300 dark:border-sky-800">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider text-sky-900 dark:text-sky-300 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-sky-500"></span>
                2. Cuartos de Final
              </span>
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800">
                Top 4 BYE
              </span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Puestos 1° al 4° esperan a los ganadores
            </p>
          </div>

          <!-- Tarjetas de Partidos Cuartos -->
          <div class="flex flex-col gap-4 h-full justify-between">
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
              <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold">
                <span class="text-sky-800 dark:text-sky-400 uppercase tracking-wider">
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
                      partido.jugador1?.esUsuarioActual ? 'bg-emerald-600 ring-2 ring-emerald-400' : 'bg-sky-700 dark:bg-sky-800'
                    ]"
                  >
                    {{ partido.jugador1?.iniciales || '?' }}
                  </div>
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span
                      class="text-xs font-bold truncate"
                      :class="partido.jugador1?.esUsuarioActual ? 'text-emerald-700 dark:text-emerald-400 font-black' : 'text-slate-900 dark:text-slate-100'"
                    >
                      {{ partido.jugador1?.nombre || 'Por definir' }}
                    </span>
                    <span class="text-[9px] font-black px-1.5 py-0.2 rounded bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/60 dark:border-sky-800 shrink-0">
                      Top {{ obtenerSemilla(partido.jugador1?.id) }} (BYE)
                    </span>
                    <span
                      v-if="partido.jugador1?.esUsuarioActual"
                      class="text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.2 rounded shrink-0 shadow-2xs"
                    >
                      Tú
                    </span>
                  </div>
                </div>

                <span class="font-mono text-xs font-black shrink-0 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">
                  {{ obtenerScoreJugador(partido, 1) }}
                </span>
              </div>

              <!-- Separador VS -->
              <div class="h-px w-full bg-slate-100 dark:bg-slate-800 my-1"></div>

              <!-- Jugador 2 (Ganador Play-In o clasificado) -->
              <div class="flex items-center justify-between gap-2 py-1.5">
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    :class="[
                      'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0',
                      partido.jugador2?.esUsuarioActual ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' : esPlaceholder(partido.jugador2) ? 'bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400' : 'bg-slate-700 text-white'
                    ]"
                  >
                    {{ partido.jugador2?.iniciales || '?' }}
                  </div>
                  <div class="flex items-center gap-1.5 min-w-0">
                    <span
                      class="text-xs font-bold truncate"
                      :class="[
                        partido.jugador2?.esUsuarioActual ? 'text-emerald-700 dark:text-emerald-400 font-black' : esPlaceholder(partido.jugador2) ? 'text-slate-500 dark:text-slate-400 italic' : 'text-slate-900 dark:text-slate-100'
                      ]"
                    >
                      {{ partido.jugador2?.nombre || `Ganador Llave ${partido.numeroLlave}` }}
                    </span>
                    <span
                      v-if="!esPlaceholder(partido.jugador2)"
                      class="text-[9px] font-black px-1.5 py-0.2 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 shrink-0"
                    >
                      #{{ obtenerSemilla(partido.jugador2?.id) }}
                    </span>
                    <span
                      v-if="partido.jugador2?.esUsuarioActual"
                      class="text-[9px] font-black bg-emerald-600 text-white px-1.5 py-0.2 rounded shrink-0 shadow-2xs"
                    >
                      Tú
                    </span>
                  </div>
                </div>

                <span class="font-mono text-xs font-black shrink-0 px-2 py-0.5 rounded text-slate-500 dark:text-slate-400">
                  {{ obtenerScoreJugador(partido, 2) }}
                </span>
              </div>

              <!-- Destino de avance -->
              <div class="mt-2 pt-2 border-t border-slate-100/80 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400 group-hover:text-amber-500 transition-colors">
                <span>Avanza a Semifinal {{ partido.numeroLlave <= 2 ? 1 : 2 }}</span>
                <ChevronRight class="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        <!-- =================================================================== -->
        <!-- COLUMNA 3: SEMIFINALES (2 LLAVES) -->
        <!-- =================================================================== -->
        <div
          v-if="playoffs.partidosSemis.value.length > 0"
          :class="[
            'flex-1 flex flex-col gap-4 transition-all duration-200 min-w-[260px]',
            rondaMovilActiva !== 'todas' && rondaMovilActiva !== 'semifinal' ? 'hidden lg:flex' : 'flex'
          ]"
        >
          <!-- Encabezado de Ronda -->
          <div class="flex flex-col gap-1 pb-2 border-b border-amber-300 dark:border-amber-800">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-amber-500"></span>
                3. Semifinales
              </span>
              <span class="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300">
                2 Llaves
              </span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Pase directo a la Gran Final por la Corona
            </p>
          </div>

          <!-- Tarjetas de Partidos Semifinal alineadas verticalmente -->
          <div class="flex flex-col gap-6 justify-around h-full py-4">
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
              <div class="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold">
                <span class="text-amber-800 dark:text-amber-400 uppercase tracking-wider">
                  Semifinal {{ partido.numeroLlave }}
                </span>
                <span :class="obtenerClaseBadgeEstado(partido.estado)">
                  {{ formatearEstado(partido.estado) }}
                </span>
              </div>

              <!-- Jugador 1 -->
              <div class="flex items-center justify-between gap-2 py-1.5">
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    :class="[
                      'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0',
                      partido.jugador1?.esUsuarioActual ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' : esPlaceholder(partido.jugador1) ? 'bg-slate-200 dark:bg-slate-800 text-slate-500' : 'bg-slate-700 text-white'
                    ]"
                  >
                    {{ partido.jugador1?.iniciales || '?' }}
                  </div>
                  <span
                    class="text-xs font-bold truncate"
                    :class="[
                      partido.jugador1?.esUsuarioActual ? 'text-emerald-700 dark:text-emerald-400 font-black' : esPlaceholder(partido.jugador1) ? 'text-slate-500 dark:text-slate-400 italic' : 'text-slate-900 dark:text-slate-100'
                    ]"
                  >
                    {{ partido.jugador1?.nombre || 'Ganador Cuartos' }}
                  </span>
                </div>
                <span class="font-mono text-xs font-black text-slate-400">
                  {{ obtenerScoreJugador(partido, 1) }}
                </span>
              </div>

              <!-- Separador VS -->
              <div class="h-px w-full bg-slate-100 dark:bg-slate-800 my-1"></div>

              <!-- Jugador 2 -->
              <div class="flex items-center justify-between gap-2 py-1.5">
                <div class="flex items-center gap-2 min-w-0">
                  <div
                    :class="[
                      'w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black shrink-0',
                      partido.jugador2?.esUsuarioActual ? 'bg-emerald-600 text-white ring-2 ring-emerald-400' : esPlaceholder(partido.jugador2) ? 'bg-slate-200 dark:bg-slate-800 text-slate-500' : 'bg-slate-700 text-white'
                    ]"
                  >
                    {{ partido.jugador2?.iniciales || '?' }}
                  </div>
                  <span
                    class="text-xs font-bold truncate"
                    :class="[
                      partido.jugador2?.esUsuarioActual ? 'text-emerald-700 dark:text-emerald-400 font-black' : esPlaceholder(partido.jugador2) ? 'text-slate-500 dark:text-slate-400 italic' : 'text-slate-900 dark:text-slate-100'
                    ]"
                  >
                    {{ partido.jugador2?.nombre || 'Ganador Cuartos' }}
                  </span>
                </div>
                <span class="font-mono text-xs font-black text-slate-400">
                  {{ obtenerScoreJugador(partido, 2) }}
                </span>
              </div>

              <!-- Destino de avance -->
              <div class="mt-2 pt-2 border-t border-slate-100/80 dark:border-slate-800 flex items-center justify-between text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                <span>Pase a la Gran Final</span>
                <Crown class="w-3.5 h-3.5 text-amber-500" />
              </div>
            </div>
          </div>
        </div>

        <!-- =================================================================== -->
        <!-- COLUMNA 4: GRAN FINAL Y CORONA 👑 (LA CÚSPIDE) -->
        <!-- =================================================================== -->
        <div
          :class="[
            'flex-1 flex flex-col gap-4 transition-all duration-200 min-w-[280px]',
            rondaMovilActiva !== 'todas' && rondaMovilActiva !== 'final' ? 'hidden lg:flex' : 'flex'
          ]"
        >
          <!-- Encabezado de Ronda -->
          <div class="flex flex-col gap-1 pb-2 border-b border-amber-400 dark:border-amber-600">
            <div class="flex items-center justify-between">
              <span class="text-xs font-black uppercase tracking-wider text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                <Crown class="w-4 h-4 text-amber-500 animate-pulse" />
                4. Gran Final
              </span>
              <span class="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-amber-500 text-slate-950 shadow-xs">
                100% Premio
              </span>
            </div>
            <p class="text-[11px] text-amber-700 dark:text-amber-400 font-semibold">
              El ganador se lleva ${{ playoffs.bolsaPremioFormateada }} COP
            </p>
          </div>

          <!-- Tarjeta Estelar de la Gran Final centrada verticalmente -->
          <div class="flex flex-col justify-center h-full py-4">
            <div
              :class="[
                'relative rounded-2xl border-2 border-amber-400/90 dark:border-amber-500 bg-gradient-to-b from-amber-50/80 via-white to-amber-50/30 dark:from-amber-950/40 dark:via-[#0f172a] dark:to-[#090e1a] p-4.5 sm:p-5 transition-all duration-300 cursor-pointer shadow-lg hover:shadow-xl hover:border-amber-400',
                obtenerEstiloTarjeta(playoffs.granFinal.value)
              ]"
              @click="abrirDetallePartido(playoffs.granFinal.value)"
            >
              <!-- Corona e Identificador superior -->
              <div class="flex items-center justify-between pb-3 mb-3 border-b border-amber-200/80 dark:border-amber-800/80">
                <div class="flex items-center gap-2">
                  <div class="w-7 h-7 rounded-lg bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-xs">
                    <Crown class="w-4 h-4" />
                  </div>
                  <span class="text-xs font-black text-amber-950 dark:text-amber-200 tracking-tight uppercase">
                    Por el Campeonato
                  </span>
                </div>

                <span class="text-[11px] font-black font-mono text-amber-950 dark:text-amber-300 bg-amber-200/70 dark:bg-amber-900/60 px-2.5 py-0.5 rounded-md border border-amber-300 dark:border-amber-700">
                  ${{ playoffs.bolsaPremioFormateada }}
                </span>
              </div>

              <!-- Finalista 1 -->
              <div class="flex items-center justify-between gap-2 py-2">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                    {{ playoffs.granFinal.value.jugador1?.iniciales || 'F1' }}
                  </div>
                  <span
                    class="text-xs font-black truncate"
                    :class="playoffs.granFinal.value.jugador1?.esUsuarioActual ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'"
                  >
                    {{ playoffs.granFinal.value.jugador1?.nombre || 'Ganador Semifinal 1' }}
                  </span>
                </div>
                <span class="font-mono text-sm font-black text-amber-950 dark:text-amber-300">
                  {{ obtenerScoreJugador(playoffs.granFinal.value, 1) }}
                </span>
              </div>

              <!-- Trofeo central decorativo -->
              <div class="flex items-center justify-center py-1">
                <span class="text-[10px] font-black text-amber-900 dark:text-amber-200 bg-amber-200/70 dark:bg-amber-900/60 px-3.5 py-0.5 rounded-full uppercase tracking-widest border border-amber-300/60 dark:border-amber-700">
                  VS
                </span>
              </div>

              <!-- Finalista 2 -->
              <div class="flex items-center justify-between gap-2 py-2">
                <div class="flex items-center gap-2.5 min-w-0">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 text-slate-950 font-black flex items-center justify-center text-xs shadow-xs shrink-0">
                    {{ playoffs.granFinal.value.jugador2?.iniciales || 'F2' }}
                  </div>
                  <span
                    class="text-xs font-black truncate"
                    :class="playoffs.granFinal.value.jugador2?.esUsuarioActual ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'"
                  >
                    {{ playoffs.granFinal.value.jugador2?.nombre || 'Ganador Semifinal 2' }}
                  </span>
                </div>
                <span class="font-mono text-sm font-black text-amber-950 dark:text-amber-300">
                  {{ obtenerScoreJugador(playoffs.granFinal.value, 2) }}
                </span>
              </div>

              <!-- Pie de Tarjeta -->
              <div class="mt-3 pt-2.5 border-t border-amber-200/80 dark:border-amber-800/80 flex items-center justify-center text-center">
                <p class="text-[10px] font-black text-amber-800 dark:text-amber-400 flex items-center gap-1.5">
                  <Trophy class="w-3.5 h-3.5 text-amber-500" />
                  <span>Toca para ver marcador y detalles</span>
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>

    <!-- ========================================================================= -->
    <!-- MODAL DETALLE DE PARTIDO -->
    <!-- ========================================================================= -->
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
          :class="partidoSeleccionado.estado === 'jugado' ? 'bg-emerald-600' : partidoSeleccionado.estado === 'en_curso' ? 'bg-sky-600 animate-pulse' : 'bg-slate-700'"
        >
          <Trophy v-if="partidoSeleccionado.estado === 'jugado'" class="w-6 h-6" />
          <Activity v-else-if="partidoSeleccionado.estado === 'en_curso'" class="w-6 h-6" />
          <Clock v-else class="w-6 h-6" />
        </div>

        <div class="flex flex-col">
          <span class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            {{ partidoSeleccionado.estado === 'jugado' ? 'Ganador del Encuentro' : partidoSeleccionado.estado === 'en_curso' ? 'Partido en Mesa' : 'Partido Programado' }}
          </span>
          <h3 class="text-base sm:text-lg font-black text-slate-900 dark:text-white">
            {{ obtenerNombreGanador(partidoSeleccionado) }}
          </h3>
        </div>

        <!-- Cuadro Destacado del Marcador -->
        <div class="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 rounded-2xl p-4 flex flex-col items-center justify-center gap-1 shadow-2xs">
          <span class="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-400">
            {{ partidoSeleccionado.estado === 'jugado' ? 'Marcador Final (Sets)' : partidoSeleccionado.estado === 'en_curso' ? 'Marcador en Vivo' : 'Marcador' }}
          </span>
          <span
            class="text-3xl sm:text-4xl font-black font-mono tracking-tight"
            :class="partidoSeleccionado.estado === 'jugado' ? 'text-emerald-700 dark:text-emerald-400' : partidoSeleccionado.estado === 'en_curso' ? 'text-sky-700 dark:text-sky-400' : 'text-slate-400'"
          >
            {{ partidoSeleccionado.marcador || '0 - 0' }}
          </span>
          <span v-if="partidoSeleccionado.marcadorDetallado" class="text-xs text-slate-600 dark:text-slate-300 font-mono font-bold mt-1 bg-white dark:bg-slate-700 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-600">
            Sets: {{ partidoSeleccionado.marcadorDetallado }}
          </span>
        </div>

        <!-- Desglose de Jugadores y Sets -->
        <div class="w-full grid grid-cols-2 gap-2 text-xs">
          <div
            class="p-2.5 rounded-xl border flex flex-col items-center gap-1"
            :class="partidoSeleccionado.ganadorId === partidoSeleccionado.jugador1?.id ? 'bg-emerald-50/70 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'"
          >
            <span class="font-bold truncate w-full text-center">
              {{ partidoSeleccionado.jugador1?.nombre || 'Por definir' }}
            </span>
            <span
              class="font-mono text-sm font-black"
              :class="partidoSeleccionado.ganadorId === partidoSeleccionado.jugador1?.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'"
            >
              {{ obtenerScoreJugador(partidoSeleccionado, 1) }} sets
            </span>
          </div>

          <div
            class="p-2.5 rounded-xl border flex flex-col items-center gap-1"
            :class="partidoSeleccionado.ganadorId === partidoSeleccionado.jugador2?.id ? 'bg-emerald-50/70 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700 text-slate-900 dark:text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200'"
          >
            <span class="font-bold truncate w-full text-center">
              {{ partidoSeleccionado.jugador2?.nombre || 'Por definir' }}
            </span>
            <span
              class="font-mono text-sm font-black"
              :class="partidoSeleccionado.ganadorId === partidoSeleccionado.jugador2?.id ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-500 dark:text-slate-400'"
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
import { ref, computed } from 'vue'
import { Crown, Trophy, Compass, Sparkles, ChevronRight, Activity, Clock } from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import { usePlayoffs } from '@/modules/dashboard/composables/usePlayoffs'
import type { FilaPosicion, PartidoPlayoff, RondaPlayoff, EstadoPartido, Torneo, JugadorTorneo } from '@/types'

const props = withDefaults(
  defineProps<{
    filasPosiciones: FilaPosicion[]
    cantidadClasificados?: number
    torneo?: Torneo | null
  }>(),
  {
    cantidadClasificados: 4,
    torneo: null,
  }
)

const modoVista = ref<'completo' | 'mi-camino'>('completo')
const rondaMovilActiva = ref<'todas' | 'play_in' | 'cuartos' | 'semifinal' | 'final'>('todas')
const modalPlayoffRef = ref<InstanceType<typeof Modal> | null>(null)
const partidoSeleccionado = ref<PartidoPlayoff | null>(null)

const playoffs = usePlayoffs(
  () => props.filasPosiciones,
  () => props.cantidadClasificados,
  () => props.torneo
)

const textoSubtituloPlayoffs = computed(() => {
  const c = props.cantidadClasificados
  if (c === 2) return 'Top 2 disputan la Gran Final directa por la Corona'
  if (c === 6) return 'Top 1° y 2° avanzan directo a Semis (BYE) • Puestos 3° al 6° disputan Cuartos'
  if (c === 8) return 'Top 8 clasificados de la fase regular disputan Cuartos de Final'
  if (c >= 10) return 'Top 4 clasificados directos a Cuartos (BYE) • Puestos 5° al 12° disputan Play-In'
  return 'Top 4 clasificados de la fase regular disputan Semifinales y Gran Final'
})

type RondaMovilId = 'todas' | 'play_in' | 'cuartos' | 'semifinal' | 'final'
interface ItemRondaNavegacion {
  id: RondaMovilId
  nombre: string
  cantidad: string
}

const rondasNavegacion = computed<ItemRondaNavegacion[]>(() => {
  const arr: ItemRondaNavegacion[] = [{ id: 'todas', nombre: 'Todas', cantidad: 'Árbol' }]
  if (playoffs.partidosPlayIn.value.length > 0) {
    arr.push({ id: 'play_in', nombre: 'Play-In', cantidad: `${playoffs.partidosPlayIn.value.length}` })
  }
  if (playoffs.partidosCuartos.value.length > 0) {
    arr.push({ id: 'cuartos', nombre: 'Cuartos', cantidad: `${playoffs.partidosCuartos.value.length}` })
  }
  if (playoffs.partidosSemis.value.length > 0) {
    arr.push({ id: 'semifinal', nombre: 'Semis', cantidad: `${playoffs.partidosSemis.value.length}` })
  }
  arr.push({ id: 'final', nombre: 'Final 👑', cantidad: '1' })
  return arr
})

const esPlaceholder = (j?: JugadorTorneo): boolean => {
  if (!j) return true
  if (j.id.startsWith('g-') || j.id.startsWith('p') || j.id.startsWith('seed-') || j.nombre.startsWith('Ganador') || j.nombre.startsWith('Puesto')) {
    return true
  }
  return false
}

const textoRutaUsuario = computed(() => {
  const pPlayIn = playoffs.partidosPlayIn.value.find(
    (p) => p.jugador1?.esUsuarioActual || p.jugador2?.esUsuarioActual
  )
  if (pPlayIn) {
    const rival = pPlayIn.jugador1?.esUsuarioActual ? pPlayIn.jugador2?.nombre : pPlayIn.jugador1?.nombre
    return `Disputas Play-In (Llave ${pPlayIn.numeroLlave}) vs ${rival || 'tu rival'}. El ganador avanza a Cuartos ${pPlayIn.numeroLlave}.`
  }

  const pCuartos = playoffs.partidosCuartos.value.find(
    (p) => p.jugador1?.esUsuarioActual || p.jugador2?.esUsuarioActual
  )
  if (pCuartos) {
    return `Clasificaste con BYE directo a Cuartos de Final (Llave ${pCuartos.numeroLlave}). Esperas al ganador del Play-In.`
  }

  return 'Visualizando el camino de eliminatorias directas hacia la Gran Final por la Corona.'
})

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
  const esRutaCamino = playoffs.idsMiCamino.value.has(partido.id)

  if (modoVista.value === 'mi-camino') {
    if (esMiPartido) {
      return 'bg-emerald-500/10 dark:bg-emerald-950/60 border-emerald-500 ring-2 ring-emerald-500/30 shadow-md scale-[1.02]'
    }
    if (esRutaCamino) {
      return 'bg-emerald-500/5 dark:bg-emerald-950/30 border-emerald-500/60 border-dashed shadow-xs'
    }
    return 'bg-white/40 dark:bg-slate-900/30 border-slate-200/50 dark:border-slate-800/50 opacity-30 hover:opacity-100 transition-opacity'
  }

  if (esMiPartido) {
    return 'bg-emerald-500/10 dark:bg-emerald-950/50 border-emerald-500 dark:border-emerald-500 ring-1 ring-emerald-500/20 shadow-xs hover:border-emerald-400'
  }

  return 'bg-white dark:bg-[#0f172a] border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
}

const obtenerClaseBadgeEstado = (estado: EstadoPartido): string => {
  switch (estado) {
    case 'jugado':
      return 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-emerald-300/60 dark:border-emerald-700/60 px-2 py-0.5 rounded-full'
    case 'en_curso':
      return 'bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-300/60 dark:border-rose-700/60 px-2 py-0.5 rounded-full animate-pulse'
    case 'pendiente_admin':
      return 'bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 px-2 py-0.5 rounded-full'
    case 'pendiente':
    default:
      return 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 px-2 py-0.5 rounded-full'
  }
}

const formatearEstado = (estado: EstadoPartido): string => {
  switch (estado) {
    case 'jugado':
      return 'Finalizado'
    case 'en_curso':
      return 'En Vivo'
    case 'pendiente_admin':
      return 'Pendiente'
    case 'pendiente':
    default:
      return 'Por Jugar'
  }
}

const formatearRonda = (ronda: RondaPlayoff): string => {
  switch (ronda) {
    case 'play_in':
      return 'Play-In (Repechaje)'
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

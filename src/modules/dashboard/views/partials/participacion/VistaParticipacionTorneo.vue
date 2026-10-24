<template>
  <div class="w-full max-w-full overflow-x-hidden flex flex-col gap-6 animate-in fade-in duration-200">
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#0f172a] p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs transition-colors duration-300">
      <div class="flex items-start sm:items-center gap-2.5 sm:gap-3">
        <button
          type="button"
          title="Volver a mis torneos"
          aria-label="Volver a mis torneos"
          class="flex items-center justify-center p-2 sm:p-2.5 rounded-xl text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white border border-slate-200/80 dark:border-slate-700/80 active:scale-95 transition-all cursor-pointer shrink-0 shadow-xs"
          @click="$emit('volver')"
        >
          <ArrowLeft class="w-4 h-4 sm:w-5 sm:h-5 text-orange-500" />
        </button>

        <div class="h-6 w-px bg-slate-200 dark:bg-slate-800 shrink-0"></div>

        <div>
          <div class="flex flex-wrap items-center gap-2">
            <h2 class="text-lg sm:text-xl font-black font-heading text-slate-900 dark:text-white tracking-tight leading-snug">
              {{ torneo.nombre }}
            </h2>
            <span
              class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider shrink-0 border"
              :class="
                torneo.estado === 'en curso'
                  ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              "
            >
              <span v-if="torneo.estado === 'en curso'" class="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span>
              {{ torneo.estado }}
            </span>
          </div>
          <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Organizado por {{ torneo.organizador }} • Modalidad Todos contra todos (Round Robin)
          </p>
        </div>
      </div>

      <div v-if="torneo.estado !== 'por iniciar'" class="flex flex-col sm:flex-row sm:items-center gap-2.5 w-full sm:w-auto">
        <Button
          variant="outline"
          size="sm"
          class="gap-1.5 border-emerald-600 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 cursor-pointer font-bold w-full sm:w-auto justify-center"
          @click="abrirModalArbitraje"
        >
          <ShieldCheck class="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
          <span>Arbitrar un partido</span>
        </Button>

        <!-- Botón para que un celular en trípode vincule la cámara con el código -->
        <Button
          variant="outline"
          size="sm"
          class="gap-1.5 border-rose-500/60 dark:border-rose-500/50 text-rose-700 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 cursor-pointer font-bold w-full sm:w-auto justify-center shadow-xs"
          title="Coloca este celular en un trípode para transmitir una mesa con código"
          @click="handleAbrirVincularCamaraGeneral"
        >
          <Radio class="w-4 h-4 text-rose-600 dark:text-rose-400 animate-pulse" />
          <span>Transmitir Mesa</span>
        </Button>

        <div class="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200/80 dark:border-slate-700 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden w-full sm:w-auto">
          <button
            type="button"
            :class="[
              'flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 flex-1 sm:flex-none',
              tabActiva === 'grafica'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
            @click="tabActiva = 'grafica'"
          >
            <Activity class="w-3.5 h-3.5" />
            <span>Gráfica</span>
          </button>

          <button
            type="button"
            :class="[
              'flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 flex-1 sm:flex-none',
              tabActiva === 'posiciones'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
            @click="tabActiva = 'posiciones'"
          >
            <ListOrdered class="w-3.5 h-3.5" />
            <span>Posiciones</span>
          </button>

          <button
            type="button"
            :class="[
              'flex items-center justify-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer shrink-0 flex-1 sm:flex-none',
              tabActiva === 'playoffs'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            ]"
            @click="tabActiva = 'playoffs'"
          >
            <Crown class="w-3.5 h-3.5 text-amber-300" />
            <span>Eliminatorias</span>
          </button>
        </div>
      </div>
    </div>

    <div
      v-if="torneo.estado === 'finalizado'"
      class="w-full grid grid-cols-1 md:grid-cols-2 gap-4 animate-in fade-in duration-300"
    >
      <div
        v-if="jugadorMasMallero"
        class="flex items-center justify-between gap-4 p-4.5 rounded-2xl bg-gradient-to-r from-emerald-500/10 via-emerald-500/5 to-white dark:to-[#0f172a] border border-emerald-300 dark:border-emerald-800/80 shadow-xs transition-colors duration-300"
      >
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-12 h-12 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-black text-xl shadow-xs shrink-0">
            🏓
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
              Reconocimiento Especial
            </span>
            <h4 class="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate mt-1">
              {{ jugadorMasMallero.titulo }}
            </h4>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">
                {{ jugadorMasMallero.jugador.nombre }}
              </span>
              <span
                v-if="jugadorMasMallero.jugador.esUsuarioActual"
                class="text-[9px] font-black bg-emerald-700 text-white px-1.5 py-0.2 rounded shrink-0"
              >
                Tú
              </span>
            </div>
          </div>
        </div>

        <div class="flex flex-col items-end shrink-0 pl-2">
          <span class="text-2xl sm:text-3xl font-black font-mono text-emerald-700 dark:text-emerald-400 leading-none">
            {{ jugadorMasMallero.totalMallas }}
          </span>
          <span class="text-[10px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-wider mt-1">
            Mallas
          </span>
        </div>
      </div>

      <!-- RECONOCIMIENTO: CAMPEÓN DEL TORNEO -->
      <div class="flex items-center justify-between gap-4 p-4.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-white dark:to-[#0f172a] border border-amber-300 dark:border-amber-800/80 shadow-xs transition-colors duration-300">
        <div class="flex items-center gap-3.5 min-w-0">
          <div class="w-12 h-12 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-xs shrink-0">
            👑
          </div>
          <div class="min-w-0">
            <span class="text-[10px] font-extrabold uppercase tracking-wider text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
              Gran Campeón
            </span>
            <h4 class="text-sm sm:text-base font-black text-slate-900 dark:text-white truncate mt-1">
              Ganador del Torneo
            </h4>
            <p class="text-xs text-slate-600 dark:text-slate-300 font-bold">
              Bolsa acumulada: ${{ bolsaTotalCalculada.toLocaleString('es-CO') }} COP
            </p>
          </div>
        </div>

        <div class="flex flex-col items-end shrink-0 pl-2">
          <span class="text-2xl sm:text-3xl font-black font-mono text-amber-600 dark:text-amber-400 leading-none">
            100%
          </span>
          <span class="text-[10px] font-extrabold text-amber-700 dark:text-amber-400 uppercase tracking-wider mt-1">
            Bolsa
          </span>
        </div>
      </div>
    </div>

    <!-- ESTADO DE ESPERA: TORNEO POR INICIAR (FASE DE CONVOCATORIA) -->
    <div
      v-if="torneo.estado === 'por iniciar'"
      class="w-full bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-6 sm:p-10 flex flex-col items-center justify-center text-center gap-5"
    >
      <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-sky-500/10 dark:bg-sky-500/20 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-500/20 shadow-xs">
        <Clock class="w-8 h-8 sm:w-10 sm:h-10 animate-pulse" />
      </div>

      <div class="max-w-xl space-y-2">
        <span class="text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-full bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800 inline-block">
          Fase de Convocatoria Activa
        </span>
        <h3 class="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
          ¡Tu cupo está asegurado y validado!
        </h3>
        <p class="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          El torneo se encuentra actualmente en periodo de inscripciones y validación de comprobantes. Tan pronto el comité organizador cierre la convocatoria y presione <strong>Generar Partidos</strong>, se habilitará tu rueda de enfrentamientos, rivales asignados y la tabla de posiciones oficial.
        </p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full max-w-lg pt-2 text-xs">
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-center">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Tu Estado</span>
          <span class="font-black text-emerald-600 dark:text-emerald-400 text-sm">✓ Inscrito Oficial</span>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-center">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Modalidad</span>
          <span class="font-black text-slate-900 dark:text-white text-sm">Round Robin</span>
        </div>
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700 text-center">
          <span class="text-[10px] uppercase font-bold text-slate-400 block">Plazo por Partido</span>
          <span class="font-black text-amber-600 dark:text-amber-400 text-sm">48 Horas</span>
        </div>
      </div>
    </div>

    <!-- VISTA COMPETITIVA ACTIVA (EN CURSO O FINALIZADO) -->
    <template v-else>
    <div
      v-if="esVistaRival"
      class="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-xl bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 text-sky-900 dark:text-sky-200"
    >
      <div class="flex items-center gap-3">
        <div class="w-9 h-9 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs shrink-0">
          {{ jugadorEnCentro?.iniciales || '' }}
        </div>
        <div>
          <p class="text-xs font-semibold text-sky-700 dark:text-sky-400 uppercase tracking-wide">
            Vista Sincronizada de Rival
          </p>
          <h4 class="text-sm font-extrabold text-sky-950 dark:text-white">
            Estás viendo la rueda de {{ jugadorEnCentro?.nombre || 'Jugador' }}
          </h4>
        </div>
      </div>

      <Button
        variant="primary"
        size="sm"
        class="gap-2 cursor-pointer w-full sm:w-auto"
        @click="volverAMiVista"
      >
        <RotateCcw class="w-3.5 h-3.5" />
        <span>← Volver a mi vista</span>
      </Button>
    </div>

    <!-- BANNER RESPONSIVE DE TRANSMISIÓN EN VIVO -->
    <!-- BANNER DE PARTIDO EN VIVO (VISOR Y GESTOR DE CÁMARA) -->
    <div
      v-if="partidoEnTransmisionActivo"
      class="flex flex-col gap-3 p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-rose-950/90 via-slate-900 to-slate-900 border border-rose-500/50 shadow-xl text-white animate-in fade-in"
    >
      <!-- Selector de mesas si hay múltiples transmisiones activas simultáneamente -->
      <div
        v-if="partidosEnTransmisionActivos.length > 1"
        class="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/10 no-scrollbar"
      >
        <span class="text-[10px] uppercase font-black tracking-wider text-rose-400 shrink-0 flex items-center gap-1.5">
          <span class="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
          Mesas en Vivo ({{ partidosEnTransmisionActivos.length }}):
        </span>
        <button
          v-for="pActivo in partidosEnTransmisionActivos"
          :key="pActivo.id"
          type="button"
          class="px-2.5 py-1 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0 border"
          :class="partidoEnTransmisionActivo.id === pActivo.id
            ? 'bg-rose-600 text-white border-rose-400 shadow-md scale-102'
            : 'bg-slate-800/80 hover:bg-slate-700 text-slate-300 border-slate-700/60'"
          @click="partidoSeleccionadoTransmisionId = pActivo.id"
        >
          <span class="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
          <span>{{ pActivo.mesa || 'Mesa' }}</span>
          <span class="text-[10px] opacity-80 font-normal">({{ pActivo.jugador1?.nombre?.split(' ')[0] || 'J1' }} vs {{ pActivo.jugador2?.nombre?.split(' ')[0] || 'J2' }})</span>
        </button>
      </div>

      <!-- Detalle del partido seleccionado -->
      <div class="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="relative flex items-center justify-center">
            <span class="w-10 h-10 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center text-rose-400">
              <Radio class="w-5 h-5 animate-pulse" />
            </span>
            <span class="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-500 animate-ping"></span>
          </div>
          <div>
            <div class="flex items-center gap-2 flex-wrap">
              <span class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-rose-500 text-white">
                🔴 {{ partidoEnTransmisionActivo.mesa || 'Mesa' }} en Vivo
              </span>
              <span class="text-xs text-slate-400 font-mono">
                Ronda {{ partidoEnTransmisionActivo.ronda || 1 }}
              </span>
              <span
                v-if="esMiTransmision"
                class="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider bg-emerald-600 text-white animate-pulse"
              >
                📹 Tu Transmisión Activa
              </span>
            </div>
            <h4 class="text-sm font-black text-white mt-0.5">
              {{ partidoEnTransmisionActivo.jugador1?.nombre || 'Jugador 1' }} vs {{ partidoEnTransmisionActivo.jugador2?.nombre || 'Jugador 2' }}
            </h4>
          </div>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto">
          <!-- Si el usuario actual es el emisor de la transmisión -->
          <template v-if="esMiTransmision">
            <Button
              variant="emerald"
              size="sm"
              class="gap-2 cursor-pointer w-full sm:w-auto font-black shadow-md bg-emerald-600 hover:bg-emerald-500 active:scale-95"
              @click="abrirOCrearMiCamaraTransmision"
            >
              <Radio class="w-3.5 h-3.5 animate-pulse" />
              <span>Abrir Mi Cámara</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              class="gap-1.5 cursor-pointer w-full sm:w-auto font-bold border-rose-500/60 text-rose-400 hover:bg-rose-950/40"
              @click="handleDetenerTransmision"
            >
              <span>Detener</span>
            </Button>
          </template>

          <!-- Si el usuario es un espectador -->
          <Button
            v-else
            variant="danger"
            size="sm"
            class="gap-2 cursor-pointer w-full sm:w-auto font-black shadow-md bg-rose-600 hover:bg-rose-500 active:scale-95"
            @click="sintonizarTransmision(partidoEnTransmisionActivo)"
          >
            <Play class="w-3.5 h-3.5 fill-current" />
            <span>Sintonizar {{ partidoEnTransmisionActivo.mesa || 'Partido' }}</span>
          </Button>
        </div>
      </div>
    </div>

    <div v-show="tabActiva === 'grafica'" class="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
      <div class="lg:col-span-7 w-full bg-white dark:bg-[#0f172a] rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs p-4 sm:p-5 flex flex-col items-center overflow-hidden transition-colors duration-300">
        <div class="w-full flex flex-wrap items-center justify-center sm:justify-between pb-3 border-b border-slate-100 dark:border-slate-800 gap-2.5 text-[11px] font-bold text-slate-600 dark:text-slate-300">
          <div class="flex flex-wrap items-center justify-center sm:justify-start gap-2.5 sm:gap-3.5">
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full border-2 border-emerald-500 bg-emerald-50 dark:bg-emerald-950 shrink-0"></span>
              Jugado (Ganado)
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full border-2 border-rose-500 bg-rose-50 dark:bg-rose-950 shrink-0"></span>
              Jugado (Perdido)
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full border-2 border-orange-500 bg-orange-50 dark:bg-orange-950 shrink-0"></span>
              Pendiente Decisión Admin (>48h)
            </span>
            <span class="flex items-center gap-1.5">
              <span class="w-2.5 h-2.5 rounded-full border-2 border-slate-400 bg-slate-50 dark:bg-slate-800 shrink-0"></span>
              Pendiente (Gris)
            </span>
            <span v-if="torneo.estado === 'en curso'" class="flex items-center gap-1.5 text-sky-800 dark:text-sky-300 font-extrabold">
              <span class="w-2.5 h-2.5 rounded-full border-2 border-sky-400 bg-sky-500/30 shadow-[0_0_8px_rgba(56,189,248,0.8)] animate-pulse shrink-0"></span>
              Luz Azul: Pendiente por Jugar (A las 12)
            </span>
          </div>

          <p class="text-[11px] text-slate-400 dark:text-slate-500 font-medium text-center sm:text-right">
            <span v-if="!esVistaRival">Toca cualquier burbuja para ver detalles y plazo.</span>
            <span v-else>Toca una burbuja verde o roja para ver marcador y ganador.</span>
          </p>
        </div>

        <RuedaBurbujas
          :torneo="torneo"
          :jugador-centro="jugadorEnCentro"
          :rivales="rivalesPerimetro"
          :es-vista-rival="esVistaRival"
          @seleccionar-rival="handleAbrirDetalleRival"
          @seleccionar-enfrentamiento-rival="handleAbrirMarcadorRival"
        />
      </div>

      <div class="lg:col-span-5 w-full flex flex-col gap-4">
        <CardAvanceTorneo
          :torneo="torneo"
          :partidos="partidos"
          :jugador-centro="jugadorEnCentro"
          :ronda-actual="rondaActual"
        />

        <CardInfoRival
          :rival="rivalDeTurno"
          :tabla-posiciones="tablaPosiciones"
          :jugador-centro="jugadorEnCentro"
          :es-vista-rival="esVistaRival"
        />
      </div>
    </div>

    <div v-show="tabActiva === 'posiciones'" class="w-full">
      <TablaPosicionesGrupo :posiciones="tablaPosiciones" />
    </div>

    <!-- VISTA DE ELIMINATORIAS (PLAYOFFS) -->
    <div v-show="tabActiva === 'playoffs'" class="w-full">
      <EliminatoriasConcentric
        :filas-posiciones="tablaPosiciones"
        :cantidad-clasificados="props.torneo?.clasificadosPlayoffs || 4"
        :torneo="props.torneo"
      />
    </div>
    </template>

    <ModalDetalleRival
      ref="modalDetalleRef"
      :burbuja="burbujaSeleccionada"
      :es-vista-rival="esVistaRival"
      :jugador-centro="jugadorEnCentro"
      @ver-rival="verVistaRival"
    />

    <ModalMarcadorRival
      ref="modalMarcadorRef"
      :burbuja="burbujaMarcadorSeleccionada"
      :jugador-centro="jugadorEnCentro"
    />

    <!-- MODAL PARA QUE UN JUGADOR REGISTRADO ARBITRE (EXCLUYE SU PARTIDO) -->
    <ModalArbitraje
      ref="modalArbitrajeRef"
      :arbitro="arbitroActual"
      :jugadores-torneo="jugadores"
      :partidos-disponibles="partidosDisponiblesParaArbitrar"
      @validar-codigos="handleValidarCodigos"
      @iniciar-partido="handleIniciarPartidoArbitrado"
      @iniciar-transmision="handleIniciarTransmisionArbitrado"
      @abrir-vincular-camara="handleAbrirVincularCamara"
      @declarar-walkover="handleDeclararWalkover"
      @prorrogar-partido="handleProrrogarPartido"
    />

    <!-- MODAL MARCADOR VIRTUAL TEMÁTICO DE MESA DE PING PONG -->
    <ModalMarcadorVirtual
      ref="modalMarcadorVirtualRef"
      :match="partidoEnMarcador"
      @partido-finalizado="handlePartidoFinalizado"
      @actualizar-marcador-en-vivo="handleActualizarMarcadorEnVivo"
      @iniciar-transmision-marcador="handleIniciarTransmisionDesdeMarcador"
    />

    <!-- MODAL DE TRANSMISIÓN DE CÁMARA (EMISOR: ADMIN / ÁRBITRO / TRÍPODE) -->
    <ModalCamaraTransmision
      ref="modalCamaraTransmisionRef"
      :partido="partidoTransmitiendo"
      :stream-local="streamLocal"
      :total-espectadores="totalEspectadores"
      :camara-trasera="camaraTrasera"
      :audio-activo="audioActivo"
      :video-activo="videoActivo"
      :tiempo-formateado="tiempoTranscurridoFormateado"
      :diagnostico="diagnosticoEmisor"
      @finalizar="handleDetenerTransmision"
      @alternar-camara="alternarCamara"
      @alternar-audio="alternarAudio"
      @alternar-video="alternarVideo"
      @cambiar-calidad="cambiarModoCalidad"
    />

    <!-- MODAL DE REPRODUCCIÓN EN VIVO (ESPECTADORES / JUGADORES) -->
    <ModalTransmisionEnVivo
      ref="modalTransmisionEnVivoRef"
      :partido="partidoSintonizado"
      :stream-remoto="streamRemoto"
      :total-espectadores="totalEspectadores"
      :cargando-conexion="cargandoConexion"
      @cerrar="handleCerrarEspectador"
    />

    <!-- MODAL PARA VINCULAR CÁMARA DE TRÍPODE CON CÓDIGO -->
    <ModalVincularCamara
      ref="modalVincularCamaraRef"
      :partidos-en-curso="partidosEnCursoTorneo"
      @vincular-exito="handleCamaraVinculadaExito"
    />

    <!-- TOAST NOTIFICACIÓN ELEGANTE EN LUGAR DE ALERT NATIVO -->
    <Transition
      enter-active-class="transition duration-300 ease-out"
      enter-from-class="opacity-0 -translate-y-4 scale-95"
      enter-to-class="opacity-100 translate-y-0 scale-100"
      leave-active-class="transition duration-200 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 -translate-y-4 scale-95"
    >
      <div
        v-if="errorAlertaToast"
        class="fixed top-5 left-1/2 -translate-x-1/2 z-[110] max-w-md w-[90%] px-4 py-3 rounded-2xl bg-slate-900/95 border border-rose-500/50 shadow-2xl backdrop-blur-md flex items-center justify-between gap-3 text-white text-xs select-none"
      >
        <div class="flex items-center gap-2.5 min-w-0">
          <span class="w-2 h-2 rounded-full bg-rose-500 shrink-0 animate-ping"></span>
          <p class="font-bold text-rose-200 truncate">{{ errorAlertaToast }}</p>
        </div>
        <button
          type="button"
          class="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer shrink-0"
          @click="errorAlertaToast = ''"
        >
          ✕
        </button>
      </div>
    </Transition>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ArrowLeft, Activity, ListOrdered, Crown, RotateCcw, ShieldCheck, Clock, Radio, Play } from 'lucide-vue-next'
import Button from '@/components/Button.vue'
import RuedaBurbujas from './RuedaBurbujas.vue'
import TablaPosicionesGrupo from './TablaPosicionesGrupo.vue'
import EliminatoriasConcentric from './EliminatoriasConcentric.vue'
import ModalDetalleRival from './ModalDetalleRival.vue'
import ModalMarcadorRival from './ModalMarcadorRival.vue'
import ModalArbitraje from '../arbitraje/ModalArbitraje.vue'
import ModalMarcadorVirtual from '../arbitraje/ModalMarcadorVirtual.vue'
import ModalCamaraTransmision from '@/modules/streaming/components/ModalCamaraTransmision.vue'
import ModalTransmisionEnVivo from '@/modules/streaming/components/ModalTransmisionEnVivo.vue'
import ModalVincularCamara from '@/modules/streaming/components/ModalVincularCamara.vue'
import CardAvanceTorneo from './CardAvanceTorneo.vue'
import CardInfoRival from './CardInfoRival.vue'
import { useTorneoGrupo } from '@/modules/dashboard/composables/useTorneoGrupo'
import { useWebRTCStream } from '@/modules/streaming/composables/useWebRTCStream'
import type { Torneo, BurbujaRival, PartidoArbitrable, SetPartido, PartidoGrupo, MarcadorEnVivo } from '@/types'

const props = defineProps<{
  torneo: Torneo
}>()

defineEmits<{
  (e: 'volver'): void
}>()

const route = useRoute()
const router = useRouter()

const vistaGuardada = (route.query.vista as string) || localStorage.getItem('spinapp_torneo_tab')
const tabValida = (vistaGuardada === 'grafica' || vistaGuardada === 'posiciones' || vistaGuardada === 'playoffs') ? vistaGuardada : 'grafica'
const tabActiva = ref<'grafica' | 'posiciones' | 'playoffs'>(tabValida)

watch(tabActiva, (nuevaTab) => {
  try {
    localStorage.setItem('spinapp_torneo_tab', nuevaTab)
  } catch {
    // ignorar error
  }
  router.replace({ query: { ...route.query, vista: nuevaTab } })
})

const {
  usuarioActual,
  jugadores,
  jugadorEnCentro,
  rivalesPerimetro,
  rivalDeTurno,
  rondaActual,
  partidos,
  esVistaRival,
  verVistaRival,
  volverAMiVista,
  tablaPosiciones,
  arbitroActual,
  setArbitroActual,
  partidosDisponiblesParaArbitrar,
  validarCodigosArbitraje,
  actualizarMarcadorEnVivo,
  registrarResultadoPartido,
  registrarVictoriaPorWO,
  prorrogarPlazoPartido,
  jugadorMasMallero,
} = useTorneoGrupo(props.torneo)

const bolsaTotalCalculada = computed(() => {
  const costo = Number(props.torneo?.costoInscripcion) || 6000
  const total = Math.max(
    jugadores.value.length,
    tablaPosiciones.value.length,
    Number(props.torneo?.cuposTomados) || 0
  )
  return Math.max(0, total * costo)
})

const modalDetalleRef = ref<InstanceType<typeof ModalDetalleRival> | null>(null)
const modalMarcadorRef = ref<InstanceType<typeof ModalMarcadorRival> | null>(null)
const modalArbitrajeRef = ref<InstanceType<typeof ModalArbitraje> | null>(null)
const modalMarcadorVirtualRef = ref<InstanceType<typeof ModalMarcadorVirtual> | null>(null)

const burbujaSeleccionada = ref<BurbujaRival | null>(null)
const burbujaMarcadorSeleccionada = ref<BurbujaRival | null>(null)
const partidoEnMarcador = ref<PartidoArbitrable | null>(null)

const abrirModalArbitraje = () => {
  modalArbitrajeRef.value?.open()
}

const handleAbrirDetalleRival = (burbuja: BurbujaRival) => {
  burbujaSeleccionada.value = burbuja
  modalDetalleRef.value?.open()
}

const handleAbrirMarcadorRival = (burbuja: BurbujaRival) => {
  burbujaMarcadorSeleccionada.value = burbuja
  modalMarcadorRef.value?.open()
}

const handleValidarCodigos = async (
  datos: { partidoId: string; codigo1: string; codigo2: string },
  callback: (res: { valido: boolean; mensaje: string }) => void,
) => {
  try {
    const resultado = await validarCodigosArbitraje(datos.partidoId, datos.codigo1, datos.codigo2)
    callback(resultado)
  } catch (err: any) {
    console.error('Error al validar códigos:', err)
    callback({ valido: false, mensaje: err?.message || 'Error de conexión al validar códigos.' })
  }
}

const handleIniciarPartidoArbitrado = async (datos: { partidoArbitrable: PartidoArbitrable }) => {
  partidoEnMarcador.value = datos.partidoArbitrable
  await nextTick()
  modalMarcadorVirtualRef.value?.open(datos.partidoArbitrable)
}

const handleDeclararWalkover = (datos: {
  partidoId: string
  ganadorId: string
  perdedorId: string
  motivo: string
}) => {
  registrarVictoriaPorWO(datos.partidoId, datos.ganadorId, datos.perdedorId, datos.motivo)
}

const handleProrrogarPartido = async (datos: {
  partidoId: string
  horasExtra: number
}) => {
  await prorrogarPlazoPartido(datos.partidoId, datos.horasExtra)
}

const handlePartidoFinalizado = async (datos: {
  partidoId: string
  sets: SetPartido[]
  ganadorId: string
  esWalkover?: boolean
  marcador?: string
  marcadorDetallado?: string
  perdedorPorWId?: string
  ganadorBolaId?: string | null
}) => {
  if (transmitiendo.value) {
    await detenerTransmision()
    modalCamaraTransmisionRef.value?.close()
  }
  await registrarResultadoPartido(datos.partidoId, datos.sets, datos.ganadorId, datos)
}

const handleActualizarMarcadorEnVivo = async (datos: {
  partidoId: string
  marcadorEnVivo: MarcadorEnVivo
}) => {
  await actualizarMarcadorEnVivo(datos.partidoId, datos.marcadorEnVivo)
}

// ==========================================
// LÓGICA DE TRANSMISIÓN EN VIVO (WEBRTC)
// ==========================================
const {
  streamLocal,
  streamRemoto,
  transmitiendo,
  conectadoComoEspectador,
  cargandoConexion,
  errorStreaming,
  camaraTrasera,
  audioActivo,
  videoActivo,
  totalEspectadores,
  tiempoTranscurridoFormateado,
  diagnosticoEmisor,
  iniciarTransmision,
  detenerTransmision,
  alternarCamara,
  alternarAudio,
  alternarVideo,
  cambiarModoCalidad,
  conectarComoEspectador,
  desconectarEspectador,
} = useWebRTCStream()

const modalCamaraTransmisionRef = ref<InstanceType<typeof ModalCamaraTransmision> | null>(null)
const modalTransmisionEnVivoRef = ref<InstanceType<typeof ModalTransmisionEnVivo> | null>(null)
const modalVincularCamaraRef = ref<InstanceType<typeof ModalVincularCamara> | null>(null)

const errorAlertaToast = ref('')
let timerToast: any = null

const mostrarAlertaElegante = (msj: string) => {
  errorAlertaToast.value = msj
  if (timerToast) clearTimeout(timerToast)
  timerToast = setTimeout(() => {
    errorAlertaToast.value = ''
  }, 5000)
}

const partidoTransmitiendo = ref<PartidoGrupo | null>(null)
const partidoSintonizado = ref<PartidoGrupo | null>(null)

// Partidos en curso del torneo para vincular trípode
const partidosEnCursoTorneo = computed(() => {
  return partidos.value.filter((p) => p.estado === 'en_curso')
})

const handleAbrirVincularCamara = (partido?: PartidoGrupo) => {
  modalVincularCamaraRef.value?.open(partido)
}

const handleAbrirVincularCamaraGeneral = () => {
  modalVincularCamaraRef.value?.open()
}

const handleCamaraVinculadaExito = async (payload: { partido: PartidoGrupo; codigo: string }) => {
  partidoTransmitiendo.value = payload.partido
  const camNombre = 'Cámara ' + (payload.partido.mesa || 'Mesa')
  const camId = 'cam_' + Date.now()

  try {
    const ok = await iniciarTransmision(
      payload.partido.id,
      {
        id: camId,
        nombre: camNombre,
      },
      'environment',
      { ...payload.partido, torneoId: props.torneo.id },
    )

    if (ok) {
      await nextTick()
      modalCamaraTransmisionRef.value?.open()
    } else {
      const msj = errorStreaming.value || 'No se pudo acceder a la cámara o micrófono. Permite los permisos del navegador e inténtalo de nuevo.'
      mostrarAlertaElegante(`Transmisión: ${msj}`)
    }
  } catch (err: any) {
    console.error('Error al iniciar transmisión como cámara de mesa:', err)
    mostrarAlertaElegante(`Error al iniciar cámara: ${err?.message || 'Permiso denegado'}`)
  }
}

// Mantener reactivo el partido en transmisión cuando cambian los puntos o sets
watch(
  partidos,
  (nuevosPartidos) => {
    if (partidoTransmitiendo.value) {
      const matchActualizado = nuevosPartidos.find((p) => p.id === partidoTransmitiendo.value?.id)
      if (matchActualizado) {
        partidoTransmitiendo.value = matchActualizado
      }
    }
  },
  { deep: true },
)

const abrirModalTransmisionDirecta = () => {
  abrirModalArbitraje()
}

// Identificar todos los partidos del torneo que están transmitiéndose en vivo simultáneamente
const partidoSeleccionadoTransmisionId = ref<string | null>(null)

const partidosEnTransmisionActivos = computed<PartidoGrupo[]>(() => {
  const ahora = Date.now()
  const mapPartidos = new Map<string, PartidoGrupo>()

  // Si el usuario actual está transmitiendo, incluir su partido primero
  if (transmitiendo.value && partidoTransmitiendo.value) {
    mapPartidos.set(partidoTransmitiendo.value.id, partidoTransmitiendo.value)
  }

  partidos.value.forEach((p) => {
    if ((!p.transmisionActiva && !p.enVivo) || p.estado === 'jugado') return
    const rawSenal = p.ultimaSenalEnVivo as any
    const ultimaSenal = typeof rawSenal === 'number'
      ? rawSenal
      : rawSenal?.toMillis ? rawSenal.toMillis() : 0
    if (ultimaSenal && ahora - ultimaSenal > 300000) return
    if (!mapPartidos.has(p.id)) {
      mapPartidos.set(p.id, p)
    }
  })

  return Array.from(mapPartidos.values())
})

// Partido activo enfocado en el banner
const partidoEnTransmisionActivo = computed<PartidoGrupo | null>(() => {
  if (partidoSeleccionadoTransmisionId.value) {
    const encontrado = partidosEnTransmisionActivos.value.find((p) => p.id === partidoSeleccionadoTransmisionId.value)
    if (encontrado) return encontrado
  }
  return partidosEnTransmisionActivos.value[0] || null
})

// Determina si el usuario actual es el autor/administrador de la transmisión activa
const esMiTransmision = computed(() => {
  if (!partidoEnTransmisionActivo.value) return false
  const p = partidoEnTransmisionActivo.value
  const usuarioId = usuarioActual?.id
  const arbitroId = arbitroActual.value?.id
  return (
    transmitiendo.value ||
    (partidoTransmitiendo.value && partidoTransmitiendo.value.id === p.id) ||
    Boolean(p.transmisorId && (p.transmisorId === usuarioId || p.transmisorId === arbitroId))
  )
})

// Abre o reconecta la cámara del emisor
const abrirOCrearMiCamaraTransmision = async () => {
  const p = partidoEnTransmisionActivo.value || partidoTransmitiendo.value
  if (p) {
    partidoTransmitiendo.value = p
  }

  // 1. Abrir el modal DE INMEDIATO para dar feedback instantáneo al usuario
  await nextTick()
  modalCamaraTransmisionRef.value?.open()

  // 2. Si ya tenemos stream local activo, no reiniciar
  if (transmitiendo.value && streamLocal.value) {
    return
  }

  // 3. Conectar cámara y señalización en segundo plano
  if (p) {
    const adminNombre = arbitroActual.value?.nombre || usuarioActual?.nombre || 'Administrador'
    const adminId = arbitroActual.value?.id || usuarioActual?.id || 'admin'
    try {
      await iniciarTransmision(p.id, { id: adminId, nombre: adminNombre }, undefined, { ...p, torneoId: props.torneo.id })
    } catch (err: any) {
      console.warn('Error al iniciar cámara:', err)
    }
  }
}

// Iniciar transmisión desde ModalArbitraje (después de validar los PINs o selección directa)
const handleIniciarTransmisionArbitrado = async (datos: { partidoArbitrable: PartidoArbitrable }) => {
  const adminNombre = arbitroActual.value?.nombre || usuarioActual?.nombre || 'Administrador'
  const adminId = arbitroActual.value?.id || usuarioActual?.id || 'admin'
  partidoTransmitiendo.value = datos.partidoArbitrable.partido

  try {
    const ok = await iniciarTransmision(datos.partidoArbitrable.partido.id, {
      id: adminId,
      nombre: adminNombre,
    }, undefined, { ...datos.partidoArbitrable.partido, torneoId: props.torneo.id })

    if (ok) {
      await nextTick()
      modalCamaraTransmisionRef.value?.open()
    } else {
      const msj = errorStreaming.value || 'No se pudo acceder a la cámara o micrófono. Por favor permite los permisos del navegador e inténtalo de nuevo.'
      mostrarAlertaElegante(`Transmisión: ${msj}`)
    }
  } catch (err: any) {
    console.error('Error al iniciar transmisión:', err)
    mostrarAlertaElegante(`Error al iniciar la cámara: ${err?.message || 'Permiso denegado o dispositivo ocupado.'}`)
  }
}

// Iniciar transmisión directamente desde el marcador virtual activo
const handleIniciarTransmisionDesdeMarcador = async (match: PartidoArbitrable) => {
  const adminNombre = arbitroActual.value?.nombre || usuarioActual?.nombre || 'Árbitro'
  const adminId = arbitroActual.value?.id || usuarioActual?.id || 'arbitro'
  partidoTransmitiendo.value = match.partido

  try {
    const ok = await iniciarTransmision(match.partido.id, {
      id: adminId,
      nombre: adminNombre,
    }, undefined, { ...match.partido, torneoId: props.torneo.id })

    if (ok) {
      await nextTick()
      modalCamaraTransmisionRef.value?.open()
    } else {
      mostrarAlertaElegante(`Transmisión: ${errorStreaming.value || 'No se pudo acceder a la cámara o micrófono.'}`)
    }
  } catch (err: any) {
    mostrarAlertaElegante(`Error al iniciar cámara: ${err?.message || 'Permiso denegado'}`)
  }
}

// Detener transmisión activa
const handleDetenerTransmision = async () => {
  await detenerTransmision()
  partidoTransmitiendo.value = null
}

// Sintonizar transmisión como espectador
const sintonizarTransmision = async (partido: PartidoGrupo) => {
  partidoSintonizado.value = partido
  const viewerNombre = usuarioActual?.nombre || 'Espectador'
  const viewerId = usuarioActual?.id || `viewer_${Date.now()}`

  modalTransmisionEnVivoRef.value?.open()
  await conectarComoEspectador(partido.id, {
    id: viewerId,
    nombre: viewerNombre,
  })
}

// Cerrar reproductor de espectador
const handleCerrarEspectador = () => {
  desconectarEspectador()
  partidoSintonizado.value = null
}


// Limpieza automática al salir o cambiar de vista
onUnmounted(() => {
  if (transmitiendo.value) {
    detenerTransmision()
  }
  if (conectadoComoEspectador.value) {
    desconectarEspectador()
  }
})
</script>

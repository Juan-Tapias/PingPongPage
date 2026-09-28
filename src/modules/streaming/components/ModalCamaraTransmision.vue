<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="visible"
        ref="modalContenedorRef"
        :class="[
          'fixed inset-0 z-[70] flex items-center justify-center select-none overflow-y-auto transition-all',
          esPantallaCompleta ? 'p-0 bg-black' : 'p-2 sm:p-4 bg-black/90 backdrop-blur-md'
        ]"
      >
        <div
          :class="[
            'relative w-full bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden flex flex-col transition-all',
            esPantallaCompleta
              ? 'w-screen h-[100dvh] max-w-none max-h-none rounded-none border-none bg-black flex flex-col'
              : `w-full ${mostrarChat ? 'max-w-6xl xl:max-w-7xl' : 'max-w-5xl'} rounded-none sm:rounded-2xl lg:rounded-3xl border-0 sm:border border-slate-800 shadow-2xl h-[100dvh] sm:h-[86vh] lg:h-[88vh] sm:max-h-[880px] flex flex-col transition-all duration-300 overflow-hidden`
          ]"
        >
          <!-- CABECERA DE TRANSMISIÓN -->
          <div
            class="flex items-center justify-between px-2.5 sm:px-5 py-2 sm:py-3.5 bg-slate-900/90 border-b border-slate-800/80 z-20 gap-1.5"
          >
            <!-- Badge En Vivo, Temporizador 1 Hora y Espectadores -->
            <div class="flex items-center gap-1.5 sm:gap-3 flex-wrap min-w-0">
              <span
                class="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs shrink-0"
              >
                <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                <span class="hidden xs:inline">Transmitiendo </span>En Vivo
              </span>

              <!-- Límite de llamada: 1 hora -->
              <span
                class="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 shrink-0"
                title="Límite máximo de llamada: 1 hora (60 minutos)"
              >
                <Clock class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                <span>{{ tiempoTranscurridoInterno || tiempoFormateado || '00:00' }}</span>
                <span class="hidden sm:inline"> / 60:00</span>
              </span>

              <span
                class="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold text-slate-300 bg-slate-800/80 border border-slate-700/60 shrink-0"
              >
                <Users class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" />
                <span>{{ totalEspectadores }}</span>
                <span class="hidden xs:inline"> {{ totalEspectadores === 1 ? 'espectador' : 'espectadores' }}</span>
              </span>

              <!-- Indicador interactivo de diagnóstico en el celular -->
              <button
                type="button"
                class="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all cursor-pointer border active:scale-95 select-none shadow-xs shrink-0"
                :class="badgeDiagnosticoClases"
                title="Toca para ver el diagnóstico de red, latencia y bitrate en vivo"
                @click="mostrarDiagnostico = !mostrarDiagnostico"
              >
                <Activity class="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse" :class="colorPuntoCalidad" />
                <span>{{ diagnosticoActual.latenciaMs }}ms</span>
                <span class="hidden sm:inline font-mono opacity-80">| {{ diagnosticoActual.fps }}fps</span>
                <span class="text-[9px] uppercase px-1 py-0.2 rounded font-black tracking-wider ml-0.5 hidden xs:inline" :class="textoCalidadClases">
                  {{ etiquetaCalidad }}
                </span>
              </button>
            </div>

            <!-- Botones de Acción Rápida -->
            <div class="flex items-center gap-1 sm:gap-2 shrink-0">
              <!-- Botón Pantalla Completa en Celular -->
              <button
                type="button"
                class="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white font-extrabold text-xs transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                :title="esPantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa para el celular'"
                @click="alternarPantallaCompleta"
              >
                <Minimize v-if="esPantallaCompleta" class="w-3.5 h-3.5" />
                <Maximize v-else class="w-3.5 h-3.5" />
                <span class="hidden md:inline">{{ esPantallaCompleta ? 'Reducir' : 'Completa' }}</span>
              </button>

              <button
                type="button"
                class="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 font-extrabold text-xs transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
                title="Minimizar cámara (seguirás transmitiendo en segundo plano)"
                @click="visible = false"
              >
                <Minimize2 class="w-3.5 h-3.5" />
                <span class="hidden sm:inline">Minimizar</span>
              </button>

              <button
                type="button"
                class="px-2.5 py-1.5 sm:px-3 sm:py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-extrabold text-xs transition-all flex items-center gap-1.5 shadow-md cursor-pointer"
                @click="confirmarFinalizarTransmision"
              >
                <Square class="w-3 h-3 fill-current" />
                <span class="hidden xs:inline">Finalizar</span>
              </button>
            </div>
          </div>

          <!-- CONTENEDOR FLEX: CÁMARA LOCAL + CHAT LATERAL (DESKTOP) / INFERIOR (MÓVIL) -->
          <div class="relative flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0 w-full">
            <!-- ÁREA DE VIDEO / CÁMARA LOCAL -->
            <div
              :class="[
                'relative w-full bg-black flex items-center justify-center overflow-hidden group select-none min-h-0 min-w-0 transition-all',
                esPantallaCompleta
                  ? 'flex-1 h-full'
                  : 'w-full shrink-0 aspect-video max-h-[38vh] sm:max-h-[46vh] lg:max-h-none lg:aspect-auto lg:flex-1 lg:h-full'
              ]"
              @dblclick="alternarPantallaCompleta"
            >
            <!-- Video en tiempo real del emisor -->
            <video
              ref="videoElementRef"
              autoplay
              playsinline
              muted
              class="w-full h-full object-cover transform transition-transform"
              :class="{ '-scale-x-100': !camaraTrasera }"
            ></video>

            <!-- Overlay cuando el stream local está inicializándose -->
            <div
              v-if="!streamLocal"
              class="absolute inset-0 bg-slate-950/95 flex flex-col items-center justify-center gap-3 text-slate-300 p-4 text-center z-10"
            >
              <div class="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
              <p class="text-xs font-black uppercase tracking-wider text-emerald-400">
                Iniciando Cámara y Micrófono...
              </p>
              <p class="text-[11px] text-slate-400 max-w-xs">
                Asegúrate de conceder permisos de cámara y micrófono si tu navegador lo solicita.
              </p>
            </div>

            <!-- Overlay cuando el video está desactivado -->
            <div
              v-else-if="!videoActivo"
              class="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2 text-slate-400"
            >
              <VideoOff class="w-12 h-12 text-slate-600" />
              <p class="text-xs font-bold uppercase tracking-wider">Cámara en Pausa</p>
            </div>

            <!-- AVISO FLOTANTE DE CAPTURA DE CLIP -->
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 -translate-y-2 scale-95"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 -translate-y-2 scale-95"
            >
              <div
                v-if="feedbackClip"
                class="absolute top-16 left-1/2 -translate-x-1/2 z-40 px-3.5 py-2 rounded-full bg-slate-950/95 backdrop-blur-md border border-amber-500/40 text-white shadow-2xl text-xs font-bold flex items-center gap-2 pointer-events-auto"
              >
                <Film class="w-3.5 h-3.5 text-amber-400 shrink-0" />
                <span>{{ feedbackClip }}</span>
              </div>
            </Transition>

            <!-- MARCADOR DEPORTIVO SUPERPUESTO (HUD OFICIAL DE TV) -->
            <div
              v-if="partidoActivo"
              class="absolute top-2 left-2 sm:top-4 sm:left-4 z-10 flex flex-col gap-1 max-w-[85%] sm:max-w-md pointer-events-none drop-shadow-2xl"
            >
              <div
                class="bg-black/80 backdrop-blur-md border border-white/20 rounded-xl overflow-hidden shadow-2xl text-white"
              >
                <!-- Jugador 1 -->
                <div
                  class="flex items-center justify-between px-2 sm:px-3.5 py-1 sm:py-1.5 border-b border-white/10 gap-2 sm:gap-3"
                  :class="{ 'bg-emerald-500/20': Number(puntosJ1) > Number(puntosJ2) }"
                >
                  <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span class="w-2 h-2 rounded-full bg-emerald-400 shrink-0"></span>
                    <span v-if="servidorActual === 1" class="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.2 rounded font-black bg-amber-400 text-slate-950 uppercase tracking-wider shrink-0" title="Saque">SAQUE</span>
                    <span class="text-xs sm:text-sm font-black truncate max-w-24 xs:max-w-36 sm:max-w-44">
                      {{ partidoActivo.jugador1?.nombre || 'Jugador 1' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1.5 sm:gap-2 font-mono font-black text-xs sm:text-sm shrink-0">
                    <span class="text-slate-400 text-[10px] sm:text-xs">({{ setsGanadosJ1 }})</span>
                    <span class="px-1.5 sm:px-2 py-0.5 rounded bg-white/10 text-white min-w-5 sm:min-w-6 text-center">
                      {{ puntosJ1 }}
                    </span>
                  </div>
                </div>

                <!-- Jugador 2 -->
                <div
                  class="flex items-center justify-between px-2 sm:px-3.5 py-1 sm:py-1.5 gap-2 sm:gap-3"
                  :class="{ 'bg-sky-500/20': Number(puntosJ2) > Number(puntosJ1) }"
                >
                  <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
                    <span class="w-2 h-2 rounded-full bg-sky-400 shrink-0"></span>
                    <span v-if="servidorActual === 2" class="text-[8px] sm:text-[9px] px-1.5 py-0.2 rounded font-black bg-amber-400 text-slate-950 uppercase tracking-wider shrink-0" title="Saque">SAQUE</span>
                    <span class="text-xs sm:text-sm font-black truncate max-w-24 xs:max-w-36 sm:max-w-44">
                      {{ partidoActivo.jugador2?.nombre || 'Jugador 2' }}
                    </span>
                  </div>
                  <div class="flex items-center gap-1.5 sm:gap-2 font-mono font-black text-xs sm:text-sm shrink-0">
                    <span class="text-slate-400 text-[10px] sm:text-xs">({{ setsGanadosJ2 }})</span>
                    <span class="px-1.5 sm:px-2 py-0.5 rounded bg-white/10 text-white min-w-5 sm:min-w-6 text-center">
                      {{ puntosJ2 }}
                    </span>
                  </div>
                </div>
              </div>

              <!-- Badge de Ronda / Estado / Mesa -->
              <div class="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-black uppercase text-white/90">
                <span class="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs border border-white/10 text-emerald-400 font-bold">
                  {{ marcadorEnVivo?.setActual || 'Set 1' }}
                </span>
                <span class="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs border border-white/10">
                  {{ marcadorEnVivo?.mesa || partidoActivo.mesa || 'Mesa 1' }}
                </span>
                <span class="px-2 py-0.5 rounded bg-black/60 backdrop-blur-xs border border-white/10">
                  Ronda {{ partidoActivo.ronda || partidoActivo.jornada || 1 }}
                </span>
              </div>
            </div>

            <!-- PANEL FLOTANTE DE DIAGNÓSTICO DEL CELULAR EN TIEMPO REAL -->
            <Transition
              enter-active-class="transition duration-200 ease-out"
              enter-from-class="opacity-0 translate-y-3 scale-95"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition duration-150 ease-in"
              leave-from-class="opacity-100 translate-y-0 scale-100"
              leave-to-class="opacity-0 translate-y-3 scale-95"
            >
              <div
                v-if="mostrarDiagnostico"
                class="absolute bottom-3 inset-x-3 sm:inset-x-auto sm:right-4 z-40 max-w-sm w-full bg-slate-950/95 backdrop-blur-xl border border-slate-700/80 rounded-2xl shadow-2xl p-3.5 text-white animate-in select-none"
              >
                <div class="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div class="flex items-center gap-2">
                    <span class="w-2.5 h-2.5 rounded-full" :class="puntoCalidadBg"></span>
                    <h5 class="text-xs font-black uppercase tracking-wider text-slate-200">
                      Diagnóstico de Transmisión
                    </h5>
                  </div>
                  <button
                    type="button"
                    class="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                    @click="mostrarDiagnostico = false"
                  >
                    <X class="w-4 h-4" />
                  </button>
                </div>

                <!-- Métricas Grid -->
                <div class="grid grid-cols-2 gap-2 my-2.5">
                  <div class="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Latencia (Ping RTT)</span>
                    <span class="text-base font-black font-mono" :class="colorLatenciaTexto">
                      {{ diagnosticoActual.latenciaMs }} ms
                    </span>
                    <span class="text-[9px] text-slate-500 font-medium">Baja latencia P2P</span>
                  </div>

                  <div class="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Subida (Bitrate)</span>
                    <span class="text-base font-black font-mono text-sky-400">
                      {{ diagnosticoActual.bitrateKbps }} kbps
                    </span>
                    <span class="text-[9px] text-slate-500 font-medium">Consumo de red</span>
                  </div>

                  <div class="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Fluidez (FPS)</span>
                    <span class="text-base font-black font-mono text-emerald-400">
                      {{ diagnosticoActual.fps }} fps
                    </span>
                    <span class="text-[9px] text-slate-500 font-medium">Velocidad de bola</span>
                  </div>

                  <div class="p-2 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col">
                    <span class="text-[10px] uppercase font-bold text-slate-400">Resolución</span>
                    <span class="text-xs font-black font-mono text-slate-200 mt-1">
                      {{ diagnosticoActual.resolucion }}
                    </span>
                    <span class="text-[9px] text-slate-500 font-medium">Formato cámara</span>
                  </div>
                </div>

                <!-- Estado de Red y Recomendación -->
                <div class="p-2 rounded-xl text-[11px] leading-tight flex items-start gap-2" :class="bannerSaludClases">
                  <span class="text-sm mt-0.5">{{ iconoSalud }}</span>
                  <div class="flex-1">
                    <p class="font-bold">{{ tituloSalud }}</p>
                    <p class="text-[10px] opacity-90 mt-0.5">{{ descripcionSalud }}</p>
                  </div>
                </div>

                <!-- Selector de Modo de Latencia y Calidad -->
                <div class="mt-2.5 pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                  <span class="text-[10px] font-bold text-slate-400">Modo de Video:</span>
                  <div class="flex items-center gap-1">
                    <button
                      type="button"
                      class="px-2 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer border"
                      :class="diagnosticoActual.modoLatencia === 'ultra_baja' ? 'bg-amber-500 text-black border-amber-400 shadow-xs' : 'bg-slate-800 text-slate-300 border-slate-700'"
                      @click="emit('cambiar-calidad', 'ultra_baja')"
                    >
                      ⚡ Ultra Rápido
                    </button>
                    <button
                      type="button"
                      class="px-2 py-1 rounded-lg text-[10px] font-black uppercase transition-all cursor-pointer border"
                      :class="diagnosticoActual.modoLatencia === 'estandar' ? 'bg-sky-500 text-white border-sky-400 shadow-xs' : 'bg-slate-800 text-slate-300 border-slate-700'"
                      @click="emit('cambiar-calidad', 'estandar')"
                    >
                      🎬 HD 720p
                    </button>
                  </div>
                </div>
              </div>
            </Transition>
            </div>

            <!-- CHAT EN VIVO PARA EL TRANSMISOR (INTEGRADO EN LAYOUT RESPONSIVE) -->
            <ChatTransmisionEnVivo
              v-if="mostrarChat"
              :partido-id="partidoActivo?.id || (partidoActivo as any)?.partidoId || partido?.id || (partido as any)?.partidoId"
              :partido="partidoActivo || partido"
              :es-pantalla-completa="esPantallaCompleta"
              @cerrar-chat="mostrarChat = false"
            />
          </div>

          <!-- BARRA DE CONTROLES INFERIOR (100% RESPONSIVE) -->
          <div
            class="p-3 sm:p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 z-20"
          >
            <!-- Controles de Medios Hardware -->
            <div class="flex items-center gap-2 flex-wrap">
              <!-- Alternar Cámara (Frontal / Trasera) -->
              <button
                type="button"
                class="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-white text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border border-slate-700/60 shadow-xs"
                :title="camaraTrasera ? 'Cambiar a cámara frontal' : 'Cambiar a cámara trasera'"
                @click="alternarCamara"
              >
                <SwitchCamera class="w-4 h-4 text-sky-400" />
                <span class="hidden xs:inline">{{ camaraTrasera ? 'Cámara Trasera' : 'Cámara Frontal' }}</span>
              </button>

              <!-- Silenciar / Activar Micrófono -->
              <button
                type="button"
                class="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer border shadow-xs"
                :class="audioActivo ? 'bg-emerald-950/40 hover:bg-emerald-900/50 text-emerald-300 border-emerald-500/50' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'"
                @click="alternarAudio"
              >
                <Mic v-if="audioActivo" class="w-4 h-4 text-emerald-400" />
                <MicOff v-else class="w-4 h-4 text-rose-400" />
                <span>{{ audioActivo ? 'Micrófono ON' : 'Mic Silenciado' }}</span>
              </button>

              <!-- Pausar / Activar Video -->
              <button
                type="button"
                class="p-2 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer border shadow-xs"
                :class="videoActivo ? 'bg-slate-800 hover:bg-slate-700 text-white border-slate-700/60' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'"
                @click="alternarVideo"
              >
                <Video v-if="videoActivo" class="w-4 h-4 text-emerald-400" />
                <VideoOff v-else class="w-4 h-4 text-rose-400" />
                <span class="hidden sm:inline">{{ videoActivo ? 'Cámara ON' : 'Cámara OFF' }}</span>
              </button>

              <!-- Ver / Ocultar Chat en Vivo del Partido -->
              <button
                type="button"
                class="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer border shadow-xs"
                :class="mostrarChat ? 'bg-sky-500/20 text-sky-300 border-sky-500/40 shadow-xs' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700/60'"
                title="Ver mensajes de espectadores en vivo"
                @click="mostrarChat = !mostrarChat"
              >
                <MessageSquare class="w-4 h-4 text-sky-400" />
                <span>Chat</span>
              </button>

              <!-- Capturar Clip de 15s para la Biblioteca -->
              <button
                type="button"
                class="px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 sm:gap-2 transition-all cursor-pointer border shadow-xs select-none"
                :class="estaGrabandoClip ? 'bg-rose-600 text-white border-rose-400 animate-pulse' : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700/60'"
                :title="estaGrabandoClip ? 'Grabando clip... clic para terminar ahora' : 'Grabar clip destacado (15s)'"
                @click="alternarCapturaClip"
              >
                <span v-if="estaGrabandoClip" class="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <Scissors v-else class="w-4 h-4 text-amber-400" />
                <span v-if="estaGrabandoClip" class="font-mono text-white">{{ segundosGrabadosClip }}s REC</span>
                <span v-else class="hidden xs:inline">Grabar Clip</span>
              </button>
            </div>

            <p class="text-[11px] text-slate-400 font-medium text-right hidden md:block">
              Consejo: Ubica el celular en posición horizontal apuntando a la mesa de ping pong.
            </p>
          </div>

        </div>
      </div>
    </Transition>

    <!-- MODAL DE CONFIRMACIÓN ELEGANTE: FINALIZAR TRANSMISIÓN -->
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0 scale-95"
      enter-to-class="opacity-100 scale-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100 scale-100"
      leave-to-class="opacity-0 scale-95"
    >
      <div
        v-if="mostrarModalConfirmacion"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
        @click.self="mostrarModalConfirmacion = false"
      >
        <div
          class="w-full max-w-sm sm:max-w-md bg-slate-900 border border-slate-700/80 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.85)] ring-1 ring-white/10 text-white flex flex-col gap-4 text-center select-none"
        >
          <!-- Ícono de alerta en vivo -->
          <div class="mx-auto w-12 h-12 rounded-2xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400 shadow-lg shadow-rose-950/40">
            <Square class="w-5 h-5 fill-current" />
          </div>

          <!-- Textos -->
          <div class="space-y-1.5">
            <h3 class="text-base sm:text-lg font-black tracking-tight text-white">
              ¿Finalizar transmisión en vivo?
            </h3>
            <p class="text-xs sm:text-sm text-slate-400 font-medium leading-relaxed">
              La señal de video y audio se cerrará para todos los espectadores conectados a esta mesa.
            </p>
          </div>

          <!-- Botones de Acción -->
          <div class="flex items-center gap-2.5 pt-1.5">
            <button
              type="button"
              class="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 active:scale-95 text-slate-300 hover:text-white font-bold text-xs transition-all cursor-pointer border border-slate-700"
              @click="mostrarModalConfirmacion = false"
            >
              Cancelar
            </button>
            <button
              type="button"
              class="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 active:scale-95 text-white font-black text-xs transition-all cursor-pointer shadow-lg shadow-rose-950/40 border border-rose-500/50"
              @click="ejecutarFinalizarTransmision"
            >
              Sí, Finalizar
            </button>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'
import {
  Users,
  Square,
  SwitchCamera,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Clock,
  Minimize2,
  Maximize,
  Minimize,
  Activity,
  X,
  Zap,
  MessageSquare,
  Scissors,
  Film,
} from 'lucide-vue-next'
import { doc, onSnapshot, setDoc, type Unsubscribe } from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { PartidoGrupo } from '@/types'
import type { DiagnosticoStream } from '@/modules/streaming/composables/useWebRTCStream'
import { useGrabadorClips } from '../composables/useGrabadorClips'
import ChatTransmisionEnVivo from './ChatTransmisionEnVivo.vue'

const props = defineProps<{
  partido: PartidoGrupo | null
  streamLocal: MediaStream | null
  totalEspectadores: number
  camaraTrasera: boolean
  audioActivo: boolean
  videoActivo: boolean
  tiempoFormateado?: string
  diagnostico?: DiagnosticoStream
}>()

const emit = defineEmits<{
  (e: 'finalizar'): void
  (e: 'alternar-camara'): void
  (e: 'alternar-audio'): void
  (e: 'alternar-video'): void
  (e: 'cambiar-calidad', modo: 'ultra_baja' | 'estandar'): void
}>()

const visible = ref(false)
const modalContenedorRef = ref<HTMLDivElement | null>(null)
const videoElementRef = ref<HTMLVideoElement | null>(null)
const mostrarDiagnostico = ref(false)
const esPantallaCompleta = ref(false)
const mostrarChat = ref(false)

// Screen Wake Lock API: Mantiene la pantalla encendida en teléfonos móviles sobre trípode
let wakeLockSentinel: any = null

const solicitarWakeLock = async () => {
  try {
    if (typeof navigator !== 'undefined' && 'wakeLock' in navigator) {
      wakeLockSentinel = await (navigator as any).wakeLock.request('screen')
      wakeLockSentinel.addEventListener('release', () => {
        wakeLockSentinel = null
      })
    }
  } catch (err) {
    console.warn('[ModalCamaraTransmision] WakeLock no disponible o bloqueado:', err)
  }
}

const liberarWakeLock = async () => {
  if (wakeLockSentinel) {
    try {
      await wakeLockSentinel.release()
    } catch {}
    wakeLockSentinel = null
  }
}

const handleVisibilityChangeWakeLock = () => {
  if (document.visibilityState === 'visible' && visible.value) {
    solicitarWakeLock()
  }
}

const diagnosticoActual = computed<DiagnosticoStream>(() => {
  return props.diagnostico || {
    calidad: 'excelente',
    latenciaMs: 18,
    bitrateKbps: 850,
    fps: 30,
    resolucion: '1280x720',
    paquetesPerdidos: 0,
    espectadoresActivos: props.totalEspectadores,
    modoLatencia: 'ultra_baja',
  }
})

const badgeDiagnosticoClases = computed(() => {
  const c = diagnosticoActual.value.calidad
  if (c === 'excelente') return 'bg-emerald-950/60 text-emerald-300 border-emerald-500/50 hover:bg-emerald-900/60'
  if (c === 'buena') return 'bg-sky-950/60 text-sky-300 border-sky-500/50 hover:bg-sky-900/60'
  if (c === 'regular') return 'bg-amber-950/60 text-amber-300 border-amber-500/50 hover:bg-amber-900/60'
  return 'bg-rose-950/60 text-rose-300 border-rose-500/50 hover:bg-rose-900/60'
})

const colorPuntoCalidad = computed(() => {
  const c = diagnosticoActual.value.calidad
  if (c === 'excelente') return 'text-emerald-400'
  if (c === 'buena') return 'text-sky-400'
  if (c === 'regular') return 'text-amber-400'
  return 'text-rose-400'
})

const puntoCalidadBg = computed(() => {
  const c = diagnosticoActual.value.calidad
  if (c === 'excelente') return 'bg-emerald-500'
  if (c === 'buena') return 'bg-sky-500'
  if (c === 'regular') return 'bg-amber-500'
  return 'bg-rose-500'
})

const textoCalidadClases = computed(() => {
  const c = diagnosticoActual.value.calidad
  if (c === 'excelente') return 'bg-emerald-500/20 text-emerald-300'
  if (c === 'buena') return 'bg-sky-500/20 text-sky-300'
  if (c === 'regular') return 'bg-amber-500/20 text-amber-300'
  return 'bg-rose-500/20 text-rose-300'
})

const etiquetaCalidad = computed(() => {
  const c = diagnosticoActual.value.calidad
  if (c === 'excelente') return 'Excelente'
  if (c === 'buena') return 'Buena'
  if (c === 'regular') return 'Estable'
  return 'Inestable'
})

const colorLatenciaTexto = computed(() => {
  const ms = diagnosticoActual.value.latenciaMs
  if (ms < 80) return 'text-emerald-400'
  if (ms < 180) return 'text-sky-400'
  if (ms < 280) return 'text-amber-400'
  return 'text-rose-400'
})

const bannerSaludClases = computed(() => {
  const c = diagnosticoActual.value.calidad
  if (c === 'excelente') return 'bg-emerald-950/40 border border-emerald-500/30 text-emerald-200'
  if (c === 'buena') return 'bg-sky-950/40 border border-sky-500/30 text-sky-200'
  if (c === 'regular') return 'bg-amber-950/40 border border-amber-500/30 text-amber-200'
  return 'bg-rose-950/40 border border-rose-500/30 text-rose-200'
})

const iconoSalud = computed(() => {
  const c = diagnosticoActual.value.calidad
  if (c === 'excelente') return '🚀'
  if (c === 'buena') return '⚡'
  if (c === 'regular') return '⚠️'
  return '🚨'
})

const tituloSalud = computed(() => {
  const c = diagnosticoActual.value.calidad
  if (c === 'excelente') return 'Transmisión fluida sin retardo'
  if (c === 'buena') return 'Conexión estable'
  if (c === 'regular') return 'Retardo moderado detectado'
  return 'Alerta: Red móvil saturada'
})

const descripcionSalud = computed(() => {
  const c = diagnosticoActual.value.calidad
  if (c === 'excelente') return 'El video se transmite en tiempo real (<80ms). Ideal para ping-pong.'
  if (c === 'buena') return 'Los espectadores ven los puntos con sincronización adecuada.'
  if (c === 'regular') return 'La velocidad de subida del móvil es justa. Considera activar el Modo Ultra Rápido.'
  return 'Subida lenta o pérdida de paquetes. Recomendamos cambiar a "Ultra Rápido" o acercarse al Wi-Fi.'
})

// Temporizador visual interno del modal
const segundosModal = ref(0)
let timerModal: any = null

const tiempoTranscurridoInterno = computed(() => {
  const mins = Math.floor(segundosModal.value / 60)
  const secs = segundosModal.value % 60
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
})

// Sincronización en tiempo real del partido y marcador en vivo
const partidoRealTime = ref<any>(null)
let unsubPartido: Unsubscribe | null = null
let syncBroadcastTimer: any = null

const sincronizarEstadoTransmisionEnFirestore = async () => {
  const p = props.partido
  if (!p?.id || !visible.value) return

  const ahora = Date.now()
  const payload: any = {
    estado: 'en_curso',
    enVivo: true,
    transmisionActiva: true,
    ultimaSenalEnVivo: ahora,
    mesa: p.mesa || 'Mesa 1',
  }

  const pAny = p as any
  if (p.jugador1) payload.jugador1 = p.jugador1
  if (p.jugador2) payload.jugador2 = p.jugador2
  if (p.jugador1Id) payload.jugador1Id = p.jugador1Id
  if (p.jugador2Id) payload.jugador2Id = p.jugador2Id
  if (pAny.torneoId) payload.torneoId = pAny.torneoId
  if (p.ronda) payload.ronda = p.ronda
  if (p.jornada) payload.jornada = p.jornada
  if (p.numeroPartido) payload.numeroPartido = p.numeroPartido
  if (p.marcadorEnVivo) payload.marcadorEnVivo = p.marcadorEnVivo

  try {
    await setDoc(doc(db, 'partidos', p.id), payload, { merge: true })
  } catch (err: any) {
    console.warn('[ModalCamaraTransmision] Error al registrar partido activo en Firestore:', err)
    if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota exceeded')) {
      if (syncBroadcastTimer) {
        clearInterval(syncBroadcastTimer)
        syncBroadcastTimer = null
      }
    }
  }
}

watch(
  visible,
  (esVisible) => {
    if (syncBroadcastTimer) {
      clearInterval(syncBroadcastTimer)
      syncBroadcastTimer = null
    }
    if (timerModal) {
      clearInterval(timerModal)
      timerModal = null
    }

    if (esVisible) {
      segundosModal.value = 0
      timerModal = setInterval(() => {
        segundosModal.value++
      }, 1000)

      sincronizarEstadoTransmisionEnFirestore()
      syncBroadcastTimer = setInterval(sincronizarEstadoTransmisionEnFirestore, 15000)
    }
  },
  { immediate: true },
)

const iniciarSuscripcionPartido = (id: string) => {
  if (unsubPartido) {
    unsubPartido()
    unsubPartido = null
  }
  if (!id) {
    partidoRealTime.value = null
    return
  }
  unsubPartido = onSnapshot(
    doc(db, 'partidos', id),
    (docSnap) => {
      if (docSnap.exists()) {
        partidoRealTime.value = { id: docSnap.id, ...docSnap.data() }
      }
    },
    (err) => {
      console.warn('[ModalCamaraTransmision] Error en suscripción a partido en vivo:', err)
    },
  )
}

watch(
  () => props.partido?.id,
  (nuevoId) => {
    if (nuevoId) {
      partidoRealTime.value = props.partido
      iniciarSuscripcionPartido(nuevoId)
      if (visible.value) {
        sincronizarEstadoTransmisionEnFirestore()
      }
    } else {
      if (unsubPartido) {
        unsubPartido()
        unsubPartido = null
      }
      partidoRealTime.value = null
    }
  },
  { immediate: true },
)

onUnmounted(() => {
  if (unsubPartido) {
    unsubPartido()
    unsubPartido = null
  }
  if (syncBroadcastTimer) {
    clearInterval(syncBroadcastTimer)
    syncBroadcastTimer = null
  }
  if (timerModal) {
    clearInterval(timerModal)
    timerModal = null
  }
})

const partidoActivo = computed(() => partidoRealTime.value || props.partido)
const marcadorEnVivo = computed(() => partidoActivo.value?.marcadorEnVivo)

// Función robusta para vincular y reproducir el stream local de video
const acoplarVideoLocal = () => {
  if (videoElementRef.value && props.streamLocal) {
    videoElementRef.value.muted = true
    if (videoElementRef.value.srcObject !== props.streamLocal) {
      videoElementRef.value.srcObject = props.streamLocal
    }
    videoElementRef.value.play().catch((err) => {
      console.warn('Reproducción de cámara local esperando interacción o permiso:', err)
    })
  }
}

// Vincular el MediaStream local a la etiqueta <video> cuando cambie el stream o la visibilidad
watch(
  [visible, () => props.streamLocal],
  ([esVisible, stream]) => {
    if (esVisible && stream) {
      nextTick(() => {
        acoplarVideoLocal()
      })
    }
  },
  { immediate: true },
)

const setsGanadosJ1 = computed(() => {
  if (marcadorEnVivo.value?.setsGanadosJ1 !== undefined) {
    return Number(marcadorEnVivo.value.setsGanadosJ1)
  }
  if (partidoActivo.value?.sets) {
    return partidoActivo.value.sets.filter((s: any) => s.ganadorId === partidoActivo.value?.jugador1Id).length
  }
  return 0
})

const setsGanadosJ2 = computed(() => {
  if (marcadorEnVivo.value?.setsGanadosJ2 !== undefined) {
    return Number(marcadorEnVivo.value.setsGanadosJ2)
  }
  if (partidoActivo.value?.sets) {
    return partidoActivo.value.sets.filter((s: any) => s.ganadorId === partidoActivo.value?.jugador2Id).length
  }
  return 0
})

const setActual = computed(() => {
  if (!partidoActivo.value?.sets || partidoActivo.value.sets.length === 0) return null
  return partidoActivo.value.sets[partidoActivo.value.sets.length - 1]
})

const puntosJ1 = computed(() => {
  if (marcadorEnVivo.value?.puntosJ1 !== undefined) {
    return Number(marcadorEnVivo.value.puntosJ1)
  }
  if (setActual.value?.puntosJugador1 !== undefined) {
    return Number(setActual.value.puntosJugador1)
  }
  return 0
})

const puntosJ2 = computed(() => {
  if (marcadorEnVivo.value?.puntosJ2 !== undefined) {
    return Number(marcadorEnVivo.value.puntosJ2)
  }
  if (setActual.value?.puntosJugador2 !== undefined) {
    return Number(setActual.value.puntosJugador2)
  }
  return 0
})

const servidorActual = computed(() => marcadorEnVivo.value?.servidorActual || 1)

const alternarCamara = () => emit('alternar-camara')
const alternarAudio = () => emit('alternar-audio')
const alternarVideo = () => emit('alternar-video')

// Grabador de Clips en vivo para la Biblioteca
const {
  estaGrabando: estaGrabandoClip,
  segundosGrabados: segundosGrabadosClip,
  feedbackClip,
  iniciarGrabacionClip,
  detenerGrabacionClip,
} = useGrabadorClips()

const alternarCapturaClip = () => {
  if (estaGrabandoClip.value) {
    detenerGrabacionClip()
    return
  }

  const stream =
    props.streamLocal ||
    (videoElementRef.value?.srcObject as MediaStream)

  if (!stream) return

  const p = partidoRealTime.value || props.partido
  const j1Nombre = p?.jugador1?.nombre || 'Jugador 1'
  const j2Nombre = p?.jugador2?.nombre || 'Jugador 2'

  iniciarGrabacionClip(
    stream,
    videoElementRef.value,
    {
      torneoId: p?.torneoId,
      torneoNombre: (p as any)?.torneoNombre || 'Torneo Tenis de Mesa',
      partidoId: p?.id,
      mesa: marcadorEnVivo.value?.mesa || p?.mesa || 'Mesa 1',
      jugador1: {
        id: p?.jugador1Id || 'j1',
        nombre: j1Nombre,
      },
      jugador2: {
        id: p?.jugador2Id || 'j2',
        nombre: j2Nombre,
      },
      marcadorMomento: `${puntosJ1.value} - ${puntosJ2.value}`,
      titulo: `Clip Destacado: ${j1Nombre} vs ${j2Nombre}`,
      tipo: 'mejor_jugada',
    },
    15,
  )
}

const mostrarModalConfirmacion = ref(false)

const confirmarFinalizarTransmision = () => {
  mostrarModalConfirmacion.value = true
}

const ejecutarFinalizarTransmision = () => {
  mostrarModalConfirmacion.value = false
  visible.value = false
  emit('finalizar')
}

const alternarPantallaCompleta = async () => {
  const container = modalContenedorRef.value
  const video = videoElementRef.value

  // Salir de pantalla completa si ya está activa
  if (esPantallaCompleta.value || document.fullscreenElement || (document as any).webkitFullscreenElement) {
    try {
      if (document.exitFullscreen) {
        await document.exitFullscreen()
      } else if ((document as any).webkitExitFullscreen) {
        await (document as any).webkitExitFullscreen()
      }
    } catch (e) {
      console.warn('Error al salir de fullscreen nativo:', e)
    }

    try {
      if (screen.orientation && 'unlock' in screen.orientation) {
        (screen.orientation as any).unlock()
      }
    } catch {}

    esPantallaCompleta.value = false
    return
  }

  // Activar pantalla completa
  let nativoExitoso = false
  if (container) {
    try {
      if (container.requestFullscreen) {
        await container.requestFullscreen()
        nativoExitoso = true
      } else if ((container as any).webkitRequestFullscreen) {
        await (container as any).webkitRequestFullscreen()
        nativoExitoso = true
      }
    } catch (e) {
      console.warn('requestFullscreen en container no disponible:', e)
    }
  }

  if (!nativoExitoso && video && (video as any).webkitEnterFullscreen) {
    try {
      (video as any).webkitEnterFullscreen()
      nativoExitoso = true
    } catch {}
  }

  // En celulares, sugerir orientación horizontal al poner pantalla completa
  try {
    if (screen.orientation && 'lock' in screen.orientation) {
      await (screen.orientation as any).lock('landscape').catch(() => {})
    }
  } catch {}

  esPantallaCompleta.value = true
}

const handleFullscreenChange = () => {
  const isFs = Boolean(
    document.fullscreenElement ||
    (document as any).webkitFullscreenElement ||
    (document as any).mozFullScreenElement ||
    (document as any).msFullscreenElement
  )
  if (!isFs && esPantallaCompleta.value) {
    esPantallaCompleta.value = false
  }
}

const open = () => {
  visible.value = true
  solicitarWakeLock()
  nextTick(() => {
    acoplarVideoLocal()
    setTimeout(acoplarVideoLocal, 150)
  })
}

const close = () => {
  visible.value = false
  liberarWakeLock()
  if (esPantallaCompleta.value) {
    alternarPantallaCompleta().catch(() => {})
  }
}

onMounted(() => {
  if (visible.value) {
    acoplarVideoLocal()
    solicitarWakeLock()
  }
  document.addEventListener('visibilitychange', handleVisibilityChangeWakeLock)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  liberarWakeLock()
  document.removeEventListener('visibilitychange', handleVisibilityChangeWakeLock)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
})

defineExpose({
  open,
  close,
})
</script>

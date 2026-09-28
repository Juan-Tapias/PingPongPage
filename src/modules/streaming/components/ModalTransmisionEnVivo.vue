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
        ref="modalContainerRef"
        :class="[
          'fixed inset-0 z-50 select-none transition-all duration-300',
          contenedorModalClases
        ]"
      >
        <div
          :class="[
            'relative flex flex-col transition-all duration-300 overflow-hidden',
            tarjetaModalClases
          ]"
        >
          <!-- CABECERA DE INFORMACIÓN DEL PARTIDO (MODO NORMAL Y FULLSCREEN) -->
          <div
            v-if="!modoMiniplayer"
            :class="[
              'flex items-center justify-between px-2.5 sm:px-5 py-2 sm:py-3 z-40 transition-all duration-300 gap-1.5',
              (esPantallaCompleta || esHorizontal)
                ? 'absolute top-0 inset-x-0 bg-gradient-to-b from-black/90 via-black/40 to-transparent pointer-events-auto'
                : 'bg-slate-900/95 border-b border-slate-800/80',
              !mostrarControles && (esPantallaCompleta || esHorizontal) ? 'opacity-0 -translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'
            ]"
          >
            <!-- Badge En Vivo y Espectadores -->
            <div class="flex items-center gap-1.5 sm:gap-3 flex-wrap min-w-0">
              <span
                class="flex items-center gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-xs shrink-0"
              >
                <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                En Vivo
              </span>

              <span
                class="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-bold text-slate-300 bg-slate-800/80 border border-slate-700/60 shrink-0"
              >
                <Eye class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-sky-400" />
                <span>{{ totalEspectadoresReal }}</span>
                <span class="hidden xs:inline"> {{ totalEspectadoresReal === 1 ? 'espectador' : 'espectadores' }}</span>
              </span>

              <!-- Duración de la llamada / transmisión (1 hora) -->
              <span
                v-if="partido?.fechaInicioTransmision"
                class="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold text-amber-300 bg-amber-950/60 border border-amber-500/40 shrink-0"
                title="Límite máximo de llamada: 1 hora (60 minutos)"
              >
                <Clock class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400" />
                <span>{{ tiempoTranscurridoViewer }}</span>
                <span class="hidden sm:inline"> / 60:00</span>
              </span>

              <span
                v-if="partido?.transmisorNombre"
                class="hidden md:inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium"
              >
                Árbitro: <strong class="text-white font-bold">{{ partido.transmisorNombre }}</strong>
              </span>
            </div>

            <!-- Botones de Navegación y Cierre -->
            <div class="flex items-center gap-1 sm:gap-2 shrink-0">
              <!-- Botón Chat en Cabecera -->
              <button
                type="button"
                class="p-1.5 sm:px-2.5 sm:py-1 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all border"
                :class="mostrarChat ? 'bg-white/20 text-white border-white/30 shadow-xs' : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border-white/5'"
                :title="mostrarChat ? 'Ocultar chat (c)' : 'Mostrar chat (c)'"
                @click="alternarChat"
              >
                <MessageSquare class="w-3.5 h-3.5 text-white/90" />
                <span class="hidden md:inline">Chat</span>
              </button>

              <!-- Botón Minirreproductor en Cabecera -->
              <button
                type="button"
                class="p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Minirreproductor flotante (i)"
                @click="alternarMiniplayer"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="15" rx="2" />
                  <rect x="6" y="7" width="5" height="4" rx="0.5" fill="currentColor" fill-opacity="0.25" />
                  <line x1="12" y1="12" x2="16.5" y2="16.5" />
                  <polyline points="13 16.5 16.5 16.5 16.5 13" />
                </svg>
                <span class="hidden sm:inline">Minirreproductor</span>
              </button>

              <button
                v-if="esPantallaCompleta"
                type="button"
                class="p-1.5 sm:px-2.5 sm:py-1 rounded-full bg-white/10 hover:bg-white/20 text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                title="Salir de pantalla completa (f)"
                @click="alternarPantallaCompleta"
              >
                <Minimize class="w-3.5 h-3.5" />
                <span class="hidden sm:inline">Salir</span>
              </button>

              <button
                type="button"
                class="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar transmisión"
                @click="close"
              >
                <X class="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            </div>
          </div>

          <!-- CONTENEDOR FLEX: VIDEO PRINCIPAL + CHAT LATERAL (DESKTOP / HORIZONTAL / FULLSCREEN) -->
          <div :class="['relative flex-1 flex overflow-hidden min-h-0 w-full', (esPantallaCompleta || esHorizontal) ? 'flex-row items-stretch' : 'flex-col lg:flex-row']">
            <!-- ÁREA DE VIDEO PRINCIPAL (RESPONSIVE & FLOTANTE) -->
            <div
              ref="videoContainerRef"
              :class="[
                'relative bg-black flex items-center justify-center overflow-hidden group select-none min-h-0 min-w-0',
                modoMiniplayer
                  ? 'aspect-video cursor-pointer'
                  : (esPantallaCompleta || esHorizontal)
                    ? 'flex-1 h-full'
                    : 'w-full shrink-0 aspect-video max-h-[38vh] sm:max-h-[46vh] lg:max-h-none lg:aspect-auto lg:flex-1 lg:h-full'
              ]"
              @mousemove="resetearInactividad"
              @touchstart="handleTouchVideo"
              @dblclick="modoMiniplayer ? alternarMiniplayer() : alternarPantallaCompleta()"
              @click="modoMiniplayer ? alternarMiniplayer() : undefined"
            >
            <!-- Elemento de Video WebRTC Remoto -->
            <video
              ref="videoElementRef"
              autoplay
              playsinline
              :muted="audioMuteado"
              :class="[
                'w-full h-full transition-all duration-300',
                ajusteVideo === 'contain' ? 'object-contain' : 'object-cover'
              ]"
              :style="{
                transform: rotacionVisor !== 0 ? `rotate(${rotacionVisor}deg)` : undefined
              }"
              @loadedmetadata="acoplarVideoRemoto"
              @loadeddata="tieneVideoRecibido = true"
              @canplay="tieneVideoRecibido = true; videoElementRef?.play().catch(() => {})"
              @playing="tieneVideoRecibido = true"
              @timeupdate="tieneVideoRecibido = true"
              @volumechange="handleVolumeChange"
            ></video>

            <!-- ESTADO DE CARGA / CONECTANDO -->
            <div
              v-if="!tieneVideoRecibido"
              class="absolute inset-0 bg-slate-950/90 backdrop-blur-xs flex flex-col items-center justify-center gap-3 text-white z-10 p-4 text-center pointer-events-none"
            >
              <div class="w-10 h-10 border-4 border-sky-400 border-t-transparent rounded-full animate-spin"></div>
              <p class="text-xs sm:text-sm font-extrabold uppercase tracking-wide text-sky-400">
                Sintonizando transmisión de la mesa...
              </p>
              <span class="text-[11px] text-slate-400">Conectando video y audio WebRTC en tiempo real</span>
            </div>

            <!-- ALERTA SI LA TRANSMISIÓN NO ESTÁ DISPONIBLE -->
            <div
              v-else-if="!streamRemoto"
              class="absolute inset-0 bg-slate-950/90 flex flex-col items-center justify-center gap-2 text-slate-400 p-4 text-center"
            >
              <VideoOff class="w-12 h-12 text-slate-600" />
              <p class="text-xs sm:text-sm font-bold text-white uppercase tracking-wider">
                La transmisión ha finalizado o está en pausa
              </p>
              <span class="text-[11px] text-slate-500">
                El árbitro o administrador reactivará la señal pronto.
              </span>
            </div>

            <!-- BANNER FLOTANTE TÁCTIL PARA ACTIVAR AUDIO INICIAL (SOLO AUTOPLAY) -->
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 translate-y-3 scale-95"
              enter-to-class="opacity-100 translate-y-0 scale-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="tieneVideoRecibido && audioMuteado && !modoMiniplayer && avisoAutoplaySonido"
                class="absolute bottom-16 sm:bottom-20 left-1/2 -translate-x-1/2 z-30 px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-full bg-slate-950/90 backdrop-blur-md text-white border border-white/20 shadow-2xl flex items-center gap-2 text-xs font-bold select-none pointer-events-auto animate-in fade-in"
              >
                <button
                  type="button"
                  class="flex items-center gap-2 hover:text-sky-300 cursor-pointer transition-colors"
                  title="Toca para activar el sonido del partido"
                  @click.stop="activarSonidoInicial"
                >
                  <Volume2 class="w-4 h-4 text-white/90" />
                  <span>Activar sonido</span>
                </button>
                <button
                  type="button"
                  class="ml-1 text-white/50 hover:text-white p-0.5 cursor-pointer text-sm leading-none"
                  title="Cerrar aviso"
                  @click.stop="avisoAutoplaySonido = false"
                >
                  ×
                </button>
              </div>
            </Transition>

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
                <RouterLink
                  v-if="feedbackClip.includes('guardado exitosamente')"
                  to="/biblioteca"
                  class="ml-1 px-2.5 py-1 rounded-full bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-[10px] transition-colors shadow-xs"
                  @click="close"
                >
                  Ver en Biblioteca
                </RouterLink>
              </div>
            </Transition>

            <!-- OVERLAY HOVER DEL MINIREPRODUCTOR (ESTILO YOUTUBE) -->
            <div
              v-if="modoMiniplayer"
              class="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/85 opacity-0 group-hover/mini:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5 z-20 pointer-events-none"
            >
              <!-- Barra superior del minirreproductor -->
              <div class="flex items-center justify-between w-full pointer-events-auto">
                <span
                  class="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-rose-500/30 text-rose-300 border border-rose-500/40 shadow-xs"
                >
                  <span class="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                  En Vivo
                </span>

                <div class="flex items-center gap-1">
                  <!-- Expandir a modal completo -->
                  <button
                    type="button"
                    class="w-7 h-7 rounded-lg bg-black/70 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Expandir (i)"
                    @click.stop="alternarMiniplayer"
                  >
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="3" y="4" width="18" height="15" rx="2" />
                      <rect x="13" y="12" width="5" height="4" rx="0.5" fill="currentColor" fill-opacity="0.25" />
                      <line x1="12" y1="12" x2="7.5" y2="7.5" />
                      <polyline points="11 7.5 7.5 7.5 7.5 11" />
                    </svg>
                  </button>

                  <!-- Pantalla completa -->
                  <button
                    type="button"
                    class="w-7 h-7 rounded-lg bg-black/70 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Pantalla completa (f)"
                    @click.stop="alternarPantallaCompleta"
                  >
                    <Maximize class="w-3.5 h-3.5" />
                  </button>

                  <!-- Cerrar -->
                  <button
                    type="button"
                    class="w-7 h-7 rounded-lg bg-black/70 hover:bg-rose-600 text-white flex items-center justify-center transition-colors cursor-pointer"
                    title="Cerrar transmisión"
                    @click.stop="close"
                  >
                    <X class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <!-- Centro del minirreproductor (Feedback visual para expandir) -->
              <div class="flex items-center justify-center pointer-events-none">
                <div class="px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-xs border border-white/20 text-white text-[11px] font-bold flex items-center gap-1.5 shadow-lg">
                  <svg class="w-3.5 h-3.5 text-sky-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="3" y="4" width="18" height="15" rx="2" />
                    <rect x="13" y="12" width="5" height="4" rx="0.5" fill="currentColor" fill-opacity="0.25" />
                    <line x1="12" y1="12" x2="7.5" y2="7.5" />
                    <polyline points="11 7.5 7.5 7.5 7.5 11" />
                  </svg>
                  <span>Clic para expandir</span>
                </div>
              </div>

              <div class="h-1"></div>
            </div>

            <!-- MARCADOR DEPORTIVO SUPERPUESTO (HUD OFICIAL BROADCAST TV ESTILO WTT/ITTF) -->
            <div
              v-if="partidoActivo && !modoMiniplayer"
              class="absolute top-2 sm:top-3.5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none select-none max-w-[96%] sm:max-w-xl transition-all duration-300 drop-shadow-2xl"
            >
              <!-- Pestaña Superior: MESA 1 | SET 2 -->
              <div
                class="px-3 sm:px-4 py-0.5 rounded-t-lg bg-[#07101e]/95 backdrop-blur-md border-t-2 border-x-2 border-emerald-400/90 text-emerald-300 font-black text-[9px] sm:text-xs tracking-widest uppercase shadow-[0_0_15px_rgba(52,211,153,0.35)] flex items-center gap-1.5 -mb-px z-10"
              >
                <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>{{ (marcadorEnVivo?.mesa || partidoActivo.mesa || 'Mesa 1').toUpperCase() }}</span>
                <span class="text-emerald-500/60 font-mono">|</span>
                <span class="text-amber-300 font-black">
                  {{ (marcadorEnVivo?.setActual || (partidoActivo?.sets?.length ? `SET ${partidoActivo.sets.length}` : 'SET 1')).toUpperCase() }}
                  <span v-if="setsGanadosJ1 > 0 || setsGanadosJ2 > 0" class="ml-1 text-slate-300 font-mono text-[9px] font-bold">
                    ({{ setsGanadosJ1 }}-{{ setsGanadosJ2 }})
                  </span>
                </span>
              </div>

              <!-- Cápsula Principal con borde Neón Verde/Esmeralda: Bandera + J1 + Score (11 - 09) + J2 + Bandera -->
              <div
                class="flex items-center gap-2 sm:gap-3.5 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-2xl bg-[#060d19]/90 backdrop-blur-md border-2 border-emerald-400 shadow-[0_0_25px_rgba(52,211,153,0.45)] text-white"
              >
                <!-- Lado Jugador 1 -->
                <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <!-- Bandera Jugador 1 -->
                  <div class="w-5 h-3.5 sm:w-6 sm:h-4 rounded-xs shadow-xs border border-white/25 shrink-0 overflow-hidden bg-slate-900 flex items-center justify-center">
                    <svg class="w-full h-full" viewBox="0 0 640 480">
                      <rect width="640" height="480" fill="#fe0000" />
                      <rect width="320" height="240" fill="#000095" />
                      <circle cx="160" cy="120" r="44" fill="#fff" />
                      <circle cx="160" cy="120" r="32" fill="#000095" />
                      <circle cx="160" cy="120" r="22" fill="#fff" />
                    </svg>
                  </div>

                  <!-- Nombre Jugador 1 (ej: CHIH-YUAN L.) -->
                  <span class="font-black text-[11px] sm:text-xs md:text-sm tracking-wider text-white uppercase truncate max-w-[70px] xs:max-w-[100px] sm:max-w-[140px]">
                    {{ formatearNombreHUD(partidoActivo.jugador1?.nombre) }}
                  </span>

                  <!-- Indicador Saque Jugador 1 -->
                  <span
                    v-if="servidorActual === 1"
                    class="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.2 rounded font-black bg-amber-400 text-slate-950 uppercase tracking-wider shrink-0 shadow-xs animate-pulse"
                    title="Saque activo"
                  >
                    SAQUE
                  </span>
                </div>

                <!-- Puntos Centrales: 11 - 09 -->
                <div class="flex items-center gap-1 sm:gap-2 px-2 sm:px-2.5 py-0.5 rounded-lg bg-black/45 border border-white/10 shrink-0 font-mono font-black text-sm sm:text-lg md:text-xl text-amber-300 tracking-wider shadow-inner">
                  <span class="min-w-[20px] sm:min-w-[26px] text-center">{{ puntosJ1Formateados }}</span>
                  <span class="text-white/60 font-sans text-xs sm:text-sm font-bold">-</span>
                  <span class="min-w-[20px] sm:min-w-[26px] text-center">{{ puntosJ2Formateados }}</span>
                </div>

                <!-- Lado Jugador 2 -->
                <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <!-- Indicador Saque Jugador 2 -->
                  <span
                    v-if="servidorActual === 2"
                    class="text-[8px] sm:text-[9px] px-1 sm:px-1.5 py-0.2 rounded font-black bg-amber-400 text-slate-950 uppercase tracking-wider shrink-0 shadow-xs animate-pulse"
                    title="Saque activo"
                  >
                    SAQUE
                  </span>

                  <!-- Nombre Jugador 2 (ej: MARIA G.) -->
                  <span class="font-black text-[11px] sm:text-xs md:text-sm tracking-wider text-white uppercase truncate max-w-[70px] xs:max-w-[100px] sm:max-w-[140px]">
                    {{ formatearNombreHUD(partidoActivo.jugador2?.nombre) }}
                  </span>

                  <!-- Bandera Jugador 2 -->
                  <div class="w-5 h-3.5 sm:w-6 sm:h-4 rounded-xs shadow-xs border border-white/25 shrink-0 overflow-hidden bg-slate-900 flex items-center justify-center">
                    <svg class="w-full h-full" viewBox="0 0 640 480">
                      <rect width="640" height="160" fill="#74ACDF" />
                      <rect y="160" width="640" height="160" fill="#FFFFFF" />
                      <rect y="320" width="640" height="160" fill="#74ACDF" />
                      <circle cx="320" cy="240" r="30" fill="#F6B40E" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            <!-- CONTROLES FLOTANTES EN LA ESQUINA INFERIOR DERECHA (MODO NORMAL Y FULLSCREEN) -->
            <div
              v-if="!modoMiniplayer"
              @click.stop
              :class="[
                'absolute bottom-2.5 right-2.5 sm:bottom-4 sm:right-4 z-20 flex items-center gap-1 sm:gap-1.5 bg-black/75 backdrop-blur-xl p-1 sm:p-1.5 rounded-full border border-white/15 transition-all duration-300 shadow-[0_8px_30px_rgba(0,0,0,0.7)] max-w-[calc(100vw-20px)]',
                !mostrarControles && (esPantallaCompleta || esHorizontal) ? 'opacity-0 translate-y-2 pointer-events-none' : 'opacity-100 translate-y-0'
              ]"
            >
              <!-- Control de Audio con Barra de Sonido Real Monocromática -->
              <div class="group/vol flex items-center bg-white/10 hover:bg-white/15 rounded-full px-2 py-1 transition-all duration-200 border border-white/5">
                <button
                  type="button"
                  class="text-white/80 hover:text-white transition-colors cursor-pointer flex items-center justify-center p-0.5"
                  :title="audioMuteado || volumen === 0 ? 'Activar sonido (m)' : 'Silenciar sonido (m)'"
                  @click.stop="alternarSonido"
                >
                  <VolumeX v-if="audioMuteado || volumen === 0" class="w-4 h-4 text-white/50" />
                  <Volume1 v-else-if="volumen < 0.5" class="w-4 h-4 text-white/90" />
                  <Volume2 v-else class="w-4 h-4 text-white/90" />
                </button>

                <!-- Barra deslizante de volumen horizontal -->
                <div class="w-0 group-hover/vol:w-16 sm:w-16 transition-all duration-300 overflow-hidden flex items-center pl-1.5 pr-0.5">
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    :value="audioMuteado ? 0 : volumen"
                    class="w-full h-1 bg-white/20 hover:bg-white/30 rounded-full appearance-none cursor-pointer accent-white"
                    title="Control de volumen"
                    @input="handleCambiarVolumen(($event.target as HTMLInputElement).valueAsNumber)"
                  />
                </div>
              </div>

              <!-- Ajustar al marco / Llenar pantalla (Fit/Fill) -->
              <button
                type="button"
                class="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full flex items-center justify-center transition-all cursor-pointer border"
                :class="ajusteVideo === 'cover' ? 'bg-white/25 text-white border-white/30 shadow-xs' : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border-white/5'"
                :title="ajusteVideo === 'contain' ? 'Llenar pantalla' : 'Ajustar al marco'"
                @click="alternarAjusteVideo"
              >
                <svg v-if="ajusteVideo === 'contain'" class="w-4 h-4 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"/>
                </svg>
                <svg v-else class="w-4 h-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect width="18" height="18" x="3" y="3" rx="2"/>
                  <path d="M9 3v18M15 3v18"/>
                </svg>
              </button>

              <!-- Minirreproductor Flotante en Página (Estilo YouTube) -->
              <button
                type="button"
                class="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/5"
                title="Minirreproductor (i)"
                @click="alternarMiniplayer"
              >
                <svg class="w-4 h-4 text-white/90" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="15" rx="2" />
                  <rect x="6" y="7" width="5" height="4" rx="0.5" fill="currentColor" fill-opacity="0.25" />
                  <line x1="12" y1="12" x2="16.5" y2="16.5" />
                  <polyline points="13 16.5 16.5 16.5 16.5 13" />
                </svg>
              </button>

              <!-- Capturar Clip de 15s para la Biblioteca -->
              <button
                type="button"
                class="h-8 sm:h-8.5 px-2.5 sm:px-3 rounded-full flex items-center gap-1.5 transition-all cursor-pointer border text-xs font-bold shadow-xs select-none"
                :class="estaGrabandoClip ? 'bg-rose-600 text-white border-rose-400 animate-pulse' : 'bg-white/10 hover:bg-white/20 text-white/90 hover:text-white border-white/5'"
                :title="estaGrabandoClip ? 'Grabando clip... clic para terminar ahora' : 'Capturar clip de 15 segundos'"
                @click="alternarCapturaClip"
              >
                <span v-if="estaGrabandoClip" class="w-2 h-2 rounded-full bg-white animate-ping"></span>
                <Scissors v-else class="w-3.5 h-3.5 text-amber-400" />
                <span v-if="estaGrabandoClip" class="font-mono text-[11px]">{{ segundosGrabadosClip }}s REC</span>
                <span v-else class="hidden xs:inline">Clip</span>
              </button>

              <!-- Picture-in-Picture Nativo Externo (PiP) -->
              <button
                v-if="soportaPiP"
                type="button"
                class="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/5"
                title="Ventana externa fuera del navegador (PiP)"
                @click="alternarPiP"
              >
                <PictureInPicture2 class="w-4 h-4 text-white/90" />
              </button>

              <!-- Alternar Ajuste de Escala (Rellenar / Ajustar) -->
              <button
                type="button"
                class="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full flex items-center justify-center transition-all cursor-pointer border"
                :class="ajusteVideo === 'cover' ? 'bg-amber-500/25 text-amber-300 border-amber-500/40 shadow-xs' : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border-white/5'"
                :title="ajusteVideo === 'cover' ? 'Ajustar a escala normal (contain)' : 'Expandir para rellenar pantalla (cover)'"
                @click="ajusteVideo = ajusteVideo === 'contain' ? 'cover' : 'contain'"
              >
                <Expand class="w-4 h-4 text-white/90" />
              </button>

              <!-- Rotar Video Visor -->
              <button
                type="button"
                class="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full flex items-center justify-center transition-all cursor-pointer border"
                :class="rotacionVisor !== 0 ? 'bg-amber-500/25 text-amber-300 border-amber-500/40 shadow-xs' : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border-white/5'"
                :title="rotacionVisor === 0 ? 'Girar video 90°' : `Rotación: ${rotacionVisor}°`"
                @click="rotacionVisor = ((rotacionVisor + 90) % 360) as any"
              >
                <RotateCw class="w-4 h-4 text-white/90" />
              </button>

              <!-- Alternar Chat del Stream -->
              <button
                type="button"
                class="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full flex items-center justify-center transition-all cursor-pointer border"
                :class="mostrarChat ? 'bg-white/25 text-white border-white/30 shadow-xs' : 'bg-white/10 hover:bg-white/20 text-white/80 hover:text-white border-white/5'"
                :title="mostrarChat ? 'Ocultar chat del stream (c)' : 'Mostrar chat del stream (c)'"
                @click="alternarChat"
              >
                <MessageSquare class="w-4 h-4" />
              </button>

              <!-- Pantalla Completa (Mobile & PC) -->
              <button
                type="button"
                class="w-8 h-8 sm:w-8.5 sm:h-8.5 rounded-full bg-white/10 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white flex items-center justify-center transition-all cursor-pointer border border-white/5"
                :title="esPantallaCompleta ? 'Salir de pantalla completa (f)' : 'Pantalla completa (f)'"
                @click="alternarPantallaCompleta"
              >
                <Maximize v-if="!esPantallaCompleta" class="w-4 h-4 text-white/90" />
                <Minimize v-else class="w-4 h-4 text-white/90" />
              </button>
            </div>

            <!-- Botón flotante para reabrir chat en pantalla completa u horizontal cuando está oculto -->
            <button
              v-if="!mostrarChat && (esPantallaCompleta || esHorizontal) && !modoMiniplayer"
              type="button"
              class="absolute top-3 right-3 sm:top-4 sm:right-4 z-30 px-3 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 shadow-xl text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
              title="Mostrar Live Chat (c)"
              @click.stop="mostrarChat = true"
            >
              <MessageSquare class="w-3.5 h-3.5 text-sky-400" />
              <span>Chat</span>
            </button>
          </div>

          <!-- COMPONENTE DE CHAT EN VIVO ESTILO TWITCH -->
          <div
            v-if="mostrarChat && !modoMiniplayer"
            :class="[
              (esPantallaCompleta || esHorizontal)
                ? 'p-1.5 sm:p-2.5 shrink-0 h-full w-[265px] xs:w-[285px] sm:w-[315px] md:w-[340px] z-30'
                : 'w-full lg:w-80 xl:w-96 flex-1 lg:flex-none h-full'
            ]"
          >
            <ChatTransmisionEnVivo
              :partido-id="partidoActivo?.id || (partidoActivo as any)?.partidoId || partido?.id || (partido as any)?.partidoId"
              :partido="partidoActivo || partido"
              :es-pantalla-completa="esPantallaCompleta"
              :es-horizontal="esHorizontal"
              @cerrar-chat="mostrarChat = false"
            />
          </div>
        </div>

          <!-- BARRA INFERIOR DEL MINIREPRODUCTOR FLOTANTE -->
          <div
            v-if="modoMiniplayer"
            class="px-3 py-2 bg-slate-900/95 border-t border-slate-800 flex items-center justify-between gap-2.5 select-none"
            @click.stop
          >
            <div class="flex items-center gap-2 min-w-0 flex-1">
              <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse shrink-0"></span>
              <div class="min-w-0 flex-1">
                <div class="flex items-center gap-1.5 truncate">
                  <span class="text-xs font-black text-white truncate">
                    {{ partido?.jugador1?.nombre || 'Jugador 1' }}
                  </span>
                  <span class="text-[10px] font-black text-slate-400">vs</span>
                  <span class="text-xs font-black text-white truncate">
                    {{ partido?.jugador2?.nombre || 'Jugador 2' }}
                  </span>
                </div>
                <div class="flex items-center gap-2 text-[10px] font-semibold text-slate-400">
                  <span class="font-mono text-sky-400 font-bold">
                    Sets {{ setsGanadosJ1 }}-{{ setsGanadosJ2 }} ({{ puntosJ1 }}-{{ puntosJ2 }})
                  </span>
                  <span v-if="partido?.mesa" class="text-slate-500">• Mesa {{ partido.mesa }}</span>
                </div>
              </div>
            </div>

            <div class="flex items-center gap-1 shrink-0">
              <button
                type="button"
                class="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                :title="audioMuteado ? 'Activar sonido (m)' : 'Silenciar sonido (m)'"
                @click.stop="alternarSonido"
              >
                <VolumeX v-if="audioMuteado" class="w-3.5 h-3.5 text-rose-400" />
                <Volume2 v-else class="w-3.5 h-3.5 text-emerald-400" />
              </button>
              <button
                type="button"
                class="px-2 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500/30 text-sky-400 hover:text-sky-300 border border-sky-500/30 transition-colors cursor-pointer flex items-center gap-1 text-xs font-bold"
                title="Expandir transmisión (i)"
                @click.stop="alternarMiniplayer"
              >
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="3" y="4" width="18" height="15" rx="2" />
                  <rect x="13" y="12" width="5" height="4" rx="0.5" fill="currentColor" fill-opacity="0.25" />
                  <line x1="12" y1="12" x2="7.5" y2="7.5" />
                  <polyline points="11 7.5 7.5 7.5 7.5 11" />
                </svg>
                <span class="hidden sm:inline text-[11px]">Expandir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onUnmounted, nextTick } from 'vue'
import {
  Eye,
  X,
  VideoOff,
  Volume2,
  Volume1,
  VolumeX,
  PictureInPicture2,
  Maximize,
  Minimize,
  Clock,
  MessageSquare,
  Scissors,
  Film,
  Expand,
  RotateCw,
} from 'lucide-vue-next'
import { doc, onSnapshot, type Unsubscribe } from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { PartidoGrupo } from '@/types'
import { RouterLink } from 'vue-router'
import { useGrabadorClips } from '../composables/useGrabadorClips'
import ChatTransmisionEnVivo from './ChatTransmisionEnVivo.vue'

const props = defineProps<{
  partido: PartidoGrupo | null
  streamRemoto: MediaStream | null
  totalEspectadores: number
  cargandoConexion: boolean
}>()

const emit = defineEmits<{
  (e: 'cerrar'): void
}>()

const visible = ref(false)
const modalContainerRef = ref<HTMLDivElement | null>(null)
const videoContainerRef = ref<HTMLDivElement | null>(null)
const videoElementRef = ref<HTMLVideoElement | null>(null)
const audioMuteado = ref(true)
const volumen = ref(0.8)
let ultimoVolumen = 0.8
const esPantallaCompleta = ref(false)
const modoMiniplayer = ref(false)
const mostrarChat = ref(true)
const esHorizontal = ref(false)

const verificarOrientacion = () => {
  if (typeof window === 'undefined') return
  const w = window.innerWidth
  const h = window.innerHeight
  const esLandscape = w > h

  let esLandscapeScreen = false
  if (typeof screen !== 'undefined' && screen.orientation) {
    esLandscapeScreen = screen.orientation.type ? screen.orientation.type.includes('landscape') : false
  }

  esHorizontal.value = esLandscape || esLandscapeScreen
}

const formatearNombreHUD = (nombre?: string): string => {
  if (!nombre) return 'JUGADOR'
  const partes = nombre.trim().split(/\s+/)
  const p0 = partes[0] || 'JUGADOR'
  const p1 = partes[1]
  if (p1 && p1[0]) {
    return `${p0.toUpperCase()} ${p1[0].toUpperCase()}.`
  }
  return p0.toUpperCase()
}

const alternarChat = () => {
  mostrarChat.value = !mostrarChat.value
}

const contenedorModalClases = computed(() => {
  if (modoMiniplayer.value) {
    return 'pointer-events-none bg-transparent flex items-end justify-end p-3 sm:p-5'
  }
  if (esPantallaCompleta.value || esHorizontal.value) {
    return 'p-0 bg-black w-screen h-[100dvh] overflow-hidden flex items-center justify-center'
  }
  return 'p-0 sm:p-4 bg-black/90 backdrop-blur-md overflow-hidden max-h-[100dvh] flex items-center justify-center'
})

const tarjetaModalClases = computed(() => {
  if (modoMiniplayer.value) {
    return 'pointer-events-auto w-[310px] sm:w-[390px] max-w-[calc(100vw-24px)] rounded-2xl bg-slate-950 border border-slate-700/80 shadow-[0_20px_60px_rgba(0,0,0,0.85)] ring-1 ring-white/10 group/mini animate-in fade-in slide-in-from-bottom-6'
  }
  if (esPantallaCompleta.value || esHorizontal.value) {
    return 'w-screen h-[100dvh] max-w-none max-h-none rounded-none border-none bg-black'
  }
  return `w-full ${mostrarChat.value ? 'max-w-6xl xl:max-w-7xl' : 'max-w-5xl'} rounded-none sm:rounded-2xl lg:rounded-3xl border-0 sm:border border-slate-800 shadow-2xl h-[100dvh] sm:h-[86vh] lg:h-[88vh] sm:max-h-[880px] bg-slate-950 flex flex-col transition-all duration-300 overflow-hidden`
})

const ajusteVideo = ref<'contain' | 'cover'>('contain')
const rotacionVisor = ref<0 | 90 | 180 | 270>(0)
const tieneVideoRecibido = ref(false)
const soportaPiP = ref(false)
const mostrarControles = ref(true)
let timeoutInactividad: any = null
let ultimoToque = 0

const tiempoTranscurridoViewer = ref('00:00')
let timerViewer: any = null

const actualizarTiempoViewer = () => {
  if (props.partido?.fechaInicioTransmision) {
    const elapsedSecs = Math.max(0, Math.floor((Date.now() - props.partido.fechaInicioTransmision) / 1000))
    const capped = Math.min(3600, elapsedSecs)
    const mins = Math.floor(capped / 60)
    const secs = capped % 60
    tiempoTranscurridoViewer.value = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
}

let timerVerificacionReproduccion: any = null

onMounted(() => {
  actualizarTiempoViewer()
  timerViewer = setInterval(actualizarTiempoViewer, 1000)

  // Guardia de reproducción activa: asegura que si el stream tiene tracks, el video comience a reproducir
  timerVerificacionReproduccion = setInterval(() => {
    const el = videoElementRef.value
    const stream = props.streamRemoto
    if (!el || !stream || !visible.value) return

    if (el.srcObject !== stream) {
      el.srcObject = stream
    }

    if (stream.getTracks().length > 0) {
      if (el.paused) {
        el.play()
          .then(() => {
            tieneVideoRecibido.value = true
          })
          .catch(() => {})
      }
      if (el.videoWidth > 0 && el.videoHeight > 0) {
        tieneVideoRecibido.value = true
      }
      if (el.currentTime > 0 || el.readyState >= 2) {
        tieneVideoRecibido.value = true
      }
    }
  }, 250)
})

onUnmounted(() => {
  if (timerViewer) {
    clearInterval(timerViewer)
    timerViewer = null
  }
  if (timerVerificacionReproduccion) {
    clearInterval(timerVerificacionReproduccion)
    timerVerificacionReproduccion = null
  }
})

// Función robusta para vincular y reproducir el stream remoto de video
const acoplarVideoRemoto = () => {
  const el = videoElementRef.value
  const stream = props.streamRemoto
  if (!el || !stream) return

  // Asegurar que todas las pistas (video y audio) estén activas
  stream.getTracks().forEach((t) => {
    t.enabled = true
  })

  // Asignar el stream al elemento video siempre que difiera
  if (el.srcObject !== stream) {
    el.srcObject = stream
  }

  // Escuchar si se añade una pista dinámicamente en este stream
  stream.onaddtrack = (e) => {
    console.log('[ModalTransmisionEnVivo] Pista agregada a stream remoto:', e.track.kind)
    e.track.enabled = true
    if (el.srcObject !== stream) {
      el.srcObject = stream
    }
    el.play()
      .then(() => {
        tieneVideoRecibido.value = true
      })
      .catch(() => {})
  }

  // Escuchar cuando el track comience a recibir paquetes reales de red
  stream.getTracks().forEach((track) => {
    track.onunmute = () => {
      console.log('[ModalTransmisionEnVivo] Pista desenmudecida, reproduciendo:', track.kind)
      tieneVideoRecibido.value = true
      el.play().catch(() => {})
    }
  })

  el.muted = audioMuteado.value
  el.volume = audioMuteado.value ? 0 : volumen.value

  const intentarReproducir = () => {
    const playPromise = el.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          tieneVideoRecibido.value = true
        })
        .catch((err) => {
          if (err.name === 'AbortError') return
          console.warn('[ModalTransmisionEnVivo] Autoplay fallback:', err)
          el.muted = true
          audioMuteado.value = true
          el.play()
            .then(() => {
              tieneVideoRecibido.value = true
            })
            .catch(() => {})
        })
    }
  }

  intentarReproducir()
}

// Vincular el MediaStream recibido a la etiqueta <video>
watch(
  [videoElementRef, () => props.streamRemoto, visible],
  ([el, nuevoStream, esVisible]) => {
    if (el && nuevoStream && esVisible) {
      nextTick(() => {
        acoplarVideoRemoto()
      })
    }
  },
  { immediate: true, flush: 'post' },
)

const totalEspectadoresReal = computed(() => {
  const deProps = Number(props.totalEspectadores || 0)
  const dePartido = Number(partidoActivo.value?.totalEspectadores || 0)
  return Math.max(1, Math.max(deProps, dePartido))
})

// Sincronización en tiempo real del partido y marcador en vivo
const partidoRealTime = ref<any>(null)
let unsubPartido: Unsubscribe | null = null

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
      console.warn('[ModalTransmisionEnVivo] Error en suscripción a partido en vivo:', err)
    },
  )
}

watch(
  () => props.partido?.id,
  (nuevoId) => {
    if (nuevoId) {
      partidoRealTime.value = props.partido
      iniciarSuscripcionPartido(nuevoId)
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
})

const partidoActivo = computed(() => partidoRealTime.value || props.partido)
const marcadorEnVivo = computed(() => partidoActivo.value?.marcadorEnVivo)

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

const puntosJ1Formateados = computed(() => {
  const pts = Number(puntosJ1.value) || 0
  return pts < 10 ? `0${pts}` : `${pts}`
})

const puntosJ2Formateados = computed(() => {
  const pts = Number(puntosJ2.value) || 0
  return pts < 10 ? `0${pts}` : `${pts}`
})

const servidorActual = computed(() => marcadorEnVivo.value?.servidorActual || 1)

const avisoAutoplaySonido = ref(true)

const activarSonidoInicial = () => {
  avisoAutoplaySonido.value = false
  alternarSonido()
}

const alternarSonido = () => {
  avisoAutoplaySonido.value = false
  const el = videoElementRef.value
  if (!el) return

  if (audioMuteado.value) {
    audioMuteado.value = false
    const targetVol = ultimoVolumen > 0.05 ? ultimoVolumen : 0.8
    volumen.value = targetVol
    el.muted = false
    el.volume = targetVol
    el.play().catch(() => {})
  } else {
    ultimoVolumen = volumen.value > 0.05 ? volumen.value : 0.8
    audioMuteado.value = true
    el.muted = true
  }
}

const handleCambiarVolumen = (nuevoVol: number) => {
  avisoAutoplaySonido.value = false
  const clamped = Math.max(0, Math.min(1, nuevoVol))
  volumen.value = clamped
  const el = videoElementRef.value
  if (!el) return

  if (clamped <= 0) {
    audioMuteado.value = true
    el.muted = true
    el.volume = 0
  } else {
    audioMuteado.value = false
    el.muted = false
    el.volume = clamped
    ultimoVolumen = clamped
    el.play().catch(() => {})
  }
}

const handleVolumeChange = () => {
  if (videoElementRef.value) {
    audioMuteado.value = videoElementRef.value.muted
    if (!videoElementRef.value.muted) {
      volumen.value = videoElementRef.value.volume
    }
  }
}

const alternarAjusteVideo = () => {
  ajusteVideo.value = ajusteVideo.value === 'contain' ? 'cover' : 'contain'
}

const alternarPiP = async () => {
  if (!videoElementRef.value) return
  try {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture()
    } else {
      await videoElementRef.value.requestPictureInPicture()
    }
  } catch (err) {
    console.warn('Error al activar Picture-in-Picture:', err)
  }
}

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
    props.streamRemoto ||
    (videoElementRef.value?.srcObject as MediaStream) ||
    ((videoElementRef.value as any)?.captureStream?.() as MediaStream)

  if (!stream) {
    return
  }

  const j1Nombre =
    partidoActivo.value?.jugador1?.nombre ||
    props.partido?.jugador1?.nombre ||
    'Jugador 1'
  const j2Nombre =
    partidoActivo.value?.jugador2?.nombre ||
    props.partido?.jugador2?.nombre ||
    'Jugador 2'

  iniciarGrabacionClip(
    stream,
    videoElementRef.value,
    {
      torneoId: (partidoActivo.value as any)?.torneoId || (props.partido as any)?.torneoId,
      torneoNombre: (partidoActivo.value as any)?.torneoNombre || (props.partido as any)?.torneoNombre || 'Torneo Tenis de Mesa',
      partidoId: partidoActivo.value?.id || props.partido?.id,
      mesa: marcadorEnVivo.value?.mesa || partidoActivo.value?.mesa || props.partido?.mesa || 'Mesa 1',
      jugador1: {
        id: partidoActivo.value?.jugador1Id || props.partido?.jugador1Id || 'j1',
        nombre: j1Nombre,
      },
      jugador2: {
        id: partidoActivo.value?.jugador2Id || props.partido?.jugador2Id || 'j2',
        nombre: j2Nombre,
      },
      marcadorMomento: `${puntosJ1.value} - ${puntosJ2.value}`,
      titulo: `Clip Destacado: ${j1Nombre} vs ${j2Nombre}`,
      tipo: 'mejor_jugada',
    },
    15,
  )
}

const resetearInactividad = () => {
  mostrarControles.value = true
  if (timeoutInactividad) clearTimeout(timeoutInactividad)
  if (esPantallaCompleta.value || esHorizontal.value) {
    timeoutInactividad = setTimeout(() => {
      mostrarControles.value = false
    }, 3500)
  }
}

const handleTouchVideo = () => {
  resetearInactividad()
  const ahora = Date.now()
  if (ahora - ultimoToque < 320) {
    alternarPantallaCompleta()
    ultimoToque = 0
  } else {
    ultimoToque = ahora
  }
}

const alternarMiniplayer = async () => {
  if (esPantallaCompleta.value) {
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      try {
        if (document.exitFullscreen) {
          await document.exitFullscreen()
        } else if ((document as any).webkitExitFullscreen) {
          await (document as any).webkitExitFullscreen()
        }
      } catch {}
    }
    esPantallaCompleta.value = false
  }
  modoMiniplayer.value = !modoMiniplayer.value
}

const alternarPantallaCompleta = async () => {
  if (modoMiniplayer.value) {
    modoMiniplayer.value = false
  }

  const container = modalContainerRef.value || videoContainerRef.value
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

  // Fallback especial para video en iOS Safari
  if (!nativoExitoso && video && (video as any).webkitEnterFullscreen) {
    try {
      (video as any).webkitEnterFullscreen()
      nativoExitoso = true
    } catch (e) {
      console.warn('webkitEnterFullscreen falló:', e)
    }
  }

  // En celulares, sugerir orientación horizontal para modo TV
  try {
    if (screen.orientation && 'lock' in screen.orientation) {
      await (screen.orientation as any).lock('landscape').catch(() => {})
    }
  } catch {}

  esPantallaCompleta.value = true
  resetearInactividad()
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

const handleKeydown = (e: KeyboardEvent) => {
  if (!visible.value) return

  // No interceptar si el usuario está escribiendo en un input, textarea o editable
  const target = e.target as HTMLElement | null
  if (
    target &&
    (target.tagName === 'INPUT' ||
      target.tagName === 'TEXTAREA' ||
      target.isContentEditable)
  ) {
    return
  }

  if (e.key === 'i' || e.key === 'I') {
    e.preventDefault()
    alternarMiniplayer()
  } else if (e.key === 'f' || e.key === 'F') {
    e.preventDefault()
    alternarPantallaCompleta()
  } else if (e.key === 'm' || e.key === 'M') {
    e.preventDefault()
    alternarSonido()
  } else if (e.key === 'c' || e.key === 'C') {
    e.preventDefault()
    alternarChat()
  } else if (e.key === 'Escape') {
    if (esPantallaCompleta.value) {
      e.preventDefault()
      alternarPantallaCompleta()
    } else if (modoMiniplayer.value) {
      e.preventDefault()
      alternarMiniplayer()
    }
  }
}

onMounted(() => {
  verificarOrientacion()
  window.addEventListener('resize', verificarOrientacion)
  window.addEventListener('orientationchange', verificarOrientacion)
  if (screen?.orientation?.addEventListener) {
    screen.orientation.addEventListener('change', verificarOrientacion)
  }
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
  window.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  window.removeEventListener('resize', verificarOrientacion)
  window.removeEventListener('orientationchange', verificarOrientacion)
  if (screen?.orientation?.removeEventListener) {
    screen.orientation.removeEventListener('change', verificarOrientacion)
  }
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
  window.removeEventListener('keydown', handleKeydown)
  if (timeoutInactividad) clearTimeout(timeoutInactividad)
})

const open = () => {
  tieneVideoRecibido.value = false
  visible.value = true
  mostrarControles.value = true
  verificarOrientacion()
  nextTick(() => {
    soportaPiP.value = 'pictureInPictureEnabled' in document
    acoplarVideoRemoto()
  })
}

const close = () => {
  if (esPantallaCompleta.value) {
    alternarPantallaCompleta()
  }
  modoMiniplayer.value = false
  visible.value = false
  tieneVideoRecibido.value = false
  emit('cerrar')
}

defineExpose({
  open,
  close,
  alternarMiniplayer,
  alternarPantallaCompleta,
  modoMiniplayer,
})
</script>

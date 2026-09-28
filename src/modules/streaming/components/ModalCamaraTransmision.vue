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
          'fixed inset-0 z-[70] flex items-center justify-center select-none overflow-hidden transition-all',
          (esPantallaCompleta || esHorizontal) ? 'p-0 bg-black w-screen h-[100dvh]' : 'p-2 sm:p-4 bg-black/90 backdrop-blur-md'
        ]"
      >
        <div
          :class="[
            'relative w-full bg-black border-0 shadow-2xl overflow-hidden flex transition-all select-none',
            esHorizontal
              ? 'w-screen h-[100dvh] max-w-none max-h-none rounded-none border-none bg-black flex-row'
              : `w-full ${mostrarChat ? 'max-w-6xl xl:max-w-7xl' : 'max-w-5xl'} rounded-none sm:rounded-2xl lg:rounded-3xl border-0 sm:border border-slate-800 shadow-2xl h-[100dvh] sm:h-[86vh] lg:h-[88vh] sm:max-h-[880px] flex-col transition-all duration-300`
          ]"
        >
          <!-- CABECERA DE TRANSMISIÓN -->
          <div
            v-if="!esHorizontal"
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
              <!-- Botón Rotar / Modo Horizontal en Celular -->
              <button
                type="button"
                class="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-1.5 cursor-pointer border shadow-xs"
                :class="rotacionCamara !== 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'"
                :title="rotacionCamara === 0 ? 'Girar a Modo Horizontal (16:9)' : `Rotación activa: ${rotacionCamara}°`"
                @click="alternarRotacionCamara"
              >
                <RotateCw class="w-3.5 h-3.5 text-amber-400" />
                <span class="hidden md:inline">{{ rotacionCamara === 0 ? 'Modo Horizontal' : `${rotacionCamara}°` }}</span>
              </button>

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

          <!-- CONTENEDOR FLEX: CÁMARA LOCAL + CHAT LATERAL -->
          <div :class="['relative flex-1 flex overflow-hidden min-h-0 w-full', esHorizontal ? 'flex-row' : 'flex-col']">
            <!-- ÁREA DE VIDEO / VIEWFINDER DE CÁMARA NATIVO -->
            <div
              :class="[
                'relative bg-black flex items-center justify-center overflow-hidden group select-none min-h-0 min-w-0 transition-all',
                esHorizontal || esPantallaCompleta
                  ? 'flex-1 h-full'
                  : 'w-full shrink-0 aspect-video max-h-[38vh] sm:max-h-[46vh] lg:max-h-none lg:aspect-auto lg:flex-1 lg:h-full'
              ]"
              @dblclick="alternarPantallaCompleta"
            >
            <!-- Video en tiempo real del emisor con soporte para rotación horizontal -->
            <video
              ref="videoElementRef"
              autoplay
              playsinline
              muted
              class="w-full h-full object-contain transform transition-all duration-300"
              :style="{
                transform: `${!camaraTrasera ? 'scaleX(-1) ' : ''}rotate(${rotacionCamara}deg) scale(${zoomSeleccionado >= 1 ? zoomSeleccionado : 1})`,
              }"
              @loadedmetadata="verificarOrientacionVideo"
            ></video>

            <!-- ENMARCADO DE CÁMARA PROFESIONAL (ESQUINAS BLANCAS DEL VIEWFINDER) -->
            <div class="pointer-events-none absolute inset-3 sm:inset-6 z-10 transition-opacity duration-300">
              <div class="absolute top-0 left-0 w-5 h-5 sm:w-7 sm:h-7 border-t-2 border-l-2 border-white/70 rounded-tl-sm"></div>
              <div class="absolute top-0 right-0 w-5 h-5 sm:w-7 sm:h-7 border-t-2 border-r-2 border-white/70 rounded-tr-sm"></div>
              <div class="absolute bottom-0 left-0 w-5 h-5 sm:w-7 sm:h-7 border-b-2 border-l-2 border-white/70 rounded-bl-sm"></div>
              <div class="absolute bottom-0 right-0 w-5 h-5 sm:w-7 sm:h-7 border-b-2 border-r-2 border-white/70 rounded-br-sm"></div>
            </div>

            <!-- CABECERA FLOTANTE DE CÁMARA (CUANDO ESTÁ EN MODO HORIZONTAL O FULLSCREEN) -->
            <div
              v-if="esHorizontal"
              class="absolute top-0 inset-x-0 z-30 flex items-center justify-between px-3 sm:px-5 py-2.5 bg-gradient-to-b from-black/85 via-black/40 to-transparent pointer-events-auto"
            >
              <!-- Indicadores de Estado -->
              <div class="flex items-center gap-1.5 sm:gap-2 flex-wrap min-w-0">
                <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-wider bg-rose-500/25 text-rose-400 border border-rose-500/40 shadow-xs shrink-0">
                  <span class="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
                  <span>REC EN VIVO</span>
                </span>

                <span
                  class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-mono font-bold text-amber-300 bg-black/60 backdrop-blur-md border border-amber-500/40 shrink-0"
                  title="Duración de la transmisión"
                >
                  <Clock class="w-3.5 h-3.5 text-amber-400" />
                  <span>{{ tiempoTranscurridoInterno || tiempoFormateado || '00:00' }}</span>
                  <span class="hidden sm:inline"> / 60:00</span>
                </span>

                <span class="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold text-slate-300 bg-black/60 backdrop-blur-md border border-white/15 shrink-0">
                  <Users class="w-3.5 h-3.5 text-sky-400" />
                  <span>{{ totalEspectadores }}</span>
                </span>

                <button
                  type="button"
                  class="flex items-center gap-1 px-2 sm:px-2.5 py-1 rounded-full text-[10px] sm:text-xs font-bold transition-all cursor-pointer border active:scale-95 bg-black/60 backdrop-blur-md select-none shadow-xs shrink-0"
                  :class="badgeDiagnosticoClases"
                  title="Ver diagnóstico de red"
                  @click="mostrarDiagnostico = !mostrarDiagnostico"
                >
                  <Activity class="w-3.5 h-3.5 animate-pulse" :class="colorPuntoCalidad" />
                  <span>{{ diagnosticoActual.latenciaMs }}ms</span>
                  <span class="hidden sm:inline font-mono opacity-80">| {{ diagnosticoActual.fps }}fps</span>
                </button>
              </div>

              <!-- Herramientas Rápidas Superior Derecha -->
              <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
                <!-- Linterna / Flash -->
                <button
                  v-if="soportaTorch"
                  type="button"
                  class="p-2 rounded-full transition-all cursor-pointer border shadow-xs"
                  :class="torchActivo ? 'bg-amber-400 text-slate-950 border-amber-300 shadow-amber-500/50' : 'bg-black/60 text-white/80 hover:text-white border-white/20'"
                  title="Alternar linterna"
                  @click="alternarTorch"
                >
                  <Zap class="w-4 h-4" />
                </button>

                <!-- Rotar 90° -->
                <button
                  type="button"
                  class="p-2 rounded-full transition-all cursor-pointer border shadow-xs"
                  :class="rotacionCamara !== 0 ? 'bg-amber-500/25 text-amber-300 border-amber-500/40' : 'bg-black/60 text-white/80 hover:text-white border-white/20'"
                  :title="`Rotación activa: ${rotacionCamara}°`"
                  @click="alternarRotacionCamara"
                >
                  <RotateCw class="w-4 h-4 text-amber-400" />
                </button>

                <!-- Pantalla Completa -->
                <button
                  type="button"
                  class="p-2 rounded-full bg-black/60 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white transition-all cursor-pointer border border-white/20"
                  :title="esPantallaCompleta ? 'Salir de pantalla completa' : 'Pantalla completa'"
                  @click="alternarPantallaCompleta"
                >
                  <Minimize v-if="esPantallaCompleta" class="w-4 h-4" />
                  <Maximize v-else class="w-4 h-4" />
                </button>

                <!-- Minimizar -->
                <button
                  type="button"
                  class="p-2 rounded-full bg-black/60 hover:bg-white/20 active:scale-95 text-white/80 hover:text-white transition-all cursor-pointer border border-white/20"
                  title="Minimizar cámara"
                  @click="visible = false"
                >
                  <Minimize2 class="w-4 h-4" />
                </button>

                <!-- Finalizar -->
                <button
                  type="button"
                  class="p-2 rounded-full bg-rose-600/80 hover:bg-rose-500 active:scale-95 text-white transition-all cursor-pointer border border-rose-400/50 shadow-md"
                  title="Finalizar transmisión"
                  @click="confirmarFinalizarTransmision"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
            </div>

            <!-- EFECTO FLASH DE DISPARO AL GRABAR CLIP -->
            <div
              v-if="flashDisparo"
              class="absolute inset-0 bg-white/70 z-50 pointer-events-none transition-opacity duration-150"
            ></div>

            <!-- CÁPSULA DE ZOOM + SELECTOR DE MODOS NATIVOS ESTILO CÁMARA (FOTO DE REFERENCIA) -->
            <div class="absolute bottom-3 sm:bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 select-none pointer-events-auto">
              <!-- Selector de Zoom Flotante: [ ⊕ 0.6 1x 2 2.5 5 ☀️ ] -->
              <div class="flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-full bg-black/75 backdrop-blur-xl border border-white/20 shadow-2xl select-none">
                <span class="text-white/60 text-xs px-1 select-none">⊕</span>
                <button
                  v-for="z in nivelesZoom"
                  :key="z"
                  type="button"
                  class="px-2 sm:px-2.5 py-0.5 rounded-full text-xs font-black transition-all cursor-pointer select-none"
                  :class="zoomSeleccionado === z ? 'bg-amber-400 text-slate-950 shadow-md scale-110' : 'text-white/75 hover:text-white hover:bg-white/10'"
                  @click.stop="seleccionarZoom(z)"
                >
                  {{ z === 1 ? '1x' : `${z}` }}
                </button>
                <span class="text-white/60 text-xs px-1 select-none">☀️</span>
              </div>

              <!-- Selector de Modos de Cámara (Estilo Android/iOS Cámara Nativa) -->
              <div class="flex items-center gap-3.5 sm:gap-5 text-[10px] sm:text-xs tracking-wider uppercase font-black text-white/50 drop-shadow-md select-none bg-black/40 backdrop-blur-md px-3 py-1 rounded-full border border-white/10">
                <button
                  type="button"
                  class="transition-colors cursor-pointer"
                  :class="modoCamara === 'camara' ? 'text-amber-400 font-black' : 'hover:text-white'"
                  @click="modoCamara = 'camara'"
                >
                  CÁMARA
                </button>
                <button
                  type="button"
                  class="transition-colors cursor-pointer"
                  :class="modoCamara === 'en_vivo' ? 'text-amber-400 font-black' : 'hover:text-white'"
                  @click="modoCamara = 'en_vivo'"
                >
                  EN VIVO
                </button>
                <button
                  type="button"
                  class="transition-colors cursor-pointer"
                  :class="modoCamara === 'clips' ? 'text-amber-400 font-black' : 'hover:text-white'"
                  @click="modoCamara = 'clips'"
                >
                  CLIPS
                </button>
                <button
                  type="button"
                  class="transition-colors cursor-pointer"
                  :class="mostrarDiagnostico ? 'text-amber-400 font-black' : 'hover:text-white'"
                  @click="mostrarDiagnostico = !mostrarDiagnostico"
                >
                  DIAGNÓSTICO
                </button>
              </div>
            </div>

            <!-- Banner recomendación modo horizontal cuando el sensor está en vertical -->
            <div
              v-if="esVideoVertical && rotacionCamara === 0"
              class="absolute top-16 left-1/2 -translate-x-1/2 z-30 px-3.5 py-2 rounded-2xl bg-slate-950/90 text-amber-300 text-xs font-bold border border-amber-500/40 shadow-2xl flex items-center gap-2 pointer-events-auto backdrop-blur-md max-w-[90%]"
            >
              <Smartphone class="w-4 h-4 shrink-0 text-amber-400" />
              <span class="text-[11px] sm:text-xs">Para ping pong ubica el celular en horizontal (16:9)</span>
              <button
                type="button"
                class="px-2 py-0.5 rounded-lg bg-amber-500 text-slate-950 font-black text-[10px] cursor-pointer hover:bg-amber-400 transition-colors shrink-0"
                @click="rotacionCamara = 90"
              >
                Girar 90°
              </button>
            </div>

            <!-- OVERLAY AUTOMÁTICO DE PARTIDO FINALIZADO (AL MEJOR DE 3 SETS) -->
            <Transition
              enter-active-class="transition duration-300 ease-out"
              enter-from-class="opacity-0 scale-95"
              enter-to-class="opacity-100 scale-100"
              leave-active-class="transition duration-200 ease-in"
              leave-from-class="opacity-100 scale-100"
              leave-to-class="opacity-0 scale-95"
            >
              <div
                v-if="finalizandoPorFinDePartido"
                class="absolute inset-0 bg-slate-950/95 backdrop-blur-md flex flex-col items-center justify-center gap-3.5 text-white z-50 p-6 text-center select-none"
              >
                <div class="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center shadow-2xl animate-bounce">
                  <Trophy class="w-8 h-8" />
                </div>
                <div class="space-y-1.5 max-w-sm">
                  <h3 class="text-base sm:text-lg font-black text-white">¡Partido Concluido (Al Mejor de 3 Sets)!</h3>
                  <p class="text-xs text-slate-300 leading-relaxed">
                    El árbitro ha finalizado los sets reglamentarios. Guardando la transmisión completa en la videoteca y apagando la cámara automáticamente...
                  </p>
                  <p class="text-xs sm:text-sm font-mono font-black text-emerald-400 pt-1">
                    Cerrando cámara en {{ cuentaRegresivaFin }}s
                  </p>
                </div>
                <button
                  type="button"
                  class="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs cursor-pointer shadow-lg transition-all active:scale-95"
                  @click="ejecutarFinalizarTransmision"
                >
                  Finalizar Ahora
                </button>
              </div>
            </Transition>

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

            <!-- MARCADOR FLOTANTE CENTRAL ESTILO WTT / ITTF (TRANSMISIÓN DE TV PROFESIONAL) -->
            <div
              v-if="partidoActivo"
              class="absolute left-1/2 -translate-x-1/2 z-20 flex flex-col items-center pointer-events-none select-none drop-shadow-2xl transition-all duration-300"
              :class="esHorizontal ? 'top-12 sm:top-14 scale-90 sm:scale-100' : 'top-3 scale-95'"
            >
              <!-- Pestaña Superior de Mesa y Set: MESA 1 | SET 2 -->
              <div class="px-3.5 py-0.5 rounded-t-lg bg-black/85 border-t border-x border-white/20 text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-400 shadow-md flex items-center gap-1.5">
                <span>{{ marcadorEnVivo?.mesa || partidoActivo.mesa || 'Mesa 1' }}</span>
                <span class="text-white/40">|</span>
                <span>{{ marcadorEnVivo?.setActual || 'Set 1' }}</span>
                <span v-if="setsGanadosJ1 > 0 || setsGanadosJ2 > 0" class="ml-1 text-slate-300 font-mono text-[9px] font-bold">
                  ({{ setsGanadosJ1 }}-{{ setsGanadosJ2 }})
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

                  <!-- Nombre Jugador 1 -->
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

                  <!-- Nombre Jugador 2 -->
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
              class="w-72 sm:w-80 h-full shrink-0 z-40 border-l border-white/10"
              @cerrar-chat="mostrarChat = false"
            />

            <!-- BARRA LATERAL DERECHA DE ACCIONES DE CÁMARA NATIVA (MODO HORIZONTAL) -->
            <div
              v-if="esHorizontal"
              class="w-20 xs:w-24 sm:w-28 h-full bg-black/95 backdrop-blur-2xl border-l border-white/10 flex flex-col items-center justify-between py-4 px-2 z-30 shrink-0 select-none"
            >
              <!-- Acciones Superiores -->
              <div class="flex flex-col items-center gap-3">
                <!-- Alternar Cámara (Frontal / Trasera) -->
                <button
                  type="button"
                  class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white flex items-center justify-center border border-white/20 shadow-lg transition-all cursor-pointer"
                  :title="camaraTrasera ? 'Cambiar a cámara frontal' : 'Cambiar a cámara trasera'"
                  @click="alternarCamara"
                >
                  <SwitchCamera class="w-5 h-5 text-sky-300" />
                </button>

                <!-- Ver / Ocultar Chat en Vivo -->
                <button
                  type="button"
                  class="w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border shadow-md relative"
                  :class="mostrarChat ? 'bg-sky-500 text-white border-sky-400 shadow-sky-500/40' : 'bg-white/10 hover:bg-white/20 text-slate-300 border-white/15'"
                  title="Chat de espectadores"
                  @click="mostrarChat = !mostrarChat"
                >
                  <MessageSquare class="w-4 h-4" />
                </button>
              </div>

              <!-- BOTÓN CENTRAL OBTURADOR / DISPARADOR ESTILO CÁMARA (FOTO DE REFERENCIA) -->
              <div class="flex flex-col items-center gap-1.5 my-auto">
                <button
                  type="button"
                  class="w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 rounded-full border-4 border-white p-1 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)] cursor-pointer active:scale-90 transition-all select-none group"
                  :title="estaGrabandoClip ? 'Terminar de grabar clip ahora' : 'Grabar clip destacado (15s)'"
                  @click="dispararObturador"
                >
                  <!-- Botón Interno Shutter -->
                  <div
                    v-if="estaGrabandoClip"
                    class="w-11 h-11 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-2xl bg-rose-600 text-white flex flex-col items-center justify-center animate-pulse shadow-lg font-mono font-black text-xs"
                  >
                    <span>{{ segundosGrabadosClip }}s</span>
                    <span class="text-[8px] font-sans uppercase">REC</span>
                  </div>
                  <div
                    v-else
                    class="w-11 h-11 xs:w-12 xs:h-12 sm:w-14 sm:h-14 rounded-full transition-all group-hover:scale-95 shadow-inner flex items-center justify-center"
                    :class="modoCamara === 'clips' ? 'bg-amber-400' : 'bg-white'"
                  >
                    <span v-if="modoCamara === 'clips'" class="text-[9px] font-black uppercase text-slate-950">CLIP</span>
                    <span v-else class="w-3.5 h-3.5 rounded-full bg-rose-600"></span>
                  </div>
                </button>
                <span class="text-[9px] font-black uppercase tracking-wider text-white/70">
                  {{ estaGrabandoClip ? 'GRABANDO' : (modoCamara === 'clips' ? 'CLIP 15s' : 'OBTURADOR') }}
                </span>
              </div>

              <!-- Acciones Inferiores -->
              <div class="flex flex-col items-center gap-3">
                <!-- Miniatura de Clip / Galería (Foto de Referencia: abajo a la izquierda) -->
                <button
                  type="button"
                  class="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-slate-800/90 border border-white/20 overflow-hidden flex items-center justify-center text-amber-300 hover:border-amber-400 active:scale-90 transition-all cursor-pointer relative shadow-lg"
                  title="Grabar clip destacado de 15s para la biblioteca"
                  @click="alternarCapturaClip"
                >
                  <Scissors class="w-5 h-5 text-amber-400" />
                  <span class="absolute bottom-0 inset-x-0 bg-black/80 text-[7px] font-black text-amber-300 uppercase text-center py-0.2">CLIP</span>
                </button>

                <!-- Micrófono -->
                <button
                  type="button"
                  class="w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border shadow-md"
                  :class="audioActivo ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'"
                  :title="audioActivo ? 'Silenciar micrófono' : 'Activar micrófono'"
                  @click="alternarAudio"
                >
                  <Mic v-if="audioActivo" class="w-4 h-4" />
                  <MicOff v-else class="w-4 h-4" />
                </button>

                <!-- Video -->
                <button
                  type="button"
                  class="w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer border shadow-md"
                  :class="videoActivo ? 'bg-white/10 text-white border-white/20' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'"
                  :title="videoActivo ? 'Pausar video' : 'Activar video'"
                  @click="alternarVideo"
                >
                  <Video v-if="videoActivo" class="w-4 h-4 text-emerald-400" />
                  <VideoOff v-else class="w-4 h-4 text-rose-400" />
                </button>
              </div>
            </div>
          </div>

          <!-- BARRA DE CONTROLES INFERIOR EN MODO VERTICAL (ESTILO CÁMARA NATIVA) -->
          <div
            v-if="!esHorizontal"
            class="p-3 sm:p-4 bg-slate-950 border-t border-slate-800 flex flex-col gap-3 z-20 select-none"
          >
            <!-- Fila Superior de Herramientas Rápidas -->
            <div class="flex items-center justify-between gap-2 flex-wrap px-1">
              <!-- Micrófono -->
              <button
                type="button"
                class="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-xs"
                :class="audioActivo ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/50' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'"
                @click="alternarAudio"
              >
                <Mic v-if="audioActivo" class="w-4 h-4 text-emerald-400" />
                <MicOff v-else class="w-4 h-4 text-rose-400" />
                <span>{{ audioActivo ? 'Mic ON' : 'Mute' }}</span>
              </button>

              <!-- Video -->
              <button
                type="button"
                class="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-xs"
                :class="videoActivo ? 'bg-slate-800 text-white border-slate-700/60' : 'bg-rose-500/20 text-rose-400 border-rose-500/40'"
                @click="alternarVideo"
              >
                <Video v-if="videoActivo" class="w-4 h-4 text-emerald-400" />
                <VideoOff v-else class="w-4 h-4 text-rose-400" />
                <span>{{ videoActivo ? 'Cámara' : 'Pausa' }}</span>
              </button>

              <!-- Chat -->
              <button
                type="button"
                class="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-xs"
                :class="mostrarChat ? 'bg-sky-500/20 text-sky-300 border-sky-500/40' : 'bg-slate-800 text-slate-300 border-slate-700/60'"
                @click="mostrarChat = !mostrarChat"
              >
                <MessageSquare class="w-4 h-4 text-sky-400" />
                <span>Chat</span>
              </button>

              <!-- Rotar Horizontal -->
              <button
                type="button"
                class="px-2.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer border shadow-xs"
                :class="rotacionCamara !== 0 ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-slate-800 text-slate-300 border-slate-700/60'"
                @click="alternarRotacionCamara"
              >
                <RotateCw class="w-4 h-4 text-amber-400" />
                <span>{{ rotacionCamara === 0 ? 'Horizontal' : `${rotacionCamara}°` }}</span>
              </button>
            </div>

            <!-- Fila Principal Estilo App de Cámara Nativa: [ Galería / Clips ]  [ OBTURADOR ]  [ Flip Cámara ] -->
            <div class="flex items-center justify-around py-1">
              <!-- Botón Galería / Grabar Clip 15s -->
              <button
                type="button"
                class="w-12 h-12 rounded-2xl bg-slate-800 border border-white/20 overflow-hidden flex flex-col items-center justify-center text-amber-300 hover:border-amber-400 active:scale-90 transition-all cursor-pointer relative shadow-lg"
                title="Capturar clip de 15 segundos"
                @click="alternarCapturaClip"
              >
                <Scissors class="w-5 h-5 text-amber-400" />
                <span class="text-[8px] font-black uppercase text-amber-300">15s</span>
              </button>

              <!-- Gran Botón Obturador Shutter Blanco Circular -->
              <button
                type="button"
                class="w-18 h-18 rounded-full border-4 border-white p-1 flex items-center justify-center shadow-[0_0_25px_rgba(255,255,255,0.4)] cursor-pointer active:scale-90 transition-all group"
                @click="dispararObturador"
              >
                <div
                  v-if="estaGrabandoClip"
                  class="w-12 h-12 rounded-2xl bg-rose-600 text-white flex flex-col items-center justify-center animate-pulse font-mono font-black text-xs"
                >
                  <span>{{ segundosGrabadosClip }}s</span>
                </div>
                <div
                  v-else
                  class="w-12 h-12 rounded-full transition-all group-hover:scale-95 flex items-center justify-center shadow-inner"
                  :class="modoCamara === 'clips' ? 'bg-amber-400' : 'bg-white'"
                >
                  <span v-if="modoCamara === 'clips'" class="text-[9px] font-black text-slate-950 uppercase">CLIP</span>
                  <span v-else class="w-3.5 h-3.5 rounded-full bg-rose-600"></span>
                </div>
              </button>

              <!-- Botón Flip Cámara Frontal/Trasera -->
              <button
                type="button"
                class="w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 active:scale-90 text-white flex items-center justify-center border border-white/20 shadow-md transition-all cursor-pointer"
                title="Cambiar cámara"
                @click="alternarCamara"
              >
                <SwitchCamera class="w-5 h-5 text-sky-300" />
              </button>
            </div>
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
  RotateCw,
  Trophy,
  Smartphone,
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

const puntosJ1Formateados = computed(() => {
  const pts = Number(puntosJ1.value) || 0
  return pts < 10 ? `0${pts}` : `${pts}`
})

const puntosJ2Formateados = computed(() => {
  const pts = Number(puntosJ2.value) || 0
  return pts < 10 ? `0${pts}` : `${pts}`
})

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

const servidorActual = computed(() => marcadorEnVivo.value?.servidorActual || 1)

const alternarCamara = () => emit('alternar-camara')
const alternarAudio = () => emit('alternar-audio')
const alternarVideo = () => emit('alternar-video')

// ==========================================
// ORIENTACIÓN Y MODO HORIZONTAL EN CELULAR
// ==========================================
const rotacionCamara = ref<0 | 90 | 180 | 270>(0)
const esVideoVertical = ref(false)

const windowWidth = ref(typeof window !== 'undefined' ? window.innerWidth : 1000)
const windowHeight = ref(typeof window !== 'undefined' ? window.innerHeight : 600)

const verificarOrientacion = () => {
  if (typeof window === 'undefined') return
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
}

const esHorizontal = computed(() => {
  const isLandscapeWindow = windowWidth.value > windowHeight.value
  let isLandscapeScreen = false
  if (typeof screen !== 'undefined' && screen.orientation?.type) {
    isLandscapeScreen = screen.orientation.type.includes('landscape')
  }
  return isLandscapeWindow || isLandscapeScreen || rotacionCamara.value === 90 || rotacionCamara.value === 270 || esPantallaCompleta.value
})

// ==========================================
// SELECTOR DE ZOOM ESTILO CÁMARA (0.6, 1x, 2, 2.5, 5)
// ==========================================
const nivelesZoom = [0.6, 1, 2, 2.5, 5]
const zoomSeleccionado = ref(1)

// ==========================================
// MODOS DE CÁMARA Y DISPARO NATIVO
// ==========================================
const modoCamara = ref<'camara' | 'en_vivo' | 'clips'>('en_vivo')
const flashDisparo = ref(false)

const dispararObturador = () => {
  flashDisparo.value = true
  setTimeout(() => {
    flashDisparo.value = false
  }, 150)
  alternarCapturaClip()
}

const seleccionarZoom = async (z: number) => {
  zoomSeleccionado.value = z
  const videoTrack = props.streamLocal?.getVideoTracks()[0]
  if (videoTrack) {
    const caps = videoTrack.getCapabilities ? (videoTrack.getCapabilities() as any) : null
    if (caps && 'zoom' in caps) {
      try {
        const minZ = caps.zoom.min || 1
        const maxZ = caps.zoom.max || 5
        const targetZ = Math.max(minZ, Math.min(maxZ, z))
        await videoTrack.applyConstraints({
          advanced: [{ zoom: targetZ } as any]
        })
        return
      } catch (err) {
        console.warn('Error aplicando zoom hardware:', err)
      }
    }
  }
}

// ==========================================
// CONTROL DE LINTERNA / FLASH
// ==========================================
const torchActivo = ref(false)
const soportaTorch = ref(false)

const verificarSoporteTorch = () => {
  const track = props.streamLocal?.getVideoTracks()[0]
  if (track) {
    const caps = track.getCapabilities ? (track.getCapabilities() as any) : null
    if (caps && 'torch' in caps) {
      soportaTorch.value = true
    }
  }
}

const alternarTorch = async () => {
  const track = props.streamLocal?.getVideoTracks()[0]
  if (track) {
    try {
      torchActivo.value = !torchActivo.value
      await track.applyConstraints({
        advanced: [{ torch: torchActivo.value } as any]
      })
    } catch (err) {
      console.warn('Error alternando linterna:', err)
      torchActivo.value = false
    }
  }
}

const alternarRotacionCamara = () => {
  rotacionCamara.value = ((rotacionCamara.value + 90) % 360) as any
}

const verificarOrientacionVideo = () => {
  if (videoElementRef.value) {
    const w = videoElementRef.value.videoWidth
    const h = videoElementRef.value.videoHeight
    if (w > 0 && h > 0) {
      esVideoVertical.value = h > w && rotacionCamara.value === 0
    }
  }
}

const solicitarOrientacionHorizontal = async () => {
  try {
    if (screen.orientation && 'lock' in screen.orientation) {
      await (screen.orientation as any).lock('landscape').catch(() => {})
    }
  } catch {}
}

// Grabador de Clips en vivo para la Biblioteca
const {
  estaGrabando: estaGrabandoClip,
  segundosGrabados: segundosGrabadosClip,
  feedbackClip,
  guardandoTransmision,
  iniciarGrabacionClip,
  detenerGrabacionClip,
  iniciarGrabacionTransmision,
  detenerYGuardarTransmision,
} = useGrabadorClips()

// Iniciar grabación continua automática de la transmisión en vivo
watch(
  [visible, () => props.streamLocal],
  ([esVisible, stream]) => {
    if (esVisible && stream) {
      iniciarGrabacionTransmision(stream)
    }
  },
  { immediate: true },
)

// ==============================================================
// AUTO-APAGADO POR FINALIZACIÓN DE SETS (AL MEJOR DE 3 / JUGADO)
// ==============================================================
const partidoTerminadoPorSets = computed(() => {
  if (!partidoActivo.value) return false
  const p = partidoActivo.value
  const j1Sets = setsGanadosJ1.value
  const j2Sets = setsGanadosJ2.value

  // Al mejor de 3 sets: gana el primero que consiga 2 sets
  return (
    j1Sets >= 2 ||
    j2Sets >= 2 ||
    p.estado === 'jugado' ||
    Boolean(p.ganadorId) ||
    Boolean(marcadorEnVivo.value?.finalizado)
  )
})

const finalizandoPorFinDePartido = ref(false)
const cuentaRegresivaFin = ref(3)
let timerCuentaFin: any = null

watch(
  [partidoTerminadoPorSets, visible],
  ([terminado, esVisible]) => {
    if (terminado && esVisible && !finalizandoPorFinDePartido.value) {
      finalizandoPorFinDePartido.value = true
      cuentaRegresivaFin.value = 3
      if (timerCuentaFin) clearInterval(timerCuentaFin)

      timerCuentaFin = setInterval(() => {
        cuentaRegresivaFin.value -= 1
        if (cuentaRegresivaFin.value <= 0) {
          clearInterval(timerCuentaFin)
          timerCuentaFin = null
          ejecutarFinalizarTransmision()
        }
      }, 1000)
    }
  },
  { immediate: true },
)

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
  if (timerCuentaFin) {
    clearInterval(timerCuentaFin)
    timerCuentaFin = null
  }
  finalizandoPorFinDePartido.value = false
  mostrarModalConfirmacion.value = false
  visible.value = false

  // Registrar automáticamente la transmisión completada en la videoteca
  const p = partidoRealTime.value || props.partido
  const j1Nombre = p?.jugador1?.nombre || 'Jugador 1'
  const j2Nombre = p?.jugador2?.nombre || 'Jugador 2'
  const torneo = (p as any)?.torneoNombre || 'Torneo Tenis de Mesa'
  const mesa = marcadorEnVivo.value?.mesa || p?.mesa || 'Mesa 1'
  const marcador = `${setsGanadosJ1.value} - ${setsGanadosJ2.value}`

  detenerYGuardarTransmision(
    videoElementRef.value,
    {
      titulo: `Transmisión: ${j1Nombre} vs ${j2Nombre} (${mesa})`,
      descripcion: `Transmisión en vivo completa finalizada en ${torneo}. Marcador: ${marcador}.`,
      torneoId: p?.torneoId,
      torneoNombre: torneo,
      partidoId: p?.id,
      mesa: mesa,
      jugador1: { id: p?.jugador1Id || 'j1', nombre: j1Nombre },
      jugador2: { id: p?.jugador2Id || 'j2', nombre: j2Nombre },
      marcadorMomento: marcador,
      creadorNombre: 'Transmisión Oficial',
      creadorId: 'transmision_auto',
      tipo: 'transmision_completa',
    },
    rotacionCamara.value,
  ).catch((err) => {
    console.warn('[ModalCamaraTransmision] Error al registrar transmisión completada:', err)
  })

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
  finalizandoPorFinDePartido.value = false
  verificarOrientacion()
  solicitarWakeLock()
  solicitarOrientacionHorizontal()
  nextTick(() => {
    acoplarVideoLocal()
    verificarSoporteTorch()
    setTimeout(acoplarVideoLocal, 150)
  })
}

const close = () => {
  visible.value = false
  if (timerCuentaFin) {
    clearInterval(timerCuentaFin)
    timerCuentaFin = null
  }
  finalizandoPorFinDePartido.value = false
  liberarWakeLock()
  if (esPantallaCompleta.value) {
    alternarPantallaCompleta().catch(() => {})
  }
}

onMounted(() => {
  verificarOrientacion()
  window.addEventListener('resize', verificarOrientacion)
  window.addEventListener('orientationchange', verificarOrientacion)
  if (screen?.orientation?.addEventListener) {
    screen.orientation.addEventListener('change', verificarOrientacion)
  }
  if (visible.value) {
    acoplarVideoLocal()
    verificarSoporteTorch()
    solicitarWakeLock()
    solicitarOrientacionHorizontal()
  }
  document.addEventListener('visibilitychange', handleVisibilityChangeWakeLock)
  document.addEventListener('fullscreenchange', handleFullscreenChange)
  document.addEventListener('webkitfullscreenchange', handleFullscreenChange)
})

onUnmounted(() => {
  liberarWakeLock()
  if (timerCuentaFin) {
    clearInterval(timerCuentaFin)
    timerCuentaFin = null
  }
  window.removeEventListener('resize', verificarOrientacion)
  window.removeEventListener('orientationchange', verificarOrientacion)
  if (screen?.orientation?.removeEventListener) {
    screen.orientation.removeEventListener('change', verificarOrientacion)
  }
  document.removeEventListener('visibilitychange', handleVisibilityChangeWakeLock)
  document.removeEventListener('fullscreenchange', handleFullscreenChange)
  document.removeEventListener('webkitfullscreenchange', handleFullscreenChange)
})

defineExpose({
  open,
  close,
})
</script>

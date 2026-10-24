<template>
  <Teleport to="body">
    <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0"
      enter-to-class="opacity-100" leave-active-class="transition duration-150 ease-in" leave-from-class="opacity-100"
      leave-to-class="opacity-0">
      <div v-if="visible && (matchActual || match)"
        class="fixed inset-0 z-[9999] flex items-center justify-center p-1.5 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <!-- CONTENEDOR PRINCIPAL ESTILO TABLET / MESA DE PING PONG -->
        <div
          class="w-full max-w-5xl my-auto bg-[#0096c7] p-2 sm:p-3.5 rounded-2xl sm:rounded-[36px] shadow-[0_0_50px_rgba(0,150,199,0.3)] border-2 sm:border-6 border-[#0077b6] flex flex-col gap-1.5 sm:gap-2 relative animate-in zoom-in-95 duration-200 select-none overflow-hidden max-h-[98dvh]">

          <!-- BARRA SUPERIOR DE INFORMACIÓN -->
          <div class="flex flex-wrap items-center justify-between px-3 py-1 text-white font-heading gap-2">
            <div class="flex items-center gap-2 flex-wrap">
              <span class="w-2.5 h-2.5 rounded-full" :class="partidoTerminado ? 'bg-amber-400 animate-bounce' : 'bg-emerald-400 animate-pulse'"></span>
              <span v-if="partidoTerminado" class="text-xs sm:text-sm font-black tracking-wide uppercase text-amber-300 flex items-center gap-1.5 animate-pulse">
                <Trophy class="w-4 h-4 text-amber-400 shrink-0" />
                <span>Partido Definido • Victoria {{ setsGanadosJ1 }} - {{ setsGanadosJ2 }}</span>
              </span>
              <span v-else class="text-xs sm:text-sm font-black tracking-wide uppercase">
                Marcador Virtual Oficial • Set {{ numeroSetActual }} (Mejor de 3)
              </span>

              <!-- RECORDATORIO DE BOLA GANADA -->
              <div v-if="ganadorBola"
                class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-black/50 border border-emerald-400/60 text-[10px] sm:text-[11px] font-bold text-emerald-300 shadow-xs">
                <span>🏓 Bola: <strong class="text-white">{{ ganadorBola.nombre }}</strong></span>
                <button type="button" @click="mostrarDisputaBola = true"
                  class="text-[10px] text-sky-300 hover:text-white transition-colors cursor-pointer ml-0.5"
                  title="Modificar quién ganó la bola">
                  ✏️
                </button>
              </div>
              <button v-else type="button" @click="mostrarDisputaBola = true"
                class="flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/30 border border-amber-400 text-[10px] sm:text-[11px] font-black text-amber-200 hover:bg-amber-500/50 transition-all cursor-pointer animate-pulse shadow-xs">
                <span>🏓 Disputa de Bola</span>
              </button>
            </div>

            <!-- ALERTA DE DEUCE SI AMBOS ESTÁN EN 10+ -->
            <div v-if="esDeuce"
              class="flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-500/30 border border-amber-400 text-amber-200 text-[10px] sm:text-xs font-black animate-pulse shadow-md">
              <Flame class="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>DEUCE (10-10) • 1 Saque por Jugador • Diferencia +2</span>
            </div>

            <div class="flex items-center gap-2">
              <!-- Estado y Código de Cámara de Mesa (Trípode) -->
              <button
                type="button"
                class="flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-black shadow-md transition-all cursor-pointer border select-none"
                :class="camaraTransmitiendo ? 'bg-rose-950/80 hover:bg-rose-900 border-rose-500/60 text-rose-200' : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-200'"
                title="Toca para ver el código de vinculación para el celular en trípode"
                @click="mostrarModalCodigoCamara = true"
              >
                <Radio class="w-3.5 h-3.5" :class="camaraTransmitiendo ? 'text-rose-400 animate-pulse' : 'text-slate-400'" />
                <span v-if="camaraTransmitiendo" class="flex items-center gap-1">
                  🔴 En Vivo • Trípode
                </span>
                <span v-else class="flex items-center gap-1">
                  📹 Trípode: <span class="font-mono text-amber-300 font-black ml-0.5 tracking-wider">{{ codigoCamaraActual }}</span>
                </span>
              </button>

              <button
                v-if="partidoTerminado"
                type="button"
                class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-linear-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white font-black text-xs shadow-lg cursor-pointer animate-pulse transition-all active:scale-95"
                title="Finalizar y registrar resultado"
                @click="abrirModalFinPartido"
              >
                <Trophy class="w-3.5 h-3.5 text-amber-300 shrink-0" />
                <span>Finalizar Partido</span>
              </button>
              <span v-else class="text-[11px] font-bold bg-black/30 px-2.5 py-0.5 rounded-full text-sky-100 hidden sm:inline">
                Primero en ganar 2 sets gana el partido
              </span>
              <button type="button"
                class="w-7 h-7 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors cursor-pointer"
                title="Cerrar marcador" @click="handleCerrarConConfirmacion">
                <X class="w-4 h-4" />
              </button>
            </div>
          </div>

          <!-- MESA / CUADRÍCULA DE 3 COLUMNAS RESPONSIVE -->
          <div
            class="grid grid-cols-[1fr_95px_1fr] xs:grid-cols-[1fr_115px_1fr] sm:grid-cols-[1fr_170px_1fr] md:grid-cols-[1fr_210px_1fr] gap-1.5 sm:gap-3 items-stretch min-h-80 sm:min-h-110">

            <!-- LADO A DE LA MESA -->
            <div
              class="bg-black rounded-xl sm:rounded-3xl border p-2 sm:p-4 md:p-5 flex flex-col justify-between items-center relative overflow-hidden shadow-2xl transition-all"
              :class="ladoAEstaSacando ? 'border-emerald-400/80 ring-2 ring-emerald-400/40 shadow-[0_0_30px_rgba(52,211,153,0.25)]' : 'border-white/10'">

              <!-- CABECERA JUGADOR LADO A -->
              <div
                class="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 border-b border-white/10 pb-1.5 sm:pb-2">
                <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <div
                    class="w-7 h-7 sm:w-9 sm:h-9 rounded-full text-white font-black text-[11px] sm:text-sm flex items-center justify-center shrink-0 border border-white/30"
                    :class="ladoA.esJugador1 ? 'bg-emerald-600' : 'bg-sky-600'">
                    {{ ladoA.jugador.iniciales }}
                  </div>
                  <div class="min-w-0">
                    <p
                      class="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-wider leading-none">
                      {{ ladoA.esJugador1 ? 'J1' : 'J2' }}
                    </p>
                    <h3
                      class="text-xs sm:text-sm font-black text-white truncate max-w-17.5 xs:max-w-[85px] sm:max-w-32.5"
                      :title="ladoA.jugador.nombre">
                      {{ ladoA.jugador.nombre }}
                    </h3>
                  </div>
                </div>

                <!-- BOTÓN EASTER EGG: CONTADOR DE MALLAS LADO IZQUIERDO -->
                <button type="button"
                  class="w-full sm:w-auto px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400/40 text-amber-300 text-[9px] sm:text-xs font-black flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
                  title="Registrar toque de malla (Easter Egg)" @click="registrarMalla(ladoA.esJugador1 ? 1 : 2)">
                  <Flame class="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
                  <span class="truncate">Malla: {{ ladoA.esJugador1 ? mallasJ1 : mallasJ2 }}</span>
                </button>
              </div>

              <!-- INDICADOR DINÁMICO DE SAQUE LADO A -->
              <div class="w-full pt-1 flex items-center justify-center sm:justify-start">
                <div v-if="ladoAEstaSacando"
                  class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] sm:text-xs font-black animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.3)]">
                  <span>SAQUE</span>
                  <span class="text-[9px] sm:text-[10px] font-mono opacity-90">
                    {{ esDeuce ? '(1 de 1)' : `(${numeroSaqueTurno} de 2)` }}
                  </span>
                  <!-- Indicadores de puntos de saque -->
                  <span v-if="!esDeuce" class="flex items-center gap-1 ml-0.5">
                    <span class="w-1.5 h-1.5 rounded-full transition-all"
                      :class="numeroSaqueTurno >= 1 ? 'bg-emerald-400 shadow-[0_0_4px_#34d399]' : 'bg-white/20'"></span>
                    <span class="w-1.5 h-1.5 rounded-full transition-all"
                      :class="numeroSaqueTurno >= 2 ? 'bg-emerald-400 shadow-[0_0_4px_#34d399]' : 'bg-white/20'"></span>
                  </span>
                </div>
                <div v-else
                  class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[9px] sm:text-[10px] font-semibold">
                  <span>Al Resto</span>
                </div>
              </div>

              <!-- NÚMERO DE PUNTOS GRANDE CLICABLE -->
              <div class="flex-1 flex items-center justify-center select-none py-1 sm:py-2 transition-all"
                :class="puedeSumarPunto(ladoA.esJugador1 ? 1 : 2) ? 'cursor-pointer active:scale-95' : 'cursor-not-allowed opacity-80'"
                :title="puedeSumarPunto(ladoA.esJugador1 ? 1 : 2) ? 'Toca para sumar punto' : 'Set definido • Diferencia de 2 puntos alcanzada'"
                @click="sumarPunto(ladoA.esJugador1 ? 1 : 2)">
                <span
                  class="text-5xl xs:text-6xl sm:text-8xl md:text-9xl font-black font-mono tracking-tighter text-white drop-shadow-[0_8px_24px_rgba(255,255,255,0.15)] leading-none transition-transform select-none">
                  {{ ladoA.esJugador1 ? puntosJ1 : puntosJ2 }}
                </span>
              </div>

              <!-- BOTONES RESTAR Y SUMAR PUNTOS -->
              <div class="w-full flex items-center justify-between px-0.5 sm:px-3 pt-1">
                <button type="button" :disabled="(ladoA.esJugador1 ? puntosJ1 : puntosJ2) <= 0"
                  class="w-8 h-8 xs:w-9 xs:h-9 sm:w-12 sm:h-12 rounded-full border border-white/40 hover:border-white text-white flex items-center justify-center text-lg sm:text-2xl font-black hover:bg-white/10 active:scale-90 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                  title="Restar 1 punto" @click.stop="restarPunto(ladoA.esJugador1 ? 1 : 2)">
                  <Minus class="w-4 h-4 sm:w-6 sm:h-6" />
                </button>

                <span
                  class="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden sm:inline">Puntos</span>

                <button type="button" :disabled="!puedeSumarPunto(ladoA.esJugador1 ? 1 : 2)"
                  class="w-8 h-8 xs:w-9 xs:h-9 sm:w-12 sm:h-12 rounded-full border border-white/40 hover:border-white text-white flex items-center justify-center text-lg sm:text-2xl font-black hover:bg-white/10 active:scale-90 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                  :title="puedeSumarPunto(ladoA.esJugador1 ? 1 : 2) ? 'Sumar 1 punto' : 'Diferencia máxima de 2 alcanzada'"
                  @click.stop="sumarPunto(ladoA.esJugador1 ? 1 : 2)">
                  <Plus class="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>


            <!-- COLUMNA CENTRAL (MARCADOR DE SETS Y CONTROLES) -->
            <div class="flex flex-col justify-between gap-1.5 sm:gap-2">

              <!-- MARCADOR DE SETS GANADOS -->
              <div class="grid grid-cols-2 gap-1 sm:gap-2 flex-1 max-h-27.5 sm:max-h-40">
                <div
                  class="bg-black rounded-lg sm:rounded-2xl border border-white/10 p-1 sm:p-2.5 flex flex-col items-center justify-between">
                  <span
                    class="text-[8px] sm:text-[10px] text-slate-400 font-black uppercase tracking-wider text-center truncate w-full">
                    {{ ladoA.jugador.iniciales }}
                  </span>
                  <span class="text-2xl sm:text-5xl font-black font-mono text-white leading-none my-0.5 sm:my-1">
                    {{ ladoA.esJugador1 ? setsGanadosJ1 : setsGanadosJ2 }}
                  </span>
                  <div class="flex items-center gap-0.5 sm:gap-1">
                    <span v-for="s in 2" :key="s" :class="[
                      'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all',
                      (ladoA.esJugador1 ? setsGanadosJ1 : setsGanadosJ2) >= s ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-white/20'
                    ]" />
                  </div>
                </div>

                <div
                  class="bg-black rounded-lg sm:rounded-2xl border border-white/10 p-1 sm:p-2.5 flex flex-col items-center justify-between">
                  <span
                    class="text-[8px] sm:text-[10px] text-slate-400 font-black uppercase tracking-wider text-center truncate w-full">
                    {{ ladoB.jugador.iniciales }}
                  </span>
                  <span class="text-2xl sm:text-5xl font-black font-mono text-white leading-none my-0.5 sm:my-1">
                    {{ ladoB.esJugador1 ? setsGanadosJ1 : setsGanadosJ2 }}
                  </span>
                  <div class="flex items-center gap-0.5 sm:gap-1">
                    <span v-for="s in 2" :key="s" :class="[
                      'w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full transition-all',
                      (ladoB.esJugador1 ? setsGanadosJ1 : setsGanadosJ2) >= s ? 'bg-emerald-400 shadow-[0_0_6px_#34d399]' : 'bg-white/20'
                    ]" />
                  </div>
                </div>
              </div>

              <!-- BOTÓN ALTERNAR SAQUE MANUAL (CORREGIR SAQUE) -->
              <button type="button"
                class="w-full py-1.5 sm:py-2.5 bg-black hover:bg-slate-900 active:scale-95 border border-emerald-500/40 rounded-lg sm:rounded-2xl text-emerald-300 flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md group"
                title="Corregir o alternar turno de saque manualmente" @click="alternarSaqueManual">
                <RotateCcw class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-400 group-hover:-rotate-90 transition-transform" />
                <span class="text-[8px] sm:text-[10px] font-black uppercase tracking-wider hidden xs:inline">Cambiar Saque</span>
              </button>

              <!-- BOTÓN CAMBIAR DE LADO EN LA MESA -->
              <button type="button"
                class="w-full py-1.5 sm:py-2 bg-black hover:bg-slate-900 active:scale-95 border border-white/15 rounded-lg sm:rounded-2xl text-white flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md group"
                title="Cambiar de lado en la mesa" @click="invertirLados">
                <ArrowLeftRight
                  class="w-3.5 h-3.5 sm:w-4 sm:h-4 text-sky-400 group-hover:rotate-180 transition-transform duration-300" />
                <span class="text-[8px] sm:text-[10px] font-black uppercase tracking-wider hidden xs:inline">Lados</span>
              </button>

              <!-- BOTÓN DECLARAR VICTORIA POR W (W.O. / ABANDONO) - EXCLUSIVO ADMIN -->
              <button
                v-if="authStore.esAdmin"
                type="button"
                class="w-full py-1.5 sm:py-2 bg-black hover:bg-amber-950/40 active:scale-95 border border-amber-500/40 rounded-lg sm:rounded-2xl text-amber-300 flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md"
                title="Declarar victoria por W (Walkover / Inasistencia / Retiro)"
                @click="abrirModalWO"
              >
                <Gavel class="w-3.5 h-3.5 text-amber-400" />
                <span class="text-[8px] sm:text-[10px] font-black uppercase tracking-wider hidden xs:inline">Declarar W</span>
              </button>

              <!-- BOTÓN REINICIAR PUNTOS A 0-0 -->
              <button type="button"
                class="w-full py-1 sm:py-1.5 bg-black hover:bg-slate-900 active:scale-95 border border-white/15 rounded-lg sm:rounded-2xl text-slate-400 hover:text-white flex items-center justify-center gap-1 transition-all cursor-pointer shadow-md"
                title="Reiniciar puntos del set actual a 0 - 0" @click="reiniciarSetActual">
                <RotateCcw class="w-3 h-3 text-slate-400" />
                <span class="text-[8px] sm:text-[9px] font-bold uppercase tracking-wider hidden xs:inline">Reset 0-0</span>
              </button>

              <!-- BOTÓN TERMINAR PARTIDO (CUANDO YA ALGUIEN ALCANZÓ 2 SETS) -->
              <button
                v-if="partidoTerminado"
                type="button"
                class="w-full py-2.5 sm:py-3.5 bg-linear-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 border-2 border-white text-white rounded-lg sm:rounded-2xl font-black flex flex-col items-center justify-center gap-1 transition-all shadow-[0_0_25px_rgba(52,211,153,0.7)] cursor-pointer active:scale-95 animate-pulse"
                title="Partido definido al mejor de 3 sets. Toca para registrar la victoria."
                @click="abrirModalFinPartido"
              >
                <Trophy class="w-5 h-5 sm:w-6 sm:h-6 text-amber-300 shrink-0" />
                <span class="text-[9px] sm:text-xs md:text-sm font-black uppercase tracking-wider text-center leading-none">
                  Finalizar Partido
                </span>
                <span class="text-[8px] sm:text-[10px] font-bold text-emerald-100 truncate w-full px-1 text-center">
                  Gana {{ ganadorPartido?.nombre.split(' ')[0] }} ({{ setsGanadosJ1 }}-{{ setsGanadosJ2 }})
                </span>
              </button>

              <!-- BOTÓN TERMINAR SET (MIENTRAS EL PARTIDO ESTÉ EN JUEGO) -->
              <button
                v-else
                type="button"
                :disabled="!puedeFinalizarSet"
                :class="[
                  'w-full py-2 sm:py-3.5 border rounded-lg sm:rounded-2xl font-black flex flex-col items-center justify-center gap-0.5 transition-all shadow-xl',
                  puedeFinalizarSet
                    ? 'bg-emerald-600 hover:bg-emerald-500 border-2 border-white text-white cursor-pointer active:scale-95 animate-pulse'
                    : 'bg-slate-900 border-white/10 text-slate-500 cursor-not-allowed opacity-50'
                ]"
                :title="puedeFinalizarSet ? 'Finalizar set y sumar al marcador' : textoEstadoSet"
                @click="handleTerminarSet"
              >
                <CheckCircle2 class="w-4 h-4 sm:w-5 sm:h-5 shrink-0"
                  :class="puedeFinalizarSet ? 'text-white' : 'text-slate-500'" />
                <span
                  class="text-[8px] sm:text-xs md:text-sm font-black uppercase tracking-wider text-center leading-none">
                  {{ puedeFinalizarSet ? 'Terminar Set' : 'Fin Set' }}
                </span>
                <span class="text-[7px] sm:text-[9px] font-normal leading-tight text-center truncate w-full px-1"
                  :class="puedeFinalizarSet ? 'text-emerald-100' : 'text-slate-500'">
                  {{ textoEstadoSet }}
                </span>
              </button>
            </div>


            <!-- LADO B DE LA MESA -->
            <div
              class="bg-black rounded-xl sm:rounded-3xl border p-2 sm:p-4 md:p-5 flex flex-col justify-between items-center relative overflow-hidden shadow-2xl transition-all"
              :class="ladoBEstaSacando ? 'border-emerald-400/80 ring-2 ring-emerald-400/40 shadow-[0_0_30px_rgba(52,211,153,0.25)]' : 'border-white/10'">

              <!-- CABECERA JUGADOR LADO B -->
              <div
                class="w-full flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-2 border-b border-white/10 pb-1.5 sm:pb-2">
                <div class="flex items-center gap-1.5 sm:gap-2 min-w-0">
                  <div
                    class="w-7 h-7 sm:w-9 sm:h-9 rounded-full text-white font-black text-[11px] sm:text-sm flex items-center justify-center shrink-0 border border-white/30"
                    :class="ladoB.esJugador1 ? 'bg-emerald-600' : 'bg-sky-600'">
                    {{ ladoB.jugador.iniciales }}
                  </div>
                  <div class="min-w-0">
                    <p
                      class="text-[9px] sm:text-[10px] text-slate-400 font-extrabold uppercase tracking-wider leading-none">
                      {{ ladoB.esJugador1 ? 'J1' : 'J2' }}
                    </p>
                    <h3
                      class="text-xs sm:text-sm font-black text-white truncate max-w-17.5 xs:max-w-[85px] sm:max-w-32.5"
                      :title="ladoB.jugador.nombre">
                      {{ ladoB.jugador.nombre }}
                    </h3>
                  </div>
                </div>

                <button type="button"
                  class="w-full sm:w-auto px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-amber-500/20 hover:bg-amber-500/40 border border-amber-400/40 text-amber-300 text-[9px] sm:text-xs font-black flex items-center justify-center gap-1 transition-all active:scale-95 cursor-pointer shrink-0"
                  title="Registrar toque de malla (Easter Egg)" @click="registrarMalla(ladoB.esJugador1 ? 1 : 2)">
                  <Flame class="w-3 h-3 text-amber-400 animate-pulse shrink-0" />
                  <span class="truncate">Malla: {{ ladoB.esJugador1 ? mallasJ1 : mallasJ2 }}</span>
                </button>
              </div>

              <!-- INDICADOR DINÁMICO DE SAQUE LADO B -->
              <div class="w-full pt-1 flex items-center justify-center sm:justify-start">
                <div v-if="ladoBEstaSacando"
                  class="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-400 text-emerald-300 text-[10px] sm:text-xs font-black animate-pulse shadow-[0_0_12px_rgba(52,211,153,0.3)]">
                  <span>SAQUE</span>
                  <span class="text-[9px] sm:text-[10px] font-mono opacity-90">
                    {{ esDeuce ? '(1 de 1)' : `(${numeroSaqueTurno} de 2)` }}
                  </span>
                  <!-- Indicadores de puntos de saque -->
                  <span v-if="!esDeuce" class="flex items-center gap-1 ml-0.5">
                    <span class="w-1.5 h-1.5 rounded-full transition-all"
                      :class="numeroSaqueTurno >= 1 ? 'bg-emerald-400 shadow-[0_0_4px_#34d399]' : 'bg-white/20'"></span>
                    <span class="w-1.5 h-1.5 rounded-full transition-all"
                      :class="numeroSaqueTurno >= 2 ? 'bg-emerald-400 shadow-[0_0_4px_#34d399]' : 'bg-white/20'"></span>
                  </span>
                </div>
                <div v-else
                  class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-slate-400 text-[9px] sm:text-[10px] font-semibold">
                  <span>Al Resto</span>
                </div>
              </div>

              <!-- NÚMERO DE PUNTOS GRANDE CLICABLE -->
              <div class="flex-1 flex items-center justify-center select-none py-1 sm:py-2 transition-all"
                :class="puedeSumarPunto(ladoB.esJugador1 ? 1 : 2) ? 'cursor-pointer active:scale-95' : 'cursor-not-allowed opacity-80'"
                :title="puedeSumarPunto(ladoB.esJugador1 ? 1 : 2) ? 'Toca para sumar punto' : 'Set definido • Diferencia de 2 puntos alcanzada'"
                @click="sumarPunto(ladoB.esJugador1 ? 1 : 2)">
                <span
                  class="text-5xl xs:text-6xl sm:text-8xl md:text-9xl font-black font-mono tracking-tighter text-white drop-shadow-[0_8px_24px_rgba(255,255,255,0.15)] leading-none transition-transform select-none">
                  {{ ladoB.esJugador1 ? puntosJ1 : puntosJ2 }}
                </span>
              </div>

              <!-- BOTONES RESTAR Y SUMAR PUNTOS -->
              <div class="w-full flex items-center justify-between px-0.5 sm:px-3 pt-1">
                <button type="button" :disabled="(ladoB.esJugador1 ? puntosJ1 : puntosJ2) <= 0"
                  class="w-8 h-8 xs:w-9 xs:h-9 sm:w-12 sm:h-12 rounded-full border border-white/40 hover:border-white text-white flex items-center justify-center text-lg sm:text-2xl font-black hover:bg-white/10 active:scale-90 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                  title="Restar 1 punto" @click.stop="restarPunto(ladoB.esJugador1 ? 1 : 2)">
                  <Minus class="w-4 h-4 sm:w-6 sm:h-6" />
                </button>

                <span
                  class="text-[9px] sm:text-[10px] text-slate-500 font-bold uppercase tracking-widest hidden sm:inline">Puntos</span>

                <button type="button" :disabled="!puedeSumarPunto(ladoB.esJugador1 ? 1 : 2)"
                  class="w-8 h-8 xs:w-9 xs:h-9 sm:w-12 sm:h-12 rounded-full border border-white/40 hover:border-white text-white flex items-center justify-center text-lg sm:text-2xl font-black hover:bg-white/10 active:scale-90 disabled:opacity-20 disabled:pointer-events-none transition-all cursor-pointer"
                  :title="puedeSumarPunto(ladoB.esJugador1 ? 1 : 2) ? 'Sumar 1 punto' : 'Diferencia máxima de 2 alcanzada'"
                  @click.stop="sumarPunto(ladoB.esJugador1 ? 1 : 2)">
                  <Plus class="w-4 h-4 sm:w-6 sm:h-6" />
                </button>
              </div>
            </div>

          </div>

          <!-- HISTORIAL DE SETS ANTERIORES -->
          <div v-if="historialSets.length > 0" class="flex flex-wrap items-center justify-center gap-2 py-1.5 px-2 bg-black/40 rounded-2xl border border-white/10 mx-auto max-w-xl">
            <span class="text-[10px] sm:text-[11px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1">
              <CheckCircle2 class="w-3.5 h-3.5" />
              Sets registrados:
            </span>
            <div
              v-for="(s, idx) in historialSets"
              :key="idx"
              class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-white/20 font-mono text-xs text-white shadow-md"
            >
              <span class="font-extrabold text-amber-300">Set {{ s.setNumero }}:</span>
              <span class="font-black text-white">{{ s.puntosJugador1 }}</span>
              <span class="text-slate-400">-</span>
              <span class="font-black text-white">{{ s.puntosJugador2 }}</span>
              <span
                class="text-[9px] font-black uppercase px-1.5 py-0.2 rounded"
                :class="s.ganadorId === matchActual?.jugador1.id ? 'bg-emerald-500/30 text-emerald-300' : 'bg-sky-500/30 text-sky-300'"
              >
                Gana {{ s.ganadorId === matchActual?.jugador1.id ? (matchActual?.jugador1.nombre.split(' ')[0] || 'J1') : (matchActual?.jugador2.nombre.split(' ')[0] || 'J2') }}
              </span>
            </div>
          </div>

          <!-- BANNER DE ALERTA EASTER EGG DE MALLAS -->
          <Transition enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95">
            <div v-if="easterEggMensaje"
              class="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 px-5 py-2.5 rounded-2xl bg-linear-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-2xl flex items-center gap-2 border-2 border-white pointer-events-none animate-bounce">
              <Sparkles class="w-5 h-5 shrink-0" />
              <span>{{ easterEggMensaje }}</span>
            </div>
          </Transition>

          <!-- BANNER DE ADVERTENCIA REGLAMENTARIA -->
          <Transition enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-2 scale-95" enter-to-class="opacity-100 translate-y-0 scale-100"
            leave-active-class="transition duration-200 ease-in" leave-from-class="opacity-100 scale-100"
            leave-to-class="opacity-0 scale-95">
            <div v-if="mensajeAlertaSet"
              class="absolute top-12 sm:top-14 left-1/2 -translate-x-1/2 z-30 px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-slate-900/95 text-amber-300 font-bold text-xs sm:text-sm shadow-2xl flex items-center gap-2 border border-amber-400/50 backdrop-blur-md pointer-events-none">
              <AlertTriangle class="w-4 h-4 sm:w-5 sm:h-5 text-amber-400 shrink-0" />
              <span>{{ mensajeAlertaSet }}</span>
            </div>
          </Transition>

          <!-- OVERLAY DE DISPUTA DE BOLA (ELECCIÓN DE SAQUE) -->
          <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
            <div v-if="mostrarDisputaBola && (matchActual || match)"
              class="absolute inset-0 z-40 bg-black/92 backdrop-blur-md rounded-2xl sm:rounded-[36px] p-3 sm:p-6 flex flex-col items-center justify-center text-center overflow-y-auto overscroll-contain">
              <div class="max-w-md w-full my-auto space-y-3 sm:space-y-4 relative py-2">
                <!-- Botón de cierre superior para móvil / escritorio -->
                <button type="button"
                  class="absolute -top-1 -right-1 sm:top-0 sm:right-0 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Cerrar ventana" @click="mostrarDisputaBola = false">
                  <X class="w-4 h-4" />
                </button>

                <div
                  class="inline-flex items-center justify-center w-11 h-11 sm:w-14 sm:h-14 rounded-2xl bg-amber-500/20 border border-amber-400 text-2xl sm:text-3xl shadow-lg mx-auto">
                  🏓
                </div>
                <div>
                  <span class="text-[10px] sm:text-[11px] font-black uppercase tracking-widest text-amber-400 block">Punto Reglamentario Preliminar</span>
                  <h3 class="text-lg sm:text-2xl font-black text-white font-heading mt-0.5 leading-snug">Disputa de Bola (Elección de Saque)</h3>
                  <p class="text-[11px] sm:text-xs text-sky-100/80 mt-1 leading-relaxed px-2">
                    Jueguen el punto de bola previo. Selecciona al jugador que lo ganó para registrarlo y asignarle el primer saque del partido:
                  </p>
                </div>

                <!-- Tarjetas para elegir al ganador de la bola (adaptables horizontal en móvil, vertical en desktop) -->
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 pt-1 sm:pt-2">
                  <button type="button"
                    class="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-emerald-600/30 hover:bg-emerald-600/50 border-2 border-emerald-400 active:scale-95 transition-all text-white flex flex-row sm:flex-col items-center gap-3 sm:gap-2 cursor-pointer shadow-lg group text-left sm:text-center"
                    @click="seleccionarGanadorBola(1)">
                    <div
                      class="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-emerald-600 text-white font-black text-xs sm:text-sm flex items-center justify-center border-2 border-white shadow-md group-hover:scale-105 transition-transform">
                      {{ (matchActual || match)?.jugador1.iniciales }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-xs sm:text-sm font-black truncate">{{ (matchActual || match)?.jugador1.nombre }}</p>
                      <span
                        class="text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-400/25 text-emerald-300 mt-0.5 sm:mt-1 inline-block border border-emerald-400/40">
                        Ganó Bola • Saca 1°
                      </span>
                    </div>
                  </button>

                  <button type="button"
                    class="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-sky-600/30 hover:bg-sky-600/50 border-2 border-sky-400 active:scale-95 transition-all text-white flex flex-row sm:flex-col items-center gap-3 sm:gap-2 cursor-pointer shadow-lg group text-left sm:text-center"
                    @click="seleccionarGanadorBola(2)">
                    <div
                      class="w-10 h-10 sm:w-12 sm:h-12 shrink-0 rounded-full bg-sky-600 text-white font-black text-xs sm:text-sm flex items-center justify-center border-2 border-white shadow-md group-hover:scale-105 transition-transform">
                      {{ (matchActual || match)?.jugador2.iniciales }}
                    </div>
                    <div class="min-w-0 flex-1">
                      <p class="text-xs sm:text-sm font-black truncate">{{ (matchActual || match)?.jugador2.nombre }}</p>
                      <span
                        class="text-[9px] sm:text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-sky-400/25 text-sky-300 mt-0.5 sm:mt-1 inline-block border border-sky-400/40">
                        Ganó Bola • Saca 1°
                      </span>
                    </div>
                  </button>
                </div>

                <div class="pt-1">
                  <button v-if="ganadorBola" type="button"
                    class="text-[11px] sm:text-xs font-bold text-slate-400 hover:text-white transition-colors cursor-pointer py-1"
                    @click="mostrarDisputaBola = false">
                    Continuar sin cambiar (Actual: {{ ganadorBola.nombre }})
                  </button>
                  <button v-else type="button"
                    class="text-[11px] sm:text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer py-1 underline underline-offset-4"
                    @click="mostrarDisputaBola = false">
                    Omitir por ahora (asignar saque en la mesa)
                  </button>
                </div>
              </div>
            </div>
          </Transition>

          <!-- OVERLAY DIRECTO EN MESA DE PARTIDO FINALIZADO (VISIBLE AL 100%, SIN CONFLICTO DE Z-INDEX) -->
          <Transition enter-active-class="transition duration-200 ease-out" enter-from-class="opacity-0 scale-95"
            enter-to-class="opacity-100 scale-100" leave-active-class="transition duration-150 ease-in"
            leave-from-class="opacity-100 scale-100" leave-to-class="opacity-0 scale-95">
            <div v-if="mostrarModalFinPartido && (matchActual || match) && ganadorPartido"
              class="absolute inset-0 z-50 bg-black/95 backdrop-blur-md rounded-2xl sm:rounded-[36px] p-4 sm:p-6 flex flex-col items-center justify-center text-center overflow-y-auto overscroll-contain">
              <div class="max-w-md w-full my-auto space-y-3 sm:space-y-4 relative py-2">
                <div class="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-linear-to-tr from-amber-400 to-emerald-400 text-slate-950 flex items-center justify-center mx-auto shadow-[0_0_35px_rgba(52,211,153,0.5)]">
                  <Trophy class="w-9 h-9 sm:w-11 sm:h-11 text-slate-950" />
                </div>
                <div>
                  <span class="text-[10px] sm:text-xs font-black uppercase tracking-widest text-emerald-400 block">
                    ¡Partido Concluido al Mejor de 3 Sets!
                  </span>
                  <h2 class="text-xl sm:text-3xl font-black text-white font-heading mt-1 leading-tight">
                    {{ ganadorPartido.nombre }}
                  </h2>
                  <p class="text-xs sm:text-sm text-emerald-300 font-black mt-0.5">
                    Victoria oficial {{ setsGanadosJ1 }} - {{ setsGanadosJ2 }}
                  </p>
                </div>

                <!-- Resumen de Sets -->
                <div class="bg-white/10 rounded-2xl p-3 border border-white/15 space-y-2">
                  <span class="text-[10px] uppercase tracking-wider text-slate-300 font-bold block">Sets disputados</span>
                  <div class="flex flex-wrap items-center justify-center gap-2">
                    <span
                      v-for="(s, idx) in historialSets"
                      :key="idx"
                      class="px-3 py-1 rounded-xl bg-black/70 border border-emerald-400/40 font-mono font-bold text-xs text-white"
                    >
                      Set {{ s.setNumero }}: <strong class="text-emerald-300">{{ s.puntosJugador1 }} - {{ s.puntosJugador2 }}</strong>
                    </span>
                  </div>
                </div>

                <!-- Botón de Confirmación y Registro -->
                <div class="space-y-2 pt-2">
                  <button
                    type="button"
                    class="w-full py-3.5 sm:py-4 px-4 rounded-2xl bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-98 text-white font-black text-sm sm:text-base transition-all shadow-xl shadow-emerald-950/60 cursor-pointer flex items-center justify-center gap-2"
                    @click="confirmarRegistroFinal"
                  >
                    <CheckCircle2 class="w-5 h-5 text-white" />
                    <span>Registrar Resultado Oficial y Guardar</span>
                  </button>
                  <button
                    type="button"
                    class="text-xs text-slate-400 hover:text-white transition-colors cursor-pointer py-1"
                    @click="mostrarModalFinPartido = false"
                  >
                    Revisar mesa de juego
                  </button>
                </div>
              </div>
            </div>
          </Transition>

        </div>
      </div>
    </Transition>
  </Teleport>

  <!-- MODAL DE PARTIDO FINALIZADO (ESTILO ESTÁNDAR LIMPIO DEL SISTEMA) -->
  <Modal
    ref="modalFinPartidoRef"
    title="Resultado del Partido"
    sub-title="Partido oficial concluido al mejor de tres sets"
    width="md"
    :footer="false"
    :close-on-click-modal="false"
    :show-close="false"
  >
    <div v-if="ganadorPartido" class="flex flex-col items-center text-center gap-4 py-2">
      <div class="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shadow-xs">
        <Trophy class="w-7 h-7" />
      </div>

      <div class="space-y-0.5">
        <span class="text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Ganador del Encuentro
        </span>
        <h3 class="text-xl font-black text-slate-900">
          {{ ganadorPartido.nombre }}
        </h3>
        <p v-if="ganadorBola" class="text-xs text-slate-500">
          Ganador de la bola inicial: <strong>{{ ganadorBola.nombre }}</strong>
        </p>
      </div>

      <div class="w-full bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2">
        <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          Marcador Final (Sets)
        </span>
        <span class="text-3xl font-black font-mono text-emerald-700 tracking-tight">
          {{ setsGanadosJ1 }} - {{ setsGanadosJ2 }}
        </span>

        <div class="flex flex-wrap items-center justify-center gap-1.5 pt-1">
          <span
            v-for="(s, idx) in historialSets"
            :key="idx"
            class="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono font-bold text-xs text-slate-700 dark:text-slate-300 shadow-2xs"
          >
            Set {{ s.setNumero }}: {{ s.puntosJugador1 }} - {{ s.puntosJugador2 }}
          </span>
        </div>

        <p class="text-xs text-slate-500 mt-1">
          Los datos se actualizarán automáticamente en la tabla de posiciones del torneo.
        </p>
      </div>

      <div class="w-full pt-1">
        <Button
          variant="emerald"
          size="md"
          class="w-full justify-center font-bold gap-2"
          @click="confirmarRegistroFinal"
        >
          <CheckCircle2 class="w-4 h-4" />
          <span>Registrar en Tabla de Posiciones y Cerrar</span>
        </Button>
      </div>
    </div>
  </Modal>

  <!-- MODAL DE CONFIRMACIÓN AL SALIR SI HAY PARTIDO EN CURSO -->
  <Modal
    ref="modalConfirmarSalidaRef"
    title="¿Deseas salir del marcador virtual?"
    sub-title="Hay un partido en curso con puntos registrados"
    width="sm"
    action="Sí, salir"
    cancel="Continuar jugando"
    btn-action-variant="danger"
    @action="confirmarSalida"
  >
    <div class="space-y-3 py-1 text-xs text-slate-600 dark:text-slate-300">
      <div class="flex items-start gap-3 p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-300">
        <AlertTriangle class="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400" />
        <p class="leading-relaxed">
          Actualmente hay sets o puntos en disputa. Si sales ahora, el partido quedará pendiente y el avance temporal no se guardará en la tabla oficial.
        </p>
      </div>
    </div>
  </Modal>

  <!-- MODAL DECLARAR DERROTA POR W (WALKOVER / ABANDONO) -->
  <Modal
    ref="modalWORef"
    title="Declarar Victoria por W (Walkover)"
    sub-title="Dictaminar partido por inasistencia o retiro con sets 11-6 y 11-6"
    width="sm"
    :footer="false"
  >
    <div v-if="matchActual || match" class="space-y-4 py-1 text-xs">
      <div class="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-700 text-amber-900 dark:text-amber-200 space-y-1">
        <p class="font-extrabold flex items-center gap-1.5 text-xs text-amber-700 dark:text-amber-400">
          <Gavel class="w-4 h-4 text-amber-600" />
          Reglamento Oficial: Derrota por W
        </p>
        <p class="text-[11px] leading-relaxed text-amber-800 dark:text-amber-300">
          Conforme al reglamento, los sets se registrarán como <strong>11 - 6 y 11 - 6</strong> (2 - 0). El ganador sumará <strong>2 puntos</strong> en la tabla oficial y el perdedor por inasistencia/abandono recibirá <strong>0 puntos</strong>.
        </p>
      </div>

      <div class="space-y-2">
        <label class="block font-bold text-slate-700 dark:text-slate-300 text-xs">
          Selecciona al GANADOR por W:
        </label>
        <div class="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            :class="[
              'p-3 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5',
              ganadorWOId === (matchActual || match)?.jugador1.id
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            ]"
            @click="ganadorWOId = (matchActual || match)?.jugador1.id || ''"
          >
            <span class="w-8 h-8 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
              {{ (matchActual || match)?.jugador1.iniciales }}
            </span>
            <span class="text-xs truncate max-w-full font-bold">{{ (matchActual || match)?.jugador1.nombre }}</span>
            <span class="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-600 text-white mt-0.5">
              Gana por W
            </span>
          </button>

          <button
            type="button"
            :class="[
              'p-3 rounded-xl border text-center font-bold transition-all cursor-pointer flex flex-col items-center gap-1.5',
              ganadorWOId === (matchActual || match)?.jugador2.id
                ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200'
            ]"
            @click="ganadorWOId = (matchActual || match)?.jugador2.id || ''"
          >
            <span class="w-8 h-8 rounded-full bg-sky-700 text-white font-black text-xs flex items-center justify-center">
              {{ (matchActual || match)?.jugador2.iniciales }}
            </span>
            <span class="text-xs truncate max-w-full font-bold">{{ (matchActual || match)?.jugador2.nombre }}</span>
            <span class="text-[9px] uppercase font-black px-1.5 py-0.5 rounded bg-emerald-600 text-white mt-0.5">
              Gana por W
            </span>
          </button>
        </div>
      </div>

      <div class="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
        <Button variant="ghost" size="sm" @click="modalWORef?.close()">
          Cancelar
        </Button>
        <Button variant="emerald" size="sm" :disabled="!ganadorWOId" @click="confirmarVictoriaPorWO">
          Dictaminar W.O. (11-6, 11-6)
        </Button>
      </div>
    </div>
  </Modal>

  <!-- MODAL INFORMATIVO DE CÓDIGO DE CÁMARA PARA EL ÁRBITRO -->
  <Modal
    ref="modalCodigoCamaraRef"
    :model-value="mostrarModalCodigoCamara"
    title="Cámara de Mesa (Trípode)"
    sub-title="Transmite este partido desde otro celular sin interrumpir tu arbitraje"
    width="md"
    :footer="false"
    @update:model-value="mostrarModalCodigoCamara = $event"
  >
    <div class="space-y-4 py-2">
      <div class="text-center p-4 rounded-2xl bg-slate-900 text-white border border-slate-800 space-y-2">
        <p class="text-xs font-extrabold uppercase tracking-wider text-slate-400">
          Código de Vinculación para la Cámara
        </p>
        <div class="inline-flex items-center justify-center px-6 py-3 rounded-2xl bg-black border-2 border-amber-500/40 shadow-inner">
          <span class="font-mono font-black text-3xl sm:text-4xl text-amber-400 tracking-[0.3em]">
            {{ codigoCamaraActual }}
          </span>
        </div>
        <p class="text-[11px] text-slate-400 max-w-xs mx-auto">
          Coloca el otro teléfono en el trípode apuntando a la mesa, pulsa <strong>"Transmitir"</strong> y escribe este código.
        </p>
      </div>

      <!-- Estado de la Cámara -->
      <div
        class="p-3 rounded-xl border flex items-center gap-3"
        :class="camaraTransmitiendo ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200' : 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'"
      >
        <span class="w-3 h-3 rounded-full shrink-0" :class="camaraTransmitiendo ? 'bg-emerald-500 animate-ping' : 'bg-slate-400'"></span>
        <div class="text-xs">
          <p class="font-black">
            {{ camaraTransmitiendo ? 'Cámara Conectada y Transmitiendo' : 'Esperando Conexión de Cámara' }}
          </p>
          <p class="text-[11px] opacity-80">
            {{ camaraTransmitiendo ? 'El video de la mesa está saliendo en vivo a los espectadores con tu marcador.' : 'El partido se puede jugar normalmente mientras se conecta la cámara.' }}
          </p>
        </div>
      </div>

      <div class="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
        <!-- Opción alternativa por si este mismo árbitro quisiera transmitir -->
        <button
          type="button"
          class="text-[11px] text-slate-500 dark:text-slate-400 hover:text-rose-500 underline cursor-pointer"
          @click="handleIniciarTransmisionDesdeEsteDispositivo"
        >
          Transmitir usando este mismo celular
        </button>

        <Button variant="ghost" size="sm" @click="mostrarModalCodigoCamara = false">
          Entendido
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import {
  X,
  Minus,
  Plus,
  RotateCcw,
  ArrowLeftRight,
  CheckCircle2,
  Trophy,
  Flame,
  Sparkles,
  AlertTriangle,
  Gavel,
  Radio,
} from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import type { PartidoArbitrable, SetPartido, JugadorTorneo, MarcadorEnVivo } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { actualizarPartidoDB } from '@/services/torneoDatabaseService'

const authStore = useAuthStore()

const props = defineProps<{
  match: PartidoArbitrable | null
}>()

const matchInterno = ref<PartidoArbitrable | null>(null)
const matchActual = computed(() => matchInterno.value || props.match)

// Estado de cámara de mesa (trípode)
const mostrarModalCodigoCamara = ref(false)
const modalCodigoCamaraRef = ref<InstanceType<typeof Modal> | null>(null)
const codigoCamaraActual = computed(() => matchActual.value?.partido.codigoCamara || '----')
const camaraTransmitiendo = computed(() => Boolean(matchActual.value?.partido.transmisionActiva))

watch(
  () => props.match,
  (nuevo) => {
    if (nuevo) matchInterno.value = nuevo
  },
  { immediate: true },
)

const emit = defineEmits<{
  (
    e: 'partido-finalizado',
    datos: {
      partidoId: string
      sets: SetPartido[]
      ganadorId: string
      esWalkover?: boolean
      marcador?: string
      marcadorDetallado?: string
      perdedorPorWId?: string
      ganadorBolaId?: string | null
    },
  ): void
  (
    e: 'actualizar-marcador-en-vivo',
    datos: {
      partidoId: string
      marcadorEnVivo: MarcadorEnVivo
    },
  ): void
  (e: 'iniciar-transmision-marcador', match: PartidoArbitrable): void
  (e: 'close'): void
}>()

const handleIniciarTransmision = () => {
  if (matchActual.value) {
    emit('iniciar-transmision-marcador', matchActual.value)
  }
}

const handleIniciarTransmisionDesdeEsteDispositivo = () => {
  mostrarModalCodigoCamara.value = false
  handleIniciarTransmision()
}

const visible = ref(false)

const puntosJ1 = ref(0)
const puntosJ2 = ref(0)

const ladosInvertidos = ref(false)

const mallasJ1 = ref(0)
const mallasJ2 = ref(0)
const easterEggMensaje = ref('')
let timerEasterEgg: ReturnType<typeof setTimeout> | null = null

const modalConfirmarSalidaRef = ref<InstanceType<typeof Modal> | null>(null)
const modalWORef = ref<InstanceType<typeof Modal> | null>(null)
const ganadorWOId = ref<string>('')
const mensajeAlertaSet = ref('')
let timerAlertaSet: ReturnType<typeof setTimeout> | null = null

// Disputa de Bola
const ganadorBola = ref<JugadorTorneo | null>(null)
const mostrarDisputaBola = ref(false)

// Corrección manual de saque
const saqueInvertidoManualmente = ref(false)

const historialSets = ref<SetPartido[]>([])

const setsGanadosJ1 = computed(() => {
  if (!matchActual.value) return 0
  return historialSets.value.filter((s) => s.ganadorId === matchActual.value?.jugador1.id).length
})

const setsGanadosJ2 = computed(() => {
  if (!matchActual.value) return 0
  return historialSets.value.filter((s) => s.ganadorId === matchActual.value?.jugador2.id).length
})

// Mejor de 3 sets (primer jugador que alcance 2 sets)
const partidoTerminado = computed(() => {
  return setsGanadosJ1.value >= 2 || setsGanadosJ2.value >= 2
})

const numeroSetActual = computed(() => {
  if (partidoTerminado.value) {
    return Math.max(1, Math.min(historialSets.value.length, 3))
  }
  return Math.min(historialSets.value.length + 1, 3)
})

const ganadorPartido = computed<JugadorTorneo | null>(() => {
  if (!matchActual.value) return null
  if (setsGanadosJ1.value >= 2) return matchActual.value.jugador1
  if (setsGanadosJ2.value >= 2) return matchActual.value.jugador2
  return null
})

// Mapeo dinámico de qué jugador está en qué lado de la pantalla
const ladoA = computed(() => {
  if (!matchActual.value) {
    return {
      jugador: { id: '', nombre: '', iniciales: '', telefono: '' },
      esJugador1: true,
    }
  }
  return ladosInvertidos.value
    ? { jugador: matchActual.value.jugador2, esJugador1: false }
    : { jugador: matchActual.value.jugador1, esJugador1: true }
})

const ladoB = computed(() => {
  if (!matchActual.value) {
    return {
      jugador: { id: '', nombre: '', iniciales: '', telefono: '' },
      esJugador1: false,
    }
  }
  return ladosInvertidos.value
    ? { jugador: matchActual.value.jugador1, esJugador1: true }
    : { jugador: matchActual.value.jugador2, esJugador1: false }
})

// ==========================================
// LÓGICA REGLAMENTARIA DE SAQUES Y DEUCE
// ==========================================

const totalPuntosSet = computed(() => puntosJ1.value + puntosJ2.value)

// Condición de Deuce: empate a 10 o más (10-10, 11-11, etc.)
const esDeuce = computed(() => puntosJ1.value >= 10 && puntosJ2.value >= 10)

/**
 * Servidor inicial de cada set según reglamento:
 * Set 1: Quién ganó la "Bola".
 * Set 2: El jugador opuesto al que sacó primero en el Set 1.
 * Set 3: Quien ganó la "Bola" (desempate).
 */
const servidorInicialSet = computed<1 | 2>(() => {
  if (!matchActual.value) return 1
  const ganadorBolaEsJ1 = ganadorBola.value?.id === matchActual.value.jugador1.id
  const inicialSet1: 1 | 2 = ganadorBolaEsJ1 ? 1 : 2

  if (numeroSetActual.value === 1) {
    return inicialSet1
  } else if (numeroSetActual.value === 2) {
    return inicialSet1 === 1 ? 2 : 1
  } else {
    return inicialSet1
  }
})

/**
 * Cálculo del servidor actual según los puntos transcurridos:
 * - Antes de Deuce: 2 saques por jugador consecutivamente.
 * - En Deuce (10:10+): 1 saque alternado por punto.
 */
const servidorActual = computed<1 | 2>(() => {
  const base = servidorInicialSet.value
  const opuesto: 1 | 2 = base === 1 ? 2 : 1
  let natural: 1 | 2 = base

  if (!esDeuce.value) {
    // Cada 2 puntos cambia el saque
    const ciclo = Math.floor(totalPuntosSet.value / 2)
    natural = ciclo % 2 === 0 ? base : opuesto
  } else {
    // En Deuce: a partir del punto 20, 1 saque por jugador alternado
    const puntosEnDeuce = totalPuntosSet.value - 20
    natural = puntosEnDeuce % 2 === 0 ? base : opuesto
  }

  // Si el árbitro forzó alternancia manual para corregir:
  if (saqueInvertidoManualmente.value) {
    return natural === 1 ? 2 : 1
  }

  return natural
})

/**
 * Número de saque dentro del turno (1 de 2, o 2 de 2; en Deuce siempre 1 de 1)
 */
const numeroSaqueTurno = computed<number>(() => {
  if (esDeuce.value) return 1
  return (totalPuntosSet.value % 2) + 1
})

const ladoAEstaSacando = computed<boolean>(() => {
  return ladoA.value.esJugador1 ? servidorActual.value === 1 : servidorActual.value === 2
})

const ladoBEstaSacando = computed<boolean>(() => {
  return ladoB.value.esJugador1 ? servidorActual.value === 1 : servidorActual.value === 2
})

const alternarSaqueManual = () => {
  saqueInvertidoManualmente.value = !saqueInvertidoManualmente.value
  emitirMarcadorEnVivo()
}

// ==========================================
// CONDICIÓN REGLAMENTARIA DE VICTORIA DE SET
// ==========================================

const puedeFinalizarSet = computed<boolean>(() => {
  const maxPts = Math.max(puntosJ1.value, puntosJ2.value)
  const diff = Math.abs(puntosJ1.value - puntosJ2.value)
  return maxPts >= 11 && diff >= 2
})

const textoEstadoSet = computed<string>(() => {
  const maxPts = Math.max(puntosJ1.value, puntosJ2.value)
  const minPts = Math.min(puntosJ1.value, puntosJ2.value)
  const diff = Math.abs(puntosJ1.value - puntosJ2.value)

  if (puedeFinalizarSet.value) {
    const lider =
      puntosJ1.value > puntosJ2.value
        ? matchActual.value?.jugador1.nombre || 'J1'
        : matchActual.value?.jugador2.nombre || 'J2'
    return `Listo: Gana ${lider} (${puntosJ1.value} - ${puntosJ2.value})`
  }

  if (maxPts < 11) {
    return `Mín. 11 pts (${maxPts}/11)`
  }

  if (maxPts >= 10 && minPts >= 10) {
    if (diff === 0) return 'Deuce (Empate 10+)'
    if (diff === 1) return 'Ventaja (+1) • Requiere +2'
  }

  if (diff < 2) {
    return 'Requiere ventaja de +2'
  }

  return 'Set en juego'
})

const emitirMarcadorEnVivo = () => {
  if (!matchActual.value?.partido.id) return

  const setsFormateados = historialSets.value.map((s) => ({
    setNumero: Number(s.setNumero) || 1,
    puntosJugador1: Number(s.puntosJugador1) || 0,
    puntosJugador2: Number(s.puntosJugador2) || 0,
    mallasJugador1: Number(s.mallasJugador1) || 0,
    mallasJugador2: Number(s.mallasJugador2) || 0,
    ganadorId: s.ganadorId || '',
    ganadorBolaId: s.ganadorBolaId || null,
  }))

  emit('actualizar-marcador-en-vivo', {
    partidoId: matchActual.value.partido.id,
    marcadorEnVivo: {
      puntosJ1: puntosJ1.value,
      puntosJ2: puntosJ2.value,
      setActual: partidoTerminado.value ? 'Finalizado' : `Set ${numeroSetActual.value}`,
      numeroSet: numeroSetActual.value,
      setsGanadosJ1: setsGanadosJ1.value,
      setsGanadosJ2: setsGanadosJ2.value,
      mesa: matchActual.value.partido.mesa || `Mesa ${matchActual.value.partido.numeroPartido || 1}`,
      servidorActual: servidorActual.value,
      finalizado: partidoTerminado.value,
      ganadorId: ganadorPartido.value?.id || null,
      actualizadoEn: Date.now(),
      historialSets: setsFormateados,
      setsDetalle: setsFormateados.map((s) => `S${s.setNumero}: ${s.puntosJugador1}-${s.puntosJugador2}`).join(' | '),
    },
  })
}

// Bloqueo estricto: Si el partido ya concluyó o el set actual alcanzó la victoria, no se pueden sumar más puntos
const puedeSumarPunto = (_jugador: 1 | 2): boolean => {
  if (partidoTerminado.value) {
    return false
  }
  if (puedeFinalizarSet.value) {
    return false
  }
  return true
}

const sumarPunto = (jugador: 1 | 2) => {
  if (!puedeSumarPunto(jugador)) return
  if (jugador === 1) {
    puntosJ1.value += 1
  } else {
    puntosJ2.value += 1
  }
  emitirMarcadorEnVivo()
}

const restarPunto = (jugador: 1 | 2) => {
  if (jugador === 1) {
    puntosJ1.value = Math.max(0, puntosJ1.value - 1)
  } else {
    puntosJ2.value = Math.max(0, puntosJ2.value - 1)
  }
  emitirMarcadorEnVivo()
}

const reiniciarSetActual = () => {
  puntosJ1.value = 0
  puntosJ2.value = 0
  saqueInvertidoManualmente.value = false
  emitirMarcadorEnVivo()
}

// Disputa de bola
const seleccionarGanadorBola = (jugadorNum: 1 | 2) => {
  if (!matchActual.value) return
  ganadorBola.value = jugadorNum === 1 ? matchActual.value.jugador1 : matchActual.value.jugador2
  mostrarDisputaBola.value = false
  saqueInvertidoManualmente.value = false
  emitirMarcadorEnVivo()
}

// Declaración de W.O. / Abandono - EXCLUSIVO ADMIN
const abrirModalWO = () => {
  if (!authStore.esAdmin) return
  if (!matchActual.value) return
  ganadorWOId.value = matchActual.value.jugador1.id
  modalWORef.value?.open()
}

const confirmarVictoriaPorWO = () => {
  if (!authStore.esAdmin) return
  if (!matchActual.value || !ganadorWOId.value) return

  const ganador = ganadorWOId.value === matchActual.value.jugador1.id ? matchActual.value.jugador1 : matchActual.value.jugador2
  const perdedor = ganadorWOId.value === matchActual.value.jugador1.id ? matchActual.value.jugador2 : matchActual.value.jugador1

  // Sets balanceados a 11-6 y 11-6
  const setsWO: SetPartido[] = [
    {
      setNumero: 1,
      puntosJugador1: ganadorWOId.value === matchActual.value.jugador1.id ? 11 : 6,
      puntosJugador2: ganadorWOId.value === matchActual.value.jugador1.id ? 6 : 11,
      mallasJugador1: 0,
      mallasJugador2: 0,
      ganadorId: ganador.id,
    },
    {
      setNumero: 2,
      puntosJugador1: ganadorWOId.value === matchActual.value.jugador1.id ? 11 : 6,
      puntosJugador2: ganadorWOId.value === matchActual.value.jugador1.id ? 6 : 11,
      mallasJugador1: 0,
      mallasJugador2: 0,
      ganadorId: ganador.id,
    },
  ]

  modalWORef.value?.close()

  emit('partido-finalizado', {
    partidoId: matchActual.value.partido.id,
    sets: setsWO,
    ganadorId: ganador.id,
    esWalkover: true,
    marcador: '2 - 0 (W.O.)',
    marcadorDetallado: '11-6, 11-6',
    perdedorPorWId: perdedor.id,
    ganadorBolaId: ganadorBola.value?.id,
  })

  close()
}

// Easter egg de mallas
const registrarMalla = (jugador: 1 | 2) => {
  if (jugador === 1) {
    mallasJ1.value += 1
  } else {
    mallasJ2.value += 1
  }

  const nombreJugador = jugador === 1 ? matchActual.value?.jugador1.nombre : matchActual.value?.jugador2.nombre
  const totalMallas = jugador === 1 ? mallasJ1.value : mallasJ2.value

  if (totalMallas % 2 === 1) {
    easterEggMensaje.value = `¡Malla con suerte para ${nombreJugador}! 🏓🍀`
  } else {
    easterEggMensaje.value = `¡Easter Egg: El Rey de la Malla! ✨ ${nombreJugador} suma ${totalMallas} toques`
  }

  if (timerEasterEgg) clearTimeout(timerEasterEgg)
  timerEasterEgg = setTimeout(() => {
    easterEggMensaje.value = ''
  }, 2500)
}

const handleTerminarSet = async () => {
  if (!matchActual.value) return

  if (puntosJ1.value === puntosJ2.value) {
    mensajeAlertaSet.value = 'El set está empatado. Debe haber un jugador con mayor puntuación para definir el ganador del set.'
    if (timerAlertaSet) clearTimeout(timerAlertaSet)
    timerAlertaSet = setTimeout(() => {
      mensajeAlertaSet.value = ''
    }, 3500)
    return
  }

  const ganadorSetId = puntosJ1.value > puntosJ2.value ? matchActual.value.jugador1.id : matchActual.value.jugador2.id

  const nuevoSet: SetPartido = {
    setNumero: numeroSetActual.value,
    puntosJugador1: puntosJ1.value,
    puntosJugador2: puntosJ2.value,
    mallasJugador1: mallasJ1.value,
    mallasJugador2: mallasJ2.value,
    ganadorId: ganadorSetId,
    ganadorBolaId: ganadorBola.value?.id || null,
  }

  historialSets.value.push(nuevoSet)
  puntosJ1.value = 0
  puntosJ2.value = 0
  mallasJ1.value = 0
  mallasJ2.value = 0
  saqueInvertidoManualmente.value = false

  // Si alguno de los dos jugadores ya alcanzó 2 sets ganados, el partido se da por terminado
  if (setsGanadosJ1.value >= 2 || setsGanadosJ2.value >= 2) {
    mostrarModalFinPartido.value = true
    modalFinPartidoRef.value?.open()
  } else {
    ladosInvertidos.value = !ladosInvertidos.value
  }

  // Persistir de forma inmediata el set jugado en la base de datos Firestore
  if (matchActual.value.partido.id) {
    try {
      const setsLimpios = historialSets.value.map((s) => ({
        setNumero: Number(s.setNumero) || 1,
        puntosJugador1: Number(s.puntosJugador1) || 0,
        puntosJugador2: Number(s.puntosJugador2) || 0,
        mallasJugador1: Number(s.mallasJugador1) || 0,
        mallasJugador2: Number(s.mallasJugador2) || 0,
        ganadorId: s.ganadorId || '',
        ganadorBolaId: s.ganadorBolaId || null,
      }))
      await actualizarPartidoDB(matchActual.value.partido.id, {
        torneoId: matchActual.value.partido.torneoId,
        sets: setsLimpios,
        marcadorDetallado: setsLimpios.map((s) => `${s.puntosJugador1}-${s.puntosJugador2}`).join(', '),
      })
    } catch (err) {
      console.error('[ModalMarcadorVirtual] Error al guardar set terminado en base de datos:', err)
    }
  }

  emitirMarcadorEnVivo()
}

// Modal y overlay de partido finalizado
const mostrarModalFinPartido = ref(false)
const modalFinPartidoRef = ref<InstanceType<typeof Modal> | null>(null)

const abrirModalFinPartido = () => {
  mostrarModalFinPartido.value = true
  modalFinPartidoRef.value?.open()
}

watch(partidoTerminado, (terminado) => {
  if (terminado) {
    mostrarModalFinPartido.value = true
    modalFinPartidoRef.value?.open()
  } else {
    mostrarModalFinPartido.value = false
    modalFinPartidoRef.value?.close()
  }
})

const open = (partidoDirecto?: PartidoArbitrable) => {
  if (partidoDirecto) {
    matchInterno.value = partidoDirecto
  } else if (props.match) {
    matchInterno.value = props.match
  }

  // Restaurar historial de sets previos si el partido ya contaba con sets registrados
  const setsPrevios =
    matchActual.value?.partido.sets && Array.isArray(matchActual.value.partido.sets) && matchActual.value.partido.sets.length > 0
      ? matchActual.value.partido.sets
      : matchActual.value?.partido.marcadorEnVivo?.historialSets && Array.isArray(matchActual.value.partido.marcadorEnVivo.historialSets)
        ? matchActual.value.partido.marcadorEnVivo.historialSets
        : []

  historialSets.value = setsPrevios.map((s: any) => ({
    setNumero: Number(s.setNumero) || 1,
    puntosJugador1: Number(s.puntosJugador1) || 0,
    puntosJugador2: Number(s.puntosJugador2) || 0,
    mallasJugador1: Number(s.mallasJugador1) || 0,
    mallasJugador2: Number(s.mallasJugador2) || 0,
    ganadorId: s.ganadorId || '',
    ganadorBolaId: s.ganadorBolaId || null,
  }))

  const mLive = matchActual.value?.partido.marcadorEnVivo
  puntosJ1.value = Number(mLive?.puntosJ1) || 0
  puntosJ2.value = Number(mLive?.puntosJ2) || 0
  mallasJ1.value = 0
  mallasJ2.value = 0
  ladosInvertidos.value = historialSets.value.length % 2 === 1
  saqueInvertidoManualmente.value = false
  easterEggMensaje.value = ''

  if (partidoTerminado.value) {
    mostrarModalFinPartido.value = true
    modalFinPartidoRef.value?.open()
  } else {
    mostrarModalFinPartido.value = false
    modalFinPartidoRef.value?.close()
  }

  // Revisar si ya había ganador de bola guardado en el partido
  if (matchActual.value?.partido.ganadorBolaId) {
    ganadorBola.value =
      matchActual.value.jugador1.id === matchActual.value.partido.ganadorBolaId
        ? matchActual.value.jugador1
        : matchActual.value.jugador2
    mostrarDisputaBola.value = false
  } else {
    ganadorBola.value = null
    mostrarDisputaBola.value = historialSets.value.length === 0
  }

  // Asegurar que el partido tenga su código de cámara de 4 dígitos generado
  if (matchActual.value?.partido && !matchActual.value.partido.codigoCamara) {
    const pin = Math.floor(1000 + Math.random() * 9000).toString()
    matchActual.value.partido.codigoCamara = pin
    actualizarPartidoDB(matchActual.value.partido.id, { codigoCamara: pin }).catch(() => {})
  }

  visible.value = true
  emitirMarcadorEnVivo()
}

const close = () => {
  visible.value = false
  mostrarModalFinPartido.value = false
  modalFinPartidoRef.value?.close()
  emit('close')
}

const handleCerrarConConfirmacion = () => {
  if (historialSets.value.length > 0 && !partidoTerminado.value) {
    modalConfirmarSalidaRef.value?.open()
    return
  }
  close()
}

const confirmarSalida = () => {
  modalConfirmarSalidaRef.value?.close()
  close()
}

const invertirLados = () => {
  ladosInvertidos.value = !ladosInvertidos.value
}

const confirmarRegistroFinal = () => {
  if (!matchActual.value || !ganadorPartido.value) return

  mostrarModalFinPartido.value = false
  modalFinPartidoRef.value?.close()

  const setsLimpios: SetPartido[] = historialSets.value.map((s) => ({
    setNumero: s.setNumero,
    puntosJugador1: s.puntosJugador1,
    puntosJugador2: s.puntosJugador2,
    mallasJugador1: s.mallasJugador1 || 0,
    mallasJugador2: s.mallasJugador2 || 0,
    ganadorId: s.ganadorId,
    ganadorBolaId: s.ganadorBolaId || null,
  }))

  const marcadorStr = `${setsGanadosJ1.value} - ${setsGanadosJ2.value}`
  const marcadorDet = setsLimpios.map((s) => `${s.puntosJugador1}-${s.puntosJugador2}`).join(', ')

  emit('partido-finalizado', {
    partidoId: matchActual.value.partido.id,
    sets: setsLimpios,
    ganadorId: ganadorPartido.value.id,
    esWalkover: false,
    marcador: marcadorStr,
    marcadorDetallado: marcadorDet,
    ganadorBolaId: ganadorBola.value?.id || null,
  })

  close()
}

defineExpose({
  open,
  close,
})
</script>

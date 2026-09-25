<template>
  <Modal ref="modalRef" :title="paso === 'seleccion' ? 'Arbitraje de Torneo' : (modoArbitraje === 'walkover' && authStore.esAdmin ? 'Declarar Victoria por W (Walkover)' : (modoArbitraje === 'transmision' ? 'Transmitir en Vivo • PIN de Seguridad' : 'Confirmación de Seguridad (PINs)'))"
    :sub-title="paso === 'seleccion' ? 'Selecciona un partido pendiente para arbitrar o transmitir en vivo' : (modoArbitraje === 'walkover' && authStore.esAdmin ? 'Dictamen por inasistencia o vencimiento de 48h (Sets 11-6, 11-6)' : (modoArbitraje === 'transmision' ? 'Ingresa los códigos de seguridad para activar la transmisión en vivo de este partido' : 'Ingresa los códigos de 5 dígitos de ambos rivales'))"
    width="xl" :footer="false">
    <div v-if="paso === 'seleccion'" class="space-y-4 py-1">
      <div class="flex items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/60 rounded-xl">
        <div class="flex items-center gap-3">
          <div
            class="w-9 h-9 rounded-full bg-emerald-700 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
            {{ arbitro?.iniciales || 'AR' }}
          </div>
          <div>
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-slate-800 dark:text-slate-100">{{ arbitro?.nombre || 'Árbitro' }}</span>
              <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Árbitro Habilitado
              </span>
            </div>
            <p class="text-[11px] text-slate-500 dark:text-slate-400">
              Registrado en el torneo • No participa en los partidos listados abajo
            </p>
          </div>
        </div>
      </div>

      <!-- Banner de Pausa Fin de Semana -->
      <div v-if="esFinDeSemanaActual" class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-2.5 text-xs">
        <PauseCircle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <p class="font-extrabold text-amber-800 dark:text-amber-300">Jornada oficial en pausa (Fin de Semana)</p>
          <p class="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
            Los sábados y domingos no se juegan partidos oficiales. El tiempo límite de 2 días se encuentra pausado y la actividad competitiva se reanuda el lunes.
          </p>
        </div>
      </div>

      <!-- Lista de partidos disponibles -->
      <div v-if="partidosDisponibles.length > 0" class="space-y-2.5">
        <h4 class="text-xs font-black uppercase tracking-wider text-slate-400 dark:text-slate-400">
          Partidos listos para jugar o dictaminar ({{ partidosDisponibles.length }})
        </h4>

        <div v-for="item in partidosDisponibles" :key="item.partido.id"
          class="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 hover:bg-emerald-50/20 dark:hover:bg-emerald-950/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-white dark:bg-slate-800/80 shadow-xs">
          <!-- Información del partido y jugadores -->
          <div class="flex flex-col sm:flex-row sm:items-center gap-2.5 sm:gap-3.5 flex-1 min-w-0 pr-1 md:pr-4">
            <!-- Badge de Ronda y Estado -->
            <div class="flex items-center gap-1.5 shrink-0 flex-wrap">
              <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600">
                Ronda {{ item.partido.ronda || item.partido.jornada || 1 }}
              </span>
              <span v-if="item.partido.horasRestantes !== undefined && item.partido.horasRestantes <= 0"
                class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                <AlertTriangle class="w-3 h-3" />
                >48h Expirado
              </span>
              <span v-else
                class="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800">
                Libres
              </span>
            </div>

            <!-- Grid equilibrado de los dos jugadores -->
            <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-3 flex-1 min-w-0">
              <!-- Jugador 1 -->
              <div class="flex items-center gap-2 min-w-0">
                <span
                  class="w-8 h-8 rounded-full bg-slate-900 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                  {{ item.jugador1.iniciales }}
                </span>
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" :title="item.jugador1.nombre">
                  {{ item.jugador1.nombre }}
                </span>
              </div>

              <!-- Divisor VS -->
              <span
                class="text-[10px] font-black font-mono text-slate-400 dark:text-slate-400 px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded-md shrink-0 select-none">
                VS
              </span>

              <!-- Jugador 2 -->
              <div class="flex items-center gap-2 min-w-0">
                <span
                  class="w-8 h-8 rounded-full bg-sky-700 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                  {{ item.jugador2.iniciales }}
                </span>
                <span class="text-xs font-bold text-slate-800 dark:text-slate-200 truncate" :title="item.jugador2.nombre">
                  {{ item.jugador2.nombre }}
                </span>
              </div>
            </div>
          </div>

          <!-- Botones de Acción -->
          <div class="flex items-center gap-2 shrink-0 self-end md:self-auto flex-wrap">
            <Button
              v-if="authStore.esAdmin"
              variant="outline"
              size="sm"
              class="gap-1 text-xs border-amber-400 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 cursor-pointer font-bold shadow-2xs"
              @click="seleccionarPartidoParaWO(item)"
            >
              <Gavel class="w-3.5 h-3.5 text-amber-600" />
              <span>Declarar W</span>
            </Button>

            <!-- Botón Transmitir en Vivo con Validación de PIN -->
            <Button
              variant="outline"
              size="sm"
              class="gap-1 text-xs border-rose-400 text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 cursor-pointer font-bold shadow-2xs"
              @click="seleccionarPartidoParaTransmitir(item)"
            >
              <Radio class="w-3.5 h-3.5 text-rose-600 animate-pulse" />
              <span>Transmitir</span>
            </Button>

            <Button variant="emerald" size="sm"
              class="gap-1.5 font-bold shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="esFinDeSemanaActual"
              :title="esFinDeSemanaActual ? 'No se juegan partidos los fines de semana' : 'Arbitrar partido'"
              @click="seleccionarPartido(item)">
              <ShieldCheck class="w-3.5 h-3.5" />
              <span>{{ esFinDeSemanaActual ? 'Pausado (FDS)' : 'Arbitrar' }}</span>
            </Button>
          </div>
        </div>
      </div>

      <div v-else
        class="text-center py-8 px-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-dashed border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 flex flex-col items-center gap-2">
        <AlertCircle class="w-8 h-8 text-slate-400" />
        <p class="text-sm font-bold text-slate-700 dark:text-slate-200">No hay partidos disponibles para arbitrar</p>
        <p class="text-xs text-slate-400 max-w-sm">
          No hay enfrentamientos pendientes donde ambos contrincantes estén libres en este momento o involucran tu propia participación.
        </p>
      </div>

      <div class="flex justify-end pt-2">
        <Button variant="ghost" size="sm" @click="close">
          Cerrar
        </Button>
      </div>
    </div>

    <!-- PASO DE CONFIRMACIÓN O RESOLUCIÓN POR W.O. -->
    <div v-else-if="paso === 'confirmacion' && partidoSeleccionado" class="space-y-4 py-1">
      <div class="flex items-center justify-between">
        <button type="button"
          class="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
          @click="paso = 'seleccion'">
          <ArrowLeft class="w-3.5 h-3.5" />
          <span>Elegir otro partido</span>
        </button>

        <!-- Modo Transmisión: Badge informativo -->
        <div v-if="modoArbitraje === 'transmision'" class="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-bold text-rose-700 dark:text-rose-300">
          <Radio class="w-3.5 h-3.5 text-rose-600 animate-pulse" />
          <span>Transmisión en Vivo</span>
        </div>

        <!-- Selector de Modo: Normal (ambos PINs) vs Walkover (por W) - EXCLUSIVO ADMIN (Solo en arbitraje) -->
        <div v-else-if="authStore.esAdmin" class="inline-flex p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold">
          <button
            type="button"
            :class="[
              'px-3 py-1 rounded-lg transition-all cursor-pointer',
              modoArbitraje === 'normal'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            ]"
            @click="modoArbitraje = 'normal'"
          >
            Partido Presencial (2 PINs)
          </button>
          <button
            type="button"
            :class="[
              'px-3 py-1 rounded-lg transition-all cursor-pointer flex items-center gap-1',
              modoArbitraje === 'walkover'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            ]"
            @click="modoArbitraje = 'walkover'"
          >
            <Gavel class="w-3 h-3" />
            <span>Derrota por W (W.O.)</span>
          </button>
        </div>
      </div>

      <!-- Tarjeta del partido -->
      <div class="p-3 bg-slate-900 text-white rounded-xl flex items-center justify-between text-center border border-slate-800 px-4">
        <div class="text-left">
          <p class="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Jugador 1</p>
          <p class="text-xs font-black">{{ partidoSeleccionado.jugador1.nombre }}</p>
        </div>
        <div class="flex flex-col items-center gap-1">
          <span class="text-[9px] font-black uppercase tracking-wider text-sky-300 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
            Ronda {{ partidoSeleccionado.partido.ronda || partidoSeleccionado.partido.jornada || 1 }}
          </span>
          <span class="text-xs font-black font-mono text-emerald-400 px-2 py-0.5 bg-slate-800 rounded">
            VS
          </span>
        </div>
        <div class="text-right">
          <p class="text-[10px] text-slate-400 uppercase font-extrabold tracking-wider">Jugador 2</p>
          <p class="text-xs font-black">{{ partidoSeleccionado.jugador2.nombre }}</p>
        </div>
      </div>

      <!-- VISTA NORMAL Y TRANSMISIÓN: VALIDACIÓN DE AMBOS PINS -->
      <template v-if="modoArbitraje === 'normal' || modoArbitraje === 'transmision'">
        <!-- Alerta de fin de semana en paso de confirmación -->
        <div
          v-if="esFinDeSemanaActual && modoArbitraje === 'normal'"
          class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 flex items-start gap-2.5 text-xs"
        >
          <PauseCircle class="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <p class="font-extrabold text-amber-800 dark:text-amber-300">Partidos no permitidos en fin de semana</p>
            <p class="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
              Los sábados y domingos no se juegan partidos. El cómputo reglamentario de 2 días está congelado y se reanuda el lunes.
            </p>
          </div>
        </div>

        <div
          :class="[
            'p-3.5 rounded-xl border flex items-start gap-3',
            modoArbitraje === 'transmision'
              ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/60 text-rose-950 dark:text-rose-200'
              : 'bg-sky-50 dark:bg-sky-950/40 border-sky-200/80 dark:border-sky-800 text-sky-900 dark:text-sky-200'
          ]"
        >
          <Radio v-if="modoArbitraje === 'transmision'" class="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5 animate-pulse" />
          <KeyRound v-else class="w-5 h-5 text-sky-700 dark:text-sky-400 shrink-0 mt-0.5" />
          <div class="text-xs space-y-1">
            <p class="font-extrabold">
              {{ modoArbitraje === 'transmision' ? 'Protocolo de Seguridad para Transmisión en Vivo' : 'Protocolo de Validación de Presencia' }}
            </p>
            <p :class="modoArbitraje === 'transmision' ? 'text-rose-800 dark:text-rose-300' : 'text-sky-800 dark:text-sky-300'">
              {{
                modoArbitraje === 'transmision'
                  ? 'Pide a cada jugador el código numérico de 5 dígitos para autorizar e iniciar la transmisión en vivo de este partido.'
                  : 'Pide a cada jugador el código numérico de 5 dígitos que aparece en su pantalla para este enfrentamiento. Ambos deben coincidir para abrir el marcador virtual.'
              }}
            </p>
          </div>
        </div>

        <!-- Modo Transmisión (Pruebas directas sin PINs) -->
        <div v-if="modoArbitraje === 'transmision'" class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-center space-y-1">
          <p class="text-xs font-bold text-slate-800 dark:text-slate-200">
            Prueba de Transmisión Directa
          </p>
          <p class="text-[11px] text-slate-500 dark:text-slate-400">
            Se ha omitido la solicitud de PINs para pruebas. Haz clic abajo para iniciar la transmisión en vivo directamente.
          </p>
        </div>

        <!-- Inputs de PIN para arbitraje normal -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
              PIN de {{ partidoSeleccionado.jugador1.nombre }}
            </label>
            <input v-model="codigoJ1" type="text" maxlength="5" placeholder="5 dígitos (ej. 58214)"
              class="w-full text-center tracking-widest font-mono text-base font-black px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-hidden uppercase bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all"
              @input="limpiarError" />
          </div>

          <div class="space-y-1.5">
            <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
              PIN de {{ partidoSeleccionado.jugador2.nombre }}
            </label>
            <input v-model="codigoJ2" type="text" maxlength="5" placeholder="5 dígitos (ej. 91042)"
              class="w-full text-center tracking-widest font-mono text-base font-black px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 focus:ring-2 focus:ring-emerald-500/20 outline-hidden uppercase bg-white dark:bg-slate-800 text-slate-900 dark:text-white transition-all"
              @input="limpiarError" />
          </div>
        </div>

        <div v-if="mensajeError"
          class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertTriangle class="w-4 h-4 text-rose-600 shrink-0" />
          <span>{{ mensajeError }}</span>
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="ghost" size="sm" @click="paso = 'seleccion'">
            Atrás
          </Button>

          <Button
            :variant="modoArbitraje === 'transmision' ? 'primary' : 'emerald'"
            size="sm"
            class="gap-2"
            :disabled="(esFinDeSemanaActual && modoArbitraje === 'normal') || (modoArbitraje !== 'transmision' && (codigoJ1.length !== 5 || codigoJ2.length !== 5))"
            @click="handleConfirmarInicio"
          >
            <Radio v-if="modoArbitraje === 'transmision'" class="w-4 h-4 text-white animate-pulse" />
            <Play v-else class="w-4 h-4" />
            <span>{{ modoArbitraje === 'transmision' ? 'Iniciar Transmisión' : (esFinDeSemanaActual ? 'Jornada Pausada' : 'Validar e Iniciar Marcador') }}</span>
          </Button>
        </div>
      </template>

      <!-- VISTA WALKOVER: DECLARAR VICTORIA POR W CUANDO NO SE PUEDE JUGAR O >48H -->
      <template v-else-if="modoArbitraje === 'walkover'">
        <div class="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-200 space-y-1.5 text-xs">
          <p class="font-extrabold flex items-center gap-1.5 text-amber-800 dark:text-amber-300">
            <Gavel class="w-4 h-4 text-amber-600" />
            Dictamen Oficial de Victoria por W (Walkover)
          </p>
          <p class="leading-relaxed text-amber-800 dark:text-amber-300">
            Aplica cuando un rival <strong>no se presenta</strong>, <strong>rechaza jugar</strong> o el partido ha <strong>excedido el plazo reglamentario de 48 horas</strong>.
            El resultado se fija en <strong>11-6 y 11-6</strong> (2 - 0). El ganador sumará <strong>2 puntos</strong> y el ausente <strong>0 puntos</strong> de sanción.
          </p>
        </div>

        <div class="space-y-2">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Selecciona cuál jugador estuvo PRESENTE (Ganador por W):
          </label>
          <div class="grid grid-cols-2 gap-3">
            <button
              type="button"
              :class="[
                'p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5',
                ganadorWOSeleccionadoId === partidoSeleccionado.jugador1.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-200'
              ]"
              @click="ganadorWOSeleccionadoId = partidoSeleccionado.jugador1.id"
            >
              <div class="w-9 h-9 rounded-full bg-emerald-700 text-white font-black text-xs flex items-center justify-center">
                {{ partidoSeleccionado.jugador1.iniciales }}
              </div>
              <span class="text-xs font-bold truncate max-w-full">{{ partidoSeleccionado.jugador1.nombre }}</span>
              <span class="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-emerald-600 text-white mt-1">
                Presente (Gana 2-0)
              </span>
            </button>

            <button
              type="button"
              :class="[
                'p-3.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5',
                ganadorWOSeleccionadoId === partidoSeleccionado.jugador2.id
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-500 text-emerald-950 dark:text-emerald-200 ring-2 ring-emerald-500/30'
                  : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-slate-300 text-slate-700 dark:text-slate-200'
              ]"
              @click="ganadorWOSeleccionadoId = partidoSeleccionado.jugador2.id"
            >
              <div class="w-9 h-9 rounded-full bg-sky-700 text-white font-black text-xs flex items-center justify-center">
                {{ partidoSeleccionado.jugador2.iniciales }}
              </div>
              <span class="text-xs font-bold truncate max-w-full">{{ partidoSeleccionado.jugador2.nombre }}</span>
              <span class="text-[9px] uppercase font-black px-2 py-0.5 rounded bg-emerald-600 text-white mt-1">
                Presente (Gana 2-0)
              </span>
            </button>
          </div>
        </div>

        <div class="space-y-1.5">
          <label class="block text-xs font-bold text-slate-700 dark:text-slate-300">
            Motivo reglamentario del W.O.
          </label>
          <select
            v-model="motivoWO"
            class="w-full text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 outline-hidden"
          >
            <option value="inasistencia">Inasistencia del rival / No se presentó a la mesa</option>
            <option value="plazo_48h">Plazo límite de 48 horas excedido sin disputar partido</option>
            <option value="retiro">Retiro voluntario o imposibilidad de jugar</option>
          </select>
        </div>

        <!-- Opción de Prórroga / Plazo de 1 día -->
        <div class="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 flex items-center justify-between gap-3 text-xs">
          <div class="flex items-center gap-2.5">
            <Clock class="w-4 h-4 text-amber-500 shrink-0" />
            <div>
              <p class="font-bold text-slate-800 dark:text-slate-200">¿Conceder plazo extra para jugar?</p>
              <p class="text-[10px] text-slate-500 dark:text-slate-400">Otorga 1 día adicional (24 horas) para disputar el partido antes de aplicar W.O.</p>
            </div>
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            class="shrink-0 border-amber-300 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-950/40 font-bold cursor-pointer"
            @click="handleDarPlazoUnDia"
          >
            Dar plazo de 1 día
          </Button>
        </div>

        <div v-if="mensajeError"
          class="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs font-bold flex items-center gap-2 animate-in fade-in">
          <AlertTriangle class="w-4 h-4 text-rose-600 shrink-0" />
          <span>{{ mensajeError }}</span>
        </div>

        <div class="flex items-center justify-end gap-2.5 pt-2">
          <Button variant="ghost" size="sm" @click="paso = 'seleccion'">
            Atrás
          </Button>

          <Button variant="emerald" size="sm" class="gap-2" :disabled="!ganadorWOSeleccionadoId"
            @click="handleConfirmarWalkover">
            <Gavel class="w-4 h-4" />
            <span>Dictaminar W.O. (11-6, 11-6)</span>
          </Button>
        </div>
      </template>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import {
  ShieldCheck,
  AlertCircle,
  KeyRound,
  ArrowLeft,
  AlertTriangle,
  Play,
  Gavel,
  Clock,
  Radio,
  PauseCircle,
} from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import type { PartidoArbitrable, JugadorTorneo } from '@/types'
import { useAuthStore } from '@/stores/auth'
import { esFinDeSemana } from '@/services/torneoAlgoritmos'

const authStore = useAuthStore()
const esFinDeSemanaActual = computed(() => esFinDeSemana())

const props = defineProps<{
  arbitro: JugadorTorneo | null
  partidosDisponibles: PartidoArbitrable[]
  jugadoresTorneo?: JugadorTorneo[]
}>()

const emit = defineEmits<{
  (
    e: 'iniciar-partido',
    datos: {
      partidoArbitrable: PartidoArbitrable
    },
  ): void
  (
    e: 'iniciar-transmision',
    datos: {
      partidoArbitrable: PartidoArbitrable
    },
  ): void
  (
    e: 'validar-codigos',
    datos: {
      partidoId: string
      codigo1: string
      codigo2: string
    },
    callback: (resultado: { valido: boolean; mensaje: string }) => void,
  ): void
  (
    e: 'declarar-walkover',
    datos: {
      partidoId: string
      ganadorId: string
      perdedorId: string
      motivo: string
    },
  ): void
  (
    e: 'prorrogar-partido',
    datos: {
      partidoId: string
      horasExtra: number
    },
  ): void
  (e: 'cambiar-arbitro', jugador: JugadorTorneo): void
}>()

const modalRef = ref<InstanceType<typeof Modal> | null>(null)
const paso = ref<'seleccion' | 'confirmacion'>('seleccion')
const modoArbitraje = ref<'normal' | 'walkover' | 'transmision'>('normal')
const partidoSeleccionado = ref<PartidoArbitrable | null>(null)

const codigoJ1 = ref('')
const codigoJ2 = ref('')
const ganadorWOSeleccionadoId = ref('')
const motivoWO = ref('inasistencia')
const mensajeError = ref('')

const open = () => {
  paso.value = 'seleccion'
  modoArbitraje.value = 'normal'
  partidoSeleccionado.value = null
  codigoJ1.value = ''
  codigoJ2.value = ''
  ganadorWOSeleccionadoId.value = ''
  motivoWO.value = 'inasistencia'
  mensajeError.value = ''
  modalRef.value?.open()
}

const close = () => {
  modalRef.value?.close()
}

const seleccionarPartido = (partido: PartidoArbitrable) => {
  partidoSeleccionado.value = partido
  modoArbitraje.value = 'normal'
  codigoJ1.value = ''
  codigoJ2.value = ''
  ganadorWOSeleccionadoId.value = partido.jugador1.id
  mensajeError.value = ''
  paso.value = 'confirmacion'
}

const seleccionarPartidoParaTransmitir = (partido: PartidoArbitrable) => {
  // Comentado para pruebas: omitir PINs e iniciar transmisión de forma directa
  close()
  emit('iniciar-transmision', { partidoArbitrable: partido })
  /*
  partidoSeleccionado.value = partido
  modoArbitraje.value = 'transmision'
  codigoJ1.value = ''
  codigoJ2.value = ''
  mensajeError.value = ''
  paso.value = 'confirmacion'
  */
}

const seleccionarPartidoParaWO = (partido: PartidoArbitrable) => {
  if (!authStore.esAdmin) return
  partidoSeleccionado.value = partido
  modoArbitraje.value = 'walkover'
  codigoJ1.value = ''
  codigoJ2.value = ''
  ganadorWOSeleccionadoId.value = partido.jugador1.id
  mensajeError.value = ''
  paso.value = 'confirmacion'
}

const limpiarError = () => {
  mensajeError.value = ''
}

const handleConfirmarInicio = () => {
  if (!partidoSeleccionado.value) return

  if (modoArbitraje.value === 'normal' && esFinDeSemana()) {
    mensajeError.value = 'Los sábados y domingos no se juegan partidos. El torneo se reanuda el lunes.'
    return
  }

  // Comentado para pruebas: si es transmisión, iniciar directamente sin validar PINs
  if (modoArbitraje.value === 'transmision') {
    const match = partidoSeleccionado.value
    close()
    emit('iniciar-transmision', { partidoArbitrable: match })
    return
  }

  emit(
    'validar-codigos',
    {
      partidoId: partidoSeleccionado.value.partido.id,
      codigo1: codigoJ1.value,
      codigo2: codigoJ2.value,
    },
    (resultado) => {
      if (resultado.valido) {
        mensajeError.value = ''
        const match = partidoSeleccionado.value
        close()
        if (match) {
          if (modoArbitraje.value === 'transmision') {
            emit('iniciar-transmision', { partidoArbitrable: match })
          } else {
            emit('iniciar-partido', { partidoArbitrable: match })
          }
        }
      } else {
        mensajeError.value = resultado.mensaje
      }
    },
  )
}

const handleDarPlazoUnDia = () => {
  if (!authStore.esAdmin) return
  if (!partidoSeleccionado.value) return

  emit('prorrogar-partido', {
    partidoId: partidoSeleccionado.value.partido.id,
    horasExtra: 24,
  })

  close()
}

const handleConfirmarWalkover = () => {
  if (!authStore.esAdmin) return
  if (!partidoSeleccionado.value || !ganadorWOSeleccionadoId.value) return

  const ganadorId = ganadorWOSeleccionadoId.value
  const perdedorId =
    ganadorId === partidoSeleccionado.value.jugador1.id
      ? partidoSeleccionado.value.jugador2.id
      : partidoSeleccionado.value.jugador1.id

  emit('declarar-walkover', {
    partidoId: partidoSeleccionado.value.partido.id,
    ganadorId,
    perdedorId,
    motivo: motivoWO.value,
  })

  close()
}

defineExpose({
  open,
  close,
})
</script>

<template>
  <section class="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-start animate-in fade-in duration-300">
    <!-- ================= COLUMNA PRINCIPAL ================= -->
    <div class="lg:col-span-7 w-full flex flex-col gap-5 min-w-0">
      <!-- HERO: estado del jugador en las eliminatorias -->
      <article
        class="relative overflow-hidden rounded-2xl border p-5 sm:p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_12px_32px_-16px_rgba(15,23,42,0.18)] dark:shadow-none"
        :class="claseHero"
      >
        <div class="pointer-events-none absolute -top-24 -right-20 w-72 h-72 rounded-full blur-3xl opacity-60 dark:opacity-40" :class="claseResplandor"></div>

        <div class="relative flex flex-wrap items-center gap-2 mb-4">
          <span class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-[0.14em] px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/25">
            <Crown class="w-3 h-3" />
            Fase 2 · Eliminatorias
          </span>
          <span
            v-if="rondaEnJuego && estado !== 'proyeccion'"
            class="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-900/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 border border-slate-900/10 dark:border-white/10"
          >
            <span class="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse"></span>
            En juego: {{ rondaEnJuego.nombre }}
          </span>
          <span class="ml-auto text-[11px] font-bold text-slate-500 dark:text-slate-400">Al mejor de 3 sets</span>
        </div>

        <!-- Cargando -->
        <div v-if="estado === 'cargando'" class="relative flex items-center gap-3 py-6">
          <span class="w-5 h-5 rounded-full border-2 border-amber-500 border-t-transparent animate-spin"></span>
          <span class="text-sm font-bold text-slate-600 dark:text-slate-300">Cargando el cuadro de eliminatorias…</span>
        </div>

        <!-- Cuadro aún no publicado -->
        <div v-else-if="estado === 'proyeccion'" class="relative flex flex-col gap-2 py-2">
          <h3 class="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
            El cuadro se está armando
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-300 max-w-prose">
            El organizador cerró la fase de grupos. En cuanto publique las llaves verás aquí a tu rival, tu PIN y tu camino al título.
          </p>
        </div>

        <!-- Campeón -->
        <div v-else-if="estado === 'campeon'" class="relative flex items-center gap-4 py-2">
          <div class="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-300 to-amber-600 text-white flex items-center justify-center shadow-lg shadow-amber-500/30 shrink-0">
            <Trophy class="w-8 h-8" />
          </div>
          <div class="min-w-0">
            <h3 class="text-2xl sm:text-3xl font-black font-heading text-slate-900 dark:text-white tracking-tight">¡Eres el campeón!</h3>
            <p class="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Ganaste la Gran Final y te llevas el 100% de la bolsa: <strong class="text-amber-700 dark:text-amber-300">${{ bolsa }} COP</strong>.
            </p>
          </div>
        </div>

        <!-- Eliminado -->
        <div v-else-if="estado === 'eliminado' && llaveEliminacion" class="relative flex flex-col gap-3 py-1">
          <h3 class="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
            {{ llaveEliminacion.ronda === 'final' ? '¡Subcampeón del torneo!' : `Llegaste hasta ${nombreLlave(llaveEliminacion)}` }}
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-300">
            Caíste ante <strong class="text-slate-900 dark:text-white">{{ rivalEn(llaveEliminacion)?.nombre }}</strong>
            <span class="font-mono font-bold"> ({{ marcadorDesdeMi(llaveEliminacion) }})</span>.
            Sigue el cuadro en vivo hasta la Gran Final.
          </p>
        </div>

        <!-- Partido por jugar / esperando rival -->
        <div v-else-if="(estado === 'jugando' || estado === 'esperando') && llaveActual" class="relative flex flex-col gap-5">
          <div class="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <p class="text-[11px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400">Tu próximo partido</p>
              <h3 class="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
                {{ nombreLlave(llaveActual) }}
              </h3>
            </div>
            <span
              v-if="llaveActual.estado === 'en_curso'"
              class="inline-flex items-center gap-1.5 text-xs font-black uppercase px-3 py-1.5 rounded-full bg-rose-500 text-white shadow-sm shadow-rose-500/30"
            >
              <span class="w-2 h-2 rounded-full bg-white animate-pulse"></span>
              En juego
            </span>
            <span
              v-else
              class="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/25"
            >
              <Clock class="w-3.5 h-3.5" />
              {{ estado === 'jugando' ? 'Listo para jugar' : 'Esperando rival' }}
            </span>
          </div>

          <!-- Enfrentamiento -->
          <div class="grid grid-cols-[1fr_auto_1fr] items-center gap-2 sm:gap-4">
            <div class="flex flex-col items-center text-center gap-2 min-w-0">
              <AvatarJugador
                :foto-url="yoEn(llaveActual)?.fotoUrl"
                :nombre="yoEn(llaveActual)?.nombre"
                :iniciales="yoEn(llaveActual)?.iniciales"
                size="xl"
                ring-class="ring-4 ring-emerald-500/30"
              />
              <div class="min-w-0 w-full">
                <p class="text-sm font-black text-slate-900 dark:text-white truncate">{{ yoEn(llaveActual)?.nombre }}</p>
                <p class="text-[11px] font-bold text-emerald-700 dark:text-emerald-400">Tú<template v-if="semillaDe(llaveActual, 'yo')"> · #{{ semillaDe(llaveActual, 'yo') }}</template></p>
              </div>
            </div>

            <div class="flex flex-col items-center gap-1.5">
              <template v-if="llaveActual.estado === 'en_curso' && llaveActual.marcadorEnVivo">
                <span class="font-mono text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tabular-nums">
                  {{ setsVivo(llaveActual).mios }}<span class="text-slate-400 mx-1">-</span>{{ setsVivo(llaveActual).rival }}
                </span>
                <span class="text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">Sets</span>
              </template>
              <span
                v-else
                class="w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-black flex items-center justify-center shadow-md"
              >
                VS
              </span>
            </div>

            <div class="flex flex-col items-center text-center gap-2 min-w-0">
              <template v-if="rivalEn(llaveActual)?.id">
                <AvatarJugador
                  :foto-url="rivalEn(llaveActual)?.fotoUrl"
                  :nombre="rivalEn(llaveActual)?.nombre"
                  :iniciales="rivalEn(llaveActual)?.iniciales"
                  size="xl"
                  ring-class="ring-4 ring-amber-500/30"
                />
                <div class="min-w-0 w-full">
                  <p class="text-sm font-black text-slate-900 dark:text-white truncate">{{ rivalEn(llaveActual)?.nombre }}</p>
                  <p class="text-[11px] font-bold text-amber-700 dark:text-amber-400">
                    Rival<template v-if="semillaDe(llaveActual, 'rival')"> · #{{ semillaDe(llaveActual, 'rival') }}</template>
                  </p>
                </div>
              </template>
              <template v-else>
                <div class="w-14 h-14 rounded-full border-2 border-dashed border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-400">
                  <HelpCircle class="w-6 h-6" />
                </div>
                <div class="min-w-0 w-full">
                  <p class="text-sm font-black text-slate-700 dark:text-slate-200 truncate">Por definir</p>
                  <p v-if="llaveAlimentadora" class="text-[11px] font-bold text-slate-500 dark:text-slate-400 truncate">
                    Ganador de {{ nombreLlave(llaveAlimentadora) }}
                  </p>
                </div>
              </template>
            </div>
          </div>

          <!-- Quién define a mi rival -->
          <div
            v-if="estado === 'esperando' && llaveAlimentadora"
            class="rounded-xl border border-slate-200 dark:border-slate-700/80 bg-slate-50/80 dark:bg-slate-800/40 px-4 py-3 text-xs text-slate-600 dark:text-slate-300 flex flex-wrap items-center gap-x-2 gap-y-1"
          >
            <Swords class="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>Tu rival sale de</span>
            <strong class="text-slate-900 dark:text-white">{{ llaveAlimentadora.jugador1?.nombre || 'Por definir' }}</strong>
            <span>vs</span>
            <strong class="text-slate-900 dark:text-white">{{ llaveAlimentadora.jugador2?.nombre || 'Por definir' }}</strong>
          </div>

          <!-- PIN para el árbitro -->
          <div
            v-if="miPin"
            class="rounded-xl border border-emerald-500/25 bg-emerald-50/70 dark:bg-emerald-950/30 px-4 py-3.5 flex flex-wrap items-center justify-between gap-3"
          >
            <div class="flex items-center gap-3 min-w-0">
              <span class="w-9 h-9 rounded-lg bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <KeyRound class="w-4.5 h-4.5" />
              </span>
              <div class="min-w-0">
                <p class="text-xs font-black text-slate-900 dark:text-white">Tu PIN para el árbitro</p>
                <p class="text-[11px] text-slate-600 dark:text-slate-400">Díctalo junto con el de tu rival para habilitar el marcador.</p>
              </div>
            </div>
            <span class="font-mono text-2xl font-black tracking-[0.3em] text-emerald-700 dark:text-emerald-300 tabular-nums">{{ miPin }}</span>
          </div>
        </div>

        <!-- No clasificó -->
        <div v-else-if="estado === 'no_clasificado'" class="relative flex flex-col gap-2 py-1">
          <h3 class="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
            Terminaste en el puesto #{{ miPuesto }}
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-300">
            Clasificaban los {{ clasificados }} primeros. Puedes seguir el cuadro en vivo y arbitrar llaves para ayudar al torneo.
          </p>
        </div>

        <!-- Espectador -->
        <div v-else class="relative flex flex-col gap-2 py-1">
          <h3 class="text-xl sm:text-2xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
            Camino a la Gran Final
          </h3>
          <p class="text-sm text-slate-600 dark:text-slate-300">
            {{ campeon ? `${campeon.nombre} es el campeón del torneo.` : 'Sigue las llaves en vivo hasta coronar al campeón.' }}
          </p>
        </div>
      </article>

      <!-- MI CAMINO AL TÍTULO -->
      <article
        v-if="camino.length > 0"
        class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none"
      >
        <header class="flex items-center justify-between gap-2 mb-4">
          <h4 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Flag class="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Mi camino al título
          </h4>
          <span class="text-[11px] font-bold text-slate-500 dark:text-slate-400">{{ victoriasCamino }} de {{ camino.length }} rondas ganadas</span>
        </header>

        <ol class="relative flex flex-col">
          <li v-for="(paso, i) in camino" :key="paso.ronda" class="relative flex gap-3.5 pb-4 last:pb-0">
            <span
              v-if="i < camino.length - 1"
              class="absolute left-[15px] top-8 bottom-0 w-0.5 rounded-full"
              :class="paso.tipo === 'ganada' ? 'bg-emerald-500/60' : 'bg-slate-200 dark:bg-slate-700'"
            ></span>
            <span
              class="relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2"
              :class="clasePaso(paso.tipo)"
            >
              <Check v-if="paso.tipo === 'ganada'" class="w-4 h-4" />
              <X v-else-if="paso.tipo === 'perdida'" class="w-4 h-4" />
              <Trophy v-else-if="paso.ronda === 'final'" class="w-4 h-4" />
              <Lock v-else-if="paso.tipo === 'bloqueada'" class="w-3.5 h-3.5" />
              <span v-else class="text-[11px] font-black">{{ i + 1 }}</span>
            </span>
            <div
              class="flex-1 min-w-0 rounded-xl border px-3.5 py-2.5 flex items-center justify-between gap-3"
              :class="paso.tipo === 'actual'
                ? 'border-amber-400/60 bg-amber-50/70 dark:bg-amber-950/20 dark:border-amber-700/60'
                : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40'"
            >
              <div class="min-w-0">
                <p class="text-xs font-black text-slate-900 dark:text-white">{{ paso.nombre }}</p>
                <p class="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  <template v-if="paso.rival?.id">vs {{ paso.rival.nombre }}</template>
                  <template v-else-if="paso.tipo === 'bloqueada'">Fuera de esta ronda</template>
                  <template v-else>Rival por definir</template>
                </p>
              </div>
              <span
                v-if="paso.llave?.estado === 'jugado'"
                class="font-mono text-xs font-black px-2 py-1 rounded-md shrink-0"
                :class="paso.tipo === 'ganada'
                  ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                  : 'bg-rose-500/10 text-rose-700 dark:text-rose-300'"
              >
                {{ marcadorDesdeMi(paso.llave) }}
              </span>
              <span
                v-else-if="paso.tipo === 'actual'"
                class="text-[10px] font-black uppercase px-2 py-1 rounded-md bg-amber-500 text-slate-950 shrink-0"
              >
                Siguiente
              </span>
            </div>
          </li>
        </ol>
      </article>

      <!-- Llaves en juego (cuando no tengo camino propio) -->
      <article
        v-else-if="esOficial"
        class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none"
      >
        <header class="flex items-center justify-between gap-2 mb-3">
          <h4 class="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Swords class="w-4 h-4 text-amber-600 dark:text-amber-400" />
            Resultados recientes
          </h4>
        </header>
        <p v-if="recientes.length === 0" class="text-xs text-slate-500 dark:text-slate-400">Aún no se ha jugado ninguna llave.</p>
        <ul v-else class="flex flex-col divide-y divide-slate-100 dark:divide-slate-800">
          <li v-for="p in recientes" :key="p.id" class="py-2.5 flex items-center justify-between gap-3 text-xs">
            <div class="min-w-0">
              <p class="font-black text-slate-900 dark:text-white truncate">{{ ganadorDe(p)?.nombre }}</p>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">{{ nombreLlave(p) }}</p>
            </div>
            <span class="font-mono font-black text-emerald-700 dark:text-emerald-300 shrink-0">{{ p.marcador }}</span>
          </li>
        </ul>
      </article>
    </div>

    <!-- ================= COLUMNA LATERAL ================= -->
    <aside class="lg:col-span-5 w-full flex flex-col gap-4 min-w-0">
      <!-- Avance de las eliminatorias -->
      <article class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none">
        <header class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Trophy class="w-5 h-5" />
            </span>
            <div>
              <h4 class="text-sm font-black text-slate-900 dark:text-white">Avance de eliminatorias</h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400">
                {{ campeon ? 'Torneo definido' : rondaEnJuego ? `Ronda en juego: ${rondaEnJuego.nombre}` : 'Cuadro por publicar' }}
              </p>
            </div>
          </div>
          <span class="text-xs font-black px-2 py-1 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-500/20 tabular-nums">
            {{ porcentaje }}%
          </span>
        </header>

        <div class="mt-4">
          <div class="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
            <span>Llaves jugadas</span>
            <span class="tabular-nums">{{ jugadas }} de {{ totalLlaves }}</span>
          </div>
          <div class="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div class="h-full rounded-full bg-gradient-to-r from-emerald-500 to-amber-500 transition-all duration-700" :style="{ width: `${porcentaje}%` }"></div>
          </div>
        </div>

        <!-- Rondas -->
        <div class="mt-4 grid gap-2" :style="{ gridTemplateColumns: `repeat(${Math.max(rondas.length, 1)}, minmax(0, 1fr))` }">
          <div
            v-for="r in rondas"
            :key="r.ronda"
            class="rounded-xl border px-2 py-2 text-center"
            :class="rondaEnJuego?.ronda === r.ronda
              ? 'border-amber-400/70 bg-amber-50 dark:bg-amber-950/30 dark:border-amber-700/60'
              : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-900/40'"
          >
            <p class="text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400 truncate">{{ nombreCorto(r.ronda) }}</p>
            <p class="text-sm font-black text-slate-900 dark:text-white tabular-nums">
              {{ r.partidos.filter((p) => p.estado === 'jugado').length }}/{{ r.partidos.length }}
            </p>
          </div>
        </div>

        <div class="mt-4 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 rounded-xl bg-gradient-to-r from-amber-500/10 to-transparent border border-amber-500/20 px-3.5 py-2.5">
          <span class="text-[11px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">Bolsa 100% campeón</span>
          <span class="text-sm font-black text-slate-900 dark:text-white tabular-nums">${{ bolsa }} COP</span>
        </div>

        <div v-if="campeon" class="mt-3 flex items-center gap-3 rounded-xl border border-amber-400/50 bg-amber-50 dark:bg-amber-950/30 px-3.5 py-2.5">
          <AvatarJugador :foto-url="campeon.fotoUrl" :nombre="campeon.nombre" :iniciales="campeon.iniciales" size="md" />
          <div class="min-w-0">
            <p class="text-[10px] font-black uppercase tracking-wider text-amber-700 dark:text-amber-300">Campeón</p>
            <p class="text-sm font-black text-slate-900 dark:text-white truncate">{{ campeon.nombre }}</p>
          </div>
          <Crown class="w-5 h-5 text-amber-500 ml-auto shrink-0" />
        </div>
      </article>

      <!-- Partidos listos / en juego -->
      <article class="rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0f172a] p-5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none">
        <header class="flex items-center justify-between gap-2 mb-3">
          <h4 class="text-sm font-black text-slate-900 dark:text-white">Llaves por jugar</h4>
          <button
            v-if="totalArbitrables > 0"
            type="button"
            class="inline-flex items-center gap-1.5 text-xs font-black px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer"
            @click="emit('arbitrar')"
          >
            <ShieldCheck class="w-3.5 h-3.5" />
            Arbitrar ({{ totalArbitrables }})
          </button>
        </header>

        <p v-if="enJuego.length === 0" class="text-xs text-slate-500 dark:text-slate-400">
          {{ campeon ? 'Todas las llaves están resueltas.' : 'No hay llaves con ambos jugadores definidos en este momento.' }}
        </p>
        <ul v-else class="flex flex-col gap-2">
          <li
            v-for="p in enJuego"
            :key="p.id"
            class="rounded-xl border px-3 py-2.5 flex items-center gap-3"
            :class="p.estado === 'en_curso'
              ? 'border-rose-400/50 bg-rose-50/60 dark:bg-rose-950/20 dark:border-rose-800/60'
              : 'border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/40'"
          >
            <div class="min-w-0 flex-1">
              <p class="text-[10px] font-black uppercase tracking-wide text-slate-500 dark:text-slate-400">{{ nombreLlave(p) }}</p>
              <p class="text-xs font-bold text-slate-900 dark:text-white leading-snug">
                <span :class="p.jugador1?.esUsuarioActual ? 'text-emerald-700 dark:text-emerald-400' : ''">{{ p.jugador1?.nombre }}</span>
                <span class="text-slate-400 font-medium"> vs </span>
                <span :class="p.jugador2?.esUsuarioActual ? 'text-emerald-700 dark:text-emerald-400' : ''">{{ p.jugador2?.nombre }}</span>
              </p>
            </div>
            <span
              v-if="p.estado === 'en_curso'"
              class="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-1 rounded-md bg-rose-500 text-white shrink-0"
            >
              <span class="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
              <template v-if="p.marcadorEnVivo">{{ p.marcadorEnVivo.setsGanadosJ1 }}-{{ p.marcadorEnVivo.setsGanadosJ2 }}</template>
              <template v-else>En vivo</template>
            </span>
            <span v-else class="text-[10px] font-black uppercase px-2 py-1 rounded-md bg-slate-900/5 dark:bg-white/5 text-slate-600 dark:text-slate-300 shrink-0">
              Lista
            </span>
          </li>
        </ul>
      </article>

      <button
        type="button"
        class="group w-full flex items-center justify-between gap-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-[#0f172a] px-5 py-4 text-left hover:border-amber-400/70 dark:hover:border-amber-700/70 transition-colors cursor-pointer shadow-[0_1px_2px_rgba(15,23,42,0.04)] dark:shadow-none"
        @click="emit('ver-cuadro')"
      >
        <span class="flex items-center gap-3">
          <span class="w-9 h-9 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center">
            <Crown class="w-4.5 h-4.5" />
          </span>
          <span>
            <span class="block text-sm font-black text-slate-900 dark:text-white">Ver cuadro completo</span>
            <span class="block text-[11px] text-slate-500 dark:text-slate-400">Todas las llaves hasta la Gran Final</span>
          </span>
        </span>
        <ChevronRight class="w-5 h-5 text-slate-400 group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
      </button>
    </aside>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Crown, Trophy, Clock, Swords, KeyRound, Flag, Check, X, Lock, HelpCircle, ShieldCheck, ChevronRight } from 'lucide-vue-next'
import AvatarJugador from '@/components/AvatarJugador.vue'
import type { FilaPosicion, JugadorTorneo, PartidoPlayoff, RondaPlayoff } from '@/types'
import type { RondaCuadro } from '@/modules/dashboard/composables/usePlayoffs'
import { codigoSeguridadPlayoff, nombreLlavePlayoff } from '@/services/arbitrajePlayoffs'

/**
 * Vista principal de la Fase 2 para el jugador: reemplaza la gráfica de burbujas de la fase de
 * grupos en cuanto el admin abre las eliminatorias. Muestra su próximo partido (con el PIN para
 * el árbitro), su camino al título, el avance del cuadro y las llaves listas para arbitrar.
 */
const props = defineProps<{
  /** Llaves con `esUsuarioActual` marcado (usePlayoffs().partidos). */
  llaves: PartidoPlayoff[]
  rondas: RondaCuadro[]
  campeon: JugadorTorneo | null
  bolsa: string
  esOficial: boolean
  cargando: boolean
  tablaPosiciones: FilaPosicion[]
  clasificados: number
  totalArbitrables: number
}>()

const emit = defineEmits<{
  (e: 'ver-cuadro'): void
  (e: 'arbitrar'): void
}>()

const ORDEN: RondaPlayoff[] = ['play_in', 'cuartos', 'semifinal', 'final']
const NOMBRE_CORTO: Record<RondaPlayoff, string> = {
  play_in: 'Play-In',
  cuartos: 'Cuartos',
  semifinal: 'Semis',
  final: 'Final',
}

const nombreLlave = (p: PartidoPlayoff) => nombreLlavePlayoff(p)
const nombreCorto = (r: RondaPlayoff) => NOMBRE_CORTO[r]

const esMio = (j?: JugadorTorneo | null) => !!j?.esUsuarioActual
const yoEn = (p: PartidoPlayoff) => (esMio(p.jugador1) ? p.jugador1 : p.jugador2) || null
const rivalEn = (p: PartidoPlayoff) => (esMio(p.jugador1) ? p.jugador2 : p.jugador1) || null
const gane = (p: PartidoPlayoff) => !!p.ganadorId && p.ganadorId === yoEn(p)?.id
const ganadorDe = (p: PartidoPlayoff) =>
  (p.ganadorId && (p.jugador1?.id === p.ganadorId ? p.jugador1 : p.jugador2)) || null

const semillaDe = (p: PartidoPlayoff, quien: 'yo' | 'rival') => {
  const soyUno = esMio(p.jugador1)
  const deUno = quien === 'yo' ? soyUno : !soyUno
  return deUno ? p.semilla1 : p.semilla2
}

/** Marcador "2 - 1" visto desde el jugador en sesión. */
const marcadorDesdeMi = (p: PartidoPlayoff) => {
  const m = /^(\d+)\s*-\s*(\d+)/.exec(p.marcador || '')
  if (!m) return p.marcador || ''
  return esMio(p.jugador2) ? `${m[2]} - ${m[1]}` : `${m[1]} - ${m[2]}`
}

const setsVivo = (p: PartidoPlayoff) => {
  const a = p.marcadorEnVivo?.setsGanadosJ1 ?? 0
  const b = p.marcadorEnVivo?.setsGanadosJ2 ?? 0
  return esMio(p.jugador2) ? { mios: b, rival: a } : { mios: a, rival: b }
}

const misLlaves = computed(() =>
  props.llaves
    .filter((p) => esMio(p.jugador1) || esMio(p.jugador2))
    .sort((a, b) => ORDEN.indexOf(a.ronda) - ORDEN.indexOf(b.ronda)),
)

const miPuesto = computed<number | null>(() => {
  const i = props.tablaPosiciones.findIndex((f) => f.esUsuarioActual)
  return i < 0 ? null : props.tablaPosiciones[i]!.posicion || i + 1
})

const llaveActual = computed(() => misLlaves.value.find((p) => p.estado !== 'jugado') || null)
const llaveEliminacion = computed(() => misLlaves.value.find((p) => p.estado === 'jugado' && p.ganadorId && !gane(p)) || null)

type EstadoFase2 = 'cargando' | 'proyeccion' | 'campeon' | 'eliminado' | 'jugando' | 'esperando' | 'no_clasificado' | 'espectador'

const estado = computed<EstadoFase2>(() => {
  if (!props.esOficial) return props.cargando ? 'cargando' : 'proyeccion'
  if (props.campeon?.esUsuarioActual) return 'campeon'
  if (llaveEliminacion.value) return 'eliminado'
  if (llaveActual.value) return rivalEn(llaveActual.value)?.id ? 'jugando' : 'esperando'
  if (miPuesto.value !== null) return 'no_clasificado'
  return 'espectador'
})

/** Llave anterior cuyo ganador ocupa el hueco vacío de mi llave actual. */
const llaveAlimentadora = computed(() => {
  const actual = llaveActual.value
  if (!actual) return null
  const slotVacio = actual.jugador1?.id ? 2 : 1
  return props.llaves.find((p) => p.siguientePartidoId === actual.id && (p.siguienteSlot ?? 1) === slotVacio) || null
})

const miPin = computed(() => {
  const p = llaveActual.value
  if (!p || estado.value !== 'jugando') return null
  const yo = yoEn(p)
  const rival = rivalEn(p)
  if (!yo?.id || !rival?.id) return null
  return codigoSeguridadPlayoff(p.id, yo.id, rival.id)
})

type TipoPaso = 'ganada' | 'perdida' | 'actual' | 'futura' | 'bloqueada'

const camino = computed(() => {
  const primera = misLlaves.value[0]
  if (!primera) return []
  const desde = props.rondas.findIndex((r) => r.ronda === primera.ronda)
  if (desde < 0) return []
  const rondaEliminacion = llaveEliminacion.value ? ORDEN.indexOf(llaveEliminacion.value.ronda) : Infinity
  return props.rondas.slice(desde).map((r) => {
    const llave = misLlaves.value.find((p) => p.ronda === r.ronda) || null
    let tipo: TipoPaso
    if (llave?.estado === 'jugado') tipo = gane(llave) ? 'ganada' : 'perdida'
    else if (llave) tipo = 'actual'
    else tipo = ORDEN.indexOf(r.ronda) > rondaEliminacion ? 'bloqueada' : 'futura'
    return { ronda: r.ronda, nombre: r.nombre, llave, tipo, rival: llave ? rivalEn(llave) : null }
  })
})

const victoriasCamino = computed(() => camino.value.filter((p) => p.tipo === 'ganada').length)

const clasePaso = (tipo: TipoPaso) => {
  switch (tipo) {
    case 'ganada':
      return 'bg-emerald-500 border-emerald-500 text-white'
    case 'perdida':
      return 'bg-rose-500 border-rose-500 text-white'
    case 'actual':
      return 'bg-amber-400 border-amber-400 text-slate-950 shadow-[0_0_0_4px_rgba(245,158,11,0.18)]'
    case 'bloqueada':
      return 'bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
    default:
      return 'bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400'
  }
}

const totalLlaves = computed(() => props.llaves.length)
const jugadas = computed(() => props.llaves.filter((p) => p.estado === 'jugado').length)
const porcentaje = computed(() => (totalLlaves.value ? Math.round((jugadas.value / totalLlaves.value) * 100) : 0))
const rondaEnJuego = computed(() =>
  props.esOficial ? props.rondas.find((r) => r.partidos.some((p) => p.estado !== 'jugado')) || null : null,
)

const enJuego = computed(() =>
  props.llaves
    .filter((p) => p.estado !== 'jugado' && p.jugador1?.id && p.jugador2?.id)
    .sort(
      (a, b) =>
        Number(b.estado === 'en_curso') - Number(a.estado === 'en_curso') ||
        ORDEN.indexOf(a.ronda) - ORDEN.indexOf(b.ronda) ||
        a.numeroLlave - b.numeroLlave,
    ),
)

const recientes = computed(() =>
  props.llaves
    .filter((p) => p.estado === 'jugado')
    .sort((a, b) => (b.actualizadoEn || 0) - (a.actualizadoEn || 0))
    .slice(0, 4),
)

const claseHero = computed(() => {
  switch (estado.value) {
    case 'campeon':
      return 'border-amber-300 dark:border-amber-700/60 bg-gradient-to-br from-amber-50 via-white to-amber-100/60 dark:from-amber-950/40 dark:via-[#0f172a] dark:to-[#0f172a]'
    case 'eliminado':
      return 'border-slate-200 dark:border-slate-800 bg-gradient-to-br from-slate-50 via-white to-rose-50/50 dark:from-[#0f172a] dark:via-[#0f172a] dark:to-rose-950/20'
    default:
      return 'border-amber-200/80 dark:border-slate-800 bg-gradient-to-br from-white via-white to-amber-50/70 dark:from-[#0f172a] dark:via-[#0f172a] dark:to-amber-950/20'
  }
})

const claseResplandor = computed(() =>
  estado.value === 'eliminado' ? 'bg-rose-300/30 dark:bg-rose-500/20' : 'bg-amber-300/40 dark:bg-amber-500/20',
)
</script>

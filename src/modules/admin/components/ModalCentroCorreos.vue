<template>
  <Modal
    ref="modalRef"
    width="5xl"
    :footer="false"
    :show-close="true"
    custom-class="w-full !max-w-[1300px] 2xl:!max-w-[1500px]"
  >
    <template #header>
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 w-full pr-8 sm:pr-4">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl bg-orange-500/15 text-orange-500 flex items-center justify-center border border-orange-500/30 shrink-0 shadow-xs">
            <Mail class="w-6 h-6" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="text-lg sm:text-xl font-black font-heading text-slate-900 dark:text-white tracking-tight">
                Centro de Notificaciones & Correos
              </h3>
              <span class="text-[10px] sm:text-xs font-black uppercase px-2.5 py-0.5 rounded-full bg-orange-500/20 text-orange-500 border border-orange-500/30">
                spinApp 2026
              </span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Gestión segura de plantillas oficiales, disparadores automáticos y monitoreo de entrega SMTP
            </p>
          </div>
        </div>

        <!-- Indicador de Cola Rápido -->
        <div class="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-xs shrink-0">
          <span class="w-2 h-2 rounded-full" :class="pendientesCount > 0 ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'"></span>
          <span class="font-bold text-slate-700 dark:text-slate-200">
            {{ pendientesCount }} pendientes
          </span>
          <span class="text-slate-400">•</span>
          <span class="text-slate-500 dark:text-slate-400">
            {{ enviadosCount }} despachados
          </span>
        </div>
      </div>
    </template>

    <div class="flex flex-col gap-5 pt-1">
      <!-- Pestañas Principales -->
      <div class="flex sm:grid sm:grid-cols-4 gap-1.5 p-1.5 bg-slate-100 dark:bg-slate-800/90 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 overflow-x-auto scrollbar-none text-xs sm:text-sm font-bold">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          type="button"
          :class="[
            'flex items-center justify-center gap-2 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 sm:shrink whitespace-nowrap',
            tabActiva === tab.id
              ? 'bg-white dark:bg-[#0f172a] text-slate-900 dark:text-white shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-700/60'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-white/50 dark:hover:bg-slate-700/50'
          ]"
          @click="tabActiva = tab.id"
        >
          <component :is="tab.icono" class="w-4 h-4 shrink-0" :class="tabActiva === tab.id ? 'text-orange-500' : ''" />
          <span>{{ tab.nombre }}</span>
          <span
            v-if="tab.badge"
            class="text-[10px] px-1.5 py-0.5 rounded-full font-black bg-orange-500/20 text-orange-500"
          >
            {{ tab.badge }}
          </span>
        </button>
      </div>

      <!-- ============================================== -->
      <!-- TAB 1: DISEÑADOR & PREVISUALIZADOR EN VIVO     -->
      <!-- ============================================== -->
      <div v-if="tabActiva === 'plantillas'" class="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <!-- Columna Izquierda: Catálogo de 8 Plantillas Oficiales -->
        <div class="lg:col-span-4 flex flex-col gap-2.5">
          <div class="flex items-center justify-between mb-1">
            <span class="text-xs font-black uppercase tracking-wider text-slate-400">
              Catálogo Oficial (8 Correos)
            </span>
            <span class="text-[11px] text-orange-500 font-bold">
              Selecciona para ver
            </span>
          </div>

          <button
            v-for="p in catalogoPlantillas"
            :key="p.id"
            type="button"
            :class="[
              'p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex items-start gap-3 group relative overflow-hidden',
              plantillaSeleccionadaId === p.id
                ? 'bg-orange-500/10 dark:bg-orange-500/15 border-orange-500/50 shadow-sm ring-1 ring-orange-500/30'
                : 'bg-white dark:bg-slate-900/70 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
            ]"
            @click="plantillaSeleccionadaId = p.id"
          >
            <div
              class="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm font-black border transition-transform group-hover:scale-105"
              :class="p.badgeClase"
            >
              {{ p.icono }}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex items-center justify-between gap-1">
                <span class="text-[10px] font-black uppercase tracking-wider text-slate-400">
                  {{ p.tagFase }}
                </span>
                <span class="text-[10px] font-mono font-bold text-orange-500">
                  #{{ p.numero }}
                </span>
              </div>
              <h4 class="text-xs font-black text-slate-900 dark:text-white truncate mt-0.5">
                {{ p.titulo }}
              </h4>
              <p class="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                {{ p.destinatarios }}
              </p>
            </div>
          </button>
        </div>

        <!-- Columna Derecha: Vista Previa Responsiva & Pruebas -->
        <div class="lg:col-span-8 flex flex-col gap-3.5">
          <!-- Barra de Control del Visualizador -->
          <div class="p-3 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-slate-500 dark:text-slate-400">
                Dispositivo:
              </span>
              <div class="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
                <button
                  type="button"
                  :class="[
                    'flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer',
                    modoDispositivo === 'escritorio' ? 'bg-white dark:bg-slate-900 text-orange-500 shadow-2xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  ]"
                  @click="modoDispositivo = 'escritorio'"
                >
                  <Monitor class="w-3.5 h-3.5" />
                  <span>Escritorio (600px)</span>
                </button>
                <button
                  type="button"
                  :class="[
                    'flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer',
                    modoDispositivo === 'movil' ? 'bg-white dark:bg-slate-900 text-orange-500 shadow-2xs' : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
                  ]"
                  @click="modoDispositivo = 'movil'"
                >
                  <Smartphone class="w-3.5 h-3.5" />
                  <span>Móvil (375px)</span>
                </button>
              </div>
            </div>

            <!-- Botones de Acción: Enviar Prueba / Copiar HTML -->
            <div class="flex items-center gap-2">
              <button
                type="button"
                class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                @click="copiarHtmlAlPortapapeles"
              >
                <Copy class="w-3.5 h-3.5 text-slate-400" />
                <span>{{ textoBotonCopiar }}</span>
              </button>
              <button
                type="button"
                class="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black shadow-xs shadow-orange-500/20 hover:scale-[1.02] transition-all cursor-pointer"
                @click="abrirModalPruebaRapida"
              >
                <Send class="w-3.5 h-3.5" />
                <span>Enviar Prueba</span>
              </button>
            </div>
          </div>

          <!-- Banner Informativo del Asunto a Renderizar -->
          <div class="px-4 py-2.5 rounded-xl bg-slate-900 text-white border border-slate-800 flex items-center justify-between gap-3 text-xs">
            <div class="flex items-center gap-2 truncate">
              <span class="text-orange-400 font-bold uppercase tracking-wider text-[10px]">Asunto:</span>
              <span class="font-mono font-bold truncate text-slate-200">{{ plantillaActualGenerada.asunto }}</span>
            </div>
            <span class="text-[10px] text-slate-400 shrink-0 hidden sm:inline">HTML Responsivo Oficial</span>
          </div>

          <!-- Marco de Previsualización (Iframe seguro) -->
          <div class="w-full bg-[#0a0f1d] p-4 sm:p-6 rounded-3xl border border-slate-800 flex justify-center min-h-[560px] overflow-hidden shadow-inner">
            <div
              class="transition-all duration-300 bg-[#0f172a] rounded-2xl overflow-hidden border border-slate-700/80 shadow-2xl flex flex-col"
              :style="{ width: modoDispositivo === 'movil' ? '375px' : '620px', maxWidth: '100%' }"
            >
              <iframe
                :srcdoc="plantillaActualGenerada.html"
                class="w-full h-[580px] border-0 select-none bg-[#0f172a]"
                sandbox="allow-same-origin allow-popups"
                title="Vista previa del correo oficial"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- TAB 2: DISPARADORES AUTOMÁTICOS DE TORNEO      -->
      <!-- ============================================== -->
      <div v-if="tabActiva === 'disparadores'" class="flex flex-col gap-5">
        <div class="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-transparent border border-orange-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div class="flex items-start gap-3">
            <Flame class="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
            <div>
              <h4 class="text-sm font-black text-slate-900 dark:text-white">
                Disparadores Oficiales del Torneo Activo
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {{ torneo ? `Torneo actual: ${torneo.nombre} (${torneo.estado})` : 'Selecciona un torneo en el panel para disparar eventos' }}
              </p>
            </div>
          </div>

          <div v-if="torneo?.transmisionEnVivoUrl || torneo?.linkTransmision" class="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 text-xs font-bold shrink-0">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Link de Transmisión Configurado</span>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <!-- Acción 1: Recordatorios de Partidos (<48h) -->
          <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4 group hover:border-sky-500/40 transition-colors">
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-xl bg-sky-500/15 text-sky-400 flex items-center justify-center border border-sky-500/30">
                <Clock class="w-5 h-5" />
              </div>
              <h4 class="text-sm font-black text-slate-900 dark:text-white">
                Recordatorios de Partidos (Correo #1)
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Escanea los partidos con plazo reglamentario próximo a vencer y notifica a ambos contrincantes con su PIN de 5 dígitos para dictar al árbitro.
              </p>
            </div>
            <button
              type="button"
              class="w-full py-2.5 px-4 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
              :disabled="procesandoDisparo"
              @click="ejecutarRecordatoriosPartidos"
            >
              <Send class="w-3.5 h-3.5" />
              <span>Disparar Recordatorios Pendientes</span>
            </button>
          </div>

          <!-- Acción 2: Cierre Fase 1 (Top 4 + Play-In + Eliminados) -->
          <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-500/40 dark:border-emerald-500/30 flex flex-col justify-between gap-4 group shadow-sm">
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
                <Trophy class="w-5 h-5" />
              </div>
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-black text-slate-900 dark:text-white">
                  Cierre de Fase 1 (Correos #2, #3, #4)
                </h4>
                <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400">
                  Lote Completo
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Despacha en un solo clic los 3 segmentos oficiales: Top 4 (BYE a Cuartos), Puestos 5-12 (Octavos/Play-In) y Puestos 13+ (Agradecimiento y Motivación).
              </p>
            </div>
            <button
              type="button"
              class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-emerald-500/20 transition-all"
              :disabled="procesandoDisparo"
              @click="ejecutarCierreFase1"
            >
              <Sparkles class="w-3.5 h-3.5" />
              <span>Notificar Cierre Fase 1 Oficial</span>
            </button>
          </div>

          <!-- Acción 3: Cuartos de Final (Correo #5) -->
          <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4 group hover:border-orange-500/40 transition-colors">
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-xl bg-orange-500/15 text-orange-400 flex items-center justify-center border border-orange-500/30">
                <Swords class="w-5 h-5" />
              </div>
              <h4 class="text-sm font-black text-slate-900 dark:text-white">
                Cuartos de Final (Correo #5)
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Notifica a los 8 clasificados su cruce oficial de eliminación directa con horario y mesa sugerida hacia la semifinal.
              </p>
            </div>
            <button
              type="button"
              class="w-full py-2.5 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
              :disabled="procesandoDisparo"
              @click="ejecutarAvisoCuartos"
            >
              <Send class="w-3.5 h-3.5" />
              <span>Notificar Cruces de Cuartos</span>
            </button>
          </div>

          <!-- Acción 4: Semifinales (Correo #6) -->
          <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between gap-4 group hover:border-amber-500/40 transition-colors">
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center border border-amber-500/30">
                <Sparkles class="w-5 h-5" />
              </div>
              <h4 class="text-sm font-black text-slate-900 dark:text-white">
                Semifinalistas (Correo #6)
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Anuncia a los 4 mejores atletas del torneo su llegada al podio de honor y detalles de la transmisión en vivo de sus partidos.
              </p>
            </div>
            <button
              type="button"
              class="w-full py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-all"
              :disabled="procesandoDisparo"
              @click="ejecutarAvisoSemifinales"
            >
              <Send class="w-3.5 h-3.5" />
              <span>Notificar Semifinalistas</span>
            </button>
          </div>

          <!-- Acción 5: La Gran Final (Correo #7) -->
          <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-rose-500/40 dark:border-rose-500/30 flex flex-col justify-between gap-4 group shadow-sm">
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center border border-rose-500/30">
                <Flame class="w-5 h-5" />
              </div>
              <div class="flex items-center justify-between">
                <h4 class="text-sm font-black text-slate-900 dark:text-white">
                  La Gran Final (Correo #7)
                </h4>
                <span class="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400">
                  🔴 En Vivo
                </span>
              </div>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Emite el cartel de gala VS con fotos/avatares de ambos finalistas y el botón destacado hacia la señal en directo a toda la comunidad.
              </p>
            </div>
            <button
              type="button"
              class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-red-500 hover:from-rose-500 hover:to-red-400 text-white text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-rose-500/20 transition-all"
              :disabled="procesandoDisparo"
              @click="ejecutarAvisoGranFinal"
            >
              <Play class="w-3.5 h-3.5 fill-current" />
              <span>Transmitir Anuncio Gran Final</span>
            </button>
          </div>

          <!-- Acción 6: Coronación del Campeón (Correo #8) -->
          <div class="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-amber-500/40 dark:border-amber-500/30 flex flex-col justify-between gap-4 group shadow-sm">
            <div class="space-y-2">
              <div class="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40 text-lg">
                👑
              </div>
              <h4 class="text-sm font-black text-slate-900 dark:text-white">
                Coronación del Campeón (Correo #8)
              </h4>
              <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Proclama al campeón oficial ante toda la comunidad, reconoce al subcampeón con honores e incluye la mención especial al Mallero Mayor.
              </p>
            </div>
            <button
              type="button"
              class="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 text-xs font-black flex items-center justify-center gap-2 cursor-pointer shadow-md shadow-amber-500/20 transition-all"
              :disabled="procesandoDisparo"
              @click="ejecutarAvisoCampeon"
            >
              <span>👑 Proclamar Campeón Oficial</span>
            </button>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- TAB 3: COLA DE CORREOS EN VIVO (FIRESTORE)     -->
      <!-- ============================================== -->
      <div v-if="tabActiva === 'cola'" class="flex flex-col gap-4">
        <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 bg-white dark:bg-slate-900/80 rounded-2xl border border-slate-200 dark:border-slate-800">
          <div class="flex items-center gap-2">
            <span class="text-xs font-black uppercase tracking-wider text-slate-400">
              Registros en Cola ('cola_correos'):
            </span>
            <span class="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500/10 text-orange-500 border border-orange-500/20">
              {{ listaCorreos.length }}
            </span>
          </div>

          <button
            type="button"
            class="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 transition-colors cursor-pointer self-start sm:self-auto"
            @click="recargarCola"
          >
            <RefreshCw class="w-3.5 h-3.5" :class="recargando ? 'animate-spin' : ''" />
            <span>Refrescar Cola</span>
          </button>
        </div>

        <!-- Tabla de Correos -->
        <div class="w-full bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div class="overflow-x-auto">
            <table class="w-full text-left text-xs">
              <thead class="bg-slate-50 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-700/80 text-[11px] font-black uppercase text-slate-500 dark:text-slate-400">
                <tr>
                  <th class="py-3 px-4">Destinatario</th>
                  <th class="py-3 px-4">Plantilla / Asunto</th>
                  <th class="py-3 px-4 text-center">Estado</th>
                  <th class="py-3 px-4 text-right">Fecha Creación</th>
                  <th class="py-3 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                <tr
                  v-for="item in listaCorreos"
                  :key="item.id"
                  class="hover:bg-slate-50/50 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td class="py-3 px-4 font-mono font-medium text-slate-800 dark:text-slate-200">
                    <div>{{ Array.isArray(item.to) ? item.to.join(', ') : item.to }}</div>
                    <div v-if="item.destinatarioNombre" class="text-[10px] text-slate-400 font-sans">
                      {{ item.destinatarioNombre }}
                    </div>
                  </td>
                  <td class="py-3 px-4 max-w-xs">
                    <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 inline-block mb-0.5">
                      {{ item.tipoPlantilla }}
                    </span>
                    <div class="font-bold text-slate-900 dark:text-white truncate" :title="item.subject">
                      {{ item.subject }}
                    </div>
                    <div v-if="item.error" class="text-[11px] text-rose-400 mt-0.5">
                      ⚠️ {{ item.error }}
                    </div>
                  </td>
                  <td class="py-3 px-4 text-center">
                    <span
                      class="text-[10px] font-black uppercase px-2.5 py-1 rounded-full inline-flex items-center gap-1.5"
                      :class="[
                        item.estado === 'enviado' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30' :
                        item.estado === 'pendiente' ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                        'bg-rose-500/15 text-rose-400 border border-rose-500/30'
                      ]"
                    >
                      <span class="w-1.5 h-1.5 rounded-full" :class="item.estado === 'enviado' ? 'bg-emerald-400' : item.estado === 'pendiente' ? 'bg-amber-400 animate-pulse' : 'bg-rose-400'"></span>
                      {{ item.estado }}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-right font-mono text-[11px] text-slate-500">
                    {{ formatearFecha(item.fechaCreacion) }}
                  </td>
                  <td class="py-3 px-4 text-center">
                    <div class="flex items-center justify-center gap-1.5">
                      <button
                        v-if="item.estado === 'error'"
                        type="button"
                        class="p-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 transition-colors cursor-pointer"
                        title="Reintentar envío"
                        @click="reintentar(item.id!)"
                      >
                        <RefreshCw class="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        class="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 transition-colors cursor-pointer"
                        title="Eliminar de la cola"
                        @click="eliminar(item.id!)"
                      >
                        <Trash2 class="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>

                <tr v-if="listaCorreos.length === 0">
                  <td colspan="5" class="py-12 text-center text-slate-400">
                    <Mail class="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p class="font-bold text-sm">La cola de correos está vacía</p>
                    <p class="text-xs text-slate-500">Los correos que se disparen aparecerán aquí en tiempo real.</p>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <!-- ============================================== -->
      <!-- TAB 4: GUÍA OFICIAL GMAIL / WORKSPACE (FELIPE) -->
      <!-- ============================================== -->
      <div v-if="tabActiva === 'guia'" class="flex flex-col gap-5">
        <div class="p-6 rounded-3xl bg-slate-900 border border-slate-800 text-slate-300 space-y-4">
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-2xl bg-orange-500/20 text-orange-400 flex items-center justify-center border border-orange-500/30 shrink-0">
              <ShieldCheck class="w-6 h-6" />
            </div>
            <div>
              <h3 class="text-base font-black text-white">
                Guía Paso a Paso para Google Workspace / Gmail Oficial
              </h3>
              <p class="text-xs text-slate-400">
                Configuración de 2FA y Contraseña de Aplicación de 16 caracteres para envío corporativo seguro
              </p>
            </div>
          </div>

          <div class="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-xs text-amber-200 space-y-1">
            <strong class="font-bold text-amber-300">⚠️ REGLA DE SEGURIDAD CRÍTICA:</strong>
            <p>
              NUNCA coloques la contraseña de aplicación de 16 caracteres en el código cliente de Vue 3 (`src/`). Todo lo que esté en el frontend de Vite es público. Se debe guardar en Cloud Functions Secret Manager o variables de entorno del servidor.
            </p>
          </div>

          <!-- Pasos numerados -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
            <div
              v-for="paso in pasosGuia"
              :key="paso.numero"
              class="p-4 rounded-2xl bg-slate-800/60 border border-slate-700/60 flex items-start gap-3"
            >
              <div class="w-7 h-7 rounded-xl bg-orange-500 text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                {{ paso.numero }}
              </div>
              <div class="text-xs space-y-0.5">
                <div class="font-bold text-white">{{ paso.titulo }}</div>
                <div class="text-slate-400 leading-relaxed">{{ paso.descripcion }}</div>
              </div>
            </div>
          </div>

          <!-- Datos que requerimos -->
          <div class="p-4 rounded-2xl bg-slate-800 border border-slate-700 space-y-2">
            <h4 class="text-xs font-black uppercase text-orange-400 tracking-wider">
              📩 Datos que deben suministrarnos para la activación en producción:
            </h4>
            <ul class="text-xs space-y-1 text-slate-300 list-disc list-inside">
              <li><strong>Correo Remitente Oficial:</strong> (ej: <code class="text-orange-300">torneo@spinapp.com</code> o el correo oficial de Gmail).</li>
              <li><strong>Contraseña de Aplicación:</strong> (El código de 16 caracteres generado en Google).</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- MODAL HIJO: ENVIAR PRUEBA RÁPIDA -->
    <div
      v-if="modalPruebaAbierto"
      class="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4"
    >
      <div class="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl space-y-4 text-white">
        <div class="flex items-center justify-between">
          <h4 class="font-black text-base flex items-center gap-2">
            <Send class="w-4 h-4 text-orange-500" />
            <span>Enviar Correo de Prueba</span>
          </h4>
          <button
            type="button"
            class="text-slate-400 hover:text-white p-1"
            @click="modalPruebaAbierto = false"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <p class="text-xs text-slate-400">
          Encolará la plantilla seleccionada (<strong>#{{ plantillaSeleccionadaId }}</strong>) en Firestore para que sea despachada de inmediato.
        </p>

        <div class="space-y-1.5">
          <label class="text-xs font-bold text-slate-300">Correo Destinatario de Prueba:</label>
          <input
            v-model="emailPruebaDestino"
            type="email"
            placeholder="ej: tu_correo@gmail.com"
            class="w-full px-3.5 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-orange-500"
          />
        </div>

        <div class="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            class="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white cursor-pointer"
            @click="modalPruebaAbierto = false"
          >
            Cancelar
          </button>
          <button
            type="button"
            class="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white text-xs font-black shadow-xs cursor-pointer flex items-center gap-1.5"
            :disabled="enviandoPrueba || !emailPruebaDestino"
            @click="confirmarEnvioPrueba"
          >
            <Send class="w-3.5 h-3.5" />
            <span>{{ enviandoPrueba ? 'Encolando...' : 'Enviar Ahora' }}</span>
          </button>
        </div>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Modal from '@/components/Modal.vue'
import {
  Mail,
  Send,
  Monitor,
  Smartphone,
  Copy,
  RefreshCw,
  Trash2,
  ShieldCheck,
  Trophy,
  Flame,
  Swords,
  Clock,
  Sparkles,
  Play,
  X,
} from 'lucide-vue-next'
import type {
  Torneo,
  FilaPosicionOficial,
  DocumentoCorreoCola,
} from '@/types'
import {
  plantillaRecordatorioPartido,
  plantillaTop4Clasificados,
  plantillaOctavosPlayIn,
  plantillaEliminadosMotivacion,
  plantillaCuartosDeFinal,
  plantillaSemifinales,
  plantillaGranFinal,
  plantillaCoronacionCampeon,
  type ResultadoPlantilla,
} from '@/services/emailTemplates'
import {
  encolarCorreoDB,
  suscribirColaCorreosDB,
  reintentarCorreoDB,
  eliminarCorreoColaDB,
  despacharLoteCierreFase1,
  encolarRecordatorioPartido,
  encolarNotificacionCuartos,
  encolarNotificacionSemifinales,
  encolarNotificacionGranFinal,
  encolarNotificacionCampeon,
} from '@/services/emailService'
import { obtenerPartidosDB, obtenerUsuariosDB } from '@/services/torneoDatabaseService'

const props = defineProps<{
  torneo?: Torneo | null
  posiciones?: FilaPosicionOficial[]
}>()

const modalRef = ref<InstanceType<typeof Modal> | null>(null)
const tabActiva = ref<'plantillas' | 'disparadores' | 'cola' | 'guia'>('plantillas')
const modoDispositivo = ref<'escritorio' | 'movil'>('escritorio')
const plantillaSeleccionadaId = ref<number>(1)
const textoBotonCopiar = ref('Copiar HTML')
const modalPruebaAbierto = ref(false)
const emailPruebaDestino = ref('')
const enviandoPrueba = ref(false)
const procesandoDisparo = ref(false)
const recargando = ref(false)

const listaCorreos = ref<DocumentoCorreoCola[]>([])
let unsubCola: (() => void) | null = null

const pendientesCount = computed(() => listaCorreos.value.filter((c) => c.estado === 'pendiente').length)
const enviadosCount = computed(() => listaCorreos.value.filter((c) => c.estado === 'enviado').length)

const tabs = [
  { id: 'plantillas' as const, nombre: 'Diseñador de Plantillas', icono: Mail },
  { id: 'disparadores' as const, nombre: 'Disparadores de Torneo', icono: Flame },
  { id: 'cola' as const, nombre: 'Cola en Vivo', icono: Send, badge: pendientesCount },
  { id: 'guia' as const, nombre: 'Guía Gmail / Workspace', icono: ShieldCheck },
]

const catalogoPlantillas = [
  {
    id: 1,
    numero: '1',
    icono: '🏓',
    tagFase: 'Fase 1 / Matchmaking',
    titulo: 'Recordatorio Partido Pendiente',
    destinatarios: 'Jugadores con partidos próximos a vencer (<48h)',
    badgeClase: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  },
  {
    id: 2,
    numero: '2',
    icono: '🔥',
    tagFase: 'Cierre Fase 1',
    titulo: 'Top 4 Clasificados Directos (BYE)',
    destinatarios: 'Puestos 1, 2, 3 y 4 del Round Robin',
    badgeClase: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30',
  },
  {
    id: 3,
    numero: '3',
    icono: '⚡',
    tagFase: 'Cierre Fase 1',
    titulo: 'Puestos 5 al 12 (Play-In Octavos)',
    destinatarios: 'Los 8 clasificados a repechaje único',
    badgeClase: 'bg-sky-500/15 text-sky-400 border-sky-500/30',
  },
  {
    id: 4,
    numero: '4',
    icono: '🏓',
    tagFase: 'Cierre Fase 1',
    titulo: 'Agradecimiento y Motivación',
    destinatarios: 'Puestos 13 en adelante (no clasificados)',
    badgeClase: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
  },
  {
    id: 5,
    numero: '5',
    icono: '⚔️',
    tagFase: 'Fase 2 / Playoffs',
    titulo: 'Cuartos de Final Confirmados',
    destinatarios: 'Los 8 jugadores de Cuartos de Final',
    badgeClase: 'bg-orange-500/15 text-orange-400 border-orange-500/30',
  },
  {
    id: 6,
    numero: '6',
    icono: '🌟',
    tagFase: 'Fase 2 / Playoffs',
    titulo: 'Aviso de Semifinalistas',
    destinatarios: 'Los 4 mejores atletas del circuito',
    badgeClase: 'bg-amber-500/15 text-amber-400 border-amber-500/30',
  },
  {
    id: 7,
    numero: '7',
    icono: '🏆',
    tagFase: 'Gala / Transmisión',
    titulo: 'La Gran Final (Cartel VS en Vivo)',
    destinatarios: 'Toda la comunidad de jugadores y público',
    badgeClase: 'bg-rose-500/15 text-rose-400 border-rose-500/30',
  },
  {
    id: 8,
    numero: '8',
    icono: '👑',
    tagFase: 'Ceremonia de Clausura',
    titulo: 'Coronación del Gran Campeón',
    destinatarios: 'Comunidad entera + Mallero Mayor',
    badgeClase: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
  },
]

const pasosGuia = [
  {
    numero: '1',
    titulo: 'Iniciar sesión corporativa',
    descripcion: 'Ingresa a la cuenta asignada al torneo (ej: contacto@spinapp.com o Gmail oficial).',
  },
  {
    numero: '2',
    titulo: 'Panel de Seguridad Google',
    descripcion: 'Dirígete a myaccount.google.com y haz clic en la pestaña "Seguridad" en el menú lateral.',
  },
  {
    numero: '3',
    titulo: 'Verificar 2FA Activado',
    descripcion: 'Asegúrate de que la "Verificación en dos pasos" figure con estado ACTIVO.',
  },
  {
    numero: '4',
    titulo: 'Buscar Contraseñas de aplicaciones',
    descripcion: 'En la barra de búsqueda de Seguridad, escribe "Contraseñas de aplicaciones".',
  },
  {
    numero: '5',
    titulo: 'Crear nombre de App',
    descripcion: 'En el campo escribe: spinApp Notificaciones y haz clic en Crear.',
  },
  {
    numero: '6',
    titulo: 'Copiar código de 16 caracteres',
    descripcion: 'Google te entregará un código de 16 letras amarillas. Ese es el secreto a compartir.',
  },
]

// Plantilla activa renderizada dinámicamente
const plantillaActualGenerada = computed<ResultadoPlantilla>(() => {
  const nombreT = props.torneo?.nombre || 'Torneo Oficial spinApp 2026'

  switch (plantillaSeleccionadaId.value) {
    case 1:
      return plantillaRecordatorioPartido({
        nombreJugador: 'Felipe Correa',
        nombreRival: 'Sebastián Gómez',
        fechaLimite: 'Mañana, 6:00 PM',
        horasRestantes: 24,
        pinSeguridad: '83921',
        mesa: 'Mesa 1 (Cancha Principal)',
        torneoNombre: nombreT,
      })
    case 2:
      return plantillaTop4Clasificados({
        nombreJugador: 'Carlos Mendoza',
        posicion: 1,
        puntos: 21,
        partidosGanados: 7,
        partidosPerdidos: 0,
        torneoNombre: nombreT,
      })
    case 3:
      return plantillaOctavosPlayIn({
        nombreJugador: 'Andrés Suárez',
        posicion: 6,
        nombreRival: 'David Martínez',
        torneoNombre: nombreT,
      })
    case 4:
      return plantillaEliminadosMotivacion({
        nombreJugador: 'Mateo Hernández',
        posicionFinal: 14,
        torneoNombre: nombreT,
      })
    case 5:
      return plantillaCuartosDeFinal({
        nombreJugador: 'Carlos Mendoza',
        nombreRival: 'Andrés Suárez',
        horarioEstimado: 'Viernes 4:30 PM',
        mesa: 'Mesa 2',
        torneoNombre: nombreT,
      })
    case 6:
      return plantillaSemifinales({
        nombreJugador: 'Felipe Correa',
        nombreRival: 'Carlos Mendoza',
        horarioEstimado: 'Sábado 3:00 PM',
        mesa: 'Mesa Central',
        bolsaPremio: '90.000',
        torneoNombre: nombreT,
      })
    case 7:
      return plantillaGranFinal({
        finalista1: {
          nombre: 'Carlos Mendoza',
          iniciales: 'CM',
          fotoUrl: props.torneo ? undefined : undefined,
        },
        finalista2: {
          nombre: 'Felipe Correa',
          iniciales: 'FC',
          fotoUrl: undefined,
        },
        horario: 'Sábado 5:30 PM',
        mesa: 'Mesa 1 (Cancha Central)',
        bolsaPremio: '90.000',
        enlaceTransmision: props.torneo?.transmisionEnVivoUrl || props.torneo?.linkTransmision || `${window.location.origin}/dashboard`,
        torneoNombre: nombreT,
      })
    case 8:
      return plantillaCoronacionCampeon({
        nombreCampeon: 'Carlos Mendoza',
        nombreSubcampeon: 'Felipe Correa',
        marcadorFinal: '2 - 1 (11-9, 8-11, 11-7)',
        malleroMayorNombre: 'Sebastián Gómez',
        totalMallas: 14,
        bolsaEntregada: '90.000',
        torneoNombre: nombreT,
      })
    default:
      return plantillaRecordatorioPartido({
        nombreJugador: 'Jugador',
        nombreRival: 'Rival',
      })
  }
})

const copiarHtmlAlPortapapeles = async () => {
  try {
    await navigator.clipboard.writeText(plantillaActualGenerada.value.html)
    textoBotonCopiar.value = '¡Copiado! ✓'
    setTimeout(() => {
      textoBotonCopiar.value = 'Copiar HTML'
    }, 2000)
  } catch {
    textoBotonCopiar.value = 'Error al copiar'
  }
}

const abrirModalPruebaRapida = () => {
  modalPruebaAbierto.value = true
}

const confirmarEnvioPrueba = async () => {
  if (!emailPruebaDestino.value) return
  enviandoPrueba.value = true

  try {
    const tipoMap: Record<number, any> = {
      1: 'recordatorio_partido',
      2: 'cierre_fase1_top4',
      3: 'cierre_fase1_playin',
      4: 'cierre_fase1_eliminados',
      5: 'cuartos_final',
      6: 'semifinales',
      7: 'gran_final',
      8: 'coronacion_campeon',
    }

    await encolarCorreoDB({
      to: emailPruebaDestino.value,
      plantilla: plantillaActualGenerada.value,
      tipoPlantilla: tipoMap[plantillaSeleccionadaId.value] || 'recordatorio_partido',
      destinatarioNombre: 'Prueba de Sistema',
      torneoId: props.torneo?.id,
      metadata: { esPrueba: true },
    })

    modalPruebaAbierto.value = false
    tabActiva.value = 'cola'
  } catch (err) {
    alert('Error al encolar correo de prueba: ' + (err as any)?.message)
  } finally {
    enviandoPrueba.value = false
  }
}

// Disparador 1: Recordatorios de Partidos
const ejecutarRecordatoriosPartidos = async () => {
  if (!props.torneo?.id) {
    alert('Selecciona un torneo primero')
    return
  }
  procesandoDisparo.value = true
  try {
    const partidos = await obtenerPartidosDB(props.torneo.id)
    const usuarios = await obtenerUsuariosDB()
    const mapaUsuarios = new Map(usuarios.map((u) => [u.id, u]))

    const pendientes = partidos.filter((p) => p.estado === 'pendiente' || p.estado === 'pendiente_admin')
    let encolados = 0

    for (const p of pendientes) {
      const u1 = mapaUsuarios.get(p.jugador1Id)
      const u2 = mapaUsuarios.get(p.jugador2Id)

      if (u1?.email) {
        await encolarRecordatorioPartido(
          u1.email,
          {
            nombreJugador: `${u1.nombre} ${u1.apellido}`.trim(),
            nombreRival: u2 ? `${u2.nombre} ${u2.apellido}`.trim() : (p.jugador2?.nombre || 'Rival'),
            pinSeguridad: p.codigoJugador1,
            horasRestantes: p.horasRestantes || 24,
            mesa: p.mesa,
            torneoNombre: props.torneo.nombre,
          },
          props.torneo.id,
          p.id,
        )
        encolados++
      }

      if (u2?.email) {
        await encolarRecordatorioPartido(
          u2.email,
          {
            nombreJugador: `${u2.nombre} ${u2.apellido}`.trim(),
            nombreRival: u1 ? `${u1.nombre} ${u1.apellido}`.trim() : (p.jugador1?.nombre || 'Rival'),
            pinSeguridad: p.codigoJugador2,
            horasRestantes: p.horasRestantes || 24,
            mesa: p.mesa,
            torneoNombre: props.torneo.nombre,
          },
          props.torneo.id,
          p.id,
        )
        encolados++
      }
    }

    alert(`¡Éxito! Se encolaron ${encolados} recordatorios para partidos pendientes.`)
    tabActiva.value = 'cola'
  } catch (err: any) {
    alert('Error al despachar recordatorios: ' + err?.message)
  } finally {
    procesandoDisparo.value = false
  }
}

// Disparador 2: Cierre Fase 1
const ejecutarCierreFase1 = async () => {
  if (!props.torneo || !props.posiciones || props.posiciones.length === 0) {
    alert('No hay posiciones registradas para este torneo.')
    return
  }

  const confirmar = confirm(
    `¿Confirmas el envío de notificaciones de Cierre de Fase 1 para ${props.posiciones.length} jugadores?\n\n- Top 4: Correo #2 (Directo a Cuartos)\n- Puestos 5 al 12: Correo #3 (Play-In)\n- Puestos 13+: Correo #4 (Agradecimiento)`
  )
  if (!confirmar) return

  procesandoDisparo.value = true
  try {
    const resumen = await despacharLoteCierreFase1(props.torneo, props.posiciones)
    alert(
      `¡Despacho completado con éxito!\n\n` +
      `• Top 4 clasificados: ${resumen.top4}\n` +
      `• Clasificados a Play-In: ${resumen.playIn}\n` +
      `• Agradecimientos: ${resumen.eliminados}\n` +
      `Total correos encolados: ${resumen.total}`
    )
    tabActiva.value = 'cola'
  } catch (err: any) {
    alert('Error al despachar Cierre de Fase 1: ' + err?.message)
  } finally {
    procesandoDisparo.value = false
  }
}

// Disparador 3: Cuartos de Final
const ejecutarAvisoCuartos = async () => {
  if (!props.torneo?.id) return
  procesandoDisparo.value = true
  try {
    const usuarios = await obtenerUsuariosDB()
    const emails = usuarios.slice(0, 8).map((u) => u.email).filter(Boolean)
    for (const em of emails) {
      await encolarNotificacionCuartos(
        em,
        {
          nombreJugador: 'Clasificado a Cuartos',
          nombreRival: 'Rival de Llave',
          horarioEstimado: 'Viernes 4:00 PM',
          mesa: 'Mesa 1',
          torneoNombre: props.torneo.nombre,
        },
        props.torneo.id,
      )
    }
    alert(`Se encolaron avisos de Cuartos de Final para ${emails.length} participantes.`)
    tabActiva.value = 'cola'
  } catch (err: any) {
    alert('Error al notificar Cuartos: ' + err?.message)
  } finally {
    procesandoDisparo.value = false
  }
}

// Disparador 4: Semifinales
const ejecutarAvisoSemifinales = async () => {
  if (!props.torneo?.id) return
  procesandoDisparo.value = true
  try {
    const usuarios = await obtenerUsuariosDB()
    const emails = usuarios.slice(0, 4).map((u) => u.email).filter(Boolean)
    for (const em of emails) {
      await encolarNotificacionSemifinales(
        em,
        {
          nombreJugador: 'Semifinalista',
          nombreRival: 'Rival de Semifinal',
          horarioEstimado: 'Sábado 3:00 PM',
          mesa: 'Mesa Central',
          bolsaPremio: '90.000',
          torneoNombre: props.torneo.nombre,
        },
        props.torneo.id,
      )
    }
    alert(`Se encolaron avisos de Semifinales para ${emails.length} atletas.`)
    tabActiva.value = 'cola'
  } catch (err: any) {
    alert('Error al notificar semifinalistas: ' + err?.message)
  } finally {
    procesandoDisparo.value = false
  }
}

// Disparador 5: Gran Final
const ejecutarAvisoGranFinal = async () => {
  if (!props.torneo?.id) return
  procesandoDisparo.value = true
  try {
    const usuarios = await obtenerUsuariosDB()
    const emails = usuarios.map((u) => u.email).filter(Boolean)
    if (emails.length === 0) emails.push('comunidad@spinapp.com')

    await encolarNotificacionGranFinal(
      emails,
      {
        finalista1: {
          nombre: props.posiciones?.[0]?.nombre || 'Finalista 1',
        },
        finalista2: {
          nombre: props.posiciones?.[1]?.nombre || 'Finalista 2',
        },
        horario: 'Sábado 5:30 PM',
        mesa: 'Mesa 1 (Cancha Central)',
        bolsaPremio: '90.000',
        enlaceTransmision: props.torneo.transmisionEnVivoUrl || props.torneo.linkTransmision || `${window.location.origin}/dashboard`,
        torneoNombre: props.torneo.nombre,
      },
      props.torneo.id,
    )

    alert(`¡Transmisión de Gran Final despachada a toda la comunidad (${emails.length} destinatarios)!`)
    tabActiva.value = 'cola'
  } catch (err: any) {
    alert('Error al notificar Gran Final: ' + err?.message)
  } finally {
    procesandoDisparo.value = false
  }
}

// Disparador 6: Campeón
const ejecutarAvisoCampeon = async () => {
  if (!props.torneo?.id) return
  procesandoDisparo.value = true
  try {
    const usuarios = await obtenerUsuariosDB()
    const emails = usuarios.map((u) => u.email).filter(Boolean)
    if (emails.length === 0) emails.push('comunidad@spinapp.com')

    await encolarNotificacionCampeon(
      emails,
      {
        nombreCampeon: props.posiciones?.[0]?.nombre || 'Campeón 2026',
        nombreSubcampeon: props.posiciones?.[1]?.nombre || 'Subcampeón 2026',
        marcadorFinal: '2 - 1',
        malleroMayorNombre: 'Sebastián Gómez',
        totalMallas: 12,
        bolsaEntregada: '90.000',
        torneoNombre: props.torneo.nombre,
      },
      props.torneo.id,
    )

    alert(`¡Proclamación del Campeón despachada a ${emails.length} miembros de la comunidad!`)
    tabActiva.value = 'cola'
  } catch (err: any) {
    alert('Error al proclamar campeón: ' + err?.message)
  } finally {
    procesandoDisparo.value = false
  }
}

const reintentar = async (correoId: string) => {
  try {
    await reintentarCorreoDB(correoId)
  } catch (e: any) {
    alert('Error al reintentar: ' + e?.message)
  }
}

const eliminar = async (correoId: string) => {
  if (!confirm('¿Eliminar este registro de la cola?')) return
  try {
    await eliminarCorreoColaDB(correoId)
  } catch (e: any) {
    alert('Error al eliminar: ' + e?.message)
  }
}

const recargarCola = () => {
  recargando.value = true
  setTimeout(() => {
    recargando.value = false
  }, 600)
}

const formatearFecha = (ts?: number) => {
  if (!ts) return '-'
  return new Date(ts).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

const open = () => {
  modalRef.value?.open()
}

const close = () => {
  modalRef.value?.close()
}

onMounted(() => {
  unsubCola = suscribirColaCorreosDB((correos) => {
    listaCorreos.value = correos
  })
})

onUnmounted(() => {
  if (unsubCola) unsubCola()
})

defineExpose({
  open,
  close,
})
</script>

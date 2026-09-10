<template>
  <Modal
    v-model="modalReglamentoVisible"
    width="3xl"
    :footer="false"
    :show-close="true"
    custom-class="w-full !max-w-[840px] 2xl:!max-w-[920px]"
  >
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center border border-orange-500/20 shrink-0">
          <BookOpen class="w-5 h-5 text-orange-500" />
        </div>
        <div class="min-w-0">
          <h3 class="text-base sm:text-xl font-extrabold font-heading text-slate-900 dark:text-white tracking-tight truncate">
            Reglamento Oficial de Tenis de Mesa
          </h3>
          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">
            Normativa técnica adaptada para el Torneo SpinApp en Zona Hunters
          </p>
        </div>
      </div>
    </template>

    <div class="space-y-4 py-1">
      <!-- Explicación Didáctica ITTF -->
      <div class="p-4 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 border border-orange-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div class="flex items-start gap-3">
          <div class="w-8 h-8 rounded-lg bg-orange-600 text-white flex items-center justify-center font-black text-xs shrink-0 mt-0.5 shadow-xs">
            ITTF
          </div>
          <div>
            <h4 class="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
              ¿Qué es la ITTF?
            </h4>
            <p class="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
              <strong>ITTF</strong> son las siglas de la <strong>International Table Tennis Federation</strong> (Federación Internacional de Tenis de Mesa), fundada en 1926. Es el organismo mundial que dicta los estándares oficiales de juego, arbitraje y equipamiento.
            </p>
          </div>
        </div>
      </div>

      <!-- Grid de Reglas del Torneo -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <!-- 1. Contacto en Mesa -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
          <div class="flex items-center gap-2 text-red-600 dark:text-red-400">
            <Ban class="w-4 h-4 shrink-0" />
            <h5 class="text-xs font-black uppercase tracking-wider">1. Contacto con la Mesa</h5>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            <strong class="text-red-600 dark:text-red-400">Prohibido:</strong> No se puede tocar la mesa con la <em>mano libre</em> (la mano que no sostiene la raqueta) ni apoyar el cuerpo para mover la mesa durante la jugada. Hacerlo otorga un punto directo al rival.
          </p>
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <strong class="text-emerald-600 dark:text-emerald-400">Permitido:</strong> Solo la mano portadora que sostiene la raqueta o la raqueta misma pueden hacer contacto fortuito en el juego.
          </p>
        </div>

        <!-- 2. Servicio Libre y Visibilidad -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
          <div class="flex items-center gap-2 text-sky-600 dark:text-sky-400">
            <Zap class="w-4 h-4 shrink-0" />
            <h5 class="text-xs font-black uppercase tracking-wider">2. Servicio (Saque Libre)</h5>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            En nuestro torneo el <strong>saque es de modalidad libre</strong>. Sin embargo, la pelota debe reposar sobre la palma abierta e inmóvil antes del saque.
          </p>
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <strong class="text-sky-600 dark:text-sky-400">Visibilidad:</strong> La pelota debe permanecer <strong>siempre visible</strong> para el oponente. Está prohibido ocultar la bola con el cuerpo, el brazo o la ropa al momento del saque.
          </p>
        </div>

        <!-- 3. Raquetas y Equipamiento -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
          <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <Target class="w-4 h-4 shrink-0" />
            <h5 class="text-xs font-black uppercase tracking-wider">3. Raquetas y Paletas</h5>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Está permitido utilizar las <strong>raquetas planas recreativas de Campus</strong> o raquetas profesionales más gruesas y de mayor calidad.
          </p>
          <p class="text-xs text-slate-600 dark:text-slate-400 leading-relaxed pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            La superficie debe estar plana y firme sin alteraciones que desvíen la bola de forma irregular.
          </p>
        </div>

        <!-- 4. Formato de Partido -->
        <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-2">
          <div class="flex items-center gap-2 text-amber-600 dark:text-amber-400">
            <Trophy class="w-4 h-4 shrink-0" />
            <h5 class="text-xs font-black uppercase tracking-wider">4. Formato: Mejor de 3 Sets</h5>
          </div>
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Los partidos se disputan al <strong>mejor de 3 sets</strong>. El primer jugador en alcanzar <strong>11 puntos</strong> gana el set (con diferencia de 2 puntos si hay empate 10-10).
          </p>
          <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
            <strong class="text-amber-600 dark:text-amber-400">Desempate:</strong> Si empatan 1-1 en sets, se jugará un 3er set decisivo a 11 puntos.
          </p>
        </div>
      </div>

      <!-- 5. Sede y Sistema de Arbitraje -->
      <div class="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/60 space-y-3">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2 text-indigo-600 dark:text-indigo-400">
            <MapPin class="w-4 h-4 shrink-0" />
            <h5 class="text-xs font-black uppercase tracking-wider">5. Sede Oficial: Zona Hunters</h5>
          </div>
          <span class="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            Mesas Oficiales
          </span>
        </div>
        <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
          Todos los partidos del torneo se jugarán de forma presencial en las mesas ubicadas en la <strong>Zona Hunters</strong>.
        </p>

        <div class="pt-2 border-t border-slate-200/80 dark:border-slate-700 space-y-2">
          <div class="flex items-center gap-2 text-emerald-600 dark:text-emerald-400">
            <ShieldCheck class="w-4 h-4 shrink-0" />
            <h5 class="text-xs font-black uppercase tracking-wider">6. Arbitraje y PINs de Seguridad</h5>
          </div>
          <ul class="text-xs text-slate-600 dark:text-slate-300 space-y-1.5 list-disc list-inside">
            <li><strong>¿Quién arbitra?</strong> Cualquier participante registrado en el torneo que no dispute el partido activo de la jornada.</li>
            <li><strong>Validación con PINs:</strong> Para iniciar el marcador en vivo, el árbitro solicita el <strong>PIN de 5 dígitos</strong> de cada rival para abrir la mesa.</li>
            <li><strong>Marcador Digital:</strong> El árbitro anota cada punto en el Marcador Virtual de la app, actualizando automáticamente sets y posiciones.</li>
          </ul>
        </div>
      </div>

      <!-- Footer Botón de Entendido -->
      <div class="flex justify-end pt-2">
        <Button variant="emerald" size="md" class="font-bold cursor-pointer" @click="cerrarReglamento">
          <CheckCircle2 class="w-4 h-4 mr-1.5" />
          <span>Comprendo el Reglamento</span>
        </Button>
      </div>
    </div>
  </Modal>
</template>

<script setup lang="ts">
import {
  BookOpen,
  Ban,
  Zap,
  Target,
  Trophy,
  MapPin,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-vue-next'
import Modal from '@/components/Modal.vue'
import Button from '@/components/Button.vue'
import { useReglamento } from '@/composables/useReglamento'

const { modalReglamentoVisible, cerrarReglamento } = useReglamento()
</script>

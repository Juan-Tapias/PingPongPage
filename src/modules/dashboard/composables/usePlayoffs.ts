import { computed, isRef, ref, watch, onUnmounted, type Ref } from 'vue'
import type {
  FilaPosicion,
  JugadorTorneo,
  PartidoPlayoff,
  CuadroPlayoffs,
  RondaPlayoff,
  Torneo,
} from '@/types'
import { useAuthStore } from '@/stores/auth'
import { suscribirPartidosPlayoffsDB } from '@/services/torneoDatabaseService'
import { generarEsqueletoPlayoffs, sonMismoJugador } from '@/services/torneoAlgoritmos'

export interface RondaCuadro {
  ronda: RondaPlayoff
  nombre: string
  partidos: PartidoPlayoff[]
}

const NOMBRES_RONDA: Record<RondaPlayoff, string> = {
  play_in: 'Play-In',
  cuartos: 'Cuartos de Final',
  semifinal: 'Semifinales',
  final: 'Gran Final',
}

/**
 * Cuadro de eliminatorias de un torneo.
 * - Fuente oficial: documentos persistidos en 'partidos_playoffs' (tiempo real).
 * - Mientras el admin no abra los playoffs, se muestra una PROYECCIÓN calculada con
 *   `generarCuadroPlayoffs` sobre la tabla actual (marcada como no oficial, sin resultados).
 */
export function usePlayoffs(
  filasPosiciones: FilaPosicion[] | Ref<FilaPosicion[]> | (() => FilaPosicion[]),
  cantidadClasificados: number | Ref<number> | (() => number) = 4,
  torneo?: Torneo | null | Ref<Torneo | null | undefined> | (() => Torneo | null | undefined)
) {
  const authStore = useAuthStore()

  const getFilas = (): FilaPosicion[] => {
    if (typeof filasPosiciones === 'function') return filasPosiciones()
    return isRef(filasPosiciones) ? filasPosiciones.value : filasPosiciones || []
  }

  const getCantidad = (): number => {
    if (typeof cantidadClasificados === 'function') return cantidadClasificados()
    return isRef(cantidadClasificados) ? cantidadClasificados.value : (cantidadClasificados ?? 4)
  }

  const getTorneo = (): Torneo | null | undefined => {
    if (!torneo) return null
    if (typeof torneo === 'function') return torneo()
    return isRef(torneo) ? torneo.value : torneo
  }

  // ---- Suscripción a llaves persistidas ----
  const partidosPersistidos = ref<PartidoPlayoff[]>([])
  const cargando = ref(false)
  const errorCarga = ref<string | null>(null)
  let unsubscribe: (() => void) | null = null

  const limpiar = () => {
    if (unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  watch(
    () => getTorneo()?.id,
    (torneoId) => {
      limpiar()
      partidosPersistidos.value = []
      errorCarga.value = null
      if (!torneoId) return
      cargando.value = true
      try {
        unsubscribe = suscribirPartidosPlayoffsDB(
          torneoId,
          (lista) => {
            partidosPersistidos.value = lista
            cargando.value = false
          },
          (err) => {
            errorCarga.value = err.message
            cargando.value = false
          },
        )
      } catch (err: any) {
        errorCarga.value = err?.message || 'No se pudo cargar el cuadro de playoffs.'
        cargando.value = false
      }
    },
    { immediate: true },
  )

  onUnmounted(limpiar)

  const esOficial = computed(() => partidosPersistidos.value.length > 0)

  // ---- Proyección (solo si aún no hay cuadro oficial) ----
  const proyeccion = computed<{ partidos: PartidoPlayoff[]; error: string | null }>(() => {
    if (esOficial.value) return { partidos: [], error: null }
    // Sin cuadro oficial NO se siembran jugadores reales: solo el esqueleto (slots Top N / Ganador ...)
    try {
      return {
        partidos: generarEsqueletoPlayoffs(getCantidad(), getTorneo()?.id || 'proyeccion'),
        error: null,
      }
    } catch (err: any) {
      return { partidos: [], error: err?.message || 'No se pudo proyectar el cuadro.' }
    }
  })
  const partidosProyeccion = computed(() => proyeccion.value.partidos)
  const errorProyeccion = computed(() => proyeccion.value.error)

  const marcarUsuario = (j?: JugadorTorneo | null): JugadorTorneo | null => {
    if (!j) return null
    const uid = authStore.usuario?.id
    return { ...j, esUsuarioActual: !!uid && sonMismoJugador(j.id, uid) }
  }

  const partidos = computed<PartidoPlayoff[]>(() => {
    const base = esOficial.value ? partidosPersistidos.value : partidosProyeccion.value
    return base.map((p) => ({ ...p, jugador1: marcarUsuario(p.jugador1), jugador2: marcarUsuario(p.jugador2) }))
  })

  // Columnas dinámicas: solo las rondas que existen en el formato elegido
  const rondas = computed<RondaCuadro[]>(() => {
    const orden: RondaPlayoff[] = ['play_in', 'cuartos', 'semifinal', 'final']
    return orden
      .map((r) => ({
        ronda: r,
        nombre: NOMBRES_RONDA[r],
        partidos: partidos.value.filter((p) => p.ronda === r).sort((a, b) => a.numeroLlave - b.numeroLlave),
      }))
      .filter((r) => r.partidos.length > 0)
  })

  const porRonda = (r: RondaPlayoff) => computed(() => partidos.value.filter((p) => p.ronda === r))
  const partidosPlayIn = porRonda('play_in')
  const partidosCuartos = porRonda('cuartos')
  const partidosSemis = porRonda('semifinal')
  const granFinal = computed<PartidoPlayoff | null>(() => partidos.value.find((p) => p.ronda === 'final') || null)

  const campeon = computed<JugadorTorneo | null>(() => {
    const f = granFinal.value
    if (!f || f.estado !== 'jugado' || !f.ganadorId) return null
    return (f.jugador1?.id === f.ganadorId ? f.jugador1 : f.jugador2) || null
  })

  // Bolsa acumulada dinámica según participantes reales y costo de inscripción del torneo
  const bolsaPremio = computed<number>(() => {
    const t = getTorneo()
    const filas = getFilas()
    const costo = Number(t?.costoInscripcion) || 6000
    const totalParticipantes = Math.max(filas.length, Number(t?.cuposTomados) || 0)
    return Math.max(0, totalParticipantes * costo)
  })

  const bolsaPremioFormateada = computed<string>(() => bolsaPremio.value.toLocaleString('es-CO'))

  const cuadroCompleto = computed<CuadroPlayoffs>(() => ({
    playIn: partidosPlayIn.value,
    cuartos: partidosCuartos.value,
    semifinales: partidosSemis.value,
    granFinal: granFinal.value,
    campeon: campeon.value || undefined,
    bolsaPremio: bolsaPremio.value,
    persistido: esOficial.value,
  }))

  const miCamino = computed<PartidoPlayoff[]>(() =>
    partidos.value.filter((p) => p.jugador1?.esUsuarioActual || p.jugador2?.esUsuarioActual),
  )

  return {
    bolsaPremio,
    bolsaPremioFormateada,
    partidos,
    rondas,
    partidosPlayIn,
    partidosCuartos,
    partidosSemis,
    granFinal,
    campeon,
    cuadroCompleto,
    miCamino,
    esOficial,
    cargando,
    errorCarga,
    errorProyeccion,
  }
}

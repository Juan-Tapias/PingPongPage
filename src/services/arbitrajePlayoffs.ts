import type {
  JugadorTorneo,
  PartidoArbitrable,
  PartidoGrupo,
  PartidoPlayoff,
  RondaPlayoff,
  SetPartido,
} from '@/types'
import { generarCodigoSeguridad, sonMismoJugador } from './torneoAlgoritmos'

/**
 * Arbitraje de las llaves de eliminatorias (Fase 2).
 *
 * Las llaves viven en 'partidos_playoffs' con ids `po-<torneo>-<ronda>-<llave>`. Para reutilizar
 * el mismo modal de arbitraje y el marcador virtual de la fase de grupos, cada llave se adapta a
 * la forma `PartidoArbitrable` (con `fase: 'playoff'`), y al terminar se resuelve con
 * `resolverAvancePlayoff` para que el ganador avance a la siguiente llave.
 */

export const PREFIJO_ID_PLAYOFF = 'po-'

/** true si el id corresponde a una llave de eliminatorias (colección 'partidos_playoffs'). */
export const esIdPartidoPlayoff = (id?: string | null): boolean =>
  typeof id === 'string' && id.startsWith(PREFIJO_ID_PLAYOFF)

export const NOMBRE_RONDA_PLAYOFF: Record<RondaPlayoff, string> = {
  play_in: 'Play-In',
  cuartos: 'Cuartos de Final',
  semifinal: 'Semifinal',
  final: 'Gran Final',
}

/** Nombre legible de una llave: "Cuartos de Final 3", "Gran Final". */
export const nombreLlavePlayoff = (p: Pick<PartidoPlayoff, 'ronda' | 'numeroLlave'>): string =>
  p.ronda === 'final' ? NOMBRE_RONDA_PLAYOFF.final : `${NOMBRE_RONDA_PLAYOFF[p.ronda]} ${p.numeroLlave}`

/**
 * PIN de 5 dígitos que cada jugador le dicta al árbitro para habilitar su llave.
 * Incluye el id de la llave para que no coincida con el PIN de la fase de grupos
 * cuando los mismos dos jugadores vuelven a enfrentarse.
 */
export const codigoSeguridadPlayoff = (llaveId: string, jugadorId: string, rivalId: string): string =>
  generarCodigoSeguridad(`${jugadorId}::${llaveId}`, rivalId)

/** Valida los PINs de ambos jugadores (en cualquier orden). */
export function validarPinsPlayoff(llave: PartidoPlayoff, codigo1: string, codigo2: string): boolean {
  const j1 = llave.jugador1?.id
  const j2 = llave.jugador2?.id
  if (!j1 || !j2) return false
  const pin1 = codigoSeguridadPlayoff(llave.id, j1, j2)
  const pin2 = codigoSeguridadPlayoff(llave.id, j2, j1)
  const a = String(codigo1 || '').trim()
  const b = String(codigo2 || '').trim()
  return (a === pin1 && b === pin2) || (a === pin2 && b === pin1)
}

/** Tras 5 minutos sin puntos, un árbitro activo deja de bloquear la llave (mismo criterio que grupos). */
export const LLAVE_INACTIVA_MS = 5 * 60 * 1000

export function llaveBloqueadaPorOtroArbitro(
  llave: PartidoPlayoff,
  arbitroId: string,
  ahora: number = Date.now(),
): boolean {
  if (llave.estado !== 'en_curso' || !llave.arbitroActivoId) return false
  if (sonMismoJugador(llave.arbitroActivoId, arbitroId)) return false
  const ultima = llave.marcadorEnVivo?.actualizadoEn
  return !!ultima && ahora - ultima <= LLAVE_INACTIVA_MS
}

const inicialesDe = (nombre?: string): string =>
  (nombre || 'JG')
    .split(' ')
    .filter(Boolean)
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

const conIniciales = (j: JugadorTorneo): JugadorTorneo => ({
  ...j,
  iniciales: j.iniciales || inicialesDe(j.nombre),
  telefono: j.telefono || '',
})

/** Adapta una llave con sus dos jugadores definidos a la forma que usan el modal y el marcador. */
export function llaveComoArbitrable(llave: PartidoPlayoff): PartidoArbitrable {
  if (!llave.jugador1?.id || !llave.jugador2?.id) {
    throw new Error('La llave aún no tiene a sus dos jugadores definidos.')
  }
  const jugador1 = conIniciales(llave.jugador1)
  const jugador2 = conIniciales(llave.jugador2)
  const partido: PartidoGrupo = {
    id: llave.id,
    torneoId: llave.torneoId,
    fase: 'playoff',
    etiquetaRonda: nombreLlavePlayoff(llave),
    numeroPartido: llave.numeroLlave,
    jugador1Id: jugador1.id,
    jugador2Id: jugador2.id,
    jugador1,
    jugador2,
    estado: llave.estado,
    diasRestantes: 2,
    mesa: llave.mesa,
    marcadorEnVivo: llave.marcadorEnVivo ?? undefined,
    arbitroActivoId: llave.arbitroActivoId ?? undefined,
    sets: llave.sets,
    codigoJugador1: codigoSeguridadPlayoff(llave.id, jugador1.id, jugador2.id),
    codigoJugador2: codigoSeguridadPlayoff(llave.id, jugador2.id, jugador1.id),
    codigoCamara: llave.codigoCamara,
  }
  return { partido, jugador1, jugador2 }
}

/**
 * Llaves que el árbitro en sesión puede dirigir: sin resultado, con sus dos jugadores definidos,
 * donde el árbitro no juega y que no esté dirigiendo otro árbitro activo (el admin puede retomarla).
 */
export function llavesArbitrables(
  llaves: PartidoPlayoff[],
  arbitroId: string | null | undefined,
  opciones: { esAdmin?: boolean; ahora?: number } = {},
): PartidoArbitrable[] {
  if (!arbitroId) return []
  const ahora = opciones.ahora ?? Date.now()
  return llaves
    .filter((p) => p.estado !== 'jugado' && !!p.jugador1?.id && !!p.jugador2?.id)
    .filter((p) => !sonMismoJugador(p.jugador1!.id, arbitroId) && !sonMismoJugador(p.jugador2!.id, arbitroId))
    .filter((p) => opciones.esAdmin || !llaveBloqueadaPorOtroArbitro(p, arbitroId, ahora))
    .sort((a, b) => (a.ordenRonda || 0) - (b.ordenRonda || 0) || a.numeroLlave - b.numeroLlave)
    .map(llaveComoArbitrable)
}

/** Sets ganados por cada lado a partir del historial del marcador virtual. */
export function setsGanadosPorSlot(sets: SetPartido[], jugador1Id: string, jugador2Id: string): { s1: number; s2: number } {
  let s1 = 0
  let s2 = 0
  for (const s of sets) {
    if (s.ganadorId && sonMismoJugador(s.ganadorId, jugador1Id)) s1++
    else if (s.ganadorId && sonMismoJugador(s.ganadorId, jugador2Id)) s2++
    else if (s.puntosJugador1 > s.puntosJugador2) s1++
    else if (s.puntosJugador2 > s.puntosJugador1) s2++
  }
  return { s1, s2 }
}

/**
 * Marcador en sets (2-0 / 2-1) de una llave al terminar el partido arbitrado.
 * Un W.O. siempre cuenta 2-0 a favor del ganador.
 */
export function marcadorPlayoffDesdeResultado(
  llave: PartidoPlayoff,
  sets: SetPartido[],
  ganadorId: string,
  esWalkover = false,
): { s1: number; s2: number } {
  const j1 = llave.jugador1?.id
  const j2 = llave.jugador2?.id
  if (!j1 || !j2) throw new Error('La llave aún no tiene a sus dos jugadores definidos.')
  const ganaJ1 = sonMismoJugador(ganadorId, j1)
  if (!ganaJ1 && !sonMismoJugador(ganadorId, j2)) throw new Error('El ganador no pertenece a esta llave.')
  if (esWalkover) return ganaJ1 ? { s1: 2, s2: 0 } : { s1: 0, s2: 2 }
  const marcador = setsGanadosPorSlot(sets, j1, j2)
  if (marcador.s1 !== marcador.s2 && marcador.s1 > marcador.s2 !== ganaJ1) {
    throw new Error('El marcador de sets no coincide con el ganador declarado.')
  }
  return marcador
}

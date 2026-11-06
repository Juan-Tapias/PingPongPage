import type { FilaPosicion, PartidoGrupo } from '@/types'
import { sonMismoJugador } from '@/services/torneoAlgoritmos'

/**
 * Títulos (banners) de la tabla de posiciones. Son solo reconocimientos visuales:
 * no suman puntos ni afectan el desempate.
 *
 * Orden = prioridad: el primero que tenga un jugador es su banner principal;
 * los demás se muestran como insignias pequeñas junto al nombre.
 */
export type TituloTabla =
  | 'invicto'
  | 'reyMalla'
  | 'enRacha'
  | 'cazagigantes'
  | 'remontador'
  | 'canonero'
  | 'muralla'
  | 'rachaFria'
  | 'enLucha'

export const PRIORIDAD_TITULOS: TituloTabla[] = [
  'invicto',
  'reyMalla',
  'enRacha',
  'cazagigantes',
  'remontador',
  'canonero',
  'muralla',
  'rachaFria',
  'enLucha',
]

/** Mínimo de victorias/derrotas seguidas para que cuente como racha. */
export const RACHA_MINIMA = 3

/** Cuántos de arriba de la tabla cuentan como "gigantes" para el Cazagigantes. */
export const TOP_GIGANTES = 3

export interface ResultadoTitulos {
  titulos: Map<string, TituloTabla[]>
  rachas: Map<string, { victorias: number; derrotas: number }>
  /** Victorias contra el top de la tabla (solo para jugadores fuera de ese top). */
  victoriasGigantes: Map<string, number>
  /** Victorias tras perder el primer set. */
  remontadas: Map<string, number>
}

const ordenSets = (p: PartidoGrupo) => [...(p.sets ?? [])].sort((a, b) => a.setNumero - b.setNumero)

/** Remontada: ganó el partido habiendo perdido el primer set (no cuenta W.O.). */
export const esRemontada = (p: PartidoGrupo, jugadorId: string): boolean => {
  if (p.estado !== 'jugado' || p.esWalkover || !sonMismoJugador(p.jugadorGanadorId, jugadorId)) return false
  const primero = ordenSets(p)[0]
  return !!primero?.ganadorId && !sonMismoJugador(primero.ganadorId, jugadorId)
}

/**
 * Racha actual de cada jugador: victorias o derrotas seguidas contando desde su último partido
 * jugado hacia atrás. El orden es el del fixture (ronda y número de partido).
 */
export const calcularRachas = (
  filas: FilaPosicion[],
  partidos: PartidoGrupo[],
): Map<string, { victorias: number; derrotas: number }> => {
  const jugados = partidos
    .filter((p) => p.estado === 'jugado' && p.jugadorGanadorId)
    .sort(
      (a, b) =>
        Number(a.ronda || a.jornada || 1) - Number(b.ronda || b.jornada || 1) ||
        (a.numeroPartido || 0) - (b.numeroPartido || 0),
    )

  const rachas = new Map<string, { victorias: number; derrotas: number }>()
  for (const fila of filas) {
    const propios = jugados.filter(
      (p) => sonMismoJugador(p.jugador1Id, fila.jugadorId) || sonMismoJugador(p.jugador2Id, fila.jugadorId),
    )
    let victorias = 0
    let derrotas = 0
    for (let i = propios.length - 1; i >= 0; i--) {
      const gano = sonMismoJugador(propios[i]!.jugadorGanadorId, fila.jugadorId)
      if (gano && derrotas === 0) victorias++
      else if (!gano && victorias === 0) derrotas++
      else break
    }
    rachas.set(fila.jugadorId, { victorias, derrotas })
  }
  return rachas
}

/** Ids de quienes tienen el mejor valor (empates incluidos). */
const mejores = (candidatos: FilaPosicion[], valor: (f: FilaPosicion) => number, mayorEsMejor: boolean): string[] => {
  if (candidatos.length === 0) return []
  const objetivo = mayorEsMejor
    ? Math.max(...candidatos.map(valor))
    : Math.min(...candidatos.map(valor))
  return candidatos.filter((f) => valor(f) === objetivo).map((f) => f.jugadorId)
}

export const calcularTitulos = (filas: FilaPosicion[], partidos: PartidoGrupo[]): ResultadoTitulos => {
  const titulos = new Map<string, TituloTabla[]>()
  const rachas = calcularRachas(filas, partidos)
  const dar = (id: string, t: TituloTabla) => titulos.set(id, [...(titulos.get(id) ?? []), t])

  const maxPJ = Math.max(0, ...filas.map((f) => f.pj))
  const minPJ = maxPJ >= 2 ? 2 : 1
  // Títulos de "el mejor en X": solo compiten quienes llevan al menos el 60 % de los partidos
  const minPJTitulo = Math.max(minPJ, Math.ceil(maxPJ * 0.6))
  const regulares = filas.filter((f) => f.pj >= minPJTitulo && f.pj > 0)

  const maxMallas = Math.max(0, ...filas.map((f) => f.mallas || 0))
  const mejorRachaV = Math.max(0, ...[...rachas.values()].map((r) => r.victorias))
  const mejorRachaD = Math.max(0, ...[...rachas.values()].map((r) => r.derrotas))

  const canoneros = new Set(mejores(regulares.filter((f) => f.sf > 0), (f) => f.sf, true))
  const murallas = new Set(mejores(regulares, (f) => f.sc / f.pj, false))

  const jugados = partidos.filter((p) => p.estado === 'jugado' && p.jugadorGanadorId)

  // Cazagigantes: quien más le ha ganado al top de la tabla, sin estar en ese top
  const gigantes = filas.filter((f, i) => (f.posicion || i + 1) <= TOP_GIGANTES && f.pj > 0).map((f) => f.jugadorId)
  const esGigante = (id?: string) => !!id && gigantes.some((g) => sonMismoJugador(g, id))
  const victoriasGigantes = new Map<string, number>()
  for (const f of filas) {
    if (esGigante(f.jugadorId)) continue
    const n = jugados.filter((p) => {
      if (!sonMismoJugador(p.jugadorGanadorId, f.jugadorId)) return false
      const rival = sonMismoJugador(p.jugador1Id, f.jugadorId) ? p.jugador2Id : p.jugador1Id
      return esGigante(rival)
    }).length
    victoriasGigantes.set(f.jugadorId, n)
  }
  const maxGigantes = Math.max(0, ...victoriasGigantes.values())

  // Remontador: más victorias después de perder el primer set
  const remontadas = new Map<string, number>()
  for (const f of filas) {
    remontadas.set(f.jugadorId, jugados.filter((p) => esRemontada(p, f.jugadorId)).length)
  }
  const maxRemontadas = Math.max(0, ...remontadas.values())

  for (const f of filas) {
    const racha = rachas.get(f.jugadorId) ?? { victorias: 0, derrotas: 0 }
    if (f.pj >= minPJ && f.pp === 0) dar(f.jugadorId, 'invicto')
    if (maxMallas > 0 && (f.mallas || 0) === maxMallas) dar(f.jugadorId, 'reyMalla')
    if (mejorRachaV >= RACHA_MINIMA && racha.victorias === mejorRachaV) dar(f.jugadorId, 'enRacha')
    if (maxGigantes > 0 && victoriasGigantes.get(f.jugadorId) === maxGigantes) dar(f.jugadorId, 'cazagigantes')
    if (maxRemontadas > 0 && remontadas.get(f.jugadorId) === maxRemontadas) dar(f.jugadorId, 'remontador')
    if (canoneros.has(f.jugadorId)) dar(f.jugadorId, 'canonero')
    if (murallas.has(f.jugadorId)) dar(f.jugadorId, 'muralla')
    if (mejorRachaD >= RACHA_MINIMA && racha.derrotas === mejorRachaD) dar(f.jugadorId, 'rachaFria')
    if (f.pj >= minPJ && f.pg === 0) dar(f.jugadorId, 'enLucha')
  }

  // Ordenar por prioridad: el primero es el banner principal
  for (const [id, lista] of titulos) {
    titulos.set(id, PRIORIDAD_TITULOS.filter((t) => lista.includes(t)))
  }

  return { titulos, rachas, victoriasGigantes, remontadas }
}

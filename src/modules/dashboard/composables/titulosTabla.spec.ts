import { describe, it, expect } from 'vitest'
import type { FilaPosicion, PartidoGrupo } from '@/types'
import { calcularTitulos, calcularRachas } from './titulosTabla'

const fila = (id: string, d: Partial<FilaPosicion>): FilaPosicion =>
  ({ jugadorId: id, nombre: id, pj: 0, pg: 0, pp: 0, sf: 0, sc: 0, puntos: 0, mallas: 0, ...d }) as FilaPosicion

let n = 0
const partido = (a: string, b: string, ganador: string, ronda: number): PartidoGrupo =>
  ({
    id: `p${++n}`,
    jugador1Id: a,
    jugador2Id: b,
    jugadorGanadorId: ganador,
    estado: 'jugado',
    ronda,
    numeroPartido: n,
    diasRestantes: 0,
  }) as PartidoGrupo

describe('calcularRachas', () => {
  it('cuenta victorias seguidas desde el último partido hacia atrás', () => {
    const filas = [fila('a', {}), fila('b', {})]
    const partidos = [
      partido('a', 'b', 'b', 1),
      partido('a', 'b', 'a', 2),
      partido('a', 'b', 'a', 3),
      partido('a', 'b', 'a', 4),
    ]
    const r = calcularRachas(filas, partidos)
    expect(r.get('a')).toEqual({ victorias: 3, derrotas: 0 })
    expect(r.get('b')).toEqual({ victorias: 0, derrotas: 3 })
  })

  it('ignora partidos no jugados', () => {
    const p = { ...partido('a', 'b', 'a', 1), estado: 'pendiente' } as PartidoGrupo
    expect(calcularRachas([fila('a', {})], [p]).get('a')).toEqual({ victorias: 0, derrotas: 0 })
  })
})

describe('calcularTitulos', () => {
  it('asigna los 7 títulos y ordena por prioridad (el primero es el banner)', () => {
    const filas = [
      fila('lider', { pj: 10, pg: 9, pp: 1, sf: 19, sc: 4, mallas: 40 }),
      fila('muro', { pj: 10, pg: 8, pp: 2, sf: 17, sc: 2, mallas: 5 }),
      fila('sinGanar', { pj: 10, pg: 0, pp: 10, sf: 3, sc: 20 }),
      fila('perfecto', { pj: 10, pg: 10, pp: 0, sf: 20, sc: 5 }),
    ]
    const partidos = [
      ...[1, 2, 3, 4].map((r) => partido('lider', 'sinGanar', 'lider', r)),
    ]
    const { titulos } = calcularTitulos(filas, partidos)
    expect(titulos.get('perfecto')).toEqual(['invicto', 'canonero'])
    expect(titulos.get('lider')).toEqual(['reyMalla', 'enRacha'])
    expect(titulos.get('muro')).toEqual(['muralla'])
    expect(titulos.get('sinGanar')).toEqual(['rachaFria', 'enLucha'])
  })

  it('no da racha con menos de 3 seguidas', () => {
    const filas = [fila('a', { pj: 2, pg: 2 }), fila('b', { pj: 2, pp: 2 })]
    const partidos = [partido('a', 'b', 'a', 1), partido('a', 'b', 'a', 2)]
    const { titulos } = calcularTitulos(filas, partidos)
    expect(titulos.get('a')).not.toContain('enRacha')
    expect(titulos.get('b')).not.toContain('rachaFria')
  })

  it('los títulos de "el mejor" exigen al menos el 60 % de los partidos jugados', () => {
    const filas = [
      fila('pocos', { pj: 2, pg: 1, pp: 1, sf: 2, sc: 0 }),
      fila('muchos', { pj: 10, pg: 5, pp: 5, sf: 12, sc: 10 }),
    ]
    const { titulos } = calcularTitulos(filas, [])
    expect(titulos.get('pocos') ?? []).not.toContain('muralla')
    expect(titulos.get('muchos')).toContain('muralla')
  })
})

const set = (setNumero: number, ganadorId: string) =>
  ({ setNumero, ganadorId, puntosJugador1: 11, puntosJugador2: 9, mallasJugador1: 0, mallasJugador2: 0 })

describe('cazagigantes y remontador', () => {
  it('Cazagigantes: más victorias contra el top 3, solo para quien no está en el top 3', () => {
    const filas = [
      fila('t1', { posicion: 1, pj: 5, pg: 4, pp: 1 }),
      fila('t2', { posicion: 2, pj: 5, pg: 3, pp: 2 }),
      fila('t3', { posicion: 3, pj: 5, pg: 3, pp: 2 }),
      fila('medio', { posicion: 4, pj: 5, pg: 2, pp: 3 }),
      fila('bajo', { posicion: 5, pj: 5, pg: 1, pp: 4 }),
    ]
    const partidos = [
      partido('medio', 't1', 'medio', 1),
      partido('medio', 't2', 'medio', 2),
      partido('bajo', 't3', 'bajo', 1),
      partido('t1', 't2', 't1', 3), // victoria entre gigantes: no cuenta
    ]
    const { titulos, victoriasGigantes } = calcularTitulos(filas, partidos)
    expect(victoriasGigantes.get('medio')).toBe(2)
    expect(titulos.get('medio')).toContain('cazagigantes')
    expect(titulos.get('bajo') ?? []).not.toContain('cazagigantes')
    expect(titulos.get('t1') ?? []).not.toContain('cazagigantes')
  })

  it('Remontador: ganó tras perder el primer set; el W.O. no cuenta', () => {
    const filas = [fila('a', { pj: 3, pg: 2, pp: 1 }), fila('b', { pj: 3, pg: 1, pp: 2 })]
    const remontada = { ...partido('a', 'b', 'a', 1), sets: [set(2, 'a'), set(1, 'b'), set(3, 'a')] } as PartidoGrupo
    const directa = { ...partido('a', 'b', 'b', 2), sets: [set(1, 'b'), set(2, 'b')] } as PartidoGrupo
    const wo = { ...partido('a', 'b', 'b', 3), esWalkover: true, sets: [set(1, 'a'), set(2, 'b'), set(3, 'b')] } as PartidoGrupo
    const { titulos, remontadas } = calcularTitulos(filas, [remontada, directa, wo])
    expect(remontadas.get('a')).toBe(1)
    expect(remontadas.get('b')).toBe(0)
    expect(titulos.get('a')).toContain('remontador')
    expect(titulos.get('b') ?? []).not.toContain('remontador')
  })
})

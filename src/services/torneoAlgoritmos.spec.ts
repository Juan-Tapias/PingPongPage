import { describe, it, expect } from 'vitest'
import type { FilaPosicionOficial, PartidoPlayoff } from '@/types'
import {
  generarCuadroPlayoffs,
  generarEsqueletoPlayoffs,
  resolverAvancePlayoff,
  validarMarcadorPlayoff,
  idPartidoPlayoff,
} from './torneoAlgoritmos'

const crearTabla = (n: number): FilaPosicionOficial[] =>
  Array.from({ length: n }, (_, i) => ({
    posicion: i + 1,
    jugadorId: `j${i + 1}`,
    nombre: `Jugador ${i + 1}`,
    pj: 3,
    pg: 0,
    pp: 0,
    sf: 0,
    sc: 0,
    puntos: 100 - i,
  }))

const llave = (partidos: PartidoPlayoff[], ronda: PartidoPlayoff['ronda'], n: number) =>
  partidos.find((p) => p.ronda === ronda && p.numeroLlave === n)!

const contar = (partidos: PartidoPlayoff[], ronda: PartidoPlayoff['ronda']) =>
  partidos.filter((p) => p.ronda === ronda).length

describe('generarCuadroPlayoffs', () => {
  it('Top 2: final directa 1 vs 2', () => {
    const { partidos, semillas } = generarCuadroPlayoffs(crearTabla(5), 2, 't')
    expect(partidos).toHaveLength(1)
    expect(semillas).toHaveLength(2)
    const f = llave(partidos, 'final', 1)
    expect(f.jugador1?.id).toBe('j1')
    expect(f.jugador2?.id).toBe('j2')
    expect(f.siguientePartidoId).toBeNull()
  })

  it('Top 4: semis 1v4 y 2v3 alimentan la final', () => {
    const { partidos } = generarCuadroPlayoffs(crearTabla(6), 4, 't')
    expect(contar(partidos, 'semifinal')).toBe(2)
    const s1 = llave(partidos, 'semifinal', 1)
    const s2 = llave(partidos, 'semifinal', 2)
    expect([s1.semilla1, s1.semilla2]).toEqual([1, 4])
    expect([s2.semilla1, s2.semilla2]).toEqual([2, 3])
    expect(s1.siguientePartidoId).toBe(idPartidoPlayoff('t', 'final', 1))
    expect(s1.siguienteSlot).toBe(1)
    expect(s2.siguienteSlot).toBe(2)
    const f = llave(partidos, 'final', 1)
    expect(f.jugador1).toBeNull()
    expect(f.jugador2).toBeNull()
  })

  it('Top 6: 1 y 2 con BYE real en semis, cuartos 3v6 y 4v5', () => {
    const { partidos } = generarCuadroPlayoffs(crearTabla(8), 6, 't')
    expect(contar(partidos, 'cuartos')).toBe(2)
    expect(contar(partidos, 'semifinal')).toBe(2)
    expect(partidos.some((p) => p.jugador1?.id === 'j7' || p.jugador2?.id === 'j7')).toBe(false)
    const c1 = llave(partidos, 'cuartos', 1)
    const c2 = llave(partidos, 'cuartos', 2)
    expect([c1.semilla1, c1.semilla2]).toEqual([3, 6])
    expect([c2.semilla1, c2.semilla2]).toEqual([4, 5])
    const s1 = llave(partidos, 'semifinal', 1)
    expect(s1.jugador1?.id).toBe('j1')
    expect(s1.jugador2).toBeNull()
    expect(s1.esBye).toBe(true)
    expect(c1.siguientePartidoId).toBe(s1.id)
    expect(c1.siguienteSlot).toBe(2)
  })

  it('Top 8: cuartos 1v8, 4v5, 2v7, 3v6', () => {
    const { partidos } = generarCuadroPlayoffs(crearTabla(10), 8, 't')
    expect(partidos).toHaveLength(7)
    const pares = [1, 2, 3, 4].map((n) => {
      const c = llave(partidos, 'cuartos', n)
      return [c.semilla1, c.semilla2]
    })
    expect(pares).toEqual([[1, 8], [4, 5], [2, 7], [3, 6]])
    expect(partidos.some((p) => p.jugador1?.id === 'j9' || p.jugador2?.id === 'j9')).toBe(false)
  })

  it('Top 12: Play-In alimenta los slots de cuartos y 1-4 tienen BYE', () => {
    const { partidos } = generarCuadroPlayoffs(crearTabla(14), 12, 't')
    expect(contar(partidos, 'play_in')).toBe(4)
    expect(contar(partidos, 'cuartos')).toBe(4)
    expect(contar(partidos, 'semifinal')).toBe(2)
    expect(contar(partidos, 'final')).toBe(1)
    for (let n = 1; n <= 4; n++) {
      const pi = llave(partidos, 'play_in', n)
      const c = llave(partidos, 'cuartos', n)
      expect(pi.siguientePartidoId).toBe(c.id)
      expect(pi.siguienteSlot).toBe(2)
      expect(c.jugador2).toBeNull()
      expect(c.esBye).toBe(true)
    }
    expect([1, 2, 3, 4].map((n) => llave(partidos, 'cuartos', n).semilla1)).toEqual([1, 4, 2, 3])
    expect([1, 2, 3, 4].map((n) => {
      const p = llave(partidos, 'play_in', n)
      return [p.semilla1, p.semilla2]
    })).toEqual([[8, 9], [5, 12], [7, 10], [6, 11]])
    expect(partidos.some((p) => p.jugador1?.id === 'j13' || p.jugador2?.id === 'j13')).toBe(false)
  })

  it('ordena por posición aunque la tabla llegue desordenada', () => {
    const tabla = crearTabla(4).reverse()
    const { partidos } = generarCuadroPlayoffs(tabla, 2, 't')
    expect(partidos[0]!.jugador1?.id).toBe('j1')
  })

  it.each([3, 5, 10, 0, 16])('rechaza formato inválido Top %i', (n) => {
    expect(() => generarCuadroPlayoffs(crearTabla(20), n, 't')).toThrow(/inválido/)
  })

  it('rechaza si hay menos jugadores que N', () => {
    expect(() => generarCuadroPlayoffs(crearTabla(7), 8, 't')).toThrow(/al menos 8/)
  })
})

describe('validarMarcadorPlayoff (mejor de 3)', () => {
  it('acepta 2-0, 2-1, 0-2, 1-2', () => {
    expect(validarMarcadorPlayoff(2, 0)).toBeNull()
    expect(validarMarcadorPlayoff(2, 1)).toBeNull()
    expect(validarMarcadorPlayoff(0, 2)).toBeNull()
    expect(validarMarcadorPlayoff(1, 2)).toBeNull()
  })
  it('rechaza empates y marcadores imposibles', () => {
    expect(validarMarcadorPlayoff(1, 1)).toMatch(/empates/)
    expect(validarMarcadorPlayoff(3, 0)).not.toBeNull()
    expect(validarMarcadorPlayoff(2, 2)).not.toBeNull()
    expect(validarMarcadorPlayoff(1, 0)).not.toBeNull()
  })
})

describe('resolverAvancePlayoff', () => {
  it('avanza al ganador al slot correcto y corona al campeón en la final', () => {
    let { partidos } = generarCuadroPlayoffs(crearTabla(4), 4, 't')
    const aplicar = (id: string, a: number, b: number) => {
      const r = resolverAvancePlayoff(partidos, id, a, b)
      partidos = partidos.map((p) => {
        const u = r.actualizaciones.find((x) => x.id === p.id)
        return u ? ({ ...p, ...u.datos } as PartidoPlayoff) : p
      })
      return r
    }
    const s1 = llave(partidos, 'semifinal', 1)
    const s2 = llave(partidos, 'semifinal', 2)
    expect(aplicar(s1.id, 1, 2).campeon).toBeNull() // gana j4
    aplicar(s2.id, 2, 0) // gana j2
    const final = llave(partidos, 'final', 1)
    expect(final.jugador1?.id).toBe('j4')
    expect(final.jugador2?.id).toBe('j2')
    expect(final.semilla1).toBe(4)
    const r = aplicar(final.id, 2, 1)
    expect(r.campeon?.id).toBe('j4')
  })

  it('Top 12: ganador del Play-In llega al slot 2 de cuartos', () => {
    const { partidos } = generarCuadroPlayoffs(crearTabla(12), 12, 't')
    const pi2 = llave(partidos, 'play_in', 2) // 5 vs 12
    const r = resolverAvancePlayoff(partidos, pi2.id, 0, 2)
    const u = r.actualizaciones.find((x) => x.id === llave(partidos, 'cuartos', 2).id)!
    expect((u.datos as any).jugador2.id).toBe('j12')
    expect((u.datos as any).semilla2).toBe(12)
  })

  it('no permite resolver llaves sin rivales, ya jugadas o con empate', () => {
    const { partidos } = generarCuadroPlayoffs(crearTabla(4), 4, 't')
    const final = llave(partidos, 'final', 1)
    expect(() => resolverAvancePlayoff(partidos, final.id, 2, 0)).toThrow(/dos jugadores/)
    const s1 = llave(partidos, 'semifinal', 1)
    expect(() => resolverAvancePlayoff(partidos, s1.id, 1, 1)).toThrow(/empates/)
    const jugada = partidos.map((p) => (p.id === s1.id ? { ...p, estado: 'jugado' as const } : p))
    expect(() => resolverAvancePlayoff(jugada, s1.id, 2, 0)).toThrow(/ya tiene/)
  })
})

describe('generarEsqueletoPlayoffs (vista previa sin nombres reales)', () => {
  it('Top 12: misma estructura que el cuadro real pero sin jugadores', () => {
    const real = generarCuadroPlayoffs(crearTabla(20), 12, 't').partidos
    const esq = generarEsqueletoPlayoffs(12, 't')
    expect(esq).toHaveLength(real.length)
    expect(contar(esq, 'play_in')).toBe(contar(real, 'play_in'))
    expect(contar(esq, 'cuartos')).toBe(contar(real, 'cuartos'))
    for (const p of esq) {
      expect(p.jugador1).toBeNull()
      expect(p.jugador2).toBeNull()
      expect(p.ganadorId).toBeNull()
      expect(p.estado).toBe('pendiente')
    }
    expect(JSON.stringify(esq)).not.toMatch(/Jugador \d|"j\d+"/)
  })
})

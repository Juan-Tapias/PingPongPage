import { describe, it, expect } from 'vitest'
import type { FilaPosicionOficial } from '@/types'
import {
  FORMATOS_PLAYOFF_VALIDOS,
  generarCuadroPlayoffs,
  generarEsqueletoPlayoffs,
  resolverAvancePlayoff,
} from './torneoAlgoritmos'

const tabla = (n: number): FilaPosicionOficial[] =>
  Array.from({ length: n }, (_, i) => ({
    posicion: i + 1, jugadorId: `j${i + 1}`, nombre: `Jugador ${i + 1}`,
    pj: 0, pg: 0, pp: 0, sf: 0, sc: 0, puntos: 100 - i,
  }))

describe('Fase 2 – huecos cubiertos', () => {
  it.each([...FORMATOS_PLAYOFF_VALIDOS])('esqueleto Top %i: sin jugadores, sin __slot_ ni nombres', (n) => {
    const esq = generarEsqueletoPlayoffs(n, 't')
    expect(esq.length).toBe(generarCuadroPlayoffs(tabla(n), n, 't').partidos.length)
    for (const p of esq) {
      expect(p.jugador1).toBeNull()
      expect(p.jugador2).toBeNull()
      expect(p.ganadorId).toBeNull()
      expect(p.estado).toBe('pendiente')
    }
    expect(JSON.stringify(esq)).not.toMatch(/__slot_|Jugador \d/)
  })

  it.each([0, 1, 3, 5, 10, 16, -4, 2.5, NaN])('N inválido %s lanza (cuadro y esqueleto)', (n) => {
    expect(() => generarCuadroPlayoffs(tabla(20), n, 't')).toThrow()
    expect(() => generarEsqueletoPlayoffs(n, 't')).toThrow()
  })

  it('Top 12: cada Play-In alimenta el slot 2 del cuarto correcto (1v8/9, 4v5/12, 2v7/10, 3v6/11)', () => {
    const { partidos } = generarCuadroPlayoffs(tabla(12), 12, 't')
    const esperado: Record<number, [number, number]> = { 1: [1, 8], 2: [4, 5], 3: [2, 7], 4: [3, 6] }
    for (const [llave, [bye, ganaPI]] of Object.entries(esperado)) {
      const qf = partidos.find((p) => p.ronda === 'cuartos' && p.numeroLlave === Number(llave))!
      expect(qf.jugador1?.id).toBe(`j${bye}`)
      expect(qf.jugador2).toBeNull()
      const pi = partidos.find((p) => p.siguientePartidoId === qf.id)!
      expect(pi.ronda).toBe('play_in')
      expect(pi.siguienteSlot).toBe(2)
      // el ganador "favorito" (mejor semilla) entra al slot 2
      const r = resolverAvancePlayoff(partidos, pi.id, 2, 1)
      const upd = r.actualizaciones.find((a) => a.id === qf.id)!
      expect((upd.datos as any).jugador2.id).toBe(`j${ganaPI}`)
      expect((upd.datos as any).semilla2).toBe(ganaPI)
    }
  })

  it('avance 2-1 / 1-2 escribe el slot siguiente y marcador', () => {
    const { partidos } = generarCuadroPlayoffs(tabla(4), 4, 't')
    const s2 = partidos.find((p) => p.ronda === 'semifinal' && p.numeroLlave === 2)!
    const r = resolverAvancePlayoff(partidos, s2.id, 1, 2)
    expect(r.actualizaciones[0]!.datos).toMatchObject({ estado: 'jugado', ganadorId: 'j3', marcador: '1 - 2' })
    expect(r.actualizaciones[1]).toMatchObject({ id: s2.siguientePartidoId, datos: { jugador2: { id: 'j3' }, semilla2: 3 } })
    expect(r.campeon).toBeNull()
  })

  it('rechaza 3-0 y 2-2 (mejor de 3)', () => {
    const { partidos } = generarCuadroPlayoffs(tabla(4), 4, 't')
    const s1 = partidos.find((p) => p.ronda === 'semifinal')!
    expect(() => resolverAvancePlayoff(partidos, s1.id, 3, 0)).toThrow()
    expect(() => resolverAvancePlayoff(partidos, s1.id, 2, 2)).toThrow()
  })
})

import { describe, it, expect } from 'vitest'
import type { FilaPosicionOficial, PartidoPlayoff, SetPartido } from '@/types'
import { generarCuadroPlayoffs, resolverAvancePlayoff } from './torneoAlgoritmos'
import {
  codigoSeguridadPlayoff,
  esIdPartidoPlayoff,
  llavesArbitrables,
  marcadorPlayoffDesdeResultado,
  nombreLlavePlayoff,
  validarPinsPlayoff,
  LLAVE_INACTIVA_MS,
} from './arbitrajePlayoffs'

const tabla = (n: number): FilaPosicionOficial[] =>
  Array.from({ length: n }, (_, i) => ({
    posicion: i + 1, jugadorId: `j${i + 1}`, nombre: `Jugador ${i + 1}`,
    pj: 0, pg: 0, pp: 0, sf: 0, sc: 0, puntos: 100 - i,
  }))

const cuadro12 = (): PartidoPlayoff[] => generarCuadroPlayoffs(tabla(12), 12, 't1').partidos

const set = (n: number, p1: number, p2: number, ganadorId: string): SetPartido => ({
  setNumero: n, puntosJugador1: p1, puntosJugador2: p2, mallasJugador1: 0, mallasJugador2: 0, ganadorId,
})

describe('arbitraje de llaves (Fase 2)', () => {
  it('reconoce ids de llaves de playoffs', () => {
    expect(esIdPartidoPlayoff('po-t1-cuartos-1')).toBe(true)
    expect(esIdPartidoPlayoff('p-t1-3')).toBe(false)
    expect(esIdPartidoPlayoff(undefined)).toBe(false)
  })

  it('nombra la llave con ronda y número', () => {
    expect(nombreLlavePlayoff({ ronda: 'cuartos', numeroLlave: 3 })).toBe('Cuartos de Final 3')
    expect(nombreLlavePlayoff({ ronda: 'final', numeroLlave: 1 })).toBe('Gran Final')
  })

  it('solo lista llaves con dos jugadores, sin resultado y donde el árbitro no juega', () => {
    const llaves = cuadro12()
    const arbitrables = llavesArbitrables(llaves, 'j5')
    // Top 12: 4 Play-In con jugadores; cuartos/semis/final sin rival definido
    expect(arbitrables.every((a) => a.partido.fase === 'playoff')).toBe(true)
    expect(arbitrables.map((a) => a.partido.etiquetaRonda)).toEqual(['Play-In 1', 'Play-In 3', 'Play-In 4'])
    expect(llavesArbitrables(llaves, 'j20')).toHaveLength(4)
    expect(llavesArbitrables(llaves, null)).toHaveLength(0)
  })

  it('oculta una llave que dirige otro árbitro activo, salvo para el admin', () => {
    const ahora = 1_000_000
    const llaves = cuadro12().map((p) =>
      p.ronda === 'play_in' && p.numeroLlave === 1
        ? { ...p, estado: 'en_curso' as const, arbitroActivoId: 'otro', marcadorEnVivo: { actualizadoEn: ahora - 1000 } as any }
        : p,
    )
    expect(llavesArbitrables(llaves, 'j20', { ahora })).toHaveLength(3)
    expect(llavesArbitrables(llaves, 'j20', { ahora, esAdmin: true })).toHaveLength(4)
    // Árbitro inactivo más de 5 min: la llave se libera
    expect(llavesArbitrables(llaves, 'j20', { ahora: ahora + LLAVE_INACTIVA_MS + 5000 })).toHaveLength(4)
  })

  it('valida los PINs de la llave en cualquier orden y no reutiliza los de grupos', () => {
    const llave = cuadro12().find((p) => p.ronda === 'play_in' && p.jugador1 && p.jugador2)!
    const a = llave.jugador1!.id
    const b = llave.jugador2!.id
    const pinA = codigoSeguridadPlayoff(llave.id, a, b)
    const pinB = codigoSeguridadPlayoff(llave.id, b, a)
    expect(pinA).toMatch(/^\d{5}$/)
    expect(validarPinsPlayoff(llave, pinA, pinB)).toBe(true)
    expect(validarPinsPlayoff(llave, pinB, pinA)).toBe(true)
    expect(validarPinsPlayoff(llave, pinA, pinA)).toBe(false)
    expect(validarPinsPlayoff(llave, '00000', pinB)).toBe(false)
  })

  it('convierte el resultado del marcador en sets y avanza al ganador', () => {
    const llaves = cuadro12()
    const llave = llaves.find((p) => p.ronda === 'play_in' && p.jugador1 && p.jugador2)!
    const a = llave.jugador1!.id
    const b = llave.jugador2!.id
    const sets = [set(1, 11, 8, a), set(2, 9, 11, b), set(3, 11, 7, a)]
    const { s1, s2 } = marcadorPlayoffDesdeResultado(llave, sets, a)
    expect([s1, s2]).toEqual([2, 1])

    const { actualizaciones, campeon } = resolverAvancePlayoff(llaves, llave.id, s1, s2, '11-8, 9-11, 11-7')
    expect(campeon).toBeNull()
    expect(actualizaciones[0]!.datos.ganadorId).toBe(a)
    expect(actualizaciones[1]!.id).toBe(llave.siguientePartidoId)
  })

  it('un W.O. cuenta 2-0 a favor del ganador y rechaza ganadores ajenos', () => {
    const llave = cuadro12().find((p) => p.ronda === 'play_in' && p.jugador1 && p.jugador2)!
    const b = llave.jugador2!.id
    expect(marcadorPlayoffDesdeResultado(llave, [], b, true)).toEqual({ s1: 0, s2: 2 })
    expect(() => marcadorPlayoffDesdeResultado(llave, [], 'intruso', true)).toThrow()
  })
})

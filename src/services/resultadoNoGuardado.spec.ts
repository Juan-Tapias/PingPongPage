import { describe, it, expect } from 'vitest'
import type { MarcadorEnVivo, SetPartido } from '@/types'
import { resultadoNoGuardado } from './torneoAlgoritmos'

const set = (setNumero: number, ganadorId: string, p1: number, p2: number): SetPartido => ({
  setNumero,
  ganadorId,
  puntosJugador1: p1,
  puntosJugador2: p2,
  mallasJugador1: 0,
  mallasJugador2: 0,
})

const vivo = (d: Partial<MarcadorEnVivo>): MarcadorEnVivo => ({
  puntosJ1: 0,
  puntosJ2: 0,
  setActual: 'Finalizado',
  numeroSet: 2,
  setsGanadosJ1: 2,
  setsGanadosJ2: 0,
  mesa: 'Mesa 1',
  actualizadoEn: 0,
  finalizado: true,
  ...d,
})

const base = { jugador1Id: 'juan', jugador2Id: 'sara', estado: 'en_curso' }

describe('resultadoNoGuardado', () => {
  it('recupera el caso real: 2-0 finalizado en vivo pero nunca registrado', () => {
    const r = resultadoNoGuardado({
      ...base,
      marcadorEnVivo: vivo({ ganadorId: 'juan', historialSets: [set(2, 'juan', 11, 5), set(1, 'juan', 11, 4)] }),
    })
    expect(r).toEqual({
      ganadorId: 'juan',
      sets: [set(1, 'juan', 11, 4), set(2, 'juan', 11, 5)],
      marcador: '2 - 0',
      marcadorDetallado: '11-4, 11-5',
      ganadorBolaId: null,
    })
  })

  it('recupera un 2-1', () => {
    const r = resultadoNoGuardado({
      ...base,
      marcadorEnVivo: vivo({
        ganadorId: 'sara',
        historialSets: [set(1, 'juan', 11, 9), set(2, 'sara', 7, 11), set(3, 'sara', 8, 11)],
      }),
    })
    expect(r?.marcador).toBe('1 - 2')
    expect(r?.ganadorId).toBe('sara')
  })

  it('no toca partidos ya jugados, no finalizados o incoherentes', () => {
    const sets = [set(1, 'juan', 11, 4), set(2, 'juan', 11, 5)]
    expect(resultadoNoGuardado({ ...base, estado: 'jugado', marcadorEnVivo: vivo({ ganadorId: 'juan', historialSets: sets }) })).toBeNull()
    expect(resultadoNoGuardado({ ...base, marcadorEnVivo: vivo({ finalizado: false, ganadorId: 'juan', historialSets: sets }) })).toBeNull()
    expect(resultadoNoGuardado({ ...base, marcadorEnVivo: vivo({ ganadorId: 'sara', historialSets: sets }) })).toBeNull()
    expect(resultadoNoGuardado({ ...base, marcadorEnVivo: vivo({ ganadorId: 'juan', historialSets: [sets[0]!] }) })).toBeNull()
    expect(
      resultadoNoGuardado({ ...base, marcadorEnVivo: vivo({ ganadorId: 'juan', historialSets: [sets[0]!, set(2, 'otro', 11, 2)] }) }),
    ).toBeNull()
    expect(resultadoNoGuardado({ ...base, marcadorEnVivo: null })).toBeNull()
  })
})

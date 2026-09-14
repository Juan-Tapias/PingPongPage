import type { FilaPosicionOficial } from '@/types'

// ==========================================
// UTILIDADES DE COMPARACIÓN Y SEGURIDAD
// ==========================================

export function sonMismoJugador(a?: string, b?: string): boolean {
  if (!a || !b) return false
  const cA = a.trim().toLowerCase()
  const cB = b.trim().toLowerCase()
  if (cA === cB) return true
  
  // Evitar falsos positivos como 'user_seed_10'.includes('user_seed_1')
  // Solo aceptamos sufijos si están separados por guión bajo (prefijo de torneo)
  if (cA.endsWith('_' + cB) || cB.endsWith('_' + cA)) return true
  
  return false
}

export function coincideJugador(j: any, targetId?: string, targetObj?: any): boolean {
  if (!j) return false
  const jId = j.id || j.jugadorId
  const jNombre = j.nombre || j.jugadorNombre

  if (targetId) {
    if (jId && sonMismoJugador(jId, targetId)) return true
    if (jNombre && targetId.trim().toLowerCase() === jNombre.trim().toLowerCase()) return true
  }
  if (targetObj) {
    const tId = targetObj.id || targetObj.jugadorId
    if (tId && jId && sonMismoJugador(jId, tId)) return true
    if (targetObj.nombre && jNombre) {
      if (jNombre.trim().toLowerCase() === targetObj.nombre.trim().toLowerCase()) return true
    }
  }
  return false
}

export function generarCodigoSeguridad(jugadorId: string, rivalId: string): string {
  let hash = 0
  const combinacion = `${jugadorId}::vs::${rivalId}`
  for (let i = 0; i < combinacion.length; i++) {
    hash = (hash << 5) - hash + combinacion.charCodeAt(i)
    hash |= 0
  }
  const pin = (Math.abs(hash) % 90000) + 10000
  return pin.toString()
}

// ==========================================
// ALGORITMO BERGER (FIXTURE ROUND ROBIN)
// ==========================================

/**
 * Algoritmo Berger oficial para generar el fixture de Round Robin por jornadas/rondas.
 * Garantiza que en cada jornada (ronda) todos los participantes tengan exactamente 1 partido simultáneo.
 * Previene la repetición de partidos y organiza fechas justas.
 */
export function generarFixtureBerger<T extends { id?: string; jugadorId?: string; nombre?: string; iniciales?: string }>(
  participantes: T[],
): { jugador1: T; jugador2: T; ronda: number }[] {
  const lista = [...participantes]
  if (lista.length < 2) return []

  const tieneBye = lista.length % 2 !== 0
  const dummy: any = { id: '__BYE__', jugadorId: '__BYE__', nombre: 'Descanso', iniciales: 'BY' }
  if (tieneBye) {
    lista.push(dummy)
  }

  const n = lista.length
  const totalRondas = n - 1
  const partidosPorRonda = n / 2
  const fixture: { jugador1: T; jugador2: T; ronda: number }[] = []

  for (let ronda = 1; ronda <= totalRondas; ronda++) {
    for (let i = 0; i < partidosPorRonda; i++) {
      const j1 = lista[i]
      const j2 = lista[n - 1 - i]
      const j1Id = j1?.jugadorId || j1?.id
      const j2Id = j2?.jugadorId || j2?.id
      if (j1 && j2 && j1Id !== '__BYE__' && j2Id !== '__BYE__') {
        fixture.push({
          jugador1: j1,
          jugador2: j2,
          ronda,
        })
      }
    }
    const ultimo = lista.pop()!
    lista.splice(1, 0, ultimo)
  }

  return fixture
}

// ==========================================
// CÁLCULO DE TABLA DE POSICIONES
// ==========================================

/**
 * Algoritmo oficial de cálculo de métricas para la tabla de posiciones (PJ, PG, PP, SF, SC, PTS)
 * Separado de la base de datos para cumplir el principio de Responsabilidad Única (SRP).
 */
export const calcularTablaDesdePartidos = (
  jugadores: any[],
  partidos: any[],
  clasificadosPlayoffs: number = 4,
): FilaPosicionOficial[] => {
  if (!jugadores || jugadores.length === 0) return []

  const partidosJugados = (partidos || []).filter((p) => p.estado === 'jugado')

  const filas: FilaPosicionOficial[] = jugadores.map((jugador) => {
    let pj = 0
    let pg = 0
    let pp = 0
    let sf = 0
    let sc = 0

    const idJugador = jugador.id || jugador.jugadorId

    partidosJugados.forEach((partido) => {
      const j1Id = partido.jugador1?.id || partido.jugador1Id
      const j2Id = partido.jugador2?.id || partido.jugador2Id
      const esJ1 = sonMismoJugador(j1Id, idJugador)
      const esJ2 = sonMismoJugador(j2Id, idJugador)

      if (esJ1 || esJ2) {
        pj++
        const ganadorId = partido.ganadorId || partido.jugadorGanadorId
        const esGanador = sonMismoJugador(ganadorId, idJugador)

        if (esGanador) {
          pg++
        } else if (ganadorId) {
          pp++
        }

        // Sets
        if (partido.sets && Array.isArray(partido.sets) && partido.sets.length > 0) {
          partido.sets.forEach((s: any) => {
            const setGanador = s.ganadorId
            const ganoEsteSet = sonMismoJugador(setGanador, idJugador)
            if (ganoEsteSet) {
              sf++
            } else if (setGanador) {
              sc++
            }
          })
        } else if (partido.marcador && typeof partido.marcador === 'string') {
          const partes = partido.marcador.split('-').map((str: string) => parseInt(str.trim()))
          if (partes.length === 2 && !isNaN(partes[0]) && !isNaN(partes[1])) {
            if (esJ1) {
              sf += partes[0]
              sc += partes[1]
            } else {
              sf += partes[1]
              sc += partes[0]
            }
          }
        }
      }
    })

    const puntos = pg * 2 + pp * 1

    return {
      posicion: 0,
      jugadorId: idJugador,
      nombre: jugador.nombre || jugador.jugadorNombre || 'Jugador',
      iniciales: jugador.iniciales || jugador.nombre?.substring(0, 2).toUpperCase() || 'JG',
      tipo: jugador.tipo || 'camper',
      pj,
      pg,
      pp,
      sf,
      sc,
      puntos,
      destino: '',
    }
  })

  // Ordenar por: 1) Puntos, 2) Diferencia de Sets (SF - SC), 3) Sets a Favor (SF)
  filas.sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos
    const difB = b.sf - b.sc
    const difA = a.sf - a.sc
    if (difB !== difA) return difB - difA
    return b.sf - a.sf
  })

  // Asignar posición y destino según clasificadosPlayoffs
  return filas.map((fila, idx) => {
    const pos = idx + 1
    let destino = 'Eliminado'
    if (clasificadosPlayoffs === 2) {
      destino = pos <= 2 ? 'Gran Final' : 'Fase Regular'
    } else if (clasificadosPlayoffs === 4) {
      destino = pos <= 4 ? 'Cuartos (BYE)' : 'Play-In'
    } else if (clasificadosPlayoffs === 6) {
      if (pos <= 2) destino = 'Semis (BYE)'
      else if (pos <= 6) destino = 'Cuartos'
      else destino = 'Play-In'
    } else if (clasificadosPlayoffs === 8) {
      destino = pos <= 8 ? 'Cuartos de Final' : 'Fase Regular'
    } else {
      destino = pos <= 4 ? 'Cuartos (BYE)' : 'Play-In'
    }

    return {
      ...fila,
      posicion: pos,
      destino,
    }
  })
}

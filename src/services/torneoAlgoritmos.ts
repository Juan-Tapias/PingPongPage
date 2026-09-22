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

  // Considerar partidos marcados como 'jugado' o aquellos que ya cuenten con marcador final registrado
  const partidosJugados = (partidos || []).filter(
    (p) => p.estado === 'jugado' || (!!p.marcador && String(p.marcador).includes('-') && p.estado !== 'pendiente'),
  )

  const filas: FilaPosicionOficial[] = jugadores.map((jugador) => {
    let pj = 0
    let pg = 0
    let pp = 0
    let sf = 0
    let sc = 0

    const idJugador = jugador.id || jugador.jugadorId

    partidosJugados.forEach((partido) => {
      const esJ1 = coincideJugador(jugador, partido.jugador1Id, partido.jugador1)
      const esJ2 = coincideJugador(jugador, partido.jugador2Id, partido.jugador2)

      if (esJ1 || esJ2) {
        pj++

        let sfPartido = 0
        let scPartido = 0

        // 1. Contabilización de sets detallados
        if (partido.sets && Array.isArray(partido.sets) && partido.sets.length > 0) {
          partido.sets.forEach((s: any) => {
            let ganoEsteSet = false
            if (s.ganadorId) {
              ganoEsteSet = coincideJugador(jugador, s.ganadorId)
            } else if (typeof s.puntosJugador1 === 'number' && typeof s.puntosJugador2 === 'number') {
              ganoEsteSet = esJ1 ? s.puntosJugador1 > s.puntosJugador2 : s.puntosJugador2 > s.puntosJugador1
            }

            if (ganoEsteSet) {
              sfPartido++
            } else {
              scPartido++
            }
          })
        } else if (partido.marcador && typeof partido.marcador === 'string') {
          // 2. Extracción de sets a partir del marcador resumen (ej: "0 - 2", "2-1")
          const partes = partido.marcador.split('-').map((str: string) => parseInt(str.trim(), 10))
          if (partes.length === 2 && !isNaN(partes[0]!) && !isNaN(partes[1]!)) {
            if (esJ1) {
              sfPartido = partes[0]!
              scPartido = partes[1]!
            } else {
              sfPartido = partes[1]!
              scPartido = partes[0]!
            }
          }
        }

        const ganadorId = partido.ganadorId || partido.jugadorGanadorId
        const ganoPorId = ganadorId ? coincideJugador(jugador, ganadorId) : false

        // 3. Fallback de sets si no hay conteo pero sí hay ganador explícito
        if (sfPartido === 0 && scPartido === 0) {
          if (ganoPorId) {
            sfPartido = 2
            scPartido = 0
          } else {
            sfPartido = 0
            scPartido = 2
          }
        }

        sf += sfPartido
        sc += scPartido

        // 4. Determinación del resultado del partido (Victoria o Derrota)
        const esGanador = ganoPorId || sfPartido > scPartido

        if (esGanador) {
          pg++
        } else {
          pp++
        }
      }
    })

    // Sistema Round Robin oficial: 2 pts por victoria, 1 pt por derrota
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

  // Criterios oficiales de desempate:
  // 1) Puntos totales
  // 2) Diferencia de Sets (SF - SC)
  // 3) Sets a Favor (SF)
  // 4) Menor cantidad de Sets en Contra (SC)
  filas.sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos
    const difB = b.sf - b.sc
    const difA = a.sf - a.sc
    if (difB !== difA) return difB - difA
    if (b.sf !== a.sf) return b.sf - a.sf
    return a.sc - b.sc
  })

  // Asignar posición y destino según clasificadosPlayoffs
  return filas.map((fila, idx) => {
    const pos = idx + 1
    let destino = 'Fase Regular'
    if (clasificadosPlayoffs === 2) {
      destino = pos <= 2 ? 'Gran Final' : 'Fase Regular'
    } else if (clasificadosPlayoffs === 4) {
      destino = pos <= 4 ? 'Semifinales' : 'Fase Regular'
    } else if (clasificadosPlayoffs === 6) {
      if (pos <= 2) destino = 'Semis (BYE)'
      else if (pos <= 6) destino = 'Cuartos'
      else destino = 'Fase Regular'
    } else if (clasificadosPlayoffs === 8) {
      destino = pos <= 8 ? 'Cuartos de Final' : 'Fase Regular'
    } else if (clasificadosPlayoffs === 12) {
      if (pos <= 4) destino = 'Cuartos (BYE)'
      else if (pos <= 12) destino = 'Play-In'
      else destino = 'Fase Regular'
    } else {
      if (pos <= 4) destino = 'Cuartos (BYE)'
      else if (pos <= 12) destino = 'Play-In'
      else destino = 'Fase Regular'
    }

    return {
      ...fila,
      posicion: pos,
      destino,
    }
  })
}

// ==========================================
// DISPONIBILIDAD DINÁMICA DE PARTIDOS
// ==========================================

/**
 * Determina si dos jugadores están habilitados y libres para disputar un partido programado,
 * sin necesidad de que la ronda global anterior haya culminado por completo.
 *
 * Criterios:
 * 1. El partido evaluado no debe estar ya finalizado ni tener marcador registrado.
 * 2. Ninguno de los dos jugadores debe estar disputando actualmente otro partido en curso (estado === 'en_curso').
 * 3. El Jugador 1 no debe tener partidos pendientes en rondas estrictamente anteriores a la de este partido.
 * 4. El Jugador 2 no debe tener partidos pendientes en rondas estrictamente anteriores a la de este partido.
 * 5. Si dentro de la misma ronda un jugador tiene asignado más de un partido, se prioriza el de menor número de partido.
 */
export function estanJugadoresLibresParaPartido(
  partido: any,
  todosLosPartidos: any[],
): boolean {
  if (!partido) return false

  // 1. Si el partido ya fue jugado o tiene marcador final registrado, no está pendiente para arbitrar
  const yaJugado =
    partido.estado === 'jugado' ||
    (!!partido.marcador && String(partido.marcador).includes('-') && partido.estado !== 'pendiente')
  if (yaJugado) return false

  const j1Id = partido.jugador1Id || partido.jugador1?.id
  const j2Id = partido.jugador2Id || partido.jugador2?.id
  if (!j1Id || !j2Id) return false

  const rondaPartido = Number(partido.ronda || partido.jornada || 1)
  const numPartido = typeof partido.numeroPartido === 'number' ? partido.numeroPartido : null

  const jugadorLibre = (jugadorId: string): boolean => {
    for (const p of todosLosPartidos) {
      if (p.id === partido.id) continue

      const jA = p.jugador1Id || p.jugador1?.id
      const jB = p.jugador2Id || p.jugador2?.id
      const participa = sonMismoJugador(jA, jugadorId) || sonMismoJugador(jB, jugadorId)
      if (!participa) continue

      // a) Si el jugador está jugando activamente otro partido en curso
      if (p.estado === 'en_curso') {
        return false
      }

      const pJugado =
        p.estado === 'jugado' ||
        (!!p.marcador && String(p.marcador).includes('-') && p.estado !== 'pendiente')
      if (pJugado) continue

      // b) Si el partido está pendiente y pertenece a una ronda estrictamente anterior
      const rP = Number(p.ronda || p.jornada || 1)
      if (rP < rondaPartido) {
        return false
      }

      // c) Si pertenece a la misma ronda pero tiene un número de partido anterior prioritario
      if (
        rP === rondaPartido &&
        numPartido !== null &&
        typeof p.numeroPartido === 'number' &&
        p.numeroPartido < numPartido
      ) {
        return false
      }
    }

    return true
  }

  return jugadorLibre(j1Id) && jugadorLibre(j2Id)
}


import type {
  FilaPosicionOficial,
  JugadorTorneo,
  PartidoPlayoff,
  RondaPlayoff,
  SemillaPlayoff,
  SlotPlayoff,
} from '@/types'

// ==========================================
// UTILIDADES DE COMPARACIÓN Y SEGURIDAD
// ==========================================

export function sonMismoJugador(a?: string | any, b?: string | any): boolean {
  if (a === undefined || a === null || b === undefined || b === null) return false
  const cA = String(a).trim().toLowerCase()
  const cB = String(b).trim().toLowerCase()
  if (!cA || !cB) return false
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
    let ppPorWO = 0 // Derrotas por inasistencia / W.O. (no suman el punto por derrota)
    let sf = 0
    let sc = 0
    let mallas = 0

    const idJugador = jugador.id || jugador.jugadorId

    partidosJugados.forEach((partido) => {
      const esJ1 = coincideJugador(jugador, partido.jugador1Id, partido.jugador1)
      const esJ2 = coincideJugador(jugador, partido.jugador2Id, partido.jugador2)

      if (esJ1 || esJ2) {
        pj++

        let sfPartido = 0
        let scPartido = 0

        // 1. Contabilización de sets detallados y toques de malla
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

            // Acumular toques de red / mallas por set
            if (esJ1) {
              mallas += Number(s.mallasJugador1 || 0)
            } else {
              mallas += Number(s.mallasJugador2 || 0)
            }
          })
        } else if (partido.marcador && typeof partido.marcador === 'string') {
          // 2. Extracción de sets a partir del marcador resumen (ej: "0 - 2", "2-1", "2 - 0 (W.O.)")
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

        // Fallback de toques de malla si están en la raíz del partido
        if ((!partido.sets || partido.sets.length === 0)) {
          if (esJ1 && partido.mallasJugador1) {
            mallas += Number(partido.mallasJugador1)
          } else if (esJ2 && partido.mallasJugador2) {
            mallas += Number(partido.mallasJugador2)
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
          // Si el partido terminó por Walkover / W.O. y este jugador fue el perdedor sancionado
          const esWO =
            partido.esWalkover === true ||
            String(partido.marcador || '').toUpperCase().includes('W.O.') ||
            String(partido.marcador || '').toUpperCase().includes('(W)') ||
            (partido.perdedorPorWId && coincideJugador(jugador, partido.perdedorPorWId))

          if (esWO) {
            ppPorWO++
          }
        }
      }
    })

    // Sistema Round Robin oficial: 2 pts por victoria, 1 pt por derrota jugada, 0 pts por derrota por W.O.
    const derrotasJugadas = Math.max(0, pp - ppPorWO)
    const puntos = pg * 2 + derrotasJugadas * 1

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
      mallas,
      fotoUrl: normalizarFotoUrl(jugador.fotoUrl),
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

      // 1. Si el partido ya fue jugado o ya tiene marcador final registrado, el jugador no está retenido aquí
      const pJugado =
        p.estado === 'jugado' ||
        (!!p.marcador && String(p.marcador).includes('-') && p.estado !== 'pendiente')
      if (pJugado) continue

      if (p.estado === 'en_curso') {
        return false
      }

      const rP = Number(p.ronda || p.jornada || 1)
      if (rP < rondaPartido) {
        return false
      }

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

// ==========================================
// CÁLCULO DE DÍAS HÁBILES Y PAUSA DE FIN DE SEMANA
// ==========================================

/**
 * Comprueba si una fecha corresponde a sábado o domingo.
 */
export function esFinDeSemana(fecha: Date | number = Date.now()): boolean {
  const d = new Date(fecha)
  const dia = d.getDay() // 0 = Domingo, 6 = Sábado
  return dia === 0 || dia === 6
}

/**
 * Calcula la fecha límite sumando horas hábiles (por defecto 48h = 2 días).
 * Salta completamente los fines de semana (sábado y domingo).
 * Ejemplo: Viernes 10:00 AM -> Vence Martes 10:00 AM (1 día viernes + 1 día lunes).
 */
export function calcularFechaLimiteHabiles(
  fechaInicioMs: number,
  horasHabiles: number = 48,
): number {
  let actual = new Date(fechaInicioMs)
  let msPorConsumir = horasHabiles * 3600 * 1000

  // Si la fecha inicial cae en fin de semana, se inicia el conteo el lunes a las 00:00
  if (actual.getDay() === 6) {
    actual.setDate(actual.getDate() + 2)
    actual.setHours(0, 0, 0, 0)
  } else if (actual.getDay() === 0) {
    actual.setDate(actual.getDate() + 1)
    actual.setHours(0, 0, 0, 0)
  }

  while (msPorConsumir > 0) {
    const diaSemana = actual.getDay()
    if (diaSemana === 6) {
      actual.setDate(actual.getDate() + 2)
      actual.setHours(0, 0, 0, 0)
      continue
    }
    if (diaSemana === 0) {
      actual.setDate(actual.getDate() + 1)
      actual.setHours(0, 0, 0, 0)
      continue
    }

    const finDelDia = new Date(actual)
    finDelDia.setHours(24, 0, 0, 0)
    const msDisponiblesHoy = finDelDia.getTime() - actual.getTime()

    if (msPorConsumir <= msDisponiblesHoy) {
      actual = new Date(actual.getTime() + msPorConsumir)
      msPorConsumir = 0
    } else {
      msPorConsumir -= msDisponiblesHoy
      actual = finDelDia
    }
  }

  return actual.getTime()
}

export interface ResultadoTiempoHabil {
  msRestantes: number
  horasRestantes: number
  diasRestantes: number
  esFinDeSemanaPausado: boolean
}

/**
 * Calcula el tiempo hábil restante entre `ahora` y `fechaLimite`, congelando el conteo
 * durante sábados y domingos para no descontar tiempo durante el fin de semana.
 */
export function calcularTiempoRestanteHabil(
  fechaLimiteMs: number,
  ahoraMs: number = Date.now(),
): ResultadoTiempoHabil {
  const esFinDeSemanaPausado = esFinDeSemana(ahoraMs)

  if (ahoraMs >= fechaLimiteMs) {
    return {
      msRestantes: 0,
      horasRestantes: 0,
      diasRestantes: 0,
      esFinDeSemanaPausado,
    }
  }

  let cursor = new Date(ahoraMs)
  const meta = new Date(fechaLimiteMs)
  let msHabiles = 0

  while (cursor.getTime() < meta.getTime()) {
    const diaSemana = cursor.getDay()
    if (diaSemana === 6) {
      cursor.setDate(cursor.getDate() + 2)
      cursor.setHours(0, 0, 0, 0)
      if (cursor.getTime() > meta.getTime()) cursor = new Date(meta.getTime())
      continue
    }
    if (diaSemana === 0) {
      cursor.setDate(cursor.getDate() + 1)
      cursor.setHours(0, 0, 0, 0)
      if (cursor.getTime() > meta.getTime()) cursor = new Date(meta.getTime())
      continue
    }

    const finDelDia = new Date(cursor)
    finDelDia.setHours(24, 0, 0, 0)
    const proximoPunto = finDelDia.getTime() < meta.getTime() ? finDelDia.getTime() : meta.getTime()
    msHabiles += proximoPunto - cursor.getTime()
    cursor = new Date(proximoPunto)
  }

  const horasRestantes = Math.max(0, Math.floor(msHabiles / (1000 * 3600)))
  const diasRestantes = Math.max(0, Math.ceil(msHabiles / (1000 * 3600 * 24)))

  return {
    msRestantes: msHabiles,
    horasRestantes,
    diasRestantes,
    esFinDeSemanaPausado,
  }
}


// ==========================================
// FOTO DE PERFIL: NORMALIZACIÓN ÚNICA
// ==========================================

/**
 * Devuelve la primera URL de foto válida (string no vacío) entre los candidatos,
 * o `undefined` si ninguno sirve. Se usa en inscripciones, authStore y tablas_posiciones
 * para que todas las vistas resuelvan la foto con la misma prioridad.
 * Antes de escribir en Firestore se debe pasar por `sanearParaFirestore` (undefined -> null).
 */
export function normalizarFotoUrl(...candidatos: Array<string | null | undefined>): string | undefined {
  for (const c of candidatos) {
    if (typeof c === 'string' && c.trim().length > 0) return c.trim()
  }
  return undefined
}

// ==========================================
// FASE 2: GENERACIÓN DEL CUADRO DE PLAYOFFS (PURO)
// ==========================================

/** Formatos de clasificados soportados por el producto (selector del admin). */
export const FORMATOS_PLAYOFF_VALIDOS = [2, 4, 6, 8, 12] as const

/** Los partidos de playoffs se juegan al mejor de 3 sets (igual que la fase de grupos). */
export const SETS_PARA_GANAR_PLAYOFF = 2

const ANILLO_POR_RONDA: Record<RondaPlayoff, 3 | 2 | 1> = {
  play_in: 3,
  cuartos: 2,
  semifinal: 2,
  final: 1,
}

const ORDEN_RONDAS: RondaPlayoff[] = ['play_in', 'cuartos', 'semifinal', 'final']

interface DestinoLlave {
  ronda: RondaPlayoff
  llave: number
  slot: SlotPlayoff
}

interface PlantillaLlave {
  ronda: RondaPlayoff
  llave: number
  semilla1: number | null // null = llega el ganador de otra llave
  semilla2: number | null
  destino: DestinoLlave | null
}

/**
 * Plantillas fijas por formato. Las semillas con BYE NO juegan un partido ficticio:
 * se colocan directamente en el slot de la ronda siguiente (BYE real).
 *
 * - Top 2:  Final 1v2.
 * - Top 4:  Semis 1v4, 2v3 -> Final.
 * - Top 6:  Cuartos 3v6, 4v5. 1 y 2 esperan en Semis (BYE).
 * - Top 8:  Cuartos 1v8, 4v5, 2v7, 3v6 -> Semis (C1/C2, C3/C4) -> Final.
 * - Top 12: Play-In 8v9, 5v12, 7v10, 6v11. 1-4 esperan en Cuartos (BYE):
 *           C1 = 1 vs G(PI1), C2 = 4 vs G(PI2), C3 = 2 vs G(PI3), C4 = 3 vs G(PI4).
 */
const plantillaFormato = (n: number): PlantillaLlave[] => {
  const F: DestinoLlave = { ronda: 'final', llave: 1, slot: 1 }
  const F2: DestinoLlave = { ronda: 'final', llave: 1, slot: 2 }
  const final: PlantillaLlave = { ronda: 'final', llave: 1, semilla1: null, semilla2: null, destino: null }

  const semisDesdeCuartos: PlantillaLlave[] = [
    { ronda: 'semifinal', llave: 1, semilla1: null, semilla2: null, destino: F },
    { ronda: 'semifinal', llave: 2, semilla1: null, semilla2: null, destino: F2 },
  ]
  const cuartos8 = (s: (n: number) => number | null): PlantillaLlave[] => [
    { ronda: 'cuartos', llave: 1, semilla1: 1, semilla2: s(8), destino: { ronda: 'semifinal', llave: 1, slot: 1 } },
    { ronda: 'cuartos', llave: 2, semilla1: 4, semilla2: s(5), destino: { ronda: 'semifinal', llave: 1, slot: 2 } },
    { ronda: 'cuartos', llave: 3, semilla1: 2, semilla2: s(7), destino: { ronda: 'semifinal', llave: 2, slot: 1 } },
    { ronda: 'cuartos', llave: 4, semilla1: 3, semilla2: s(6), destino: { ronda: 'semifinal', llave: 2, slot: 2 } },
  ]

  switch (n) {
    case 2:
      return [{ ...final, semilla1: 1, semilla2: 2 }]
    case 4:
      return [
        { ronda: 'semifinal', llave: 1, semilla1: 1, semilla2: 4, destino: F },
        { ronda: 'semifinal', llave: 2, semilla1: 2, semilla2: 3, destino: F2 },
        final,
      ]
    case 6:
      return [
        { ronda: 'cuartos', llave: 1, semilla1: 3, semilla2: 6, destino: { ronda: 'semifinal', llave: 1, slot: 2 } },
        { ronda: 'cuartos', llave: 2, semilla1: 4, semilla2: 5, destino: { ronda: 'semifinal', llave: 2, slot: 2 } },
        { ronda: 'semifinal', llave: 1, semilla1: 1, semilla2: null, destino: F },
        { ronda: 'semifinal', llave: 2, semilla1: 2, semilla2: null, destino: F2 },
        final,
      ]
    case 8:
      return [...cuartos8((x) => x), ...semisDesdeCuartos, final]
    case 12:
      return [
        { ronda: 'play_in', llave: 1, semilla1: 8, semilla2: 9, destino: { ronda: 'cuartos', llave: 1, slot: 2 } },
        { ronda: 'play_in', llave: 2, semilla1: 5, semilla2: 12, destino: { ronda: 'cuartos', llave: 2, slot: 2 } },
        { ronda: 'play_in', llave: 3, semilla1: 7, semilla2: 10, destino: { ronda: 'cuartos', llave: 3, slot: 2 } },
        { ronda: 'play_in', llave: 4, semilla1: 6, semilla2: 11, destino: { ronda: 'cuartos', llave: 4, slot: 2 } },
        ...cuartos8(() => null),
        ...semisDesdeCuartos,
        final,
      ]
    default:
      return []
  }
}

export const idPartidoPlayoff = (torneoId: string, ronda: RondaPlayoff, llave: number): string =>
  `po-${torneoId}-${ronda}-${llave}`

const filaAJugador = (fila: FilaPosicionOficial): JugadorTorneo => ({
  id: fila.jugadorId,
  nombre: fila.nombre,
  iniciales:
    fila.iniciales ||
    (fila.nombre || 'JG')
      .split(' ')
      .map((p) => p[0])
      .join('')
      .slice(0, 2)
      .toUpperCase(),
  telefono: '',
  tipo: (fila.tipo as JugadorTorneo['tipo']) || 'camper',
  fotoUrl: normalizarFotoUrl(fila.fotoUrl),
})

export interface CuadroPlayoffsGenerado {
  clasificados: number
  semillas: SemillaPlayoff[]
  partidos: PartidoPlayoff[]
}

/**
 * Genera el cuadro de eliminación directa a partir de la tabla final de grupos.
 *
 * Reglas:
 * - Solo toma el Top N (la tabla se ordena por `posicion`; el resto queda fuera).
 * - BYEs reales: las mejores semillas se ubican directamente en la ronda siguiente.
 * - Decisión de diseño para N inválido (3, 5, 10, ...): se RECHAZA con un error claro
 *   en vez de redondear, porque el admin eligió explícitamente el formato y cambiarlo
 *   en silencio alteraría quién clasifica.
 * - Si la tabla tiene menos de N jugadores también se rechaza.
 *
 * Función pura: no toca Firestore ni el estado reactivo.
 */
export function generarCuadroPlayoffs(
  tabla: FilaPosicionOficial[],
  N: number,
  torneoId: string = 'torneo',
): CuadroPlayoffsGenerado {
  if (!(FORMATOS_PLAYOFF_VALIDOS as readonly number[]).includes(N)) {
    throw new Error(
      `Formato de playoffs inválido: Top ${N}. Valores permitidos: ${FORMATOS_PLAYOFF_VALIDOS.join(', ')}.`,
    )
  }
  const ordenada = [...(tabla || [])].sort((a, b) => (a.posicion || 0) - (b.posicion || 0))
  if (ordenada.length < N) {
    throw new Error(`Se necesitan al menos ${N} jugadores en la tabla para armar un Top ${N} (hay ${ordenada.length}).`)
  }

  const topN = ordenada.slice(0, N)
  const semillas: SemillaPlayoff[] = topN.map((f, i) => ({
    semilla: i + 1,
    jugadorId: f.jugadorId,
    nombre: f.nombre,
    iniciales: f.iniciales,
    fotoUrl: normalizarFotoUrl(f.fotoUrl) ?? null,
    puntos: f.puntos,
  }))

  const plantilla = plantillaFormato(N)
  const rondasPresentes = ORDEN_RONDAS.filter((r) => plantilla.some((p) => p.ronda === r))
  const ahora = Date.now()

  const jugadorDeSemilla = (s: number | null): JugadorTorneo | null => {
    if (s === null) return null
    const fila = topN[s - 1]
    return fila ? filaAJugador(fila) : null
  }

  const partidos: PartidoPlayoff[] = plantilla.map((pl) => {
    // Una llave tiene BYE si una semilla llega directo y el otro slot viene de otra llave
    const llegaDeOtraLlave = plantilla.some(
      (o) => o.destino && o.destino.ronda === pl.ronda && o.destino.llave === pl.llave,
    )
    const esBye = llegaDeOtraLlave && (pl.semilla1 !== null || pl.semilla2 !== null)
    return {
      id: idPartidoPlayoff(torneoId, pl.ronda, pl.llave),
      torneoId,
      fase: 'playoff',
      ronda: pl.ronda,
      ordenRonda: rondasPresentes.indexOf(pl.ronda) + 1,
      numeroLlave: pl.llave,
      jugador1: jugadorDeSemilla(pl.semilla1),
      jugador2: jugadorDeSemilla(pl.semilla2),
      semilla1: pl.semilla1,
      semilla2: pl.semilla2,
      ganadorId: null,
      marcador: null,
      marcadorDetallado: null,
      estado: 'pendiente',
      esBye,
      anilloOrbital: ANILLO_POR_RONDA[pl.ronda],
      siguientePartidoId: pl.destino ? idPartidoPlayoff(torneoId, pl.destino.ronda, pl.destino.llave) : null,
      siguienteSlot: pl.destino ? pl.destino.slot : null,
      actualizadoEn: ahora,
    }
  })

  return { clasificados: N, semillas, partidos }
}

// ==========================================
// FASE 2: AVANCE DE GANADORES (PURO)
// ==========================================

/**
 * Valida un marcador de playoffs al mejor de 3 sets: no existen empates.
 * El ganador debe tener exactamente 2 sets y el perdedor 0 o 1.
 */
export function validarMarcadorPlayoff(setsJugador1: number, setsJugador2: number): string | null {
  const a = Number(setsJugador1)
  const b = Number(setsJugador2)
  if (!Number.isInteger(a) || !Number.isInteger(b) || a < 0 || b < 0) {
    return 'El marcador debe ser un número entero de sets para cada jugador.'
  }
  if (a === b) return 'En eliminatorias no hay empates: el partido es al mejor de 3 sets.'
  const max = Math.max(a, b)
  const min = Math.min(a, b)
  if (max !== SETS_PARA_GANAR_PLAYOFF || min > SETS_PARA_GANAR_PLAYOFF - 1) {
    return 'Marcador inválido: al mejor de 3 sets el ganador suma 2 sets y el rival 0 o 1 (2-0 o 2-1).'
  }
  return null
}

export interface ActualizacionPlayoff {
  id: string
  datos: Partial<PartidoPlayoff>
}

export interface ResultadoAvancePlayoff {
  actualizaciones: ActualizacionPlayoff[]
  campeon: JugadorTorneo | null
}

/**
 * Calcula las escrituras necesarias al resolver una llave:
 * 1) marca la llave como jugada con ganador y marcador,
 * 2) coloca al ganador en `siguientePartidoId` / `siguienteSlot`,
 * 3) si es la final, devuelve el campeón.
 * Lanza error si la llave no existe, ya fue jugada, le falta un rival o el marcador no es decisivo.
 */
export function resolverAvancePlayoff(
  partidos: PartidoPlayoff[],
  partidoId: string,
  setsJugador1: number,
  setsJugador2: number,
  marcadorDetallado?: string | null,
): ResultadoAvancePlayoff {
  const partido = partidos.find((p) => p.id === partidoId)
  if (!partido) throw new Error('La llave de playoffs no existe.')
  if (partido.estado === 'jugado') throw new Error('Esta llave ya tiene un resultado registrado.')
  if (!partido.jugador1?.id || !partido.jugador2?.id) {
    throw new Error('La llave aún no tiene a sus dos jugadores definidos.')
  }
  const error = validarMarcadorPlayoff(setsJugador1, setsJugador2)
  if (error) throw new Error(error)

  const ganador = setsJugador1 > setsJugador2 ? partido.jugador1 : partido.jugador2
  const ahora = Date.now()
  const actualizaciones: ActualizacionPlayoff[] = [
    {
      id: partido.id,
      datos: {
        estado: 'jugado',
        ganadorId: ganador.id,
        marcador: `${setsJugador1} - ${setsJugador2}`,
        marcadorDetallado: marcadorDetallado?.trim() || null,
        actualizadoEn: ahora,
      },
    },
  ]

  if (partido.siguientePartidoId) {
    const siguiente = partidos.find((p) => p.id === partido.siguientePartidoId)
    if (!siguiente) throw new Error('No se encontró la llave siguiente del cuadro.')
    if (siguiente.estado === 'jugado') throw new Error('La llave siguiente ya fue jugada; no se puede modificar.')
    const slot = partido.siguienteSlot === 2 ? 'jugador2' : 'jugador1'
    const semillaKey = partido.siguienteSlot === 2 ? 'semilla2' : 'semilla1'
    const semillaGanador = ganador.id === partido.jugador1.id ? partido.semilla1 : partido.semilla2
    actualizaciones.push({
      id: siguiente.id,
      datos: { [slot]: ganador, [semillaKey]: semillaGanador ?? null, actualizadoEn: ahora } as Partial<PartidoPlayoff>,
    })
    return { actualizaciones, campeon: null }
  }

  return { actualizaciones, campeon: ganador }
}

/**
 * Esqueleto del cuadro de playoffs para N clasificados SIN jugadores reales.
 * Se usa mientras la fase de grupos no esté cerrada: conserva rondas, llaves,
 * semillas (Top N) y enlaces de avance, pero jugador1/jugador2 quedan en null.
 */
export function generarEsqueletoPlayoffs(N: number, torneoId: string = 'esqueleto'): PartidoPlayoff[] {
  const tablaFicticia: FilaPosicionOficial[] = Array.from({ length: N }, (_, i) => ({
    posicion: i + 1,
    jugadorId: `__slot_${i + 1}`,
    nombre: '',
    pj: 0,
    pg: 0,
    pp: 0,
    sf: 0,
    sc: 0,
    puntos: N - i,
  }))
  return generarCuadroPlayoffs(tablaFicticia, N, torneoId).partidos.map((p) => ({
    ...p,
    jugador1: null,
    jugador2: null,
    ganadorId: null,
    marcador: null,
    marcadorDetallado: null,
    estado: 'pendiente' as PartidoPlayoff['estado'],
  }))
}

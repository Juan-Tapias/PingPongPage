import { ref, computed } from 'vue'
import type {
  JugadorTorneo,
  PartidoGrupo,
  BurbujaRival,
  FilaPosicion,
  ResultadoPartido,
  EstadoPartido,
  ColorBordeBurbuja,
  Torneo,
  SetPartido,
  PartidoArbitrable,
} from '@/types'

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

export interface MalleroTorneo {
  jugador: JugadorTorneo
  totalMallas: number
  titulo: string
}

export function useTorneoGrupo(torneo: Torneo) {
  const usuarioActual: JugadorTorneo = {
    id: 'j-yo',
    nombre: 'Sebastián Tapias',
    iniciales: 'ST',
    telefono: '310 987 6543',
    tipo: 'camper',
    esUsuarioActual: true,
  }

  const jugadores = ref<JugadorTorneo[]>([
    usuarioActual,
    { id: 'j-1', nombre: 'Carlos Mendoza', iniciales: 'CM', telefono: '312 456 7890', tipo: 'camper' },
    { id: 'j-2', nombre: 'David Gómez', iniciales: 'DG', telefono: '314 567 8901', tipo: 'trabajador' },
    { id: 'j-3', nombre: 'Andrés Silva', iniciales: 'AS', telefono: '316 678 9012', tipo: 'camper' },
    { id: 'j-4', nombre: 'Mateo Fernández', iniciales: 'MF', telefono: '318 789 0123', tipo: 'trabajador' },
    { id: 'j-5', nombre: 'Alejandro Vargas', iniciales: 'AV', telefono: '320 890 1234', tipo: 'camper' },
    { id: 'j-6', nombre: 'Camilo Ruiz', iniciales: 'CR', telefono: '322 901 2345', tipo: 'camper' },
    { id: 'j-7', nombre: 'Javier Ortiz', iniciales: 'JO', telefono: '311 234 5678', tipo: 'trabajador' },
    { id: 'j-8', nombre: 'Lucas Morales', iniciales: 'LM', telefono: '313 345 6789', tipo: 'camper' },
    { id: 'j-9', nombre: 'Felipe Torres', iniciales: 'FT', telefono: '315 456 7891', tipo: 'trabajador' },
    { id: 'j-10', nombre: 'Daniel Castro', iniciales: 'DC', telefono: '317 567 8902', tipo: 'camper' },
    { id: 'j-11', nombre: 'Nicolás Herrera', iniciales: 'NH', telefono: '319 678 9013', tipo: 'camper' },
    { id: 'j-12', nombre: 'Valentina Ríos', iniciales: 'VR', telefono: '321 789 0124', tipo: 'trabajador' },
    { id: 'j-13', nombre: 'Santiago Peña', iniciales: 'SP', telefono: '323 890 1235', tipo: 'camper' },
    { id: 'j-14', nombre: 'Sofía Martínez', iniciales: 'SM', telefono: '325 901 2346', tipo: 'camper' },
  ])

  const jugadorEnCentro = ref<JugadorTorneo>(usuarioActual)

  const esPorIniciar = torneo.estado === 'por iniciar'

  const partidos = ref<PartidoGrupo[]>([
    {
      id: 'p-yo-1',
      jugador1Id: 'j-yo',
      jugador2Id: 'j-1',
      jugadorGanadorId: esPorIniciar ? undefined : 'j-yo',
      marcador: esPorIniciar ? undefined : '3 - 1',
      marcadorDetallado: esPorIniciar ? undefined : '11-8, 9-11, 11-7, 11-9',
      estado: esPorIniciar ? 'pendiente' : 'jugado',
      diasRestantes: 2,
      ronda: 1,
    },
    {
      id: 'p-yo-2',
      jugador1Id: 'j-yo',
      jugador2Id: 'j-2',
      estado: esPorIniciar ? 'pendiente' : 'pendiente_admin',
      diasRestantes: 0,
      ronda: 2,
    },
    {
      id: 'p-yo-3',
      jugador1Id: 'j-yo',
      jugador2Id: 'j-3',
      jugadorGanadorId: esPorIniciar ? undefined : 'j-yo',
      marcador: esPorIniciar ? undefined : '3 - 0',
      marcadorDetallado: esPorIniciar ? undefined : '11-6, 11-7, 11-8',
      estado: esPorIniciar ? 'pendiente' : 'jugado',
      diasRestantes: 2,
      ronda: 3,
    },
    {
      id: 'p-yo-4',
      jugador1Id: 'j-yo',
      jugador2Id: 'j-4',
      estado: 'pendiente',
      diasRestantes: 2, // Rival de turno a las 12 en punto
      ronda: 4,
    },
    {
      id: 'p-yo-5',
      jugador1Id: 'j-yo',
      jugador2Id: 'j-5',
      estado: 'pendiente',
      diasRestantes: 2,
      ronda: 5,
    },
    {
      id: 'p-yo-6',
      jugador1Id: 'j-yo',
      jugador2Id: 'j-6',
      estado: 'pendiente',
      diasRestantes: 2,
      ronda: 6,
    },
    {
      id: 'p-yo-7',
      jugador1Id: 'j-yo',
      jugador2Id: 'j-7',
      estado: 'pendiente',
      diasRestantes: 2,
      ronda: 7,
    },
    {
      id: 'p-yo-8',
      jugador1Id: 'j-yo',
      jugador2Id: 'j-8',
      estado: 'pendiente',
      diasRestantes: 2,
      ronda: 8,
    },
    {
      id: 'p-yo-9',
      jugador1Id: 'j-yo',
      jugador2Id: 'j-9',
      estado: 'pendiente',
      diasRestantes: 2,
      ronda: 9,
    },
    {
      id: 'p-yo-10',
      jugador1Id: 'j-yo',
      jugador2Id: 'j-10',
      estado: 'pendiente',
      diasRestantes: 2,
      ronda: 10,
    },

    {
      id: 'p-1-2',
      jugador1Id: 'j-1',
      jugador2Id: 'j-2',
      jugadorGanadorId: esPorIniciar ? undefined : 'j-1',
      marcador: esPorIniciar ? undefined : '3 - 2',
      marcadorDetallado: esPorIniciar ? undefined : '11-9, 8-11, 11-7, 7-11, 11-9',
      estado: esPorIniciar ? 'pendiente' : 'jugado',
      diasRestantes: 2,
    },
    {
      id: 'p-1-3',
      jugador1Id: 'j-1',
      jugador2Id: 'j-3',
      jugadorGanadorId: esPorIniciar ? undefined : 'j-3',
      marcador: esPorIniciar ? undefined : '0 - 3',
      marcadorDetallado: esPorIniciar ? undefined : '8-11, 6-11, 9-11',
      estado: esPorIniciar ? 'pendiente' : 'jugado',
      diasRestantes: 2,
    },
    {
      id: 'p-1-4',
      jugador1Id: 'j-1',
      jugador2Id: 'j-4',
      jugadorGanadorId: esPorIniciar ? undefined : 'j-1',
      marcador: esPorIniciar ? undefined : '3 - 1',
      marcadorDetallado: esPorIniciar ? undefined : '11-5, 11-8, 9-11, 11-7',
      estado: esPorIniciar ? 'pendiente' : 'jugado',
      diasRestantes: 2,
    },
    {
      id: 'p-2-3',
      jugador1Id: 'j-2',
      jugador2Id: 'j-3',
      jugadorGanadorId: esPorIniciar ? undefined : 'j-2',
      marcador: esPorIniciar ? undefined : '3 - 0',
      marcadorDetallado: esPorIniciar ? undefined : '11-7, 11-8, 11-9',
      estado: esPorIniciar ? 'pendiente' : 'jugado',
      diasRestantes: 2,
    },
    {
      id: 'p-2-4',
      jugador1Id: 'j-2',
      jugador2Id: 'j-4',
      jugadorGanadorId: esPorIniciar ? undefined : 'j-4',
      marcador: esPorIniciar ? undefined : '1 - 3',
      marcadorDetallado: esPorIniciar ? undefined : '11-8, 8-11, 9-11, 6-11',
      estado: esPorIniciar ? 'pendiente' : 'jugado',
      diasRestantes: 2,
    },
    {
      id: 'p-3-4',
      jugador1Id: 'j-3',
      jugador2Id: 'j-4',
      jugadorGanadorId: esPorIniciar ? undefined : 'j-3',
      marcador: esPorIniciar ? undefined : '3 - 2',
      marcadorDetallado: esPorIniciar ? undefined : '11-9, 9-11, 11-6, 8-11, 11-8',
      estado: esPorIniciar ? 'pendiente' : 'jugado',
      diasRestantes: 2,
    },

    {
      id: 'p-1-5',
      jugador1Id: 'j-1',
      jugador2Id: 'j-5',
      estado: 'pendiente',
      diasRestantes: 2,
      ronda: 4,
    },
    {
      id: 'p-2-6',
      jugador1Id: 'j-2',
      jugador2Id: 'j-6',
      estado: 'pendiente',
      diasRestantes: 2,
      ronda: 4,
    },
    {
      id: 'p-3-7',
      jugador1Id: 'j-3',
      jugador2Id: 'j-7',
      estado: 'pendiente',
      diasRestantes: 2,
      ronda: 4,
    },
    {
      id: 'p-4-8',
      jugador1Id: 'j-4',
      jugador2Id: 'j-8',
      estado: 'pendiente',
      diasRestantes: 2,
      ronda: 4,
    },
    {
      id: 'p-5-6',
      jugador1Id: 'j-5',
      jugador2Id: 'j-6',
      estado: 'pendiente',
      diasRestantes: 2,
      ronda: 5,
    },
    {
      id: 'p-7-8',
      jugador1Id: 'j-7',
      jugador2Id: 'j-8',
      estado: 'pendiente',
      diasRestantes: 2,
      ronda: 5,
    },
    {
      id: 'p-9-10',
      jugador1Id: 'j-9',
      jugador2Id: 'j-10',
      estado: 'pendiente',
      diasRestantes: 2,
      ronda: 5,
    },
  ])

  partidos.value.forEach((p) => {
    if (!p.codigoJugador1 || !p.codigoJugador2) {
      p.codigoJugador1 = generarCodigoSeguridad(p.jugador1Id, p.jugador2Id)
      p.codigoJugador2 = generarCodigoSeguridad(p.jugador2Id, p.jugador1Id)
    }
  })

  const buscarPartido = (idA: string, idB: string): PartidoGrupo => {
    const encontrado = partidos.value.find(
      (p) =>
        (p.jugador1Id === idA && p.jugador2Id === idB) ||
        (p.jugador1Id === idB && p.jugador2Id === idA),
    )

    if (encontrado) {
      if (!encontrado.codigoJugador1 || !encontrado.codigoJugador2) {
        encontrado.codigoJugador1 = generarCodigoSeguridad(encontrado.jugador1Id, encontrado.jugador2Id)
        encontrado.codigoJugador2 = generarCodigoSeguridad(encontrado.jugador2Id, encontrado.jugador1Id)
      }
      return encontrado
    }

    const nuevo: PartidoGrupo = {
      id: `p-${idA}-${idB}`,
      jugador1Id: idA,
      jugador2Id: idB,
      estado: 'pendiente',
      diasRestantes: 2,
      codigoJugador1: generarCodigoSeguridad(idA, idB),
      codigoJugador2: generarCodigoSeguridad(idB, idA),
    }
    partidos.value.push(nuevo)
    return nuevo
  }

  const rivalesPerimetro = computed<BurbujaRival[]>(() => {
    const centroId = jugadorEnCentro.value.id
    const otrosJugadores = jugadores.value.filter((j) => j.id !== centroId)

    const total = otrosJugadores.length
    if (total === 0) return []

    const indexRivalTurno = otrosJugadores.findIndex((j) => {
      const p = buscarPartido(centroId, j.id)
      return p.estado === 'pendiente'
    })

    const shift = indexRivalTurno >= 0 ? indexRivalTurno : 0
    const jugadoresRotados = [
      ...otrosJugadores.slice(shift),
      ...otrosJugadores.slice(0, shift),
    ]

    return jugadoresRotados.map((jugador, index) => {
      const partido = buscarPartido(centroId, jugador.id)

      let resultadoParaCentro: ResultadoPartido = 'pendiente'
      let ganadorNombre: string | undefined = undefined

      if (partido.estado === 'jugado' && partido.jugadorGanadorId) {
        if (partido.jugadorGanadorId === centroId) {
          resultadoParaCentro = 'ganado' // Verde
          ganadorNombre = jugadorEnCentro.value.nombre
        } else {
          resultadoParaCentro = 'perdido' // Rojo
          ganadorNombre = jugador.nombre
        }
      }
      // Color del borde de la burbuja orbital:
      // Verde: Victoria (partidos ya jugados a la derecha)
      // Rojo: Derrota (partidos ya jugados a la derecha)
      // Naranja: Pendiente Administrador (partidos vencidos a la derecha)
      // Gris: No jugado / Pendiente (rival a las 12 y todos los pendientes futuros a la izquierda)
      let colorBorde: ColorBordeBurbuja = 'gris'
      if (partido.estado === 'jugado') {
        colorBorde = resultadoParaCentro === 'ganado' ? 'verde' : 'rojo'
      } else if (partido.estado === 'pendiente_admin') {
        colorBorde = 'naranja'
      } else {
        colorBorde = 'gris'
      }

      const esRivalDeTurno = index === 0 && torneo.estado === 'en curso'
      const diasRestantes = esRivalDeTurno ? (partido.diasRestantes ?? 2) : 2
      const codigoSeguridadPropio = generarCodigoSeguridad(centroId, jugador.id)

      return {
        jugador,
        partido,
        resultadoParaCentro,
        estadoPartido: partido.estado,
        colorBorde,
        esRivalDeTurno,
        diasRestantes,
        marcador: partido.marcador,
        ganadorNombre,
        codigoSeguridadPropio,
      }
    })
  })

  const rivalDeTurno = computed(() => {
    return rivalesPerimetro.value.find((r) => r.esRivalDeTurno) ?? rivalesPerimetro.value[0]
  })

  const esVistaRival = computed(() => {
    return jugadorEnCentro.value.id !== usuarioActual.id
  })

  const verVistaRival = (rival: JugadorTorneo) => {
    jugadorEnCentro.value = rival
  }

  const volverAMiVista = () => {
    jugadorEnCentro.value = usuarioActual
  }

  // ==========================================
  // ARBITRAJE DE PARTIDOS
  // ==========================================
  const arbitroActual = ref<JugadorTorneo>(usuarioActual)

  const setArbitroActual = (jugador: JugadorTorneo) => {
    arbitroActual.value = jugador
  }

  // Partidos pendientes que el árbitro puede oficiar (excluye si el árbitro es jugador en esa ronda)
  const partidosDisponiblesParaArbitrar = computed<PartidoArbitrable[]>(() => {
    const aId = arbitroActual.value.id
    return partidos.value
      .filter((p) => p.estado === 'pendiente' && p.jugador1Id !== aId && p.jugador2Id !== aId)
      .map((p) => {
        const jugador1 = jugadores.value.find((j) => j.id === p.jugador1Id) ?? {
          id: p.jugador1Id,
          nombre: 'Jugador 1',
          iniciales: 'J1',
          telefono: '300 000 0000',
        }
        const jugador2 = jugadores.value.find((j) => j.id === p.jugador2Id) ?? {
          id: p.jugador2Id,
          nombre: 'Jugador 2',
          iniciales: 'J2',
          telefono: '300 000 0000',
        }
        return {
          partido: p,
          jugador1,
          jugador2,
        }
      })
  })

  // Validación de seguridad con códigos de 5 dígitos
  const validarCodigosArbitraje = (
    partidoId: string,
    codigoJ1: string,
    codigoJ2: string,
  ): { valido: boolean; mensaje: string } => {
    const partido = partidos.value.find((p) => p.id === partidoId)
    if (!partido) {
      return { valido: false, mensaje: 'El partido no existe en este torneo.' }
    }

    const c1 = codigoJ1.trim()
    const c2 = codigoJ2.trim()

    const coincideDirecto = c1 === partido.codigoJugador1 && c2 === partido.codigoJugador2
    const coincideInverso = c1 === partido.codigoJugador2 && c2 === partido.codigoJugador1

    if (coincideDirecto || coincideInverso) {
      return { valido: true, mensaje: 'Códigos confirmados correctamente. Accediendo al marcador virtual...' }
    }

    return {
      valido: false,
      mensaje: 'Códigos incorrectos. Solicita a ambos jugadores su PIN de 5 dígitos para este partido.',
    }
  }

  // Registrar resultado de partido arbitrado (al mejor de 3 sets)
  const registrarResultadoPartido = (
    partidoId: string,
    setsJugados: SetPartido[],
    ganadorId: string,
  ) => {
    const pIndex = partidos.value.findIndex((p) => p.id === partidoId)
    if (pIndex === -1) return

    const partido = partidos.value[pIndex]
    if (!partido) return

    const setsG1 = setsJugados.filter((s) => s.ganadorId === partido.jugador1Id).length
    const setsG2 = setsJugados.filter((s) => s.ganadorId === partido.jugador2Id).length

    const marcadorResumen = `${setsG1} - ${setsG2}`
    const marcadorDetallado = setsJugados.map((s) => `${s.puntosJugador1}-${s.puntosJugador2}`).join(', ')

    partidos.value[pIndex] = {
      ...partido,
      estado: 'jugado',
      jugadorGanadorId: ganadorId,
      marcador: marcadorResumen,
      marcadorDetallado,
      arbitroId: arbitroActual.value.id,
      sets: setsJugados,
      diasRestantes: 0,
    }
  }

  const tablaPosiciones = computed<FilaPosicion[]>(() => {
    const statsMap = new Map<
      string,
      { pj: number; pg: number; pp: number; sf: number; sc: number; puntos: number }
    >()

    jugadores.value.forEach((j) => {
      statsMap.set(j.id, { pj: 0, pg: 0, pp: 0, sf: 0, sc: 0, puntos: 0 })
    })

    partidos.value.forEach((p) => {
      if (p.estado === 'jugado' && p.jugadorGanadorId) {
        const stats1 = statsMap.get(p.jugador1Id)
        const stats2 = statsMap.get(p.jugador2Id)

        if (stats1 && stats2) {
          stats1.pj += 1
          stats2.pj += 1

          let sf1 = 0
          let sc1 = 0
          let sf2 = 0
          let sc2 = 0

          if (p.sets && p.sets.length > 0) {
            p.sets.forEach((s) => {
              if (s.ganadorId === p.jugador1Id) {
                sf1 += 1
                sc2 += 1
              } else if (s.ganadorId === p.jugador2Id) {
                sf2 += 1
                sc1 += 1
              }
            })
          } else {
            if (p.jugadorGanadorId === p.jugador1Id) {
              sf1 = 3
              sc1 = 1
              sf2 = 1
              sc2 = 3
            } else {
              sf1 = 1
              sc1 = 3
              sf2 = 3
              sc2 = 1
            }
          }

          stats1.sf += sf1
          stats1.sc += sc1
          stats2.sf += sf2
          stats2.sc += sc2

          if (p.jugadorGanadorId === p.jugador1Id) {
            stats1.pg += 1
            stats1.puntos += 2
            stats2.pp += 1
            stats2.puntos += 1
          } else {
            stats2.pg += 1
            stats2.puntos += 2
            stats1.pp += 1
            stats1.puntos += 1
          }
        }
      }
    })

    const filas: FilaPosicion[] = jugadores.value.map((j) => {
      const stats = statsMap.get(j.id) || {
        pj: 0,
        pg: 0,
        pp: 0,
        sf: 0,
        sc: 0,
        puntos: 0,
      }
      return {
        posicion: 0,
        jugadorId: j.id,
        nombre: j.nombre,
        pj: stats.pj,
        pg: stats.pg,
        pp: stats.pp,
        sf: stats.sf,
        sc: stats.sc,
        puntos: stats.puntos,
        esUsuarioActual: j.id === usuarioActual.id,
      }
    })

    filas.sort((a, b) => {
      if (b.puntos !== a.puntos) return b.puntos - a.puntos
      const diffB = b.sf - b.sc
      const diffA = a.sf - a.sc
      return diffB - diffA
    })

    return filas.map((fila, index) => ({
      ...fila,
      posicion: index + 1,
    }))
  })

  // -------------------------------------------------------------
  // CÁLCULO DE "EL MÁS MALLERO" DEL TORNEO (ACUMULADO DE MALLAS)
  // -------------------------------------------------------------
  const mallasPorJugador = computed<Map<string, number>>(() => {
    const mapa = new Map<string, number>()
    jugadores.value.forEach((j) => mapa.set(j.id, 0))

    const mockMallas: Record<string, number> = {
      'j-4': 14,
      'j-1': 11,
      'j-3': 9,
      'j-yo': 8,
      'j-5': 6,
      'j-2': 5,
    }
    Object.entries(mockMallas).forEach(([id, cant]) => {
      mapa.set(id, cant)
    })

    // Sumar de los sets registrados en tiempo real por los árbitros
    partidos.value.forEach((p) => {
      if (p.sets && p.sets.length > 0) {
        p.sets.forEach((set) => {
          const acum1 = mapa.get(p.jugador1Id) || 0
          const acum2 = mapa.get(p.jugador2Id) || 0
          mapa.set(p.jugador1Id, acum1 + (set.mallasJugador1 || 0))
          mapa.set(p.jugador2Id, acum2 + (set.mallasJugador2 || 0))
        })
      }
    })

    return mapa
  })

  const jugadorMasMallero = computed<MalleroTorneo | null>(() => {
    let mejorJugadorId: string | null = null
    let maxMallas = -1

    mallasPorJugador.value.forEach((mallas, jId) => {
      if (mallas > maxMallas) {
        maxMallas = mallas
        mejorJugadorId = jId
      }
    })

    if (!mejorJugadorId || maxMallas <= 0) return null
    const jugador = jugadores.value.find((j) => j.id === mejorJugadorId)
    if (!jugador) return null

    return {
      jugador,
      totalMallas: maxMallas,
      titulo: `El más mallero de ${torneo.nombre}`,
    }
  })

  return {
    usuarioActual,
    jugadores,
    jugadorEnCentro,
    partidos,
    rivalesPerimetro,
    rivalDeTurno,
    esVistaRival,
    verVistaRival,
    volverAMiVista,
    tablaPosiciones,
    arbitroActual,
    setArbitroActual,
    partidosDisponiblesParaArbitrar,
    validarCodigosArbitraje,
    registrarResultadoPartido,
    mallasPorJugador,
    jugadorMasMallero,
  }
}

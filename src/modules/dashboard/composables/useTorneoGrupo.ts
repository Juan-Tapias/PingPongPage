import { ref, computed } from 'vue'
import type {
  JugadorTorneo,
  PartidoGrupo,
  BurbujaRival,
  FilaPosicion,
  ResultadoPartido,
  Torneo,
} from '@/types'

export function useTorneoGrupo(torneo: Torneo) {
  const usuarioActual: JugadorTorneo = {
    id: 'j-yo',
    nombre: 'Sebastián Tapias',
    iniciales: 'ST',
    telefono: '310 987 6543',
    esUsuarioActual: true,
  }

  const jugadores = ref<JugadorTorneo[]>([
    usuarioActual,
    { id: 'j-1', nombre: 'Carlos Mendoza', iniciales: 'CM', telefono: '312 456 7890' },
    { id: 'j-2', nombre: 'David Gómez', iniciales: 'DG', telefono: '314 567 8901' },
    { id: 'j-3', nombre: 'Andrés Silva', iniciales: 'AS', telefono: '316 678 9012' },
    { id: 'j-4', nombre: 'Mateo Fernández', iniciales: 'MF', telefono: '318 789 0123' },
    { id: 'j-5', nombre: 'Alejandro Vargas', iniciales: 'AV', telefono: '320 890 1234' },
    { id: 'j-6', nombre: 'Camilo Ruiz', iniciales: 'CR', telefono: '322 901 2345' },
    { id: 'j-7', nombre: 'Javier Ortiz', iniciales: 'JO', telefono: '311 234 5678' },
    { id: 'j-8', nombre: 'Lucas Morales', iniciales: 'LM', telefono: '313 345 6789' },
    { id: 'j-9', nombre: 'Felipe Torres', iniciales: 'FT', telefono: '315 456 7891' },
    { id: 'j-10', nombre: 'Daniel Castro', iniciales: 'DC', telefono: '317 567 8902' },
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
      jugadorGanadorId: esPorIniciar ? undefined : 'j-2',
      marcador: esPorIniciar ? undefined : '1 - 3',
      marcadorDetallado: esPorIniciar ? undefined : '9-11, 11-8, 7-11, 8-11',
      estado: esPorIniciar ? 'pendiente' : 'jugado',
      diasRestantes: 2,
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
      diasRestantes: 2, // Rival actual de turno a las 12 en punto
      ronda: 4,
    },
    {
      id: 'p-yo-5',
      jugador1Id: 'j-yo',
      jugador2Id: 'j-5',
      estado: 'pendiente',
      diasRestantes: 2, // El plazo se reinicia a 2 días al pasar a este rival
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
  ])

  const buscarPartido = (idA: string, idB: string): PartidoGrupo => {
    const encontrado = partidos.value.find(
      (p) =>
        (p.jugador1Id === idA && p.jugador2Id === idB) ||
        (p.jugador1Id === idB && p.jugador2Id === idA),
    )

    if (encontrado) return encontrado

    return {
      id: `p-${idA}-${idB}`,
      jugador1Id: idA,
      jugador2Id: idB,
      estado: 'pendiente',
      diasRestantes: 2,
    }
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

      const esRivalDeTurno = index === 0 && torneo.estado === 'en curso'

      const diasRestantes = esRivalDeTurno ? (partido.diasRestantes ?? 2) : 2

      return {
        jugador,
        partido,
        resultadoParaCentro,
        esRivalDeTurno,
        diasRestantes,
        marcador: partido.marcador,
        ganadorNombre,
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

          if (p.jugadorGanadorId === p.jugador1Id) {
            stats1.pg += 1
            stats1.puntos += 2
            stats1.sf += 3
            stats1.sc += 1
            stats2.pp += 1
            stats2.puntos += 1
            stats2.sf += 1
            stats2.sc += 3
          } else {
            stats2.pg += 1
            stats2.puntos += 2
            stats2.sf += 3
            stats2.sc += 1
            stats1.pp += 1
            stats1.puntos += 1
            stats1.sf += 1
            stats1.sc += 3
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
  }
}

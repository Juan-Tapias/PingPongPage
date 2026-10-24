import { computed, isRef, type Ref } from 'vue'
import type {
  FilaPosicion,
  JugadorTorneo,
  PartidoPlayoff,
  CuadroPlayoffs,
  Torneo,
} from '@/types'

const crearPlaceholder = (id: string, nombre: string, iniciales: string): JugadorTorneo => ({
  id,
  nombre,
  iniciales,
  telefono: '',
  tipo: 'camper',
  esUsuarioActual: false,
})

export function usePlayoffs(
  filasPosiciones: FilaPosicion[] | Ref<FilaPosicion[]> | (() => FilaPosicion[]),
  cantidadClasificados: number | Ref<number> | (() => number) = 4,
  torneo?: Torneo | null | Ref<Torneo | null | undefined> | (() => Torneo | null | undefined)
) {
  const getFilas = (): FilaPosicion[] => {
    if (typeof filasPosiciones === 'function') return filasPosiciones()
    return isRef(filasPosiciones) ? filasPosiciones.value : filasPosiciones || []
  }

  const getCantidad = (): number => {
    if (typeof cantidadClasificados === 'function') return cantidadClasificados()
    return isRef(cantidadClasificados) ? cantidadClasificados.value : (cantidadClasificados ?? 4)
  }

  const getTorneo = (): Torneo | null | undefined => {
    if (!torneo) return null
    if (typeof torneo === 'function') return torneo()
    return isRef(torneo) ? torneo.value : torneo
  }

  // Bolsa acumulada dinámica según participantes reales y costo de inscripción del torneo
  const bolsaPremio = computed<number>(() => {
    const t = getTorneo()
    const filas = getFilas()
    const costo = Number(t?.costoInscripcion) || 6000
    const totalParticipantes = Math.max(
      filas.length,
      Number(t?.cuposTomados) || 0
    )
    return Math.max(0, totalParticipantes * costo)
  })

  const bolsaPremioFormateada = computed<string>(() => {
    return bolsaPremio.value.toLocaleString('es-CO')
  })

  // Verificar si la fase regular ya comenzó con partidos disputados
  const hayPartidosJugados = computed(() => {
    return getFilas().some((f) => f.pj > 0 || f.pg > 0 || f.pp > 0)
  })

  // Mapear los jugadores clasificados desde las posiciones reales de la tabla
  const clasificados = computed<JugadorTorneo[]>(() => {
    if (!hayPartidosJugados.value) {
      return []
    }
    return getFilas().map((f) => ({
      id: f.jugadorId,
      nombre: f.nombre,
      iniciales: f.nombre
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      telefono: '',
      tipo: 'camper' as const,
      esUsuarioActual: f.esUsuarioActual,
    }))
  })

  // Partidos del Play-in: Solo aplica si el admin eligió formato de 12 clasificados
  const partidosPlayIn = computed<PartidoPlayoff[]>(() => {
    if (getCantidad() < 10) return []
    const list = clasificados.value

    const matches: PartidoPlayoff[] = []
    const numPlayIn = Math.min(4, Math.max(1, Math.floor((list.length - 4) / 2)))

    for (let i = 0; i < numPlayIn; i++) {
      const idx1 = 4 + i
      const idx2 = list.length - 1 - i
      matches.push({
        id: `playin-${i + 1}`,
        ronda: 'play_in',
        numeroLlave: i + 1,
        jugador1: list[idx1] || crearPlaceholder(`seed-${idx1 + 1}`, `Puesto ${idx1 + 1}°`, `#${idx1 + 1}`),
        jugador2: list[idx2] || crearPlaceholder(`seed-${idx2 + 1}`, `Puesto ${idx2 + 1}°`, `#${idx2 + 1}`),
        estado: 'pendiente',
        anilloOrbital: 3,
        siguientePartidoId: `cuartos-${i + 1}`,
      })
    }

    return matches
  })

  // Partidos de Cuartos de Final: Aplica para 6 u 8 clasificados
  const partidosCuartos = computed<PartidoPlayoff[]>(() => {
    if (getCantidad() < 5) return []
    const list = clasificados.value

    // Formato Top 6:
    // Cuartos 1: Puesto 3° vs Puesto 6°
    // Cuartos 2: Puesto 4° vs Puesto 5°
    // (Puestos 1° y 2° esperan en Semis con BYE)
    if (getCantidad() <= 6) {
      return [
        {
          id: 'cuartos-1',
          ronda: 'cuartos',
          numeroLlave: 1,
          jugador1: list[2] || crearPlaceholder('p3', 'Puesto 3°', '#3'),
          jugador2: list[5] || crearPlaceholder('p6', getCantidad() === 5 ? 'Pase Directo' : 'Puesto 6°', '#6'),
          estado: 'pendiente',
          anilloOrbital: 2,
          siguientePartidoId: 'semi-1',
        },
        {
          id: 'cuartos-2',
          ronda: 'cuartos',
          numeroLlave: 2,
          jugador1: list[3] || crearPlaceholder('p4', 'Puesto 4°', '#4'),
          jugador2: list[4] || crearPlaceholder('p5', 'Puesto 5°', '#5'),
          estado: 'pendiente',
          anilloOrbital: 2,
          siguientePartidoId: 'semi-2',
        },
      ]
    }

    // Formato Top 10+: Top 4 con BYE a Cuartos + Play-In (Repechaje) para puestos 5° al 12°
    if (getCantidad() >= 10) {
      const p1 = partidosPlayIn.value[0]
      const p2 = partidosPlayIn.value[1]
      const p3 = partidosPlayIn.value[2]
      const p4 = partidosPlayIn.value[3]

      const resolverRivalPlayIn = (partido: PartidoPlayoff | undefined, numLlave: number): JugadorTorneo => {
        if (!partido) return crearPlaceholder(`g-playin-${numLlave}`, `Ganador Llave ${numLlave}`, `L${numLlave}`)
        if (partido.estado === 'jugado' && partido.ganadorId) {
          if (partido.jugador1?.id === partido.ganadorId) return partido.jugador1
          if (partido.jugador2?.id === partido.ganadorId) return partido.jugador2
        }
        return crearPlaceholder(`g-playin-${numLlave}`, `Ganador Llave ${numLlave}`, `L${numLlave}`)
      }

      return [
        {
          id: 'cuartos-1',
          ronda: 'cuartos',
          numeroLlave: 1,
          jugador1: list[0] || crearPlaceholder('p1', 'Puesto 1° (Top 1 BYE)', '#1'),
          jugador2: resolverRivalPlayIn(p1, 1),
          estado: 'pendiente',
          anilloOrbital: 2,
          siguientePartidoId: 'semi-1',
        },
        {
          id: 'cuartos-2',
          ronda: 'cuartos',
          numeroLlave: 2,
          jugador1: list[3] || crearPlaceholder('p4', 'Puesto 4° (Top 4 BYE)', '#4'),
          jugador2: resolverRivalPlayIn(p2, 2),
          estado: 'pendiente',
          anilloOrbital: 2,
          siguientePartidoId: 'semi-1',
        },
        {
          id: 'cuartos-3',
          ronda: 'cuartos',
          numeroLlave: 3,
          jugador1: list[1] || crearPlaceholder('p2', 'Puesto 2° (Top 2 BYE)', '#2'),
          jugador2: resolverRivalPlayIn(p3, 3),
          estado: 'pendiente',
          anilloOrbital: 2,
          siguientePartidoId: 'semi-2',
        },
        {
          id: 'cuartos-4',
          ronda: 'cuartos',
          numeroLlave: 4,
          jugador1: list[2] || crearPlaceholder('p3', 'Puesto 3° (Top 3 BYE)', '#3'),
          jugador2: resolverRivalPlayIn(p4, 4),
          estado: 'pendiente',
          anilloOrbital: 2,
          siguientePartidoId: 'semi-2',
        },
      ]
    }

    // Formato Top 8: Cuartos de final estándar (1v8, 4v5, 2v7, 3v6)
    return [
      {
        id: 'cuartos-1',
        ronda: 'cuartos',
        numeroLlave: 1,
        jugador1: list[0] || crearPlaceholder('p1', 'Puesto 1° (Top Seed)', '#1'),
        jugador2: list[7] || crearPlaceholder('p8', 'Puesto 8°', '#8'),
        estado: 'pendiente',
        anilloOrbital: 2,
        siguientePartidoId: 'semi-1',
      },
      {
        id: 'cuartos-2',
        ronda: 'cuartos',
        numeroLlave: 2,
        jugador1: list[3] || crearPlaceholder('p4', 'Puesto 4°', '#4'),
        jugador2: list[4] || crearPlaceholder('p5', 'Puesto 5°', '#5'),
        estado: 'pendiente',
        anilloOrbital: 2,
        siguientePartidoId: 'semi-1',
      },
      {
        id: 'cuartos-3',
        ronda: 'cuartos',
        numeroLlave: 3,
        jugador1: list[1] || crearPlaceholder('p2', 'Puesto 2° (Top Seed)', '#2'),
        jugador2: list[6] || crearPlaceholder('p7', 'Puesto 7°', '#7'),
        estado: 'pendiente',
        anilloOrbital: 2,
        siguientePartidoId: 'semi-2',
      },
      {
        id: 'cuartos-4',
        ronda: 'cuartos',
        numeroLlave: 4,
        jugador1: list[2] || crearPlaceholder('p3', 'Puesto 3°', '#3'),
        jugador2: list[5] || crearPlaceholder('p6', 'Puesto 6°', '#6'),
        estado: 'pendiente',
        anilloOrbital: 2,
        siguientePartidoId: 'semi-2',
      },
    ]
  })

  // Semifinales: Solo si clasifican 4 o más
  const partidosSemis = computed<PartidoPlayoff[]>(() => {
    if (getCantidad() < 4) return []
    const list = clasificados.value

    const resolverGanadorCuartos = (partidoId: string, labelDefault: string, tag: string): JugadorTorneo => {
      const p = partidosCuartos.value.find((c) => c.id === partidoId)
      if (p && p.estado === 'jugado' && p.ganadorId) {
        if (p.jugador1?.id === p.ganadorId) return p.jugador1
        if (p.jugador2?.id === p.ganadorId) return p.jugador2
      }
      return crearPlaceholder(`g-${partidoId}`, labelDefault, tag)
    }

    // Si hubo Cuartos previos (6):
    if (getCantidad() === 6) {
      return [
        {
          id: 'semi-1',
          ronda: 'semifinal',
          numeroLlave: 1,
          jugador1: list[0] || crearPlaceholder('s1-j1', 'Puesto 1° (Top Seed)', '#1'),
          jugador2: resolverGanadorCuartos('cuartos-1', 'Ganador Cuartos 1', 'G1'),
          estado: 'pendiente',
          anilloOrbital: 2,
          siguientePartidoId: 'final-1',
        },
        {
          id: 'semi-2',
          ronda: 'semifinal',
          numeroLlave: 2,
          jugador1: list[1] || crearPlaceholder('s2-j1', 'Puesto 2° (Top Seed)', '#2'),
          jugador2: resolverGanadorCuartos('cuartos-2', 'Ganador Cuartos 2', 'G2'),
          estado: 'pendiente',
          anilloOrbital: 2,
          siguientePartidoId: 'final-1',
        },
      ]
    }

    if (getCantidad() >= 8) {
      return [
        {
          id: 'semi-1',
          ronda: 'semifinal',
          numeroLlave: 1,
          jugador1: resolverGanadorCuartos('cuartos-1', 'Ganador Cuartos 1', 'G1'),
          jugador2: resolverGanadorCuartos('cuartos-2', 'Ganador Cuartos 2', 'G2'),
          estado: 'pendiente',
          anilloOrbital: 2,
          siguientePartidoId: 'final-1',
        },
        {
          id: 'semi-2',
          ronda: 'semifinal',
          numeroLlave: 2,
          jugador1: resolverGanadorCuartos('cuartos-3', 'Ganador Cuartos 3', 'G3'),
          jugador2: resolverGanadorCuartos('cuartos-4', 'Ganador Cuartos 4', 'G4'),
          estado: 'pendiente',
          anilloOrbital: 2,
          siguientePartidoId: 'final-1',
        },
      ]
    }

    // Top 4 directo:
    return [
      {
        id: 'semi-1',
        ronda: 'semifinal',
        numeroLlave: 1,
        jugador1: list[0] || crearPlaceholder('s1-j1', 'Puesto 1° (Top Seed)', '#1'),
        jugador2: list[3] || crearPlaceholder('s1-j2', 'Puesto 4°', '#4'),
        estado: 'pendiente',
        anilloOrbital: 2,
        siguientePartidoId: 'final-1',
      },
      {
        id: 'semi-2',
        ronda: 'semifinal',
        numeroLlave: 2,
        jugador1: list[1] || crearPlaceholder('s2-j1', 'Puesto 2° (Top Seed)', '#2'),
        jugador2: list[2] || crearPlaceholder('s2-j2', 'Puesto 3°', '#3'),
        estado: 'pendiente',
        anilloOrbital: 2,
        siguientePartidoId: 'final-1',
      },
    ]
  })

  // Gran Final:
  const granFinal = computed<PartidoPlayoff>(() => {
    const list = clasificados.value
    // Si solo clasifican 2: Final directa entre los dos mejores
    if (getCantidad() === 2) {
      return {
        id: 'final-1',
        ronda: 'final',
        numeroLlave: 1,
        jugador1: list[0] || crearPlaceholder('final-j1', 'Puesto 1°', '#1'),
        jugador2: list[1] || crearPlaceholder('final-j2', 'Puesto 2°', '#2'),
        estado: 'pendiente',
        anilloOrbital: 1,
      }
    }

    const resolverGanadorSemi = (semiId: string, labelDefault: string, tag: string): JugadorTorneo => {
      const p = partidosSemis.value.find((s) => s.id === semiId)
      if (p && p.estado === 'jugado' && p.ganadorId) {
        if (p.jugador1?.id === p.ganadorId) return p.jugador1
        if (p.jugador2?.id === p.ganadorId) return p.jugador2
      }
      return crearPlaceholder(`g-${semiId}`, labelDefault, tag)
    }

    // Si clasifican 4 o más: Ganador Semi 1 vs Ganador Semi 2
    return {
      id: 'final-1',
      ronda: 'final',
      numeroLlave: 1,
      jugador1: resolverGanadorSemi('semi-1', 'Ganador Semifinal 1', 'S1'),
      jugador2: resolverGanadorSemi('semi-2', 'Ganador Semifinal 2', 'S2'),
      estado: 'pendiente',
      anilloOrbital: 1,
    }
  })

  const cuadroCompleto = computed<CuadroPlayoffs>(() => ({
    playIn: partidosPlayIn.value,
    cuartos: partidosCuartos.value,
    semifinales: partidosSemis.value,
    granFinal: granFinal.value,
    bolsaPremio: bolsaPremio.value,
  }))

  const idsMiCamino = computed<Set<string>>(() => {
    const ids = new Set<string>()

    // 1. Play-in
    const pPlayIn = partidosPlayIn.value.find(
      (p) => p.jugador1?.esUsuarioActual || p.jugador2?.esUsuarioActual,
    )
    if (pPlayIn) {
      ids.add(pPlayIn.id)
      const num = pPlayIn.numeroLlave
      ids.add(`cuartos-${num}`)
      ids.add(num <= 2 ? 'semi-1' : 'semi-2')
      ids.add('final-1')
      return ids
    }

    // 2. Cuartos
    const pCuartos = partidosCuartos.value.find(
      (p) => p.jugador1?.esUsuarioActual || p.jugador2?.esUsuarioActual,
    )
    if (pCuartos) {
      ids.add(pCuartos.id)
      const num = pCuartos.numeroLlave
      ids.add(num <= 2 ? 'semi-1' : 'semi-2')
      ids.add('final-1')
      return ids
    }

    // 3. Semifinal
    const pSemi = partidosSemis.value.find(
      (p) => p.jugador1?.esUsuarioActual || p.jugador2?.esUsuarioActual,
    )
    if (pSemi) {
      ids.add(pSemi.id)
      ids.add('final-1')
      return ids
    }

    // 4. Final
    if (
      granFinal.value.jugador1?.esUsuarioActual ||
      granFinal.value.jugador2?.esUsuarioActual
    ) {
      ids.add('final-1')
    }

    return ids
  })

  const miCamino = computed<PartidoPlayoff[]>(() => {
    const todos = [
      ...partidosPlayIn.value,
      ...partidosCuartos.value,
      ...partidosSemis.value,
      granFinal.value,
    ]

    return todos.filter((p) => idsMiCamino.value.has(p.id))
  })

  return {
    bolsaPremio,
    bolsaPremioFormateada,
    clasificados,
    partidosPlayIn,
    partidosCuartos,
    partidosSemis,
    granFinal,
    cuadroCompleto,
    miCamino,
    idsMiCamino,
  }
}

import { computed } from 'vue'
import type {
  FilaPosicion,
  JugadorTorneo,
  PartidoPlayoff,
  CuadroPlayoffs,
} from '@/types'

const crearPlaceholder = (id: string, nombre: string, iniciales: string): JugadorTorneo => ({
  id,
  nombre,
  iniciales,
  telefono: '',
  tipo: 'camper',
  esUsuarioActual: false,
})

export function usePlayoffs(filasPosiciones: FilaPosicion[], cantidadClasificados: number = 4) {
  // Bolsa acumulada dinámica según participantes reales de la fase regular
  const bolsaPremio = computed<number>(() => {
    return Math.max(0, filasPosiciones.length * 6000)
  })

  const bolsaPremioFormateada = computed<string>(() => {
    return bolsaPremio.value.toLocaleString('es-CO')
  })

  // Mapear los jugadores clasificados desde las posiciones reales de la tabla
  const clasificados = computed<JugadorTorneo[]>(() => {
    return filasPosiciones.map((f) => ({
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
    if (cantidadClasificados < 10) return []
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
    if (cantidadClasificados < 5) return []
    const list = clasificados.value

    // Formato Top 6:
    // Cuartos 1: Puesto 3° vs Puesto 6°
    // Cuartos 2: Puesto 4° vs Puesto 5°
    // (Puestos 1° y 2° esperan en Semis con BYE)
    if (cantidadClasificados <= 6) {
      return [
        {
          id: 'cuartos-1',
          ronda: 'cuartos',
          numeroLlave: 1,
          jugador1: list[2] || crearPlaceholder('p3', 'Puesto 3°', '#3'),
          jugador2: list[5] || crearPlaceholder('p6', cantidadClasificados === 5 ? 'Pase Directo' : 'Puesto 6°', '#6'),
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

    // Formato Top 8: Cuartos de final estándar
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
    if (cantidadClasificados < 4) return []
    const list = clasificados.value

    // Si hubo Cuartos previos (6 u 8):
    if (cantidadClasificados === 6) {
      return [
        {
          id: 'semi-1',
          ronda: 'semifinal',
          numeroLlave: 1,
          jugador1: list[0] || crearPlaceholder('s1-j1', 'Puesto 1° (Top Seed)', '#1'),
          jugador2: crearPlaceholder('s1-j2', 'Ganador Cuartos 1', 'G1'),
          estado: 'pendiente',
          anilloOrbital: 2,
          siguientePartidoId: 'final-1',
        },
        {
          id: 'semi-2',
          ronda: 'semifinal',
          numeroLlave: 2,
          jugador1: list[1] || crearPlaceholder('s2-j1', 'Puesto 2° (Top Seed)', '#2'),
          jugador2: crearPlaceholder('s2-j2', 'Ganador Cuartos 2', 'G2'),
          estado: 'pendiente',
          anilloOrbital: 2,
          siguientePartidoId: 'final-1',
        },
      ]
    }

    if (cantidadClasificados >= 8) {
      return [
        {
          id: 'semi-1',
          ronda: 'semifinal',
          numeroLlave: 1,
          jugador1: crearPlaceholder('s1-j1', 'Ganador Cuartos 1', 'G1'),
          jugador2: crearPlaceholder('s1-j2', 'Ganador Cuartos 2', 'G2'),
          estado: 'pendiente',
          anilloOrbital: 2,
          siguientePartidoId: 'final-1',
        },
        {
          id: 'semi-2',
          ronda: 'semifinal',
          numeroLlave: 2,
          jugador1: crearPlaceholder('s2-j1', 'Ganador Cuartos 3', 'G3'),
          jugador2: crearPlaceholder('s2-j2', 'Ganador Cuartos 4', 'G4'),
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
    if (cantidadClasificados === 2) {
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

    // Si clasifican 4 o más: Ganador Semi 1 vs Ganador Semi 2
    return {
      id: 'final-1',
      ronda: 'final',
      numeroLlave: 1,
      jugador1: crearPlaceholder('final-j1', 'Ganador Semifinal 1', 'S1'),
      jugador2: crearPlaceholder('final-j2', 'Ganador Semifinal 2', 'S2'),
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

  const miCamino = computed<PartidoPlayoff[]>(() => {
    const todos = [
      ...partidosPlayIn.value,
      ...partidosCuartos.value,
      ...partidosSemis.value,
      granFinal.value,
    ]

    return todos.filter(
      (p) => p.jugador1?.esUsuarioActual || p.jugador2?.esUsuarioActual,
    )
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
  }
}

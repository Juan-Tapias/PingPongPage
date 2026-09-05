import { ref, computed } from 'vue'
import type {
  FilaPosicion,
  JugadorTorneo,
  PartidoPlayoff,
  CuadroPlayoffs,
} from '@/types'

export function usePlayoffs(filasPosiciones: FilaPosicion[]) {
  // Bolsa acumulada: 15 participantes * $6.000 COP = $90.000 COP
  const bolsaPremio = 90000

  // Mapear los jugadores clasificados desde las posiciones de la tabla
  const clasificados = computed<JugadorTorneo[]>(() => {
    return filasPosiciones.slice(0, 12).map((f) => ({
      id: f.jugadorId,
      nombre: f.nombre,
      iniciales: f.nombre
        .split(' ')
        .map((p) => p[0])
        .join('')
        .slice(0, 2)
        .toUpperCase(),
      telefono: '310 000 0000',
      esUsuarioActual: f.esUsuarioActual,
    }))
  })

  // Partidos del Play-in (Anillo 3 Exterior: Puestos 5 al 12)
  // Llaves cruzadas: 5vs12, 6vs11, 7vs10, 8vs9
  const partidosPlayIn = ref<PartidoPlayoff[]>([
    {
      id: 'playin-1',
      ronda: 'play_in',
      numeroLlave: 1,
      jugador1: clasificados.value[4], // 5° puesto
      jugador2: clasificados.value[11], // 12° puesto
      marcador: '2 - 1',
      marcadorDetallado: '11-9, 9-11, 11-8',
      ganadorId: clasificados.value[4]?.id,
      estado: 'jugado',
      anilloOrbital: 3,
      siguientePartidoId: 'cuartos-1',
    },
    {
      id: 'playin-2',
      ronda: 'play_in',
      numeroLlave: 2,
      jugador1: clasificados.value[5], // 6° puesto
      jugador2: clasificados.value[10], // 11° puesto
      marcador: '2 - 0',
      marcadorDetallado: '11-7, 11-6',
      ganadorId: clasificados.value[5]?.id,
      estado: 'jugado',
      anilloOrbital: 3,
      siguientePartidoId: 'cuartos-2',
    },
    {
      id: 'playin-3',
      ronda: 'play_in',
      numeroLlave: 3,
      jugador1: clasificados.value[6], // 7° puesto
      jugador2: clasificados.value[9], // 10° puesto
      estado: 'en_curso',
      marcador: '1 - 1',
      marcadorDetallado: '11-8, 9-11',
      anilloOrbital: 3,
      siguientePartidoId: 'cuartos-3',
    },
    {
      id: 'playin-4',
      ronda: 'play_in',
      numeroLlave: 4,
      jugador1: clasificados.value[7], // 8° puesto
      jugador2: clasificados.value[8], // 9° puesto
      estado: 'pendiente',
      anilloOrbital: 3,
      siguientePartidoId: 'cuartos-4',
    },
  ])

  // Partidos de Cuartos de Final (Anillo 2 Medio: Top 1-4 con BYE + Ganadores Play-in)
  const partidosCuartos = ref<PartidoPlayoff[]>([
    {
      id: 'cuartos-1',
      ronda: 'cuartos',
      numeroLlave: 1,
      jugador1: clasificados.value[3], // 4° puesto (BYE)
      jugador2: clasificados.value[4], // Ganador PlayIn 1
      estado: 'pendiente',
      anilloOrbital: 2,
      siguientePartidoId: 'semi-1',
    },
    {
      id: 'cuartos-2',
      ronda: 'cuartos',
      numeroLlave: 2,
      jugador1: clasificados.value[2], // 3° puesto (BYE)
      jugador2: clasificados.value[5], // Ganador PlayIn 2
      estado: 'pendiente',
      anilloOrbital: 2,
      siguientePartidoId: 'semi-2',
    },
    {
      id: 'cuartos-3',
      ronda: 'cuartos',
      numeroLlave: 3,
      jugador1: clasificados.value[1], // 2° puesto (BYE)
      jugador2: undefined,
      estado: 'pendiente',
      anilloOrbital: 2,
      siguientePartidoId: 'semi-2',
    },
    {
      id: 'cuartos-4',
      ronda: 'cuartos',
      numeroLlave: 4,
      jugador1: clasificados.value[0], // 1° puesto (BYE)
      jugador2: undefined,
      estado: 'pendiente',
      anilloOrbital: 2,
      siguientePartidoId: 'semi-1',
    },
  ])

  // Semifinales (Anillo 2 interior)
  const partidosSemis = ref<PartidoPlayoff[]>([
    {
      id: 'semi-1',
      ronda: 'semifinal',
      numeroLlave: 1,
      jugador1: clasificados.value[0],
      jugador2: clasificados.value[3],
      estado: 'pendiente',
      anilloOrbital: 2,
      siguientePartidoId: 'final-1',
    },
    {
      id: 'semi-2',
      ronda: 'semifinal',
      numeroLlave: 2,
      jugador1: clasificados.value[1],
      jugador2: clasificados.value[2],
      estado: 'pendiente',
      anilloOrbital: 2,
      siguientePartidoId: 'final-1',
    },
  ])

  // Gran Final (Anillo 1: El Núcleo hacia la Corona)
  const granFinal = ref<PartidoPlayoff>({
    id: 'final-1',
    ronda: 'final',
    numeroLlave: 1,
    jugador1: clasificados.value[0],
    jugador2: clasificados.value[1],
    estado: 'pendiente',
    anilloOrbital: 1,
  })

  const cuadroCompleto = computed<CuadroPlayoffs>(() => ({
    playIn: partidosPlayIn.value,
    cuartos: partidosCuartos.value,
    semifinales: partidosSemis.value,
    granFinal: granFinal.value,
    bolsaPremio,
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
    clasificados,
    partidosPlayIn,
    partidosCuartos,
    partidosSemis,
    granFinal,
    cuadroCompleto,
    miCamino,
  }
}

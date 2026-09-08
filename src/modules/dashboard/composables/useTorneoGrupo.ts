import { ref, computed, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  obtenerInscripcionesDB,
  obtenerPartidosDB,
  actualizarPartidoDB,
  actualizarTablaPosicionesDB,
} from '@/services/torneoDatabaseService'
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

export function sonMismoJugador(a?: string, b?: string): boolean {
  if (!a || !b) return false
  return a === b || a.endsWith(b) || b.endsWith(a)
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

/**
 * Algoritmo Berger oficial para generar el fixture de Round Robin por jornadas/rondas.
 * Garantiza que en cada jornada (ronda) todos los participantes tengan exactamente 1 partido simultáneo.
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

export interface MalleroTorneo {
  jugador: JugadorTorneo
  totalMallas: number
  titulo: string
}

export function useTorneoGrupo(torneo: Torneo) {
  const authStore = useAuthStore()

  const u = authStore.usuario
  const usuarioActual: JugadorTorneo = u
    ? {
        id: u.id,
        nombre: `${u.nombre} ${u.apellido || ''}`.trim(),
        iniciales: `${u.nombre?.[0] || 'J'}${u.apellido?.[0] || ''}`.toUpperCase(),
        telefono: u.telefono || '',
        tipo: u.tipo || 'camper',
        esUsuarioActual: true,
      }
    : {
        id: 'jugador-sesion',
        nombre: 'Mi Perfil',
        iniciales: 'YO',
        telefono: '',
        tipo: 'camper',
        esUsuarioActual: true,
      }

  const jugadores = ref<JugadorTorneo[]>([usuarioActual])
  const jugadorEnCentro = ref<JugadorTorneo>(usuarioActual)
  const partidos = ref<PartidoGrupo[]>([])

  const cargarDatosTorneo = async () => {
    if (!torneo?.id) return
    try {
      const inscritos = await obtenerInscripcionesDB(torneo.id)
      if (inscritos.length > 0) {
        const mapaJugadores = new Map<string, JugadorTorneo>()
        inscritos.forEach((ins: any) => {
          const idJugador = ins.jugadorId || ins.id
          if (!mapaJugadores.has(idJugador)) {
            mapaJugadores.set(idJugador, {
              id: idJugador,
              nombre: ins.nombre || ins.jugadorNombre || 'Participante',
              iniciales: ins.iniciales || (ins.nombre ? ins.nombre.substring(0, 2).toUpperCase() : 'JG'),
              telefono: ins.telefono || '',
              tipo: ins.tipo || 'camper',
              esUsuarioActual: idJugador === authStore.usuario?.id,
            })
          }
        })
        jugadores.value = Array.from(mapaJugadores.values())
      } else {
        jugadores.value = [usuarioActual]
      }

      const yo = jugadores.value.find((j) => j.esUsuarioActual)
      jugadorEnCentro.value = yo || jugadores.value[0] || usuarioActual

      const partidosDB = await obtenerPartidosDB(torneo.id)
      if (partidosDB.length > 0) {
        partidos.value = partidosDB.map((p: any) => {
          const j1Id = p.jugador1?.id || p.jugador1Id
          const j2Id = p.jugador2?.id || p.jugador2Id
          const rondaOficial = p.ronda || p.jornada || 1

          return {
            id: p.id,
            jugador1Id: j1Id,
            jugador2Id: j2Id,
            jugador1: p.jugador1,
            jugador2: p.jugador2,
            jugadorGanadorId: p.ganadorId || p.jugadorGanadorId,
            marcador: p.marcador,
            marcadorDetallado: p.marcadorDetallado,
            estado: p.estado || 'pendiente',
            diasRestantes: p.diasRestantes ?? 2,
            ronda: rondaOficial,
            jornada: rondaOficial,
            sets: p.sets,
            arbitroId: p.arbitroId,
            mesa: p.mesa,
            codigoJugador1: p.codigoJugador1 || generarCodigoSeguridad(j1Id, j2Id),
            codigoJugador2: p.codigoJugador2 || generarCodigoSeguridad(j2Id, j1Id),
          }
        })
      } else {
        const crucesBerger = generarFixtureBerger(jugadores.value)
        const listaPartidos: PartidoGrupo[] = crucesBerger.map((cruce) => {
          const idA = cruce.jugador1.id || 'J1'
          const idB = cruce.jugador2.id || 'J2'
          return {
            id: `p-${idA}-${idB}`,
            jugador1Id: idA,
            jugador2Id: idB,
            jugador1: cruce.jugador1,
            jugador2: cruce.jugador2,
            ronda: cruce.ronda,
            jornada: cruce.ronda,
            estado: 'pendiente',
            diasRestantes: 2,
            codigoJugador1: generarCodigoSeguridad(idA, idB),
            codigoJugador2: generarCodigoSeguridad(idB, idA),
          }
        })
        partidos.value = listaPartidos
      }
    } catch (err) {
      console.warn('Error al cargar datos reales del torneo en useTorneoGrupo:', err)
    }
  }

  cargarDatosTorneo()
  watch(() => torneo?.id, () => {
    cargarDatosTorneo()
  })

  partidos.value.forEach((p) => {
    if (!p.codigoJugador1 || !p.codigoJugador2) {
      p.codigoJugador1 = generarCodigoSeguridad(p.jugador1Id, p.jugador2Id)
      p.codigoJugador2 = generarCodigoSeguridad(p.jugador2Id, p.jugador1Id)
    }
  })


  const resolverJugador = (id: string, fallbackObj?: any): JugadorTorneo => {
    const encontrado = jugadores.value.find((j) => sonMismoJugador(j.id, id))
    if (encontrado) return encontrado

    if (fallbackObj && fallbackObj.nombre) {
      return {
        id: fallbackObj.id || id,
        nombre: fallbackObj.nombre,
        iniciales: fallbackObj.iniciales || fallbackObj.nombre.substring(0, 2).toUpperCase(),
        telefono: fallbackObj.telefono || '',
        tipo: fallbackObj.tipo || 'camper',
      }
    }

    return {
      id,
      nombre: 'Participante',
      iniciales: 'PA',
      telefono: '',
      tipo: 'camper',
    }
  }

  // Determina la ronda activa del torneo (la jornada en disputa actual)
  const rondaActual = computed<number>(() => {
    if (partidos.value.length === 0) return 1
    const pendientes = partidos.value.filter((p) => p.estado !== 'jugado' && !p.marcador)
    if (pendientes.length === 0) {
      return Math.max(...partidos.value.map((p) => p.ronda || 1))
    }
    return Math.min(...pendientes.map((p) => p.ronda || 1))
  })

  const buscarPartido = (idA: string, idB: string): PartidoGrupo => {
    const encontrado = partidos.value.find(
      (p) =>
        (sonMismoJugador(p.jugador1Id, idA) && sonMismoJugador(p.jugador2Id, idB)) ||
        (sonMismoJugador(p.jugador1Id, idB) && sonMismoJugador(p.jugador2Id, idA)),
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
      ronda: 1,
      diasRestantes: 2,
      codigoJugador1: generarCodigoSeguridad(idA, idB),
      codigoJugador2: generarCodigoSeguridad(idB, idA),
    }
    partidos.value.push(nuevo)
    return nuevo
  }

  const rivalesPerimetro = computed<BurbujaRival[]>(() => {
    const centroId = jugadorEnCentro.value.id
    const otrosJugadores = jugadores.value.filter((j) => !sonMismoJugador(j.id, centroId))

    const total = otrosJugadores.length
    if (total === 0) return []

    // 1. Identificar el enfrentamiento de la jornada/ronda activa para este jugador central
    const rActiva = rondaActual.value
    let partidoDeRonda = partidos.value.find(
      (p) =>
        (p.ronda === rActiva || !p.ronda) &&
        (sonMismoJugador(p.jugador1Id, centroId) || sonMismoJugador(p.jugador2Id, centroId)) &&
        p.estado !== 'jugado' &&
        !p.marcador,
    )

    // Si ya completó el de la ronda activa, tomar el próximo partido pendiente programado
    if (!partidoDeRonda) {
      const partidosDeCentro = partidos.value
        .filter((p) => sonMismoJugador(p.jugador1Id, centroId) || sonMismoJugador(p.jugador2Id, centroId))
        .sort((a, b) => (a.ronda || 1) - (b.ronda || 1))

      partidoDeRonda =
        partidosDeCentro.find((p) => p.estado !== 'jugado' && !p.marcador) ||
        partidosDeCentro[0]
    }

    // 2. Determinar quién es el rival oficial de turno para esa fecha
    let idRivalTurno = otrosJugadores[0]?.id
    if (partidoDeRonda) {
      const esJ1Centro = sonMismoJugador(partidoDeRonda.jugador1Id, centroId)
      idRivalTurno = esJ1Centro ? partidoDeRonda.jugador2Id : partidoDeRonda.jugador1Id
    }

    // 3. Ubicar al rival de turno de la jornada activa exactamente a las 12 en punto (índice 0)
    const indexRivalTurno = otrosJugadores.findIndex((j) => sonMismoJugador(j.id, idRivalTurno))
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
        if (sonMismoJugador(partido.jugadorGanadorId, centroId)) {
          resultadoParaCentro = 'ganado' // Verde
          ganadorNombre = jugadorEnCentro.value.nombre
        } else {
          resultadoParaCentro = 'perdido' // Rojo
          ganadorNombre = jugador.nombre
        }
      }
      // Color del borde de la burbuja orbital:
      let colorBorde: ColorBordeBurbuja = 'gris'
      if (partido.estado === 'jugado') {
        colorBorde = resultadoParaCentro === 'ganado' ? 'verde' : 'rojo'
      } else if (partido.estado === 'pendiente_admin') {
        colorBorde = 'naranja'
      } else {
        colorBorde = 'gris'
      }

      const esRivalDeTurno = index === 0
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

  const arbitroActual = ref<JugadorTorneo>(usuarioActual)

  const setArbitroActual = (jugador: JugadorTorneo) => {
    arbitroActual.value = jugador
  }

  const partidosDisponiblesParaArbitrar = computed<PartidoArbitrable[]>(() => {
    const aId = arbitroActual.value.id
    const rActiva = rondaActual.value

    let partidosValidos = partidos.value.filter((p) => {
      const esRondaActiva = (p.ronda === rActiva || !p.ronda)
      const noJugado = p.estado !== 'jugado' && !p.marcador
      const noParticipa = !sonMismoJugador(p.jugador1Id, aId) && !sonMismoJugador(p.jugador2Id, aId)
      return esRondaActiva && noJugado && noParticipa
    })

    if (partidosValidos.length === 0) {
      const partidosAjenos = partidos.value.filter((p) => {
        const noJugado = p.estado !== 'jugado' && !p.marcador
        const noParticipa = !sonMismoJugador(p.jugador1Id, aId) && !sonMismoJugador(p.jugador2Id, aId)
        return noJugado && noParticipa
      })
      if (partidosAjenos.length > 0) {
        const proxRonda = Math.min(...partidosAjenos.map((p) => p.ronda || 1))
        partidosValidos = partidosAjenos.filter((p) => (p.ronda || 1) === proxRonda)
      }
    }

    return partidosValidos.map((p) => {
      const jugador1 = resolverJugador(p.jugador1Id, p.jugador1)
      const jugador2 = resolverJugador(p.jugador2Id, p.jugador2)
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

  // Registrar resultado de partido arbitrado (al mejor de 3 sets) y persistir en Firestore
  const registrarResultadoPartido = async (
    partidoId: string,
    setsJugados: SetPartido[],
    ganadorId: string,
  ) => {
    const pIndex = partidos.value.findIndex((p) => p.id === partidoId)
    if (pIndex === -1) return

    const partido = partidos.value[pIndex]
    if (!partido) return

    const setsG1 = setsJugados.filter((s) => sonMismoJugador(s.ganadorId, partido.jugador1Id)).length
    const setsG2 = setsJugados.filter((s) => sonMismoJugador(s.ganadorId, partido.jugador2Id)).length

    const marcadorResumen = `${setsG1} - ${setsG2}`
    const marcadorDetallado = setsJugados.map((s) => `${s.puntosJugador1}-${s.puntosJugador2}`).join(', ')

    const partidoActualizado: PartidoGrupo = {
      ...partido,
      estado: 'jugado',
      jugadorGanadorId: ganadorId,
      marcador: marcadorResumen,
      marcadorDetallado,
      arbitroId: arbitroActual.value.id,
      sets: setsJugados,
      diasRestantes: 0,
    }

    partidos.value[pIndex] = partidoActualizado

    // Persistir de forma inmediata en Firestore
    try {
      await actualizarPartidoDB(partidoId, {
        estado: 'jugado',
        jugadorGanadorId: ganadorId,
        marcador: marcadorResumen,
        marcadorDetallado,
        arbitroId: arbitroActual.value.id,
        sets: setsJugados,
        diasRestantes: 0,
      })

      await actualizarTablaPosicionesDB(torneo.id, tablaPosiciones.value)
    } catch (err) {
      console.warn('Error al persistir resultado en base de datos:', err)
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
        const entry1 = Array.from(statsMap.entries()).find(([k]) => sonMismoJugador(k, p.jugador1Id))
        const stats1 = entry1 ? entry1[1] : undefined
        const entry2 = Array.from(statsMap.entries()).find(([k]) => sonMismoJugador(k, p.jugador2Id))
        const stats2 = entry2 ? entry2[1] : undefined

        if (stats1 && stats2) {
          stats1.pj += 1
          stats2.pj += 1

          let sf1 = 0
          let sc1 = 0
          let sf2 = 0
          let sc2 = 0

          if (p.sets && p.sets.length > 0) {
            p.sets.forEach((s) => {
              if (sonMismoJugador(s.ganadorId, p.jugador1Id)) {
                sf1 += 1
                sc2 += 1
              } else if (sonMismoJugador(s.ganadorId, p.jugador2Id)) {
                sf2 += 1
                sc1 += 1
              }
            })
          } else {
            if (sonMismoJugador(p.jugadorGanadorId, p.jugador1Id)) {
              sf1 = 2
              sc1 = 1
              sf2 = 1
              sc2 = 2
            } else {
              sf1 = 1
              sc1 = 2
              sf2 = 2
              sc2 = 1
            }
          }

          stats1.sf += sf1
          stats1.sc += sc1
          stats2.sf += sf2
          stats2.sc += sc2

          if (sonMismoJugador(p.jugadorGanadorId, p.jugador1Id)) {
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

  const mallasPorJugador = computed<Map<string, number>>(() => {
    const mapa = new Map<string, number>()
    jugadores.value.forEach((j) => mapa.set(j.id, 0))
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

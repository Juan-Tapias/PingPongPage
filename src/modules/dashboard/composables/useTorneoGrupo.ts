import { ref, computed, watch, onUnmounted } from 'vue'
import { useAuthStore } from '@/stores/auth'
import {
  obtenerInscripcionesDB,
  suscribirPartidosDB,
  actualizarPartidoDB,
  actualizarTablaPosicionesDB,
  suscribirTablaPosicionesDB,
  ordenarPartidosNumerico,
} from '@/services/torneoDatabaseService'
import type {
  JugadorTorneo,
  PartidoGrupo,
  BurbujaRival,
  FilaPosicion,
  ResultadoPartido,
  ColorBordeBurbuja,
  Torneo,
  SetPartido,
  PartidoArbitrable,
} from '@/types'

import {
  sonMismoJugador,
  coincideJugador,
  generarCodigoSeguridad,
  generarFixtureBerger,
  calcularTablaDesdePartidos,
} from '@/services/torneoAlgoritmos'

export interface MalleroTorneo {
  jugador: JugadorTorneo
  totalMallas: number
  titulo: string
}

export function useTorneoGrupo(torneo: Torneo) {
  const authStore = useAuthStore()

  const u = authStore.usuario
  const usuarioActual: JugadorTorneo | null = u
    ? {
        id: u.id,
        nombre: `${u.nombre} ${u.apellido || ''}`.trim(),
        iniciales: `${u.nombre?.[0] || 'J'}${u.apellido?.[0] || ''}`.toUpperCase(),
        telefono: u.telefono || '',
        tipo: u.tipo || 'camper',
        esUsuarioActual: true,
      }
    : null

  const jugadores = ref<JugadorTorneo[]>(usuarioActual ? [usuarioActual] : [])
  const jugadorEnCentro = ref<JugadorTorneo>(usuarioActual || {
    id: 'espectador',
    nombre: 'Espectador',
    iniciales: 'ES',
    telefono: '',
    tipo: 'camper'
  })
  const partidos = ref<PartidoGrupo[]>([])
  const tablaPosicionesRemota = ref<FilaPosicion[]>([])

  let unsubscribePartidos: (() => void) | null = null
  let unsubscribeTabla: (() => void) | null = null

  const limpiarSuscripciones = () => {
    if (unsubscribePartidos) {
      unsubscribePartidos()
      unsubscribePartidos = null
    }
    if (unsubscribeTabla) {
      unsubscribeTabla()
      unsubscribeTabla = null
    }
  }

  onUnmounted(() => {
    limpiarSuscripciones()
  })

  const cargarDatosTorneo = async () => {
    if (!torneo?.id) return
    limpiarSuscripciones()
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
        jugadores.value = usuarioActual ? [usuarioActual] : []
      }

      const yo = jugadores.value.find((j) => j.esUsuarioActual)
      jugadorEnCentro.value = yo || jugadores.value[0] || usuarioActual || {
        id: 'espectador',
        nombre: 'Espectador',
        iniciales: 'ES',
        telefono: '',
        tipo: 'camper'
      }

      // Suscribir en tiempo real a la tabla oficial de posiciones
      unsubscribeTabla = suscribirTablaPosicionesDB(torneo.id, (tablaDoc) => {
        if (tablaDoc && tablaDoc.posiciones && tablaDoc.posiciones.length > 0) {
          tablaPosicionesRemota.value = tablaDoc.posiciones.map((pos) => ({
            ...pos,
            esUsuarioActual: usuarioActual ? sonMismoJugador(pos.jugadorId, usuarioActual.id) : false,
          }))
        }
      })

      // Suscribir en tiempo real a los partidos del torneo (reflejo instantáneo de marcadores y árbitro activo)
      unsubscribePartidos = suscribirPartidosDB(torneo.id, (partidosDB) => {
        if (partidosDB.length > 0) {
          const mapeados = partidosDB.map((p: any) => {
            const j1Id = p.jugador1?.id || p.jugador1Id
            const j2Id = p.jugador2?.id || p.jugador2Id
            const rondaOficial = Number(p.ronda || p.jornada || 1)

            return {
              id: p.id,
              numeroPartido: p.numeroPartido,
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
              arbitroActivoId: p.arbitroActivoId,
              mesa: p.mesa,
              codigoJugador1: p.codigoJugador1 || generarCodigoSeguridad(j1Id, j2Id),
              codigoJugador2: p.codigoJugador2 || generarCodigoSeguridad(j2Id, j1Id),
            }
          })
          partidos.value = ordenarPartidosNumerico(mapeados)
        } else {
          const crucesBerger = generarFixtureBerger(jugadores.value)
          const mapeados = crucesBerger.map((cruce, idx) => {
            const idA = cruce.jugador1.id || 'J1'
            const idB = cruce.jugador2.id || 'J2'
            return {
              id: `p-${idA}-${idB}`,
              numeroPartido: idx + 1,
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
          partidos.value = ordenarPartidosNumerico(mapeados)
        }
      })
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
    const centroId = jugadorEnCentro.value?.id
    if (!centroId) return []
    
    const otrosJugadores = jugadores.value.filter((j) => !sonMismoJugador(j.id, centroId))

    const total = otrosJugadores.length
    if (total === 0) return []

    // 1. Obtener todos los partidos de este jugador central ordenados cronológicamente por ronda
    const partidosDelCentro = partidos.value
      .filter((p) => sonMismoJugador(p.jugador1Id, centroId) || sonMismoJugador(p.jugador2Id, centroId))
      .sort((a, b) => (a.ronda || 1) - (b.ronda || 1))

    // 2. Mapear los partidos ordenados por fecha a la lista de rivales
    let rivalesOrdenados: { jugador: JugadorTorneo; partido: PartidoGrupo }[] = []

    if (partidosDelCentro.length > 0) {
      partidosDelCentro.forEach((p) => {
        const idRival = sonMismoJugador(p.jugador1Id, centroId) ? p.jugador2Id : p.jugador1Id
        const jRival = resolverJugador(idRival, sonMismoJugador(p.jugador1Id, centroId) ? p.jugador2 : p.jugador1)
        if (jRival && !sonMismoJugador(jRival.id, centroId)) {
          // Evitar duplicados si existiera algún cruce redundante
          if (!rivalesOrdenados.some((r) => sonMismoJugador(r.jugador.id, jRival.id))) {
            rivalesOrdenados.push({ jugador: jRival, partido: p })
          }
        }
      })
    }

    // Agregar cualquier jugador faltante que no esté en partidosDelCentro aún (fallback de seguridad)
    otrosJugadores.forEach((j) => {
      if (!rivalesOrdenados.some((r) => sonMismoJugador(r.jugador.id, j.id))) {
        rivalesOrdenados.push({ jugador: j, partido: buscarPartido(centroId, j.id) })
      }
    })

    // 3. Encontrar el índice del primer partido PENDIENTE POR JUGAR (ronda más próxima sin disputar)
    let indexPendiente = rivalesOrdenados.findIndex(
      (item) => item.partido.estado !== 'jugado' && !item.partido.marcador,
    )

    // Si ya completó todos sus partidos del grupo, mantener el orden cronológico original (índice 0)
    if (indexPendiente === -1) {
      indexPendiente = 0
    }

    // 4. Rotar el arreglo para que el partido PENDIENTE POR JUGAR quede a las 12 en punto (índice 0)
    const rivalesRotados = [
      ...rivalesOrdenados.slice(indexPendiente),
      ...rivalesOrdenados.slice(0, indexPendiente),
    ]

    return rivalesRotados.map((item, index) => {
      const { jugador, partido } = item

      let resultadoParaCentro: ResultadoPartido = 'pendiente'
      let ganadorNombre: string | undefined = undefined

      if (partido.estado === 'jugado' && partido.jugadorGanadorId) {
        if (sonMismoJugador(partido.jugadorGanadorId, centroId)) {
          resultadoParaCentro = 'ganado' // Verde
          ganadorNombre = jugadorEnCentro.value?.nombre
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
      // El PIN de seguridad para el árbitro es estrictamente privado y personal:
      // ÚNICAMENTE se genera si el usuario autenticado está viendo su propia rueda y compite en el partido.
      // Si está viendo la rueda de un rival (esVistaRival) o no participa, debe ser estrictamente undefined.
      let codigoSeguridadPropio: string | undefined = undefined
      if (usuarioActual && sonMismoJugador(centroId, usuarioActual.id) && partido.estado !== 'jugado') {
        if (sonMismoJugador(partido.jugador1Id, usuarioActual.id)) {
          codigoSeguridadPropio = partido.codigoJugador1 || generarCodigoSeguridad(usuarioActual.id, jugador.id)
        } else if (sonMismoJugador(partido.jugador2Id, usuarioActual.id)) {
          codigoSeguridadPropio = partido.codigoJugador2 || generarCodigoSeguridad(usuarioActual.id, jugador.id)
        }
      }

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
    return jugadorEnCentro.value?.id !== usuarioActual?.id
  })

  const verVistaRival = (rival: JugadorTorneo) => {
    jugadorEnCentro.value = rival
  }

  const volverAMiVista = () => {
    jugadorEnCentro.value = usuarioActual || {
      id: 'espectador',
      nombre: 'Espectador',
      iniciales: 'ES',
      telefono: '',
      tipo: 'camper'
    }
  }

  const arbitroActual = ref<JugadorTorneo | null>(usuarioActual)

  const setArbitroActual = (jugador: JugadorTorneo) => {
    arbitroActual.value = jugador
  }

  const partidosDisponiblesParaArbitrar = computed<PartidoArbitrable[]>(() => {
    // El árbitro siempre debe ser el usuario autenticado (jugador en sesión)
    const aId = usuarioActual?.id
    if (!aId) return []
    const rActiva = rondaActual.value

    // Filtrar estrictamente partidos de la ronda activa que están pendientes y donde el usuario autenticado NO participa
    // También verificar que no esté bloqueado por otro árbitro activo
    const partidosValidos = partidos.value.filter((p) => {
      const esRondaActiva = (p.ronda === rActiva || !p.ronda)
      const noJugado = p.estado !== 'jugado' && !p.marcador
      const noParticipa = !sonMismoJugador(p.jugador1Id, aId) && !sonMismoJugador(p.jugador2Id, aId)
      const sinArbitroUOtorgadoAMi = !p.arbitroActivoId || sonMismoJugador(p.arbitroActivoId, aId)
      return esRondaActiva && noJugado && noParticipa && sinArbitroUOtorgadoAMi
    })

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
  const validarCodigosArbitraje = async (
    partidoId: string,
    codigoJ1: string,
    codigoJ2: string,
  ): Promise<{ valido: boolean; mensaje: string }> => {
    const partido = partidos.value.find((p) => p.id === partidoId)
    if (!partido) {
      return { valido: false, mensaje: 'El partido no existe en este torneo.' }
    }

    const c1 = codigoJ1.trim()
    const c2 = codigoJ2.trim()

    const coincideDirecto = c1 === partido.codigoJugador1 && c2 === partido.codigoJugador2
    const coincideInverso = c1 === partido.codigoJugador2 && c2 === partido.codigoJugador1

    if (coincideDirecto || coincideInverso) {
      const nuevoPin1 = (Math.floor(Math.random() * 90000) + 10000).toString()
      const nuevoPin2 = (Math.floor(Math.random() * 90000) + 10000).toString()
      const aId = usuarioActual?.id || ''

      try {
        await actualizarPartidoDB(partidoId, {
          estado: 'en_curso',
          arbitroActivoId: aId,
          codigoJugador1: nuevoPin1,
          codigoJugador2: nuevoPin2
        })
        
        // Actualizar localmente para la UI reactiva
        partido.estado = 'en_curso'
        partido.arbitroActivoId = aId
        partido.codigoJugador1 = nuevoPin1
        partido.codigoJugador2 = nuevoPin2

        return { valido: true, mensaje: 'Códigos confirmados correctamente. Accediendo al marcador virtual...' }
      } catch (error) {
        console.error('Error al bloquear partido en DB:', error)
        return { valido: false, mensaje: 'Error de red al asegurar el partido. Intenta de nuevo.' }
      }
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

    const arbitroIdSeguro = arbitroActual.value?.id ?? usuarioActual?.id ?? ''

    const partidoActualizado: PartidoGrupo = {
      ...partido,
      estado: 'jugado',
      jugadorGanadorId: ganadorId,
      marcador: marcadorResumen,
      marcadorDetallado,
      arbitroId: arbitroIdSeguro,
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
        arbitroId: arbitroIdSeguro,
        sets: setsJugados,
        diasRestantes: 0,
      })

      // Calcular y persistir inmediatamente la tabla oficial de posiciones actualizada en Firestore
      const tablaNueva = calcularTablaDesdePartidos(
        jugadores.value,
        partidos.value,
        torneo?.clasificadosPlayoffs || 4,
      )
      await actualizarTablaPosicionesDB(torneo.id, tablaNueva)
    } catch (err) {
      console.warn('Error al persistir resultado en base de datos:', err)
    }
  }

  // Tabla de posiciones oficial en tiempo real calculada directamente sobre los partidos reales disputados
  const tablaPosiciones = computed<FilaPosicion[]>(() => {
    // Si los jugadores ya fueron cargados, calculamos reactivamente la tabla de posiciones con los partidos actuales
    if (jugadores.value.length > 0) {
      const calculada = calcularTablaDesdePartidos(
        jugadores.value,
        partidos.value,
        torneo?.clasificadosPlayoffs || 4,
      )
      return calculada.map((fila) => ({
        ...fila,
        esUsuarioActual: usuarioActual ? coincideJugador(usuarioActual, fila.jugadorId) : false,
      }))
    }

    // Fallback de contingencia mientras cargan los jugadores si la tabla remota ya se encuentra disponible
    if (tablaPosicionesRemota.value.length > 0) {
      return tablaPosicionesRemota.value.map((f) => ({
        ...f,
        esUsuarioActual: usuarioActual ? coincideJugador(usuarioActual, f.jugadorId) : false,
      }))
    }

    return []
  })

  // Auto-sincronización de auto-curación: Si hay partidos jugados en el torneo pero la colección
  // 'tablas_posiciones' en Firestore está vacía o quedó desactualizada con ceros, persistir la tabla real.
  watch(
    () => [partidos.value, jugadores.value],
    async () => {
      if (!torneo?.id || jugadores.value.length === 0) return

      const hayPartidosJugados = partidos.value.some(
        (p) => p.estado === 'jugado' || (!!p.marcador && String(p.marcador).includes('-') && p.estado !== 'pendiente'),
      )

      if (hayPartidosJugados) {
        const remotaTieneCeros =
          tablaPosicionesRemota.value.length > 0 &&
          tablaPosicionesRemota.value.every((f) => f.pj === 0 && f.puntos === 0)

        if (remotaTieneCeros || tablaPosicionesRemota.value.length === 0) {
          const tablaCalculada = calcularTablaDesdePartidos(
            jugadores.value,
            partidos.value,
            torneo?.clasificadosPlayoffs || 4,
          )
          try {
            await actualizarTablaPosicionesDB(torneo.id, tablaCalculada)
          } catch (e) {
            console.warn('Auto-sincronización de tabla oficial en Firestore omitida:', e)
          }
        }
      }
    },
    { immediate: true, deep: true },
  )

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
    rondaActual,
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

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  onSnapshot,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { Torneo, EstadoTorneo, Usuario, FilaPosicionOficial, TablaPosicionesTorneo, MarcadorEnVivo } from '@/types'

const COLECCION_TORNEOS = 'torneos'
const COLECCION_PARTIDOS = 'partidos'
const COLECCION_INSCRIPCIONES = 'inscripciones'
export const COLECCION_TABLAS_POSICIONES = 'tablas_posiciones'

/**
 * Obtiene todos los torneos registrados en la base de datos
 */
export const obtenerTorneosDB = async (): Promise<Torneo[]> => {
  try {
    const q = query(collection(db, COLECCION_TORNEOS), orderBy('fechaInicio', 'desc'))
    const querySnapshot = await getDocs(q)
    const torneos: Torneo[] = []
    querySnapshot.forEach((documento) => {
      torneos.push({ id: documento.id, ...documento.data() } as Torneo)
    })
    return torneos
  } catch {
    try {
      const snap = await getDocs(collection(db, COLECCION_TORNEOS))
      const torneos: Torneo[] = []
      snap.forEach((documento) => {
        torneos.push({ id: documento.id, ...documento.data() } as Torneo)
      })
      return torneos
    } catch (e) {
      console.warn('Base de datos inicial o sin torneos aún:', e)
      return []
    }
  }
}

/**
 * Guarda un nuevo torneo creado en Firestore
 */
export const guardarTorneoDB = async (torneo: Torneo): Promise<void> => {
  const torneoRef = doc(db, COLECCION_TORNEOS, torneo.id)
  await setDoc(torneoRef, torneo)
}

/**
 * Actualiza el estado oficial de un torneo (por iniciar, en curso, finalizado)
 */
export const actualizarEstadoTorneoDB = async (id: string, nuevoEstado: EstadoTorneo): Promise<void> => {
  const torneoRef = doc(db, COLECCION_TORNEOS, id)
  await updateDoc(torneoRef, { estado: nuevoEstado })
}

/**
 * Elimina un torneo de la base de datos
 */
export const eliminarTorneoDB = async (id: string): Promise<void> => {
  const torneoRef = doc(db, COLECCION_TORNEOS, id)
  await deleteDoc(torneoRef)
}

/**
 * Obtiene las inscripciones de un torneo
 */
export const obtenerInscripcionesDB = async (torneoId: string): Promise<any[]> => {
  try {
    const q = query(collection(db, COLECCION_INSCRIPCIONES), where('torneoId', '==', torneoId))
    const snap = await getDocs(q)
    const inscripciones: any[] = []
    snap.forEach((documento) => {
      inscripciones.push({ id: documento.id, ...documento.data() })
    })
    return inscripciones
  } catch (error) {
    console.warn('Error al obtener inscripciones:', error)
    return []
  }
}

/**
 * Guarda o actualiza la inscripción de un jugador a un torneo en Firestore
 */
export const guardarInscripcionDB = async (inscripcion: {
  id?: string
  torneoId: string
  jugadorId: string
  nombre: string
  iniciales?: string
  telefono?: string
  tipo?: string
  pagoValidado?: boolean
  subestado?: string
  fechaInscripcion?: string
}): Promise<void> => {
  const docId = inscripcion.id || `${inscripcion.torneoId}_${inscripcion.jugadorId}`
  const inscripcionRef = doc(db, COLECCION_INSCRIPCIONES, docId)
  await setDoc(inscripcionRef, { ...inscripcion, id: docId })
}

export const actualizarEstadoInscripcionDB = async (
  inscripcionId: string,
  pagoValidado: boolean,
  subestado: string = 'INSCRITO'
): Promise<void> => {
  const inscripcionRef = doc(db, COLECCION_INSCRIPCIONES, inscripcionId)
  await updateDoc(inscripcionRef, {
    pagoValidado,
    subestado,
  })
}

export const eliminarInscripcionDB = async (inscripcionId: string): Promise<void> => {
  const inscripcionRef = doc(db, COLECCION_INSCRIPCIONES, inscripcionId)
  await deleteDoc(inscripcionRef)
}


/**
 * Ordena los partidos de forma estrictamente numérica por:
 * 1) Ronda / Jornada cronológica (1, 2, 3...)
 * 2) Número de partido dentro de la jornada o torneo (1, 2, 3...)
 */
export const ordenarPartidosNumerico = (partidos: any[]): any[] => {
  return [...partidos].sort((a, b) => {
    const rondaA = Number(a.ronda ?? a.jornada ?? 1)
    const rondaB = Number(b.ronda ?? b.jornada ?? 1)
    if (rondaA !== rondaB) {
      return rondaA - rondaB
    }

    const extraerNumero = (item: any): number => {
      if (typeof item.numeroPartido === 'number') return item.numeroPartido
      const match = String(item.id || '').match(/(\d+)$/)
      return match && match[1] ? parseInt(match[1], 10) : 0
    }

    const numA = extraerNumero(a)
    const numB = extraerNumero(b)
    return numA - numB
  })
}

export const obtenerPartidosDB = async (torneoId: string): Promise<any[]> => {
  try {
    const q = query(collection(db, COLECCION_PARTIDOS), where('torneoId', '==', torneoId))
    const snap = await getDocs(q)
    const partidos: any[] = []
    snap.forEach((documento) => {
      partidos.push({ id: documento.id, ...documento.data() })
    })
    return ordenarPartidosNumerico(partidos)
  } catch (error) {
    console.warn('Error al obtener partidos:', error)
    return []
  }
}

/**
 * Escucha en tiempo real los cambios en los partidos de un torneo
 */
export const suscribirPartidosDB = (
  torneoId: string,
  onActualizar: (partidos: any[]) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const q = query(collection(db, COLECCION_PARTIDOS), where('torneoId', '==', torneoId))
  return onSnapshot(
    q,
    (snap) => {
      const partidos: any[] = []
      snap.forEach((documento) => {
        partidos.push({ id: documento.id, ...documento.data() })
      })
      onActualizar(ordenarPartidosNumerico(partidos))
    },
    (err) => {
      console.warn('Error en listener en tiempo real de partidos:', err)
      onError?.(err)
    }
  )
}

/**
 * Guarda los partidos generados en un torneo
 */
export const guardarPartidosDB = async (partidos: any[]): Promise<void> => {
  for (const partido of partidos) {
    const pRef = doc(db, COLECCION_PARTIDOS, partido.id)
    await setDoc(pRef, partido)
  }
}

export const actualizarPartidoDB = async (partidoId: string, datos: any): Promise<void> => {
  const pRef = doc(db, COLECCION_PARTIDOS, partidoId)
  await updateDoc(pRef, datos)
}

/**
 * Actualiza el marcador en vivo punto a punto de un partido en disputa
 */
export const actualizarMarcadorEnVivoDB = async (
  partidoId: string,
  marcadorEnVivo: MarcadorEnVivo | null,
): Promise<void> => {
  if (!partidoId) return
  try {
    const pRef = doc(db, COLECCION_PARTIDOS, partidoId)
    if (!marcadorEnVivo) {
      await updateDoc(pRef, {
        marcadorEnVivo: null,
      })
      return
    }

    const marcadorLimpio: Record<string, unknown> = {
      puntosJ1: Number(marcadorEnVivo.puntosJ1) || 0,
      puntosJ2: Number(marcadorEnVivo.puntosJ2) || 0,
      setActual: String(marcadorEnVivo.setActual || 'Set 1'),
      numeroSet: Number(marcadorEnVivo.numeroSet) || 1,
      setsGanadosJ1: Number(marcadorEnVivo.setsGanadosJ1) || 0,
      setsGanadosJ2: Number(marcadorEnVivo.setsGanadosJ2) || 0,
      mesa: String(marcadorEnVivo.mesa || 'Mesa 1'),
      servidorActual: Number(marcadorEnVivo.servidorActual) || 1,
      actualizadoEn: Number(marcadorEnVivo.actualizadoEn) || Date.now(),
    }

    await updateDoc(pRef, {
      marcadorEnVivo: marcadorLimpio,
      mesa: marcadorLimpio.mesa,
    })
  } catch (error) {
    console.error(`[MarcadorEnVivo] Error al actualizar en Firestore para partido ${partidoId}:`, error)
  }
}

/**
 * Suscribe a todos los partidos que se encuentran actualmente 'en_curso' o con 'transmisionActiva'
 */
export const suscribirPartidosEnVivoDB = (
  onActualizar: (partidos: any[]) => void,
  onError?: (error: Error) => void,
): Unsubscribe => {
  const docsQ1 = new Map<string, any>()
  const docsQ2 = new Map<string, any>()

  const emitir = () => {
    const mapa = new Map<string, any>()
    docsQ1.forEach((val, key) => mapa.set(key, val))
    docsQ2.forEach((val, key) => mapa.set(key, val))

    const ahora = Date.now()
    const validos = Array.from(mapa.values()).filter((p: any) => {
      // Ignorar de inmediato partidos que ya fueron registrados como jugados
      if (p.estado === 'jugado') return false

      // Descartar transmisiones zombis si no emitieron latido en los últimos 45 segundos
      if (p.transmisionActiva && p.ultimaSenalEnVivo && ahora - p.ultimaSenalEnVivo > 45000) {
        p.transmisionActiva = false
      }

      return p.estado === 'en_curso' || p.transmisionActiva === true
    })

    onActualizar(validos)
  }

  const q1 = query(collection(db, COLECCION_PARTIDOS), where('estado', '==', 'en_curso'))
  const q2 = query(collection(db, COLECCION_PARTIDOS), where('transmisionActiva', '==', true))

  const unsub1 = onSnapshot(
    q1,
    (snap) => {
      docsQ1.clear()
      snap.forEach((documento) => {
        docsQ1.set(documento.id, { id: documento.id, ...documento.data() })
      })
      emitir()
    },
    (err) => {
      console.warn('Error en listener en tiempo real de partidos en vivo (estado):', err)
      onError?.(err)
    },
  )

  const unsub2 = onSnapshot(
    q2,
    (snap) => {
      docsQ2.clear()
      snap.forEach((documento) => {
        docsQ2.set(documento.id, { id: documento.id, ...documento.data() })
      })
      emitir()
    },
    (err) => {
      console.warn('Error en listener en tiempo real de partidos en vivo (transmision):', err)
      onError?.(err)
    },
  )

  return () => {
    unsub1()
    unsub2()
  }
}

/**
 * Elimina todos los partidos asociados a un torneo en Firestore
 */
export const eliminarPartidosTorneoDB = async (torneoId: string): Promise<void> => {
  try {
    const q = query(collection(db, COLECCION_PARTIDOS), where('torneoId', '==', torneoId))
    const snap = await getDocs(q)
    const promesas = snap.docs.map((docSnap) => deleteDoc(docSnap.ref))
    await Promise.all(promesas)
  } catch (error) {
    console.warn(`Error al eliminar partidos del torneo ${torneoId}:`, error)
  }
}

/**
 * Elimina la tabla de posiciones oficial de un torneo en Firestore
 */
export const eliminarTablaPosicionesDB = async (torneoId: string): Promise<void> => {
  try {
    const tablaRef = doc(db, COLECCION_TABLAS_POSICIONES, torneoId)
    await deleteDoc(tablaRef)
  } catch (error) {
    console.warn(`Error al eliminar tabla de posiciones del torneo ${torneoId}:`, error)
  }
}

/**
 * Obtiene la tabla de posiciones oficial de un torneo desde la colección dedicada 'tablas_posiciones'
 */
export const obtenerTablaPosicionesDB = async (torneoId: string): Promise<TablaPosicionesTorneo | null> => {
  try {
    const docRef = doc(db, COLECCION_TABLAS_POSICIONES, torneoId)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as TablaPosicionesTorneo
    }
    return null
  } catch (error) {
    console.warn('Error al obtener tabla de posiciones desde Firestore:', error)
    return null
  }
}

export const suscribirTablaPosicionesDB = (
  torneoId: string,
  onActualizar: (tabla: TablaPosicionesTorneo | null) => void,
  onError?: (error: Error) => void
): Unsubscribe => {
  const docRef = doc(db, COLECCION_TABLAS_POSICIONES, torneoId)
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        onActualizar({ id: docSnap.id, ...docSnap.data() } as TablaPosicionesTorneo)
      } else {
        onActualizar(null)
      }
    },
    (err) => {
      console.warn('Error en listener en tiempo real de tabla de posiciones:', err)
      onError?.(err)
    }
  )
}

/**
 * Guarda o actualiza la tabla de posiciones oficial en la colección dedicada 'tablas_posiciones'
 */
export const guardarTablaPosicionesDB = async (
  torneoId: string,
  posiciones: FilaPosicionOficial[],
  totalPartidosJugados: number = 0,
): Promise<void> => {
  try {
    const tablaRef = doc(db, COLECCION_TABLAS_POSICIONES, torneoId)
    const payload: TablaPosicionesTorneo = {
      id: torneoId,
      torneoId,
      tipoFase: 'round_robin',
      posiciones,
      totalPartidosJugados,
      actualizadoEn: new Date().toISOString(),
    }
    await setDoc(tablaRef, payload)
  } catch (error) {
    console.warn('Error al guardar tabla de posiciones en la colección tablas_posiciones:', error)
  }
}

/**
 * Alias compatible hacia atrás para persistir en la nueva colección
 */
export const actualizarTablaPosicionesDB = async (torneoId: string, posiciones: any[]): Promise<void> => {
  await guardarTablaPosicionesDB(torneoId, posiciones)
}



export const actualizarClasificadosPlayoffsDB = async (torneoId: string, clasificados: number): Promise<void> => {
  try {
    const torneoRef = doc(db, 'torneos', torneoId)
    await updateDoc(torneoRef, {
      clasificadosPlayoffs: clasificados,
    })
  } catch (error) {
    console.warn('No se pudo actualizar clasificadosPlayoffs en torneo:', error)
  }
}

/**
 * Obtiene todos los usuarios registrados en la base de datos
 */
export const obtenerUsuariosDB = async (): Promise<Usuario[]> => {
  try {
    const snap = await getDocs(collection(db, 'usuarios'))
    const usuarios: Usuario[] = []
    snap.forEach((documento) => {
      usuarios.push({ id: documento.id, ...documento.data() } as Usuario)
    })
    return usuarios
  } catch (error) {
    console.warn('Error al obtener usuarios desde Firestore:', error)
    return []
  }
}

export interface EstadisticasJugador {
  torneosJugados: number
  torneosEnCurso: number
  partidosJugados: number
  partidosGanados: number
  partidosPerdidos: number
  setsGanados: number
  setsPerdidos: number
  efectividad: number
  puntosRanking: number
  podios: number
  etiquetaElo: string
}

/**
 * Calcula en tiempo real las estadísticas oficiales de un jugador a partir de sus torneos,
 * partidos reales y podios disputados en Firestore.
 */
export const obtenerEstadisticasJugadorDB = async (
  usuarioId: string,
  usuarioNombre?: string,
  torneosInscritos: Torneo[] = [],
  rankingBasePerfil?: number,
): Promise<EstadisticasJugador> => {
  const baseRating = rankingBasePerfil && rankingBasePerfil > 0 ? rankingBasePerfil : 1000

  const stats: EstadisticasJugador = {
    torneosJugados: 0,
    torneosEnCurso: 0,
    partidosJugados: 0,
    partidosGanados: 0,
    partidosPerdidos: 0,
    setsGanados: 0,
    setsPerdidos: 0,
    efectividad: 0,
    puntosRanking: baseRating,
    podios: 0,
    etiquetaElo: 'ELO Base',
  }

  if (!usuarioId) return stats

  // 1. Torneos oficiales
  stats.torneosEnCurso = torneosInscritos.filter(
    (t) => t.subestado !== 'PENDIENTE' && t.estado === 'en curso'
  ).length
  stats.torneosJugados = torneosInscritos.filter(
    (t) => t.subestado !== 'PENDIENTE' && t.estado === 'finalizado'
  ).length

  // 2. Partidos y sets en cada torneo
  for (const torneo of torneosInscritos) {
    if (torneo.subestado === 'PENDIENTE') continue

    try {
      const partidos = await obtenerPartidosDB(torneo.id)
      const partidosJugados = partidos.filter((p) => p.estado === 'jugado')

      for (const p of partidosJugados) {
        const j1Id = String(p.jugador1?.id || p.jugador1Id || '')
        const j2Id = String(p.jugador2?.id || p.jugador2Id || '')
        const j1Nombre = p.jugador1?.nombre || ''
        const j2Nombre = p.jugador2?.nombre || ''

        const esJ1 =
          (j1Id && (j1Id === usuarioId || j1Id.endsWith('_' + usuarioId) || usuarioId.endsWith('_' + j1Id))) ||
          (usuarioNombre && j1Nombre && j1Nombre.toLowerCase().includes(usuarioNombre.toLowerCase()))
        const esJ2 =
          (j2Id && (j2Id === usuarioId || j2Id.endsWith('_' + usuarioId) || usuarioId.endsWith('_' + j2Id))) ||
          (usuarioNombre && j2Nombre && j2Nombre.toLowerCase().includes(usuarioNombre.toLowerCase()))

        if (esJ1 || esJ2) {
          stats.partidosJugados++
          const ganadorId = String(p.ganadorId || p.jugadorGanadorId || '')
          const esGanador =
            (ganadorId && (ganadorId === usuarioId || ganadorId.endsWith('_' + usuarioId) || usuarioId.endsWith('_' + ganadorId))) ||
            (esJ1 && p.marcador?.startsWith('2')) ||
            (esJ2 && p.marcador?.endsWith('2'))

          if (esGanador) {
            stats.partidosGanados++
          } else if (ganadorId || p.marcador) {
            stats.partidosPerdidos++
          }

          // Conteo de sets
          if (p.sets && Array.isArray(p.sets) && p.sets.length > 0) {
            p.sets.forEach((s: any) => {
              const ganoSet =
                (s.ganadorId && (s.ganadorId === usuarioId || String(s.ganadorId).includes(usuarioId))) ||
                (esJ1 && Number(s.puntosJugador1) > Number(s.puntosJugador2)) ||
                (esJ2 && Number(s.puntosJugador2) > Number(s.puntosJugador1))

              if (ganoSet) {
                stats.setsGanados++
              } else {
                stats.setsPerdidos++
              }
            })
          } else if (p.marcador && typeof p.marcador === 'string') {
            const partes = p.marcador.split('-').map((str: string) => parseInt(str.trim()))
            if (partes.length === 2 && !isNaN(partes[0]) && !isNaN(partes[1])) {
              if (esJ1) {
                stats.setsGanados += partes[0]
                stats.setsPerdidos += partes[1]
              } else {
                stats.setsGanados += partes[1]
                stats.setsPerdidos += partes[0]
              }
            }
          }
        }
      }

      // 3. Podios en torneos finalizados
      if (torneo.estado === 'finalizado') {
        const tabla = await obtenerTablaPosicionesDB(torneo.id)
        if (tabla && tabla.posiciones) {
          const miFila = tabla.posiciones.find((pos) => {
            const posId = String(pos.jugadorId || '')
            return (
              posId === usuarioId ||
              posId.endsWith('_' + usuarioId) ||
              usuarioId.endsWith('_' + posId) ||
              (usuarioNombre && pos.nombre && pos.nombre.toLowerCase().includes(usuarioNombre.toLowerCase()))
            )
          })
          if (miFila && miFila.posicion > 0 && miFila.posicion <= 3) {
            stats.podios++
          }
        }
      }
    } catch (e) {
      console.warn(`Error al obtener estadísticas del torneo ${torneo.id}:`, e)
    }
  }

  // 4. Efectividad calculada
  const totalSets = stats.setsGanados + stats.setsPerdidos
  stats.efectividad = totalSets > 0 ? Math.round((stats.setsGanados / totalSets) * 100) : 0

  // 5. Rating de Circuito Oficial ELO
  if (stats.partidosJugados > 0) {
    stats.puntosRanking = Math.max(
      500,
      baseRating + stats.partidosGanados * 30 - stats.partidosPerdidos * 15 + stats.podios * 60,
    )
    stats.etiquetaElo = 'Rating Oficial'
  } else {
    stats.puntosRanking = baseRating
    stats.etiquetaElo = 'ELO Base'
  }

  return stats
}

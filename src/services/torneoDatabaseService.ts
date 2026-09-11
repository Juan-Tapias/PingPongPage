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
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { Torneo, EstadoTorneo, Usuario, FilaPosicionOficial, TablaPosicionesTorneo } from '@/types'

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


export const obtenerPartidosDB = async (torneoId: string): Promise<any[]> => {
  try {
    const q = query(collection(db, COLECCION_PARTIDOS), where('torneoId', '==', torneoId))
    const snap = await getDocs(q)
    const partidos: any[] = []
    snap.forEach((documento) => {
      partidos.push({ id: documento.id, ...documento.data() })
    })
    return partidos
  } catch (error) {
    console.warn('Error al obtener partidos:', error)
    return []
  }
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

/**
 * Algoritmo oficial de cálculo de métricas para la tabla de posiciones (PJ, PG, PP, SF, SC, PTS)
 */
export const calcularTablaDesdePartidos = (
  jugadores: any[],
  partidos: any[],
  clasificadosPlayoffs: number = 4,
): FilaPosicionOficial[] => {
  if (!jugadores || jugadores.length === 0) return []

  const partidosJugados = (partidos || []).filter((p) => p.estado === 'jugado')

  const filas: FilaPosicionOficial[] = jugadores.map((jugador) => {
    let pj = 0
    let pg = 0
    let pp = 0
    let sf = 0
    let sc = 0

    const idJugador = jugador.id || jugador.jugadorId

    partidosJugados.forEach((partido) => {
      const j1Id = partido.jugador1?.id || partido.jugador1Id
      const j2Id = partido.jugador2?.id || partido.jugador2Id
      const esJ1 = j1Id === idJugador || j1Id?.endsWith(idJugador) || idJugador?.endsWith(j1Id)
      const esJ2 = j2Id === idJugador || j2Id?.endsWith(idJugador) || idJugador?.endsWith(j2Id)

      if (esJ1 || esJ2) {
        pj++
        const ganadorId = partido.ganadorId || partido.jugadorGanadorId
        const esGanador = ganadorId === idJugador || (ganadorId && (ganadorId.endsWith(idJugador) || idJugador.endsWith(ganadorId)))

        if (esGanador) {
          pg++
        } else if (ganadorId) {
          pp++
        }

        // Sets
        if (partido.sets && Array.isArray(partido.sets) && partido.sets.length > 0) {
          partido.sets.forEach((s: any) => {
            const setGanador = s.ganadorId
            const ganoEsteSet = setGanador === idJugador || (setGanador && (setGanador.endsWith(idJugador) || idJugador.endsWith(setGanador)))
            if (ganoEsteSet) {
              sf++
            } else if (setGanador) {
              sc++
            }
          })
        } else if (partido.marcador && typeof partido.marcador === 'string') {
          const partes = partido.marcador.split('-').map((str: string) => parseInt(str.trim()))
          if (partes.length === 2 && !isNaN(partes[0]) && !isNaN(partes[1])) {
            if (esJ1) {
              sf += partes[0]
              sc += partes[1]
            } else {
              sf += partes[1]
              sc += partes[0]
            }
          }
        }
      }
    })

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

  // Ordenar por: 1) Puntos, 2) Diferencia de Sets (SF - SC), 3) Sets a Favor (SF)
  filas.sort((a, b) => {
    if (b.puntos !== a.puntos) return b.puntos - a.puntos
    const difB = b.sf - b.sc
    const difA = a.sf - a.sc
    if (difB !== difA) return difB - difA
    return b.sf - a.sf
  })

  // Asignar posición y destino según clasificadosPlayoffs
  return filas.map((fila, idx) => {
    const pos = idx + 1
    let destino = 'Eliminado'
    if (clasificadosPlayoffs === 2) {
      destino = pos <= 2 ? 'Gran Final' : 'Fase Regular'
    } else if (clasificadosPlayoffs === 4) {
      destino = pos <= 4 ? 'Cuartos (BYE)' : 'Play-In'
    } else if (clasificadosPlayoffs === 6) {
      if (pos <= 2) destino = 'Semis (BYE)'
      else if (pos <= 6) destino = 'Cuartos'
      else destino = 'Play-In'
    } else if (clasificadosPlayoffs === 8) {
      destino = pos <= 8 ? 'Cuartos de Final' : 'Fase Regular'
    } else {
      destino = pos <= 4 ? 'Cuartos (BYE)' : 'Play-In'
    }

    return {
      ...fila,
      posicion: pos,
      destino,
    }
  })
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




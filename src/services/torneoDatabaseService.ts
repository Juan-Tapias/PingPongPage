import {
  collection,
  doc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { Torneo, EstadoTorneo } from '@/types'

const COLECCION_TORNEOS = 'torneos'
const COLECCION_PARTIDOS = 'partidos'
const COLECCION_INSCRIPCIONES = 'inscripciones'

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
 * Obtiene los partidos de un torneo
 */
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

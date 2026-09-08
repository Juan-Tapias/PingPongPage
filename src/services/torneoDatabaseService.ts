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
import type { Torneo, EstadoTorneo, Usuario } from '@/types'

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

export const actualizarTablaPosicionesDB = async (torneoId: string, posiciones: any[]): Promise<void> => {
  try {
    const torneoRef = doc(db, 'torneos', torneoId)
    await updateDoc(torneoRef, {
      tablaPosiciones: posiciones,
      ultimaActualizacionPosiciones: new Date().toISOString(),
    })
  } catch (error) {
    console.warn('No se pudo actualizar tablaPosiciones en torneo:', error)
  }
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

/**
 * Genera jugadores de prueba (aprobados) para validar el flujo completo del torneo
 */
export const generarJugadoresDemoDB = async (torneoId: string, cantidad: number = 4): Promise<any[]> => {
  const listaNombres = [
    { nombre: 'Carlos Mendoza', iniciales: 'CM', telefono: '+57 312 456 7890', tipo: 'camper' },
    { nombre: 'Andres Rivera', iniciales: 'AR', telefono: '+57 300 876 5432', tipo: 'camper' },
    { nombre: 'Valentina Gomez', iniciales: 'VG', telefono: '+57 315 234 5678', tipo: 'staff' },
    { nombre: 'Mateo Hernandez', iniciales: 'MH', telefono: '+57 318 901 2345', tipo: 'camper' },
    { nombre: 'Daniel Ospina', iniciales: 'DO', telefono: '+57 301 345 6789', tipo: 'camper' },
    { nombre: 'Sofia Ramirez', iniciales: 'SR', telefono: '+57 316 678 9012', tipo: 'camper' },
  ]

  const jugadoresCreados: any[] = []
  const max = Math.min(cantidad, listaNombres.length)

  for (let i = 0; i < max; i++) {
    const demo = listaNombres[i]
    if (!demo) continue
    const idJugador = `demo_player_${i + 1}`
    const nuevaInscripcion = {
      id: `${torneoId}_${idJugador}`,
      torneoId,
      jugadorId: idJugador,
      nombre: demo.nombre,
      iniciales: demo.iniciales,
      telefono: demo.telefono,
      tipo: demo.tipo,
      pagoValidado: true,
      subestado: 'INSCRITO',
      fechaInscripcion: new Date().toISOString(),
    }
    await guardarInscripcionDB(nuevaInscripcion)
    jugadoresCreados.push(nuevaInscripcion)
  }

  return jugadoresCreados
}

/**
 * Genera un escenario de torneo hiper-realista completo en Firestore
 * (Jugadores, Partidos jugados con marcadores, Jornada activa y conflicto de admin)
 */
export const generarTorneoDemoCompletoDB = async (torneoId: string, usuarioActual?: any): Promise<void> => {
  const yoId = usuarioActual?.id || 'usuario_actual'
  const yoNombre = usuarioActual?.nombre
    ? `${usuarioActual.nombre} ${usuarioActual.apellido || ''}`.trim()
    : 'Jose Guillermo Paúl Diaz'
  const yoIniciales = `${yoNombre[0] || 'J'}${yoNombre.split(' ')[1]?.[0] || 'P'}`.toUpperCase()

  const participantes = [
    { id: yoId, nombre: yoNombre, iniciales: yoIniciales, telefono: usuarioActual?.telefono || '+57 317 800 1452', tipo: 'camper' },
    { id: 'demo_carlos', nombre: 'Carlos Mendoza', iniciales: 'CM', telefono: '+57 312 456 7890', tipo: 'camper' },
    { id: 'demo_andres', nombre: 'Andres Rivera', iniciales: 'AR', telefono: '+57 300 876 5432', tipo: 'camper' },
    { id: 'demo_valentina', nombre: 'Valentina Gomez', iniciales: 'VG', telefono: '+57 315 234 5678', tipo: 'staff' },
    { id: 'demo_mateo', nombre: 'Mateo Hernandez', iniciales: 'MH', telefono: '+57 318 901 2345', tipo: 'camper' },
    { id: 'demo_daniel', nombre: 'Daniel Ospina', iniciales: 'DO', telefono: '+57 301 345 6789', tipo: 'camper' },
  ]

  for (const p of participantes) {
    await guardarInscripcionDB({
      id: `${torneoId}_${p.id}`,
      torneoId,
      jugadorId: p.id,
      nombre: p.nombre,
      iniciales: p.iniciales,
      telefono: p.telefono,
      tipo: p.tipo,
      pagoValidado: true,
      subestado: 'INSCRITO',
      fechaInscripcion: new Date().toISOString(),
    })
  }

  const partidos: any[] = [
    // --- RONDA 1 (JUGADOS) ---
    {
      id: `p_${torneoId}_1_1`,
      torneoId,
      jugador1Id: yoId,
      jugador2Id: 'demo_carlos',
      jugador1: participantes[0],
      jugador2: participantes[1],
      jugadorGanadorId: yoId,
      marcador: '2 - 1',
      marcadorDetallado: '11-9, 8-11, 11-7',
      estado: 'jugado',
      ronda: 1,
      jornada: 1,
      diasRestantes: 0,
      codigoJugador1: '12345',
      codigoJugador2: '54321',
      sets: [
        { setNumero: 1, puntosJugador1: 11, puntosJugador2: 9 },
        { setNumero: 2, puntosJugador1: 8, puntosJugador2: 11 },
        { setNumero: 3, puntosJugador1: 11, puntosJugador2: 7 },
      ],
    },
    {
      id: `p_${torneoId}_1_2`,
      torneoId,
      jugador1Id: 'demo_andres',
      jugador2Id: 'demo_valentina',
      jugador1: participantes[2],
      jugador2: participantes[3],
      jugadorGanadorId: 'demo_andres',
      marcador: '2 - 0',
      marcadorDetallado: '11-6, 11-4',
      estado: 'jugado',
      ronda: 1,
      jornada: 1,
      diasRestantes: 0,
      codigoJugador1: '23456',
      codigoJugador2: '65432',
      sets: [
        { setNumero: 1, puntosJugador1: 11, puntosJugador2: 6 },
        { setNumero: 2, puntosJugador1: 11, puntosJugador2: 4 },
      ],
    },
    {
      id: `p_${torneoId}_1_3`,
      torneoId,
      jugador1Id: 'demo_mateo',
      jugador2Id: 'demo_daniel',
      jugador1: participantes[4],
      jugador2: participantes[5],
      jugadorGanadorId: 'demo_daniel',
      marcador: '1 - 2',
      marcadorDetallado: '9-11, 11-8, 7-11',
      estado: 'jugado',
      ronda: 1,
      jornada: 1,
      diasRestantes: 0,
      codigoJugador1: '34567',
      codigoJugador2: '76543',
      sets: [
        { setNumero: 1, puntosJugador1: 9, puntosJugador2: 11 },
        { setNumero: 2, puntosJugador1: 11, puntosJugador2: 8 },
        { setNumero: 3, puntosJugador1: 7, puntosJugador2: 11 },
      ],
    },

    // --- RONDA 2 (ACTIVA) ---
    {
      id: `p_${torneoId}_2_1`,
      torneoId,
      jugador1Id: yoId,
      jugador2Id: 'demo_andres',
      jugador1: participantes[0],
      jugador2: participantes[2],
      estado: 'pendiente',
      ronda: 2,
      jornada: 2,
      diasRestantes: 2,
      codigoJugador1: '31924',
      codigoJugador2: '84015',
    },
    {
      id: `p_${torneoId}_2_2`,
      torneoId,
      jugador1Id: 'demo_carlos',
      jugador2Id: 'demo_mateo',
      jugador1: participantes[1],
      jugador2: participantes[4],
      estado: 'pendiente',
      ronda: 2,
      jornada: 2,
      diasRestantes: 2,
      codigoJugador1: '49201',
      codigoJugador2: '71583',
    },
    {
      id: `p_${torneoId}_2_3`,
      torneoId,
      jugador1Id: 'demo_valentina',
      jugador2Id: 'demo_daniel',
      jugador1: participantes[3],
      jugador2: participantes[5],
      estado: 'pendiente',
      ronda: 2,
      jornada: 2,
      diasRestantes: 2,
      codigoJugador1: '62849',
      codigoJugador2: '15937',
    },

    // --- RONDA 3 (EN CONFLICTO / PENDIENTE ADMIN) ---
    {
      id: `p_${torneoId}_3_1`,
      torneoId,
      jugador1Id: yoId,
      jugador2Id: 'demo_valentina',
      jugador1: participantes[0],
      jugador2: participantes[3],
      estado: 'pendiente_admin',
      ronda: 3,
      jornada: 3,
      diasRestantes: 0,
      codigoJugador1: '95123',
      codigoJugador2: '35789',
    },
    {
      id: `p_${torneoId}_3_2`,
      torneoId,
      jugador1Id: 'demo_carlos',
      jugador2Id: 'demo_daniel',
      jugador1: participantes[1],
      jugador2: participantes[5],
      estado: 'pendiente',
      ronda: 3,
      jornada: 3,
      diasRestantes: 2,
      codigoJugador1: '84261',
      codigoJugador2: '26481',
    },
    {
      id: `p_${torneoId}_3_3`,
      torneoId,
      jugador1Id: 'demo_andres',
      jugador2Id: 'demo_mateo',
      jugador1: participantes[2],
      jugador2: participantes[4],
      estado: 'pendiente',
      ronda: 3,
      jornada: 3,
      diasRestantes: 2,
      codigoJugador1: '73915',
      codigoJugador2: '51937',
    },
  ]

  await guardarPartidosDB(partidos)
  await actualizarEstadoTorneoDB(torneoId, 'en curso')
}


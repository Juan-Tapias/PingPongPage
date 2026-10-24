/**
 * Servicio de Encolado y Gestión de Correos Oficiales — spinApp 2026
 *
 * ARQUITECTURA SEGURA:
 * NUNCA se guardan credenciales ni contraseñas de app en el cliente Vite.
 * La aplicación encola documentos en las colecciones seguras de Firestore:
 * - 'cola_correos' (para el despachador de Cloud Functions / Worker local)
 * - 'mail' (para compatibilidad directa con la extensión oficial Trigger Email firestore-send-email)
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  limit,
  onSnapshot,
  updateDoc,
  deleteDoc,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import type {
  DocumentoCorreoCola,
  TipoPlantillaCorreo,
  Torneo,
  FilaPosicionOficial,
  Usuario,
} from '@/types'
import {
  plantillaRecordatorioPartido,
  plantillaTop4Clasificados,
  plantillaOctavosPlayIn,
  plantillaEliminadosMotivacion,
  plantillaCuartosDeFinal,
  plantillaSemifinales,
  plantillaGranFinal,
  plantillaCoronacionCampeon,
  type ContextoRecordatorioPartido,
  type ContextoTop4,
  type ContextoPlayIn,
  type ContextoEliminados,
  type ContextoCuartos,
  type ContextoSemifinales,
  type ContextoGranFinal,
  type ContextoCampeon,
  type ResultadoPlantilla,
} from '@/services/emailTemplates'
import { obtenerUsuariosDB } from '@/services/torneoDatabaseService'

export const COLECCION_COLA_CORREOS = 'cola_correos'
export const COLECCION_TRIGGER_EMAIL = 'mail'

/**
 * Encola un correo en Firestore con doble compatibilidad:
 * 1) 'cola_correos' con metadatos completos y estado
 * 2) 'mail' para la extensión Trigger Email (firestore-send-email)
 */
export const encolarCorreoDB = async (payload: {
  to: string | string[]
  plantilla: ResultadoPlantilla
  tipoPlantilla: TipoPlantillaCorreo
  torneoId?: string
  partidoId?: string
  destinatarioNombre?: string
  metadata?: Record<string, any>
}): Promise<string> => {
  const correoId = `mail_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
  const ahora = Date.now()

  const docCorreo: DocumentoCorreoCola = {
    id: correoId,
    to: payload.to,
    subject: payload.plantilla.asunto,
    html: payload.plantilla.html,
    text: payload.plantilla.texto,
    tipoPlantilla: payload.tipoPlantilla,
    torneoId: payload.torneoId,
    partidoId: payload.partidoId,
    destinatarioNombre: payload.destinatarioNombre,
    estado: 'pendiente',
    fechaCreacion: ahora,
    intentos: 0,
    metadata: payload.metadata || {},
    // Formato estándar de la extensión Trigger Email (firestore-send-email)
    message: {
      subject: payload.plantilla.asunto,
      html: payload.plantilla.html,
      text: payload.plantilla.texto,
    },
  }

  try {
    // 1. Guardar en 'cola_correos'
    const refCola = doc(db, COLECCION_COLA_CORREOS, correoId)
    await setDoc(refCola, docCorreo)

    // 2. Guardar en 'mail' (Trigger Email de Firebase)
    try {
      const refTrigger = doc(db, COLECCION_TRIGGER_EMAIL, correoId)
      await setDoc(refTrigger, {
        to: Array.isArray(payload.to) ? payload.to : [payload.to],
        message: {
          subject: payload.plantilla.asunto,
          html: payload.plantilla.html,
          text: payload.plantilla.texto,
        },
        metadata: {
          tipoPlantilla: payload.tipoPlantilla,
          torneoId: payload.torneoId || '',
          fechaCreacion: ahora,
        },
      })
    } catch (e) {
      console.warn('Nota: Colección mail no accesible o extensión no configurada aún:', e)
    }

    return correoId
  } catch (err) {
    console.error('Error al encolar correo en Firestore:', err)
    throw err
  }
}

/**
 * Suscribe en tiempo real a los correos en la cola para monitor de estado en el panel admin
 */
export const suscribirColaCorreosDB = (
  onActualizar: (correos: DocumentoCorreoCola[]) => void,
  limiteRegistros = 50,
): Unsubscribe => {
  try {
    const q = query(
      collection(db, COLECCION_COLA_CORREOS),
      orderBy('fechaCreacion', 'desc'),
      limit(limiteRegistros),
    )

    return onSnapshot(
      q,
      (snap) => {
        const correos: DocumentoCorreoCola[] = []
        snap.forEach((d) => {
          correos.push({ id: d.id, ...d.data() } as DocumentoCorreoCola)
        })
        onActualizar(correos)
      },
      (err) => {
        console.warn('Error en suscripción de cola de correos:', err)
      },
    )
  } catch (err) {
    console.warn('Error al iniciar listener de cola_correos:', err)
    return () => {}
  }
}

/**
 * Obtiene los últimos correos despachados o en cola
 */
export const obtenerColaCorreosDB = async (limiteRegistros = 50): Promise<DocumentoCorreoCola[]> => {
  try {
    const q = query(
      collection(db, COLECCION_COLA_CORREOS),
      orderBy('fechaCreacion', 'desc'),
      limit(limiteRegistros),
    )
    const snap = await getDocs(q)
    const correos: DocumentoCorreoCola[] = []
    snap.forEach((d) => {
      correos.push({ id: d.id, ...d.data() } as DocumentoCorreoCola)
    })
    return correos
  } catch (err) {
    console.warn('Error al consultar cola de correos:', err)
    return []
  }
}

/**
 * Reintenta el envío de un correo fallido
 */
export const reintentarCorreoDB = async (correoId: string): Promise<void> => {
  const ref = doc(db, COLECCION_COLA_CORREOS, correoId)
  await updateDoc(ref, {
    estado: 'pendiente',
    error: null,
    intentos: 0,
  })
}

/**
 * Elimina un registro de la cola
 */
export const eliminarCorreoColaDB = async (correoId: string): Promise<void> => {
  const ref = doc(db, COLECCION_COLA_CORREOS, correoId)
  await deleteDoc(ref)
}

// =============================================================================
// DESPACHADORES TRANSACCIONALES POR CASO DE USO
// =============================================================================

/**
 * CORREO 1: Enviar recordatorio de partido pendiente (<48h)
 */
export const encolarRecordatorioPartido = async (
  emailDestinatario: string,
  ctx: ContextoRecordatorioPartido,
  torneoId?: string,
  partidoId?: string,
): Promise<string> => {
  const plantilla = plantillaRecordatorioPartido(ctx)
  return encolarCorreoDB({
    to: emailDestinatario,
    plantilla,
    tipoPlantilla: 'recordatorio_partido',
    torneoId,
    partidoId,
    destinatarioNombre: ctx.nombreJugador,
    metadata: { rival: ctx.nombreRival },
  })
}

/**
 * CORREO 2: Enviar pase directo Top 4
 */
export const encolarNotificacionTop4 = async (
  emailDestinatario: string,
  ctx: ContextoTop4,
  torneoId?: string,
): Promise<string> => {
  const plantilla = plantillaTop4Clasificados(ctx)
  return encolarCorreoDB({
    to: emailDestinatario,
    plantilla,
    tipoPlantilla: 'cierre_fase1_top4',
    torneoId,
    destinatarioNombre: ctx.nombreJugador,
    metadata: { posicion: ctx.posicion, puntos: ctx.puntos },
  })
}

/**
 * CORREO 3: Enviar pase a Octavos / Play-In (Puestos 5-12)
 */
export const encolarNotificacionPlayIn = async (
  emailDestinatario: string,
  ctx: ContextoPlayIn,
  torneoId?: string,
): Promise<string> => {
  const plantilla = plantillaOctavosPlayIn(ctx)
  return encolarCorreoDB({
    to: emailDestinatario,
    plantilla,
    tipoPlantilla: 'cierre_fase1_playin',
    torneoId,
    destinatarioNombre: ctx.nombreJugador,
    metadata: { posicion: ctx.posicion, rival: ctx.nombreRival },
  })
}

/**
 * CORREO 4: Enviar motivación y agradecimiento a Eliminados (Puestos 13+)
 */
export const encolarNotificacionEliminados = async (
  emailDestinatario: string,
  ctx: ContextoEliminados,
  torneoId?: string,
): Promise<string> => {
  const plantilla = plantillaEliminadosMotivacion(ctx)
  return encolarCorreoDB({
    to: emailDestinatario,
    plantilla,
    tipoPlantilla: 'cierre_fase1_eliminados',
    torneoId,
    destinatarioNombre: ctx.nombreJugador,
    metadata: { posicion: ctx.posicionFinal },
  })
}

/**
 * CORREO 5: Notificar cruce de Cuartos de Final
 */
export const encolarNotificacionCuartos = async (
  emailDestinatario: string,
  ctx: ContextoCuartos,
  torneoId?: string,
  partidoId?: string,
): Promise<string> => {
  const plantilla = plantillaCuartosDeFinal(ctx)
  return encolarCorreoDB({
    to: emailDestinatario,
    plantilla,
    tipoPlantilla: 'cuartos_final',
    torneoId,
    partidoId,
    destinatarioNombre: ctx.nombreJugador,
    metadata: { rival: ctx.nombreRival },
  })
}

/**
 * CORREO 6: Notificar Semifinalistas
 */
export const encolarNotificacionSemifinales = async (
  emailDestinatario: string,
  ctx: ContextoSemifinales,
  torneoId?: string,
  partidoId?: string,
): Promise<string> => {
  const plantilla = plantillaSemifinales(ctx)
  return encolarCorreoDB({
    to: emailDestinatario,
    plantilla,
    tipoPlantilla: 'semifinales',
    torneoId,
    partidoId,
    destinatarioNombre: ctx.nombreJugador,
    metadata: { rival: ctx.nombreRival },
  })
}

/**
 * CORREO 7: Transmitir Anuncio de La Gran Final a toda la comunidad
 */
export const encolarNotificacionGranFinal = async (
  destinatarios: string[],
  ctx: ContextoGranFinal,
  torneoId?: string,
): Promise<string> => {
  const plantilla = plantillaGranFinal(ctx)
  return encolarCorreoDB({
    to: destinatarios,
    plantilla,
    tipoPlantilla: 'gran_final',
    torneoId,
    destinatarioNombre: 'Comunidad spinApp',
    metadata: {
      finalista1: ctx.finalista1.nombre,
      finalista2: ctx.finalista2.nombre,
      transmision: ctx.enlaceTransmision,
    },
  })
}

/**
 * CORREO 8: Coronación del Gran Campeón a toda la comunidad
 */
export const encolarNotificacionCampeon = async (
  destinatarios: string[],
  ctx: ContextoCampeon,
  torneoId?: string,
): Promise<string> => {
  const plantilla = plantillaCoronacionCampeon(ctx)
  return encolarCorreoDB({
    to: destinatarios,
    plantilla,
    tipoPlantilla: 'coronacion_campeon',
    torneoId,
    destinatarioNombre: 'Comunidad spinApp',
    metadata: {
      campeon: ctx.nombreCampeon,
      subcampeon: ctx.nombreSubcampeon,
      marcador: ctx.marcadorFinal,
    },
  })
}

// =============================================================================
// DISPARADOR MAESTRO DE CIERRE DE FASE 1
// =============================================================================

export interface ResumenDespachoCierreFase1 {
  total: number
  top4: number
  playIn: number
  eliminados: number
  destinatariosNotificados: {
    nombre: string
    email: string
    posicion: number
    tipo: 'top4' | 'playin' | 'eliminados'
  }[]
}

/**
 * Despacha de forma automatizada los correos de Cierre de Fase 1:
 * - Puestos 1 al 4: Correo 2 (Top 4 Clasificados Directos a Cuartos con BYE)
 * - Puestos 5 al 12: Correo 3 (Clasificados a Octavos / Play-In)
 * - Puestos 13 en adelante: Correo 4 (Agradecimiento y Motivación)
 */
export const despacharLoteCierreFase1 = async (
  torneo: Torneo,
  posiciones: FilaPosicionOficial[],
  usuariosRegistrados?: Usuario[],
): Promise<ResumenDespachoCierreFase1> => {
  const usuarios = usuariosRegistrados && usuariosRegistrados.length > 0
    ? usuariosRegistrados
    : await obtenerUsuariosDB()

  const mapaEmailPorId = new Map<string, { email: string; nombre: string; fotoUrl?: string }>()
  usuarios.forEach((u) => {
    mapaEmailPorId.set(u.id, {
      email: u.email,
      nombre: `${u.nombre} ${u.apellido}`.trim(),
      fotoUrl: u.fotoUrl,
    })
  })

  const resumen: ResumenDespachoCierreFase1 = {
    total: 0,
    top4: 0,
    playIn: 0,
    eliminados: 0,
    destinatariosNotificados: [],
  }

  // Ordenar posiciones por puesto oficial
  const posicionesOrdenadas = [...posiciones].sort((a, b) => a.posicion - b.posicion)

  for (const fila of posicionesOrdenadas) {
    const usuarioInfo = mapaEmailPorId.get(fila.jugadorId)
    // Si no está por id directo, buscar por nombre o usar fallback
    const email = usuarioInfo?.email || `${fila.nombre.toLowerCase().replace(/\s+/g, '.')}@spinapp.com`
    const nombre = fila.nombre || usuarioInfo?.nombre || 'Jugador'
    const pos = fila.posicion

    try {
      if (pos <= 4) {
        // CORREO 2: Top 4
        await encolarNotificacionTop4(
          email,
          {
            nombreJugador: nombre,
            posicion: pos,
            puntos: fila.puntos,
            partidosGanados: fila.pg,
            partidosPerdidos: fila.pp,
            setsGanados: fila.sf,
            setsPerdidos: fila.sc,
            torneoNombre: torneo.nombre,
          },
          torneo.id,
        )
        resumen.top4++
        resumen.destinatariosNotificados.push({ nombre, email, posicion: pos, tipo: 'top4' })
      } else if (pos <= 12) {
        // CORREO 3: Play-In de Octavos
        // En formato Play-In Berger 12 clasificados:
        // Puesto 5 vs Puesto 12 (Llave 1)
        // Puesto 6 vs Puesto 11 (Llave 2)
        // Puesto 7 vs Puesto 10 (Llave 3)
        // Puesto 8 vs Puesto 9  (Llave 4)
        const posRivalEsperado = 17 - pos // 5->12, 6->11, 7->10, 8->9, 9->8, 10->7, 11->6, 12->5
        const filaRival = posicionesOrdenadas.find((p) => p.posicion === posRivalEsperado)
        const nombreRival = filaRival?.nombre || `Puesto #${posRivalEsperado}`

        await encolarNotificacionPlayIn(
          email,
          {
            nombreJugador: nombre,
            posicion: pos,
            nombreRival,
            torneoNombre: torneo.nombre,
          },
          torneo.id,
        )
        resumen.playIn++
        resumen.destinatariosNotificados.push({ nombre, email, posicion: pos, tipo: 'playin' })
      } else {
        // CORREO 4: Eliminados
        await encolarNotificacionEliminados(
          email,
          {
            nombreJugador: nombre,
            posicionFinal: pos,
            torneoNombre: torneo.nombre,
          },
          torneo.id,
        )
        resumen.eliminados++
        resumen.destinatariosNotificados.push({ nombre, email, posicion: pos, tipo: 'eliminados' })
      }

      resumen.total++
    } catch (e) {
      console.warn(`Error al encolar correo para ${nombre} (${email}):`, e)
    }
  }

  return resumen
}

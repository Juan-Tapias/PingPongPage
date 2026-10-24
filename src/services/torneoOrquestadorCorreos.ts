/**
 * Orquestador Automático de Eventos y Notificaciones — spinApp 2026
 *
 * Escucha los cambios del torneo y partidos para disparar AUTOMÁTICAMENTE
 * los correos correspondientes sin necesidad de que el administrador lo haga manualmente:
 *
 * 1. Recordatorios de partidos pendientes (<48h con PIN de 5 dígitos)
 * 2. Cierre de Fase 1 (Top 4 a Cuartos con BYE, 5-12 a Octavos/Play-In, 13+ Agradecimiento)
 * 3. Cruces de Cuartos de Final definidos
 * 4. Semifinalistas confirmados
 * 5. La Gran Final definida (con link de transmisión en vivo y cartel VS)
 * 6. Coronación del Gran Campeón (con marcador y Mallero Mayor)
 */

import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { Torneo, PartidoGrupo, FilaPosicionOficial, Usuario } from '@/types'
import {
  encolarRecordatorioPartido,
  despacharLoteCierreFase1,
  encolarNotificacionCuartos,
  encolarNotificacionSemifinales,
  encolarNotificacionGranFinal,
  encolarNotificacionCampeon,
} from '@/services/emailService'
import { obtenerUsuariosDB } from '@/services/torneoDatabaseService'

export interface EstadoNotificacionesTorneo {
  notificacionCierreFase1?: boolean
  notificacionCuartos?: boolean
  notificacionSemis?: boolean
  notificacionFinal?: boolean
  notificacionCampeon?: boolean
}

/**
 * Escanea y procesa automáticamente todos los eventos del torneo.
 * Se invoca cada vez que un partido concluye, se actualiza el fixture o avanza una fase.
 */
export const procesarEventosAutomaticosTorneo = async (
  torneo: Torneo,
  partidos: PartidoGrupo[],
  posiciones?: FilaPosicionOficial[],
): Promise<{ eventosDisparados: string[] }> => {
  const eventosDisparados: string[] = []
  if (!torneo?.id || !partidos || partidos.length === 0) {
    return { eventosDisparados }
  }

  try {
    // 1. Obtener estado actual de notificaciones del torneo desde Firestore para no duplicar
    const torneoRef = doc(db, 'torneos', torneo.id)
    const torneoSnap = await getDoc(torneoRef)
    const torneoData = torneoSnap.exists() ? (torneoSnap.data() as any) : {}

    const usuarios = await obtenerUsuariosDB()
    const mapaUsuarios = new Map<string, Usuario>(usuarios.map((u) => [u.id, u]))

    // =========================================================================
    // EVENTO 1: RECORDATORIOS AUTOMÁTICOS DE PARTIDOS PENDIENTES (<48h)
    // =========================================================================
    const partidosPendientes = partidos.filter(
      (p) => (p.estado === 'pendiente' || p.estado === 'pendiente_admin') && !(p as any).recordatorioEnviado,
    )

    for (const p of partidosPendientes) {
      const horas = typeof p.horasRestantes === 'number' ? p.horasRestantes : 24
      // Disparar si restan 48 horas o menos
      if (horas <= 48) {
        const u1 = mapaUsuarios.get(p.jugador1Id)
        const u2 = mapaUsuarios.get(p.jugador2Id)

        if (u1?.email) {
          await encolarRecordatorioPartido(
            u1.email,
            {
              nombreJugador: `${u1.nombre} ${u1.apellido}`.trim(),
              nombreRival: u2 ? `${u2.nombre} ${u2.apellido}`.trim() : (p.jugador2?.nombre || 'Rival'),
              pinSeguridad: p.codigoJugador1,
              horasRestantes: horas,
              mesa: p.mesa,
              torneoNombre: torneo.nombre,
            },
            torneo.id,
            p.id,
          )
        }

        if (u2?.email) {
          await encolarRecordatorioPartido(
            u2.email,
            {
              nombreJugador: `${u2.nombre} ${u2.apellido}`.trim(),
              nombreRival: u1 ? `${u1.nombre} ${u1.apellido}`.trim() : (p.jugador1?.nombre || 'Rival'),
              pinSeguridad: p.codigoJugador2,
              horasRestantes: horas,
              mesa: p.mesa,
              torneoNombre: torneo.nombre,
            },
            torneo.id,
            p.id,
          )
        }

        // Marcar partido para no volver a enviar recordatorio del mismo ciclo
        try {
          const partidoDocRef = doc(db, 'partidos', p.id)
          await updateDoc(partidoDocRef, { recordatorioEnviado: true })
          ;(p as any).recordatorioEnviado = true
        } catch {}

        eventosDisparados.push(`Recordatorio partido ${p.id}`)
      }
    }

    // =========================================================================
    // EVENTO 2: CIERRE AUTOMÁTICO DE FASE 1 (ROUND ROBIN COMPLETO)
    // =========================================================================
    const partidosFaseRegular = partidos.filter(
      (p) => typeof (p as any).anilloOrbital === 'undefined' || p.ronda || (p as any).jornada,
    )
    const todosFaseRegularJugados =
      partidosFaseRegular.length > 0 &&
      partidosFaseRegular.every((p) => p.estado === 'jugado' || p.jugadorGanadorId)

    if (todosFaseRegularJugados && !torneoData.notificacionCierreFase1 && posiciones && posiciones.length > 0) {
      console.log(`[AutoMail] ¡Fase 1 terminada! Despachando Cierre de Fase 1 para torneo ${torneo.id}...`)
      await despacharLoteCierreFase1(torneo, posiciones, usuarios)
      await updateDoc(torneoRef, { notificacionCierreFase1: true })
      eventosDisparados.push('Cierre de Fase 1 (Top 4, Play-In y Eliminados)')
    }

    // =========================================================================
    // EVENTO 3: CUARTOS DE FINAL DEFINIDOS
    // =========================================================================
    const partidosCuartos = partidos.filter((p) => (p as any).ronda === 'cuartos' || (p as any).anilloOrbital === 2)
    if (
      partidosCuartos.length > 0 &&
      !torneoData.notificacionCuartos &&
      partidosCuartos.some((p) => p.jugador1Id && p.jugador2Id)
    ) {
      console.log(`[AutoMail] Cuartos de final definidos. Despachando notificaciones...`)
      for (const p of partidosCuartos) {
        const u1 = mapaUsuarios.get(p.jugador1Id)
        const u2 = mapaUsuarios.get(p.jugador2Id)
        const n1 = u1 ? `${u1.nombre} ${u1.apellido}`.trim() : (p.jugador1?.nombre || 'Jugador 1')
        const n2 = u2 ? `${u2.nombre} ${u2.apellido}`.trim() : (p.jugador2?.nombre || 'Jugador 2')

        if (u1?.email) {
          await encolarNotificacionCuartos(
            u1.email,
            {
              nombreJugador: n1,
              nombreRival: n2,
              mesa: p.mesa || 'Mesa 1',
              torneoNombre: torneo.nombre,
            },
            torneo.id,
            p.id,
          )
        }
        if (u2?.email) {
          await encolarNotificacionCuartos(
            u2.email,
            {
              nombreJugador: n2,
              nombreRival: n1,
              mesa: p.mesa || 'Mesa 1',
              torneoNombre: torneo.nombre,
            },
            torneo.id,
            p.id,
          )
        }
      }
      await updateDoc(torneoRef, { notificacionCuartos: true })
      eventosDisparados.push('Cuartos de Final')
    }

    // =========================================================================
    // EVENTO 4: SEMIFINALES CONFIRMADAS
    // =========================================================================
    const partidosSemis = partidos.filter((p) => (p as any).ronda === 'semifinal')
    const semisListas =
      partidosSemis.length >= 2 &&
      partidosSemis.every((p) => p.jugador1Id && p.jugador2Id)

    if (semisListas && !torneoData.notificacionSemis) {
      console.log(`[AutoMail] Semifinales listas. Despachando a los 4 semifinalistas...`)
      for (const p of partidosSemis) {
        const u1 = mapaUsuarios.get(p.jugador1Id)
        const u2 = mapaUsuarios.get(p.jugador2Id)
        const n1 = u1 ? `${u1.nombre} ${u1.apellido}`.trim() : (p.jugador1?.nombre || 'Jugador 1')
        const n2 = u2 ? `${u2.nombre} ${u2.apellido}`.trim() : (p.jugador2?.nombre || 'Jugador 2')

        if (u1?.email) {
          await encolarNotificacionSemifinales(
            u1.email,
            {
              nombreJugador: n1,
              nombreRival: n2,
              mesa: p.mesa || 'Mesa Central',
              bolsaPremio: (torneo.costoInscripcion * (torneo.cuposTomados || 16)).toLocaleString('es-CO'),
              torneoNombre: torneo.nombre,
            },
            torneo.id,
            p.id,
          )
        }
        if (u2?.email) {
          await encolarNotificacionSemifinales(
            u2.email,
            {
              nombreJugador: n2,
              nombreRival: n1,
              mesa: p.mesa || 'Mesa Central',
              bolsaPremio: (torneo.costoInscripcion * (torneo.cuposTomados || 16)).toLocaleString('es-CO'),
              torneoNombre: torneo.nombre,
            },
            torneo.id,
            p.id,
          )
        }
      }
      await updateDoc(torneoRef, { notificacionSemis: true })
      eventosDisparados.push('Semifinales')
    }

    // =========================================================================
    // EVENTO 5: LA GRAN FINAL DEFINIDA (EMISIÓN A TODA LA COMUNIDAD)
    // =========================================================================
    const partidoFinal = partidos.find((p) => (p as any).ronda === 'final' || (p as any).anilloOrbital === 1)
    const finalLista = partidoFinal && partidoFinal.jugador1Id && partidoFinal.jugador2Id

    if (finalLista && !torneoData.notificacionFinal) {
      console.log(`[AutoMail] ¡Gran Final lista! Despachando a toda la comunidad...`)
      const emailsComunidad = usuarios.map((u) => u.email).filter(Boolean)
      const u1 = mapaUsuarios.get(partidoFinal.jugador1Id)
      const u2 = mapaUsuarios.get(partidoFinal.jugador2Id)
      const f1Nombre = u1 ? `${u1.nombre} ${u1.apellido}`.trim() : (partidoFinal.jugador1?.nombre || 'Finalista 1')
      const f2Nombre = u2 ? `${u2.nombre} ${u2.apellido}`.trim() : (partidoFinal.jugador2?.nombre || 'Finalista 2')

      await encolarNotificacionGranFinal(
        emailsComunidad.length > 0 ? emailsComunidad : ['comunidad@spinapp.com'],
        {
          finalista1: {
            nombre: f1Nombre,
            fotoUrl: u1?.fotoUrl,
            iniciales: u1 ? `${u1.nombre[0]}${u1.apellido[0]}`.toUpperCase() : undefined,
          },
          finalista2: {
            nombre: f2Nombre,
            fotoUrl: u2?.fotoUrl,
            iniciales: u2 ? `${u2.nombre[0]}${u2.apellido[0]}`.toUpperCase() : undefined,
          },
          horario: 'Hoy — Partido Estelar',
          mesa: partidoFinal.mesa || 'Mesa 1 (Cancha Central)',
          bolsaPremio: (torneo.costoInscripcion * (torneo.cuposTomados || 16)).toLocaleString('es-CO'),
          enlaceTransmision: torneo.transmisionEnVivoUrl || torneo.linkTransmision || `${window.location.origin}/dashboard`,
          torneoNombre: torneo.nombre,
        },
        torneo.id,
      )
      await updateDoc(torneoRef, { notificacionFinal: true })
      eventosDisparados.push('Anuncio de La Gran Final')
    }

    // =========================================================================
    // EVENTO 6: CORONACIÓN DEL GRAN CAMPEÓN
    // =========================================================================
    if (partidoFinal && partidoFinal.estado === 'jugado' && !torneoData.notificacionCampeon) {
      console.log(`[AutoMail] ¡Tenemos Campeón! Despachando proclamación a la comunidad...`)
      const ganadorId = partidoFinal.jugadorGanadorId
      const perdedorId = ganadorId === partidoFinal.jugador1Id ? partidoFinal.jugador2Id : partidoFinal.jugador1Id

      const uCampeon = ganadorId ? mapaUsuarios.get(ganadorId) : undefined
      const uSub = perdedorId ? mapaUsuarios.get(perdedorId) : undefined

      const nombreCampeon = uCampeon ? `${uCampeon.nombre} ${uCampeon.apellido}`.trim() : 'Campeón 2026'
      const nombreSub = uSub ? `${uSub.nombre} ${uSub.apellido}`.trim() : 'Subcampeón 2026'

      // Calcular Mallero Mayor (jugador con más mallas en el torneo)
      let malleroMayor = 'Sebastián Gómez'
      let maxMallas = 0
      const conteoMallas = new Map<string, number>()

      partidos.forEach((p) => {
        if (p.sets && Array.isArray(p.sets)) {
          p.sets.forEach((s) => {
            if (s.mallasJugador1 && p.jugador1Id) {
              conteoMallas.set(p.jugador1Id, (conteoMallas.get(p.jugador1Id) || 0) + s.mallasJugador1)
            }
            if (s.mallasJugador2 && p.jugador2Id) {
              conteoMallas.set(p.jugador2Id, (conteoMallas.get(p.jugador2Id) || 0) + s.mallasJugador2)
            }
          })
        }
      })

      conteoMallas.forEach((cantidad, jId) => {
        if (cantidad > maxMallas) {
          maxMallas = cantidad
          const u = mapaUsuarios.get(jId)
          if (u) malleroMayor = `${u.nombre} ${u.apellido}`.trim()
        }
      })

      const emailsComunidad = usuarios.map((u) => u.email).filter(Boolean)

      await encolarNotificacionCampeon(
        emailsComunidad.length > 0 ? emailsComunidad : ['comunidad@spinapp.com'],
        {
          nombreCampeon,
          fotoCampeonUrl: uCampeon?.fotoUrl,
          nombreSubcampeon: nombreSub,
          fotoSubcampeonUrl: uSub?.fotoUrl,
          marcadorFinal: partidoFinal.marcador || '2 - 1',
          malleroMayorNombre: malleroMayor,
          totalMallas: maxMallas > 0 ? maxMallas : undefined,
          bolsaEntregada: (torneo.costoInscripcion * (torneo.cuposTomados || 16)).toLocaleString('es-CO'),
          torneoNombre: torneo.nombre,
        },
        torneo.id,
      )

      await updateDoc(torneoRef, { notificacionCampeon: true })
      eventosDisparados.push('Coronación del Gran Campeón')
    }
  } catch (err) {
    console.warn('[AutoMail] Error durante el procesamiento automático de correos:', err)
  }

  return { eventosDisparados }
}

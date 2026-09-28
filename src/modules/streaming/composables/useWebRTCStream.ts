import { ref, shallowRef, computed } from 'vue'
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/services/firebase'

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302',
        'stun:stun.cloudflare.com:3478',
        'stun:global.stun.twilio.com:3478',
      ],
    },
  ],
  iceCandidatePoolSize: 10,
}

// IP local descubierta en la red privada para acelerar emparejamiento directo en LAN
let ipLocalDetectada = ''

/**
 * Expande candidatos ICE para resolver la anonimización mDNS de Chromium (.local)
 * y asegurar conectividad inmediata en localhost (127.0.0.1) y en la red local (LAN)
 */
function expandirCandidatosIce(cand: RTCIceCandidateInit | RTCIceCandidate): RTCIceCandidateInit[] {
  if (!cand || !cand.candidate) return cand ? [cand as RTCIceCandidateInit] : []
  const resultado: RTCIceCandidateInit[] = [cand as RTCIceCandidateInit]
  const str = cand.candidate
  const partes = str.trim().split(/\s+/)
  if (partes.length < 8) return resultado

  const hostOIp = partes[4] || ''
  const puerto = partes[5] || ''
  if (!hostOIp || !puerto) return resultado

  const esHost = partes[7] === 'host'
  const esLocal = hostOIp.endsWith('.local')

  // Extraer IP privada real si el candidato es srflx (STUN descubre raddr)
  const raddrIdx = partes.indexOf('raddr')
  const rportIdx = partes.indexOf('rport')
  const ipPrivada = raddrIdx !== -1 && partes[raddrIdx + 1] ? (partes[raddrIdx + 1] as string) : ''
  const puertoPrivado = rportIdx !== -1 && partes[rportIdx + 1] ? (partes[rportIdx + 1] as string) : puerto

  if (ipPrivada) {
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ipPrivada)) {
      ipLocalDetectada = ipPrivada
    }

    // Crear un candidato 'typ host' con la IP privada y puerto del socket local
    const hostCandStr = str
      .replace(new RegExp(`\\b${hostOIp.replace(/\./g, '\\.')}\\b`), ipPrivada)
      .replace(new RegExp(`\\b${puerto}\\b`), puertoPrivado)
      .replace(/typ srflx/, 'typ host')

    resultado.push({
      candidate: hostCandStr,
      sdpMid: cand.sdpMid,
      sdpMLineIndex: cand.sdpMLineIndex,
      usernameFragment: cand.usernameFragment,
    })
  }

  // Lista de direcciones locales directas para evitar fallos de mDNS entre navegadores
  const ipsDirectas: string[] = ['127.0.0.1']
  if (ipLocalDetectada && !ipsDirectas.includes(ipLocalDetectada)) {
    ipsDirectas.push(ipLocalDetectada)
  }
  if (typeof window !== 'undefined' && window.location?.hostname) {
    const h = window.location.hostname
    if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(h) && !ipsDirectas.includes(h)) {
      ipsDirectas.push(h)
    }
  }

  // Si el candidato es host o mDNS (.local), generar variantes con 127.0.0.1 e IPs locales
  if (esHost || esLocal) {
    for (const ip of ipsDirectas) {
      if (ip === hostOIp) continue
      const nuevaLinea = str.replace(new RegExp(`\\b${hostOIp.replace(/\./g, '\\.')}\\b`), ip)
      resultado.push({
        candidate: nuevaLinea,
        sdpMid: cand.sdpMid,
        sdpMLineIndex: cand.sdpMLineIndex,
        usernameFragment: cand.usernameFragment,
      })
    }
  }

  return resultado
}

/**
 * Espera a que el navegador recolecte los candidatos ICE para incrustarlos
 * directamente en el SDP (Vanilla ICE), eliminando condiciones de carrera.
 */
function esperarRecoleccionIce(pc: RTCPeerConnection, maxMs = 500): Promise<void> {
  return new Promise((resolve) => {
    if (pc.iceGatheringState === 'complete') {
      resolve()
      return
    }
    const timer = setTimeout(() => {
      resolve()
    }, maxMs)

    const check = () => {
      if (pc.iceGatheringState === 'complete') {
        clearTimeout(timer)
        pc.removeEventListener('icegatheringstatechange', check)
        resolve()
      }
    }
    pc.addEventListener('icegatheringstatechange', check)
  })
}

export interface DiagnosticoStream {
  calidad: 'excelente' | 'buena' | 'regular' | 'mala'
  latenciaMs: number
  bitrateKbps: number
  fps: number
  resolucion: string
  paquetesPerdidos: number
  espectadoresActivos: number
  modoLatencia: 'ultra_baja' | 'estandar'
}

export function useWebRTCStream() {
  // Estado local del emisor / cámara
  const streamLocal = shallowRef<MediaStream | null>(null)
  const streamRemoto = shallowRef<MediaStream | null>(null)
  const transmitiendo = ref(false)
  const conectadoComoEspectador = ref(false)
  const cargandoConexion = ref(false)
  const errorStreaming = ref<string | null>(null)

  // Dispositivos y controles de medios
  const camaraTrasera = ref(true)
  const audioActivo = ref(true)
  const videoActivo = ref(true)
  const totalEspectadores = ref(0)

  // Diagnóstico de red y latencia en el móvil emisor
  const modoCalidadActual = ref<'ultra_baja' | 'estandar'>('ultra_baja')
  const diagnosticoEmisor = ref<DiagnosticoStream>({
    calidad: 'excelente',
    latenciaMs: 0,
    bitrateKbps: 0,
    fps: 30,
    resolucion: '1280x720',
    paquetesPerdidos: 0,
    espectadoresActivos: 0,
    modoLatencia: 'ultra_baja',
  })
  let diagnosticoTimer: any = null
  let ultimosBytesEnviados = 0
  let ultimoTimestampStats = 0
  let ultimosFramesEncoded = 0

  // Variables internas de WebRTC
  let unsubPeers: Unsubscribe | null = null
  let unsubPeerDoc: Unsubscribe | null = null
  let unsubPartidoDoc: Unsubscribe | null = null
  let pcViewer: RTCPeerConnection | null = null
  const peerConnections = new Map<string, RTCPeerConnection>()
  let currentPartidoId = ''
  let currentViewerId = ''
  let heartbeatTimer: any = null
  let viewerConnectionWatchdog: any = null

  // Duración máxima de la llamada / transmisión en vivo: 1 HORA (3600 segundos)
  const LIMITE_LLAMADA_SEGUNDOS = 3600
  const segundosTranscurridos = ref(0)
  let timerDuracion: any = null
  let onVisibilityChangeHandler: (() => void) | null = null

  const tiempoTranscurridoFormateado = computed(() => {
    const mins = Math.floor(segundosTranscurridos.value / 60)
    const secs = segundosTranscurridos.value % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  })

  const tiempoRestanteFormateado = computed(() => {
    const restantes = Math.max(0, LIMITE_LLAMADA_SEGUNDOS - segundosTranscurridos.value)
    const mins = Math.floor(restantes / 60)
    const secs = restantes % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  })

  // Buffers y registros de candidatos ICE para evitar pérdidas en carreras asíncronas
  const broadcasterCandidatosProcesados = new Map<string, Set<string>>()
  const broadcasterCandidatosEnEspera = new Map<string, RTCIceCandidateInit[]>()

  // ==========================================
  // 1. FLUJO DEL EMISOR (ADMIN / ÁRBITRO)
  // ==========================================

  /**
   * Inicia la captura de cámara/micrófono y señalización en Firestore
   */
  const iniciarTransmision = async (
    partidoId: string,
    adminUser: { id: string; nombre: string },
    preferenciaCamara?: 'environment' | 'user',
    partidoInfo?: any,
  ): Promise<boolean> => {
    try {
      errorStreaming.value = null
      cargandoConexion.value = true
      currentPartidoId = partidoId

      // Detectar automáticamente si es celular o PC/laptop
      const esMovil = typeof navigator !== 'undefined' && /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
      const modoCamara = preferenciaCamara || (esMovil ? 'environment' : 'user')

      // 1. Capturar cámara y micrófono optimizado para latencia ultra-baja en Ping-Pong (720p / 30fps sin sobrecargar subida)
      let media: MediaStream
      try {
        media = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: modoCamara,
            width: { ideal: 1280, min: 640 },
            height: { ideal: 720, min: 360 },
            aspectRatio: { ideal: 1.7777777778 }, // Prioridad 16:9 panorámica horizontal para mesa de ping-pong
            frameRate: { ideal: 30, max: 30 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            autoGainControl: true,
          },
        })
      } catch (errCam) {
        console.warn('Cámara/micrófono con filtros falló, intentando audio básico:', errCam)
        try {
          media = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: true,
          })
        } catch (errFallback) {
          console.warn('Fallback conjunto falló, intentando captura separada:', errFallback)
          const videoStream = await navigator.mediaDevices.getUserMedia({ video: true })
          try {
            const audioStream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const micTrack = audioStream.getAudioTracks()[0]
            if (micTrack) {
              videoStream.addTrack(micTrack)
            }
          } catch (eMic) {
            console.warn('Micrófono no concedido:', eMic)
          }
          media = videoStream
        }
      }

      // Asegurar explícitamente que los tracks de audio y video estén activos
      const videoTracks = media.getVideoTracks()
      if (videoTracks.length > 0) {
        videoTracks.forEach((t) => {
          t.enabled = true
        })
        videoActivo.value = true
      }

      const audioTracks = media.getAudioTracks()
      if (audioTracks.length > 0) {
        audioTracks.forEach((t) => {
          t.enabled = true
        })
        audioActivo.value = true
      } else {
        console.warn('No se detectó pista de micrófono en el dispositivo')
        audioActivo.value = false
      }

      streamLocal.value = media
      camaraTrasera.value = preferenciaCamara === 'environment'
      videoActivo.value = true

      // 2. Registrar en Firestore que el partido está transmitiéndose en vivo y en curso con setDoc (soporta creación si no existía)
      const partidoRef = doc(db, 'partidos', partidoId)
      const partidoSnap = await getDoc(partidoRef).catch(() => null)
      const dataActual = partidoSnap && partidoSnap.exists() ? partidoSnap.data() : {}
      const ahora = Date.now()

      const datosActualizar: any = {
        estado: 'en_curso',
        enVivo: true,
        transmisionActiva: true,
        transmisorId: adminUser.id,
        transmisorNombre: adminUser.nombre,
        fechaInicioTransmision: ahora,
        ultimaSenalEnVivo: ahora,
        totalEspectadores: 0,
        mesa: dataActual.mesa || partidoInfo?.mesa || 'Mesa 1',
        torneoId: dataActual.torneoId || partidoInfo?.torneoId || '',
        marcadorEnVivo: dataActual.marcadorEnVivo || {
          puntosJ1: 0,
          puntosJ2: 0,
          setActual: 'Set 1',
          numeroSet: 1,
          setsGanadosJ1: 0,
          setsGanadosJ2: 0,
          mesa: dataActual.mesa || partidoInfo?.mesa || 'Mesa 1',
          actualizadoEn: ahora,
        },
      }

      if (partidoInfo) {
        if (partidoInfo.jugador1) datosActualizar.jugador1 = partidoInfo.jugador1
        if (partidoInfo.jugador2) datosActualizar.jugador2 = partidoInfo.jugador2
        if (partidoInfo.jugador1Id) datosActualizar.jugador1Id = partidoInfo.jugador1Id
        if (partidoInfo.jugador2Id) datosActualizar.jugador2Id = partidoInfo.jugador2Id
        if (partidoInfo.torneoId) datosActualizar.torneoId = partidoInfo.torneoId
        if (partidoInfo.ronda) datosActualizar.ronda = partidoInfo.ronda
        if (partidoInfo.jornada) datosActualizar.jornada = partidoInfo.jornada
        if (partidoInfo.numeroPartido) datosActualizar.numeroPartido = partidoInfo.numeroPartido
      }

      await setDoc(partidoRef, datosActualizar, { merge: true })

      transmitiendo.value = true
      cargandoConexion.value = false

      // 3. Temporizador de llamada de 1 hora exacta (60 minutos)
      segundosTranscurridos.value = 0
      if (timerDuracion) clearInterval(timerDuracion)
      timerDuracion = setInterval(() => {
        segundosTranscurridos.value++
        if (segundosTranscurridos.value >= LIMITE_LLAMADA_SEGUNDOS) {
          console.warn('Tiempo límite de llamada alcanzado (1 hora). Finalizando transmisión.')
          detenerTransmision()
        }
      }, 1000)

      // 4. Heartbeat periódico para resiliencia sin agotar cuotas de Firestore
      if (heartbeatTimer) clearInterval(heartbeatTimer)
      heartbeatTimer = setInterval(async () => {
        if (currentPartidoId && transmitiendo.value) {
          try {
            await setDoc(
              doc(db, 'partidos', currentPartidoId),
              {
                ultimaSenalEnVivo: Date.now(),
                transmisionActiva: true,
                enVivo: true,
              },
              { merge: true },
            )
          } catch (err: any) {
            if (err?.code === 'resource-exhausted' || err?.message?.includes('Quota exceeded')) {
              if (heartbeatTimer) {
                clearInterval(heartbeatTimer)
                heartbeatTimer = null
              }
            }
          }
        }
      }, 15000)

      // Emitir latido inmediato al volver a la pestaña/celular
      if (typeof document !== 'undefined') {
        onVisibilityChangeHandler = () => {
          if (document.visibilityState === 'visible' && currentPartidoId && transmitiendo.value) {
            setDoc(
              doc(db, 'partidos', currentPartidoId),
              {
                ultimaSenalEnVivo: Date.now(),
                transmisionActiva: true,
              },
              { merge: true },
            ).catch(() => {})
          }
        }
        document.addEventListener('visibilitychange', onVisibilityChangeHandler)
      }

      // 5. Escuchar nuevos espectadores en la subcolección `stream_peers`
      escucharEspectadoresEntrantes(partidoId)
      iniciarMonitoreoDiagnostico()

      return true
    } catch (error: any) {
      console.error('Error al iniciar transmisión WebRTC:', error)
      errorStreaming.value = error.message || 'No se pudo acceder a la cámara o micrófono.'
      cargandoConexion.value = false
      detenerTransmision()
      return false
    }
  }

  /**
   * Monitoreo en tiempo real del estado de red, fps, bitrate y latencia en el móvil
   */
  const iniciarMonitoreoDiagnostico = () => {
    if (diagnosticoTimer) clearInterval(diagnosticoTimer)
    ultimosBytesEnviados = 0
    ultimoTimestampStats = Date.now()
    ultimosFramesEncoded = 0

    diagnosticoTimer = setInterval(async () => {
      if (!transmitiendo.value) return

      let totalBytes = 0
      let totalFrames = 0
      let maxRtt = 0
      let totalLost = 0
      let resolucionDetectada = ''

      // Si aún no hay espectadores conectados, mostrar diagnóstico del sensor local
      if (peerConnections.size === 0) {
        const vTrack = streamLocal.value?.getVideoTracks()[0]
        const settings = vTrack?.getSettings()
        diagnosticoEmisor.value = {
          calidad: 'excelente',
          latenciaMs: 15,
          bitrateKbps: 0,
          fps: settings?.frameRate ? Math.round(settings.frameRate) : 30,
          resolucion: settings?.width && settings?.height ? `${settings.width}x${settings.height}` : '1280x720',
          paquetesPerdidos: 0,
          espectadoresActivos: 0,
          modoLatencia: modoCalidadActual.value,
        }
        return
      }

      for (const [, pc] of peerConnections) {
        if (pc.connectionState !== 'connected') continue
        try {
          const stats = await pc.getStats()
          stats.forEach((report) => {
            if (report.type === 'outbound-rtp' && report.kind === 'video') {
              totalBytes += report.bytesSent || 0
              totalFrames += report.framesEncoded || 0
              if (report.frameWidth && report.frameHeight) {
                resolucionDetectada = `${report.frameWidth}x${report.frameHeight}`
              }
            } else if (report.type === 'candidate-pair' && report.state === 'succeeded') {
              const rtt = (report.currentRoundTripTime || 0) * 1000
              if (rtt > maxRtt) maxRtt = Math.round(rtt)
            } else if (report.type === 'remote-inbound-rtp' && report.kind === 'video') {
              totalLost += report.packetsLost || 0
              if (report.roundTripTime) {
                const rtt = report.roundTripTime * 1000
                if (rtt > maxRtt) maxRtt = Math.round(rtt)
              }
            }
          })
        } catch {}
      }

      const ahora = Date.now()
      const deltaTiempoSeg = (ahora - ultimoTimestampStats) / 1000
      ultimoTimestampStats = ahora

      let bitrate = 0
      let fpsReal = 0
      if (deltaTiempoSeg > 0 && ultimosBytesEnviados > 0 && totalBytes >= ultimosBytesEnviados) {
        bitrate = Math.round(((totalBytes - ultimosBytesEnviados) * 8) / (deltaTiempoSeg * 1000))
      }
      if (deltaTiempoSeg > 0 && ultimosFramesEncoded > 0 && totalFrames >= ultimosFramesEncoded) {
        fpsReal = Math.round((totalFrames - ultimosFramesEncoded) / deltaTiempoSeg)
      }

      ultimosBytesEnviados = totalBytes
      ultimosFramesEncoded = totalFrames

      // Calificar salud de red en tiempo real
      let calidad: 'excelente' | 'buena' | 'regular' | 'mala' = 'excelente'
      if (maxRtt > 300 || totalLost > 25) {
        calidad = 'mala'
      } else if (maxRtt > 180 || totalLost > 6) {
        calidad = 'regular'
      } else if (maxRtt > 85) {
        calidad = 'buena'
      } else {
        calidad = 'excelente'
      }

      diagnosticoEmisor.value = {
        calidad,
        latenciaMs: maxRtt || 25,
        bitrateKbps: bitrate || (peerConnections.size > 0 ? 950 : 0),
        fps: fpsReal || 30,
        resolucion: resolucionDetectada || '1280x720',
        paquetesPerdidos: totalLost,
        espectadoresActivos: peerConnections.size,
        modoLatencia: modoCalidadActual.value,
      }
    }, 2000)
  }

  /**
   * Maneja conexiones entrantes de cada espectador que se une
   */
  const escucharEspectadoresEntrantes = (partidoId: string) => {
    const peersColl = collection(db, 'partidos', partidoId, 'stream_peers')

    const procesandoAnswer = new Set<string>()

    unsubPeers = onSnapshot(peersColl, (snapshot) => {
      totalEspectadores.value = snapshot.docs.length

      if (partidoId) {
        setDoc(
          doc(db, 'partidos', partidoId),
          { totalEspectadores: snapshot.docs.length },
          { merge: true },
        ).catch(() => {})
      }

      snapshot.docChanges().forEach(async (change) => {
        const viewerId = change.doc.id
        const peerData = change.doc.data()

        if ((change.type === 'added' || change.type === 'modified') && peerData.estado === 'solicitando') {
          // Si ya existía una conexión previa con este espectador, cerrarla primero
          if (peerConnections.has(viewerId)) {
            cerrarPeer(viewerId)
          }
          await conectarEspectadorDesdeEmisor(partidoId, viewerId, change.doc.ref)
        } else if (change.type === 'modified') {
          const pc = peerConnections.get(viewerId)
          if (!pc) return

          // 1. Establecer SDP Answer si el espectador respondió (evitar colisión si ya se está resolviendo)
          if (peerData.answer && pc.signalingState === 'have-local-offer' && !procesandoAnswer.has(viewerId)) {
            procesandoAnswer.add(viewerId)
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(peerData.answer))

              // Configurar parámetros de codificación de bitrate tras acordar la sesión
              const videoSender = pc.getSenders().find((s) => s.track?.kind === 'video')
              if (videoSender) {
                try {
                  const params = videoSender.getParameters()
                  if (params && params.encodings && params.encodings[0]) {
                    params.encodings[0].maxBitrate = modoCalidadActual.value === 'ultra_baja' ? 850_000 : 1_300_000
                    params.encodings[0].maxFramerate = 30
                    videoSender.setParameters(params).catch(() => {})
                  }
                } catch {}
              }

              // Procesar candidatos acumulados en espera antes de tener la descripción remota
              const enEspera = broadcasterCandidatosEnEspera.get(viewerId)
              if (enEspera && enEspera.length > 0) {
                const copia = [...enEspera]
                broadcasterCandidatosEnEspera.delete(viewerId)
                await procesarCandidatosEspectador(viewerId, copia)
              }
            } catch (err) {
              console.warn(`Error al establecer Remote Description para ${viewerId}:`, err)
            } finally {
              procesandoAnswer.delete(viewerId)
            }
          }

          // 2. Procesar candidatos ICE enviados por el espectador
          if (Array.isArray(peerData.viewerCandidates) && peerData.viewerCandidates.length > 0) {
            await procesarCandidatosEspectador(viewerId, peerData.viewerCandidates)
          }
        } else if (change.type === 'removed') {
          cerrarPeer(viewerId)
        }
      })
    })
  }

  /**
   * Procesa y agrega candidatos ICE de un espectador de forma segura
   */
  const procesarCandidatosEspectador = async (viewerId: string, candidates: RTCIceCandidateInit[]) => {
    const pc = peerConnections.get(viewerId)
    if (!pc) return

    // Si aún no se ha fijado la descripción remota, acumular en espera
    if (!pc.remoteDescription) {
      const enEspera = broadcasterCandidatosEnEspera.get(viewerId) || []
      for (const cand of candidates) {
        enEspera.push(cand)
      }
      broadcasterCandidatosEnEspera.set(viewerId, enEspera)
      return
    }

    let procesados = broadcasterCandidatosProcesados.get(viewerId)
    if (!procesados) {
      procesados = new Set<string>()
      broadcasterCandidatosProcesados.set(viewerId, procesados)
    }

    for (const rawCand of candidates) {
      if (!rawCand || !rawCand.candidate) continue
      const variantes = expandirCandidatosIce(rawCand)
      for (const cand of variantes) {
        if (!cand || !cand.candidate) continue
        const key = `${cand.candidate}_${cand.sdpMid}_${cand.sdpMLineIndex}`
        if (!procesados.has(key)) {
          procesados.add(key)
          try {
            await pc.addIceCandidate(new RTCIceCandidate(cand))
            console.log(`[WebRTC Broadcaster] ICE Candidate agregado para ${viewerId}:`, cand.candidate.slice(0, 60))
          } catch (e) {
            // Candidato redundante
          }
        }
      }
    }
  }

  /**
   * Crea la oferta SDP y PeerConnection para un espectador específico con optimización de bitrate y baja latencia
   */
  const conectarEspectadorDesdeEmisor = async (partidoId: string, viewerId: string, peerDocRef: any) => {
    if (!streamLocal.value) return

    const pc = new RTCPeerConnection(RTC_CONFIG)
    peerConnections.set(viewerId, pc)
    broadcasterCandidatosProcesados.set(viewerId, new Set<string>())
    broadcasterCandidatosEnEspera.set(viewerId, [])

    const broadcasterCandidates: RTCIceCandidateInit[] = []
    let updateCandidatesTimeout: any = null
    let offerPublicada = false

    // Agregar tracks locales de forma determinística (primero video y luego audio) para consistencia SDP
    const videoTracks = streamLocal.value.getVideoTracks()
    const audioTracks = streamLocal.value.getAudioTracks()
    videoTracks.forEach((vt) => pc.addTrack(vt, streamLocal.value!))
    audioTracks.forEach((at) => pc.addTrack(at, streamLocal.value!))

    // Recolectar candidatos ICE del emisor y expandir variantes locales/LAN
    pc.onicecandidate = (event) => {
      if (event.candidate && event.candidate.candidate) {
        const expandidos = expandirCandidatosIce(event.candidate.toJSON())
        expandidos.forEach((c) => broadcasterCandidates.push(c))
        if (offerPublicada) {
          if (updateCandidatesTimeout) clearTimeout(updateCandidatesTimeout)
          updateCandidatesTimeout = setTimeout(() => {
            setDoc(peerDocRef, { broadcasterCandidates }, { merge: true }).catch(() => {})
          }, 80)
        }
      }
    }

    pc.oniceconnectionstatechange = () => {
      console.log(`[WebRTC Broadcaster] ICE connection state con ${viewerId}:`, pc.iceConnectionState)
      if (pc.iceConnectionState === 'failed') {
        console.warn(`[WebRTC Broadcaster] ICE reportó failed con ${viewerId}, esperando posible reconexión...`)
      }
    }

    // Crear oferta SDP con candidatos ICE incrustados (Vanilla ICE híbrido)
    try {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)
      // Esperar brevemente recolección ICE para que los candidatos estén ya en el SDP
      await esperarRecoleccionIce(pc, 500)

      console.log(`[WebRTC Broadcaster] Oferta SDP generada para ${viewerId}, con candidatos incrustados:`, pc.localDescription?.sdp.includes('a=candidate'))

      await setDoc(
        peerDocRef,
        {
          offer: {
            type: offer.type,
            sdp: pc.localDescription?.sdp || offer.sdp,
          },
          estado: 'ofertado',
          broadcasterCandidates,
        },
        { merge: true },
      )
      offerPublicada = true
    } catch (err) {
      console.error(`Error al crear oferta SDP para ${viewerId}:`, err)
      cerrarPeer(viewerId)
    }
  }

  const cerrarPeer = (viewerId: string) => {
    const pc = peerConnections.get(viewerId)
    if (pc) {
      try {
        pc.close()
      } catch {}
      peerConnections.delete(viewerId)
    }
    broadcasterCandidatosProcesados.delete(viewerId)
    broadcasterCandidatosEnEspera.delete(viewerId)
  }

  /**
   * Finaliza la transmisión en vivo, apaga cámara y limpia Firestore
   */
  const detenerTransmision = async () => {
    transmitiendo.value = false

    if (diagnosticoTimer) {
      clearInterval(diagnosticoTimer)
      diagnosticoTimer = null
    }

    if (timerDuracion) {
      clearInterval(timerDuracion)
      timerDuracion = null
    }

    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
    }

    if (onVisibilityChangeHandler && typeof document !== 'undefined') {
      document.removeEventListener('visibilitychange', onVisibilityChangeHandler)
      onVisibilityChangeHandler = null
    }

    // 1. Detener pistas de hardware
    if (streamLocal.value) {
      streamLocal.value.getTracks().forEach((t) => {
        try {
          t.stop()
        } catch {}
      })
      streamLocal.value = null
    }

    // 2. Cerrar todas las conexiones peer activas
    peerConnections.forEach((pc) => {
      try {
        pc.close()
      } catch {}
    })
    peerConnections.clear()
    broadcasterCandidatosProcesados.clear()
    broadcasterCandidatosEnEspera.clear()

    if (unsubPeers) {
      unsubPeers()
      unsubPeers = null
    }


    // 3. Notificar a Firestore que concluyó la transmisión
    const partidoIdToClean = currentPartidoId
    currentPartidoId = ''

    if (partidoIdToClean) {
      try {
        const partidoRef = doc(db, 'partidos', partidoIdToClean)
        const snap = await getDoc(partidoRef)
        const d = snap.exists() ? snap.data() : null

        const payloadUpdate: any = {
          transmisionActiva: false,
          enVivo: false,
          totalEspectadores: 0,
          fechaFinTransmision: Date.now(),
          ultimaSenalEnVivo: 0,
          transmisorId: null,
          transmisorNombre: null,
        }

        // Si el partido está marcado como 'en_curso' pero no se han disputado sets ni puntos,
        // revertirlo a 'pendiente' para que no quede como partido zombi
        if (d && d.estado === 'en_curso' && (!d.sets || d.sets.length === 0)) {
          const m = d.marcadorEnVivo
          const sinPuntos =
            !m ||
            (Number(m.puntosJ1 || 0) === 0 &&
              Number(m.puntosJ2 || 0) === 0 &&
              Number(m.setsGanadosJ1 || 0) === 0 &&
              Number(m.setsGanadosJ2 || 0) === 0)
          if (sinPuntos && !d.marcador) {
            payloadUpdate.estado = 'pendiente'
            payloadUpdate.marcadorEnVivo = null
          }
        }

        await setDoc(partidoRef, payloadUpdate, { merge: true })

        // Eliminar subcolección temporal de stream_peers
        const peersColl = collection(db, 'partidos', partidoIdToClean, 'stream_peers')
        const snapPeers = await getDocs(peersColl)
        const batchDeletes = snapPeers.docs.map((dDoc) => deleteDoc(dDoc.ref))
        await Promise.all(batchDeletes)
      } catch (err) {
        console.warn('Error al limpiar datos de stream en Firestore:', err)
      }
    }
  }

  /**
   * Alternar entre cámara trasera y delantera en celulares
   */
  const alternarCamara = async () => {
    if (!transmitiendo.value) return
    const nuevaPreferencia = camaraTrasera.value ? 'user' : 'environment'

    try {
      // Capturar solo la nueva cámara de video para NO interrumpir el micrófono existente
      const nuevoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: nuevaPreferencia },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })

      const nuevoVideoTrack = nuevoStream.getVideoTracks()[0]
      if (nuevoVideoTrack && streamLocal.value) {
        // Reemplazar track en stream local
        const oldVideoTrack = streamLocal.value.getVideoTracks()[0]
        if (oldVideoTrack) {
          oldVideoTrack.stop()
          streamLocal.value.removeTrack(oldVideoTrack)
        }
        streamLocal.value.addTrack(nuevoVideoTrack)

        // Reemplazar track en cada conexión de espectador activa
        peerConnections.forEach((pc) => {
          const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video')
          if (sender) {
            sender.replaceTrack(nuevoVideoTrack)
          }
        })
      }

      camaraTrasera.value = !camaraTrasera.value
    } catch (err) {
      console.warn('No fue posible alternar de cámara:', err)
    }
  }

  /**
   * Silenciar o activar micrófono del emisor
   */
  const alternarAudio = () => {
    if (streamLocal.value) {
      const audioTrack = streamLocal.value.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        audioActivo.value = audioTrack.enabled
      }
    }
  }

  /**
   * Encender o pausar video del emisor
   */
  const alternarVideo = () => {
    if (streamLocal.value) {
      const videoTrack = streamLocal.value.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        videoActivo.value = videoTrack.enabled
      }
    }
  }

  /**
   * Cambiar dinámicamente entre modo Ultra Rápido (480p/720p fluido ~850kbps) y Modo HD (~1.3Mbps)
   */
  const cambiarModoCalidad = async (modo: 'ultra_baja' | 'estandar') => {
    modoCalidadActual.value = modo
    diagnosticoEmisor.value.modoLatencia = modo
    const targetBitrate = modo === 'ultra_baja' ? 850_000 : 1_300_000
    const targetConstraints =
      modo === 'ultra_baja'
        ? { width: { ideal: 854, max: 1280 }, height: { ideal: 480, max: 720 }, frameRate: { ideal: 30 } }
        : { width: { ideal: 1280, max: 1280 }, height: { ideal: 720, max: 720 }, frameRate: { ideal: 30 } }

    if (streamLocal.value) {
      const vTrack = streamLocal.value.getVideoTracks()[0]
      if (vTrack && vTrack.applyConstraints) {
        try {
          await vTrack.applyConstraints(targetConstraints)
        } catch {}
      }
    }

    // Actualizar codificación en tiempo real para todos los espectadores conectados
    peerConnections.forEach((pc) => {
      const sender = pc.getSenders().find((s) => s.track && s.track.kind === 'video')
      if (sender) {
        try {
          const params = sender.getParameters()
          if (params.encodings && params.encodings[0]) {
            params.encodings[0].maxBitrate = targetBitrate
            params.encodings[0].maxFramerate = 30
            sender.setParameters(params).catch(() => {})
          }
        } catch {}
      }
    })
  }

  // ==========================================
  // 2. FLUJO DEL ESPECTADOR (RECEPTOR)
  // ==========================================

  /**
   * Se conecta como espectador para ver el stream en vivo de un partido
   */
  const conectarComoEspectador = async (
    partidoId: string,
    viewerUser: { id: string; nombre: string },
  ): Promise<boolean> => {
    try {
      // Si el espectador ya estaba conectado a otra mesa/partido, cerrar la anterior limpiamente
      if (pcViewer || conectadoComoEspectador.value || unsubPeers || unsubPartidoDoc) {
        await desconectarEspectador()
      }

      errorStreaming.value = null
      cargandoConexion.value = true
      currentPartidoId = partidoId
      currentViewerId = viewerUser.id

      // 1. Crear RTCPeerConnection para recibir el video y audio
      pcViewer = new RTCPeerConnection(RTC_CONFIG)

      // El stream remoto debe iniciar como null hasta que ontrack reciba las pistas reales
      streamRemoto.value = null
      let remoteStreamInstance: MediaStream | null = null

      const viewerCandidates: RTCIceCandidateInit[] = []
      let updateViewerCandidatesTimeout: any = null
      const candidatosEmisorProcesados = new Set<string>()
      let candidatosEmisorEnEspera: RTCIceCandidateInit[] = []

      // Escuchar el track de video/audio que llega del emisor
      pcViewer.ontrack = (event) => {
        console.log('[WebRTC Viewer] Track entrante recibido:', event.track.kind, event.track.id, 'muted:', event.track.muted)
        
        const stream = event.streams?.[0] || remoteStreamInstance || new MediaStream()
        remoteStreamInstance = stream

        if (!stream.getTracks().some((t) => t.id === event.track.id)) {
          stream.addTrack(event.track)
        }
        event.track.enabled = true

        streamRemoto.value = stream
        cargandoConexion.value = false
        conectadoComoEspectador.value = true

        event.track.onunmute = () => {
          console.log('[WebRTC Viewer] Track desenmudecido (paquetes RTP recibidos):', event.track.kind)
          event.track.enabled = true
          if (remoteStreamInstance) {
            streamRemoto.value = remoteStreamInstance
          }
        }
      }

      pcViewer.onconnectionstatechange = () => {
        console.log('[WebRTC Viewer] ConnectionState:', pcViewer?.connectionState)
        if (pcViewer?.connectionState === 'connected') {
          cargandoConexion.value = false
          conectadoComoEspectador.value = true
          errorStreaming.value = null
        } else if (pcViewer?.connectionState === 'failed') {
          errorStreaming.value = 'Conexión interrumpida con la cámara de la mesa. Reintentando...'
        }
      }

      pcViewer.oniceconnectionstatechange = () => {
        console.log('[WebRTC Viewer] IceConnectionState:', pcViewer?.iceConnectionState)
        if (pcViewer && (pcViewer.iceConnectionState === 'connected' || pcViewer.iceConnectionState === 'completed')) {
          cargandoConexion.value = false
          conectadoComoEspectador.value = true
          errorStreaming.value = null
        } else if (pcViewer && pcViewer.iceConnectionState === 'failed') {
          console.warn('[WebRTC Viewer] ICE failed, intentando restartIce...')
          try {
            if (pcViewer.restartIce) {
              pcViewer.restartIce()
            }
          } catch {}
          errorStreaming.value = 'Conexión interrumpida con la cámara de la mesa. Reintentando...'
        }
      }

      // Temporizador de guardia: si después de 14s no conecta, intentar reiniciar ICE o notificar
      if (viewerConnectionWatchdog) clearTimeout(viewerConnectionWatchdog)
      viewerConnectionWatchdog = setTimeout(() => {
        if (cargandoConexion.value && !streamRemoto.value && pcViewer) {
          console.warn('[WebRTC Viewer] Conexión demorada, intentando optimizar ruta ICE...')
          try {
            if (pcViewer.restartIce) pcViewer.restartIce()
          } catch {}
        }
      }, 14000)

      let ofertaRespondida = false
      let answerPublicada = false

      // Enviar candidatos ICE del espectador expandiendo variantes directas de localhost/LAN
      pcViewer.onicecandidate = (event) => {
        if (event.candidate && event.candidate.candidate && currentPartidoId && currentViewerId) {
          const expandidos = expandirCandidatosIce(event.candidate.toJSON())
          expandidos.forEach((c) => viewerCandidates.push(c))
          if (answerPublicada) {
            if (updateViewerCandidatesTimeout) clearTimeout(updateViewerCandidatesTimeout)
            updateViewerCandidatesTimeout = setTimeout(() => {
              const pRef = doc(db, 'partidos', currentPartidoId, 'stream_peers', currentViewerId)
              setDoc(pRef, { viewerCandidates }, { merge: true }).catch(() => {})
            }, 80)
          }
        }
      }

      // Procesar candidatos del emisor con control de buffer y expansión de IPs locales
      const procesarCandidatosEmisor = async (candidates: RTCIceCandidateInit[]) => {
        if (!pcViewer || !pcViewer.remoteDescription) {
          candidatosEmisorEnEspera.push(...candidates)
          return
        }

        for (const rawCand of candidates) {
          if (!rawCand || !rawCand.candidate) continue
          const variantes = expandirCandidatosIce(rawCand)
          for (const cand of variantes) {
            if (!cand || !cand.candidate) continue
            const key = `${cand.candidate}_${cand.sdpMid}_${cand.sdpMLineIndex}`
            if (!candidatosEmisorProcesados.has(key)) {
              candidatosEmisorProcesados.add(key)
              try {
                await pcViewer.addIceCandidate(new RTCIceCandidate(cand))
                console.log('[WebRTC Viewer] ICE Candidate del emisor agregado:', cand.candidate.slice(0, 60))
              } catch (e) {}
            }
          }
        }
      }

      // 2. Crear documento de registro de este espectador en Firestore
      const peerRef = doc(db, 'partidos', currentPartidoId, 'stream_peers', currentViewerId)
      await setDoc(peerRef, {
        viewerId: currentViewerId,
        viewerNombre: viewerUser.nombre,
        estado: 'solicitando',
        creadoEn: Date.now(),
      })

      // 3. Escuchar la oferta SDP que enviará el emisor
      unsubPeerDoc = onSnapshot(peerRef, async (snap) => {
        if (!snap.exists()) {
          // El emisor cerró la sesión
          desconectarEspectador()
          return
        }

        const data = snap.data()

        // Si el emisor envió una oferta y aún no la hemos respondido
        if (data.offer && !ofertaRespondida && pcViewer) {
          ofertaRespondida = true
          try {
            console.log('[WebRTC Viewer] Recibida oferta SDP del emisor. Estableciendo descripción remota...')
            await pcViewer.setRemoteDescription(new RTCSessionDescription(data.offer))
            const answer = await pcViewer.createAnswer()
            await pcViewer.setLocalDescription(answer)
            // Esperar recolección ICE para que los candidatos estén ya incrustados en la respuesta SDP
            await esperarRecoleccionIce(pcViewer, 500)

            console.log('[WebRTC Viewer] Respuesta SDP generada, candidatos incrustados:', pcViewer.localDescription?.sdp.includes('a=candidate'))

            await setDoc(
              peerRef,
              {
                answer: {
                  type: answer.type,
                  sdp: pcViewer.localDescription?.sdp || answer.sdp,
                },
                estado: 'conectado',
                viewerCandidates,
              },
              { merge: true },
            )
            answerPublicada = true

            // Procesar candidatos acumulados en espera
            if (candidatosEmisorEnEspera.length > 0) {
              const copia = [...candidatosEmisorEnEspera]
              candidatosEmisorEnEspera = []
              await procesarCandidatosEmisor(copia)
            }
          } catch (err) {
            console.error('Error al responder oferta SDP como espectador:', err)
            ofertaRespondida = false
          }
        }

        // Agregar candidatos ICE del emisor
        if (Array.isArray(data.broadcasterCandidates) && data.broadcasterCandidates.length > 0) {
          await procesarCandidatosEmisor(data.broadcasterCandidates)
        }
      })

      // 4. Escuchar el documento del partido para saber si la transmisión concluyó
      const partidoRef = doc(db, 'partidos', currentPartidoId)
      unsubPartidoDoc = onSnapshot(partidoRef, (pSnap) => {
        if (pSnap.exists()) {
          const pData = pSnap.data()
          if (pData.transmisionActiva === false || pData.estado === 'jugado') {
            desconectarEspectador()
          }
        }
      })

      // 5. Escuchar la cantidad real de espectadores conectados a la mesa en vivo
      const peersColl = collection(db, 'partidos', currentPartidoId, 'stream_peers')
      unsubPeers = onSnapshot(peersColl, (snapshot) => {
        totalEspectadores.value = Math.max(1, snapshot.docs.length)
      })

      return true
    } catch (err: any) {
      console.error('Error al conectar como espectador:', err)
      errorStreaming.value = err.message || 'No fue posible sintonizar el partido en vivo.'
      cargandoConexion.value = false
      desconectarEspectador()
      return false
    }
  }

  /**
   * Cierra la conexión del espectador y limpia su sesión
   */
  const desconectarEspectador = async () => {
    conectadoComoEspectador.value = false
    cargandoConexion.value = false

    if (viewerConnectionWatchdog) {
      clearTimeout(viewerConnectionWatchdog)
      viewerConnectionWatchdog = null
    }

    if (streamRemoto.value) {
      streamRemoto.value.getTracks().forEach((t) => {
        try {
          t.stop()
        } catch {}
      })
      streamRemoto.value = null
    }

    if (pcViewer) {
      try {
        pcViewer.close()
      } catch {}
      pcViewer = null
    }

    if (unsubPeers) {
      unsubPeers()
      unsubPeers = null
    }
    if (unsubPeerDoc) {
      unsubPeerDoc()
      unsubPeerDoc = null
    }
    if (unsubPartidoDoc) {
      unsubPartidoDoc()
      unsubPartidoDoc = null
    }


    const vId = currentViewerId
    const pId = currentPartidoId
    currentViewerId = ''
    currentPartidoId = ''

    if (pId && vId) {
      try {
        const peerRef = doc(db, 'partidos', pId, 'stream_peers', vId)
        await deleteDoc(peerRef)
      } catch {}
    }
  }



  // Limpieza en eventos de cierre de navegador / pestaña
  if (typeof window !== 'undefined') {
    const limpiarAlSalir = () => {
      if (transmitiendo.value && currentPartidoId) {
        detenerTransmision()
      }
      if (conectadoComoEspectador.value) {
        desconectarEspectador()
      }
    }
    window.addEventListener('beforeunload', limpiarAlSalir)
    window.addEventListener('pagehide', limpiarAlSalir)
  }

  return {
    // Estado
    streamLocal,
    streamRemoto,
    transmitiendo,
    conectadoComoEspectador,
    cargandoConexion,
    errorStreaming,
    camaraTrasera,
    audioActivo,
    videoActivo,
    totalEspectadores,
    segundosTranscurridos,
    tiempoTranscurridoFormateado,
    tiempoRestanteFormateado,
    limiteLlamadaSegundos: LIMITE_LLAMADA_SEGUNDOS,
    diagnosticoEmisor,
    modoCalidadActual,

    // Acciones Emisor
    iniciarTransmision,
    detenerTransmision,
    alternarCamara,
    alternarAudio,
    alternarVideo,
    cambiarModoCalidad,

    // Acciones Espectador
    conectarComoEspectador,
    desconectarEspectador,
  }
}

import { ref, shallowRef } from 'vue'
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
import type { TipoReaccionLive, ReaccionLive } from '@/types'

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    {
      urls: [
        'stun:stun.l.google.com:19302',
        'stun:stun1.l.google.com:19302',
        'stun:stun2.l.google.com:19302',
        'stun:stun3.l.google.com:19302',
        'stun:stun4.l.google.com:19302',
        'stun:global.stun.twilio.com:3478',
      ],
    },
    {
      urls: [
        'stun:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:80',
        'turn:openrelay.metered.ca:443',
        'turn:openrelay.metered.ca:443?transport=tcp',
      ],
      username: 'openrelay',
      credential: 'openrelay',
    },
  ],
  iceCandidatePoolSize: 10,
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
  const reaccionesEnVivo = ref<ReaccionLive[]>([])

  // Variables internas de WebRTC
  let unsubPeers: Unsubscribe | null = null
  let unsubPeerDoc: Unsubscribe | null = null
  let unsubPartidoDoc: Unsubscribe | null = null
  let unsubReacciones: Unsubscribe | null = null
  let pcViewer: RTCPeerConnection | null = null
  const peerConnections = new Map<string, RTCPeerConnection>()
  let currentPartidoId = ''
  let currentViewerId = ''
  let heartbeatTimer: any = null

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
    preferenciaCamara: 'environment' | 'user' = 'environment',
  ): Promise<boolean> => {
    try {
      errorStreaming.value = null
      cargandoConexion.value = true
      currentPartidoId = partidoId

      // 1. Capturar cámara y micrófono
      let media: MediaStream
      try {
        media = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: preferenciaCamara },
            width: { ideal: 1280, max: 1920 },
            height: { ideal: 720, max: 1080 },
            frameRate: { ideal: 30 },
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
          },
        })
      } catch (errCam) {
        console.warn('Cámara preferida no disponible, usando cualquier cámara disponible:', errCam)
        media = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })
      }

      streamLocal.value = media
      camaraTrasera.value = preferenciaCamara === 'environment'
      audioActivo.value = true
      videoActivo.value = true

      // 2. Registrar en Firestore que el partido está transmitiéndose en vivo y en curso
      const partidoRef = doc(db, 'partidos', partidoId)
      const partidoSnap = await getDoc(partidoRef)
      const dataActual = partidoSnap.exists() ? partidoSnap.data() : {}
      const ahora = Date.now()

      await updateDoc(partidoRef, {
        estado: 'en_curso',
        enVivo: true,
        transmisionActiva: true,
        transmisorId: adminUser.id,
        transmisorNombre: adminUser.nombre,
        fechaInicioTransmision: ahora,
        ultimaSenalEnVivo: ahora,
        totalEspectadores: 0,
        mesa: dataActual.mesa || 'Mesa 1',
        marcadorEnVivo: dataActual.marcadorEnVivo || {
          puntosJ1: 0,
          puntosJ2: 0,
          setActual: 'Set 1',
          numeroSet: 1,
          setsGanadosJ1: 0,
          setsGanadosJ2: 0,
          mesa: dataActual.mesa || 'Mesa 1',
          actualizadoEn: ahora,
        },
      })

      transmitiendo.value = true
      cargandoConexion.value = false

      // 3. Heartbeat cada 10 segundos para indicar que la transmisión sigue viva
      if (heartbeatTimer) clearInterval(heartbeatTimer)
      heartbeatTimer = setInterval(async () => {
        if (currentPartidoId && transmitiendo.value) {
          try {
            await updateDoc(doc(db, 'partidos', currentPartidoId), {
              ultimaSenalEnVivo: Date.now(),
            })
          } catch {}
        }
      }, 10000)

      // 4. Escuchar nuevos espectadores en la subcolección `stream_peers`
      escucharEspectadoresEntrantes(partidoId)
      suscribirReacciones(partidoId)

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
   * Maneja conexiones entrantes de cada espectador que se une
   */
  const escucharEspectadoresEntrantes = (partidoId: string) => {
    const peersColl = collection(db, 'partidos', partidoId, 'stream_peers')

    unsubPeers = onSnapshot(peersColl, (snapshot) => {
      totalEspectadores.value = snapshot.docs.length

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

          // 1. Establecer SDP Answer si el espectador respondió
          if (peerData.answer && pc.signalingState === 'have-local-offer') {
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(peerData.answer))

              // Procesar candidatos acumulados en espera antes de tener la descripción remota
              const enEspera = broadcasterCandidatosEnEspera.get(viewerId)
              if (enEspera && enEspera.length > 0) {
                await procesarCandidatosEspectador(viewerId, enEspera)
                broadcasterCandidatosEnEspera.delete(viewerId)
              }
            } catch (err) {
              console.warn(`Error al establecer Remote Description para ${viewerId}:`, err)
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

    for (const cand of candidates) {
      const key = `${cand.candidate}_${cand.sdpMid}_${cand.sdpMLineIndex}`
      if (!procesados.has(key)) {
        procesados.add(key)
        try {
          await pc.addIceCandidate(new RTCIceCandidate(cand))
        } catch (e) {
          // Candidato redundante
        }
      }
    }
  }

  /**
   * Crea la oferta SDP y PeerConnection para un espectador específico
   */
  const conectarEspectadorDesdeEmisor = async (partidoId: string, viewerId: string, peerDocRef: any) => {
    if (!streamLocal.value) return

    const pc = new RTCPeerConnection(RTC_CONFIG)
    peerConnections.set(viewerId, pc)
    broadcasterCandidatosProcesados.set(viewerId, new Set<string>())
    broadcasterCandidatosEnEspera.set(viewerId, [])

    const broadcasterCandidates: RTCIceCandidateInit[] = []

    // Agregar tracks locales de cámara y micrófono
    streamLocal.value.getTracks().forEach((track) => {
      pc.addTrack(track, streamLocal.value!)
    })

    // Recolectar candidatos ICE del emisor y guardarlos
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        broadcasterCandidates.push(event.candidate.toJSON())
        updateDoc(peerDocRef, { broadcasterCandidates }).catch(() => {})
      }
    }

    pc.oniceconnectionstatechange = () => {
      if (pc.iceConnectionState === 'failed') {
        cerrarPeer(viewerId)
      }
    }

    // Crear oferta SDP
    try {
      const offer = await pc.createOffer()
      await pc.setLocalDescription(offer)

      await updateDoc(peerDocRef, {
        offer: {
          type: offer.type,
          sdp: offer.sdp,
        },
        estado: 'ofertado',
      })
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

    if (heartbeatTimer) {
      clearInterval(heartbeatTimer)
      heartbeatTimer = null
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
    if (unsubReacciones) {
      unsubReacciones()
      unsubReacciones = null
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

        await updateDoc(partidoRef, payloadUpdate)

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
      const nuevoStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: { ideal: nuevaPreferencia },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: audioActivo.value,
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
      errorStreaming.value = null
      cargandoConexion.value = true
      currentPartidoId = partidoId
      currentViewerId = viewerUser.id

      // 1. Crear RTCPeerConnection para recibir el video
      pcViewer = new RTCPeerConnection(RTC_CONFIG)
      const viewerCandidates: RTCIceCandidateInit[] = []
      const candidatosEmisorProcesados = new Set<string>()
      let candidatosEmisorEnEspera: RTCIceCandidateInit[] = []

      // Escuchar el track de video/audio que llega del emisor
      pcViewer.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          streamRemoto.value = event.streams[0]
        } else if (event.track) {
          const ms = streamRemoto.value ? new MediaStream(streamRemoto.value.getTracks()) : new MediaStream()
          ms.addTrack(event.track)
          streamRemoto.value = ms
        }
        cargandoConexion.value = false
        conectadoComoEspectador.value = true
      }

      pcViewer.oniceconnectionstatechange = () => {
        if (pcViewer && (pcViewer.iceConnectionState === 'connected' || pcViewer.iceConnectionState === 'completed')) {
          cargandoConexion.value = false
          conectadoComoEspectador.value = true
        } else if (pcViewer && pcViewer.iceConnectionState === 'failed') {
          errorStreaming.value = 'Conexión interrumpida con la cámara de la mesa.'
          cargandoConexion.value = false
        }
      }

      pcViewer.onicecandidate = (event) => {
        if (event.candidate && currentPartidoId && currentViewerId) {
          viewerCandidates.push(event.candidate.toJSON())
          const peerRef = doc(db, 'partidos', currentPartidoId, 'stream_peers', currentViewerId)
          updateDoc(peerRef, { viewerCandidates }).catch(() => {})
        }
      }

      // Procesar candidatos del emisor con control de buffer
      const procesarCandidatosEmisor = async (candidates: RTCIceCandidateInit[]) => {
        if (!pcViewer || !pcViewer.remoteDescription) {
          candidatosEmisorEnEspera.push(...candidates)
          return
        }

        for (const cand of candidates) {
          const key = `${cand.candidate}_${cand.sdpMid}_${cand.sdpMLineIndex}`
          if (!candidatosEmisorProcesados.has(key)) {
            candidatosEmisorProcesados.add(key)
            try {
              await pcViewer.addIceCandidate(new RTCIceCandidate(cand))
            } catch (e) {}
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
        if (data.offer && pcViewer && pcViewer.signalingState === 'stable') {
          try {
            await pcViewer.setRemoteDescription(new RTCSessionDescription(data.offer))
            const answer = await pcViewer.createAnswer()
            await pcViewer.setLocalDescription(answer)

            await updateDoc(peerRef, {
              answer: {
                type: answer.type,
                sdp: answer.sdp,
              },
              estado: 'conectado',
            })

            // Procesar candidatos acumulados en espera
            if (candidatosEmisorEnEspera.length > 0) {
              await procesarCandidatosEmisor(candidatosEmisorEnEspera)
              candidatosEmisorEnEspera = []
            }
          } catch (err) {
            console.error('Error al responder oferta SDP como espectador:', err)
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

      suscribirReacciones(partidoId)
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

    if (unsubPeerDoc) {
      unsubPeerDoc()
      unsubPeerDoc = null
    }
    if (unsubPartidoDoc) {
      unsubPartidoDoc()
      unsubPartidoDoc = null
    }
    if (unsubReacciones) {
      unsubReacciones()
      unsubReacciones = null
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

  // ==========================================
  // 3. REACCIONES Y EMOJIS EN TIEMPO REAL
  // ==========================================

  const enviarReaccion = async (
    partidoId: string,
    emoji: TipoReaccionLive,
    usuarioNombre: string,
  ) => {
    try {
      const reaccionesColl = collection(db, 'partidos', partidoId, 'reacciones')
      const docRef = doc(reaccionesColl)
      await setDoc(docRef, {
        id: docRef.id,
        emoji,
        usuarioNombre,
        timestamp: Date.now(),
        serverTime: serverTimestamp(),
      })
    } catch (e) {
      console.warn('Error al enviar reacción:', e)
    }
  }

  const suscribirReacciones = (partidoId: string) => {
    const reaccionesColl = collection(db, 'partidos', partidoId, 'reacciones')
    const q = query(reaccionesColl, orderBy('timestamp', 'desc'), limit(15))

    unsubReacciones = onSnapshot(q, (snapshot) => {
      const lista: ReaccionLive[] = []
      snapshot.forEach((d) => {
        lista.push({ id: d.id, ...d.data() } as ReaccionLive)
      })
      reaccionesEnVivo.value = lista
    })
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
    reaccionesEnVivo,

    // Acciones Emisor
    iniciarTransmision,
    detenerTransmision,
    alternarCamara,
    alternarAudio,
    alternarVideo,

    // Acciones Espectador
    conectarComoEspectador,
    desconectarEspectador,

    // Reacciones
    enviarReaccion,
  }
}

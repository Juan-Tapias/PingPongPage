import { ref, shallowRef } from 'vue'
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { TipoReaccionLive, ReaccionLive } from '@/types'

const RTC_CONFIG: RTCConfiguration = {
  iceServers: [
    { urls: ['stun:stun.l.google.com:19302', 'stun:stun1.l.google.com:19302'] },
  ],
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
  let unsubReacciones: Unsubscribe | null = null
  let pcViewer: RTCPeerConnection | null = null
  const peerConnections = new Map<string, RTCPeerConnection>()
  let currentPartidoId = ''
  let currentViewerId = ''

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

      // 2. Registrar en Firestore que el partido está transmitiéndose en vivo
      const partidoRef = doc(db, 'partidos', partidoId)
      await updateDoc(partidoRef, {
        enVivo: true,
        transmisionActiva: true,
        transmisorId: adminUser.id,
        transmisorNombre: adminUser.nombre,
        fechaInicioTransmision: Date.now(),
        totalEspectadores: 0,
      })

      transmitiendo.value = true
      cargandoConexion.value = false

      // 3. Escuchar nuevos espectadores en la subcolección `stream_peers`
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

        if (change.type === 'added') {
          // Un nuevo espectador solicitó conexión
          if (peerData.estado === 'solicitando' && !peerConnections.has(viewerId)) {
            await conectarEspectadorDesdeEmisor(partidoId, viewerId, change.doc.ref)
          }
        } else if (change.type === 'modified') {
          // El espectador respondió con su SDP Answer
          const pc = peerConnections.get(viewerId)
          if (pc && peerData.answer && pc.signalingState === 'have-local-offer') {
            try {
              await pc.setRemoteDescription(new RTCSessionDescription(peerData.answer))
            } catch (err) {
              console.warn(`Error al establecer Remote Description para ${viewerId}:`, err)
            }
          }

          // Procesar candidatos ICE enviados por el espectador
          if (pc && Array.isArray(peerData.viewerCandidates) && peerData.viewerCandidates.length > 0) {
            for (const cand of peerData.viewerCandidates) {
              try {
                await pc.addIceCandidate(new RTCIceCandidate(cand))
              } catch (e) {
                // Candidato redundante o tardío
              }
            }
          }
        } else if (change.type === 'removed') {
          // El espectador abandonó
          cerrarPeer(viewerId)
        }
      })
    })
  }

  /**
   * Crea la oferta SDP y PeerConnection para un espectador específico
   */
  const conectarEspectadorDesdeEmisor = async (partidoId: string, viewerId: string, peerDocRef: any) => {
    if (!streamLocal.value) return

    const pc = new RTCPeerConnection(RTC_CONFIG)
    peerConnections.set(viewerId, pc)

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
      if (pc.iceConnectionState === 'disconnected' || pc.iceConnectionState === 'failed') {
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
  }

  /**
   * Finaliza la transmisión en vivo, apaga cámara y limpia Firestore
   */
  const detenerTransmision = async () => {
    transmitiendo.value = false

    // 1. Detener pistas de hardware
    if (streamLocal.value) {
      streamLocal.value.getTracks().forEach((t) => t.stop())
      streamLocal.value = null
    }

    // 2. Cerrar todas las conexiones peer activas
    peerConnections.forEach((pc) => {
      try {
        pc.close()
      } catch {}
    })
    peerConnections.clear()

    if (unsubPeers) {
      unsubPeers()
      unsubPeers = null
    }
    if (unsubReacciones) {
      unsubReacciones()
      unsubReacciones = null
    }

    // 3. Notificar a Firestore que concluyó la transmisión
    if (currentPartidoId) {
      try {
        const partidoRef = doc(db, 'partidos', currentPartidoId)
        await updateDoc(partidoRef, {
          transmisionActiva: false,
          totalEspectadores: 0,
        })

        // Eliminar colección temporal de stream_peers
        const peersColl = collection(db, 'partidos', currentPartidoId, 'stream_peers')
        const snap = await getDocs(peersColl)
        const batchDeletes = snap.docs.map((d) => deleteDoc(d.ref))
        await Promise.all(batchDeletes)
      } catch (err) {
        console.warn('Error al limpiar datos de stream en Firestore:', err)
      }
      currentPartidoId = ''
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

      // Escuchar el track de video/audio que llega del emisor
      pcViewer.ontrack = (event) => {
        if (event.streams && event.streams[0]) {
          streamRemoto.value = event.streams[0]
          cargandoConexion.value = false
          conectadoComoEspectador.value = true
        }
      }

      pcViewer.onicecandidate = (event) => {
        if (event.candidate && currentPartidoId && currentViewerId) {
          viewerCandidates.push(event.candidate.toJSON())
          const peerRef = doc(db, 'partidos', currentPartidoId, 'stream_peers', currentViewerId)
          updateDoc(peerRef, { viewerCandidates }).catch(() => {})
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
          } catch (err) {
            console.error('Error al responder oferta SDP como espectador:', err)
          }
        }

        // Agregar candidatos ICE del emisor
        if (pcViewer && Array.isArray(data.broadcasterCandidates) && data.broadcasterCandidates.length > 0) {
          for (const cand of data.broadcasterCandidates) {
            try {
              await pcViewer.addIceCandidate(new RTCIceCandidate(cand))
            } catch (e) {
              // Candidato ya agregado
            }
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
      streamRemoto.value.getTracks().forEach((t) => t.stop())
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
    if (unsubReacciones) {
      unsubReacciones()
      unsubReacciones = null
    }

    if (currentPartidoId && currentViewerId) {
      try {
        const peerRef = doc(db, 'partidos', currentPartidoId, 'stream_peers', currentViewerId)
        await deleteDoc(peerRef)
      } catch {}
      currentViewerId = ''
      currentPartidoId = ''
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
    // Solo últimas reacciones recientes
    const q = query(reaccionesColl, orderBy('timestamp', 'desc'), limit(15))

    unsubReacciones = onSnapshot(q, (snapshot) => {
      const lista: ReaccionLive[] = []
      snapshot.forEach((d) => {
        lista.push({ id: d.id, ...d.data() } as ReaccionLive)
      })
      reaccionesEnVivo.value = lista
    })
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

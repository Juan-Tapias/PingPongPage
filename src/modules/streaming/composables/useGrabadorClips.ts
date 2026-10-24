import { ref } from 'vue'
import { useBibliotecaVideos } from '@/modules/biblioteca/composables/useBibliotecaVideos'
import { subirArchivoVideo } from '@/modules/biblioteca/service/storageService'
import type { ClipBiblioteca } from '@/modules/biblioteca/types'

export function useGrabadorClips() {
  const { agregarClip } = useBibliotecaVideos()

  // Estado para clips cortos (15 segundos)
  const estaGrabando = ref(false)
  const segundosGrabados = ref(0)
  const guardandoClip = ref(false)
  const feedbackClip = ref<string | null>(null)

  // Estado para la grabación continua de la transmisión completa
  const transmitiendoGrabacion = ref(false)
  const guardandoTransmision = ref(false)
  let recorderTransmision: MediaRecorder | null = null
  let chunksTransmision: Blob[] = []
  let horaInicioTransmision: number = 0

  let mediaRecorder: MediaRecorder | null = null
  let chunksGrabados: Blob[] = []
  let temporizadorInterval: ReturnType<typeof setInterval> | null = null
  let timeoutFinalizacion: ReturnType<typeof setTimeout> | null = null
  let datosMetadataClip: Partial<ClipBiblioteca> | null = null
  let videoElementReferencia: HTMLVideoElement | null = null

  /**
   * Captura una instantánea en imagen (DataURL) a partir del elemento HTMLVideoElement
   */
  const capturarMiniatura = (videoEl?: HTMLVideoElement | null, rotacionGrados = 0): string => {
    if (!videoEl || videoEl.videoWidth === 0 || videoEl.videoHeight === 0) {
      return 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=800&q=80'
    }

    try {
      const rotado = rotacionGrados === 90 || rotacionGrados === 270
      const canvas = document.createElement('canvas')
      canvas.width = rotado ? Math.min(videoEl.videoHeight, 640) : Math.min(videoEl.videoWidth, 640)
      canvas.height = rotado ? Math.min(videoEl.videoWidth, 360) : Math.min(videoEl.videoHeight, 360)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        if (rotacionGrados !== 0) {
          ctx.translate(canvas.width / 2, canvas.height / 2)
          ctx.rotate((rotacionGrados * Math.PI) / 180)
          const dw = rotado ? canvas.height : canvas.width
          const dh = rotado ? canvas.width : canvas.height
          ctx.drawImage(videoEl, -dw / 2, -dh / 2, dw, dh)
        } else {
          ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
        }
        return canvas.toDataURL('image/jpeg', 0.8)
      }
    } catch (e) {
      console.warn('[useGrabadorClips] No se pudo capturar miniatura canvas:', e)
    }

    return 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=800&q=80'
  }

  /**
   * Determina el mejor tipo MIME soportado por el navegador
   */
  const obtenerTipoMimeSoportado = (): string => {
    const tipos = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4',
    ]
    for (const t of tipos) {
      if (typeof MediaRecorder !== 'undefined' && MediaRecorder.isTypeSupported(t)) {
        return t
      }
    }
    return ''
  }

  /**
   * Inicia la captura de un clip de video en vivo (por defecto 15 segundos)
   */
  const iniciarGrabacionClip = async (
    stream: MediaStream,
    videoEl?: HTMLVideoElement | null,
    metadata?: Partial<ClipBiblioteca>,
    duracionSegundos = 15,
  ) => {
    if (estaGrabando.value) return

    if (!stream || stream.getTracks().length === 0) {
      feedbackClip.value = 'No hay señal de video activa para grabar'
      setTimeout(() => (feedbackClip.value = null), 3000)
      return
    }

    try {
      datosMetadataClip = metadata || null
      videoElementReferencia = videoEl || null
      chunksGrabados = []

      const mimeTypeElegido = obtenerTipoMimeSoportado()

      mediaRecorder = new MediaRecorder(
        stream,
        mimeTypeElegido ? { mimeType: mimeTypeElegido } : undefined,
      )

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          chunksGrabados.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        await procesarClipGrabado()
      }

      mediaRecorder.start(1000)
      estaGrabando.value = true
      segundosGrabados.value = 0

      temporizadorInterval = setInterval(() => {
        segundosGrabados.value += 1
      }, 1000)

      timeoutFinalizacion = setTimeout(() => {
        detenerGrabacionClip()
      }, duracionSegundos * 1000)

      feedbackClip.value = `Grabando clip (${duracionSegundos}s)...`
    } catch (err: any) {
      console.error('[useGrabadorClips] Error al iniciar grabación:', err)
      feedbackClip.value = 'No se pudo iniciar la grabación en este dispositivo'
      setTimeout(() => (feedbackClip.value = null), 3000)
    }
  }

  /**
   * Detiene manualmente la grabación del clip
   */
  const detenerGrabacionClip = () => {
    if (!estaGrabando.value) return

    if (temporizadorInterval) {
      clearInterval(temporizadorInterval)
      temporizadorInterval = null
    }

    if (timeoutFinalizacion) {
      clearTimeout(timeoutFinalizacion)
      timeoutFinalizacion = null
    }

    if (mediaRecorder && mediaRecorder.state !== 'inactive') {
      mediaRecorder.stop()
    }

    estaGrabando.value = false
  }

  /**
   * Procesa el clip grabado, lo sube a Firebase Storage (o fallback) y lo añade a la biblioteca
   */
  const procesarClipGrabado = async () => {
    guardandoClip.value = true
    feedbackClip.value = 'Guardando clip en la videoteca...'

    try {
      const mime = mediaRecorder?.mimeType || 'video/webm'
      const blob = new Blob(chunksGrabados, { type: mime })

      // Subida a Storage si es posible, o fallback a URL local
      let finalVideoUrl = ''
      try {
        const extension = mime.includes('mp4') ? 'mp4' : 'webm'
        const file = new File([blob], `clip_${Date.now()}.${extension}`, { type: mime })
        finalVideoUrl = await subirArchivoVideo(file)
      } catch (e) {
        console.warn('[useGrabadorClips] Fallback a blob URL:', e)
        finalVideoUrl = URL.createObjectURL(blob)
      }

      const miniaturaUrl = capturarMiniatura(videoElementReferencia)
      const duracionSec = Math.max(1, segundosGrabados.value)

      const j1 = datosMetadataClip?.jugador1?.nombre || 'Jugador 1'
      const j2 = datosMetadataClip?.jugador2?.nombre || 'Jugador 2'

      const nuevoClip = await agregarClip({
        titulo: datosMetadataClip?.titulo || `Gran Jugada: ${j1} vs ${j2}`,
        descripcion:
          datosMetadataClip?.descripcion ||
          `Clip capturado durante el partido en ${datosMetadataClip?.mesa || 'Mesa Oficial'}.`,
        videoUrl: finalVideoUrl,
        miniaturaUrl: miniaturaUrl,
        duracionSegundos: duracionSec,
        tipo: datosMetadataClip?.tipo || 'mejor_jugada',
        torneoId: datosMetadataClip?.torneoId,
        torneoNombre: datosMetadataClip?.torneoNombre || 'Torneo Tenis de Mesa',
        partidoId: datosMetadataClip?.partidoId,
        mesa: datosMetadataClip?.mesa || 'Mesa 1',
        jugador1: datosMetadataClip?.jugador1 || { id: 'j1', nombre: j1 },
        jugador2: datosMetadataClip?.jugador2 || { id: 'j2', nombre: j2 },
        marcadorMomento: datosMetadataClip?.marcadorMomento,
        creadorNombre: datosMetadataClip?.creadorNombre || 'Árbitro de Mesa',
        creadorId: datosMetadataClip?.creadorId || 'transmisor',
      })

      feedbackClip.value = '¡Clip guardado exitosamente en la Biblioteca!'
      setTimeout(() => {
        feedbackClip.value = null
      }, 4000)

      return nuevoClip
    } catch (err) {
      console.error('[useGrabadorClips] Error al guardar clip:', err)
      feedbackClip.value = 'Error al procesar el clip'
      setTimeout(() => {
        feedbackClip.value = null
      }, 3000)
    } finally {
      guardandoClip.value = false
    }
  }

  // ========================================================
  // GRABACIÓN CONTINUA AUTOMÁTICA DE LA TRANSMISIÓN COMPLETA
  // ========================================================

  /**
   * Inicia el buffer continuo de grabación de la transmisión en vivo
   */
  const iniciarGrabacionTransmision = (stream: MediaStream) => {
    if (!stream || stream.getTracks().length === 0 || transmitiendoGrabacion.value) return

    try {
      chunksTransmision = []
      horaInicioTransmision = Date.now()

      const mime = obtenerTipoMimeSoportado()
      recorderTransmision = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined)

      recorderTransmision.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          chunksTransmision.push(e.data)
        }
      }

      recorderTransmision.start(3000)
      transmitiendoGrabacion.value = true
    } catch (err) {
      console.warn('[useGrabadorClips] Grabación continua no disponible en este navegador:', err)
    }
  }

  /**
   * Finaliza la grabación de la transmisión y la guarda automáticamente en la videoteca
   */
  const detenerYGuardarTransmision = async (
    videoEl: HTMLVideoElement | null,
    metadata: Partial<ClipBiblioteca>,
    rotacionGrados = 0,
  ) => {
    if (!transmitiendoGrabacion.value && chunksTransmision.length === 0) {
      return null
    }

    guardandoTransmision.value = true
    transmitiendoGrabacion.value = false

    return new Promise<ClipBiblioteca | null>((resolve) => {
      const finalizarYSubir = async () => {
        try {
          const mime = recorderTransmision?.mimeType || 'video/webm'
          const blob = new Blob(chunksTransmision, { type: mime })

          let videoUrl = ''
          if (blob.size > 0) {
            try {
              const extension = mime.includes('mp4') ? 'mp4' : 'webm'
              const file = new File([blob], `transmision_${Date.now()}.${extension}`, { type: mime })
              videoUrl = await subirArchivoVideo(file)
            } catch (err) {
              console.warn('[useGrabadorClips] Fallback de transmisión a blob URL:', err)
              videoUrl = URL.createObjectURL(blob)
            }
          }

          const miniaturaUrl = capturarMiniatura(videoEl, rotacionGrados)
          const duracionSec = horaInicioTransmision > 0
            ? Math.round((Date.now() - horaInicioTransmision) / 1000)
            : 60

          const j1 = metadata?.jugador1?.nombre || 'Jugador 1'
          const j2 = metadata?.jugador2?.nombre || 'Jugador 2'

          const nuevoClip = await agregarClip({
            titulo: metadata.titulo || `Transmisión: ${j1} vs ${j2}`,
            descripcion:
              metadata.descripcion ||
              `Grabación completa de la transmisión en vivo (${metadata.mesa || 'Mesa 1'}).`,
            videoUrl: videoUrl,
            miniaturaUrl: miniaturaUrl,
            duracionSegundos: Math.max(duracionSec, 5),
            tipo: 'transmision_completa',
            torneoId: metadata.torneoId,
            torneoNombre: metadata.torneoNombre || 'Torneo Oficial',
            partidoId: metadata.partidoId,
            mesa: metadata.mesa || 'Mesa 1',
            jugador1: metadata.jugador1 || { id: 'j1', nombre: j1 },
            jugador2: metadata.jugador2 || { id: 'j2', nombre: j2 },
            marcadorMomento: metadata.marcadorMomento || 'Finalizado',
            creadorNombre: metadata.creadorNombre || 'Transmisión Oficial',
            creadorId: metadata.creadorId || 'transmision_auto',
          })

          resolve(nuevoClip)
        } catch (err) {
          console.error('[useGrabadorClips] Error al guardar transmisión completa:', err)
          resolve(null)
        } finally {
          guardandoTransmision.value = false
          chunksTransmision = []
          recorderTransmision = null
        }
      }

      if (recorderTransmision && recorderTransmision.state !== 'inactive') {
        recorderTransmision.onstop = () => {
          finalizarYSubir()
        }
        recorderTransmision.stop()
      } else {
        finalizarYSubir()
      }
    })
  }

  return {
    estaGrabando,
    segundosGrabados,
    guardandoClip,
    feedbackClip,
    transmitiendoGrabacion,
    guardandoTransmision,
    iniciarGrabacionClip,
    detenerGrabacionClip,
    iniciarGrabacionTransmision,
    detenerYGuardarTransmision,
  }
}

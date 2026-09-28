import { ref } from 'vue'
import { useBibliotecaVideos } from '@/modules/biblioteca/composables/useBibliotecaVideos'
import type { ClipBiblioteca } from '@/modules/biblioteca/types'

export function useGrabadorClips() {
  const { agregarClip } = useBibliotecaVideos()

  const estaGrabando = ref(false)
  const segundosGrabados = ref(0)
  const guardandoClip = ref(false)
  const feedbackClip = ref<string | null>(null)

  let mediaRecorder: MediaRecorder | null = null
  let chunksGrabados: Blob[] = []
  let temporizadorInterval: ReturnType<typeof setInterval> | null = null
  let timeoutFinalizacion: ReturnType<typeof setTimeout> | null = null
  let datosMetadataClip: Partial<ClipBiblioteca> | null = null
  let videoElementReferencia: HTMLVideoElement | null = null

  /**
   * Captura una instantánea en imagen (DataURL) a partir del elemento HTMLVideoElement
   */
  const capturarMiniatura = (videoEl?: HTMLVideoElement | null): string => {
    if (!videoEl || videoEl.videoWidth === 0 || videoEl.videoHeight === 0) {
      return 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=800&q=80'
    }

    try {
      const canvas = document.createElement('canvas')
      canvas.width = Math.min(videoEl.videoWidth, 640)
      canvas.height = Math.min(videoEl.videoHeight, 360)
      const ctx = canvas.getContext('2d')
      if (ctx) {
        ctx.drawImage(videoEl, 0, 0, canvas.width, canvas.height)
        return canvas.toDataURL('image/jpeg', 0.8)
      }
    } catch (e) {
      console.warn('[useGrabadorClips] No se pudo capturar miniatura canvas:', e)
    }

    return 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=800&q=80'
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

      // Verificar tipos MIME compatibles
      const tiposPosibles = [
        'video/webm;codecs=vp9,opus',
        'video/webm;codecs=vp8,opus',
        'video/webm',
        'video/mp4',
      ]
      let mimeTypeElegido = ''
      for (const t of tiposPosibles) {
        if (MediaRecorder.isTypeSupported(t)) {
          mimeTypeElegido = t
          break
        }
      }

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

      mediaRecorder.start(1000) // Emitir chunks cada segundo
      estaGrabando.value = true
      segundosGrabados.value = 0

      // Intervalo de conteo
      temporizadorInterval = setInterval(() => {
        segundosGrabados.value += 1
      }, 1000)

      // Detener automáticamente al alcanzar la duración
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
   * Procesa el blob grabado y lo añade a la biblioteca
   */
  const procesarClipGrabado = async () => {
    guardandoClip.value = true
    feedbackClip.value = 'Procesando clip y guardando en Biblioteca...'

    try {
      const mime = mediaRecorder?.mimeType || 'video/webm'
      const blob = new Blob(chunksGrabados, { type: mime })
      const videoBlobUrl = URL.createObjectURL(blob)

      // Guardar también una copia descargable o miniatura
      const miniaturaUrl = capturarMiniatura(videoElementReferencia)

      const duracionSec = Math.max(1, segundosGrabados.value)

      const j1 = datosMetadataClip?.jugador1?.nombre || 'Jugador 1'
      const j2 = datosMetadataClip?.jugador2?.nombre || 'Jugador 2'

      const nuevoClip = await agregarClip({
        titulo: datosMetadataClip?.titulo || `Gran Jugada: ${j1} vs ${j2}`,
        descripcion:
          datosMetadataClip?.descripcion ||
          `Clip en vivo capturado durante el partido en ${datosMetadataClip?.mesa || 'Mesa Oficial'}.`,
        videoUrl: videoBlobUrl,
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

  return {
    estaGrabando,
    segundosGrabados,
    guardandoClip,
    feedbackClip,
    iniciarGrabacionClip,
    detenerGrabacionClip,
  }
}

import { subirACloudinary, transformarUrl } from '@/services/cloudinaryService'

/**
 * Detecta si una URL corresponde a un video de YouTube y extrae su ID único (11 caracteres)
 */
export function extraerIdYoutube(url: string): string | null {
  if (!url) return null
  const regex = /(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/
  const match = url.match(regex)
  return (match && match[1]) ? match[1] : null
}

/**
 * Obtiene la miniatura oficial de un video de YouTube en alta definición
 */
export function obtenerMiniaturaYoutube(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
}

/**
 * Verifica si una URL es un blob local que solo existe en la memoria de una máquina
 */
export function esUrlBlobLocal(url?: string): boolean {
  if (!url) return false
  return url.startsWith('blob:')
}

/**
 * Sube un archivo de video a Cloudinary (máx. 100 MB en el plan gratuito) con reporte de progreso
 */
export async function subirArchivoVideo(
  file: File,
  onProgreso?: (porcentaje: number) => void,
): Promise<string> {
  try {
    const { url } = await subirACloudinary(file, { tipo: 'video', carpeta: 'spinapp/biblioteca/videos', onProgreso })
    return url
  } catch (error) {
    console.error('[storageService] Error al subir video a Cloudinary:', error)
    throw error
  }
}

/**
 * Sube una imagen de miniatura personalizada a Cloudinary y retorna la URL optimizada (640x360)
 */
export async function subirArchivoImagen(file: File): Promise<string> {
  try {
    const { url } = await subirACloudinary(file, { tipo: 'image', carpeta: 'spinapp/biblioteca/miniaturas' })
    return transformarUrl(url, 'c_fill,w_640,h_360,f_auto,q_auto')
  } catch (error) {
    console.error('[storageService] Error al subir miniatura a Cloudinary:', error)
    throw error
  }
}

/**
 * Genera automáticamente una miniatura capturando el fotograma al segundo 1 del video usando Canvas
 */
export async function generarMiniaturaDesdeArchivo(file: File): Promise<string> {
  return new Promise((resolve) => {
    const video = document.createElement('video')
    const blobUrl = URL.createObjectURL(file)
    video.src = blobUrl
    video.muted = true
    video.playsInline = true
    video.currentTime = 1

    video.onloadeddata = () => {
      // Si el video es muy corto, capturar el frame disponible
      if (video.duration < 1) {
        video.currentTime = 0.1
      }
    }

    video.onseeked = () => {
      try {
        const canvas = document.createElement('canvas')
        canvas.width = Math.min(video.videoWidth || 640, 640)
        canvas.height = Math.min(video.videoHeight || 360, 360)
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
          URL.revokeObjectURL(blobUrl)
          resolve(dataUrl)
          return
        }
      } catch (err) {
        console.warn('[storageService] No se pudo capturar fotograma del video:', err)
      }
      URL.revokeObjectURL(blobUrl)
      resolve('/images/table-vertical.jpg')
    }

    video.onerror = () => {
      URL.revokeObjectURL(blobUrl)
      resolve('/images/table-vertical.jpg')
    }
  })
}

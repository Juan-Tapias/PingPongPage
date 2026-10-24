import { ref as storageRef, uploadBytesResumable, getDownloadURL } from 'firebase/storage'
import { storage } from '@/services/firebase'

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
 * Sube un archivo de video a Firebase Storage con reporte de progreso porcentual
 */
export async function subirArchivoVideo(
  file: File,
  onProgreso?: (porcentaje: number) => void,
): Promise<string> {
  const nombreLimpio = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const ruta = `biblioteca/videos/${Date.now()}_${nombreLimpio}`
  const ref = storageRef(storage, ruta)

  const uploadTask = uploadBytesResumable(ref, file, {
    contentType: file.type || 'video/mp4',
  })

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progreso = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100)
        if (onProgreso) {
          onProgreso(progreso)
        }
      },
      (error) => {
        console.error('[storageService] Error al subir video a Storage:', error)
        reject(error)
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(downloadUrl)
        } catch (err) {
          reject(err)
        }
      },
    )
  })
}

/**
 * Sube una imagen de miniatura personalizada a Firebase Storage
 */
export async function subirArchivoImagen(file: File): Promise<string> {
  const nombreLimpio = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
  const ruta = `biblioteca/miniaturas/${Date.now()}_${nombreLimpio}`
  const ref = storageRef(storage, ruta)

  const uploadTask = uploadBytesResumable(ref, file, {
    contentType: file.type || 'image/jpeg',
  })

  return new Promise((resolve, reject) => {
    uploadTask.on(
      'state_changed',
      null,
      (error) => {
        console.error('[storageService] Error al subir miniatura a Storage:', error)
        reject(error)
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref)
          resolve(downloadUrl)
        } catch (err) {
          reject(err)
        }
      },
    )
  })
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

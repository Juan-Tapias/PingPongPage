/**
 * Subida de imágenes y videos a Cloudinary (plan gratuito) con un "upload preset" UNSIGNED.
 *
 * Solo se usan dos variables públicas (VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET).
 * El API secret de Cloudinary NUNCA va en el frontend.
 */

export type TipoRecurso = 'image' | 'video'

export interface ResultadoCloudinary {
  url: string
  publicId: string
  /** Solo viene si el preset tiene "Return delete token" activo; sirve ~10 minutos. */
  deleteToken?: string
}

export interface OpcionesSubida {
  tipo: TipoRecurso
  /** Carpeta dentro de Cloudinary, p. ej. `spinapp/usuarios/{uid}` */
  carpeta: string
  onProgreso?: (porcentaje: number) => void
}

interface RespuestaCloudinary {
  secure_url?: string
  public_id?: string
  delete_token?: string
  error?: { message?: string }
}

/** Límites del plan gratuito de Cloudinary por archivo. */
export const LIMITE_BYTES: Record<TipoRecurso, number> = {
  image: 10 * 1024 * 1024,
  video: 100 * 1024 * 1024,
}

const cloudName = () => import.meta.env.VITE_CLOUDINARY_CLOUD_NAME
const uploadPreset = () => import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET

export const cloudinaryConfigurado = (): boolean => Boolean(cloudName() && uploadPreset())

/** Indica si una URL pertenece al cloud de Cloudinary configurado. */
export const esUrlCloudinary = (url?: string | null): boolean => {
  if (!url || !cloudName()) return false
  return url.startsWith(`https://res.cloudinary.com/${cloudName()}/`)
}

/**
 * Inserta transformaciones en una URL de Cloudinary, p. ej. `c_fill,w_256,h_256,f_auto,q_auto`.
 * Si la URL no es de Cloudinary se devuelve sin cambios.
 */
export const transformarUrl = (url: string, transformacion: string): string => {
  if (!esUrlCloudinary(url) || !transformacion) return url
  return url.replace('/upload/', `/upload/${transformacion}/`)
}

/** Sube un archivo a Cloudinary con reporte de progreso. */
export const subirACloudinary = (archivo: File | Blob, opciones: OpcionesSubida): Promise<ResultadoCloudinary> => {
  if (!cloudinaryConfigurado()) {
    return Promise.reject(
      new Error('Cloudinary no está configurado: define VITE_CLOUDINARY_CLOUD_NAME y VITE_CLOUDINARY_UPLOAD_PRESET en .env'),
    )
  }

  const limite = LIMITE_BYTES[opciones.tipo]
  if (archivo.size > limite) {
    const mb = Math.round(limite / (1024 * 1024))
    return Promise.reject(new Error(`El archivo supera el límite de ${mb} MB del plan gratuito de Cloudinary.`))
  }

  const form = new FormData()
  form.append('file', archivo)
  form.append('upload_preset', uploadPreset())
  form.append('folder', opciones.carpeta)

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${cloudName()}/${opciones.tipo}/upload`)

    if (opciones.onProgreso) {
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) opciones.onProgreso!(Math.round((e.loaded / e.total) * 100))
      }
    }

    xhr.onload = () => {
      let cuerpo: RespuestaCloudinary | null = null
      try {
        cuerpo = JSON.parse(xhr.responseText) as RespuestaCloudinary
      } catch {
        // respuesta no JSON
      }
      if (xhr.status >= 200 && xhr.status < 300 && cuerpo?.secure_url) {
        resolve({ url: cuerpo.secure_url, publicId: cuerpo.public_id ?? '', deleteToken: cuerpo.delete_token })
      } else {
        reject(new Error(cuerpo?.error?.message || `Cloudinary respondió ${xhr.status}`))
      }
    }
    xhr.onerror = () => reject(new Error('No se pudo conectar con Cloudinary. Revisa tu conexión.'))
    xhr.send(form)
  })
}

/**
 * Borra un archivo recién subido usando su delete_token (válido ~10 min, no requiere secret).
 * Best-effort: nunca lanza.
 */
export const eliminarConToken = async (deleteToken?: string): Promise<void> => {
  if (!deleteToken || !cloudName()) return
  try {
    const form = new FormData()
    form.append('token', deleteToken)
    await fetch(`https://api.cloudinary.com/v1_1/${cloudName()}/delete_by_token`, { method: 'POST', body: form })
  } catch (err) {
    console.warn('[cloudinary] No se pudo eliminar el archivo con delete_token:', err)
  }
}

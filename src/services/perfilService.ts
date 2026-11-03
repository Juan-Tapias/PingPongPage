import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { doc, updateDoc } from 'firebase/firestore'
import { db, storage } from '@/services/firebase'
import type { Usuario } from '@/types'

export interface AvatarPreset {
  id: string
  nombre: string
  descripcion: string
  svg: string
  dataUrl: string
}

// Catálogo de 5 avatares deportivos temáticos de tenis de mesa (SVG vectoriales nítidos)
export const AVATARES_PRESET: AvatarPreset[] = [
  {
    id: 'raqueta-oro',
    nombre: 'Raqueta de Oro',
    descripcion: 'Madera fina y goma profesional de campeonato',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="grad-p1" cx="35%" cy="35%" r="65%">
          <stop offset="0%" stop-color="#fbbf24"/>
          <stop offset="60%" stop-color="#d97706"/>
          <stop offset="100%" stop-color="#78350f"/>
        </radialGradient>
        <linearGradient id="grad-mango1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#b45309"/>
          <stop offset="100%" stop-color="#451a03"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#1e1b4b"/>
      <ellipse cx="50" cy="40" rx="30" ry="28" fill="url(#grad-p1)" stroke="#fef3c7" stroke-width="2"/>
      <ellipse cx="50" cy="40" rx="26" ry="24" fill="#dc2626"/>
      <rect x="44" y="62" width="12" height="26" rx="4" fill="url(#grad-mango1)" stroke="#fef3c7" stroke-width="1.5"/>
      <circle cx="48" cy="38" r="4" fill="#ffffff" opacity="0.9"/>
      <circle cx="58" cy="34" r="5" fill="#f59e0b"/>
    </svg>`,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="grad-p1" cx="35%" cy="35%" r="65%"><stop offset="0%" stop-color="%23fbbf24"/><stop offset="60%" stop-color="%23d97706"/><stop offset="100%" stop-color="%2378350f"/></radialGradient><linearGradient id="grad-mango1" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23b45309"/><stop offset="100%" stop-color="%23451a03"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="%231e1b4b"/><ellipse cx="50" cy="40" rx="30" ry="28" fill="url(%23grad-p1)" stroke="%23fef3c7" stroke-width="2"/><ellipse cx="50" cy="40" rx="26" ry="24" fill="%23dc2626"/><rect x="44" y="62" width="12" height="26" rx="4" fill="url(%23grad-mango1)" stroke="%23fef3c7" stroke-width="1.5"/><circle cx="48" cy="38" r="4" fill="%23ffffff" opacity="0.9"/><circle cx="58" cy="34" r="5" fill="%23f59e0b"/></svg>`,
  },
  {
    id: 'pelota-fuego',
    nombre: 'Spin de Fuego',
    descripcion: 'Velocidad de remate imparable con efecto letal',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="grad-fuego" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="40%" stop-color="#f97316"/>
          <stop offset="85%" stop-color="#dc2626"/>
          <stop offset="100%" stop-color="#7f1d1d"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#0f172a"/>
      <path d="M50 12 C62 26 76 34 76 56 C76 72 64 84 50 84 C36 84 24 72 24 56 C24 40 38 28 50 12 Z" fill="url(#grad-fuego)"/>
      <circle cx="50" cy="60" r="14" fill="#ffffff" stroke="#ea580c" stroke-width="2"/>
      <path d="M50 25 C58 35 66 45 62 58 C58 48 52 42 50 36 C48 42 42 48 38 58 C34 45 42 35 50 25 Z" fill="#fef08a"/>
      <circle cx="46" cy="58" r="3" fill="#fdba74"/>
    </svg>`,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="grad-fuego" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%23fef08a"/><stop offset="40%" stop-color="%23f97316"/><stop offset="85%" stop-color="%23dc2626"/><stop offset="100%" stop-color="%237f1d1d"/></radialGradient></defs><circle cx="50" cy="50" r="48" fill="%230f172a"/><path d="M50 12 C62 26 76 34 76 56 C76 72 64 84 50 84 C36 84 24 72 24 56 C24 40 38 28 50 12 Z" fill="url(%23grad-fuego)"/><circle cx="50" cy="60" r="14" fill="%23ffffff" stroke="%23ea580c" stroke-width="2"/><path d="M50 25 C58 35 66 45 62 58 C58 48 52 42 50 36 C48 42 42 48 38 58 C34 45 42 35 50 25 Z" fill="%23fef08a"/><circle cx="46" cy="58" r="3" fill="%23fdba74"/></svg>`,
  },
  {
    id: 'copa-campeon',
    nombre: 'Copa de Campeón',
    descripcion: 'Gloria y triunfo en la Gran Final de spinApp',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <linearGradient id="grad-oro" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="#fef08a"/>
          <stop offset="50%" stop-color="#f59e0b"/>
          <stop offset="100%" stop-color="#b45309"/>
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="#064e3b"/>
      <path d="M30 26 H70 V46 C70 58 61 66 50 66 C39 66 30 58 30 46 Z" fill="url(#grad-oro)" stroke="#fef08a" stroke-width="2"/>
      <path d="M22 30 C18 30 16 38 22 46 C26 50 30 50 30 50" fill="none" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/>
      <path d="M78 30 C82 30 84 38 78 46 C74 50 70 50 70 50" fill="none" stroke="#fef08a" stroke-width="3" stroke-linecap="round"/>
      <path d="M46 66 H54 V76 H46 Z" fill="#b45309"/>
      <rect x="34" y="76" width="32" height="8" rx="2" fill="#78350f" stroke="#fef08a" stroke-width="1.5"/>
      <polygon points="50,33 52,38 58,38 53,42 55,47 50,44 45,47 47,42 42,38 48,38" fill="#ffffff"/>
    </svg>`,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><linearGradient id="grad-oro" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%23fef08a"/><stop offset="50%" stop-color="%23f59e0b"/><stop offset="100%" stop-color="%23b45309"/></linearGradient></defs><circle cx="50" cy="50" r="48" fill="%23064e3b"/><path d="M30 26 H70 V46 C70 58 61 66 50 66 C39 66 30 58 30 46 Z" fill="url(%23grad-oro)" stroke="%23fef08a" stroke-width="2"/><path d="M22 30 C18 30 16 38 22 46 C26 50 30 50 30 50" fill="none" stroke="%23fef08a" stroke-width="3" stroke-linecap="round"/><path d="M78 30 C82 30 84 38 78 46 C74 50 70 50 70 50" fill="none" stroke="%23fef08a" stroke-width="3" stroke-linecap="round"/><path d="M46 66 H54 V76 H46 Z" fill="%23b45309"/><rect x="34" y="76" width="32" height="8" rx="2" fill="%2378350f" stroke="%23fef08a" stroke-width="1.5"/><polygon points="50,33 52,38 58,38 53,42 55,47 50,44 45,47 47,42 42,38 48,38" fill="%23ffffff"/></svg>`,
  },
  {
    id: 'mesa-arena',
    nombre: 'Mesa de Arena',
    descripcion: 'Precisión milimétrica sobre el tapete azul oficial',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="48" fill="#0f172a"/>
      <!-- Tablero perspectiva -->
      <polygon points="18,56 82,56 72,36 28,36" fill="#0284c7" stroke="#38bdf8" stroke-width="2"/>
      <!-- Línea central blanca -->
      <line x1="50" y1="36" x2="50" y2="56" stroke="#ffffff" stroke-width="1.5"/>
      <!-- Red -->
      <line x1="20" y1="46" x2="80" y2="46" stroke="#ffffff" stroke-width="2.5" stroke-dasharray="2 1.5"/>
      <!-- Patas -->
      <line x1="22" y1="56" x2="22" y2="72" stroke="#64748b" stroke-width="2"/>
      <line x1="78" y1="56" x2="78" y2="72" stroke="#64748b" stroke-width="2"/>
      <line x1="50" y1="56" x2="50" y2="72" stroke="#475569" stroke-width="2"/>
      <!-- Pelotita blanca rebotando -->
      <circle cx="42" cy="30" r="4" fill="#ffffff" filter="drop-shadow(0 2px 4px rgba(0,0,0,0.4))"/>
    </svg>`,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="%230f172a"/><polygon points="18,56 82,56 72,36 28,36" fill="%230284c7" stroke="%2338bdf8" stroke-width="2"/><line x1="50" y1="36" x2="50" y2="56" stroke="%23ffffff" stroke-width="1.5"/><line x1="20" y1="46" x2="80" y2="46" stroke="%23ffffff" stroke-width="2.5" stroke-dasharray="2 1.5"/><line x1="22" y1="56" x2="22" y2="72" stroke="%2364748b" stroke-width="2"/><line x1="78" y1="56" x2="78" y2="72" stroke="%2364748b" stroke-width="2"/><line x1="50" y1="56" x2="50" y2="72" stroke="%23475569" stroke-width="2"/><circle cx="42" cy="30" r="4" fill="%23ffffff"/></svg>`,
  },
  {
    id: 'saque-trueno',
    nombre: 'Saque Trueno',
    descripcion: 'Velocidad de reacción pura y dinamismo eléctrico',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <defs>
        <radialGradient id="grad-trueno" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stop-color="#38bdf8"/>
          <stop offset="60%" stop-color="#0284c7"/>
          <stop offset="100%" stop-color="#0f172a"/>
        </radialGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#grad-trueno)"/>
      <polygon points="54,18 32,48 48,48 42,82 72,46 54,46" fill="#facc15" stroke="#fef08a" stroke-width="2"/>
      <circle cx="68" cy="28" r="5" fill="#ffffff" stroke="#38bdf8" stroke-width="1.5"/>
    </svg>`,
    dataUrl: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><radialGradient id="grad-trueno" cx="50%" cy="50%" r="50%"><stop offset="0%" stop-color="%2338bdf8"/><stop offset="60%" stop-color="%230284c7"/><stop offset="100%" stop-color="%230f172a"/></radialGradient></defs><circle cx="50" cy="50" r="48" fill="url(%23grad-trueno)"/><polygon points="54,18 32,48 48,48 42,82 72,46 54,46" fill="%23facc15" stroke="%23fef08a" stroke-width="2"/><circle cx="68" cy="28" r="5" fill="%23ffffff" stroke="%2338bdf8" stroke-width="1.5"/></svg>`,
  },
]

/**
 * Valida un archivo de imagen antes de subirlo:
 * Formatos permitidos: JPG, PNG, WEBP.
 * Tamaño máximo: 3 MB.
 */
export const validarArchivoImagen = (archivo: File): { valido: boolean; error?: string } => {
  const tiposPermitidos = ['image/jpeg', 'image/png', 'image/webp']
  if (!tiposPermitidos.includes(archivo.type)) {
    return {
      valido: false,
      error: 'Formato no soportado. Por favor sube una imagen .jpg, .png o .webp.',
    }
  }

  const MAX_BYTES = 3 * 1024 * 1024 // 3 MB
  if (archivo.size > MAX_BYTES) {
    return {
      valido: false,
      error: 'La imagen supera el límite de 3MB. Por favor elige una imagen más ligera.',
    }
  }

  return { valido: true }
}

/** Carpeta del jugador en Storage (protegida por storage.rules: solo el dueño, imagen, <= 3 MB). */
const carpetaAvatar = (uid: string) => `usuarios/${uid}/`

/**
 * Indica si una URL de descarga apunta a un avatar subido por este usuario en Storage.
 * Las URLs de Firebase codifican la ruta como `/o/usuarios%2F{uid}%2F...`.
 */
const esAvatarPropioEnStorage = (uid: string, url?: string | null): boolean => {
  if (!url || !url.startsWith('https://')) return false
  try {
    const ruta = decodeURIComponent(new URL(url).pathname.split('/o/')[1] || '')
    return ruta.startsWith(carpetaAvatar(uid))
  } catch {
    return false
  }
}

/** Borra (best-effort) un avatar previo de Storage. Nunca lanza. */
export const eliminarAvatarStorage = async (uid: string, url?: string | null): Promise<void> => {
  if (!esAvatarPropioEnStorage(uid, url)) return
  try {
    await deleteObject(storageRef(storage, url!))
  } catch (err) {
    console.warn('No se pudo eliminar el avatar anterior de Storage:', err)
  }
}

/**
 * Sube la foto del jugador a Firebase Storage en la ruta:
 * usuarios/{uid}/avatar_{timestamp}.{ext}
 * y retorna la URL de descarga. El objeto anterior se elimina en `guardarFotoPerfilUsuario`
 * solo cuando Firestore confirmó la nueva foto.
 */
export const subirFotoPerfilStorage = async (uid: string, archivo: File): Promise<string> => {
  const validacion = validarArchivoImagen(archivo)
  if (!validacion.valido) {
    throw new Error(validacion.error)
  }

  const extension = (archivo.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg'
  const ruta = `${carpetaAvatar(uid)}avatar_${Date.now()}.${extension}`
  const storageReference = storageRef(storage, ruta)

  const snapshot = await uploadBytes(storageReference, archivo, {
    contentType: archivo.type,
  })

  return getDownloadURL(snapshot.ref)
}

/**
 * Actualiza la foto de perfil en la colección oficial 'usuarios' (fuente única de verdad).
 * - Si Firestore falla, se propaga el error, NO se toca localStorage y se elimina la
 *   foto recién subida (si se pasó) para no dejar archivos huérfanos.
 * - Si tiene éxito, se borra de Storage la foto anterior y se sincroniza localStorage.
 */
export const guardarFotoPerfilUsuario = async (
  uid: string,
  fotoUrl: string,
  fotoAnterior?: string | null,
): Promise<void> => {
  try {
    await updateDoc(doc(db, 'usuarios', uid), { fotoUrl: fotoUrl || '' })
  } catch (err) {
    if (fotoUrl && fotoUrl !== fotoAnterior) {
      await eliminarAvatarStorage(uid, fotoUrl)
    }
    throw err instanceof Error ? err : new Error('No se pudo guardar la foto de perfil.')
  }

  if (fotoAnterior && fotoAnterior !== fotoUrl) {
    await eliminarAvatarStorage(uid, fotoAnterior)
  }

  try {
    const raw = localStorage.getItem('spinapp_usuario')
    if (raw) {
      const u = JSON.parse(raw) as Usuario
      if (u && u.id === uid) {
        u.fotoUrl = fotoUrl
        localStorage.setItem('spinapp_usuario', JSON.stringify(u))
      }
    }
  } catch {
    // localStorage no disponible: el perfil remoto ya quedó actualizado
  }
}

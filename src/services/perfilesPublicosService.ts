import { collection, documentId, getDocs, query, where } from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { Usuario } from '@/types'

/**
 * Inscripciones, partidos y llaves de playoffs guardan una COPIA del nombre, teléfono y foto del
 * jugador del momento en que se crearon. Si el jugador edita su perfil, esas copias quedan viejas
 * (y las inscripciones solo las puede editar un admin). Este servicio lee los datos vigentes desde
 * 'usuarios' para mostrarlos encima de las copias.
 */

export interface PerfilPublico {
  nombre: string
  iniciales: string
  telefono: string
  fotoUrl?: string
}

const TTL_MS = 60 * 1000
const cache = new Map<string, { perfil: PerfilPublico | null; ts: number }>()

export const perfilDesdeUsuario = (u: Partial<Usuario>): PerfilPublico => ({
  nombre: `${u.nombre ?? ''} ${u.apellido ?? ''}`.trim() || 'Participante',
  iniciales: `${u.nombre?.[0] ?? 'J'}${u.apellido?.[0] ?? ''}`.toUpperCase(),
  telefono: u.telefono ?? '',
  fotoUrl: u.fotoUrl || undefined,
})

/** Olvida el perfil cacheado tras editarlo, para que la próxima lectura traiga el dato nuevo. */
export const invalidarPerfilEnCache = (uid: string): void => {
  cache.delete(uid)
}

/** Lee los perfiles vigentes de varios usuarios (consultas de 30 en 30, con caché de 60 s). */
export const obtenerPerfilesPublicos = async (ids: string[]): Promise<Map<string, PerfilPublico>> => {
  const resultado = new Map<string, PerfilPublico>()
  const ahora = Date.now()
  const faltantes: string[] = []

  for (const id of new Set(ids.filter(Boolean).map(String))) {
    const enCache = cache.get(id)
    if (enCache && ahora - enCache.ts < TTL_MS) {
      if (enCache.perfil) resultado.set(id, enCache.perfil)
    } else {
      faltantes.push(id)
    }
  }

  for (let i = 0; i < faltantes.length; i += 30) {
    const lote = faltantes.slice(i, i + 30)
    try {
      const snap = await getDocs(query(collection(db, 'usuarios'), where(documentId(), 'in', lote)))
      const encontrados = new Set<string>()
      snap.forEach((d) => {
        const perfil = perfilDesdeUsuario(d.data() as Partial<Usuario>)
        cache.set(d.id, { perfil, ts: ahora })
        resultado.set(d.id, perfil)
        encontrados.add(d.id)
      })
      // IDs sin documento (jugadores invitados, datos demo): se recuerdan para no reconsultar
      lote.filter((id) => !encontrados.has(id)).forEach((id) => cache.set(id, { perfil: null, ts: ahora }))
    } catch (err) {
      // Sin red o sin permisos: se muestran las copias guardadas, nunca se rompe la vista
      console.warn('[perfilesPublicos] No se pudieron leer perfiles vigentes:', err)
    }
  }

  return resultado
}

/**
 * Devuelve el objeto con nombre, iniciales, teléfono y foto vigentes del perfil (si existe).
 * Conserva todos los demás campos del objeto original.
 */
export const conPerfilVigente = <T extends { nombre?: string; iniciales?: string; telefono?: string; fotoUrl?: string | null }>(
  objeto: T,
  perfil: PerfilPublico | undefined,
): T => {
  if (!perfil) return objeto
  return {
    ...objeto,
    nombre: perfil.nombre,
    iniciales: perfil.iniciales,
    telefono: perfil.telefono || objeto.telefono,
    fotoUrl: perfil.fotoUrl,
  } as T
}

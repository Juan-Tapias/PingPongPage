import { ref, computed, onMounted, onUnmounted } from 'vue'
import {
  collection,
  onSnapshot,
  addDoc,
  doc,
  updateDoc,
  increment,
  query,
  orderBy,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/services/firebase'
import type { ClipBiblioteca, CategoriaClip } from '../types'

const CLIPS_INICIALES_DEMO: ClipBiblioteca[] = [
  {
    id: 'demo_clip_1',
    titulo: 'Defensa Épica y Remate Cruzado Ganador',
    descripcion: 'Punto decisivo con un intercambio de más de 14 golpes a máxima velocidad en la Mesa 1.',
    tipo: 'mejor_jugada',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    miniaturaUrl: 'https://images.unsplash.com/photo-1534158914592-062992fbe900?auto=format&fit=crop&w=800&q=80',
    duracionSegundos: 24,
    fechaCreacion: Date.now() - 1000 * 60 * 60 * 3,
    torneoNombre: 'Torneo Apertura 2026',
    mesa: 'Mesa 1',
    jugador1: { nombre: 'felipe corredor' },
    jugador2: { nombre: 'sara lozano' },
    marcadorMomento: 'Set 2 (10 - 9)',
    vistas: 42,
    likes: 18,
    creadorNombre: 'Cámara Mesa 1',
    creadorId: 'admin',
    esDemo: true,
  },
  {
    id: 'demo_clip_2',
    titulo: 'Saque As con Efecto Cortado Invertido',
    descripcion: 'Servicio indetectable al ángulo ciego que dejó sin opción de respuesta.',
    tipo: 'saque_as',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
    miniaturaUrl: 'https://images.unsplash.com/photo-1511067007770-3da7a935402b?auto=format&fit=crop&w=800&q=80',
    duracionSegundos: 16,
    fechaCreacion: Date.now() - 1000 * 60 * 60 * 8,
    torneoNombre: 'Torneo Apertura 2026',
    mesa: 'Mesa 1',
    jugador1: { nombre: 'felipe corredor' },
    jugador2: { nombre: 'sara lozano' },
    marcadorMomento: 'Set 1 (08 - 05)',
    vistas: 29,
    likes: 12,
    creadorNombre: 'Árbitro Mesa 1',
    creadorId: 'admin',
    esDemo: true,
  },
  {
    id: 'demo_clip_3',
    titulo: 'Match Point y Punto de Campeonato',
    descripcion: 'Punto de infarto que selló la victoria del set con ovación de los espectadores.',
    tipo: 'punto_campeonato',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    miniaturaUrl: 'https://images.unsplash.com/photo-1609710228159-0fa9bd7c0827?auto=format&fit=crop&w=800&q=80',
    duracionSegundos: 35,
    fechaCreacion: Date.now() - 1000 * 60 * 60 * 24,
    torneoNombre: 'Torneo Apertura 2026',
    mesa: 'Mesa 2',
    jugador1: { nombre: 'carlos mendoza' },
    jugador2: { nombre: 'mateo gómez' },
    marcadorMomento: 'Set 3 (11 - 10)',
    vistas: 87,
    likes: 34,
    creadorNombre: 'Transmisión Oficial',
    creadorId: 'admin',
    esDemo: true,
  },
  {
    id: 'demo_clip_4',
    titulo: 'Transmisión Completa: Gran Final de Grupo A',
    descripcion: 'Partido completo con comentarios en vivo, repeticiones y análisis de cada set.',
    tipo: 'transmision_completa',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
    miniaturaUrl: 'https://images.unsplash.com/photo-1544698310-74ea9d1c8258?auto=format&fit=crop&w=800&q=80',
    duracionSegundos: 215,
    fechaCreacion: Date.now() - 1000 * 60 * 60 * 48,
    torneoNombre: 'Torneo Apertura 2026',
    mesa: 'Mesa 1',
    jugador1: { nombre: 'felipe corredor' },
    jugador2: { nombre: 'sara lozano' },
    marcadorMomento: 'Final 2 - 1',
    vistas: 154,
    likes: 56,
    creadorNombre: 'Cámara Mesa 1',
    creadorId: 'admin',
    esDemo: true,
  },
]

export function useBibliotecaVideos() {
  const clips = ref<ClipBiblioteca[]>([...CLIPS_INICIALES_DEMO])
  const cargando = ref(true)
  const categoriaSeleccionada = ref<CategoriaClip>('todos')
  const busquedaTexto = ref('')
  const ordenSeleccionado = ref<'recientes' | 'vistas' | 'likes'>('recientes')

  let unsub: Unsubscribe | null = null

  const cargarClips = () => {
    cargando.value = true
    try {
      const coll = collection(db, 'biblioteca_videos')
      const q = query(coll, orderBy('fechaCreacion', 'desc'))

      unsub = onSnapshot(
        q,
        (snapshot) => {
          const remotos: ClipBiblioteca[] = []
          snapshot.forEach((d) => {
            remotos.push({ id: d.id, ...(d.data() as Omit<ClipBiblioteca, 'id'>) })
          })

          // Si hay remotos en Firestore, unirlos con los demos iniciales
          if (remotos.length > 0) {
            clips.value = [...remotos, ...CLIPS_INICIALES_DEMO]
          } else {
            // Cargar de localStorage si existen clips locales guardados
            const guardados = localStorage.getItem('biblioteca_clips_locales')
            if (guardados) {
              try {
                const parseados: ClipBiblioteca[] = JSON.parse(guardados)
                clips.value = [...parseados, ...CLIPS_INICIALES_DEMO]
              } catch {
                clips.value = [...CLIPS_INICIALES_DEMO]
              }
            } else {
              clips.value = [...CLIPS_INICIALES_DEMO]
            }
          }
          cargando.value = false
        },
        (err) => {
          console.warn('[useBibliotecaVideos] Fallback local para biblioteca_videos:', err.message)
          // Fallback seguro si la regla no está creada en Firestore
          const guardados = localStorage.getItem('biblioteca_clips_locales')
          if (guardados) {
            try {
              const parseados: ClipBiblioteca[] = JSON.parse(guardados)
              clips.value = [...parseados, ...CLIPS_INICIALES_DEMO]
            } catch {
              clips.value = [...CLIPS_INICIALES_DEMO]
            }
          }
          cargando.value = false
        },
      )
    } catch {
      cargando.value = false
    }
  }

  const clipsFiltrados = computed(() => {
    let lista = [...clips.value]

    // Filtro por categoría
    if (categoriaSeleccionada.value !== 'todos') {
      lista = lista.filter((c) => c.tipo === categoriaSeleccionada.value)
    }

    // Filtro por texto de búsqueda
    const q = busquedaTexto.value.toLowerCase().trim()
    if (q) {
      lista = lista.filter((c) => {
        return (
          c.titulo.toLowerCase().includes(q) ||
          c.descripcion?.toLowerCase().includes(q) ||
          c.torneoNombre?.toLowerCase().includes(q) ||
          c.mesa?.toLowerCase().includes(q) ||
          c.jugador1?.nombre.toLowerCase().includes(q) ||
          c.jugador2?.nombre.toLowerCase().includes(q)
        )
      })
    }

    // Ordenamiento
    if (ordenSeleccionado.value === 'vistas') {
      lista.sort((a, b) => b.vistas - a.vistas)
    } else if (ordenSeleccionado.value === 'likes') {
      lista.sort((a, b) => b.likes - a.likes)
    } else {
      lista.sort((a, b) => b.fechaCreacion - a.fechaCreacion)
    }

    return lista
  })

  const agregarClip = async (nuevo: Omit<ClipBiblioteca, 'id' | 'vistas' | 'likes' | 'fechaCreacion'>) => {
    const payload: Omit<ClipBiblioteca, 'id'> = {
      ...nuevo,
      vistas: 0,
      likes: 0,
      fechaCreacion: Date.now(),
    }

    try {
      const coll = collection(db, 'biblioteca_videos')
      const docRef = await addDoc(coll, payload)
      const creado: ClipBiblioteca = { id: docRef.id, ...payload }
      clips.value.unshift(creado)
      return creado
    } catch (err) {
      console.warn('[useBibliotecaVideos] Guardando clip en almacenamiento local por permisos:', err)
      const idLocal = `local_clip_${Date.now()}`
      const creado: ClipBiblioteca = { id: idLocal, ...payload }
      clips.value.unshift(creado)

      const guardadosRaw = localStorage.getItem('biblioteca_clips_locales')
      const guardados: ClipBiblioteca[] = guardadosRaw ? JSON.parse(guardadosRaw) : []
      guardados.unshift(creado)
      localStorage.setItem('biblioteca_clips_locales', JSON.stringify(guardados))
      return creado
    }
  }

  const incrementarVistas = async (clipId: string) => {
    const clip = clips.value.find((c) => c.id === clipId)
    if (clip) {
      clip.vistas += 1
    }
    try {
      if (!clipId.startsWith('demo_') && !clipId.startsWith('local_')) {
        await updateDoc(doc(db, 'biblioteca_videos', clipId), {
          vistas: increment(1),
        })
      }
    } catch {}
  }

  const darLike = async (clipId: string) => {
    const clip = clips.value.find((c) => c.id === clipId)
    if (clip) {
      clip.likes += 1
    }
    try {
      if (!clipId.startsWith('demo_') && !clipId.startsWith('local_')) {
        await updateDoc(doc(db, 'biblioteca_videos', clipId), {
          likes: increment(1),
        })
      }
    } catch {}
  }

  onMounted(() => {
    cargarClips()
  })

  onUnmounted(() => {
    if (unsub) {
      unsub()
      unsub = null
    }
  })

  return {
    clips,
    clipsFiltrados,
    cargando,
    categoriaSeleccionada,
    busquedaTexto,
    ordenSeleccionado,
    agregarClip,
    incrementarVistas,
    darLike,
  }
}

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

// Limpieza de datos demo antiguos en localStorage si existieran
if (typeof window !== 'undefined') {
  try {
    const guardadosRaw = localStorage.getItem('biblioteca_clips_locales')
    if (guardadosRaw) {
      const parseados: ClipBiblioteca[] = JSON.parse(guardadosRaw)
      const limpios = parseados.filter((c) => !c.esDemo && !c.id.startsWith('demo_'))
      localStorage.setItem('biblioteca_clips_locales', JSON.stringify(limpios))
    }
  } catch {}
}

export function useBibliotecaVideos() {
  const clips = ref<ClipBiblioteca[]>([])
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
            const data = d.data() as Omit<ClipBiblioteca, 'id'>
            if (!data.esDemo && !d.id.startsWith('demo_')) {
              remotos.push({ id: d.id, ...data })
            }
          })

          if (remotos.length > 0) {
            clips.value = remotos
          } else {
            // Cargar de localStorage si existen clips locales guardados por el usuario
            const guardados = localStorage.getItem('biblioteca_clips_locales')
            if (guardados) {
              try {
                const parseados: ClipBiblioteca[] = JSON.parse(guardados)
                clips.value = parseados.filter((c) => !c.esDemo && !c.id.startsWith('demo_'))
              } catch {
                clips.value = []
              }
            } else {
              clips.value = []
            }
          }
          cargando.value = false
        },
        (err) => {
          console.warn('[useBibliotecaVideos] Fallback local para biblioteca_videos:', err.message)
          const guardados = localStorage.getItem('biblioteca_clips_locales')
          if (guardados) {
            try {
              const parseados: ClipBiblioteca[] = JSON.parse(guardados)
              clips.value = parseados.filter((c) => !c.esDemo && !c.id.startsWith('demo_'))
            } catch {
              clips.value = []
            }
          } else {
            clips.value = []
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

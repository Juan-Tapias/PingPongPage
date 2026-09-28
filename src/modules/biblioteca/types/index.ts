export type CategoriaClip =
  | 'todos'
  | 'transmision_completa'
  | 'mejor_jugada'
  | 'saque_as'
  | 'punto_campeonato'

export interface JugadorClip {
  id?: string
  nombre: string
}

export interface ClipBiblioteca {
  id: string
  titulo: string
  descripcion?: string
  tipo: 'transmision_completa' | 'mejor_jugada' | 'saque_as' | 'punto_campeonato'
  videoUrl: string
  miniaturaUrl?: string
  duracionSegundos: number
  fechaCreacion: number
  torneoId?: string
  torneoNombre?: string
  partidoId?: string
  mesa?: string
  jugador1?: JugadorClip
  jugador2?: JugadorClip
  marcadorMomento?: string
  vistas: number
  likes: number
  creadorNombre: string
  creadorId: string
  esDemo?: boolean
}

export type TipoUsuario = 'camper' | 'trabajador'
export type RolUsuario = 'admin' | 'jugador'

export interface Usuario {
  id: string
  nombre: string
  apellido: string
  email: string
  telefono: string
  tipo: TipoUsuario
  rol: RolUsuario
  createdAt: number
}

export interface CredencialesLogin {
  email: string
  password: string
}

export interface DatosRegistro {
  nombre: string
  apellido: string
  email: string
  telefono: string
  tipo: TipoUsuario
  password: string
  confirmPassword: string
}

// ==========================================
// TIPOS DE TORNEOS Y VISTA DE JUGADOR
// ==========================================

export type EstadoTorneo = 'en curso' | 'finalizado' | 'por iniciar'

export interface Torneo {
  id: string
  nombre: string
  organizador: string
  fechaInicio: string
  estado: EstadoTorneo
  costoInscripcion: number
  fechaLimiteInscripcion: string
  numeroCuenta: string
  whatsappContacto: string
  estaInscrito?: boolean

  descripcion?: string
  categoria?: string
  modalidad?: string
  sede?: string
  cuposTomados?: number
  cuposTotales?: number
  subestado?: 'INSCRITO' | 'CONFIRMADO' | 'COMPLETADO' | 'PENDIENTE'
  mesaAsignada?: string
  sorteoLlaves?: string
  posicionFinal?: string
}

// ==========================================
// PARTICIPACIÓN EN TORNEO: RUEDA RADIAL Y POSICIONES
// ==========================================

export type ResultadoPartido = 'ganado' | 'perdido' | 'pendiente'

export interface JugadorTorneo {
  id: string
  nombre: string
  iniciales: string
  telefono: string
  esUsuarioActual?: boolean
}

export interface PartidoGrupo {
  id: string
  jugador1Id: string
  jugador2Id: string
  jugadorGanadorId?: string
  marcador?: string          // ej: "3 - 1"
  marcadorDetallado?: string // ej: "11-8, 9-11, 11-7, 11-9"
  estado: 'jugado' | 'pendiente'
  diasRestantes: number      // 2: "2 días", 1: "1 día", <= 0: "Partido perdido"
  ronda?: number
}

export interface BurbujaRival {
  jugador: JugadorTorneo
  partido: PartidoGrupo
  resultadoParaCentro: ResultadoPartido // Verde (ganó centro), Rojo (perdió centro), Gris (no jugado)
  esRivalDeTurno: boolean              // A las 12 en punto
  diasRestantes: number
  marcador?: string
  ganadorNombre?: string
}

export interface FilaPosicion {
  posicion: number
  jugadorId: string
  nombre: string
  pj: number      // Partidos jugados
  pg: number      // Partidos ganados
  pp: number      // Partidos perdidos
  sf: number      // Sets a favor
  sc: number      // Sets en contra
  puntos: number
  esUsuarioActual?: boolean
}
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
export type EstadoPartido = 'pendiente' | 'en_curso' | 'pendiente_admin' | 'jugado'
export type ColorBordeBurbuja = 'verde' | 'rojo' | 'azul_pulsante' | 'naranja' | 'gris'

export interface JugadorTorneo {
  id: string
  nombre: string
  iniciales: string
  telefono: string
  tipo?: TipoUsuario
  esUsuarioActual?: boolean
}

export interface SetPartido {
  setNumero: number
  puntosJugador1: number
  puntosJugador2: number
  mallasJugador1: number
  mallasJugador2: number
  ganadorId?: string
}

export interface PartidoGrupo {
  id: string
  jugador1Id: string
  jugador2Id: string
  jugadorGanadorId?: string
  marcador?: string          // ej: "2 - 1"
  marcadorDetallado?: string // ej: "11-8, 9-11, 11-7"
  estado: EstadoPartido      // 'pendiente' | 'en_curso' | 'pendiente_admin' | 'jugado'
  diasRestantes: number      // 2: "2 días", 1: "1 día", <= 0: "pendiente_admin"
  ronda?: number
  jornada?: number           // Ronda del fixture (Algoritmo Berger)
  esBye?: boolean            // Fecha libre por ser número impar de jugadores
  enVivo?: boolean           // Partido disputándose actualmente
  arbitroActivoId?: string   // Árbitro activo con candado de edición
  totalEspectadores?: number // Cantidad de espectadores en tiempo real
  // Seguridad y arbitraje
  codigoJugador1?: string    // PIN de 5 dígitos dinámico por rival
  codigoJugador2?: string    // PIN de 5 dígitos dinámico por rival
  arbitroId?: string         // Id del jugador que oficia como árbitro
  sets?: SetPartido[]        // Historial de sets jugados (mejor de 3)
}

export interface BurbujaRival {
  jugador: JugadorTorneo
  partido: PartidoGrupo
  resultadoParaCentro: ResultadoPartido // Verde (ganó centro), Rojo (perdió centro), Gris (no jugado)
  estadoPartido: EstadoPartido
  colorBorde: ColorBordeBurbuja        // 'verde' | 'rojo' | 'azul_pulsante' | 'naranja' | 'gris'
  esRivalDeTurno: boolean              // A las 12 en punto
  diasRestantes: number
  marcador?: string
  ganadorNombre?: string
  codigoSeguridadPropio?: string       // Código de 5 dígitos que este jugador debe dictarle al árbitro
}

export interface PartidoArbitrable {
  partido: PartidoGrupo
  jugador1: JugadorTorneo
  jugador2: JugadorTorneo
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

// ==========================================
// FASE 2: ELIMINATORIAS EN CÍRCULOS CONCÉNTRICOS
// ==========================================

export type FaseTorneo = 'grupos' | 'playoffs'

export type RondaPlayoff = 'play_in' | 'cuartos' | 'semifinal' | 'final'

export interface PartidoPlayoff {
  id: string
  ronda: RondaPlayoff
  numeroLlave: number          // 1 a 4 en play-in y cuartos, 1 a 2 en semis, 1 en final
  jugador1?: JugadorTorneo
  jugador2?: JugadorTorneo
  ganadorId?: string
  marcador?: string            // ej: "2 - 1"
  marcadorDetallado?: string
  estado: EstadoPartido        // 'pendiente' | 'en_curso' | 'pendiente_admin' | 'jugado'
  esBye?: boolean              // Fecha libre directa para puestos 1 a 4
  anilloOrbital: 3 | 2 | 1     // 3: Exterior (Play-in), 2: Medio (Cuartos/Semis), 1: Núcleo (Final)
  siguientePartidoId?: string  // Llave a la que avanza el ganador
}

export interface CuadroPlayoffs {
  playIn: PartidoPlayoff[]     // Anillo 3 (Puestos 5 al 12)
  cuartos: PartidoPlayoff[]    // Anillo 2 (Top 1-4 con BYE + Ganadores Play-in)
  semifinales: PartidoPlayoff[]// Anillo 2 interior
  granFinal: PartidoPlayoff    // Anillo 1 (El Núcleo hacia la Corona)
  campeon?: JugadorTorneo
  bolsaPremio: number          // $90.000 COP (100% de la bolsa acumulada)
}
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
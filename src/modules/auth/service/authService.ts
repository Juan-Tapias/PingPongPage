import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  type UserCredential,
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/services/firebase'
import type { Usuario, CredencialesLogin, DatosRegistro } from '@/types'

export const formatearErrorAuth = (codigo: string): string => {
  switch (codigo) {
    case 'auth/email-already-in-use':
      return 'Este correo ya se encuentra registrado.'
    case 'auth/invalid-email':
      return 'El formato del correo electrónico no es válido.'
    case 'auth/user-not-found':
      return 'No existe una cuenta registrada con este correo.'
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'Correo o contraseña incorrectos.'
    case 'auth/weak-password':
      return 'La contraseña debe tener al menos 6 caracteres.'
    case 'auth/too-many-requests':
      return 'Demasiados intentos fallidos. Inténtalo más tarde.'
    case 'auth/configuration-not-found':
      return 'El proveedor de Correo/Contraseña no está habilitado'
    default:
      return 'Ocurrió un error inesperado al autenticar. Inténtalo de nuevo.'
  }
}

export const registrarUsuario = async (datos: DatosRegistro): Promise<Usuario> => {
  if (datos.password !== datos.confirmPassword) {
    throw new Error('Las contraseñas no coinciden.')
  }

  const credencial: UserCredential = await createUserWithEmailAndPassword(
    auth,
    datos.email.trim(),
    datos.password,
  )

  const nuevoUsuario: Usuario = {
    id: credencial.user.uid,
    nombre: datos.nombre.trim(),
    apellido: datos.apellido.trim(),
    email: datos.email.trim().toLowerCase(),
    telefono: datos.telefono.trim(),
    tipo: datos.tipo,
    rol: 'jugador',
    createdAt: Date.now(),
  }

  await setDoc(doc(db, 'usuarios', nuevoUsuario.id), nuevoUsuario)

  return nuevoUsuario
}

export const iniciarSesion = async (credenciales: CredencialesLogin): Promise<Usuario> => {
  const credencial: UserCredential = await signInWithEmailAndPassword(
    auth,
    credenciales.email.trim(),
    credenciales.password,
  )

  const docSnap = await getDoc(doc(db, 'usuarios', credencial.user.uid))

  if (!docSnap.exists()) {
    throw new Error('El perfil de usuario no se encuentra en la base de datos.')
  }

  return docSnap.data() as Usuario
}

export const cerrarSesion = async (): Promise<void> => {
  await signOut(auth)
}

export const obtenerPerfilUsuario = async (uid: string): Promise<Usuario | null> => {
  const docSnap = await getDoc(doc(db, 'usuarios', uid))
  if (!docSnap.exists()) return null
  return docSnap.data() as Usuario
}

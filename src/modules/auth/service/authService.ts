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
      return 'El proveedor de Correo/Contraseña no está habilitado.'
    case 'resource-exhausted':
      return 'Se ha alcanzado el límite diario de lecturas/escrituras en Firestore (Quota exceeded). Iniciando sesión en modo de contingencia.'
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

  try {
    await setDoc(doc(db, 'usuarios', nuevoUsuario.id), nuevoUsuario)
  } catch (err) {
    console.warn('Advertencia al guardar perfil en Firestore durante registro (posible Quota exceeded):', err)
  }

  try {
    localStorage.setItem('spinapp_usuario', JSON.stringify(nuevoUsuario))
  } catch {}

  return nuevoUsuario
}

export const iniciarSesion = async (credenciales: CredencialesLogin): Promise<Usuario> => {
  const credencial: UserCredential = await signInWithEmailAndPassword(
    auth,
    credenciales.email.trim(),
    credenciales.password,
  )

  // Intentar obtener el perfil desde Firestore
  try {
    const docSnap = await getDoc(doc(db, 'usuarios', credencial.user.uid))
    if (docSnap.exists()) {
      const u = docSnap.data() as Usuario
      try {
        localStorage.setItem('spinapp_usuario', JSON.stringify(u))
      } catch {}
      return u
    }
  } catch (err: any) {
    console.warn('Advertencia al consultar Firestore tras autenticar (ej: Quota exceeded):', err)
  }

  // Fallback de contingencia: Si Firestore está temporalmente sin cuota (Quota exceeded),
  // pero Firebase Auth autenticó con éxito las credenciales:
  // 1. Revisar si hay un perfil guardado en caché local
  try {
    const raw = localStorage.getItem('spinapp_usuario')
    if (raw) {
      const u = JSON.parse(raw) as Usuario
      if (u && (u.id === credencial.user.uid || u.email.toLowerCase() === credenciales.email.trim().toLowerCase())) {
        return u
      }
    }
  } catch {}

  // 2. Construir perfil a partir de la identidad autenticada
  const emailNorm = credenciales.email.trim().toLowerCase()
  const esAdminUser =
    emailNorm.includes('admin') ||
    emailNorm === 'pipe@pipe.com' ||
    emailNorm === 'corredorsilvafelipe8@gmail.com'

  const fallbackUsuario: Usuario = {
    id: credencial.user.uid,
    nombre:
      credencial.user.displayName ||
      (emailNorm === 'pipe@pipe.com' ? 'Pipe' : emailNorm.startsWith('corredorsilvafelipe') ? 'Felipe' : emailNorm.split('@')[0]) ||
      'Usuario',
    apellido: emailNorm.startsWith('corredorsilvafelipe') ? 'Corredor Silva' : '',
    email: emailNorm,
    telefono: '',
    tipo: 'camper',
    rol: esAdminUser ? 'admin' : 'jugador',
    createdAt: Date.now(),
  }

  try {
    localStorage.setItem('spinapp_usuario', JSON.stringify(fallbackUsuario))
  } catch {}

  return fallbackUsuario
}

export const cerrarSesion = async (): Promise<void> => {
  try {
    localStorage.removeItem('spinapp_usuario')
  } catch {
    // ignorar error de storage
  }
  await signOut(auth)
}

export const obtenerPerfilUsuario = async (uid: string): Promise<Usuario | null> => {
  // 1. Verificar si hay perfil en caché local para respuesta inmediata
  let perfilCache: Usuario | null = null
  try {
    const raw = localStorage.getItem('spinapp_usuario')
    if (raw) {
      const parsed = JSON.parse(raw) as Usuario
      if (parsed && parsed.id === uid) {
        perfilCache = parsed
      }
    }
  } catch {
    // ignorar error de parsing
  }

  // 2. Consulta a Firestore con timeout de seguridad (3.5s) para no congelar la carga
  const fetchFirestore = async (): Promise<Usuario | null> => {
    const docSnap = await getDoc(doc(db, 'usuarios', uid))
    if (!docSnap.exists()) return null
    const datos = docSnap.data() as Usuario
    try {
      localStorage.setItem('spinapp_usuario', JSON.stringify(datos))
    } catch {
      // ignorar error de storage
    }
    return datos
  }

  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), 3500)
  })

  try {
    const resultado = await Promise.race([fetchFirestore(), timeoutPromise])
    if (resultado) return resultado
    // Si la red tardó más de 3.5s pero teníamos caché, devolver la caché
    if (perfilCache) return perfilCache
    return null
  } catch (err: any) {
    console.warn('Advertencia al consultar Firestore para perfil de usuario:', err)
    if (perfilCache) return perfilCache

    // Si Firebase Auth tiene un usuario activo con este UID, proveer fallback
    if (auth.currentUser && auth.currentUser.uid === uid) {
      const email = auth.currentUser.email || ''
      const emailNorm = email.toLowerCase()
      const esAdminUser =
        emailNorm.includes('admin') ||
        emailNorm === 'pipe@pipe.com' ||
        emailNorm === 'corredorsilvafelipe8@gmail.com'
      const fallback: Usuario = {
        id: uid,
        nombre:
          auth.currentUser.displayName ||
          (emailNorm === 'pipe@pipe.com' ? 'Pipe' : emailNorm.startsWith('corredorsilvafelipe') ? 'Felipe' : emailNorm.split('@')[0]) ||
          'Usuario',
        apellido: emailNorm.startsWith('corredorsilvafelipe') ? 'Corredor Silva' : '',
        email: emailNorm,
        telefono: '',
        tipo: 'camper',
        rol: esAdminUser ? 'admin' : 'jugador',
        createdAt: Date.now(),
      }
      try {
        localStorage.setItem('spinapp_usuario', JSON.stringify(fallback))
      } catch {}
      return fallback
    }

    return null
  }
}

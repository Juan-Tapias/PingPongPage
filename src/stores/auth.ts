import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Usuario, CredencialesLogin, DatosRegistro } from '@/types'
import {
  iniciarSesion as apiLogin,
  registrarUsuario as apiRegister,
  cerrarSesion as apiLogout,
  obtenerPerfilUsuario,
  formatearErrorAuth,
} from '@/modules/auth/service/authService'
import { onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/services/firebase'

export const useAuthStore = defineStore('auth', () => {
  // Hidratación instantánea desde caché local para evitar esperas y parpadeos
  let usuarioInicial: Usuario | null = null
  try {
    const raw = localStorage.getItem('spinapp_usuario')
    if (raw) {
      usuarioInicial = JSON.parse(raw) as Usuario
    }
  } catch {
    usuarioInicial = null
  }

  const usuario = ref<Usuario | null>(usuarioInicial)
  const cargando = ref<boolean>(false)
  const inicializando = ref<boolean>(!usuarioInicial)
  const errorAuth = ref<string | null>(null)

  const estaAutenticado = computed(() => !!usuario.value)
  const esAdmin = computed(() => usuario.value?.rol === 'admin')

  let resolverInicializacion: (() => void) | null = null
  const promesaInicializacion = new Promise<void>((resolve) => {
    resolverInicializacion = resolve
  })

  // Timeout de seguridad: Si Firebase tarda más de 3 segundos, desbloquear el router
  setTimeout(() => {
    if (inicializando.value) {
      console.warn('Timeout de inicialización de Firebase Auth alcanzado. Desbloqueando navegación.')
      inicializando.value = false
      if (resolverInicializacion) {
        resolverInicializacion()
        resolverInicializacion = null
      }
    }
  }, 3000)

  const inicializarAuth = () => {
    onAuthStateChanged(auth, async (userFirebase) => {
      try {
        if (userFirebase) {
          const perfil = await obtenerPerfilUsuario(userFirebase.uid)
          if (perfil) {
            usuario.value = perfil
            try {
              localStorage.setItem('spinapp_usuario', JSON.stringify(perfil))
            } catch {
              // ignorar error de storage
            }
          } else if (!usuario.value) {
            usuario.value = null
          }
        } else {
          usuario.value = null
          try {
            localStorage.removeItem('spinapp_usuario')
          } catch {
            // ignorar error de storage
          }
        }
      } catch (err: unknown) {
        console.error('Error al recuperar perfil del usuario:', err)
        if (!usuario.value) {
          usuario.value = null
        }
      } finally {
        inicializando.value = false
        if (resolverInicializacion) {
          resolverInicializacion()
          resolverInicializacion = null
        }
      }
    })
  }

  const esperarInicializacion = () => {
    if (!inicializando.value) return Promise.resolve()
    return Promise.race([
      promesaInicializacion,
      new Promise<void>((resolve) => setTimeout(resolve, 3000)),
    ])
  }

  const login = async (credenciales: CredencialesLogin) => {
    cargando.value = true
    errorAuth.value = null
    try {
      usuario.value = await apiLogin(credenciales)
      return usuario.value
    } catch (err: unknown) {
      const codigo = (err as { code?: string })?.code
      if (codigo) {
        errorAuth.value = formatearErrorAuth(codigo)
      } else if (err instanceof Error) {
        errorAuth.value = err.message
      } else {
        errorAuth.value = 'Ocurrió un error inesperado al autenticar. Inténtalo de nuevo.'
      }
      throw errorAuth.value
    } finally {
      cargando.value = false
    }
  }

  const registro = async (datos: DatosRegistro) => {
    cargando.value = true
    errorAuth.value = null
    try {
      usuario.value = await apiRegister(datos)
      return usuario.value
    } catch (err: unknown) {
      const codigo = (err as { code?: string })?.code
      if (codigo) {
        errorAuth.value = formatearErrorAuth(codigo)
      } else if (err instanceof Error) {
        errorAuth.value = err.message
      } else {
        errorAuth.value = 'Ocurrió un error inesperado al registrar. Inténtalo de nuevo.'
      }
      throw errorAuth.value
    } finally {
      cargando.value = false
    }
  }

  const logout = async () => {
    try {
      await apiLogout()
    } catch {
      // Manejo de error al cerrar sesión
    }
    usuario.value = null
  }

  return {
    usuario,
    cargando,
    inicializando,
    errorAuth,
    estaAutenticado,
    esAdmin,
    inicializarAuth,
    esperarInicializacion,
    login,
    registro,
    logout,
  }
})

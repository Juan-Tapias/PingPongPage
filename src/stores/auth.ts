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
  const usuario = ref<Usuario | null>(null)
  const cargando = ref<boolean>(false)
  const inicializando = ref<boolean>(true)
  const errorAuth = ref<string | null>(null)

  const estaAutenticado = computed(() => !!usuario.value)
  const esAdmin = computed(() => usuario.value?.rol === 'admin')

  const inicializarAuth = () => {
    onAuthStateChanged(auth, async (userFirebase) => {
      try {
        if (userFirebase) {
          usuario.value = await obtenerPerfilUsuario(userFirebase.uid)
        } else {
          usuario.value = null
        }
      } catch (err: unknown) {
        console.error('Error al recuperar perfil del usuario:', err)
        usuario.value = null
      } finally {
        inicializando.value = false
      }
    })
  }

  const loginDemoAdmin = () => {
    cargando.value = true
    errorAuth.value = null
    usuario.value = {
      id: 'admin-campuslands-1',
      nombre: 'Juan Sebastián',
      apellido: 'Tapias',
      email: 'admin@campuslands.com',
      telefono: '300 123 4567',
      tipo: 'trabajador',
      rol: 'admin',
      createdAt: Date.now(),
    }
    cargando.value = false
    return usuario.value
  }

  const loginDemoJugador = () => {
    cargando.value = true
    errorAuth.value = null
    usuario.value = {
      id: 'j-yo',
      nombre: 'Sebastián',
      apellido: 'Tapias',
      email: 'jugador@campuslands.com',
      telefono: '310 987 6543',
      tipo: 'camper',
      rol: 'jugador',
      createdAt: Date.now(),
    }
    cargando.value = false
    return usuario.value
  }

  const login = async (credenciales: CredencialesLogin) => {
    cargando.value = true
    errorAuth.value = null
    try {
      // Soporte para credencial demo de Administrador directa
      if (credenciales.email.trim().toLowerCase() === 'admin@campuslands.com') {
        return loginDemoAdmin()
      }

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
      // En caso de sesión demo
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
    login,
    loginDemoAdmin,
    loginDemoJugador,
    registro,
    logout,
  }
})

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
    await apiLogout()
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
    registro,
    logout,
  }
})

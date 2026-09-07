import { ref } from 'vue'

const THEME_KEY = 'spinapp-theme'
const isDark = ref<boolean>(true) // Por defecto en modo oscuro olímpico

export function useTheme() {
  const initTheme = () => {
    const saved = localStorage.getItem(THEME_KEY)
    if (saved) {
      isDark.value = saved === 'dark'
    } else {
      isDark.value = true // Default dark mode para la experiencia deportiva
    }
    applyTheme()
  }

  const applyTheme = () => {
    const root = document.documentElement
    if (isDark.value) {
      root.classList.add('dark')
      root.setAttribute('data-theme', 'dark')
    } else {
      root.classList.remove('dark')
      root.setAttribute('data-theme', 'light')
    }
    localStorage.setItem(THEME_KEY, isDark.value ? 'dark' : 'light')
  }

  const toggleTheme = () => {
    isDark.value = !isDark.value
    applyTheme()
  }

  return {
    isDark,
    initTheme,
    toggleTheme,
  }
}

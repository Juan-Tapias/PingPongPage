import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Torneo } from '@/types'
import { suscribirTorneosEnVivoDB } from '@/services/torneoDatabaseService'

/**
 * Store compartido de torneos con transmisión en vivo.
 * Mantiene UNA sola suscripción filtrada (where transmisionEnVivoActiva == true)
 * aunque varios componentes (Navbar, Dashboard) la consuman.
 */
export const useTorneosEnVivoStore = defineStore('torneosEnVivo', () => {
  const torneosEnVivo = ref<Torneo[]>([])
  const error = ref<string | null>(null)
  let unsubscribe: (() => void) | null = null
  let consumidores = 0

  const hayTransmisiones = computed(() => torneosEnVivo.value.length > 0)

  const iniciar = () => {
    consumidores++
    if (unsubscribe) return
    try {
      unsubscribe = suscribirTorneosEnVivoDB(
        (lista) => {
          torneosEnVivo.value = lista
          error.value = null
        },
        (err) => {
          error.value = err.message
        },
      )
    } catch (err) {
      console.warn('No se pudo suscribir a torneos en vivo:', err)
    }
  }

  const detener = () => {
    consumidores = Math.max(0, consumidores - 1)
    if (consumidores === 0 && unsubscribe) {
      unsubscribe()
      unsubscribe = null
    }
  }

  return { torneosEnVivo, hayTransmisiones, error, iniciar, detener }
})

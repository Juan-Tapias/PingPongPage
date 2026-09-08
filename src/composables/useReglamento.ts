import { ref } from 'vue'

const modalReglamentoVisible = ref(false)

export const useReglamento = () => {
  const abrirReglamento = () => {
    modalReglamentoVisible.value = true
  }

  const cerrarReglamento = () => {
    modalReglamentoVisible.value = false
  }

  return {
    modalReglamentoVisible,
    abrirReglamento,
    cerrarReglamento,
  }
}

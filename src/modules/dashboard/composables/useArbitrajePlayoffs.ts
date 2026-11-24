import { computed, type Ref } from 'vue'
import type { MarcadorEnVivo, PartidoArbitrable, PartidoPlayoff, SetPartido, Torneo } from '@/types'
import { useAuthStore } from '@/stores/auth'
import {
  actualizarLlavePlayoffDB,
  actualizarMarcadorEnVivoDB,
  resolverPartidoPlayoffDB,
} from '@/services/torneoDatabaseService'
import { resolverAvancePlayoff } from '@/services/torneoAlgoritmos'
import {
  esIdPartidoPlayoff,
  llavesArbitrables,
  marcadorPlayoffDesdeResultado,
  validarPinsPlayoff,
} from '@/services/arbitrajePlayoffs'

const MENSAJE_SIN_PERMISO =
  'Firestore rechazó la escritura de la llave: faltan las reglas de arbitraje de eliminatorias. ' +
  'El admin debe desplegarlas (firebase deploy --only firestore:rules).'

const traducirError = (err: any): Error => {
  if (err?.code === 'permission-denied') return new Error(MENSAJE_SIN_PERMISO)
  return err instanceof Error ? err : new Error(err?.message || 'No se pudo guardar la llave.')
}

export interface DatosResultadoLlave {
  esWalkover?: boolean
  marcadorDetallado?: string
  perdedorPorWId?: string
  motivoWO?: string
  ganadorBolaId?: string | null
}

/**
 * Arbitraje de llaves de eliminatorias desde la vista del jugador: mismo flujo que la fase de
 * grupos (PINs de ambos jugadores → marcador virtual), pero el resultado se resuelve con
 * `resolverAvancePlayoff` y el ganador avanza a la siguiente llave en una transacción.
 */
export function useArbitrajePlayoffs(opciones: {
  /** Llaves tal como están en Firestore (usePlayoffs().partidosOficiales). */
  llaves: Ref<PartidoPlayoff[]>
  torneo: () => Torneo | null | undefined
  arbitroId: () => string | undefined
}) {
  const authStore = useAuthStore()
  const esAdmin = () => Boolean(authStore.esAdmin || authStore.usuario?.rol === 'admin')

  const arbitrables = computed<PartidoArbitrable[]>(() =>
    llavesArbitrables(opciones.llaves.value, opciones.arbitroId(), { esAdmin: esAdmin() }),
  )

  const buscar = (llaveId: string) => opciones.llaves.value.find((p) => p.id === llaveId)

  const esLlave = (partidoId?: string | null) => esIdPartidoPlayoff(partidoId)

  /** Valida los PINs de la llave y la marca 'en_curso' a nombre del árbitro. */
  const validarCodigos = async (
    llaveId: string,
    codigo1: string,
    codigo2: string,
  ): Promise<{ valido: boolean; mensaje: string }> => {
    const llave = buscar(llaveId)
    if (!llave) return { valido: false, mensaje: 'La llave no existe en el cuadro de eliminatorias.' }
    if (llave.estado === 'jugado') return { valido: false, mensaje: 'Esta llave ya tiene un resultado registrado.' }
    if (!validarPinsPlayoff(llave, codigo1, codigo2) && !esAdmin()) {
      return {
        valido: false,
        mensaje: 'Los PINs no coinciden. Cada jugador ve el PIN de esta llave en su vista Fase 2.',
      }
    }

    const mesa = llave.mesa || `Mesa ${llave.numeroLlave}`
    const marcadorInicial: MarcadorEnVivo = llave.marcadorEnVivo || {
      puntosJ1: 0,
      puntosJ2: 0,
      setActual: 'Set 1',
      numeroSet: 1,
      setsGanadosJ1: 0,
      setsGanadosJ2: 0,
      mesa,
      servidorActual: 1,
      actualizadoEn: Date.now(),
    }

    try {
      await actualizarLlavePlayoffDB(llave.id, {
        estado: 'en_curso',
        arbitroActivoId: opciones.arbitroId() || null,
        mesa,
        marcadorEnVivo: { ...marcadorInicial, actualizadoEn: Date.now() },
      })
      return { valido: true, mensaje: 'Acceso autorizado. Abriendo marcador virtual...' }
    } catch (err) {
      console.error('Error al tomar la llave de playoffs:', err)
      return { valido: false, mensaje: traducirError(err).message }
    }
  }

  const actualizarMarcador = (llaveId: string, marcador: MarcadorEnVivo) =>
    actualizarMarcadorEnVivoDB(llaveId, marcador)

  /**
   * Registra el resultado de la llave y avanza al ganador. Devuelve los cambios del torneo
   * cuando la llave era la Gran Final (campeón coronado).
   */
  const registrarResultado = async (
    llaveId: string,
    sets: SetPartido[],
    ganadorId: string,
    datos: DatosResultadoLlave = {},
  ): Promise<Partial<Torneo> | null> => {
    const torneoId = opciones.torneo()?.id
    const llave = buscar(llaveId)
    if (!torneoId || !llave) throw new Error('La llave no existe en el cuadro de eliminatorias.')

    const { s1, s2 } = marcadorPlayoffDesdeResultado(llave, sets, ganadorId, datos.esWalkover)
    const detalle = datos.esWalkover ? `W.O.${datos.motivoWO ? ` (${datos.motivoWO})` : ''}` : datos.marcadorDetallado
    const { actualizaciones, campeon } = resolverAvancePlayoff(opciones.llaves.value, llaveId, s1, s2, detalle)

    const principal = actualizaciones[0]!
    principal.datos = {
      ...principal.datos,
      sets,
      esWalkover: Boolean(datos.esWalkover),
      perdedorPorWId: datos.esWalkover ? datos.perdedorPorWId || null : null,
      motivoWO: datos.esWalkover ? datos.motivoWO || null : null,
      ganadorBolaId: datos.ganadorBolaId ?? null,
      arbitroId: opciones.arbitroId() || null,
      arbitroActivoId: null,
      marcadorEnVivo: null,
    }

    try {
      return await resolverPartidoPlayoffDB(torneoId, actualizaciones, campeon)
    } catch (err) {
      throw traducirError(err)
    }
  }

  const declararWalkover = (llaveId: string, ganadorId: string, perdedorId: string, motivo: string) =>
    registrarResultado(llaveId, [], ganadorId, { esWalkover: true, perdedorPorWId: perdedorId, motivoWO: motivo })

  return {
    arbitrables,
    esLlave,
    validarCodigos,
    actualizarMarcador,
    registrarResultado,
    declararWalkover,
  }
}

import { describe, it, expect, vi, beforeEach } from 'vitest'

const m = vi.hoisted(() => ({ getDocs: vi.fn() }))

vi.mock('@/services/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  collection: () => ({}),
  documentId: () => '__name__',
  where: (_c: string, _op: string, ids: string[]) => ({ ids }),
  query: (_c: unknown, w: { ids: string[] }) => w,
  getDocs: m.getDocs,
}))

import {
  obtenerPerfilesPublicos,
  conPerfilVigente,
  invalidarPerfilEnCache,
} from './perfilesPublicosService'

const snapCon = (docs: { id: string; data: Record<string, unknown> }[]) => ({
  forEach: (fn: (d: { id: string; data: () => Record<string, unknown> }) => void) =>
    docs.forEach((d) => fn({ id: d.id, data: () => d.data })),
})

beforeEach(() => {
  vi.clearAllMocks()
  ;['u1', 'u2', 'fantasma'].forEach(invalidarPerfilEnCache)
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

describe('perfilesPublicosService', () => {
  it('lee el perfil vigente y reemplaza la copia vieja de la inscripción', async () => {
    m.getDocs.mockResolvedValue(
      snapCon([{ id: 'u1', data: { nombre: 'Felipe', apellido: 'Corredor', telefono: '3001112233', fotoUrl: 'https://f' } }]),
    )
    const perfiles = await obtenerPerfilesPublicos(['u1'])
    const ins = { jugadorId: 'u1', nombre: 'Nombre Viejo', iniciales: 'NV', telefono: '111', fotoUrl: '', pagoValidado: true }
    const r = conPerfilVigente(ins, perfiles.get('u1'))
    expect(r).toMatchObject({ nombre: 'Felipe Corredor', iniciales: 'FC', telefono: '3001112233', fotoUrl: 'https://f' })
    expect(r.pagoValidado).toBe(true)
  })

  it('si el jugador quitó su foto, no se queda la foto vieja de la copia', async () => {
    m.getDocs.mockResolvedValue(snapCon([{ id: 'u1', data: { nombre: 'Ana', apellido: 'Ruiz', fotoUrl: '' } }]))
    const perfiles = await obtenerPerfilesPublicos(['u1'])
    expect(conPerfilVigente({ nombre: 'Ana', fotoUrl: 'https://vieja' }, perfiles.get('u1')).fotoUrl).toBeUndefined()
  })

  it('sin perfil (id inexistente) deja la copia intacta', async () => {
    m.getDocs.mockResolvedValue(snapCon([]))
    const perfiles = await obtenerPerfilesPublicos(['fantasma'])
    const ins = { nombre: 'Invitado', telefono: '1' }
    expect(conPerfilVigente(ins, perfiles.get('fantasma'))).toBe(ins)
  })

  it('usa caché: la segunda lectura no consulta Firestore; invalidar fuerza a releer', async () => {
    m.getDocs.mockResolvedValue(snapCon([{ id: 'u2', data: { nombre: 'Leo', apellido: 'Paz' } }]))
    await obtenerPerfilesPublicos(['u2'])
    await obtenerPerfilesPublicos(['u2'])
    expect(m.getDocs).toHaveBeenCalledTimes(1)
    invalidarPerfilEnCache('u2')
    await obtenerPerfilesPublicos(['u2'])
    expect(m.getDocs).toHaveBeenCalledTimes(2)
  })

  it('consulta en lotes de 30 ids', async () => {
    m.getDocs.mockResolvedValue(snapCon([]))
    const ids = Array.from({ length: 65 }, (_, i) => `lote${i}`)
    await obtenerPerfilesPublicos(ids)
    expect(m.getDocs).toHaveBeenCalledTimes(3)
    expect(m.getDocs.mock.calls[0]?.[0].ids).toHaveLength(30)
  })

  it('si Firestore falla, no rompe: devuelve lo que haya', async () => {
    m.getDocs.mockRejectedValue(new Error('offline'))
    await expect(obtenerPerfilesPublicos(['u1'])).resolves.toEqual(new Map())
  })
})

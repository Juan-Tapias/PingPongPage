import { describe, it, expect, vi, beforeEach } from 'vitest'

const m = vi.hoisted(() => ({
  updateDoc: vi.fn(),
  deleteObject: vi.fn(),
  uploadBytes: vi.fn(),
  getDownloadURL: vi.fn(),
  docCalls: [] as unknown[][],
}))

vi.mock('@/services/firebase', () => ({ db: {}, storage: {} }))
vi.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => { m.docCalls.push(args); return { path: args.slice(1).join('/') } },
  updateDoc: m.updateDoc,
}))
vi.mock('firebase/storage', () => ({
  ref: (_s: unknown, p: string) => ({ fullPath: p }),
  uploadBytes: m.uploadBytes,
  getDownloadURL: m.getDownloadURL,
  deleteObject: m.deleteObject,
}))

import { guardarFotoPerfilUsuario, subirFotoPerfilStorage } from './perfilService'

const UID = 'u1'
const url = (uid: string, f: string) =>
  `https://firebasestorage.googleapis.com/v0/b/x.appspot.com/o/usuarios%2F${uid}%2F${f}?alt=media`

const mem = new Map<string, string>()
const ls = {
  getItem: vi.fn((k: string) => mem.get(k) ?? null),
  setItem: vi.fn((k: string, v: string) => void mem.set(k, v)),
  removeItem: vi.fn((k: string) => void mem.delete(k)),
}

beforeEach(() => {
  vi.clearAllMocks()
  m.docCalls.length = 0
  mem.clear()
  mem.set('spinapp_usuario', JSON.stringify({ id: UID, fotoUrl: url(UID, 'old.jpg') }))
  vi.stubGlobal('localStorage', ls)
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

describe('guardarFotoPerfilUsuario', () => {
  it('escribe en la colección usuarios (no users)', async () => {
    m.updateDoc.mockResolvedValue(undefined)
    await guardarFotoPerfilUsuario(UID, url(UID, 'new.jpg'), url(UID, 'old.jpg'))
    expect(m.docCalls[0]?.[1]).toBe('usuarios')
    expect(m.docCalls.some((c) => c[1] === 'users')).toBe(false)
  })

  it('Firestore falla -> no toca localStorage, borra la foto nueva y NO la anterior', async () => {
    m.updateDoc.mockRejectedValue(new Error('permission-denied'))
    await expect(guardarFotoPerfilUsuario(UID, url(UID, 'new.jpg'), url(UID, 'old.jpg'))).rejects.toThrow('permission-denied')
    expect(ls.setItem).not.toHaveBeenCalled()
    expect(m.deleteObject).toHaveBeenCalledTimes(1)
    expect(m.deleteObject.mock.calls[0]?.[0]).toEqual({ fullPath: url(UID, 'new.jpg') })
  })

  it('éxito -> borra la foto anterior y sincroniza localStorage', async () => {
    m.updateDoc.mockResolvedValue(undefined)
    await guardarFotoPerfilUsuario(UID, url(UID, 'new.jpg'), url(UID, 'old.jpg'))
    expect(m.deleteObject).toHaveBeenCalledWith({ fullPath: url(UID, 'old.jpg') })
    expect(JSON.parse(mem.get('spinapp_usuario')!).fotoUrl).toBe(url(UID, 'new.jpg'))
  })

  it('no borra avatares ajenos ni presets data: al reemplazar', async () => {
    m.updateDoc.mockResolvedValue(undefined)
    await guardarFotoPerfilUsuario(UID, 'data:image/svg+xml;utf8,<svg/>', url('otro', 'x.jpg'))
    expect(m.deleteObject).not.toHaveBeenCalled()
  })

  it('si falla el borrado de la anterior, no rompe el guardado', async () => {
    m.updateDoc.mockResolvedValue(undefined)
    m.deleteObject.mockRejectedValue(new Error('not-found'))
    await expect(guardarFotoPerfilUsuario(UID, '', url(UID, 'old.jpg'))).resolves.toBeUndefined()
    expect(JSON.parse(mem.get('spinapp_usuario')!).fotoUrl).toBe('')
  })
})

describe('subirFotoPerfilStorage', () => {
  it('Storage falla -> propaga error y no escribe Firestore ni localStorage', async () => {
    m.uploadBytes.mockRejectedValue(new Error('storage/unauthorized'))
    const f = new File([new Uint8Array(10)], 'a.png', { type: 'image/png' })
    await expect(subirFotoPerfilStorage(UID, f)).rejects.toThrow('storage/unauthorized')
    expect(m.updateDoc).not.toHaveBeenCalled()
    expect(ls.setItem).not.toHaveBeenCalled()
  })

  it('rechaza formato no permitido antes de subir', async () => {
    const f = new File(['x'], 'a.gif', { type: 'image/gif' })
    await expect(subirFotoPerfilStorage(UID, f)).rejects.toThrow(/Formato/)
    expect(m.uploadBytes).not.toHaveBeenCalled()
  })

  it('sube a usuarios/{uid}/avatar_*', async () => {
    m.uploadBytes.mockResolvedValue({ ref: 'r' })
    m.getDownloadURL.mockResolvedValue('https://ok')
    const f = new File([new Uint8Array(10)], 'Foto.JPG', { type: 'image/jpeg' })
    await expect(subirFotoPerfilStorage(UID, f)).resolves.toBe('https://ok')
    expect(m.uploadBytes.mock.calls[0]?.[0].fullPath).toMatch(/^usuarios\/u1\/avatar_\d+\.jpg$/)
  })
})

import { describe, it, expect, vi, beforeEach } from 'vitest'

const m = vi.hoisted(() => ({
  updateDoc: vi.fn(),
  subirACloudinary: vi.fn(),
  eliminarConToken: vi.fn(),
  docCalls: [] as unknown[][],
}))

vi.mock('@/services/firebase', () => ({ db: {} }))
vi.mock('firebase/firestore', () => ({
  doc: (...args: unknown[]) => { m.docCalls.push(args); return { path: args.slice(1).join('/') } },
  updateDoc: m.updateDoc,
}))
vi.mock('@/services/cloudinaryService', () => ({
  subirACloudinary: m.subirACloudinary,
  eliminarConToken: m.eliminarConToken,
  transformarUrl: (url: string, t: string) => url.replace('/upload/', `/upload/${t}/`),
}))

import { guardarFotoPerfilUsuario, subirFotoPerfil } from './perfilService'

const UID = 'u1'
const url = (f: string) => `https://res.cloudinary.com/demo/image/upload/v1/spinapp/usuarios/${UID}/${f}`

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
  mem.set('spinapp_usuario', JSON.stringify({ id: UID, fotoUrl: url('old.jpg') }))
  vi.stubGlobal('localStorage', ls)
  vi.spyOn(console, 'warn').mockImplementation(() => {})
})

const png = () => new File([new Uint8Array(10)], 'a.png', { type: 'image/png' })

describe('guardarFotoPerfilUsuario', () => {
  it('escribe en la colección usuarios (no users)', async () => {
    m.updateDoc.mockResolvedValue(undefined)
    await guardarFotoPerfilUsuario(UID, url('new.jpg'), url('old.jpg'))
    expect(m.docCalls[0]?.[1]).toBe('usuarios')
    expect(m.docCalls.some((c) => c[1] === 'users')).toBe(false)
  })

  it('Firestore falla -> no toca localStorage y deshace la subida con su delete_token', async () => {
    m.subirACloudinary.mockResolvedValue({ url: url('new.jpg'), publicId: 'p', deleteToken: 'tok-1' })
    const nueva = await subirFotoPerfil(UID, png())
    m.updateDoc.mockRejectedValue(new Error('permission-denied'))
    await expect(guardarFotoPerfilUsuario(UID, nueva, url('old.jpg'))).rejects.toThrow('permission-denied')
    expect(ls.setItem).not.toHaveBeenCalled()
    expect(m.eliminarConToken).toHaveBeenCalledWith('tok-1')
  })

  it('éxito -> sincroniza localStorage y no intenta borrar nada', async () => {
    m.updateDoc.mockResolvedValue(undefined)
    await guardarFotoPerfilUsuario(UID, url('new.jpg'), url('old.jpg'))
    expect(m.eliminarConToken).not.toHaveBeenCalled()
    expect(JSON.parse(mem.get('spinapp_usuario')!).fotoUrl).toBe(url('new.jpg'))
  })

  it('quitar foto (cadena vacía) guarda y sincroniza', async () => {
    m.updateDoc.mockResolvedValue(undefined)
    await expect(guardarFotoPerfilUsuario(UID, '', url('old.jpg'))).resolves.toBeUndefined()
    expect(JSON.parse(mem.get('spinapp_usuario')!).fotoUrl).toBe('')
  })
})

describe('subirFotoPerfil', () => {
  it('Cloudinary falla -> propaga error y no escribe Firestore ni localStorage', async () => {
    m.subirACloudinary.mockRejectedValue(new Error('Upload preset not found'))
    await expect(subirFotoPerfil(UID, png())).rejects.toThrow('Upload preset not found')
    expect(m.updateDoc).not.toHaveBeenCalled()
    expect(ls.setItem).not.toHaveBeenCalled()
  })

  it('rechaza formato no permitido antes de subir', async () => {
    const f = new File(['x'], 'a.gif', { type: 'image/gif' })
    await expect(subirFotoPerfil(UID, f)).rejects.toThrow(/Formato/)
    expect(m.subirACloudinary).not.toHaveBeenCalled()
  })

  it('sube a spinapp/usuarios/{uid} y retorna la URL optimizada 256x256', async () => {
    m.subirACloudinary.mockResolvedValue({ url: url('a.png'), publicId: 'p' })
    const final = await subirFotoPerfil(UID, png())
    expect(m.subirACloudinary.mock.calls[0]?.[1]).toEqual({ tipo: 'image', carpeta: 'spinapp/usuarios/u1' })
    expect(final).toContain('/upload/c_fill,g_face,w_256,h_256,f_auto,q_auto/')
  })
})

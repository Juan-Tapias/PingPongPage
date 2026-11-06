import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { subirACloudinary, transformarUrl, esUrlCloudinary, cloudinaryConfigurado } from './cloudinaryService'

beforeEach(() => {
  vi.stubEnv('VITE_CLOUDINARY_CLOUD_NAME', 'demo')
  vi.stubEnv('VITE_CLOUDINARY_UPLOAD_PRESET', 'spinapp_unsigned')
})
afterEach(() => vi.unstubAllEnvs())

describe('cloudinaryService', () => {
  it('detecta la configuración', () => {
    expect(cloudinaryConfigurado()).toBe(true)
    vi.stubEnv('VITE_CLOUDINARY_UPLOAD_PRESET', '')
    expect(cloudinaryConfigurado()).toBe(false)
  })

  it('transforma solo URLs del cloud configurado', () => {
    const propia = 'https://res.cloudinary.com/demo/image/upload/v1/a.png'
    expect(esUrlCloudinary(propia)).toBe(true)
    expect(transformarUrl(propia, 'w_10')).toBe('https://res.cloudinary.com/demo/image/upload/w_10/v1/a.png')
    const ajena = 'https://img.youtube.com/vi/x/hqdefault.jpg'
    expect(transformarUrl(ajena, 'w_10')).toBe(ajena)
    expect(transformarUrl('data:image/svg+xml;utf8,<svg/>', 'w_10')).toBe('data:image/svg+xml;utf8,<svg/>')
  })

  it('rechaza si no está configurado', async () => {
    vi.stubEnv('VITE_CLOUDINARY_CLOUD_NAME', '')
    await expect(subirACloudinary(new Blob(['x']), { tipo: 'image', carpeta: 'c' })).rejects.toThrow(/no está configurado/)
  })

  it('rechaza archivos por encima del límite del plan gratuito', async () => {
    const grande = { size: 11 * 1024 * 1024 } as Blob
    await expect(subirACloudinary(grande, { tipo: 'image', carpeta: 'c' })).rejects.toThrow(/10 MB/)
  })
})

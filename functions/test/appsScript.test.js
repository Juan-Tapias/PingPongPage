// Prueba la lógica pura de apps-script/Correos.gs (sin Google): se carga el archivo en un
// contexto aislado y se compara con functions/src/correo.js para que ambos correos sean iguales.
import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { componerCorreoGranFinal, componerCorreoEnVivo, listaEmails } from '../src/correo.js'

const codigo = readFileSync(new URL('../../apps-script/Correos.gs', import.meta.url), 'utf8')
const gs = {}
vm.runInNewContext(codigo + '\n;Object.assign(salida, { decidirEnvios, desdeFirestore, documentoAObjeto, componerCorreoGranFinal, componerCorreoEnVivo, elegirFinal, listaEmails, revertirAccion })', { salida: gs })

// Los objetos creados dentro del contexto aislado tienen otros prototipos: se comparan como JSON
const plano = (v) => JSON.parse(JSON.stringify(v))

const torneo = (id, extra = {}) => ({ id, nombre: 'Torneo ' + id, ...extra })

test('primera pasada: registra el estado actual y NO envía nada', () => {
  const r = gs.decidirEnvios(null, [torneo('a', { enlaceTransmision: 'https://yt' })], [torneo('b', { campeonId: 'u1' })])
  assert.equal(r.acciones.length, 0)
  assert.ok(r.nuevoEstado.enVivo.a)
  assert.ok(r.nuevoEstado.finales.b_granfinal_u1)
})

test('Gran Final nueva se envía una sola vez', () => {
  const vacio = { finales: {}, enVivo: {} }
  const r1 = gs.decidirEnvios(vacio, [], [torneo('t', { campeonId: 'u1' })])
  assert.deepEqual(plano(r1.acciones.map((a) => a.tipo)), ['granFinal'])
  const r2 = gs.decidirEnvios(r1.nuevoEstado, [], [torneo('t', { campeonId: 'u1' })])
  assert.equal(r2.acciones.length, 0)
})

test('EN VIVO: solo al pasar de apagado a encendido, y de nuevo tras apagarse', () => {
  const vacio = { finales: {}, enVivo: {} }
  const vivo = [torneo('t', { enlaceTransmision: 'https://yt' })]
  const r1 = gs.decidirEnvios(vacio, vivo, [])
  assert.deepEqual(plano(r1.acciones.map((a) => a.tipo)), ['enVivo'])
  const r2 = gs.decidirEnvios(r1.nuevoEstado, vivo, [])
  assert.equal(r2.acciones.length, 0, 'sigue en vivo: no repite')
  const r3 = gs.decidirEnvios(r2.nuevoEstado, [], [])
  const r4 = gs.decidirEnvios(r3.nuevoEstado, vivo, [])
  assert.equal(r4.acciones.length, 1, 'se apagó y volvió a encender: avisa otra vez')
})

test('EN VIVO sin enlace no se envía', () => {
  const r = gs.decidirEnvios({ finales: {}, enVivo: {} }, [torneo('t', { enlaceTransmision: '  ' })], [])
  assert.equal(r.acciones.length, 0)
})

test('si el envío falla se revierte para reintentar en la próxima pasada', () => {
  const r = gs.decidirEnvios({ finales: {}, enVivo: {} }, [], [torneo('t', { campeonId: 'u1' })])
  const revertido = gs.revertirAccion(r.nuevoEstado, r.acciones[0])
  const r2 = gs.decidirEnvios(revertido, [], [torneo('t', { campeonId: 'u1' })])
  assert.equal(r2.acciones.length, 1)
})

test('convierte documentos de la API REST de Firestore', () => {
  const doc = {
    name: 'projects/p/databases/default/documents/torneos/abc',
    fields: {
      nombre: { stringValue: 'Copa' },
      activo: { booleanValue: true },
      cupos: { integerValue: '16' },
      campeonId: { nullValue: null },
      jugador1: { mapValue: { fields: { id: { stringValue: 'u1' } } } },
      sets: { arrayValue: { values: [{ integerValue: '11' }] } },
    },
  }
  assert.deepEqual(plano(gs.documentoAObjeto(doc)), {
    nombre: 'Copa', activo: true, cupos: 16, campeonId: null, jugador1: { id: 'u1' }, sets: [11], id: 'abc',
  })
})

test('los correos son idénticos a los de la Cloud Function', () => {
  const final = {
    jugador1: { id: 'u1', nombre: 'Juan Martinez', fotoUrl: 'https://f/u1.png' },
    jugador2: { id: 'u2', nombre: 'Sara Lozano' },
    marcador: '2 - 0',
    marcadorDetallado: '11-4, 11-5',
  }
  const t = { nombre: 'Copa', campeonId: 'u1', enlaceTransmision: 'https://yt/x' }
  const esperado = componerCorreoGranFinal({ torneoId: 'c', torneo: t, final, appUrl: 'https://app/' })
  const obtenido = gs.componerCorreoGranFinal('c', t, final, 'https://app/')
  assert.equal(obtenido.asunto, esperado.asunto)
  assert.equal(obtenido.texto, esperado.texto)
  assert.equal(obtenido.html.replace(/\s+/g, ''), esperado.html.replace(/\s+/g, ''))

  const vivoEsperado = componerCorreoEnVivo({ torneoId: 'c', torneo: t })
  const vivo = gs.componerCorreoEnVivo('c', t)
  assert.equal(vivo.asunto, vivoEsperado.asunto)
  assert.equal(vivo.html.replace(/\s+/g, ''), vivoEsperado.html.replace(/\s+/g, ''))
  assert.deepEqual([...gs.listaEmails('A@x.com, a@x.com', ['b@y.co', 'malo'])], listaEmails('A@x.com, a@x.com', ['b@y.co', 'malo']))
})

test('elige la llave de la Gran Final', () => {
  const llaves = [{ id: 's1', siguientePartidoId: 'f' }, { id: 'f', anilloOrbital: 1 }]
  assert.equal(gs.elegirFinal(llaves).id, 'f')
})

import { test } from 'node:test'
import assert from 'node:assert/strict'
import { debeNotificarGranFinal, debeNotificarEnVivo, componerCorreoGranFinal, componerCorreoEnVivo, crearEnviador, listaEmails, esc } from '../src/correo.js'

test('Gran Final: solo en la transicion a campeon', () => {
  assert.equal(debeNotificarGranFinal({ campeonId: null }, { campeonId: 'a' }), true)
  assert.equal(debeNotificarGranFinal({ campeonId: 'a' }, { campeonId: 'a', nombre: 'x' }), false)
  assert.equal(debeNotificarGranFinal({ campeonId: 'a' }, { campeonId: null }), false)
  assert.equal(debeNotificarGranFinal({}, {}), false)
})

test('EN VIVO: solo al activarse con enlace', () => {
  assert.equal(debeNotificarEnVivo({ transmisionEnVivoActiva: false }, { transmisionEnVivoActiva: true, enlaceTransmision: 'https://yt' }), true)
  assert.equal(debeNotificarEnVivo({ transmisionEnVivoActiva: true }, { transmisionEnVivoActiva: true, enlaceTransmision: 'https://yt' }), false)
  assert.equal(debeNotificarEnVivo({}, { transmisionEnVivoActiva: true, enlaceTransmision: '  ' }), false)
  assert.equal(debeNotificarEnVivo({ transmisionEnVivoActiva: true }, { transmisionEnVivoActiva: false }), false)
})

test('compone correo de Gran Final con campeon, subcampeon y marcador escapados', () => {
  const m = componerCorreoGranFinal({
    torneoId: 't1',
    torneo: { nombre: 'Copa <Campus>', campeonId: 'a', campeonNombre: 'Ana' },
    final: { jugador1: { id: 'a', nombre: 'Ana', fotoUrl: 'https://img/a.png' }, jugador2: { id: 'b', nombre: 'Beto' }, marcador: '3 - 1' },
    appUrl: 'https://app.test/',
  })
  assert.match(m.asunto, /Ana es campeon de Copa <Campus>/)
  assert.match(m.texto, /Subcampeon: Beto/)
  assert.match(m.texto, /Marcador final: 3 - 1/)
  assert.match(m.html, /Copa &lt;Campus&gt;/)
  assert.doesNotMatch(m.html, /<Campus>/)
  assert.match(m.html, /https:\/\/img\/a\.png/)
})

test('compone correo EN VIVO con enlace', () => {
  const m = componerCorreoEnVivo({ torneoId: 't', torneo: { nombre: 'Copa', enlaceTransmision: 'https://youtube.com/live/x' } })
  assert.match(m.asunto, /EN VIVO/)
  assert.match(m.html, /youtube\.com\/live\/x/)
})

test('listaEmails deduplica y descarta invalidos', () => {
  assert.deepEqual(listaEmails('A@x.com, a@x.com', ['b@y.co', 'malo', null]), ['a@x.com', 'b@y.co'])
  assert.equal(esc('"<&>'), '&quot;&lt;&amp;&gt;')
})

test('enviador usa transporte mock (no envia correo real) y pone participantes en BCC', async () => {
  const enviados = []
  let opciones
  const enviar = crearEnviador({ user: 'felipe@gmail.com', pass: 'secreto', crearTransporte: (o) => { opciones = o; return { sendMail: async (m) => { enviados.push(m); return { messageId: 'id1' } } } } })
  const r = await enviar({ to: ['felipe@gmail.com'], bcc: ['felipe@gmail.com', 'p1@x.com'], asunto: 'S', texto: 't', html: '<p>h</p>' })
  assert.equal(r.messageId, 'id1')
  assert.equal(opciones.service, 'gmail')
  assert.equal(enviados[0].to, 'felipe@gmail.com')
  assert.equal(enviados[0].bcc, 'p1@x.com')
})

test('dry-run no crea transporte', async () => {
  const enviar = crearEnviador({ user: 'f@g.com', pass: '', dryRun: true, crearTransporte: () => { throw new Error('no deberia') }, log: { info() {} } })
  const r = await enviar({ to: 'f@g.com', asunto: 'S', texto: 't', html: 'h' })
  assert.equal(r.dryRun, true)
})

test('sin credenciales falla claro', async () => {
  const enviar = crearEnviador({ user: '', pass: '', crearTransporte: () => ({}) })
  await assert.rejects(enviar({ to: 'f@g.com', asunto: 'S', texto: 't', html: 'h' }), /GMAIL_USER/)
})

/**
 * PingPongPage · Correos automáticos con Google Apps Script (gratis, sin plan Blaze).
 *
 * Reemplaza a la Cloud Function `notificarCorreosTorneo`:
 *   - 🏆 Gran Final: cuando un torneo tiene campeón (campeonId) por primera vez.
 *   - 🔴 EN VIVO: cuando un torneo pasa de apagado a transmisionEnVivoActiva = true.
 *
 * Cómo funciona: un activador revisa Firestore cada minuto. Lee con la cuenta de Google dueña
 * del proyecto (sin claves) y envía con el Gmail de esa misma cuenta (MailApp).
 * Para no repetir correos guarda lo ya enviado en las Propiedades del script.
 *
 * Instalación: ver apps-script/README.md
 */

// ===================== CONFIGURACIÓN =====================
var CONFIG = {
  PROJECT_ID: 'spinapptorneo',
  // La app usa la base Firestore con ID "default" (ver firebase.json / VITE_FIREBASE_DATABASE_ID)
  DATABASE_ID: 'default',
  // Destinatarios admin separados por coma. Vacío = solo la cuenta dueña del script.
  ADMINS: '',
  // true = la Gran Final también va en copia oculta (BCC) a los inscritos con pago verificado
  NOTIFICAR_PARTICIPANTES: true,
  // true = arma los correos y los deja en el registro (Ejecuciones) pero NO los envía
  DRY_RUN: false,
  APP_URL: 'https://spinapptorneo.web.app',
  NOMBRE_REMITENTE: 'PingPongPage',
}

// ===================== PUNTOS DE ENTRADA =====================

/** Ejecuta UNA vez a mano: crea el activador de cada minuto y toma la foto inicial (sin enviar). */
function instalar() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'revisarTorneos') ScriptApp.deleteTrigger(t)
  })
  ScriptApp.newTrigger('revisarTorneos').timeBased().everyMinutes(1).create()
  PropertiesService.getScriptProperties().deleteProperty('estado')
  revisarTorneos() // primera pasada: solo registra el estado actual, no envía nada
  Logger.log('Listo: el activador revisará los torneos cada minuto.')
}

/** Detiene los correos automáticos. */
function desinstalar() {
  ScriptApp.getProjectTriggers().forEach(function (t) {
    if (t.getHandlerFunction() === 'revisarTorneos') ScriptApp.deleteTrigger(t)
  })
  Logger.log('Activador eliminado: ya no se enviarán correos automáticos.')
}

/** Envía un correo de prueba solo a los admins (equivale a enviarCorreoPrueba). */
function enviarCorreoPrueba() {
  enviar({
    to: destinatariosAdmin(),
    bcc: [],
    asunto: '✅ PingPongPage: prueba de correo',
    texto: 'Si recibes esto, el envio de correos de PingPongPage funciona.',
    html: '<p>Si recibes esto, el envio de correos de <b>PingPongPage</b> funciona.</p>',
  })
}

/** Lo llama el activador cada minuto. */
function revisarTorneos() {
  var lock = LockService.getScriptLock()
  if (!lock.tryLock(5000)) return // otra ejecución sigue corriendo
  try {
    var props = PropertiesService.getScriptProperties()
    var estado = JSON.parse(props.getProperty('estado') || 'null')

    var enVivo = consultar('torneos', { campo: 'transmisionEnVivoActiva', op: 'EQUAL', valor: { booleanValue: true } })
    var conCampeon = consultar('torneos', { campo: 'campeonId', op: 'NOT_EQUAL', valor: { nullValue: null } })

    var decision = decidirEnvios(estado, enVivo, conCampeon)

    decision.acciones.forEach(function (accion) {
      try {
        if (accion.tipo === 'granFinal') notificarGranFinal(accion.torneo)
        if (accion.tipo === 'enVivo') notificarEnVivo(accion.torneo)
      } catch (e) {
        // Si falla un envío no se marca como enviado: se reintenta en la próxima pasada
        Logger.log('Error enviando ' + accion.tipo + ' de ' + accion.torneo.id + ': ' + e)
        decision.nuevoEstado = revertirAccion(decision.nuevoEstado, accion)
      }
    })

    props.setProperty('estado', JSON.stringify(decision.nuevoEstado))
  } finally {
    lock.releaseLock()
  }
}

// ===================== LÓGICA PURA (testeable) =====================

/**
 * Decide qué correos enviar comparando con lo ya visto.
 * - Primera vez (estado null): registra todo lo actual y NO envía (evita spamear torneos viejos).
 * - Gran Final: una vez por par torneo+campeón.
 * - EN VIVO: cuando un torneo aparece en vivo y en la pasada anterior no lo estaba.
 */
function decidirEnvios(estado, torneosEnVivo, torneosConCampeon) {
  var primeraVez = !estado
  var previo = estado || { finales: {}, enVivo: {} }
  var nuevo = { finales: Object.assign({}, previo.finales), enVivo: {} }
  var acciones = []

  torneosConCampeon.forEach(function (t) {
    var clave = t.id + '_granfinal_' + t.campeonId
    if (!nuevo.finales[clave]) {
      nuevo.finales[clave] = Date.now()
      if (!primeraVez) acciones.push({ tipo: 'granFinal', torneo: t, clave: clave })
    }
  })

  torneosEnVivo.forEach(function (t) {
    var enlace = String(t.enlaceTransmision || '').trim()
    if (!enlace) return
    nuevo.enVivo[t.id] = true
    if (!primeraVez && !previo.enVivo[t.id]) acciones.push({ tipo: 'enVivo', torneo: t, clave: t.id })
  })

  return { acciones: acciones, nuevoEstado: nuevo }
}

function revertirAccion(estado, accion) {
  if (accion.tipo === 'granFinal') delete estado.finales[accion.clave]
  if (accion.tipo === 'enVivo') delete estado.enVivo[accion.clave]
  return estado
}

function esc(v) {
  return String(v == null ? '' : v).replace(/[&<>"']/g, function (c) {
    return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  })
}

function listaEmails() {
  var vistos = {}
  var out = []
  var valores = [].concat.apply([], Array.prototype.slice.call(arguments))
  valores.forEach(function (v) {
    String(v == null ? '' : v).split(',').forEach(function (e) {
      var limpio = e.trim().toLowerCase()
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio) && !vistos[limpio]) {
        vistos[limpio] = true
        out.push(limpio)
      }
    })
  })
  return out
}

function nombreJugador(j) {
  return j ? [j.nombre, j.apellido].filter(Boolean).join(' ') : ''
}

function plantilla(titulo, cuerpoHtml) {
  return '<!doctype html><html><body style="margin:0;background:#0f172a;font-family:Arial,sans-serif;color:#e2e8f0">' +
    '<div style="max-width:560px;margin:0 auto;padding:24px">' +
    '<h1 style="color:#facc15;font-size:22px;margin:0 0 16px">' + esc(titulo) + '</h1>' +
    cuerpoHtml +
    '<p style="font-size:11px;color:#64748b;margin-top:24px">PingPongPage · correo automatico</p>' +
    '</div></body></html>'
}

/** Mismo contenido que functions/src/correo.js → componerCorreoGranFinal. */
function componerCorreoGranFinal(torneoId, torneo, final, appUrl) {
  var j1 = final && final.jugador1
  var j2 = final && final.jugador2
  var delCampeon = final ? (j1 && j1.id === torneo.campeonId ? j1 : j2) : null
  var campeon = torneo.campeonNombre || nombreJugador(delCampeon) || 'Campeon'
  var subcampeon = final ? nombreJugador(j1 && j1.id === torneo.campeonId ? j2 : j1) : ''
  var foto = (delCampeon && delCampeon.id === torneo.campeonId && delCampeon.fotoUrl) || ''
  var link = appUrl ? appUrl.replace(/\/$/, '') + '/' : ''
  var nombreTorneo = torneo.nombre || 'el torneo'
  var asunto = '🏆 Gran Final: ' + campeon + ' es campeon de ' + nombreTorneo
  var lineas = [
    'Torneo: ' + (torneo.nombre || torneoId),
    'Campeon: ' + campeon,
    subcampeon && 'Subcampeon: ' + subcampeon,
    final && final.marcador && 'Marcador final: ' + final.marcador,
    final && final.marcadorDetallado && 'Detalle: ' + final.marcadorDetallado,
    link && 'Ver cuadro: ' + link,
  ].filter(Boolean)
  var fila = function (k, v, negrita) {
    return '<tr><td style="padding:4px 12px 4px 0;color:#94a3b8">' + k + '</td><td>' + (negrita ? '<b>' + esc(v) + '</b>' : esc(v)) + '</td></tr>'
  }
  var html = plantilla('🏆 ' + campeon + ' es el campeon',
    (foto && /^https:\/\//.test(foto) ? '<img src="' + esc(foto) + '" alt="" width="96" height="96" style="border-radius:50%;border:3px solid #facc15">' : '') +
    '<p style="font-size:16px">Se jugo la <b>Gran Final</b> de <b>' + esc(torneo.nombre || torneoId) + '</b>.</p>' +
    '<table style="font-size:14px;border-collapse:collapse">' +
    fila('Campeon', campeon, true) +
    (subcampeon ? fila('Subcampeon', subcampeon) : '') +
    (final && final.marcador ? fila('Marcador', final.marcador) : '') +
    (final && final.marcadorDetallado ? fila('Detalle', final.marcadorDetallado) : '') +
    '</table>' +
    (link ? '<p><a href="' + esc(link) + '" style="color:#38bdf8">Ver el cuadro en PingPongPage</a></p>' : ''))
  return { asunto: asunto, texto: lineas.join('\n'), html: html }
}

/** Mismo contenido que functions/src/correo.js → componerCorreoEnVivo. */
function componerCorreoEnVivo(torneoId, torneo) {
  var enlace = String(torneo.enlaceTransmision || '').trim()
  var nombre = torneo.nombre || 'Torneo'
  return {
    asunto: '🔴 EN VIVO: ' + nombre,
    texto: 'La transmision de ' + (torneo.nombre || torneoId) + ' esta EN VIVO.\nEnlace: ' + enlace,
    html: plantilla('🔴 EN VIVO: ' + nombre,
      '<p style="font-size:16px">La transmision del torneo acaba de activarse.</p>' +
      '<p><a href="' + esc(enlace) + '" style="color:#38bdf8;font-size:16px">' + esc(enlace) + '</a></p>'),
  }
}

/** Elige la llave de la Gran Final (igual que obtenerFinal en functions/index.js). */
function elegirFinal(llaves) {
  return llaves.filter(function (p) { return p.anilloOrbital === 1 && !p.siguientePartidoId })[0] ||
    llaves.filter(function (p) { return !p.siguientePartidoId })[0] || null
}

/** Convierte un valor tipado de la API REST de Firestore a JS plano. */
function desdeFirestore(v) {
  if (!v) return null
  if ('stringValue' in v) return v.stringValue
  if ('booleanValue' in v) return v.booleanValue
  if ('integerValue' in v) return Number(v.integerValue)
  if ('doubleValue' in v) return v.doubleValue
  if ('nullValue' in v) return null
  if ('timestampValue' in v) return v.timestampValue
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(desdeFirestore)
  if ('mapValue' in v) return camposAObjeto(v.mapValue.fields || {})
  return null
}

function camposAObjeto(campos) {
  var o = {}
  Object.keys(campos || {}).forEach(function (k) { o[k] = desdeFirestore(campos[k]) })
  return o
}

function documentoAObjeto(doc) {
  var o = camposAObjeto(doc.fields)
  o.id = doc.name.split('/').pop()
  return o
}

// ===================== FIRESTORE (REST) Y CORREO =====================

function baseUrl() {
  return 'https://firestore.googleapis.com/v1/projects/' + CONFIG.PROJECT_ID + '/databases/' + CONFIG.DATABASE_ID + '/documents'
}

function llamarFirestore(url, payload) {
  var opciones = {
    method: payload ? 'post' : 'get',
    contentType: 'application/json',
    headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() },
    muteHttpExceptions: true,
  }
  if (payload) opciones.payload = JSON.stringify(payload)
  var r = UrlFetchApp.fetch(url, opciones)
  if (r.getResponseCode() >= 300) throw new Error('Firestore ' + r.getResponseCode() + ': ' + r.getContentText().slice(0, 300))
  return JSON.parse(r.getContentText())
}

/** Consulta una colección con un solo filtro. */
function consultar(coleccion, filtro) {
  var respuesta = llamarFirestore(baseUrl() + ':runQuery', {
    structuredQuery: {
      from: [{ collectionId: coleccion }],
      where: { fieldFilter: { field: { fieldPath: filtro.campo }, op: filtro.op, value: filtro.valor } },
    },
  })
  return respuesta.filter(function (r) { return r.document }).map(function (r) { return documentoAObjeto(r.document) })
}

function leerUsuarios(ids) {
  if (!ids.length) return {}
  var respuesta = llamarFirestore(baseUrl() + ':batchGet', {
    documents: ids.map(function (id) {
      return 'projects/' + CONFIG.PROJECT_ID + '/databases/' + CONFIG.DATABASE_ID + '/documents/usuarios/' + id
    }),
  })
  var mapa = {}
  respuesta.forEach(function (r) { if (r.found) { var u = documentoAObjeto(r.found); mapa[u.id] = u } })
  return mapa
}

function destinatariosAdmin() {
  return listaEmails(Session.getEffectiveUser().getEmail(), CONFIG.ADMINS)
}

function emailsParticipantes(torneoId) {
  var ids = consultar('inscripciones', { campo: 'torneoId', op: 'EQUAL', valor: { stringValue: torneoId } })
    .filter(function (i) { return i.pagoValidado === true && i.jugadorId })
    .map(function (i) { return i.jugadorId })
  var unicos = ids.filter(function (id, i) { return ids.indexOf(id) === i })
  var usuarios = leerUsuarios(unicos)
  return listaEmails(unicos.map(function (id) { return usuarios[id] && usuarios[id].email }))
}

/** La llave guarda copia del jugador: se usa el nombre y la foto vigentes de 'usuarios'. */
function conPerfilesVigentes(final) {
  if (!final) return final
  var ids = [final.jugador1 && final.jugador1.id, final.jugador2 && final.jugador2.id].filter(Boolean)
  var usuarios = leerUsuarios(ids)
  var actualizar = function (j) {
    var u = j && usuarios[j.id]
    if (!u) return j
    var nombre = [u.nombre, u.apellido].filter(Boolean).join(' ').trim()
    return Object.assign({}, j, { nombre: nombre || j.nombre, apellido: undefined, fotoUrl: u.fotoUrl || '' })
  }
  return Object.assign({}, final, { jugador1: actualizar(final.jugador1), jugador2: actualizar(final.jugador2) })
}

function notificarGranFinal(torneo) {
  var llaves = consultar('partidos_playoffs', { campo: 'torneoId', op: 'EQUAL', valor: { stringValue: torneo.id } })
  var final = conPerfilesVigentes(elegirFinal(llaves))
  var campeonVigente = final && [final.jugador1, final.jugador2].filter(function (j) { return j && j.id === torneo.campeonId })[0]
  var datosTorneo = campeonVigente ? Object.assign({}, torneo, { campeonNombre: campeonVigente.nombre }) : torneo
  var correo = componerCorreoGranFinal(torneo.id, datosTorneo, final, CONFIG.APP_URL)
  var bcc = CONFIG.NOTIFICAR_PARTICIPANTES ? emailsParticipantes(torneo.id) : []
  enviar({ to: destinatariosAdmin(), bcc: bcc, asunto: correo.asunto, texto: correo.texto, html: correo.html })
}

function notificarEnVivo(torneo) {
  var correo = componerCorreoEnVivo(torneo.id, torneo)
  enviar({ to: destinatariosAdmin(), bcc: [], asunto: correo.asunto, texto: correo.texto, html: correo.html })
}

function enviar(m) {
  var para = listaEmails(m.to)
  var ocultos = listaEmails(m.bcc).filter(function (e) { return para.indexOf(e) < 0 })
  if (!para.length) throw new Error('Sin destinatarios validos')
  if (CONFIG.DRY_RUN) {
    Logger.log('[DRY_RUN] ' + m.asunto + ' → ' + para.join(', ') + ' (+' + ocultos.length + ' BCC)')
    return
  }
  var restantes = MailApp.getRemainingDailyQuota()
  if (restantes < para.length + ocultos.length) {
    throw new Error('Cuota diaria de Gmail insuficiente (' + restantes + ' restantes)')
  }
  MailApp.sendEmail({
    to: para.join(','),
    bcc: ocultos.join(','),
    subject: m.asunto,
    body: m.texto,
    htmlBody: m.html,
    name: CONFIG.NOMBRE_REMITENTE,
  })
  Logger.log('Enviado: ' + m.asunto + ' → ' + para.length + ' + ' + ocultos.length + ' BCC')
}

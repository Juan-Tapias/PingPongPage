// Logica pura de correos (sin dependencias de Firebase) para poder testearla con mocks.

export const esc = (v) =>
  String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c])

export const listaEmails = (...valores) => {
  const vistos = new Set()
  const out = []
  for (const v of valores.flat()) {
    for (const e of String(v ?? '').split(',')) {
      const limpio = e.trim().toLowerCase()
      if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio) && !vistos.has(limpio)) {
        vistos.add(limpio)
        out.push(limpio)
      }
    }
  }
  return out
}

/** La Gran Final se resolvio: el torneo pasa a tener campeon (transicion, no cada update). */
export const debeNotificarGranFinal = (antes = {}, despues = {}) =>
  Boolean(despues?.campeonId) && despues.campeonId !== antes?.campeonId

/** La transmision pasa de apagada a EN VIVO con un enlace. */
export const debeNotificarEnVivo = (antes = {}, despues = {}) =>
  despues?.transmisionEnVivoActiva === true &&
  antes?.transmisionEnVivoActiva !== true &&
  Boolean(String(despues?.enlaceTransmision ?? '').trim())

const nombreJugador = (j) => (j ? [j.nombre, j.apellido].filter(Boolean).join(' ') : '')

const plantilla = (titulo, cuerpoHtml) => `<!doctype html><html><body style="margin:0;background:#0f172a;font-family:Arial,sans-serif;color:#e2e8f0">
<div style="max-width:560px;margin:0 auto;padding:24px">
<h1 style="color:#facc15;font-size:22px;margin:0 0 16px">${esc(titulo)}</h1>
${cuerpoHtml}
<p style="font-size:11px;color:#64748b;margin-top:24px">PingPongPage · correo automatico</p>
</div></body></html>`

export const componerCorreoGranFinal = ({ torneoId, torneo, final, appUrl }) => {
  const campeon = torneo.campeonNombre || nombreJugador(final?.jugador1?.id === torneo.campeonId ? final.jugador1 : final?.jugador2) || 'Campeon'
  const j1 = final?.jugador1, j2 = final?.jugador2
  const subcampeon = final ? nombreJugador(j1?.id === torneo.campeonId ? j2 : j1) : ''
  const foto = (final && [j1, j2].find((j) => j?.id === torneo.campeonId)?.fotoUrl) || ''
  const link = appUrl ? `${appUrl.replace(/\/$/, '')}/` : ''
  const asunto = `🏆 Gran Final: ${campeon} es campeon de ${torneo.nombre ?? 'el torneo'}`
  const lineas = [
    `Torneo: ${torneo.nombre ?? torneoId}`,
    `Campeon: ${campeon}`,
    subcampeon && `Subcampeon: ${subcampeon}`,
    final?.marcador && `Marcador final: ${final.marcador}`,
    final?.marcadorDetallado && `Detalle: ${final.marcadorDetallado}`,
    link && `Ver cuadro: ${link}`,
  ].filter(Boolean)
  const html = plantilla(`🏆 ${campeon} es el campeon`, `
${foto && /^https:\/\//.test(foto) ? `<img src="${esc(foto)}" alt="" width="96" height="96" style="border-radius:50%;border:3px solid #facc15">` : ''}
<p style="font-size:16px">Se jugo la <b>Gran Final</b> de <b>${esc(torneo.nombre ?? torneoId)}</b>.</p>
<table style="font-size:14px;border-collapse:collapse">
<tr><td style="padding:4px 12px 4px 0;color:#94a3b8">Campeon</td><td><b>${esc(campeon)}</b></td></tr>
${subcampeon ? `<tr><td style="padding:4px 12px 4px 0;color:#94a3b8">Subcampeon</td><td>${esc(subcampeon)}</td></tr>` : ''}
${final?.marcador ? `<tr><td style="padding:4px 12px 4px 0;color:#94a3b8">Marcador</td><td>${esc(final.marcador)}</td></tr>` : ''}
${final?.marcadorDetallado ? `<tr><td style="padding:4px 12px 4px 0;color:#94a3b8">Detalle</td><td>${esc(final.marcadorDetallado)}</td></tr>` : ''}
</table>
${link ? `<p><a href="${esc(link)}" style="color:#38bdf8">Ver el cuadro en PingPongPage</a></p>` : ''}`)
  return { asunto, texto: lineas.join('\n'), html }
}

export const componerCorreoEnVivo = ({ torneoId, torneo }) => {
  const enlace = String(torneo.enlaceTransmision ?? '').trim()
  const asunto = `🔴 EN VIVO: ${torneo.nombre ?? 'Torneo'}`
  const texto = `La transmision de ${torneo.nombre ?? torneoId} esta EN VIVO.\nEnlace: ${enlace}`
  const html = plantilla(`🔴 EN VIVO: ${torneo.nombre ?? 'Torneo'}`, `
<p style="font-size:16px">La transmision del torneo acaba de activarse.</p>
<p><a href="${esc(enlace)}" style="color:#38bdf8;font-size:16px">${esc(enlace)}</a></p>`)
  return { asunto, texto, html }
}

/**
 * Crea un enviador. `crearTransporte` se inyecta (nodemailer.createTransport en prod, mock en tests).
 */
export const crearEnviador = ({ user, pass, dryRun = false, crearTransporte, log = console }) => {
  let transporte = null
  return async ({ to, bcc = [], asunto, texto, html }) => {
    const para = listaEmails(to)
    const ocultos = listaEmails(bcc).filter((e) => !para.includes(e))
    if (para.length === 0) throw new Error('Sin destinatarios validos')
    const mensaje = { from: `PingPongPage <${user}>`, to: para.join(', '), bcc: ocultos.length ? ocultos.join(', ') : undefined, subject: asunto, text: texto, html }
    if (dryRun) {
      log.info?.('[correo:dry-run]', { to: mensaje.to, bccCount: ocultos.length, subject: asunto })
      return { dryRun: true, mensaje }
    }
    if (!user || !pass) throw new Error('Faltan GMAIL_USER / GMAIL_APP_PASSWORD en el entorno de Functions')
    transporte ??= crearTransporte({ service: 'gmail', auth: { user, pass } })
    const info = await transporte.sendMail(mensaje)
    return { dryRun: false, messageId: info?.messageId, mensaje }
  }
}

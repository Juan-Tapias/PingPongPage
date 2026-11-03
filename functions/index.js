import { initializeApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { onDocumentUpdated } from 'firebase-functions/v2/firestore'
import { onCall, HttpsError } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { logger } from 'firebase-functions'
import nodemailer from 'nodemailer'
import {
  debeNotificarGranFinal, debeNotificarEnVivo,
  componerCorreoGranFinal, componerCorreoEnVivo,
  crearEnviador, listaEmails,
} from './src/correo.js'

initializeApp()
// La app usa la base Firestore con ID "default" (ver firebase.json / VITE_FIREBASE_DATABASE_ID)
const DATABASE_ID = process.env.FIRESTORE_DATABASE_ID || 'default'
const db = getFirestore(DATABASE_ID)
const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD')
const REGION = 'us-central1'

const env = () => ({
  user: (process.env.GMAIL_USER || '').trim(),
  admins: listaEmails(process.env.GMAIL_USER, process.env.MAIL_ADMIN_TO),
  dryRun: process.env.MAIL_DRY_RUN === 'true',
  notificarParticipantes: process.env.MAIL_NOTIFY_PARTICIPANTS !== 'false',
  appUrl: process.env.APP_URL || '',
})

const enviador = () => {
  const c = env()
  return crearEnviador({ user: c.user, pass: GMAIL_APP_PASSWORD.value(), dryRun: c.dryRun, crearTransporte: nodemailer.createTransport, log: logger })
}

/** Evita duplicados si Functions reintenta el evento. */
const reclamarEnvio = async (clave) => {
  try {
    await db.collection('correos_enviados').doc(clave).create({ creadoEn: Date.now() })
    return true
  } catch (e) {
    if (e?.code === 6 || /already exists/i.test(String(e?.message))) return false
    throw e
  }
}

const emailsParticipantes = async (torneoId) => {
  const ins = await db.collection('inscripciones').where('torneoId', '==', torneoId).get()
  const ids = [...new Set(ins.docs.map((d) => d.data()).filter((i) => i.pagoValidado === true).map((i) => i.jugadorId).filter(Boolean))]
  if (ids.length === 0) return []
  const snaps = await db.getAll(...ids.map((id) => db.collection('usuarios').doc(id)))
  return listaEmails(snaps.map((s) => s.data()?.email))
}

const obtenerFinal = async (torneoId) => {
  const snap = await db.collection('partidos_playoffs').where('torneoId', '==', torneoId).get()
  const llaves = snap.docs.map((d) => ({ id: d.id, ...d.data() }))
  return llaves.find((p) => p.anilloOrbital === 1 && !p.siguientePartidoId) || llaves.find((p) => !p.siguientePartidoId) || null
}

export const notificarCorreosTorneo = onDocumentUpdated(
  { document: 'torneos/{torneoId}', database: DATABASE_ID, region: REGION, secrets: [GMAIL_APP_PASSWORD] },
  async (event) => {
    const antes = event.data?.before?.data() || {}
    const despues = event.data?.after?.data() || {}
    const torneoId = event.params.torneoId
    const c = env()

    if (debeNotificarGranFinal(antes, despues) && (await reclamarEnvio(`${torneoId}_granfinal_${despues.campeonId}`))) {
      const final = await obtenerFinal(torneoId)
      const bcc = c.notificarParticipantes ? await emailsParticipantes(torneoId) : []
      const r = await enviador()({ to: c.admins, bcc, ...componerCorreoGranFinal({ torneoId, torneo: despues, final, appUrl: c.appUrl }) })
      logger.info('Correo Gran Final', { torneoId, dryRun: r.dryRun, participantes: bcc.length })
    }

    if (debeNotificarEnVivo(antes, despues) && (await reclamarEnvio(`${torneoId}_envivo_${event.id}`))) {
      const r = await enviador()({ to: c.admins, ...componerCorreoEnVivo({ torneoId, torneo: despues }) })
      logger.info('Correo EN VIVO', { torneoId, dryRun: r.dryRun })
    }
  },
)

/** Prueba segura: solo un admin puede llamarla y SOLO envia a GMAIL_USER / MAIL_ADMIN_TO. */
export const enviarCorreoPrueba = onCall({ region: REGION, secrets: [GMAIL_APP_PASSWORD] }, async (req) => {
  if (!req.auth) throw new HttpsError('unauthenticated', 'Inicia sesion')
  const u = await db.collection('usuarios').doc(req.auth.uid).get()
  if (u.data()?.rol !== 'admin') throw new HttpsError('permission-denied', 'Solo administradores')
  const c = env()
  const r = await enviador()({
    to: c.admins,
    asunto: '✅ PingPongPage: prueba de correo',
    texto: 'Si recibes esto, el envio de correos de PingPongPage funciona.',
    html: '<p>Si recibes esto, el envio de correos de <b>PingPongPage</b> funciona.</p>',
  })
  return { ok: true, dryRun: r.dryRun, destinatarios: c.admins.length }
})

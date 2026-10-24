#!/usr/bin/env node
/**
 * Script CLI para Despacho Local / Pruebas de la Cola de Correos de spinApp 2026
 *
 * Uso:
 *   node scripts/despachar-cola.mjs --dry-run
 *   node scripts/despachar-cola.mjs --email remitente@gmail.com --pass "abcd efgh ijkl mnop"
 *
 * Si se ejecuta sin flags, buscará en .env las variables:
 *   GMAIL_USER=tu-correo@gmail.com
 *   GMAIL_APP_PASSWORD=tu-codigo-16-caracteres
 */

import { initializeApp } from 'firebase/app'
import {
  getFirestore,
  collection,
  getDocs,
  query,
  where,
  updateDoc,
  doc,
  onSnapshot,
} from 'firebase/firestore'
import dotenv from 'dotenv'

dotenv.config()

const args = process.argv.slice(2)
const isDryRun = args.includes('--dry-run')
const isWatch = args.includes('--watch') || args.includes('--daemon')
const emailArgIdx = args.indexOf('--email')
const passArgIdx = args.indexOf('--pass')

const gmailUser = emailArgIdx !== -1 ? args[emailArgIdx + 1] : process.env.GMAIL_USER
const gmailPass = passArgIdx !== -1 ? args[passArgIdx + 1] : process.env.GMAIL_APP_PASSWORD

console.log('=====================================================')
console.log('🏓 spinApp 2026 — Despachador de Correos Automático')
console.log('=====================================================')

if (isDryRun) {
  console.log('ℹ️ MODO DRY-RUN: Se simulará el envío sin contactar al servidor SMTP.')
} else if (!gmailUser || !gmailPass) {
  console.log('⚠️ AVISO: No se detectaron credenciales SMTP de Gmail en argumentos o .env')
  console.log('Para enviar correos reales, añade GMAIL_USER y GMAIL_APP_PASSWORD en .env')
  console.log('\nSe activará automáticamente el modo de simulación (Dry-Run).\n')
} else {
  console.log(`📡 Remitente Oficial Conectado: ${gmailUser}`)
}

if (isWatch) {
  console.log('🔄 Modo CONTINUO (Watch/Daemon) activado: Escuchando nuevos correos en tiempo real...')
}

// Configuración de Firebase para leer la cola
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || 'spinapptorneo',
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID,
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function obtenerTransporter() {
  if (isDryRun || !gmailUser || !gmailPass) return null
  try {
    const { default: nodemailer } = await import('nodemailer')
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: gmailUser,
        pass: gmailPass.replace(/\s+/g, ''),
      },
    })
  } catch (err) {
    console.warn('Nota: nodemailer no está instalado en la raíz (ejecuta "npm i nodemailer" o corre en modo dry-run)')
    return null
  }
}

async function procesarDocumentoCorreo(docSnap, transporter) {
  const data = docSnap.data()
  const docId = docSnap.id
  if (data.estado !== 'pendiente') return

  const destinatario = Array.isArray(data.to) ? data.to.join(', ') : data.to

  console.log(`\n--------------------------------------------------`)
  console.log(`📬 Procesando correo [${docId}]`)
  console.log(`Tipo: ${data.tipoPlantilla}`)
  console.log(`Para: ${destinatario}`)
  console.log(`Asunto: ${data.subject}`)

  if (isDryRun || !transporter) {
    console.log(`[SIMULACIÓN] Mensaje procesado como enviado satisfactoriamente.`)
    await updateDoc(doc(db, 'cola_correos', docId), {
      estado: 'enviado',
      enviadoEn: Date.now(),
      simulado: true,
    })
  } else {
    try {
      const info = await transporter.sendMail({
        from: `"spinApp 2026 🏓" <${gmailUser}>`,
        to: destinatario,
        subject: data.subject,
        text: data.text || '',
        html: data.html,
      })
      console.log(`✅ ENVIADO con éxito (Message ID: ${info.messageId})`)
      await updateDoc(doc(db, 'cola_correos', docId), {
        estado: 'enviado',
        enviadoEn: Date.now(),
        messageId: info.messageId,
        error: null,
      })
    } catch (err) {
      console.error(`❌ Error al enviar: ${err.message}`)
      await updateDoc(doc(db, 'cola_correos', docId), {
        estado: 'error',
        error: err.message,
        intentos: (data.intentos || 0) + 1,
      })
    }
  }
}

async function iniciarDespachador() {
  const transporter = await obtenerTransporter()

  if (isWatch) {
    // Escucha en tiempo real con onSnapshot
    const q = query(
      collection(db, 'cola_correos'),
      where('estado', '==', 'pendiente')
    )

    onSnapshot(q, async (snap) => {
      for (const docSnap of snap.docs) {
        await procesarDocumentoCorreo(docSnap, transporter)
      }
    })
  } else {
    // Modo de una sola pasada
    console.log('🔍 Consultando correos pendientes en Firestore...')
    try {
      const q = query(
        collection(db, 'cola_correos'),
        where('estado', '==', 'pendiente')
      )
      const snapshot = await getDocs(q)

      if (snapshot.empty) {
        console.log('✅ No hay correos pendientes por enviar en este momento.')
        process.exit(0)
      }

      console.log(`📬 Se encontraron ${snapshot.size} correo(s) pendiente(s) en la cola.`)

      for (const docSnap of snapshot.docs) {
        await procesarDocumentoCorreo(docSnap, transporter)
      }

      console.log('\n🏁 Procesamiento finalizado.')
      process.exit(0)
    } catch (err) {
      console.error('Error al consultar cola de correos:', err)
      process.exit(1)
    }
  }
}

iniciarDespachador()

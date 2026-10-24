/**
 * Cloud Function para despacho seguro de correos — spinApp 2026
 *
 * Escucha la colección 'cola_correos' en Firestore.
 * Lee las credenciales de forma segura desde variables de entorno o Secret Manager:
 * - GMAIL_USER / SMTP_USER: Correo remitente oficial (ej: contacto@spinapp.com)
 * - GMAIL_APP_PASSWORD / SMTP_PASS: Contraseña de aplicación de 16 caracteres de Google Workspace / Gmail
 */

const { onDocumentCreated } = require("firebase-functions/v2/firestore");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();
const db = admin.firestore();

/**
 * Crea el transportador de Nodemailer usando Gmail o SMTP estándar
 */
function crearTransportador() {
  const usuario = process.env.GMAIL_USER || process.env.SMTP_USER;
  const password = (process.env.GMAIL_APP_PASSWORD || process.env.SMTP_PASS || "").replace(/\s+/g, "");

  if (!usuario || !password) {
    logger.warn("[spinApp Mailer] Credenciales no configuradas (GMAIL_USER / GMAIL_APP_PASSWORD)");
    return null;
  }

  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: usuario,
      pass: password,
    },
  });
}

/**
 * Trigger al crearse un documento en 'cola_correos/{correoId}'
 */
exports.despacharCorreoCola = onDocumentCreated(
  {
    document: "cola_correos/{correoId}",
    secrets: ["GMAIL_USER", "GMAIL_APP_PASSWORD"],
    region: "us-central1",
  },
  async (event) => {
    const snap = event.data;
    if (!snap) return;

    const data = snap.data();
    const docRef = snap.ref;

    // Si ya fue enviado, ignorar
    if (data.estado === "enviado") return;

    const transporter = crearTransportador();
    if (!transporter) {
      await docRef.update({
        estado: "error",
        error: "Faltan credenciales de Google Workspace / Gmail en el entorno del backend",
        intentos: (data.intentos || 0) + 1,
      });
      return;
    }

    const remitente = process.env.GMAIL_USER || "spinApp 2026 <notificaciones@spinapp.com>";
    const destinatario = Array.isArray(data.to) ? data.to.join(", ") : data.to;

    const mailOptions = {
      from: `"spinApp 2026 🏓" <${remitente}>`,
      to: destinatario,
      subject: data.subject || "Notificación de Torneo — spinApp 2026",
      text: data.text || "",
      html: data.html || "<p>Notificación spinApp</p>",
    };

    try {
      logger.info(`[spinApp Mailer] Despachando correo ${snap.id} hacia: ${destinatario}`);
      const info = await transporter.sendMail(mailOptions);
      logger.info(`[spinApp Mailer] Correo enviado exitosamente: ${info.messageId}`);

      await docRef.update({
        estado: "enviado",
        enviadoEn: Date.now(),
        messageId: info.messageId,
        error: null,
      });
    } catch (err) {
      logger.error(`[spinApp Mailer] Error al enviar correo ${snap.id}:`, err);
      await docRef.update({
        estado: "error",
        error: err.message || String(err),
        intentos: (data.intentos || 0) + 1,
      });
    }
  }
);

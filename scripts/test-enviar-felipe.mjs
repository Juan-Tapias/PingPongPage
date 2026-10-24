import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()

const user = process.env.GMAIL_USER || ''
const pass = (process.env.GMAIL_APP_PASSWORD || '').replace(/\s+/g, '')

if (!user || !pass) {
  console.error('❌ Error: Configura GMAIL_USER y GMAIL_APP_PASSWORD en tu archivo .env')
  process.exit(1)
}

console.log('Remitente:', user)
console.log('Creando transporte SMTP...')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user, pass }
})

// Importamos la plantilla directamente desde el build o la recreamos con el nuevo diseño
const loginUrl = 'https://spinapptorneo.web.app/login'

const html = `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>spinApp 2026</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800;900&display=swap');
    body {
      margin: 0 !important;
      padding: 0 !important;
      background-color: #060b16 !important;
      font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      color: #94a3b8;
    }
    .btn-cta:hover {
      background-color: #ea580c !important;
      box-shadow: 0 14px 32px rgba(249, 115, 22, 0.6) !important;
    }
  </style>
</head>
<body bgcolor="#060b16" style="margin: 0; padding: 0; background-color: #060b16; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  
  <div style="display: none; font-size: 1px; color: #060b16; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    ¡Eres Top 4 y avanzas directo a Cuartos de Final en spinApp 2026! &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#060b16" style="background-color: #060b16; padding: 32px 12px;">
    <tr>
      <td align="center">
        <!-- Contenedor Principal (max 600px) -->
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#0e172a" style="max-width: 600px; background-color: #0e172a; border: 1px solid #1e293b; border-radius: 28px; overflow: hidden; box-shadow: 0 25px 60px rgba(0, 0, 0, 0.65);">
          
          <!-- BANDA DE ACENTO NEÓN SUPERIOR -->
          <tr>
            <td bgcolor="#f97316" style="height: 5px; background: linear-gradient(90deg, #f97316 0%, #fb923c 40%, #38bdf8 100%); line-height: 5px; font-size: 1px;">&nbsp;</td>
          </tr>

          <!-- CABECERA DE MARCA OFICIAL -->
          <tr>
            <td align="center" bgcolor="#0b1329" style="padding: 36px 24px 26px 24px; background-color: #0b1329; border-bottom: 1px solid #1e293b;">
              <!-- Insignia Deportiva -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto 14px auto;">
                <tr>
                  <td align="center" bgcolor="#15223d" style="background-color: #15223d; border: 1px solid #f97316; border-radius: 50px; padding: 6px 18px;">
                    <span style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 11px; font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; color: #f97316 !important;">
                      🏓 CIRCUITO OFICIAL • CAMPUSLANDS
                    </span>
                  </td>
                </tr>
              </table>

              <!-- Logo Título spinApp 2026 -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 0 auto;">
                <tr>
                  <td align="center" style="padding: 2px 0;">
                    <span style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 34px; font-weight: 900; color: #ffffff !important; letter-spacing: -0.5px; line-height: 1.1;">
                      spin<span style="color: #f97316 !important;">App</span>
                    </span>
                    <span style="display: inline-block; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 14px; font-weight: 800; color: #38bdf8 !important; border: 1px solid #38bdf8; border-radius: 6px; padding: 2px 8px; vertical-align: middle; margin-left: 8px;">
                      2026
                    </span>
                  </td>
                </tr>
                <tr>
                  <td align="center" style="padding-top: 8px;">
                    <span style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 11px; font-weight: 700; color: #94a3b8 !important; letter-spacing: 2px; text-transform: uppercase;">
                      TORNEO OFICIAL DE TENIS DE MESA
                    </span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CUERPO DINÁMICO DEL CORREO -->
          <tr>
            <td bgcolor="#0e172a" style="padding: 34px 30px 38px 30px; background-color: #0e172a;">
              
              <!-- Badge Éxito -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 20px;">
                <tr>
                  <td bgcolor="#064e3b" style="background-color: #064e3b; border: 1px solid #10b981; border-radius: 50px; padding: 6px 18px;">
                    <span style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 11px; font-weight: 800; color: #34d399 !important; text-transform: uppercase; letter-spacing: 1.2px;">
                      🏆 Pase Directo a Cuartos (BYE)
                    </span>
                  </td>
                </tr>
              </table>

              <h1 style="margin: 0 0 14px 0; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 26px; font-weight: 900; color: #ffffff !important; line-height: 1.25;">
                ¡Nivel Estelar, <span style="color: #10b981 !important;">Felipe</span>!
              </h1>

              <p style="margin: 0 0 22px 0; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; color: #cbd5e1 !important; line-height: 1.6;">
                Ha culminado la Fase 1 (Round Robin) y tu desempeño ha sido formidable. Has asegurado el <strong style="color: #f97316 !important;">Puesto #1</strong> de la tabla general entre todos los competidores.
              </p>

              <!-- Explicación de la Ventaja Deportiva -->
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
                <tr>
                  <td bgcolor="#111c33" style="background-color: #111c33; border-left: 4px solid #10b981; border-top: 1px solid #1e293b; border-right: 1px solid #1e293b; border-bottom: 1px solid #1e293b; border-radius: 12px; padding: 22px;">
                    <h3 style="margin: 0 0 10px 0; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; font-weight: 800; color: #34d399 !important; text-transform: uppercase; letter-spacing: 0.5px;">
                      ⚡ Tu Ventaja Deportiva: BYE Directo a Cuartos
                    </h3>
                    <p style="margin: 0; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 14px; color: #e2e8f0 !important; line-height: 1.6;">
                      ¡Te has ganado el descanso! Como premio a tu liderato, <strong>pasas con BYE directo a Cuartos de Final (Anillo 2)</strong>. No juegas Octavos de Final (Play-In). Esperarás al ganador del repechaje para conocer a tu rival en el camino hacia la Corona.
                    </p>
                  </td>
                </tr>
              </table>

              <!-- Estadísticas de la Fase 1 -->
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#0b1329" style="background-color: #0b1329; border: 1px solid #1e293b; border-radius: 16px; margin-bottom: 28px; text-align: center;">
                <tr>
                  <td style="padding: 18px 12px; border-right: 1px solid #1e293b; width: 33%;">
                    <div style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 11px; font-weight: 800; color: #38bdf8 !important; text-transform: uppercase; letter-spacing: 1px;">POSICIÓN</div>
                    <div style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 24px; font-weight: 900; color: #ffffff !important; margin-top: 6px;">#1</div>
                  </td>
                  <td style="padding: 18px 12px; border-right: 1px solid #1e293b; width: 33%;">
                    <div style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 11px; font-weight: 800; color: #38bdf8 !important; text-transform: uppercase; letter-spacing: 1px;">PUNTOS</div>
                    <div style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 24px; font-weight: 900; color: #10b981 !important; margin-top: 6px;">21</div>
                  </td>
                  <td style="padding: 18px 12px; width: 34%;">
                    <div style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 11px; font-weight: 800; color: #38bdf8 !important; text-transform: uppercase; letter-spacing: 1px;">RÉCORD</div>
                    <div style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 24px; font-weight: 900; color: #f97316 !important; margin-top: 6px;">7 - 0</div>
                  </td>
                </tr>
              </table>

              <!-- BOTÓN CTA DE GALA (Pill Button con link a https://spinapptorneo.web.app/login) -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 34px auto 14px auto;">
                <tr>
                  <td align="center" bgcolor="#f97316" style="border-radius: 50px; background-color: #f97316; box-shadow: 0 10px 28px rgba(249, 115, 22, 0.45); padding: 0;">
                    <a href="${loginUrl}" target="_blank" class="btn-cta" style="display: inline-block; background-color: #f97316; padding: 16px 42px; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 14px; font-weight: 900; color: #ffffff !important; text-decoration: none; border-radius: 50px; text-transform: uppercase; letter-spacing: 1.2px; text-align: center; border: 1px solid #fb923c;">
                      VER CUADRO DE PLAYOFFS &nbsp;➔
                    </a>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- PIE DE PÁGINA CORPORATIVO -->
          <tr>
            <td bgcolor="#070d1a" style="padding: 28px 30px 36px 30px; background-color: #070d1a; border-top: 1px solid #1e293b; text-align: center;">
              <p style="margin: 0 0 8px 0; font-family: 'Manrope', -apple-system, Arial, sans-serif; font-size: 13px; font-weight: 800; color: #ffffff !important; letter-spacing: 0.5px;">
                spinApp Arena 2026 • Campuslands
              </p>
              <p style="margin: 0 0 16px 0; font-family: 'Manrope', -apple-system, Arial, sans-serif; font-size: 11px; color: #64748b !important; line-height: 1.6;">
                Plataforma oficial de arbitraje con PIN dinámico, WebRTC live streaming y control de circuito Berger.
              </p>
              <div style="margin-bottom: 14px;">
                <a href="${loginUrl}" target="_blank" style="font-family: 'Manrope', -apple-system, Arial, sans-serif; font-size: 12px; font-weight: 800; color: #38bdf8 !important; text-decoration: underline;">
                  Acceder a la plataforma oficial (${loginUrl})
                </a>
              </div>
              <p style="margin: 0; font-family: 'Manrope', -apple-system, Arial, sans-serif; font-size: 10px; color: #475569 !important;">
                Notificación transaccional automática despachada desde ${user}
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`

const mailOptions = {
  from: `"spinApp 2026 🏓" <${user}>`,
  to: 'felipechatgpt74@gmail.com',
  subject: '🔥 ¡FELICITACIONES! Eres TOP 4 y avanzas DIRECTO a Cuartos de Final — spinApp 2026',
  text: `¡FELICITACIONES Felipe!\nEres TOP 1 del Round Robin en spinApp 2026.\n¡Te has ganado el descanso! Como premio a tu liderato, pasas con BYE directo a Cuartos de Final (Anillo 2).\nVer cuadro de playoffs: ${loginUrl}`,
  html,
}

console.log('Enviando correo a felipechatgpt74@gmail.com...')
const info = await transporter.sendMail(mailOptions)
console.log('✅ Correo enviado con éxito!')
console.log('Message ID:', info.messageId)
console.log('Response:', info.response)

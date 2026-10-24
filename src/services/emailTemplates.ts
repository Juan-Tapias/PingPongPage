/**
 * Sistema de Plantillas de Correo Oficiales — spinApp 2026
 * Diseño responsivo en HTML/CSS oscuro deportivo con acentos Neón.
 * Paleta oficial:
 * - Primario CTA: #f97316 (Naranja Neón Pelota)
 * - Secundario / Subtítulos: #38bdf8 (Azul Tenis de Mesa)
 * - Éxito / Triunfo: #10b981 (Verde Esmeralda)
 * - Fondo global: #0f172a (Slate 900)
 * - Tarjeta contenedora: #1e293b (Slate 800)
 * - Textos: #ffffff (Títulos) / #94a3b8 (Cuerpo)
 * - Tipografía: Manrope, Arial, sans-serif
 */

export interface ContextoRecordatorioPartido {
  nombreJugador: string
  nombreRival: string
  fechaLimite?: string
  horasRestantes?: number
  pinSeguridad?: string
  enlacePartido?: string
  mesa?: string
  torneoNombre?: string
}

export interface ContextoTop4 {
  nombreJugador: string
  posicion: number
  puntos: number
  partidosGanados: number
  partidosPerdidos: number
  setsGanados?: number
  setsPerdidos?: number
  enlacePlayoffs?: string
  torneoNombre?: string
}

export interface ContextoPlayIn {
  nombreJugador: string
  posicion: number
  nombreRival?: string
  numeroLlave?: number
  enlacePlayoffs?: string
  torneoNombre?: string
}

export interface ContextoEliminados {
  nombreJugador: string
  posicionFinal?: number
  enlaceTabla?: string
  enlaceTransmision?: string
  torneoNombre?: string
}

export interface ContextoCuartos {
  nombreJugador: string
  nombreRival: string
  horarioEstimado?: string
  mesa?: string
  enlacePartido?: string
  torneoNombre?: string
}

export interface ContextoSemifinales {
  nombreJugador: string
  nombreRival: string
  horarioEstimado?: string
  mesa?: string
  bolsaPremio?: string
  enlaceCuadro?: string
  enlaceTransmision?: string
  torneoNombre?: string
}

export interface ContextoGranFinal {
  finalista1: {
    nombre: string
    fotoUrl?: string
    iniciales?: string
    seed?: number | string
  }
  finalista2: {
    nombre: string
    fotoUrl?: string
    iniciales?: string
    seed?: number | string
  }
  horario: string
  mesa?: string
  bolsaPremio: string
  enlaceTransmision: string
  torneoNombre?: string
}

export interface ContextoCampeon {
  nombreCampeon: string
  fotoCampeonUrl?: string
  nombreSubcampeon: string
  fotoSubcampeonUrl?: string
  marcadorFinal: string
  malleroMayorNombre?: string
  totalMallas?: number
  bolsaEntregada?: string
  enlacePodio?: string
  torneoNombre?: string
}

export interface ResultadoPlantilla {
  asunto: string
  html: string
  texto: string
}

const DEFAULT_BASE_URL = 'https://spinapptorneo.web.app'
const DEFAULT_LOGIN_URL = 'https://spinapptorneo.web.app/login'
const DEFAULT_LOGO_URL = 'https://spinapptorneo.web.app/logo.png'

/**
 * Plantilla Base (Shell) con diseño deportivo de gala y alta compatibilidad con Gmail Dark/Light Mode
 */
const plantillaBase = (contenidoHtml: string, preheader: string = 'spinApp 2026 — Tenis de Mesa'): string => {
  return `<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>spinApp 2026</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <style type="text/css">
    table, td, p, a, h1, h2, h3 { font-family: -apple-system, BlinkMacSystemFont, Arial, sans-serif !important; }
  </style>
  <![endif]-->
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800;900&display=swap');
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #060b16 !important;
      font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
      -webkit-font-smoothing: antialiased;
      color: #94a3b8;
    }
    img { border: 0; line-height: 100%; outline: none; text-decoration: none; display: block; }
    table { border-collapse: collapse !important; mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    a { text-decoration: none; }
    .btn-cta:hover {
      background-color: #ea580c !important;
      box-shadow: 0 14px 32px rgba(249, 115, 22, 0.6) !important;
    }
  </style>
</head>
<body bgcolor="#060b16" style="margin: 0; padding: 0; background-color: #060b16; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Arial, sans-serif;">
  
  <!-- Preheader oculto para bandeja de entrada -->
  <div style="display: none; font-size: 1px; color: #060b16; line-height: 1px; max-height: 0px; max-width: 0px; opacity: 0; overflow: hidden; mso-hide: all;">
    ${preheader} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
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
              ${contenidoHtml}
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
                <a href="${DEFAULT_LOGIN_URL}" target="_blank" style="font-family: 'Manrope', -apple-system, Arial, sans-serif; font-size: 12px; font-weight: 800; color: #38bdf8 !important; text-decoration: underline;">
                  Acceder a la plataforma (spinapptorneo.web.app/login)
                </a>
              </div>
              <p style="margin: 0; font-family: 'Manrope', -apple-system, Arial, sans-serif; font-size: 10px; color: #475569 !important;">
                Notificación transaccional automática despachada desde spinapp.torneo@gmail.com
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

/**
 * Generador de Botón CTA de Gala (Pill Button con resplandor neón, compatible con Gmail)
 */
const generarBotonCTA = (texto: string, url: string = DEFAULT_LOGIN_URL): string => {
  return `
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 34px auto 14px auto;">
      <tr>
        <td align="center" bgcolor="#f97316" style="border-radius: 50px; background-color: #f97316; box-shadow: 0 10px 28px rgba(249, 115, 22, 0.45); padding: 0;">
          <a href="${url}" target="_blank" class="btn-cta" style="display: inline-block; background-color: #f97316; padding: 16px 42px; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 14px; font-weight: 900; color: #ffffff !important; text-decoration: none; border-radius: 50px; text-transform: uppercase; letter-spacing: 1.2px; text-align: center; border: 1px solid #fb923c;">
            ${texto} &nbsp;➔
          </a>
        </td>
      </tr>
    </table>
  `
}

/**
 * Avatar circular con soporte de fotoUrl o iniciales con halo de neón
 */
const generarAvatar = (nombre: string, fotoUrl?: string, iniciales?: string, colorBorde = '#f97316'): string => {
  const init = iniciales || nombre.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase()
  if (fotoUrl && fotoUrl.trim().length > 0 && !fotoUrl.includes('placeholder')) {
    return `
      <div style="width: 72px; height: 72px; border-radius: 50%; overflow: hidden; border: 3px solid ${colorBorde}; box-shadow: 0 0 16px ${colorBorde}55; margin: 0 auto;">
        <img src="${fotoUrl}" alt="${nombre}" width="72" height="72" style="width: 72px; height: 72px; object-fit: cover; display: block;" />
      </div>
    `
  }
  return `
    <div style="width: 72px; height: 72px; border-radius: 50%; background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); border: 3px solid ${colorBorde}; box-shadow: 0 0 16px ${colorBorde}55; margin: 0 auto; text-align: center; line-height: 66px; font-size: 22px; font-weight: 800; color: #ffffff;">
      ${init}
    </div>
  `
}

// =============================================================================
// CATÁLOGO DE CORREOS
// =============================================================================

/**
 * CORREO 1: Recordatorio de Partida Pendiente por Jugar
 */
export const plantillaRecordatorioPartido = (ctx: ContextoRecordatorioPartido): ResultadoPlantilla => {
  const asunto = `🏓 [Recordatorio] Tienes un partido pendiente vs ${ctx.nombreRival} — spinApp 2026`
  const enlace = ctx.enlacePartido || `${DEFAULT_BASE_URL}/participacion`

  const contenidoHtml = `
    <!-- Badge de Fase / Estado -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
      <tr>
        <td style="background-color: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; border-radius: 20px; padding: 4px 14px;">
          <span style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px;">
            ⏰ Plazo Próximo a Vencer (48h)
          </span>
        </td>
      </tr>
    </table>

    <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.3;">
      ¡Hola, <span style="color: #f97316;">${ctx.nombreJugador}</span>!
    </h1>

    <p style="margin: 0 0 18px 0; font-size: 15px; color: #94a3b8; line-height: 1.6;">
      Tienes un partido oficial del torneo pendiente por disputar frente a <strong style="color: #ffffff;">${ctx.nombreRival}</strong>${ctx.mesa ? ` en la <strong style="color: #38bdf8;">${ctx.mesa}</strong>` : ''}.
    </p>

    <!-- Tarjeta de Plazo Límite -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 16px; padding: 18px 20px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 12px 16px;">
          <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px;">
            📅 Plazo Reglamentario
          </p>
          <p style="margin: 0; font-size: 14px; font-weight: 600; color: #ffffff;">
            ${ctx.fechaLimite ? `Fecha límite: <span style="color: #f97316;">${ctx.fechaLimite}</span>` : 'Debes disputarlo antes de completar las 48 horas desde su habilitación.'}
            ${typeof ctx.horasRestantes === 'number' ? ` <br><span style="color: #f59e0b; font-size: 12px;">Quedan aproximadamente <strong>${ctx.horasRestantes} horas</strong>.</span>` : ''}
          </p>
        </td>
      </tr>
    </table>

    <!-- Caja Destacada: PIN de 5 Dígitos -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(234, 88, 12, 0.05) 100%); border: 1px dashed #f97316; border-radius: 16px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 20px;">
          <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="font-size: 26px; vertical-align: top; width: 36px;">
                🔐
              </td>
              <td style="vertical-align: top; padding-left: 8px;">
                <p style="margin: 0 0 6px 0; font-size: 13px; font-weight: 800; color: #f97316; text-transform: uppercase; letter-spacing: 0.5px;">
                  Recordatorio Clave de Seguridad
                </p>
                <p style="margin: 0; font-size: 14px; font-weight: 500; color: #e2e8f0; line-height: 1.5;">
                  Recuerda tener listo tu <strong>PIN de 5 dígitos</strong> generado en la app para dictárselo al árbitro y validar el marcador oficial en tiempo real.
                </p>
                ${ctx.pinSeguridad ? `
                  <div style="margin-top: 12px; display: inline-block; background-color: #0f172a; border: 1px solid #f97316; padding: 6px 14px; border-radius: 10px; font-family: monospace; font-size: 18px; font-weight: 800; color: #f97316; letter-spacing: 4px;">
                    ${ctx.pinSeguridad}
                  </div>
                ` : ''}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    ${generarBotonCTA('Ver Partido en spinApp', enlace)}
  `

  const texto = `¡Hola, ${ctx.nombreJugador}!\nTienes un partido pendiente vs ${ctx.nombreRival} en spinApp 2026.\nPlazo límite: ${ctx.fechaLimite || '48 horas reglamentarias'}.\nRecuerda tener listo tu PIN de 5 dígitos generado en la app para dictárselo al árbitro y validar el marcador.\nEnlace: ${enlace}`

  return {
    asunto,
    html: plantillaBase(contenidoHtml, `Partido pendiente vs ${ctx.nombreRival} — Plazo 48h`),
    texto,
  }
}

/**
 * CORREO 2: Cierre Fase 1 — Top 4 Clasificados Directos a Cuartos
 */
export const plantillaTop4Clasificados = (ctx: ContextoTop4): ResultadoPlantilla => {
  const asunto = `🔥 ¡FELICITACIONES! Eres TOP 4 y avanzas DIRECTO a Cuartos de Final — spinApp 2026`
  const enlace = ctx.enlacePlayoffs || DEFAULT_LOGIN_URL

  const contenidoHtml = `
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
      ¡Nivel Estelar, <span style="color: #10b981 !important;">${ctx.nombreJugador}</span>!
    </h1>

    <p style="margin: 0 0 22px 0; font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 15px; color: #cbd5e1 !important; line-height: 1.6;">
      Ha culminado la Fase 1 (Round Robin) y tu desempeño ha sido formidable. Has asegurado el <strong style="color: #f97316 !important;">Puesto #${ctx.posicion}</strong> de la tabla general entre todos los competidores.
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
          <div style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 24px; font-weight: 900; color: #ffffff !important; margin-top: 6px;">#${ctx.posicion}</div>
        </td>
        <td style="padding: 18px 12px; border-right: 1px solid #1e293b; width: 33%;">
          <div style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 11px; font-weight: 800; color: #38bdf8 !important; text-transform: uppercase; letter-spacing: 1px;">PUNTOS</div>
          <div style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 24px; font-weight: 900; color: #10b981 !important; margin-top: 6px;">${ctx.puntos}</div>
        </td>
        <td style="padding: 18px 12px; width: 34%;">
          <div style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 11px; font-weight: 800; color: #38bdf8 !important; text-transform: uppercase; letter-spacing: 1px;">RÉCORD</div>
          <div style="font-family: 'Manrope', -apple-system, BlinkMacSystemFont, Arial, sans-serif; font-size: 24px; font-weight: 900; color: #f97316 !important; margin-top: 6px;">${ctx.partidosGanados} - ${ctx.partidosPerdidos}</div>
        </td>
      </tr>
    </table>

    ${generarBotonCTA('Ver Cuadro de Playoffs', enlace)}
  `

  const texto = `¡FELICITACIONES ${ctx.nombreJugador}!\nEres TOP ${ctx.posicion} del Round Robin en spinApp 2026.\n¡Te has ganado el descanso! Como premio a tu liderato, pasas con BYE directo a Cuartos de Final (Anillo 2). No juegas Octavos de Final (Play-In). Esperarás al ganador del repechaje para conocer a tu rival.\nVer cuadro: ${enlace}`

  return {
    asunto,
    html: plantillaBase(contenidoHtml, `¡Eres Top 4 y avanzas directo a Cuartos de Final!`),
    texto,
  }
}

/**
 * CORREO 3: Cierre Fase 1 — Puestos 5 al 12 (Clasificados a Octavos / Play-In)
 */
export const plantillaOctavosPlayIn = (ctx: ContextoPlayIn): ResultadoPlantilla => {
  const asunto = `⚡ ¡CLASIFICASTE A FASE 2! Te espera el Play-In de Octavos — spinApp 2026`
  const enlace = ctx.enlacePlayoffs || DEFAULT_LOGIN_URL

  const contenidoHtml = `
    <!-- Badge Azul Tenis de Mesa -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
      <tr>
        <td style="background-color: rgba(56, 189, 248, 0.15); border: 1px solid #38bdf8; border-radius: 20px; padding: 4px 14px;">
          <span style="font-size: 11px; font-weight: 800; color: #38bdf8; text-transform: uppercase; letter-spacing: 1px;">
            ⚡ Anillo 3 • Play-In de Octavos
          </span>
        </td>
      </tr>
    </table>

    <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.3;">
      ¡Objetivo cumplido, <span style="color: #38bdf8;">${ctx.nombreJugador}</span>!
    </h1>

    <p style="margin: 0 0 18px 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
      Has sellado tu clasificación a la Fase 2 ubicándote en la posición <strong style="color: #f97316;">#${ctx.posicion}</strong> de la tabla general. ¡Estás entre los 12 mejores jugadores del circuito!
    </p>

    <!-- Explicación del Camino Play-In -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%); border: 1px solid #38bdf8; border-radius: 18px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 22px;">
          <h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 800; color: #38bdf8;">
            🏓 Tu reto en Fase 2: Muerte Súbita
          </h3>
          <p style="margin: 0 0 12px 0; font-size: 14px; color: #e2e8f0; line-height: 1.6;">
            Tu camino arranca en los <strong>Octavos de Final (Play-In)</strong>. Te disputarás a partido único el boleto para enfrentar al Top 4 en Cuartos de Final.
          </p>
          ${ctx.nombreRival ? `
            <div style="background-color: #0f172a; border: 1px solid #334155; padding: 10px 14px; border-radius: 12px; font-size: 13px; color: #ffffff;">
              Rival de llave asignado: <strong style="color: #f97316;">${ctx.nombreRival}</strong>
            </div>
          ` : ''}
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 10px 0; font-size: 14px; color: #94a3b8; text-align: center;">
      Prepárate para afinar el saque y asegurar tu lugar en el cuadro principal.
    </p>

    ${generarBotonCTA('Ver mi Llave de Octavos', enlace)}
  `

  const texto = `¡CLASIFICASTE A FASE 2 ${ctx.nombreJugador}!\nQuedaste en el puesto #${ctx.posicion} de spinApp 2026.\nTu camino arranca en los Octavos de Final (Play-In). Te disputarás a partido único el boleto para enfrentar al Top 4 en Cuartos de Final.\n${ctx.nombreRival ? `Rival: ${ctx.nombreRival}\n` : ''}Ver llave: ${enlace}`

  return {
    asunto,
    html: plantillaBase(contenidoHtml, `¡Clasificaste a los Octavos de Final (Play-In)!`),
    texto,
  }
}

/**
 * CORREO 4: Cierre Fase 1 — Agradecimiento y Motivación a Eliminados
 */
export const plantillaEliminadosMotivacion = (ctx: ContextoEliminados): ResultadoPlantilla => {
  const asunto = `🏓 ¡Gracias por tu entrega en la mesa! Nos vemos en el próximo torneo — spinApp 2026`
  const enlace = ctx.enlaceTabla || DEFAULT_LOGIN_URL

  const contenidoHtml = `
    <!-- Badge Deportivo -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
      <tr>
        <td style="background-color: rgba(249, 115, 22, 0.15); border: 1px solid #f97316; border-radius: 20px; padding: 4px 14px;">
          <span style="font-size: 11px; font-weight: 800; color: #f97316; text-transform: uppercase; letter-spacing: 1px;">
            🏓 Espíritu Deportivo • spinApp Community
          </span>
        </td>
      </tr>
    </table>

    <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.3;">
      ¡Gracias por tu entrega, <span style="color: #f97316;">${ctx.nombreJugador}</span>!
    </h1>

    <p style="margin: 0 0 18px 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
      De parte de todo el equipo organizador de <strong>spinApp</strong>, queremos agradecerte de corazón por tu entusiasmo, deportividad y por dejarlo todo en cada punto de esta Fase Regular.
    </p>

    <!-- Caja Motivacional -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.95) 100%); border: 1px solid #334155; border-radius: 18px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 22px;">
          <p style="margin: 0 0 12px 0; font-size: 15px; font-weight: 600; color: #ffffff; line-height: 1.6;">
            <em>"El ping pong siempre da revancha. Las mesas siguen disponibles para entrenar y mejorar los saques con efecto. ¡Te esperamos con toda la energía en la próxima edición de spinApp!"</em>
          </p>
          <p style="margin: 0; font-size: 13px; color: #94a3b8; line-height: 1.5;">
            El torneo continúa con la emoción de los Playoffs. Te invitamos a acompañar a tus compañeros, disfrutar de la transmisión en vivo y apoyar a los clasificados en las rondas finales.
          </p>
        </td>
      </tr>
    </table>

    ${generarBotonCTA('Ver Tabla de Posiciones Final', enlace)}
  `

  const texto = `¡Gracias por tu entrega ${ctx.nombreJugador}!\nAgradecemos tu entusiasmo y deportividad en spinApp 2026.\nEl ping pong siempre da revancha. Las mesas siguen disponibles para entrenar y mejorar los saques con efecto. ¡Te esperamos con toda la energía en la próxima edición de spinApp!\nVer posiciones: ${enlace}`

  return {
    asunto,
    html: plantillaBase(contenidoHtml, `Gracias por tu entrega en la mesa — spinApp 2026`),
    texto,
  }
}

/**
 * CORREO 5: Fase 2 — Cuartos de Final Confirmados
 */
export const plantillaCuartosDeFinal = (ctx: ContextoCuartos): ResultadoPlantilla => {
  const asunto = `⚔️ Cuartos de Final Definidos: ${ctx.nombreJugador} vs ${ctx.nombreRival} — spinApp 2026`
  const enlace = ctx.enlacePartido || DEFAULT_LOGIN_URL

  const contenidoHtml = `
    <!-- Badge Cuartos -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
      <tr>
        <td style="background-color: rgba(249, 115, 22, 0.15); border: 1px solid #f97316; border-radius: 20px; padding: 4px 14px;">
          <span style="font-size: 11px; font-weight: 800; color: #f97316; text-transform: uppercase; letter-spacing: 1px;">
            ⚔️ Anillo 2 • Cuartos de Final
          </span>
        </td>
      </tr>
    </table>

    <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.3;">
      ¡Duelo de Alto Impacto, <span style="color: #f97316;">${ctx.nombreJugador}</span>!
    </h1>

    <p style="margin: 0 0 18px 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
      Los Cuartos de Final han quedado definidos oficialmente. Estás entre los 8 mejores del torneo y te enfrentarás a un rival de máximo nivel por el boleto a semifinales.
    </p>

    <!-- Tarjeta Enfrentamiento VS -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 18px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 24px; text-align: center;">
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width: 42%; text-align: center;">
                <div style="font-size: 16px; font-weight: 800; color: #ffffff;">${ctx.nombreJugador}</div>
                <div style="font-size: 11px; color: #10b981; font-weight: 700; margin-top: 4px;">Top Contender</div>
              </td>
              <td style="width: 16%; text-align: center;">
                <span style="display: inline-block; padding: 6px 12px; background-color: #f97316; color: #ffffff; border-radius: 8px; font-weight: 900; font-size: 14px;">
                  VS
                </span>
              </td>
              <td style="width: 42%; text-align: center;">
                <div style="font-size: 16px; font-weight: 800; color: #ffffff;">${ctx.nombreRival}</div>
                <div style="font-size: 11px; color: #38bdf8; font-weight: 700; margin-top: 4px;">Rival de Turno</div>
              </td>
            </tr>
          </table>
          ${ctx.mesa || ctx.horarioEstimado ? `
            <div style="margin-top: 16px; padding-top: 14px; border-top: 1px solid #1e293b; font-size: 12px; color: #94a3b8;">
              ${ctx.mesa ? `📍 Mesa: <strong style="color: #ffffff;">${ctx.mesa}</strong> • ` : ''}
              ${ctx.horarioEstimado ? `⏰ Horario: <strong style="color: #ffffff;">${ctx.horarioEstimado}</strong>` : ''}
            </div>
          ` : ''}
        </td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 14px; color: #94a3b8; text-align: center;">
      El ganador de este partido asegura automáticamente su presencia en el cuadro de honor de semifinales.
    </p>

    ${generarBotonCTA('Ver Partido en spinApp', enlace)}
  `

  const texto = `Cuartos de Final Definidos: ${ctx.nombreJugador} vs ${ctx.nombreRival} — spinApp 2026.\nEl ganador de este cruce asegura su pase a Semifinales.\nVer partido: ${enlace}`

  return {
    asunto,
    html: plantillaBase(contenidoHtml, `Cuartos de Final Definidos: ${ctx.nombreJugador} vs ${ctx.nombreRival}`),
    texto,
  }
}

/**
 * CORREO 6: Fase 2 — Semifinalistas (Top 4 del Torneo)
 */
export const plantillaSemifinales = (ctx: ContextoSemifinales): ResultadoPlantilla => {
  const asunto = `🌟 ¡ESTÁS EN SEMIFINALES! A un paso de la gloria — spinApp 2026`
  const enlace = ctx.enlaceCuadro || DEFAULT_LOGIN_URL

  const contenidoHtml = `
    <!-- Badge Semifinales -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
      <tr>
        <td style="background-color: rgba(245, 158, 11, 0.15); border: 1px solid #f59e0b; border-radius: 20px; padding: 4px 14px;">
          <span style="font-size: 11px; font-weight: 800; color: #f59e0b; text-transform: uppercase; letter-spacing: 1px;">
            🌟 Cuadro de Honor • Semifinales
          </span>
        </td>
      </tr>
    </table>

    <h1 style="margin: 0 0 12px 0; font-size: 24px; font-weight: 800; color: #ffffff; line-height: 1.3;">
      ¡A un paso de la gloria, <span style="color: #f59e0b;">${ctx.nombreJugador}</span>!
    </h1>

    <p style="margin: 0 0 18px 0; font-size: 15px; color: #cbd5e1; line-height: 1.6;">
      Has superado todas las barreras y te has consagrado entre los <strong>4 mejores jugadores de spinApp 2026</strong>. La final está al alcance de tu pala.
    </p>

    <!-- Tarjeta Semifinal -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.12) 0%, rgba(15, 23, 42, 0.8) 100%); border: 1px solid #f59e0b; border-radius: 18px; margin-bottom: 24px;">
      <tr>
        <td style="padding: 22px;">
          <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; color: #f59e0b; letter-spacing: 0.5px;">
            Tu Duelo de Semifinal
          </p>
          <div style="font-size: 18px; font-weight: 800; color: #ffffff; margin-bottom: 8px;">
            ${ctx.nombreJugador} <span style="color: #f97316;">VS</span> ${ctx.nombreRival}
          </div>
          <p style="margin: 0; font-size: 13px; color: #cbd5e1; line-height: 1.5;">
            ${ctx.horarioEstimado ? `Horario: <strong>${ctx.horarioEstimado}</strong> • ` : ''}
            ${ctx.mesa ? `Mesa: <strong>${ctx.mesa}</strong> • ` : ''}
            ${ctx.bolsaPremio ? `Bolsa en disputa: <strong style="color: #10b981;">$${ctx.bolsaPremio} COP</strong>` : 'Bolsa 100% Campeón'}
          </p>
        </td>
      </tr>
    </table>

    <p style="margin: 0; font-size: 14px; color: #94a3b8; text-align: center;">
      El partido contará con transmisión en vivo y señal de marcador punto a punto.
    </p>

    ${generarBotonCTA('Ver Semifinales en spinApp', enlace)}
  `

  const texto = `¡ESTÁS EN SEMIFINALES ${ctx.nombreJugador}!\nTe encuentras en el cuadro de honor de spinApp 2026.\nTu cruce: ${ctx.nombreJugador} vs ${ctx.nombreRival}.\nVer cuadro: ${enlace}`

  return {
    asunto,
    html: plantillaBase(contenidoHtml, `¡Estás en Semifinales de spinApp 2026!`),
    texto,
  }
}

/**
 * CORREO 7: La Gran Final (Duelo por el Título spinApp 2026)
 */
export const plantillaGranFinal = (ctx: ContextoGranFinal): ResultadoPlantilla => {
  const f1 = ctx.finalista1.nombre
  const f2 = ctx.finalista2.nombre
  const asunto = `🏆 GRAN FINAL spinApp 2026: ${f1} VS ${f2} — ¡No te lo pierdas!`
  const enlace = ctx.enlaceTransmision || DEFAULT_LOGIN_URL

  const contenidoHtml = `
    <!-- Cartel Especial Gran Final Gala -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
      <tr>
        <td style="background-color: rgba(249, 115, 22, 0.2); border: 1px solid #f97316; border-radius: 20px; padding: 4px 16px;">
          <span style="font-size: 11px; font-weight: 900; color: #f97316; text-transform: uppercase; letter-spacing: 1.5px;">
            👑 La Batalla por la Corona
          </span>
        </td>
      </tr>
    </table>

    <h1 style="margin: 0 0 10px 0; font-size: 26px; font-weight: 800; color: #ffffff; line-height: 1.2; text-align: center;">
      GRAN FINAL spinApp 2026
    </h1>

    <p style="margin: 0 0 24px 0; font-size: 15px; color: #94a3b8; text-align: center; line-height: 1.5;">
      El momento cúspide del torneo ha llegado. Dos atletas extraordinarios, una sola mesa y la gloria absoluta.
    </p>

    <!-- Cartel Deportivo VS con Fotos / Avatares (Coordinación Sebas) -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background: radial-gradient(circle, #1e293b 0%, #0b1120 100%); border: 2px solid #f97316; border-radius: 22px; margin-bottom: 24px; box-shadow: 0 10px 30px rgba(249, 115, 22, 0.25);">
      <tr>
        <td style="padding: 28px 16px;">
          <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
            <tr>
              <!-- Finalista 1 -->
              <td style="width: 40%; text-align: center; vertical-align: top;">
                ${generarAvatar(ctx.finalista1.nombre, ctx.finalista1.fotoUrl, ctx.finalista1.iniciales, '#38bdf8')}
                <div style="font-size: 15px; font-weight: 800; color: #ffffff; margin-top: 12px; line-height: 1.2;">
                  ${ctx.finalista1.nombre}
                </div>
                <div style="font-size: 11px; font-weight: 700; color: #38bdf8; text-transform: uppercase; margin-top: 4px;">
                  Finalista
                </div>
              </td>

              <!-- VS Badge Neón Central -->
              <td style="width: 20%; text-align: center; vertical-align: middle;">
                <div style="width: 46px; height: 46px; border-radius: 50%; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); line-height: 46px; font-size: 16px; font-weight: 900; color: #ffffff; margin: 0 auto; box-shadow: 0 0 20px rgba(249, 115, 22, 0.6);">
                  VS
                </div>
              </td>

              <!-- Finalista 2 -->
              <td style="width: 40%; text-align: center; vertical-align: top;">
                ${generarAvatar(ctx.finalista2.nombre, ctx.finalista2.fotoUrl, ctx.finalista2.iniciales, '#10b981')}
                <div style="font-size: 15px; font-weight: 800; color: #ffffff; margin-top: 12px; line-height: 1.2;">
                  ${ctx.finalista2.nombre}
                </div>
                <div style="font-size: 11px; font-weight: 700; color: #10b981; text-transform: uppercase; margin-top: 4px;">
                  Finalista
                </div>
              </td>
            </tr>
          </table>

          <!-- Datos de la Gran Final: Horario, Mesa, Bolsa -->
          <div style="margin-top: 24px; padding-top: 18px; border-top: 1px solid #334155; text-align: center;">
            <p style="margin: 0 0 8px 0; font-size: 13px; color: #cbd5e1;">
              📍 Mesa: <strong style="color: #ffffff;">${ctx.mesa || 'Mesa 1 (Cancha Principal)'}</strong> • ⏰ Hora: <strong style="color: #ffffff;">${ctx.horario}</strong>
            </p>
            <p style="margin: 0; font-size: 14px; font-weight: 800; color: #fbbf24;">
              💰 Bolsa de Premios 100% al Campeón: $${ctx.bolsaPremio} COP
            </p>
          </div>
        </td>
      </tr>
    </table>

    <!-- Botón Destacado de Transmisión en Vivo -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin: 28px auto 8px auto;">
      <tr>
        <td align="center" style="border-radius: 16px; background: linear-gradient(135deg, #ef4444 0%, #b91c1c 100%); box-shadow: 0 8px 25px rgba(239, 68, 68, 0.5);">
          <a href="${enlace}" target="_blank" class="hover-cta" style="display: inline-block; padding: 16px 36px; font-family: 'Manrope', Arial, sans-serif; font-size: 15px; font-weight: 900; color: #ffffff; text-decoration: none; border-radius: 16px; text-transform: uppercase; letter-spacing: 1px;">
            🔴 Ver Transmisión en Vivo
          </a>
        </td>
      </tr>
    </table>
  `

  const texto = `🏆 GRAN FINAL spinApp 2026: ${f1} VS ${f2}\nHora: ${ctx.horario} • Mesa: ${ctx.mesa || 'Mesa 1'}\nBolsa: $${ctx.bolsaPremio} COP\nVer transmisión en vivo: ${enlace}`

  return {
    asunto,
    html: plantillaBase(contenidoHtml, `GRAN FINAL: ${f1} vs ${f2} — ¡Míralo en vivo!`),
    texto,
  }
}

/**
 * CORREO 8: Coronación del Gran Campeón
 */
export const plantillaCoronacionCampeon = (ctx: ContextoCampeon): ResultadoPlantilla => {
  const asunto = `👑 ¡TENEMOS CAMPEÓN! ${ctx.nombreCampeon} se corona en spinApp 2026`
  const enlace = ctx.enlacePodio || DEFAULT_LOGIN_URL

  const contenidoHtml = `
    <!-- Badge Corona Dorada -->
    <table role="presentation" border="0" cellpadding="0" cellspacing="0" style="margin-bottom: 16px;">
      <tr>
        <td style="background-color: rgba(245, 158, 11, 0.2); border: 1px solid #f59e0b; border-radius: 20px; padding: 4px 16px;">
          <span style="font-size: 11px; font-weight: 900; color: #fbbf24; text-transform: uppercase; letter-spacing: 1.5px;">
            👑 Coronación Oficial • spinApp 2026
          </span>
        </td>
      </tr>
    </table>

    <h1 style="margin: 0 0 10px 0; font-size: 26px; font-weight: 800; color: #ffffff; line-height: 1.2; text-align: center;">
      ¡Tenemos Nuevo Campeón!
    </h1>

    <p style="margin: 0 0 24px 0; font-size: 15px; color: #94a3b8; text-align: center; line-height: 1.5;">
      El torneo de tenis de mesa más vibrante del año ha coronado a su rey indiscutible.
    </p>

    <!-- Tarjeta de Honor del Campeón -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background: radial-gradient(circle, #292010 0%, #0f172a 100%); border: 2px solid #fbbf24; border-radius: 22px; margin-bottom: 24px; box-shadow: 0 12px 35px rgba(251, 191, 36, 0.25);">
      <tr>
        <td style="padding: 28px 20px; text-align: center;">
          <div style="font-size: 40px; margin-bottom: 10px;">👑</div>
          ${generarAvatar(ctx.nombreCampeon, ctx.fotoCampeonUrl, undefined, '#fbbf24')}
          <h2 style="margin: 14px 0 4px 0; font-size: 22px; font-weight: 800; color: #ffffff;">
            ${ctx.nombreCampeon}
          </h2>
          <div style="font-size: 13px; font-weight: 800; color: #fbbf24; text-transform: uppercase; letter-spacing: 1px;">
            Gran Campeón spinApp 2026
          </div>
          ${ctx.bolsaEntregada ? `
            <div style="margin-top: 10px; display: inline-block; background-color: rgba(16, 185, 129, 0.15); border: 1px solid #10b981; padding: 4px 14px; border-radius: 12px; font-size: 13px; font-weight: 800; color: #10b981;">
              Ganador de la Bolsa: $${ctx.bolsaEntregada} COP
            </div>
          ` : ''}
        </td>
      </tr>
    </table>

    <!-- Reconocimiento al Subcampeón y Marcador Final -->
    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background-color: #0f172a; border: 1px solid #334155; border-radius: 16px; padding: 18px 20px; margin-bottom: 20px;">
      <tr>
        <td style="padding: 14px 18px;">
          <p style="margin: 0 0 6px 0; font-size: 12px; font-weight: 700; color: #38bdf8; text-transform: uppercase; letter-spacing: 0.5px;">
            🥈 Subcampeón Oficial
          </p>
          <p style="margin: 0 0 10px 0; font-size: 15px; font-weight: 700; color: #ffffff;">
            ${ctx.nombreSubcampeon} <span style="font-size: 12px; color: #94a3b8; font-weight: 400;">(Marcador de la Final: <strong style="color: #f97316;">${ctx.marcadorFinal}</strong>)</span>
          </p>
          <p style="margin: 0; font-size: 12px; color: #94a3b8; line-height: 1.5;">
            Un aplauso y reconocimiento total al subcampeón por su entrega heroica y alto nivel competitivo en la mesa principal.
          </p>
        </td>
      </tr>
    </table>

    <!-- Mención de Honor: El Mallero Mayor -->
    ${ctx.malleroMayorNombre ? `
      <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, rgba(56, 189, 248, 0.1) 0%, rgba(15, 23, 42, 0.8) 100%); border: 1px dashed #38bdf8; border-radius: 16px; margin-bottom: 24px;">
        <tr>
          <td style="padding: 16px 20px;">
            <p style="margin: 0 0 4px 0; font-size: 12px; font-weight: 800; color: #38bdf8; text-transform: uppercase;">
              🕸️ Mención Especial: Mallero Mayor
            </p>
            <p style="margin: 0; font-size: 13px; color: #e2e8f0; line-height: 1.5;">
              Felicitamos con mucho cariño a <strong style="color: #ffffff;">${ctx.malleroMayorNombre}</strong>${typeof ctx.totalMallas === 'number' ? ` con un registro de <strong>${ctx.totalMallas} mallas</strong>` : ''} por esos toques de red inolvidables que llenaron de suspenso cada punto.
            </p>
          </td>
        </tr>
      </table>
    ` : ''}

    ${generarBotonCTA('Ver Cuadro de Honor y Estadísticas', enlace)}
  `

  const texto = `👑 ¡TENEMOS CAMPEÓN! ${ctx.nombreCampeon} se corona en spinApp 2026.\nSubcampeón: ${ctx.nombreSubcampeon}\nMarcador final: ${ctx.marcadorFinal}\n${ctx.malleroMayorNombre ? `Mallero Mayor: ${ctx.malleroMayorNombre}\n` : ''}Ver podio: ${enlace}`

  return {
    asunto,
    html: plantillaBase(contenidoHtml, `¡${ctx.nombreCampeon} se corona campeón de spinApp 2026!`),
    texto,
  }
}

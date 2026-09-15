/* ============================================================
   PLANTILLA DE CORREO REUTILIZABLE · Elyron
   ------------------------------------------------------------
   Sistema de plantillas de email compatible con Gmail, Outlook,
   Apple Mail y clientes móviles.

   Principios:
   - Tablas + estilos inline + atributos `bgcolor` (email-safe).
   - Primero móvil: ancho máximo 600px, botones grandes,
     URLs con word-break.
   - Identidad de marca real de Elyron (muñeco "Elir" como logo).
   - Sin emojis, sin gradientes exagerados, sin animaciones.
   - Fallback claro si los estilos avanzados no se soportan.

   Estructura conceptual:
     EmailLayout
       ├── Preheader (invisible)
       ├── BrandHeader (logo Elir + wordmark)
       ├── EmailContent
       ├── PrimaryButton (bulletproof)
       ├── FallbackLink
       ├── SecurityNotice
       └── EmailFooter
   ============================================================ */

/* URL pública de la imagen de diseño del correo.
   Se sirve desde el backend (uploads) para que los clientes de correo
   (Gmail/Outlook, móvil y escritorio) puedan cargarla, a diferencia de
   una imagen incrustada en base64 que muchos clientes bloquean. */
const EMAIL_IMAGE_URL =
  (process.env.PUBLIC_API_URL || 'http://localhost:3000').replace(/\/$/, '') +
  '/uploads/correo.png';

/* ---------- Utilidades ---------- */

const esc = (v: string | number | undefined | null): string =>
  String(v ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

const FONT = "'Helvetica Neue', Helvetica, Arial, sans-serif";

/** Escudo sutil (seguridad). */
const shieldSvg = (size = 15): string => `
  <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none">
    <path d="M12 2l8 3.5v5.2c0 5.1-3.3 9.3-8 11.3-4.7-2-8-6.2-8-11.3V5.5L12 2z" fill="#12325c"/>
    <path d="M8.5 12l2.2 2.2 4.8-4.8" stroke="#7fb3ff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;

/* ---------- Secciones reutilizables ---------- */

const preheader = (texto: string): string => `
  <div style="display:none;max-height:0;overflow:hidden;mso-hide:all;opacity:0;font-size:1px;line-height:1px;color:#0b1220;visibility:hidden" aria-hidden="true">
    ${esc(texto)}
    &nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;
  </div>`;

const primaryButton = (texto: string, url: string): string => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:24px auto 6px;">
    <tr>
      <td align="center" bgcolor="#7fb3ff" style="border-radius:999px;background:#7fb3ff;">
        <a href="${esc(url)}" target="_blank" rel="noopener"
           style="display:inline-block;background:#7fb3ff;color:#0b1713;text-decoration:none;font-family:${FONT};font-size:15px;font-weight:800;line-height:1;padding:16px 30px;border-radius:999px;mso-padding-alt:16px 30px;letter-spacing:0.2px;">
          ${esc(texto)}
        </a>
      </td>
    </tr>
  </table>`;

const fallbackLink = (url: string): string => `
  <div style="background:#111a2b;border:1px solid #2b3d5c;border-radius:12px;padding:14px 16px;margin-top:22px;">
    <div style="color:#c6d4e8;font-size:13px;font-weight:700;font-family:${FONT}">¿El botón no funciona?</div>
    <div style="color:#8296b3;font-size:12px;line-height:1.5;margin-top:3px;font-family:${FONT}">Copia y pega este enlace en tu navegador:</div>
    <a href="${esc(url)}" target="_blank" rel="noopener"
       style="display:block;color:#7fb3ff;font-size:12px;line-height:1.5;word-break:break-all;overflow-wrap:break-word;text-decoration:underline;margin-top:6px;font-family:${FONT}">${esc(url)}</a>
  </div>`;

const securityNotice = (textoVigencia: string): string => `
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:14px;">
    <tr>
      <td valign="middle" style="width:20px;vertical-align:middle">${shieldSvg(16)}</td>
      <td valign="middle" style="vertical-align:middle;padding-left:9px;color:#8fa3bf;font-size:12px;line-height:1.6;font-family:${FONT}">${textoVigencia}</td>
    </tr>
  </table>`;

const footer = (year: string | number): string => `
  <tr>
    <td style="background:#0a0f1a;border-radius:0 0 20px 20px;padding:20px 32px 26px;text-align:center;" bgcolor="#0a0f1a" align="center">
      <div style="color:#8fa3bf;font-size:12px;font-weight:700;font-family:${FONT}">Elyron<span style="color:#7fb3ff">.</span></div>
      <div style="color:#6f829e;font-size:11px;line-height:1.6;margin-top:3px;font-family:${FONT}">Plataforma de gestión académica</div>
      <div style="border-top:1px solid #22314a;margin:16px auto 12px;max-width:220px;width:100%;"></div>
      <div style="color:#6f829e;font-size:10px;line-height:1.6;font-family:${FONT}">
        © ${esc(year)} Elyron · Este es un correo automático, por favor no respondas directamente.
      </div>
    </td>
  </tr>`;

/** Envuelve el contenido en la estructura email-safe completa. */
export function emailLayout(opts: {
  preheaderText: string;
  eyebrow?: string;
  title?: string;
  contentHtml: string;
  year: string | number;
}): string {
  const eyebrow = opts.eyebrow
    ? `<div style="margin:0 0 10px;color:#8fe3ff;font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;font-family:${FONT};">${esc(opts.eyebrow)}</div>`
    : '';
  const title = opts.title
    ? `<h1 style="margin:0;color:#f4f7fb;font-size:32px;line-height:1.04;font-weight:800;font-family:${FONT};letter-spacing:-0.04em;">${esc(opts.title)}</h1>`
    : '';

  return `
<!DOCTYPE html>
<html lang="es" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <title>Elyron</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    body, .body, #bodyTable { margin:0; padding:0; width:100% !important; }
    table { border-collapse: collapse; }
    img { border:0; line-height:100%; }
    a { text-decoration: none; }
  </style>
</head>
<body style="margin:0;padding:0;width:100%;background:#070d17;" bgcolor="#070d17">
  ${preheader(opts.preheaderText)}
  <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background:#070d17;">
    <tr>
      <td align="center" style="padding:28px 16px 40px;">
        <!--[if mso]><table role="presentation" width="600"><tr><td><![endif]-->
        <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#08131f;border:1px solid #1e2d3d;border-radius:22px;overflow:hidden;" bgcolor="#08131f">
          <tr>
            <td style="padding:14px 20px 10px;background:#0a1725;" bgcolor="#0a1725">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="font-family:${FONT};font-size:12px;color:#eaf5ff;font-weight:800;letter-spacing:-0.02em;">
                    <span style="display:inline-block;width:26px;height:26px;line-height:26px;border-radius:8px;background:#7fb3ff;color:#07131e;text-align:center;font-size:15px;font-weight:900;">E</span>
                    <span style="display:inline-block;vertical-align:middle;margin-left:8px;color:#edf7ff;">Elyron</span>
                  </td>
                  <td align="right" style="font-family:${FONT};font-size:11px;color:#9fb5ce;">
                    7:13 PM
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:12px 18px 0;background:#08131f;" bgcolor="#08131f">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                <tr>
                  <td valign="top" width="57%" style="padding:8px 8px 0 10px;background:#08131f;vertical-align:top;">
                    <div style="color:#7ec9ff;font-size:11px;font-weight:700;letter-spacing:1.8px;text-transform:uppercase;font-family:${FONT};margin:0 0 8px;">Elyron.</div>
                    ${eyebrow}
                    ${title}
                    <div style="padding-top:12px;">${opts.contentHtml}</div>
                  </td>
                  <td valign="middle" width="43%" align="center" style="padding:0 10px 0 0;background:#08131f;vertical-align:middle;">
                    <img src="${EMAIL_IMAGE_URL}" alt="Elyron" width="240" style="display:block;width:100%;max-width:240px;height:auto;border:0;line-height:100%;background:#08131f;" />
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 18px 0;background:#08131f;" bgcolor="#08131f">
              <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0" style="background:rgba(107,188,255,0.08);border:1px solid rgba(151,201,255,0.12);border-radius:16px;">
                <tr>
                  <td style="padding:12px 12px 10px;">
                    <table role="presentation" width="100%" border="0" cellpadding="0" cellspacing="0">
                      <tr>
                        <td width="25%" align="center" style="font-family:${FONT};font-size:10px;color:#d9ebff;line-height:1.3;">
                          <div style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#9ed9ff;color:#0a1725;font-size:11px;font-weight:900;line-height:18px;text-align:center;">E</div><br />
                          Elyron
                        </td>
                        <td width="25%" align="center" style="font-family:${FONT};font-size:10px;color:#d9ebff;line-height:1.3;">
                          <div style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#5fe4d2;color:#08131f;font-size:11px;font-weight:900;line-height:18px;text-align:center;">◌</div><br />
                          Organiza
                        </td>
                        <td width="25%" align="center" style="font-family:${FONT};font-size:10px;color:#d9ebff;line-height:1.3;">
                          <div style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#afd5ff;color:#08131f;font-size:11px;font-weight:900;line-height:18px;text-align:center;">▣</div><br />
                          Cumple
                        </td>
                        <td width="25%" align="center" style="font-family:${FONT};font-size:10px;color:#d9ebff;line-height:1.3;">
                          <div style="display:inline-block;width:18px;height:18px;border-radius:50%;background:#c7f1ff;color:#08131f;font-size:11px;font-weight:900;line-height:18px;text-align:center;">✦</div><br />
                          Avanza
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          ${footer(opts.year)}
        </table>
        <!--[if mso]></td></tr></table><![endif]-->
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/* ---------- Correo: recuperación de contraseña ---------- */

export function resetPasswordHtml(entrada: {
  nombre: string;
  resetUrl: string;
  expiraMinutos?: number;
  year?: string | number;
}): string {
  const year = entrada.year ?? new Date().getFullYear();
  const expira = entrada.expiraMinutos ?? 15;

  const content = `
    <p style="margin:0 0 12px;color:#d7e7fb;font-size:15px;line-height:1.6;font-family:${FONT}">
      Hola, <strong style="color:#ffffff">${esc(entrada.nombre)}</strong>.
    </p>
    <p style="margin:0 0 18px;color:#d7e7fb;font-size:15px;line-height:1.6;font-family:${FONT}">
      Hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Elyron.
    </p>
    ${primaryButton('Restablecer contraseña', entrada.resetUrl)}
    <div style="margin-top:16px;color:#9bb0c8;font-size:12px;line-height:1.6;font-family:${FONT};">
      <div style="display:inline-flex;align-items:center;gap:8px;">
        <span style="display:inline-block;width:14px;height:14px;border-radius:50%;background:#7fb3ff;display:inline-flex;align-items:center;justify-content:center;color:#07131e;font-size:9px;font-weight:900;">✓</span>
        Este enlace expirará en ${esc(expira)} minutos.
      </div>
    </div>
    <div style="margin-top:10px;color:#9bb0c8;font-size:12px;line-height:1.6;font-family:${FONT};">
      Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
    </div>
    ${fallbackLink(entrada.resetUrl)}
  `;

  return emailLayout({
    preheaderText: `Utiliza este enlace para restablecer de forma segura tu contraseña de Elyron.`,
    eyebrow: 'Cuenta segura',
    title: 'Recuperación de contraseña',
    contentHtml: content,
    year,
  });
}

/* ---------- Correo: verificación de cuenta ---------- */

export function verificationEmailHtml(entrada: {
  nombre: string;
  verifyUrl: string;
  expiraHoras?: number;
  year?: string | number;
}): string {
  const year = entrada.year ?? new Date().getFullYear();
  const expira = entrada.expiraHoras ?? 24;

  const content = `
    <p style="margin:0 0 16px;color:#c6d4e8;font-size:15px;line-height:1.7;font-family:${FONT}">
      Hola, <strong style="color:#ffffff">${esc(entrada.nombre)}</strong>. Bienvenido a <strong style="color:#ffffff">Elyron</strong>.
    </p>
    <p style="margin:0 0 18px;color:#c6d4e8;font-size:15px;line-height:1.7;font-family:${FONT}">
      Creaste una cuenta en nuestra plataforma de gestión académica. Para activarla y empezar a construir tu trayectoria, confirma tu dirección de correo con el siguiente botón:
    </p>
    ${primaryButton('Verificar mi correo', entrada.verifyUrl)}
    ${securityNotice(`Este enlace estará disponible durante <strong style="color:#e2ecfa">${esc(expira)} horas</strong> y solo podrá utilizarse una vez.`)}
    <div style="margin-top:22px;background:#111a2b;border-left:3px solid #7fb3ff;border-radius:10px;padding:15px 17px;">
      <div style="color:#f3f7f5;font-size:13px;font-weight:800;font-family:${FONT}">¿No reconoces esta solicitud?</div>
      <div style="color:#c6d4e8;font-size:13px;line-height:1.6;margin-top:4px;font-family:${FONT}">
        Puedes ignorar este correo. Tu cuenta no quedará activada hasta que verifiques tu correo.
      </div>
    </div>
    ${fallbackLink(entrada.verifyUrl)}
  `;

  return emailLayout({
    preheaderText: `Confirma tu correo para activar tu cuenta de Elyron y empezar tu trayectoria académica.`,
    eyebrow: 'Activa tu cuenta',
    title: 'Verifica tu correo electrónico',
    contentHtml: content,
    year,
  });
}

import {
  resetPasswordHtml,
  emailLayout,
  verificationEmailHtml,
} from './email.template';
import { EMAIL_BACKGROUND } from './email-background';

const RESET_URL =
  'https://elyron.app/reset-password?token=abc123tokencontenidolargu&otro=1&ultimo=parametrofinal';

describe('email.template · recuperación de contraseña', () => {
  it('incluye el nombre real del usuario que solicitó la recuperación', () => {
    const html = resetPasswordHtml({
      nombre: 'María José',
      resetUrl: RESET_URL,
      year: 2026,
    });
    expect(html).toContain('María José');
  });

  it('incluye la URL real de recuperación (frontend) en botón y fallback', () => {
    const html = resetPasswordHtml({
      nombre: 'A',
      resetUrl: RESET_URL,
      year: 2026,
    });
    // El href del botón y el href del fallback contienen la URL (escapada).
    expect(
      html.match(/href="[^"]*reset-password[^"]*"/g)?.length ?? 0,
    ).toBeGreaterThanOrEqual(2);
    // El texto seleccionable del fallback muestra la URL completa.
    expect(html).toContain(RESET_URL.replace(/&/g, '&amp;'));
  });

  it('escapea la URL y el nombre para evitar romper el HTML', () => {
    const html = resetPasswordHtml({
      nombre: 'B<input>',
      resetUrl: 'https://elyron.app/reset-password?token=a&b="x"',
      year: 2026,
    });
    expect(html).toContain('&lt;input&gt;');
    expect(html).toContain('&quot;x&quot;');
    expect(html).not.toContain('<input>');
  });

  it('nunca incluye la contraseña, el hash ni datos sensibles internos', () => {
    const html = resetPasswordHtml({
      nombre: 'A',
      resetUrl: RESET_URL,
      expiraMinutos: 15,
      year: 2026,
    });
    expect(html.toLowerCase()).not.toContain('tokenhash');
    expect(html.toLowerCase()).not.toContain('bcrypt');
    expect(html.toLowerCase()).not.toContain('sha256');
    expect(html).not.toContain('$2b$');
  });

  it('muestra el plazo de expiración configurado', () => {
    const html = resetPasswordHtml({
      nombre: 'A',
      resetUrl: RESET_URL,
      expiraMinutos: 30,
      year: 2026,
    });
    expect(html).toContain('30 minutos');
  });

  it('incluye preheader, botón, enlace y footer con año dinámico', () => {
    const html = resetPasswordHtml({
      nombre: 'A',
      resetUrl: RESET_URL,
      year: 2026,
    });
    expect(html).toContain('Restablecer contraseña');
    expect(html).toContain('© 2026 Elyron');
    expect(html).toContain('restablecer de forma segura');
  });

  it('el layout reutilizable agrega encabezado de marca y estructura email-safe', () => {
    const html = emailLayout({
      preheaderText: 'Vista previa',
      title: 'Notificación',
      eyebrow: 'Activa tu cuenta',
      contentHtml: '<p>Cuerpo</p>',
      year: 2026,
    });
    expect(html).toContain('Elyron');
    expect(html).toContain('Activa tu cuenta');
    expect(html).toContain('Notificación');
    expect(html).toContain('Plataforma de gestión académica');
    expect(html).toContain('max-width:600px');
    expect(html).toContain('<!--[if mso]>');
  });

  it('usa la imagen real del correo como fondo del diseño del email', () => {
    expect(EMAIL_BACKGROUND).toMatch(/^data:image\/(png|jpeg);base64,/i);
  });

  it('el correo de verificación usa el mismo branding y el nombre del usuario', () => {
    const html = verificationEmailHtml({
      nombre: 'Andrés Pérez',
      verifyUrl:
        'https://elyron.app/verificar-correo?email=a%40b.com&token=tok123',
      year: 2026,
    });
    expect(html).toContain('Andrés Pérez');
    expect(html).toContain('Verificar mi correo');
    expect(html).toContain('24 horas');
    expect(html).toContain('Elyron');
  });
});

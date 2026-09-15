import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import { resetPasswordHtml, verificationEmailHtml } from './email.template';

export interface EmailResult {
  ok: boolean;
  mode: 'smtp' | 'preview' | 'disabled';
  messageId?: string;
}

interface MailOptions {
  to: string;
  subject: string;
  html: string;
}

/**
 * Servicio de correo de Elyron.
 *
 * Usa SMTP (Gmail / Outlook / cualquier proveedor). Las credenciales se leen
 * del entorno:
 *   SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM, MAIL_ENABLED
 *
 * Si MAIL_ENABLED no es 'true' (o faltan credenciales) NO envía: imprime el
 * correo en consola (modo preview) para poder desarrollar sin credenciales.
 */
@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private readonly transporter: Transporter | null;
  private readonly from: string;
  private readonly enabled: boolean;

  constructor(private readonly configService: ConfigService) {
    const host = this.configService.get<string>('SMTP_HOST', 'smtp.gmail.com');
    const port = Number(this.configService.get<string>('SMTP_PORT', '465'));
    const user = this.configService.get<string>('SMTP_USER', '');
    const pass = this.configService.get<string>('SMTP_PASS', '');
    this.from =
      this.configService.get<string>('SMTP_FROM', '') ||
      (user ? `Elyron <${user}>` : 'Elyron <no-reply@elyron.local>');
    this.enabled =
      this.configService.get<string>('MAIL_ENABLED', 'false') === 'true' &&
      Boolean(user && pass);

    if (this.enabled) {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
      });
    } else {
      this.transporter = null;
    }
  }

  private async enviar(opts: MailOptions): Promise<EmailResult> {
    if (!this.enabled || !this.transporter) {
      this.logger.log(
        `[correo preview] Para: ${opts.to} | Asunto: ${opts.subject}\n${opts.html}`,
      );
      return { ok: true, mode: 'preview' };
    }
    try {
      const info = await this.transporter.sendMail({
        from: this.from,
        to: opts.to,
        subject: opts.subject,
        html: opts.html,
      });
      this.logger.log(`Correo enviado a ${opts.to}: ${info.messageId}`);
      return { ok: true, mode: 'smtp', messageId: info.messageId };
    } catch (err) {
      this.logger.error(
        `No se pudo enviar el correo a ${opts.to}: ${(err as Error).message}`,
      );
      return { ok: false, mode: 'smtp' };
    }
  }

  private baseHtml(titulo: string, contenido: string): string {
    return `
      <div style="font-family:Arial,Helvetica,sans-serif;background:#f6f7f5;padding:24px">
        <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #e8e8e4">
          <div style="background:#0f2a22;padding:20px 28px;display:flex;align-items:center;gap:10px">
            <span style="color:#34d399;font-weight:800;font-size:20px">Elyron<span style="color:#86efac">.</span></span>
          </div>
          <div style="padding:28px">
            <h2 style="margin:0 0 8px;color:#14161a;font-size:19px">${titulo}</h2>
            ${contenido}
          </div>
          <div style="background:#f6f7f5;padding:16px 28px;color:#7a7f85;font-size:11px">
            © 2026 Elyron · Plataforma de gestión académica.
          </div>
        </div>
      </div>`;
  }

  private boton(texto: string, url: string): string {
    return `
      <a href="${url}" style="display:inline-block;background:#0f2a22;color:#ffffff;text-decoration:none;font-weight:700;padding:12px 22px;border-radius:999px;margin:14px 0">
        ${texto}
      </a>`;
  }

  async enviarVerificacion(entrada: {
    to: string;
    nombre: string;
    link: string;
  }): Promise<EmailResult> {
    const html = verificationEmailHtml({
      nombre: entrada.nombre,
      verifyUrl: entrada.link,
    });
    return this.enviar({
      to: entrada.to,
      subject: 'Verifica tu correo · Elyron',
      html,
    });
  }

  async enviarRestablecimiento(entrada: {
    to: string;
    nombre: string;
    link: string;
    expiraMinutos?: number;
  }): Promise<EmailResult> {
    const html = resetPasswordHtml({
      nombre: entrada.nombre,
      resetUrl: entrada.link,
      expiraMinutos: entrada.expiraMinutos,
    });
    return this.enviar({
      to: entrada.to,
      subject: 'Recuperación de contraseña · Elyron',
      html,
    });
  }

  async enviarResultadoEvidencia(entrada: {
    to: string;
    nombre: string;
    titulo: string;
    aprobada: boolean;
    feedback?: string | null;
    link: string;
  }): Promise<EmailResult> {
    const estado = entrada.aprobada
      ? '<strong style="color:#059669">Aprobada ✅</strong>'
      : '<strong style="color:#dc2626">Devuelta ↩️</strong>';
    const retro = entrada.feedback
      ? `<div style="background:#f3f4f2;border-radius:12px;padding:14px 16px;margin-top:8px;color:#3d434a;font-size:14px">
           <strong>Retroalimentación de tu instructor:</strong><br/>${entrada.feedback}
         </div>`
      : '';
    const html = this.baseHtml(
      `Tu evidencia fue ${entrada.aprobada ? 'aprobada' : 'devuelta'}`,
      `<p style="color:#3d434a;font-size:14px;line-height:1.6">
         Hola ${entrada.nombre}, tu instructor revisó tu evidencia
         <strong>“${entrada.titulo}”</strong> y quedó en estado ${estado}.
       </p>
       ${retro}
       ${this.boton('Ver mi evidencia', entrada.link)}
       <p style="color:#9aa0a6;font-size:12px">Revisa los detalles en tu campus de Elyron.</p>`,
    );
    return this.enviar({
      to: entrada.to,
      subject: `Evidencia ${entrada.aprobada ? 'aprobada' : 'devuelta'} · Elyron`,
      html,
    });
  }
}

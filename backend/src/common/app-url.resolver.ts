import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Fuente central de URLs públicas de Elyron.
 *
 * Todas las URLs que se envían por correo (verificación de email,
 * recuperación de contraseña) y cualquier URL pública del frontend deben
 * construirse a partir de aquí. NUNCA usar `localhost` para enlaces que el
 * usuario abrirá desde otro dispositivo (p. ej. un celular).
 *
 * Prioridad de resolución de la URL base del frontend:
 *   1. APP_URL         (variable recomendada: http://IP-PC:3000 o https://dominio)
 *   2. FRONTEND_URL    (mantenida por compatibilidad con el stack existente)
 *   3. fallback local  (solo desarrollo interno)
 */
@Injectable()
export class AppUrlResolver {
  constructor(private readonly configService: ConfigService) {}

  /** URL base pública del frontend (sin barra final). */
  getFrontendBase(): string {
    const appUrl = this.configService.get<string>('APP_URL', '');
    if (appUrl) return appUrl.replace(/\/+$/, '');
    const frontendUrl = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:5173',
    );
    return frontendUrl.split(',')[0].trim().replace(/\/+$/, '');
  }

  /** URL base pública del backend (API), sin barra final. */
  getApiBase(): string {
    const api = this.configService.get<string>('PUBLIC_API_URL', '');
    if (api) return api.replace(/\/+$/, '');
    const port = this.configService.get<string>('PORT', '3000');
    return `http://localhost:${port}`;
  }

  /** Enlace de verificación de correo. */
  verificationUrl(email: string, token: string): string {
    const base = this.getFrontendBase();
    const qs = `email=${encodeURIComponent(email)}&token=${encodeURIComponent(token)}`;
    return `${base}/verificar-correo?${qs}`;
  }

  /** Enlace de recuperación de contraseña. */
  resetPasswordUrl(token: string): string {
    const base = this.getFrontendBase();
    return `${base}/reset-password?token=${encodeURIComponent(token)}`;
  }
}

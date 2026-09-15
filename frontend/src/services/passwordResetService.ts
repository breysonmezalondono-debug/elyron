import { authClient } from '../api';

export interface RespuestaGenerica {
  message: string;
}

export interface ValidacionToken {
  valido: boolean;
  mensaje: string;
}

/**
 * Servicio de recuperación de contraseña (frontend → backend).
 * Consume los endpoints reales de /api/auth.
 */
export const passwordResetService = {
  async solicitarRecuperacion(email: string): Promise<RespuestaGenerica> {
    const res = await authClient.post<RespuestaGenerica>('/auth/forgot-password', {
      email: email.trim().toLowerCase(),
    });
    return res.data;
  },
  async validarToken(token: string): Promise<ValidacionToken> {
    const res = await authClient.get<ValidacionToken>('/auth/reset-password/validate', {
      params: { token },
    });
    return res.data;
  },
  async restablecerPassword(token: string, password: string): Promise<RespuestaGenerica> {
    const res = await authClient.post<RespuestaGenerica>('/auth/reset-password', {
      token,
      password,
    });
    return res.data;
  },
};

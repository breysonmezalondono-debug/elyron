import { authClient } from '../api';
import { AUTH_SERVICE_URL, USE_MOCK } from './config';

/* ============================================================
   OAuth · Elyron
   Inicia el flujo de login con Google / GitHub / Microsoft y
   consulta el estado de configuración de cada proveedor.
   ============================================================ */

export type OAuthProvider = 'google' | 'github' | 'microsoft';

export interface ProviderEstado {
  provider: OAuthProvider;
  nombre: string;
  configurado: boolean;
}

export const OAUTH_LABEL: Record<OAuthProvider, string> = {
  google: 'Google',
  github: 'GitHub',
  microsoft: 'Microsoft',
};

const OAUTH_BASE = `${AUTH_SERVICE_URL}/auth/oauth`;

export const oauthService = {
  async estados(): Promise<ProviderEstado[]> {
    if (USE_MOCK) return [];
    try {
      const res = await authClient.get<ProviderEstado[]>(`${OAUTH_BASE}`);
      return res.data ?? [];
    } catch {
      return [];
    }
  },

  async iniciar(provider: OAuthProvider): Promise<string> {
    if (USE_MOCK) throw new Error('Modo demo sin proveedores sociales');
    try {
      const res = await authClient.get<{ url: string; configurado: boolean }>(
        `${OAUTH_BASE}/${provider}`,
      );
      if (!res.data?.url) throw new Error('URL de inicio no disponible');
      return res.data.url;
    } catch (err) {
      const data = (err as { response?: { data?: { message?: string | string[]; error?: string } } })
        ?.response?.data;
      const message =
        typeof data?.message === 'string'
          ? data.message
          : Array.isArray(data?.message) && data.message.length
            ? String(data.message[0])
            : (err as { message?: string })?.message ||
              `No se pudo iniciar sesión con ${OAUTH_LABEL[provider]}`;
      throw new Error(message);
    }
  },
};

export const urlOAuthBase = (): string => OAUTH_BASE;
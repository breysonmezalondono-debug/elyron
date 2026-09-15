import {
  BadRequestException,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomBytes } from 'crypto';
import { UsersService } from '../users/users.service';
import { AuthService } from './auth.service';
import type { User } from '../users/user.entity';

export type OAuthProvider = 'google' | 'github' | 'microsoft';

interface ProviderCreds {
  clientId: string;
  clientSecret: string;
  configured: boolean;
}

interface OAuthProfile {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string | null;
}

const PROVIDERS: Record<OAuthProvider, string> = {
  google: 'Google',
  github: 'GitHub',
  microsoft: 'Microsoft',
};

@Injectable()
export class OAuthService {
  private readonly stateStore = new Map<
    string,
    { provider: OAuthProvider; createdAt: number }
  >();
  private readonly frontBase: string;
  private readonly apiBase: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
  ) {
    const front = this.configService.get<string>(
      'FRONTEND_URL',
      'http://localhost:5173',
    );
    this.frontBase = front.split(',')[0].trim().replace(/\/$/, '');
    const api = this.configService.get<string>('PUBLIC_API_URL', '');
    this.apiBase = (
      api || `http://localhost:${this.configService.get('PORT', '3000')}`
    ).replace(/\/$/, '');
  }

  private creds(provider: OAuthProvider): ProviderCreds {
    const prefix = provider.toUpperCase();
    const clientId = this.configService.get<string>(`${prefix}_CLIENT_ID`, '');
    const clientSecret = this.configService.get<string>(
      `${prefix}_CLIENT_SECRET`,
      '',
    );
    return {
      clientId,
      clientSecret,
      configured: Boolean(clientId && clientSecret),
    };
  }

  estadoProveedor(provider: OAuthProvider) {
    return {
      provider,
      nombre: PROVIDERS[provider],
      configurado: this.creds(provider).configured,
    };
  }

  construirUrlInicio(provider: OAuthProvider): string {
    const { clientId, configured } = this.creds(provider);
    if (!configured) {
      throw new ServiceUnavailableException({
        error: 'PROVIDER_NOT_CONFIGURED',
        message: `El inicio de sesión con ${PROVIDERS[provider]} aún no está configurado.`,
        provider,
      });
    }
    const state = randomBytes(24).toString('hex');
    this.stateStore.set(state, { provider, createdAt: Date.now() });
    const redirectUri = `${this.apiBase}/api/auth/oauth/${provider}/callback`;
    const params = new URLSearchParams({
      state,
      redirect_uri: redirectUri,
    });

    switch (provider) {
      case 'google':
        params.set('client_id', clientId);
        params.set('response_type', 'code');
        params.set('scope', 'openid email profile');
        params.set('prompt', 'select_account');
        params.set('access_type', 'online');
        return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
      case 'github':
        params.set('client_id', clientId);
        params.set('scope', 'read:user user:email');
        return `https://github.com/login/oauth/authorize?${params.toString()}`;
      case 'microsoft': {
        const tenant = this.configService.get<string>(
          'MICROSOFT_TENANT',
          'common',
        );
        params.set('client_id', clientId);
        params.set('response_type', 'code');
        params.set('scope', 'User.Read openid email profile');
        params.set('response_mode', 'query');
        return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?${params.toString()}`;
      }
    }
  }

  private validarEstado(provider: OAuthProvider, state: string) {
    const entrada = this.stateStore.get(state);
    const ok =
      entrada &&
      entrada.provider === provider &&
      Date.now() - entrada.createdAt < 10 * 60 * 1000;
    this.stateStore.delete(state);
    if (!ok) {
      throw new BadRequestException(
        'La solicitud de inicio de sesión expiró o es inválida. Intenta de nuevo.',
      );
    }
  }

  private async intercambiarCodigo(
    provider: OAuthProvider,
    code: string,
  ): Promise<{ access_token: string }> {
    const { clientId, clientSecret } = this.creds(provider);
    const redirectUri = `${this.apiBase}/api/auth/oauth/${provider}/callback`;
    const cuerpo: Record<string, string> = {
      client_id: clientId,
      client_secret: clientSecret,
      code,
      redirect_uri: redirectUri,
    };
    let url = '';
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    let useForm = false;

    switch (provider) {
      case 'google':
        url = 'https://oauth2.googleapis.com/token';
        cuerpo.grant_type = 'authorization_code';
        break;
      case 'github':
        url = 'https://github.com/login/oauth/access_token';
        useForm = true;
        break;
      case 'microsoft': {
        const tenant = this.configService.get<string>(
          'MICROSOFT_TENANT',
          'common',
        );
        url = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;
        cuerpo.grant_type = 'authorization_code';
        cuerpo.scope = 'User.Read openid email profile';
        break;
      }
    }

    const respuesta = await fetch(url, {
      method: 'POST',
      headers: useForm
        ? {
            Accept: 'application/json',
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        : headers,
      body: useForm
        ? new URLSearchParams(cuerpo).toString()
        : JSON.stringify(cuerpo),
    });
    const data = (await respuesta.json()) as {
      access_token?: string;
      error_description?: string;
      error?: string;
    };
    if (!respuesta.ok || !data.access_token) {
      throw new BadRequestException(
        `No se pudo completar el inicio de sesión con ${PROVIDERS[provider]}: ${
          data.error_description || data.error || 'error del proveedor'
        }`,
      );
    }
    return { access_token: data.access_token };
  }

  private async obtenerPerfil(
    provider: OAuthProvider,
    token: string,
  ): Promise<OAuthProfile> {
    switch (provider) {
      case 'google': {
        const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = (await r.json()) as Record<string, string>;
        const nombre = (d.name || '').trim();
        const partes = nombre.split(/\s+/);
        return {
          id: String(d.sub),
          email: d.email,
          firstName: partes[0] || d.given_name || '',
          lastName: partes.slice(1).join(' ') || d.family_name || '',
          avatar: d.picture || null,
        };
      }
      case 'github': {
        const r = await fetch('https://api.github.com/user', {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        });
        const d = (await r.json()) as Record<string, string>;
        let email = d.email || '';
        if (!email) {
          const re = await fetch('https://api.github.com/user/emails', {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: 'application/json',
            },
          });
          const emails = (await re.json()) as Array<{
            email: string;
            primary?: boolean;
            verified?: boolean;
          }>;
          email =
            emails.find((e) => e.primary && e.verified)?.email ||
            emails.find((e) => e.verified)?.email ||
            '';
        }
        const nombre = (d.name || d.login || '').trim();
        const partes = nombre.split(/\s+/);
        return {
          id: String(d.id),
          email,
          firstName: partes[0] || 'GitHub',
          lastName: partes.slice(1).join(' ') || 'User',
          avatar: d.avatar_url || null,
        };
      }
      case 'microsoft': {
        const r = await fetch('https://graph.microsoft.com/v1.0/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const d = (await r.json()) as Record<string, string>;
        return {
          id: String(d.id),
          email: d.mail || d.userPrincipalName || '',
          firstName: d.givenName || '',
          lastName: d.surname || '',
          avatar: null,
        };
      }
    }
  }

  async manejarRetorno(
    provider: OAuthProvider,
    code: string,
    state: string,
  ): Promise<{ url: string }> {
    this.validarEstado(provider, state);
    const { access_token } = await this.intercambiarCodigo(provider, code);
    const perfil = await this.obtenerPerfil(provider, access_token);

    const params = new URLSearchParams();
    const destino = `${this.frontBase}/oauth/callback`;

    if (!perfil.email) {
      params.set('error', 'NO_EMAIL');
      params.set(
        'message',
        `${PROVIDERS[provider]} no compartió un correo. Usa una cuenta con correo público.`,
      );
      return { url: `${destino}?${params.toString()}` };
    }

    let user: User | null = null;
    try {
      user = await this.usersService.findVerifiedEmail(perfil.email);
    } catch {
      user = null;
    }

    if (!user) {
      params.set('error', 'NO_ACCOUNT');
      params.set('email', perfil.email);
      params.set('provider', provider);
      params.set(
        'message',
        `No existe una cuenta de Elyron asociada a ${perfil.email}. Regístrate para continuar.`,
      );
      return { url: `${destino}?${params.toString()}` };
    }

    if (!user.isActive) {
      params.set('error', 'DISABLED');
      params.set('message', 'Tu cuenta está desactivada.');
      return { url: `${destino}?${params.toString()}` };
    }

    if (user.authProvider && user.authProvider !== provider) {
      params.set('error', 'ALREADY_LINKED');
      params.set(
        'message',
        `Este correo ya está vinculado con ${user.authProvider}. Inicia sesión con ese método.`,
      );
      return { url: `${destino}?${params.toString()}` };
    }

    if (!user.authProvider || user.authProviderId !== perfil.id) {
      user = await this.usersService.vincularProveedor(
        user.id,
        provider,
        perfil.id,
      );
    }

    const { password: _password, ...usuarioSeguro } = user as User & {
      password?: string;
    };
    void _password;
    const sesion = await this.authService.login(usuarioSeguro as any);
    params.set('accessToken', sesion.accessToken);
    params.set('refreshToken', sesion.refreshToken);
    return { url: `${destino}?${params.toString()}` };
  }
}

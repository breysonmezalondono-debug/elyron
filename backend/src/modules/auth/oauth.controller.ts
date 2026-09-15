import {
  Controller,
  Get,
  Param,
  ParseEnumPipe,
  Query,
  Res,
} from '@nestjs/common';
import type { Response } from 'express';
import { OAuthService } from './oauth.service';
import type { OAuthProvider } from './oauth.service';

const PROVEEDORES = ['google', 'github', 'microsoft'] as const;

@Controller('auth/oauth')
export class OAuthController {
  constructor(private readonly oauthService: OAuthService) {}

  @Get()
  lista() {
    return PROVEEDORES.map((provider) =>
      this.oauthService.estadoProveedor(provider),
    );
  }

  @Get(':provider')
  iniciar(
    @Param('provider', new ParseEnumPipe(['google', 'github', 'microsoft']))
    provider: OAuthProvider,
  ) {
    const url = this.oauthService.construirUrlInicio(provider);
    return { url, provider, configurado: true };
  }

  @Get(':provider/callback')
  async retorno(
    @Param('provider', new ParseEnumPipe(['google', 'github', 'microsoft']))
    provider: OAuthProvider,
    @Query('code') code: string,
    @Query('state') state: string,
    @Res() res: Response,
  ) {
    try {
      const { url } = await this.oauthService.manejarRetorno(
        provider,
        code,
        state,
      );
      return res.redirect(url);
    } catch (err) {
      const destino = `${process.env.FRONTEND_URL?.split(',')[0]?.trim() || 'http://localhost:5173'}/oauth/callback`;
      const params = new URLSearchParams({
        error: 'OAUTH_ERROR',
        provider,
        message:
          err instanceof Error
            ? err.message.replace(/\s+/g, ' ').trim()
            : 'Error al iniciar sesión',
      });
      return res.redirect(`${destino}?${params.toString()}`);
    }
  }
}

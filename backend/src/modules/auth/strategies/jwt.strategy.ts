import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    config: ConfigService,
    private readonly usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get('JWT_SECRET', 'elyron_secret'),
    });
  }
  async validate(payload: any) {
    if (!payload.sub) throw new UnauthorizedException();
    const user = await this.usersService.findForAuth(payload.sub);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Usuario desactivado o inexistente');
    }
    /* Invalidación de sesión por versión de token: si el JWT trae una
       versión distinta a la actual del usuario, la sesión fue revocada
       (p. ej. tras cambiar la contraseña). Los JWT emitidos antes de la
       introducción de la versión (sin el campo) siguen siendo válidos. */
    if (
      payload.tokenVersion !== undefined &&
      payload.tokenVersion !== (user.tokenVersion ?? 0)
    ) {
      throw new UnauthorizedException('La sesión ya no es válida');
    }
    const permisos =
      user.role?.permissions?.map((p: { name: string }) => p.name) ?? [];
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone,
      avatar: user.avatar,
      isActive: user.isActive,
      institucion: user.institucion,
      fichaId: user.fichaId ?? null,
      esVocero: Boolean(user.esVocero),
      esVoceroSuplente: Boolean(user.esVoceroSuplente),
      grupoId: user.grupoId ?? null,
      esPersonero: Boolean(user.esPersonero),
      esPersoneroSuplente: Boolean(user.esPersoneroSuplente),
      companyId: user.companyId,
      roleId: user.roleId,
      company: user.company ?? null,
      ficha: user.ficha ?? null,
      grupo: user.grupo ?? null,
      role: user.role ?? null,
      permisos,
    };
  }
}

import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISOS_KEY } from '../decorators/permisos.decorator';

/**
 * PermisosGuard · DENY BY DEFAULT
 *
 * Regla de oro de Elyron: un permiso NO otorgado = acceso denegado.
 * No basta con el rol: la operación exige que el rol tenga el permiso
 * atómico declarado con @Permisos(...).
 *
 * Además, cuando la operación pide un alcance institucional y el usuario
 * pertenece a una institución distinta, se rechaza (aislamiento por
 * institución aunque el rol "tenga" el permiso).
 */
@Injectable()
export class PermisosGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISOS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    // Sin @Permisos declarado: no se exige nada en este guard.
    if (!required || required.length === 0) return true;

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      throw new ForbiddenException('Debes iniciar sesión para esta operación');
    }

    const role = typeof user.role === 'string' ? null : user.role;
    const permisos =
      role?.permissions ?? (user.permisos as string[] | undefined) ?? [];

    const nombresPermisos =
      Array.isArray(permisos) && permisos.every((p) => typeof p === 'string')
        ? (permisos as string[])
        : (permisos as Array<{ name: string }>)
            .map((p) => p?.name)
            .filter(Boolean);

    const faltantes = required.filter(
      (permiso) => !nombresPermisos.includes(permiso),
    );
    if (faltantes.length > 0) {
      throw new ForbiddenException(
        `No tienes el permiso requerido: ${faltantes.join(', ')}`,
      );
    }

    // Aislamiento institucional cuando se declara @Alcance.
    const alcance = this.reflector.getAllAndOverride<string | string[]>(
      'institucion',
      [context.getHandler(), context.getClass()],
    );
    if (alcance) {
      const allowed = Array.isArray(alcance) ? alcance : [alcance];
      if (!allowed.includes(user.institucion ?? 'sena')) {
        throw new ForbiddenException(
          'Esta operación pertenece a otra institución',
        );
      }
    }

    return true;
  }
}

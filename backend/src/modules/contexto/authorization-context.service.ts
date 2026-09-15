import { Injectable } from '@nestjs/common';

interface ContextUser {
  institucion?: string;
  role?: { permissions?: Array<{ name: string }> } | string;
  permisos?: string[];
}

@Injectable()
export class AuthorizationContextService {
  /**
   * Evalúa permiso + institución + alcance. La regla es deny by default.
   * La relación concreta con el recurso se valida en el servicio de dominio,
   * porque cada dominio tiene una estructura distinta (ficha, grupo o curso).
   */
  can(
    user: ContextUser | null | undefined,
    permission: string,
    context: { institution?: string; scopeIds?: string[] } = {},
  ): boolean {
    if (!user) return false;
    const permissions =
      user.permisos ??
      (typeof user.role === 'object'
        ? user.role.permissions?.map((p) => p.name)
        : []) ??
      [];
    if (!permissions.includes(permission)) return false;
    if (context.institution && context.institution !== user.institucion) {
      return false;
    }
    // scopeIds se resuelve contra el recurso concreto en el dominio.
    return true;
  }
}

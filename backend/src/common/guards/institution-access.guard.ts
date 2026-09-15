import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { INSTITUCION_KEY } from '../decorators/institucion.decorator';

@Injectable()
export class InstitutionAccessGuard implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string | string[]>(
      INSTITUCION_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!required) return true;
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) return true;
    const allowed = Array.isArray(required) ? required : [required];
    if (!allowed.includes(user.institucion)) {
      throw new ForbiddenException('Este acceso pertenece a otra institución');
    }
    return true;
  }
}

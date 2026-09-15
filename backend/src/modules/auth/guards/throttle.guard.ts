import {
  CanActivate,
  ExecutionContext,
  Injectable,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

export const THROTTLE_OPTIONS = 'throttle_options';

export interface ThrottleOptions {
  limit: number;
  ttlSeconds: number;
}

/**
 * Límite de peticiones por IP en memoria (anti fuerza bruta / spam de
 * creación de cuentas). En producción se recomienda un almacén distribuido
 * (Redis) con la misma interfaz.
 */
export const Throttle = (limit: number, ttlSeconds: number) =>
  SetMetadata(THROTTLE_OPTIONS, { limit, ttlSeconds });

@Injectable()
export class ThrottleGuard implements CanActivate {
  private readonly buckets = new Map<
    string,
    { count: number; resetAt: number }
  >();

  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const options = this.reflector.getAllAndOverride<
      ThrottleOptions | undefined
    >(THROTTLE_OPTIONS, [context.getClass(), context.getHandler()]);
    if (!options) return true;

    const request = context.switchToHttp().getRequest();
    const ip = (request.ip as string | undefined) ?? 'unknown';
    const route =
      (request.route?.path as string | undefined) ??
      (request.path as string | undefined) ??
      'route';
    const key = `${ip}|${route}`;
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      this.buckets.set(key, {
        count: 1,
        resetAt: now + options.ttlSeconds * 1000,
      });
      return true;
    }

    bucket.count += 1;
    return bucket.count <= options.limit;
  }
}

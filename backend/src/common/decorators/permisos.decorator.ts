import { SetMetadata } from '@nestjs/common';

export const PERMISOS_KEY = 'permisos';

/** Requiere que el usuario tenga TODOS los permisos listados (AND). */
export const Permisos = (...permisos: string[]) =>
  SetMetadata(PERMISOS_KEY, permisos);

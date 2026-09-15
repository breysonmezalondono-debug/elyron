import * as dotenv from 'dotenv';
import { resolve } from 'path';

/**
 * Valida las variables de entorno obligatorias y de tipo en producción.
 * Se ejecuta ANTES de arrancar Nest para fallar rápido (fail fast): si falta
 * una variable crítica o tiene un valor inválido, el proceso termina con un
 * mensaje claro en vez de arrancar una API rota.
 *
 * No revela secretos: solo imprime los NOMBRES de las variables faltantes.
 */

const REQUIRED_IN_PRODUCTION = [
  'DB_HOST',
  'DB_PORT',
  'DB_USERNAME',
  'DB_PASSWORD',
  'DB_NAME',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'FRONTEND_URL',
];

const REQUIRED_ALWAYS = ['PORT'];

const POSITIVE_INT = new Set([
  'DB_PORT',
  'PORT',
  'MAX_FILE_SIZE',
  'RESET_PASSWORD_TTL_MINUTES',
  'SMTP_PORT',
  'AI_MAX_TOKENS',
]);

function loadEnv(): void {
  // Prioridad: variables del proceso (ya definidas por el host) > archivo .env.
  const explicit = Object.keys(process.env).length > 1;
  if (!explicit || process.env.NODE_ENV === 'production') {
    dotenv.config({ path: resolve(process.cwd(), '.env') });
  }
}

export function validateEnvironment(): void {
  loadEnv();

  const nodeEnv = process.env.NODE_ENV || 'development';
  const missing: string[] = [];
  const invalid: string[] = [];

  if (REQUIRED_ALWAYS.some((k) => !process.env[k])) {
    missing.push(...REQUIRED_ALWAYS.filter((k) => !process.env[k]));
  }

  if (nodeEnv === 'production') {
    missing.push(...REQUIRED_IN_PRODUCTION.filter((k) => !process.env[k]));
  }

  for (const k of POSITIVE_INT) {
    const v = process.env[k];
    if (v && (!Number.isInteger(Number(v)) || Number(v) <= 0)) {
      invalid.push(k);
    }
  }

  if (missing.length > 0) {
    throw new Error(
      `[config] Faltan variables de entorno obligatorias (${nodeEnv}): ${missing.join(
        ', ',
      )}`,
    );
  }

  if (invalid.length > 0) {
    throw new Error(
      `[config] Variables con valor inválido (deben ser enteros > 0): ${invalid.join(
        ', ',
      )}`,
    );
  }

  // Validación adicional de JWT en producción (evitar el fallback inseguro).
  if (nodeEnv === 'production') {
    const insecureSecrets = ['elyron_secret', 'cambia_esto_en_produccion'];
    const sec = process.env.JWT_SECRET || '';
    const ref = process.env.JWT_REFRESH_SECRET || '';
    if (insecureSecrets.some((s) => sec === s || ref === s)) {
      throw new Error(
        '[config] JWT_SECRET / JWT_REFRESH_SECRET no pueden usar valores por defecto en producción.',
      );
    }
  }
}

import { readFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Devuelve la configuración SSL para conexiones MySQL.
 *
 * Variables:
 *  - DB_SSL=true            -> habilita SSL (acepta certificados sin CA forzada)
 *  - DB_SSL_CA_PATH=ruta    -> usa el certificado CA para verificación real
 *
 * Aiven y casi todos los MySQL en la nube exigen SSL (ssl-mode=REQUIRED).
 */
export function mysqlSslOptions():
  | { rejectUnauthorized: boolean; ca?: string }
  | undefined {
  if (process.env.DB_SSL !== 'true') return undefined;
  const caPath = process.env.DB_SSL_CA_PATH;
  if (caPath) {
    try {
      return { rejectUnauthorized: true, ca: readFileSync(resolve(caPath), 'utf8') };
    } catch {
      throw new Error(
        '[config] No se pudo leer DB_SSL_CA_PATH: ' + caPath,
      );
    }
  }
  return { rejectUnauthorized: false };
}
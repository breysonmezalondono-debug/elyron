import { execFile } from 'child_process';
import { existsSync } from 'fs';
import { createServer } from 'net';
import { join } from 'path';
import { promisify } from 'util';
import { Logger } from '@nestjs/common';
import * as mysql from 'mysql2/promise';

const execFileAsync = promisify(execFile);

export interface DbConnectionConfig {
  host: string;
  port: number;
  username: string;
  password: string;
  database: string;
}

export interface ResolvedDbConfig extends DbConnectionConfig {
  usedFallback: boolean;
}

interface FallbackOptions extends DbConnectionConfig {
  fallbackEnabled: boolean;
}

const logger = new Logger('DatabaseFallback');
const FALLBACK_ALT_PORT = 3307;
const WAIT_TIMEOUT_MS = 120_000;
const WAIT_INTERVAL_MS = 3_000;

async function canConnect(config: DbConnectionConfig): Promise<boolean> {
  let connection: mysql.Connection | null = null;
  try {
    connection = await mysql.createConnection({
      host: config.host,
      port: config.port,
      user: config.username,
      password: config.password,
      database: config.database,
      connectTimeout: 3_000,
    });
    await connection.ping();
    return true;
  } catch {
    return false;
  } finally {
    await connection?.end().catch(() => undefined);
  }
}

async function portHasListener(port: number): Promise<boolean> {
  return new Promise((resolve) => {
    const probe = createServer();
    probe.once('error', () => resolve(true));
    probe.once('listening', () => probe.close(() => resolve(false)));
    probe.listen(port, '127.0.0.1');
  });
}

async function dockerDaemonAvailable(): Promise<boolean> {
  try {
    await execFileAsync('docker', ['info', '--format', '{{.ServerVersion}}'], {
      timeout: 20_000,
      windowsHide: true,
    });
    return true;
  } catch {
    return false;
  }
}

function findComposeDir(): string | null {
  const candidates = [
    process.cwd(),
    join(__dirname, '..', '..', '..'),
    join(__dirname, '..', '..', '..', '..'),
  ];
  for (const dir of candidates) {
    if (
      existsSync(join(dir, 'docker-compose.yml')) ||
      existsSync(join(dir, 'docker-compose.yaml')) ||
      existsSync(join(dir, 'compose.yml'))
    ) {
      return dir;
    }
  }
  return null;
}

async function startDockerDb(port: number | undefined): Promise<boolean> {
  const composeDir = findComposeDir();
  if (!composeDir) {
    logger.error(
      'No se encontró docker-compose.yml; no se puede activar el respaldo',
    );
    return false;
  }

  const env = { ...process.env };
  if (port !== undefined) {
    env.DB_DOCKER_PORT = String(port);
  }

  const attempts: string[][] = [['docker', 'compose'], ['docker-compose']];

  for (const [command, ...args] of attempts) {
    try {
      await execFileAsync(command, [...args, 'up', '-d', 'db'], {
        cwd: composeDir,
        env,
        timeout: 180_000,
        windowsHide: true,
      });
      return true;
    } catch {
      continue;
    }
  }
  return false;
}

async function waitForDatabase(
  config: DbConnectionConfig,
  timeoutMs: number,
): Promise<boolean> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await canConnect(config)) {
      return true;
    }
    await new Promise((resolve) => setTimeout(resolve, WAIT_INTERVAL_MS));
  }
  return false;
}

export async function resolveDatabaseConfig(
  options: FallbackOptions,
): Promise<ResolvedDbConfig> {
  const primary: ResolvedDbConfig = { ...options, usedFallback: false };

  if (await canConnect(options)) {
    return primary;
  }

  logger.warn(
    `MySQL principal (${options.host}:${options.port}) no responde; intentando activar respaldo Docker...`,
  );

  if (!options.fallbackEnabled) {
    logger.warn('Fallback deshabilitado (DB_FALLBACK_ENABLED=false)');
    return primary;
  }

  if (!(await dockerDaemonAvailable())) {
    logger.error(
      'Docker no está disponible (¿Docker Desktop apagado?). Se seguirá intentando con el MySQL principal.',
    );
    return primary;
  }

  const primaryBusy = await portHasListener(options.port);
  const dockerPort = primaryBusy ? FALLBACK_ALT_PORT : options.port;
  if (primaryBusy) {
    logger.warn(
      `El puerto ${options.port} está ocupado; el contenedor de respaldo usará ${FALLBACK_ALT_PORT}`,
    );
  }

  const started = await startDockerDb(dockerPort);
  if (!started) {
    logger.error('No se pudo levantar el contenedor de respaldo (db)');
    return primary;
  }

  const ready = await waitForDatabase(
    { ...options, port: dockerPort },
    WAIT_TIMEOUT_MS,
  );
  if (!ready) {
    logger.error(
      `El contenedor de respaldo no quedó listo a tiempo en el puerto ${dockerPort}`,
    );
    return primary;
  }

  logger.log(
    `Respaldo Docker ACTIVO -> mysql://${options.host}:${dockerPort}/${options.database}`,
  );
  return { ...options, port: dockerPort, usedFallback: true };
}

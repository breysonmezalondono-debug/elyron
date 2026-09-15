import { NestFactory } from '@nestjs/core';
import { ValidationPipe, Logger } from '@nestjs/common';
import helmet from 'helmet';
import * as bodyParser from 'body-parser';
import { AppModule } from './app.module';
import { RolesGuard } from './common/guards/roles.guard';
import { InstitutionAccessGuard } from './common/guards/institution-access.guard';
import { validateEnvironment } from './config/env.validation';

const logger = new Logger('Bootstrap');

/** Orígenes permitidos para CORS (frontend). Se resuelve desde FRONTEND_URL
    (que puede ser una lista separada por comas) y APP_URL. */
function allowedOrigins(): string[] {
  const lista = [
    ...(process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(',') : []),
    ...(process.env.APP_URL ? [process.env.APP_URL] : []),
  ]
    .map((o) => o.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  return lista.length
    ? lista
    : ['http://localhost:5173', 'http://localhost:5174'];
}

async function bootstrap() {
  // Fail fast: valida variables obligatorias y tipos antes de abrir Nest.
  validateEnvironment();

  const app = await NestFactory.create(AppModule, {
    logger: ['log', 'error', 'warn', 'debug', 'verbose'],
  });

  app.setGlobalPrefix('api');

  // Seguridad HTTP básica. En desarrollo Helmet puede bloquear la consola de
  // Vite (ws://), por eso el CSP se relaja en dev.
  const isProd = process.env.NODE_ENV === 'production';
  app.use(
    helmet({
      crossOriginResourcePolicy: { policy: 'cross-origin' },
      contentSecurityPolicy: isProd ? undefined : false,
    }),
  );

  // Límite global de tamaño de body (JSON). Las subidas de archivos usan
  // multer y tienen su propio límite (MAX_FILE_SIZE).
  app.use(bodyParser.json({ limit: '2mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '2mb' }));

  app.enableCors({
    origin: (
      origin: string | undefined,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      const allowed = allowedOrigins();
      if (!origin || allowed.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  const reflector = app.get('Reflector');
  app.useGlobalGuards(
    new RolesGuard(reflector),
    new InstitutionAccessGuard(reflector),
  );

  // Puerto dinámico: el host (Render/Railway/Cloud) asigna PORT. Nunca se fija
  // en duro. Se escucha en 0.0.0.0 para aceptar conexiones externas.
  const port = Number(process.env.PORT) || 3000;

  // Graceful shutdown: cierra conexiones (BD, sockets) al recibir SIGTERM/SIGINT.
  app.enableShutdownHooks();

  await app.listen(port, '0.0.0.0');
  logger.log(
    `Elyron API escuchando en 0.0.0.0:${port} (env=${process.env.NODE_ENV || 'development'})`,
  );
}
void bootstrap().catch((err) => {
  logger.error('No se pudo iniciar el servidor', err?.message ?? err);
  process.exit(1);
});

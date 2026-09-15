import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import { RolesGuard } from './common/guards/roles.guard';
import { InstitutionAccessGuard } from './common/guards/institution-access.guard';

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
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
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
  const port = process.env.PORT ?? 3000;
  await app.listen(port);
  console.log(`Servidor corriendo en puerto ${port}`);
}
void bootstrap();

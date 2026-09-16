import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { join } from 'path';
import { resolveDatabaseConfig } from './database/db-fallback';
import { mysqlSslOptions } from './database/ssl-options';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './modules/auth/auth.module';
import { MailModule } from './modules/mail/mail.module';
import { PasswordResetModule } from './modules/password-reset/password-reset.module';
import { PasswordResetToken } from './modules/password-reset/password-reset-token.entity';
import { UsersModule } from './modules/users/users.module';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { FichasModule } from './modules/fichas/fichas.module';
import { CompetenciasModule } from './modules/competencias/competencias.module';
import { ResultadosModule } from './modules/resultados/resultados.module';
import { EvidenciasModule } from './modules/evidencias/evidencias.module';
import { FilesModule } from './modules/files/files.module';
import { CommunityModule } from './modules/community/community.module';
import { JobBoardModule } from './modules/job-board/job-board.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ChatModule } from './modules/chat/chat.module';
import { CalendarModule } from './modules/calendar/calendar.module';
import { AiModule } from './modules/ai/ai.module';
import { CallsModule } from './modules/calls/calls.module';
import { PerfilesModule } from './modules/perfiles/perfiles.module';
import { SenaModule } from './modules/sena/sena.module';
import { ColegioModule } from './modules/colegio/colegio.module';
import { SolicitudesModule } from './modules/solicitudes/solicitudes.module';
import { ComunicadosModule } from './modules/comunicados/comunicados.module';
import { BibliotecaModule } from './modules/biblioteca/biblioteca.module';
import { DocumentosModule } from './modules/documentos/documentos.module';
import { LiderazgoModule } from './modules/liderazgo/liderazgo.module';
import { ProgramasModule } from './modules/programas/programas.module';
import { DocenteModule } from './modules/docente/docente.module';
import { ModeracionModule } from './modules/moderacion/moderacion.module';
import { AuditoriaModule } from './modules/auditoria/auditoria.module';
import { EventosModule } from './modules/eventos/eventos.module';
import { CasosModule } from './modules/casos/casos.module';
import { ContextoModule } from './modules/contexto/contexto.module';
import { AppUrlModule } from './common/app-url.module';
import { entities } from './database/entities';

const entitiesToRegister = entities;

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => {
        const resolved = await resolveDatabaseConfig({
          host: config.get<string>('DB_HOST', 'localhost'),
          port: config.get<number>('DB_PORT', 3306),
          username: config.get<string>('DB_USERNAME', 'elyron'),
          password: config.get<string>('DB_PASSWORD', 'elyron123'),
          database: config.get<string>('DB_NAME', 'elyron_db'),
          fallbackEnabled:
            config.get<string>('DB_FALLBACK_ENABLED', 'true') !== 'false',
        });
        return {
          type: 'mysql' as const,
          host: resolved.host,
          port: resolved.port,
          username: resolved.username,
          password: resolved.password,
          database: resolved.database,
          charset: 'utf8mb4',
          timezone: 'Z',
          entities: entitiesToRegister,
          synchronize: config.get<string>('NODE_ENV') !== 'production',
          migrationsRun: false,
          migrations: [join(__dirname, 'migrations', '*.{ts,js}')],
          extra: { multipleStatements: true },
          ssl: mysqlSslOptions(),
          retryAttempts: 10,
          retryDelay: 3000,
        };
      },
    }),
    AuthModule,
    MailModule,
    PasswordResetModule,
    UsersModule,
    RolesModule,
    PermissionsModule,
    CompaniesModule,
    FichasModule,
    CompetenciasModule,
    ResultadosModule,
    EvidenciasModule,
    FilesModule,
    CommunityModule,
    JobBoardModule,
    NotificationsModule,
    ChatModule,
    CalendarModule,
    AiModule,
    CallsModule,
    PerfilesModule,
    SenaModule,
    ColegioModule,
    SolicitudesModule,
    ComunicadosModule,
    BibliotecaModule,
    DocumentosModule,
    LiderazgoModule,
    ProgramasModule,
    DocenteModule,
    ModeracionModule,
    AuditoriaModule,
    EventosModule,
    ContextoModule,
    CasosModule,
    AppUrlModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

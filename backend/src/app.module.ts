import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { resolveDatabaseConfig } from './database/db-fallback';
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
import { User } from './modules/users/user.entity';
import { Role } from './modules/roles/role.entity';
import { Permission } from './modules/permissions/permission.entity';
import { Company } from './modules/companies/company.entity';
import { Ficha } from './modules/fichas/ficha.entity';
import { Competencia } from './modules/competencias/competencia.entity';
import { Resultado } from './modules/resultados/resultado.entity';
import { Evidencia } from './modules/evidencias/evidencia.entity';
import { CommunityPost } from './modules/community/entities/community-post.entity';
import { PostLike } from './modules/community/entities/post-like.entity';
import { PostComment } from './modules/community/entities/post-comment.entity';
import { PostReport } from './modules/community/entities/post-report.entity';
import { CommunityAnnouncement } from './modules/community/entities/community-announcement.entity';
import { JobListing } from './modules/job-board/entities/job-listing.entity';
import { Notification } from './modules/notifications/notification.entity';
import { ChatMessage } from './modules/chat/entities/chat-message.entity';
import { CalendarEvent } from './modules/calendar/entities/calendar-event.entity';
import { Call } from './modules/calls/entities/call.entity';
import { PerfilColegio } from './modules/perfiles/entities/perfil-colegio.entity';
import { PerfilSena } from './modules/perfiles/entities/perfil-sena.entity';
import { PerfilUniversidad } from './modules/perfiles/entities/perfil-universidad.entity';
import { FichaInstructor } from './modules/sena/entities/ficha-instructor.entity';
import { Remision } from './modules/sena/entities/remision.entity';
import { Grupo } from './modules/colegio/entities/grupo.entity';
import { DocenteGrupo } from './modules/colegio/entities/docente-grupo.entity';
import { RemisionColegio } from './modules/colegio/entities/remision-colegio.entity';
import { Solicitud } from './modules/solicitudes/entities/solicitud.entity';
import { Comunicado } from './modules/comunicados/entities/comunicado.entity';
import { RecursoBiblioteca } from './modules/biblioteca/entities/recurso-biblioteca.entity';
import { DocumentoPersonal } from './modules/documentos/entities/documento-personal.entity';
import { FichaAnuncio } from './modules/liderazgo/entities/ficha-anuncio.entity';
import { Inquietud } from './modules/liderazgo/entities/ficha-inquietud.entity';
import { Programa } from './modules/programas/entities/programa.entity';
import { Actividad } from './modules/docente/entities/actividad.entity';
import { Entrega } from './modules/docente/entities/entrega.entity';
import { ReporteModeracion } from './modules/moderacion/entities/reporte.entity';
import { AuditLog } from './modules/auditoria/entities/audit-log.entity';
import { InstitutionContext } from './modules/contexto/entities/institution-context.entity';
import { InstitucionCatalogo } from './modules/contexto/entities/institucion-catalogo.entity';
import { InstitutionScope } from './modules/contexto/entities/institution-scope.entity';
import { Responsibility } from './modules/contexto/entities/responsibility.entity';
import { ResponsibilityAssignment } from './modules/contexto/entities/responsibility-assignment.entity';
import { Case } from './modules/casos/entities/case.entity';
import { CaseCategory } from './modules/casos/entities/case-category.entity';
import { CaseMessage } from './modules/casos/entities/case-message.entity';
import { CaseHistory } from './modules/casos/entities/case-history.entity';
import { ElirPlan } from './modules/ai/entities/elir-plan.entity';
import { ElirUsage } from './modules/ai/entities/elir-usage.entity';
import { ElirDocument } from './modules/ai/entities/elir-document.entity';
import { ElirConversation } from './modules/ai/entities/elir-conversation.entity';
import { ElirMessage } from './modules/ai/entities/elir-message.entity';

const entities = [
  User,
  Role,
  Permission,
  Company,
  Ficha,
  FichaInstructor,
  Remision,
  Competencia,
  Resultado,
  Evidencia,
  CommunityPost,
  PostLike,
  PostComment,
  PostReport,
  CommunityAnnouncement,
  JobListing,
  Notification,
  ChatMessage,
  CalendarEvent,
  Call,
  PerfilColegio,
  PerfilSena,
  PerfilUniversidad,
  Grupo,
  DocenteGrupo,
  RemisionColegio,
  Solicitud,
  Comunicado,
  RecursoBiblioteca,
  DocumentoPersonal,
  FichaAnuncio,
  Inquietud,
  Programa,
  Actividad,
  Entrega,
  ReporteModeracion,
  AuditLog,
  InstitutionContext,
  InstitutionScope,
  Responsibility,
  ResponsibilityAssignment,
  Case,
  CaseCategory,
  CaseMessage,
  CaseHistory,
  PasswordResetToken,
  ElirPlan,
  ElirUsage,
  ElirDocument,
  ElirConversation,
  ElirMessage,
  InstitucionCatalogo,
];

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
          entities,
          synchronize: config.get<string>('NODE_ENV') !== 'production',
          retryAttempts: 10,
          retryDelay: 3000,
        };
      },
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
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

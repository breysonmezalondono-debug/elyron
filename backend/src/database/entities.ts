import { User } from '../modules/users/user.entity';
import { Role } from '../modules/roles/role.entity';
import { Permission } from '../modules/permissions/permission.entity';
import { Company } from '../modules/companies/company.entity';
import { Ficha } from '../modules/fichas/ficha.entity';
import { Competencia } from '../modules/competencias/competencia.entity';
import { Resultado } from '../modules/resultados/resultado.entity';
import { Evidencia } from '../modules/evidencias/evidencia.entity';
import { CommunityPost } from '../modules/community/entities/community-post.entity';
import { PostLike } from '../modules/community/entities/post-like.entity';
import { PostComment } from '../modules/community/entities/post-comment.entity';
import { PostReport } from '../modules/community/entities/post-report.entity';
import { CommunityAnnouncement } from '../modules/community/entities/community-announcement.entity';
import { JobListing } from '../modules/job-board/entities/job-listing.entity';
import { Notification } from '../modules/notifications/notification.entity';
import { ChatMessage } from '../modules/chat/entities/chat-message.entity';
import { CalendarEvent } from '../modules/calendar/entities/calendar-event.entity';
import { Call } from '../modules/calls/entities/call.entity';
import { PerfilColegio } from '../modules/perfiles/entities/perfil-colegio.entity';
import { PerfilSena } from '../modules/perfiles/entities/perfil-sena.entity';
import { PerfilUniversidad } from '../modules/perfiles/entities/perfil-universidad.entity';
import { FichaInstructor } from '../modules/sena/entities/ficha-instructor.entity';
import { Remision } from '../modules/sena/entities/remision.entity';
import { Grupo } from '../modules/colegio/entities/grupo.entity';
import { DocenteGrupo } from '../modules/colegio/entities/docente-grupo.entity';
import { RemisionColegio } from '../modules/colegio/entities/remision-colegio.entity';
import { Solicitud } from '../modules/solicitudes/entities/solicitud.entity';
import { Comunicado } from '../modules/comunicados/entities/comunicado.entity';
import { RecursoBiblioteca } from '../modules/biblioteca/entities/recurso-biblioteca.entity';
import { DocumentoPersonal } from '../modules/documentos/entities/documento-personal.entity';
import { FichaAnuncio } from '../modules/liderazgo/entities/ficha-anuncio.entity';
import { Inquietud } from '../modules/liderazgo/entities/ficha-inquietud.entity';
import { Programa } from '../modules/programas/entities/programa.entity';
import { Actividad } from '../modules/docente/entities/actividad.entity';
import { Entrega } from '../modules/docente/entities/entrega.entity';
import { ReporteModeracion } from '../modules/moderacion/entities/reporte.entity';
import { AuditLog } from '../modules/auditoria/entities/audit-log.entity';
import { InstitutionContext } from '../modules/contexto/entities/institution-context.entity';
import { InstitucionCatalogo } from '../modules/contexto/entities/institucion-catalogo.entity';
import { InstitutionScope } from '../modules/contexto/entities/institution-scope.entity';
import { Responsibility } from '../modules/contexto/entities/responsibility.entity';
import { ResponsibilityAssignment } from '../modules/contexto/entities/responsibility-assignment.entity';
import { Case } from '../modules/casos/entities/case.entity';
import { CaseCategory } from '../modules/casos/entities/case-category.entity';
import { CaseMessage } from '../modules/casos/entities/case-message.entity';
import { CaseHistory } from '../modules/casos/entities/case-history.entity';
import { ElirPlan } from '../modules/ai/entities/elir-plan.entity';
import { ElirUsage } from '../modules/ai/entities/elir-usage.entity';
import { ElirDocument } from '../modules/ai/entities/elir-document.entity';
import { ElirConversation } from '../modules/ai/entities/elir-conversation.entity';
import { ElirMessage } from '../modules/ai/entities/elir-message.entity';
import { PasswordResetToken } from '../modules/password-reset/password-reset-token.entity';

/**
 * Lista única de entidades de TypeORM de Elyron.
 * Se comparte entre app.module (TypeORMModule) y el seed para evitar
 * "Entity metadata for X was not found" por listas incompletas.
 */
export const entities = [
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
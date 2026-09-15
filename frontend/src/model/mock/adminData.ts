import type { FeedItem } from '../../components/elyron/ActivityFeed';

export interface AdminStats {
  activeUsers: number;
  activeGroups: number;
  pendingEvidence: number;
  openReports: number;
}

export interface RoleDistributionRow {
  roleKey: string;
  count: number;
}

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  roleKey: string;
  institutionId: string;
  extraRoleKeys: string[];
  status: 'Activo' | 'Suspendido';
  lastActive: string;
}

export interface InstitutionSummary {
  institutionId: string;
  learners: number;
  instructors: number;
  groups: number;
  agreements: number;
}

export type AuditCategory = 'usuarios' | 'contenido' | 'moderacion' | 'configuracion';

export interface AuditEntry {
  id: string;
  actor: string;
  action: string;
  target: string;
  time: string;
  category: AuditCategory;
}

export const ADMIN_STATS: AdminStats = {
  activeUsers: 564,
  activeGroups: 21,
  pendingEvidence: 37,
  openReports: 4,
};

export const ROLE_DISTRIBUTION: RoleDistributionRow[] = [
  { roleKey: 'aprendiz', count: 512 },
  { roleKey: 'instructor', count: 47 },
  { roleKey: 'coordinador', count: 8 },
  { roleKey: 'admin', count: 5 },
];

export const INSTITUTION_SUMMARIES: InstitutionSummary[] = [
  {
    institutionId: 'inst-sena',
    learners: 384,
    instructors: 36,
    groups: 14,
    agreements: 9,
  },
  {
    institutionId: 'inst-aurora',
    learners: 180,
    instructors: 11,
    groups: 7,
    agreements: 4,
  },
];

export const ADMIN_USERS: AdminUser[] = [
  {
    id: 'au-1',
    name: 'Carolina Pardo',
    email: 'breyadmin26@gmail.com',
    roleKey: 'admin',
    institutionId: 'inst-sena',
    extraRoleKeys: [],
    status: 'Activo',
    lastActive: 'Ahora',
  },
  {
    id: 'au-2',
    name: 'Gabriel Beltrán',
    email: 'profesor@elyron.com',
    roleKey: 'instructor',
    institutionId: 'inst-sena',
    extraRoleKeys: [],
    status: 'Activo',
    lastActive: 'hace 15 min',
  },
  {
    id: 'au-3',
    name: 'Ana Martínez',
    email: 'ana@elyron.com',
    roleKey: 'instructor',
    institutionId: 'inst-sena',
    extraRoleKeys: ['aprendiz'],
    status: 'Activo',
    lastActive: 'hace 1 h',
  },
  {
    id: 'au-5',
    name: 'Julián Restrepo',
    email: 'julian.restrepo@elyron.com',
    roleKey: 'instructor',
    institutionId: 'inst-aurora',
    extraRoleKeys: [],
    status: 'Activo',
    lastActive: 'ayer',
  },
  {
    id: 'au-6',
    name: 'Verónica Salinas',
    email: 'veronica.salinas@elyron.com',
    roleKey: 'aprendiz',
    institutionId: 'inst-aurora',
    extraRoleKeys: [],
    status: 'Suspendido',
    lastActive: 'hace 6 días',
  },
  {
    id: 'au-7',
    name: 'Óscar Medina',
    email: 'oscar.medina@elyron.com',
    roleKey: 'aprendiz',
    institutionId: 'inst-sena',
    extraRoleKeys: [],
    status: 'Activo',
    lastActive: 'hace 2 h',
  },
];

export const AUDIT_LOG: AuditEntry[] = [
  {
    id: 'aud-1',
    actor: 'Carolina Pardo',
    action: 'suspendió la cuenta de',
    target: 'Verónica Salinas',
    time: 'Hoy · 10:24',
    category: 'moderacion',
  },
  {
    id: 'aud-2',
    actor: 'Sistema',
    action: 'publicó el comunicado',
    target: 'Convocatoria comité de seguimiento',
    time: 'Hoy · 08:00',
    category: 'contenido',
  },
  {
    id: 'aud-3',
    actor: 'Carolina Pardo',
    action: 'aceptó 3 nuevos instructores en',
    target: 'Corporación Universitaria Aurora',
    time: 'Ayer · 16:40',
    category: 'usuarios',
  },
  {
    id: 'aud-4',
    actor: 'Gabriel Beltrán',
    action: 'calificó 12 evidencias del grupo',
    target: 'BD-2489011',
    time: 'Ayer · 15:02',
    category: 'contenido',
  },
  {
    id: 'aud-5',
    actor: 'Moderación automática',
    action: 'ocultó un comentario reportado en',
    target: 'Comunidad · Foro 3FN',
    time: 'Ayer · 11:18',
    category: 'moderacion',
  },
  {
    id: 'aud-6',
    actor: 'Carolina Pardo',
    action: 'actualizó el periodo académico de',
    target: 'Programa ADSI',
    time: 'Lunes · 09:30',
    category: 'configuracion',
  },
  {
    id: 'aud-7',
    actor: 'Sistema',
    action: 'restableció la contraseña de',
    target: 'Óscar Medina',
    time: 'Lunes · 07:55',
    category: 'usuarios',
  },
];

export type ReportReason = 'spam' | 'contenido_inapropiado' | 'acoso' | 'otro';
export type ReportStatus = 'pendiente' | 'aprobado' | 'ocultado' | 'advertencia';

export interface CommunityReport {
  id: string;
  contentExcerpt: string;
  reportedBy: string;
  reportedByRole: string;
  reason: ReportReason;
  status: ReportStatus;
  createdAt: string;
  authorName: string;
}

export const REPORT_REASON_LABELS: Record<ReportReason, string> = {
  spam: 'Spam',
  contenido_inapropiado: 'Contenido inapropiado',
  acoso: 'Acoso',
  otro: 'Otro',
};

export const REPORT_REASON_BADGE: Record<ReportReason, string> = {
  spam: 'bg-amber-50 text-amber-700 ring-amber-200',
  contenido_inapropiado: 'bg-red-50 text-red-500 ring-red-200',
  acoso: 'bg-red-50 text-red-500 ring-red-200',
  otro: 'bg-canvas-deep text-ink-600 ring-line-strong',
};

export const REPORT_STATUS_LABELS: Record<ReportStatus, string> = {
  pendiente: 'Pendiente',
  aprobado: 'Descartado',
  ocultado: 'Ocultado',
  advertencia: 'Con advertencia',
};

export const REPORT_STATUS_BADGE: Record<ReportStatus, string> = {
  pendiente: 'bg-amber-50 text-amber-700 ring-amber-200',
  aprobado: 'bg-mint-50 text-mint-700 ring-mint-200',
  ocultado: 'bg-ink-900 text-white ring-ink-900',
  advertencia: 'bg-red-50 text-red-500 ring-red-200',
};

export const COMMUNITY_REPORTS: CommunityReport[] = [
  {
    id: 'cr-1',
    contentExcerpt: 'Este taller es una basura, el instructor no sabe nada y debería ser despedido...',
    reportedBy: 'Laura Gómez',
    reportedByRole: 'Aprendiz',
    reason: 'contenido_inapropiado',
    status: 'pendiente',
    createdAt: 'Hoy · 11:32',
    authorName: 'Juan Pérez',
  },
  {
    id: 'cr-2',
    contentExcerpt: 'Compre mi curso de programación al mejor precio, contacto al...',
    reportedBy: 'Steven',
    reportedByRole: 'Aprendiz',
    reason: 'spam',
    status: 'pendiente',
    createdAt: 'Hoy · 09:15',
    authorName: 'Cuenta sospechosa',
  },
  {
    id: 'cr-3',
    contentExcerpt: '¿Alguien tiene las respuestas del examen? Pago por ellas, mensaje privado.',
    reportedBy: 'Ana Martínez',
    reportedByRole: 'Instructor',
    reason: 'contenido_inapropiado',
    status: 'pendiente',
    createdAt: 'Ayer · 16:40',
    authorName: 'Óscar Medina',
  },
  {
    id: 'cr-4',
    contentExcerpt: 'Eres un inútil, no deberías estar en este grupo si no entiendes nada.',
    reportedBy: 'Gabriel Beltrán',
    reportedByRole: 'Instructor',
    reason: 'acoso',
    status: 'pendiente',
    createdAt: 'Ayer · 14:22',
    authorName: 'Carlos Ramírez',
  },
  {
    id: 'cr-5',
    contentExcerpt: 'publica tus tareas y yo las hago por ti, barato...',
    reportedBy: 'Laura Castaño',
    reportedByRole: 'Aprendiz',
    reason: 'spam',
    status: 'pendiente',
    createdAt: 'Lunes · 10:05',
    authorName: 'Servicios freelance',
  },
  {
    id: 'cr-6',
    contentExcerpt: 'El material compartido no tiene derechos de autor, es de uso libre.',
    reportedBy: 'Sistema automático',
    reportedByRole: 'Sistema',
    reason: 'otro',
    status: 'aprobado',
    createdAt: 'Lunes · 08:30',
    authorName: 'Laura Castaño',
  },
  {
    id: 'cr-7',
    contentExcerpt: 'Comentario ofensivo hacia el programa ADSI removido por moderación.',
    reportedBy: 'Carolina Pardo',
    reportedByRole: 'Admin',
    reason: 'contenido_inapropiado',
    status: 'ocultado',
    createdAt: '24 Ago · 15:10',
    authorName: 'Verónica Salinas',
  },
];

export const INSTITUTION_FEED: FeedItem[] = [
  {
    id: 'i1',
    type: 'user',
    title: 'Nuevo aprendiz aceptado: Santiago Mora',
    meta: 'ADSI-2451310 · SENA',
    time: '10:05',
    to: '/admin/usuarios',
  },
  {
    id: 'i2',
    type: 'incident',
    title: 'Comentario reportado en comunidad',
    meta: 'Trato irrespetuoso · requiere revisión',
    time: '09:41',
    to: '/admin/moderacion',
  },
  {
    id: 'i3',
    type: 'notice',
    title: 'Comunicado publicado a toda la institución',
    meta: 'Recordatorio: cierre de notas del periodo',
    time: '08:00',
    to: '/admin',
  },
  {
    id: 'i4',
    type: 'user',
    title: 'Carolina Pardo invitó a 2 docentes',
    meta: 'Corporación Universitaria Aurora',
    time: 'Ayer',
    to: '/admin/usuarios',
  },
  {
    id: 'i5',
    type: 'incident',
    title: 'Incidente resuelto: publicación duplicada',
    meta: 'Moderada por Carolina Pardo',
    time: 'Ayer',
    to: '/admin/moderacion',
  },
  {
    id: 'i6',
    type: 'job',
    title: 'Nueva empresa aliada registrada',
    meta: 'TechSolutions · 2 convenios activos',
    time: 'Hace 2 días',
    to: '/admin/empresas',
  },
];

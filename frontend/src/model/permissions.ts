import type { Membership } from './institution';

export type Capability =
  | 'lecciones.ver'
  | 'lecciones.crear'
  | 'actividades.crear'
  | 'evidencias.entregar'
  | 'evidencias.calificar'
  | 'evidencias.ver.todas'
  | 'progreso.propio'
  | 'progreso.grupos'
  | 'calendario.gestionar'
  | 'comunidad.participar'
  | 'comunidad.moderar'
  | 'comunicados.publicar.grupo'
  | 'comunicados.publicar.inst'
  | 'empleo.consultar'
  | 'empresas.gestionar'
  | 'usuarios.gestionar'
  | 'instituciones.gestionar'
  | 'programas.gestionar'
  | 'reportes.ver'
  | 'auditoria.ver'
  | 'reportes.programa'
  | 'evidencias.ver.programa'
  | 'avance.ver.programa'
  | 'comunicados.publicar.programa';

export const ROLE_CAPABILITIES: Record<string, readonly Capability[]> = {
  admin: [
    'progreso.grupos',
    'evidencias.ver.todas',
    'comunidad.moderar',
    'comunicados.publicar.inst',
    'empresas.gestionar',
    'usuarios.gestionar',
    'instituciones.gestionar',
    'programas.gestionar',
    'reportes.ver',
    'auditoria.ver',
  ],
  rector: [
    'progreso.grupos',
    'evidencias.ver.todas',
    'comunidad.moderar',
    'comunicados.publicar.inst',
    'empresas.gestionar',
    'usuarios.gestionar',
    'programas.gestionar',
    'reportes.ver',
  ],
  docente: [
    'lecciones.crear',
    'actividades.crear',
    'evidencias.calificar',
    'progreso.grupos',
    'calendario.gestionar',
    'comunidad.participar',
    'comunicados.publicar.grupo',
  ],
  orientador: [
    'comunidad.participar',
    'calendario.gestionar',
    'comunicados.publicar.grupo',
  ],
  coordinador_convivencia: [
    'comunidad.moderar',
    'comunicados.publicar.inst',
    'calendario.gestionar',
    'comunidad.participar',
  ],
  instructor: [
    'lecciones.crear',
    'actividades.crear',
    'evidencias.calificar',
    'progreso.grupos',
    'calendario.gestionar',
    'comunidad.participar',
    'comunicados.publicar.grupo',
    'empleo.consultar',
  ],
  coordinador: [
    'reportes.programa',
    'evidencias.ver.programa',
    'avance.ver.programa',
    'comunicados.publicar.programa',
    'comunidad.participar',
    'calendario.gestionar',
  ],
  aprendiz: [
    'lecciones.ver',
    'evidencias.entregar',
    'progreso.propio',
    'comunidad.participar',
    'empleo.consultar',
  ],
  universitario: [
    'lecciones.ver',
    'evidencias.entregar',
    'progreso.propio',
    'comunidad.participar',
    'empleo.consultar',
  ],
  estudiante: [
    'evidencias.entregar',
    'progreso.propio',
    'comunidad.participar',
    'empleo.consultar',
  ],
};

export const IMPLEMENTED_ROLE_KEYS: readonly string[] = Object.keys(ROLE_CAPABILITIES);

export const can = (roleKey: string | null | undefined, capability: Capability): boolean =>
  !!roleKey && (ROLE_CAPABILITIES[roleKey]?.includes(capability) ?? false);

export interface RoleSession {
  roleKey: string;
  institutionId: string;
}

export const distinctRoleSessions = (memberships?: Membership[] | null): RoleSession[] => {
  if (!memberships) return [];
  const seen = new Set<string>();
  const sessions: RoleSession[] = [];
  memberships.forEach(({ institutionId, roleKey }) => {
    if (!IMPLEMENTED_ROLE_KEYS.includes(roleKey)) return;
    const composite = `${roleKey}::${institutionId}`;
    if (!seen.has(composite)) {
      seen.add(composite);
      sessions.push({ roleKey, institutionId });
    }
  });
  return sessions;
};

export const requiresRoleSelection = (sessions: RoleSession[]): boolean =>
  new Set(sessions.map((session) => session.roleKey)).size > 1;

export const ROLE_HOME: Record<string, string> = {
  admin: '/admin',
  coordinador: '/coordinador',
  instructor: '/instructor',
  docente: '/profesor',
  aprendiz: '/dashboard',
  universitario: '/dashboard',
  rector: '/colegio',
  orientador: '/colegio',
  coordinador_convivencia: '/colegio',
  estudiante: '/dashboard',
};

export const homeForRole = (roleKey?: string | null): string =>
  (roleKey && ROLE_HOME[roleKey]) || '/dashboard';

/* ============================================================
   PORTALES SEPARADOS (Separation of Concerns)
   Campus = consumo (aprendizaje/gamificación).
   Cada rol de staff tiene su PROPIO portal independiente
   (instructor, profesor, coordinador, admin, colegio).
   ============================================================ */
export type PortalKey = 'campus' | 'instructor' | 'profesor' | 'coordinador' | 'admin' | 'colegio';

/** Roles orientados al consumo / aprendizaje (Portal Campus). */
export const CAMPUS_ROLES: readonly string[] = [
  'aprendiz',
  'universitario',
  'estudiante',
];

/** Roles orientados a la producción / gestión (Portales independientes). */
export const STAFF_ROLES: readonly string[] = [
  'instructor',
  'docente',
  'rector',
  'orientador',
  'coordinador_convivencia',
  'coordinador',
  'admin',
];

export const isCampusRole = (roleKey?: string | null): boolean =>
  !!roleKey && CAMPUS_ROLES.includes(roleKey);

export const isStaffRole = (roleKey?: string | null): boolean =>
  !!roleKey && STAFF_ROLES.includes(roleKey);

/** Asigna cada rol a su portal independiente (o campus si es de consumo). */
export const portalForRole = (roleKey?: string | null): PortalKey => {
  if (!roleKey) return 'campus';
  if (isCampusRole(roleKey)) return 'campus';
  if (roleKey === 'instructor') return 'instructor';
  if (roleKey === 'docente') return 'profesor';
  if (roleKey === 'coordinador') return 'coordinador';
  if (roleKey === 'admin') return 'admin';
  return 'colegio';
};

/** Ruta raíz del portal al que pertenece un rol. */
export const portalHomeForRole = (roleKey?: string | null): string => {
  switch (portalForRole(roleKey)) {
    case 'instructor':
      return '/instructor';
    case 'profesor':
      return '/profesor';
    case 'coordinador':
      return '/coordinador';
    case 'admin':
      return '/admin';
    case 'colegio':
      return '/colegio';
    default:
      return '/campus';
  }
};

export interface RouteAccess {
  prefix: string;
  roles: readonly string[];
}

export interface RouteAccess {
  prefix: string;
  roles: readonly string[];
  /** Flags del usuario que deben ser true además del rol (gating por atributo). */
  atributos?: readonly string[];
}

export const ROUTE_ACCESS: readonly RouteAccess[] = [
  { prefix: '/dashboard', roles: ['aprendiz', 'universitario'] },
  { prefix: '/lecciones', roles: ['aprendiz', 'universitario'] },
  { prefix: '/academico', roles: ['aprendiz', 'universitario'] },
  { prefix: '/evidencias', roles: ['aprendiz', 'universitario', 'estudiante'] },
  { prefix: '/bienvenida', roles: ['aprendiz', 'universitario'] },
  { prefix: '/comunidad', roles: ['aprendiz', 'instructor', 'coordinador', 'estudiante', 'docente', 'orientador', 'coordinador_convivencia', 'rector', 'universitario'] },
  { prefix: '/eventos', roles: ['aprendiz', 'instructor', 'coordinador', 'estudiante', 'docente', 'orientador', 'coordinador_convivencia', 'rector', 'universitario'] },
  { prefix: '/empresas', roles: ['aprendiz', 'instructor'] },
  { prefix: '/ofertas', roles: ['aprendiz', 'instructor', 'universitario'] },
  { prefix: '/calendario', roles: ['aprendiz', 'instructor', 'coordinador', 'estudiante', 'docente', 'orientador', 'coordinador_convivencia', 'rector', 'universitario'] },
  { prefix: '/ficha', roles: ['aprendiz'] },
  { prefix: '/vocera', roles: ['aprendiz'], atributos: ['es_vocero'] },
  { prefix: '/colider', roles: ['aprendiz'], atributos: ['es_vocero_suplente'] },
  { prefix: '/comunicados', roles: ['aprendiz'] },
  { prefix: '/solicitudes', roles: ['aprendiz'] },
  { prefix: '/apoyo', roles: ['aprendiz'] },
  { prefix: '/biblioteca', roles: ['aprendiz'] },
  { prefix: '/documentos', roles: ['aprendiz'] },
  { prefix: '/perfil', roles: ['aprendiz', 'universitario'] },
  { prefix: '/notificaciones', roles: ['aprendiz', 'universitario'] },
  { prefix: '/colegio', roles: ['estudiante', 'docente', 'orientador', 'coordinador_convivencia', 'rector'] },
  { prefix: '/profesor', roles: ['docente'] },
  { prefix: '/instructor', roles: ['instructor'] },
  { prefix: '/coordinador', roles: ['coordinador'] },
  { prefix: '/admin', roles: ['admin'] },
];

export const rolesForRoute = (prefix: string): readonly string[] =>
  ROUTE_ACCESS.find((entry) => entry.prefix === prefix)?.roles ?? [];

export const routeAllowedFor = (
  roleKey: string | null | undefined,
  pathname: string,
  flags?: Record<string, unknown> | null,
): boolean => {
  if (!roleKey) return false;
  return ROUTE_ACCESS.some((entry) => {
    if (!entry.roles.includes(roleKey) || !pathname.startsWith(entry.prefix)) {
      return false;
    }
    return !entry.atributos || entry.atributos.every((attr) => Boolean(flags?.[attr]));
  });
};

export type RoleAccent = 'mint' | 'ink' | 'violet' | 'amber';

export const ROLE_ACCENT: Record<string, RoleAccent> = {
  admin: 'ink',
  coordinador: 'amber',
  instructor: 'violet',
  aprendiz: 'mint',
  universitario: 'mint',
  rector: 'ink',
  docente: 'violet',
  orientador: 'amber',
  coordinador_convivencia: 'amber',
  estudiante: 'mint',
};

export const ROLE_DESCRIPTION: Record<string, string> = {
  admin: 'Gestiona usuarios, programas y la actividad de toda la institución.',
  coordinador: 'Supervisa grupos e instructores de tu programa y revisa reportes agregados.',
  instructor: 'Crea actividades, califica evidencias y guía tus grupos.',
  aprendiz: 'Aprende a tu ritmo, entrega evidencias y participa en la comunidad.',
  universitario: 'Estudia tu programa universitario, entrega evidencias y participa en la comunidad.',
  rector: 'Lidera el colegio: grupos, docentes, remisiones y la actividad institucional.',
  docente: 'Guía tus grupos, crea actividades y acompaña el avance de tus estudiantes.',
  orientador: 'Gestiona remisiones de orientación y acompaña a los estudiantes.',
  coordinador_convivencia: 'Mantiene la sana convivencia y coordina la comunidad educativa.',
  estudiante: 'Participa en tu grupo, consulta convocatorias y participa en la comunidad.',
};

import type { FeedItem } from '../../components/elyron/ActivityFeed';

export interface CoordinatorStats {
  activeGroups: number;
  activeInstructors: number;
  pendingEvidence: number;
  publishedNotices: number;
}

export interface CoordinatedGroup {
  id: string;
  code: string;
  name: string;
  instructor: string;
  learners: number;
  averageProgress: number;
  trend: number;
  pendingEvidence: number;
}

export interface CoordinatedInstructor {
  id: string;
  name: string;
  email: string;
  groups: number;
  lastActive: string;
}

export const COORDINATOR_STATS: CoordinatorStats = {
  activeGroups: 6,
  activeInstructors: 4,
  pendingEvidence: 23,
  publishedNotices: 2,
};

export const COORDINATED_GROUPS: CoordinatedGroup[] = [
  {
    id: 'grp-adsi',
    code: 'ADSI-2451310',
    name: 'Desarrollo de Software',
    instructor: 'Gabriel Beltrán',
    learners: 28,
    averageProgress: 68,
    trend: 6,
    pendingEvidence: 9,
  },
  {
    id: 'grp-bd',
    code: 'BD-2489011',
    name: 'Bases de Datos II',
    instructor: 'Ana Martínez',
    learners: 24,
    averageProgress: 54,
    trend: -2,
    pendingEvidence: 7,
  },
  {
    id: 'grp-web',
    code: 'WEB-2510044',
    name: 'Programación Web',
    instructor: 'Julián Restrepo',
    learners: 31,
    averageProgress: 41,
    trend: 9,
    pendingEvidence: 5,
  },
  {
    id: 'grp-net',
    code: 'NET-2510055',
    name: 'Redes y Seguridad',
    instructor: 'Gabriel Beltrán',
    learners: 18,
    averageProgress: 62,
    trend: 3,
    pendingEvidence: 2,
  },
];

export const COORDINATED_INSTRUCTORS: CoordinatedInstructor[] = [
  { id: 'inst-1', name: 'Gabriel Beltrán', email: 'profesor@elyron.com', groups: 2, lastActive: 'Ahora' },
  { id: 'inst-2', name: 'Ana Martínez', email: 'ana@elyron.com', groups: 1, lastActive: 'hace 1 h' },
  { id: 'inst-3', name: 'Julián Restrepo', email: 'julian.restrepo@elyron.com', groups: 1, lastActive: 'ayer' },
  { id: 'inst-4', name: 'Laura Sánchez', email: 'laura.sanchez@elyron.com', groups: 2, lastActive: 'hace 3 h' },
];

export const COORDINATOR_FEED: FeedItem[] = [
  { id: 'c1', type: 'submission', title: '12 nuevas evidencias en ADSI-2451310', meta: 'Proyecto Integrador · grupo de Gabriel', time: '09:12', to: '/coordinador/reportes' },
  { id: 'c2', type: 'notice', title: 'Comunicado publicado a todos los grupos del programa', meta: 'Cronograma de cierre del periodo', time: '08:00', to: '/coordinador/comunicados' },
  { id: 'c3', type: 'question', title: 'Instructor reportó retraso en entregas', meta: 'BD-2489011 · 7 evidencias pendientes', time: 'Ayer', to: '/coordinador/reportes' },
  { id: 'c4', type: 'grade', title: 'Promedio del programa subió 4 puntos', meta: '68% → 72% en la última semana', time: 'Ayer', to: '/coordinador/reportes' },
  { id: 'c5', type: 'task', title: 'Reunión de coordinación programada', meta: 'Viernes · 14:00 · Sala de juntas', time: 'Hace 2 días', to: '/calendario' },
  { id: 'c6', type: 'user', title: 'Nuevo instructor asignado: Laura Sánchez', meta: 'Programa ADSI · 2 grupos', time: 'Hace 3 días', to: '/coordinador/grupos' },
];

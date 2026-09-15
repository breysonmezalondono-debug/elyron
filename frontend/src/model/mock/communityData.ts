export const COMMUNITY_CATEGORIES = ['duda', 'recurso', 'convocatoria', 'general'] as const;

export type CommunityCategory = (typeof COMMUNITY_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<CommunityCategory, string> = {
  duda: 'Duda',
  recurso: 'Recurso',
  convocatoria: 'Convocatoria',
  general: 'General',
};

export type AuthorRoleKey = 'instructor' | 'companion' | 'apprentice';

export interface PostComment {
  id: string;
  author: string;
  content: string;
}

export interface CommunityPost {
  id: string;
  author: string;
  authorRole: AuthorRoleKey;
  groupCode: string | null;
  category: CommunityCategory;
  content: string;
  likesCount: number;
  likedByMe: boolean;
  comments: PostComment[];
  reports: { reason: string; reportedAt: string }[];
}

export type AnnouncementAudience =
  | { scope: 'institucion' }
  | { scope: 'grupo'; groupCode: string };

export interface Announcement {
  id: string;
  title: string;
  body: string;
  issuer: string;
  audience: AnnouncementAudience;
  publishedAt: string;
  pinned: boolean;
}

export interface TeacherQuestion {
  id: string;
  studentName: string;
  mine: boolean;
  competency: string;
  question: string;
  askedAt: string;
  answer: string | null;
  answeredBy: string | null;
  answeredAt: string | null;
}

export const INITIAL_POSTS: CommunityPost[] = [
  {
    id: 'post-1',
    author: 'Carlos Instructor',
    authorRole: 'instructor',
    groupCode: null,
    category: 'convocatoria',
    content:
      'Recuerden subir la evidencia de la base de datos antes de medianoche. La normalización hasta 3FN es obligatoria.',
    likesCount: 12,
    likedByMe: false,
    comments: [
      { id: 'c-1', author: 'Steven', content: '¿Profe, en qué formato entregamos el script?' },
      { id: 'c-2', author: 'Carlos Instructor', content: 'En archivo .sql compilado.' },
    ],
    reports: [],
  },
  {
    id: 'post-2',
    author: 'Laura Castaño',
    authorRole: 'companion',
    groupCode: '2789431',
    category: 'recurso',
    content:
      '¿Alguien tiene apuntes del taller de diagramas de secuencia? Comparto los míos de clases de equivalencia si alguien los quiere.',
    likesCount: 8,
    likedByMe: true,
    comments: [],
    reports: [],
  },
  {
    id: 'post-3',
    author: 'Steven',
    authorRole: 'apprentice',
    groupCode: '2789431',
    category: 'duda',
    content:
      'En el modelo ER, ¿la tabla matricula sería una entidad débil o una relación many-to-many resuelta?',
    likesCount: 3,
    likedByMe: false,
    comments: [],
    reports: [],
  },
];

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Suspensión de actividades presenciales el viernes',
    body: 'El centro cerrará sus instalaciones el 28 de agosto por mantenimiento. Las entregas programadas se reciben únicamente en línea.',
    issuer: 'Dirección Académica',
    audience: { scope: 'institucion' },
    publishedAt: '2026-08-24',
    pinned: true,
  },
  {
    id: 'ann-2',
    title: 'Convocatoria de monitores académicos abierta',
    body: 'Postula tu candidatura para acompañar a los grupos de primer periodo en lógica de programación y matemáticas.',
    issuer: 'Bienestar del Aprendiz',
    audience: { scope: 'institucion' },
    publishedAt: '2026-08-22',
    pinned: false,
  },
  {
    id: 'ann-3',
    title: 'Sesiones de refuerzo de SQL antes del Taller 2',
    body: 'Los jueves de 2 a 4 p. m. en el laboratorio 3. Trae tu modelo entidad-relación avanzado.',
    issuer: 'Coordinación ADSI',
    audience: { scope: 'grupo', groupCode: '2789431' },
    publishedAt: '2026-08-20',
    pinned: false,
  },
];

export const INITIAL_TEACHER_QUESTIONS: TeacherQuestion[] = [
  {
    id: 'tq-1',
    studentName: 'Steven',
    mine: false,
    competency: 'Interacción con bases de datos SQL',
    question:
      '¿Por qué mi consulta con LEFT JOIN devuelve filas duplicadas cuando la uno con la tabla de evidencias?',
    askedAt: '2026-08-19',
    answer:
      'Porque la tabla evidencias tiene varias entregas por aprendiz. Agrega DISTINCT o agrupa por id_aprendiz antes de unir, y verifica que la llave de cruce sea única.',
    answeredBy: 'Gabriel Beltrán',
    answeredAt: '2026-08-19',
  },
  {
    id: 'tq-2',
    studentName: 'Laura Castaño',
    mine: false,
    competency: 'Comunicación técnica en inglés',
    question: '¿El examen de speaking incluye descripción de diagramas o solo conversación libre?',
    askedAt: '2026-08-18',
    answer:
      'Incluye ambos: dos minutos describiendo un diagrama técnico y luego preguntas abiertas sobre tu proyecto integrador.',
    answeredBy: 'Harold Olivero',
    answeredAt: '2026-08-18',
  },
  {
    id: 'tq-3',
    studentName: 'Tú',
    mine: true,
    competency: 'Modelado de datos — 3FN',
    question:
      'Si extraigo instructores a su propia tabla, ¿debo conservar también el historial de cambios de nombre o solo el estado actual?',
    askedAt: '2026-08-23',
    answer: null,
    answeredBy: null,
    answeredAt: null,
  },
];

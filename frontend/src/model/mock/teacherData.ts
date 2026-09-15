import type { AcademicActivityType } from '../activity';
import type { FeedItem } from '../../components/elyron/ActivityFeed';

export interface TeacherGroup {
  id: string;
  code: string;
  name: string;
  program: string;
  learners: number;
  averageProgress: number;
  trend: number;
  nextClass: string;
}

export interface StudentRow {
  id: string;
  name: string;
  progress: number;
}

export interface CourseActivity {
  id: string;
  title: string;
  description: string;
  type: AcademicActivityType;
  competency: string;
  groupId: string;
  groupCode: string;
  dueDate: string;
  submissions: number;
  status: 'Publicada' | 'Programada' | 'Cerrada';
}

export type SubmissionStatus = 'Pendiente' | 'Calificado';

export interface Submission {
  id: string;
  student: string;
  activityTitle: string;
  activityType: AcademicActivityType;
  groupCode: string;
  submittedAt: string;
  version: number;
  late: boolean;
  status: SubmissionStatus;
  grade?: number;
  feedback?: string;
}

export const TEACHER_GROUPS: TeacherGroup[] = [
  {
    id: 'grp-adsi',
    code: 'ADSI-2451310',
    name: 'Desarrollo de Software',
    program: 'Análisis y Desarrollo de Sistemas de Información',
    learners: 28,
    averageProgress: 68,
    trend: 6,
    nextClass: 'Hoy · 10:00 · Ambiente SQL',
  },
  {
    id: 'grp-bd',
    code: 'BD-2489011',
    name: 'Bases de Datos II',
    program: 'Tecnología en Gestión de Datos',
    learners: 24,
    averageProgress: 54,
    trend: -2,
    nextClass: 'Mañana · 08:00 · Virtual',
  },
  {
    id: 'grp-web',
    code: 'WEB-2510044',
    name: 'Programación Web',
    program: 'Desarrollo de Software Multiplataforma',
    learners: 31,
    averageProgress: 41,
    trend: 9,
    nextClass: 'Jueves · 14:00 · Aula 3',
  },
];

export const STUDENTS_BY_GROUP: Record<string, StudentRow[]> = {
  'grp-adsi': [
    { id: 'st-1', name: 'Laura Gómez', progress: 82 },
    { id: 'st-2', name: 'Andrés Rojas', progress: 74 },
    { id: 'st-3', name: 'Valentina Peña', progress: 69 },
    { id: 'st-4', name: 'Juan David Ortiz', progress: 58 },
    { id: 'st-5', name: 'Sara Cifuentes', progress: 91 },
  ],
  'grp-bd': [
    { id: 'st-6', name: 'Mateo Vargas', progress: 61 },
    { id: 'st-7', name: 'Daniela Ospina', progress: 48 },
    { id: 'st-8', name: 'Camilo Torres', progress: 55 },
    { id: 'st-9', name: 'Isabella Rincón', progress: 70 },
  ],
  'grp-web': [
    { id: 'st-10', name: 'Nicolás Quintero', progress: 39 },
    { id: 'st-11', name: 'Mariana Suárez', progress: 52 },
    { id: 'st-12', name: 'Sebastián Lozano', progress: 44 },
  ],
};

export const INITIAL_ACTIVITIES: CourseActivity[] = [
  {
    id: 'act-1',
    title: 'Proyecto Integrador — Frontend React',
    description: 'Construir la interfaz con componentes, hooks y consumo de API.',
    type: 'proyecto',
    competency: 'Desarrollo de software según requisitos',
    groupId: 'grp-adsi',
    groupCode: 'ADSI-2451310',
    dueDate: '2026-08-30',
    submissions: 21,
    status: 'Publicada',
  },
  {
    id: 'act-2',
    title: 'Taller — Consultas SQL con JOIN',
    description: 'Resolver el taller de consultas con agregación y subconsultas.',
    type: 'taller',
    competency: 'Interacción con bases de datos SQL',
    groupId: 'grp-bd',
    groupCode: 'BD-2489011',
    dueDate: '2026-08-27',
    submissions: 18,
    status: 'Publicada',
  },
  {
    id: 'act-3',
    title: 'Quiz — Ciclos y condicionales',
    description: 'Evaluación corta sobre lógica de programación.',
    type: 'quiz',
    competency: 'Pensamiento lógico algorítmico',
    groupId: 'grp-web',
    groupCode: 'WEB-2510044',
    dueDate: '2026-09-02',
    submissions: 0,
    status: 'Programada',
  },
  {
    id: 'act-4',
    title: 'Foro — Normalización 3FN',
    description: 'Debate grupal sobre formas normales con caso real.',
    type: 'foro',
    competency: 'Interacción con bases de datos SQL',
    groupId: 'grp-bd',
    groupCode: 'BD-2489011',
    dueDate: '2026-08-20',
    submissions: 24,
    status: 'Cerrada',
  },
];

export const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    student: 'Laura Gómez',
    activityTitle: 'Proyecto Integrador — Frontend React',
    activityType: 'proyecto',
    groupCode: 'ADSI-2451310',
    submittedAt: 'Hoy · 09:12',
    version: 2,
    late: false,
    status: 'Pendiente',
  },
  {
    id: 'sub-2',
    student: 'Andrés Rojas',
    activityTitle: 'Taller — Consultas SQL con JOIN',
    activityType: 'taller',
    groupCode: 'BD-2489011',
    submittedAt: 'Ayer · 17:40',
    version: 1,
    late: false,
    status: 'Pendiente',
  },
  {
    id: 'sub-3',
    student: 'Mateo Vargas',
    activityTitle: 'Taller — Consultas SQL con JOIN',
    activityType: 'taller',
    groupCode: 'BD-2489011',
    submittedAt: 'Ayer · 22:05',
    version: 3,
    late: true,
    status: 'Pendiente',
  },
  {
    id: 'sub-4',
    student: 'Daniela Ospina',
    activityTitle: 'Proyecto Integrador — Frontend React',
    activityType: 'proyecto',
    groupCode: 'ADSI-2451310',
    submittedAt: 'Lunes · 11:20',
    version: 1,
    late: false,
    status: 'Calificado',
    grade: 4.5,
    feedback: 'Buena estructura de componentes. Refuerza el manejo de estado global.',
  },
  {
    id: 'sub-5',
    student: 'Camilo Torres',
    activityTitle: 'Foro — Normalización 3FN',
    activityType: 'foro',
    groupCode: 'BD-2489011',
    submittedAt: 'Viernes · 16:45',
    version: 1,
    late: false,
    status: 'Pendiente',
  },
  {
    id: 'sub-6',
    student: 'Sara Cifuentes',
    activityTitle: 'Foro — Normalización 3FN',
    activityType: 'foro',
    groupCode: 'BD-2489011',
    submittedAt: 'Viernes · 10:02',
    version: 2,
    late: false,
    status: 'Calificado',
    grade: 5.0,
    feedback: 'Excelente argumentación con el caso de la tabla intermedia.',
  },
];

export const UNANSWERED_QUESTIONS: { id: string; student: string; question: string; time: string }[] = [
  {
    id: 'q-1',
    student: 'Valentina Peña',
    question: '¿Cuándo usar useMemo frente a useEffect en el proyecto?',
    time: 'hace 40 min',
  },
  {
    id: 'q-2',
    student: 'Nicolás Quintero',
    question: 'Mi consulta JOIN duplica filas, ¿revisamos mi modelo?',
    time: 'hace 3 h',
  },
];

export const TEACHER_FEED: FeedItem[] = [
  { id: 't1', type: 'submission', title: 'Nueva entrega: Laura Gómez', meta: 'Proyecto Integrador · v2', time: '09:12', to: '/profesor/calificaciones' },
  { id: 't2', type: 'question', title: 'Pregunta nueva de Valentina Peña', meta: 'useMemo vs useEffect · hace 40 min', time: '08:32', to: '/comunidad' },
  { id: 't3', type: 'notice', title: 'Comunicado publicado a BD-2489011', meta: 'Recordatorio de entrega del taller', time: 'Ayer', to: '/comunidad' },
  { id: 't4', type: 'submission', title: 'Entrega tardía: Mateo Vargas', meta: 'Taller SQL · v3 · fuera de plazo', time: 'Ayer', to: '/profesor/calificaciones' },
  { id: 't5', type: 'grade', title: 'Calificaste a Sara Cifuentes', meta: 'Foro 3FN · Nota 5.0', time: 'Hace 2 días', to: '/profesor/calificaciones' },
  { id: 't6', type: 'task', title: 'Clase de Programación Web', meta: 'Jueves · 14:00 · Aula 3', time: 'Hace 2 días', to: '/calendario' },
];

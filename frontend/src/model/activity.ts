export const ACTIVITY_TYPES = ['tarea', 'proyecto', 'taller', 'quiz', 'examen', 'foro'] as const;

export type AcademicActivityType = (typeof ACTIVITY_TYPES)[number];

export const ACTIVITY_TYPE_LABELS: Record<AcademicActivityType, string> = {
  tarea: 'Tarea',
  proyecto: 'Proyecto',
  taller: 'Taller',
  quiz: 'Quiz',
  examen: 'Examen',
  foro: 'Foro',
};

export const ACTIVITY_TYPE_BADGE: Record<AcademicActivityType, string> = {
  tarea: 'bg-canvas-deep text-ink-600 ring-line-strong',
  proyecto: 'bg-violet-50 text-violet-600 ring-violet-200',
  taller: 'bg-mint-50 text-mint-700 ring-mint-200',
  quiz: 'bg-amber-50 text-amber-700 ring-amber-200',
  examen: 'bg-red-50 text-red-500 ring-red-200',
  foro: 'bg-ink-900 text-white ring-ink-900',
};

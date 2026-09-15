export const SENA_ROLES = {
  ESTUDIANTE: 'estudiante',
  APRENDIZ: 'aprendiz',
  UNIVERSITARIO: 'universitario',
  INSTRUCTOR: 'instructor',
  COORDINADOR: 'coordinador',
  BIENESTAR: 'bienestar_sena',
  ADMINISTRADOR: 'administrador',
} as const;
export type SenaRoleName = (typeof SENA_ROLES)[keyof typeof SENA_ROLES];

export const COLEGIO_ROLES = {
  ESTUDIANTE: 'estudiante',
  DOCENTE: 'docente',
  RECTOR: 'rector',
  COORDINADOR: 'coordinador',
  COORDINADOR_CONVIVENCIA: 'coordinador_convivencia',
  ORIENTADOR: 'orientador',
  ADMINISTRADOR: 'administrador',
} as const;
export type ColegioRoleName =
  (typeof COLEGIO_ROLES)[keyof typeof COLEGIO_ROLES];

export const UNIVERSIDAD_ROLES = {
  UNIVERSITARIO: 'universitario',
  DECANO: 'decano',
  DIRECTOR_PROGRAMA: 'director_programa',
  BIENESTAR_UNIVERSITARIO: 'bienestar_universitario',
  ADMINISTRADOR: 'administrador',
} as const;
export type UniversidadRoleName =
  (typeof UNIVERSIDAD_ROLES)[keyof typeof UNIVERSIDAD_ROLES];

export const ROLES_SEED: {
  name: SenaRoleName | ColegioRoleName | UniversidadRoleName;
  description: string;
}[] = [
  {
    name: SENA_ROLES.ESTUDIANTE,
    description: 'Estudiante general de la plataforma',
  },
  {
    name: SENA_ROLES.APRENDIZ,
    description: 'Aprendiz del programa de formación SENA',
  },
  {
    name: SENA_ROLES.UNIVERSITARIO,
    description: 'Estudiante universitario',
  },
  { name: SENA_ROLES.INSTRUCTOR, description: 'Instructor / formador' },
  { name: SENA_ROLES.COORDINADOR, description: 'Coordinación académica' },
  {
    name: SENA_ROLES.BIENESTAR,
    description:
      'Encargado de Apoyo de Sostenimiento / Bienestar (incluye Psicólogo/a)',
  },
  {
    name: SENA_ROLES.ADMINISTRADOR,
    description: 'Administrador de la plataforma',
  },
  { name: COLEGIO_ROLES.DOCENTE, description: 'Docente de colegio' },
  { name: COLEGIO_ROLES.RECTOR, description: 'Rector / director del colegio' },
  {
    name: COLEGIO_ROLES.COORDINADOR_CONVIVENCIA,
    description: 'Coordinador de convivencia escolar',
  },
  {
    name: COLEGIO_ROLES.ORIENTADOR,
    description: 'Docente orientador / psicoorientador (bienestar escolar)',
  },
  {
    name: UNIVERSIDAD_ROLES.DECANO,
    description: 'Decano de facultad (universidad)',
  },
  {
    name: UNIVERSIDAD_ROLES.DIRECTOR_PROGRAMA,
    description: 'Director de programa académico (universidad)',
  },
  {
    name: UNIVERSIDAD_ROLES.BIENESTAR_UNIVERSITARIO,
    description: 'Bienestar universitario',
  },
];

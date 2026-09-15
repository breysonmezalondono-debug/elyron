import type { InstitutionType } from './institution';

export interface RoleDef {
  id: string;
  key: string;
  label: string;
  labels?: Partial<Record<InstitutionType, string>>;
  rank: number;
}

export const ROLES: RoleDef[] = [
  {
    id: 'role-apprentice',
    key: 'aprendiz',
    label: 'Aprendiz',
    labels: { universidad: 'Estudiante', colegio: 'Estudiante', instituto: 'Participante', academia: 'Alumno' },
    rank: 20,
  },
  {
    id: 'role-estudiante',
    key: 'estudiante',
    label: 'Estudiante',
    labels: { sena: 'Aprendiz', universidad: 'Estudiante', colegio: 'Estudiante' },
    rank: 20,
  },
  {
    id: 'role-universitario',
    key: 'universitario',
    label: 'Estudiante universitario',
    labels: { universidad: 'Estudiante' },
    rank: 20,
  },
  {
    id: 'role-instructor',
    key: 'instructor',
    label: 'Instructor',
    labels: { universidad: 'Profesor', colegio: 'Docente', instituto: 'Docente', academia: 'Profesor' },
    rank: 50,
  },
  {
    id: 'role-docente',
    key: 'docente',
    label: 'Docente',
    labels: { colegio: 'Docente' },
    rank: 50,
  },
  { id: 'role-monitor', key: 'monitor', label: 'Monitor', rank: 40 },
  { id: 'role-orientador', key: 'orientador', label: 'Orientador(a)', rank: 60 },
  {
    id: 'role-convivencia',
    key: 'coordinador_convivencia',
    label: 'Coordinador de Convivencia',
    rank: 75,
  },
  { id: 'role-coordinator', key: 'coordinador', label: 'Coordinador', rank: 70 },
  { id: 'role-rector', key: 'rector', label: 'Rector', rank: 90 },
  { id: 'role-admin', key: 'admin', label: 'Administrador', rank: 100 },
];

export const findRoleByKey = (key?: string | null): RoleDef | undefined =>
  key ? ROLES.find((role) => role.key === key) : undefined;

export const roleLabel = (key?: string | null, type?: InstitutionType): string => {
  const role = findRoleByKey(key);
  if (!role) return key ?? '';
  return (type ? role.labels?.[type] : undefined) ?? role.label;
};

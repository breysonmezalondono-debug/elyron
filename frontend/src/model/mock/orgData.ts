import type { Institution, Membership } from '../institution';

export const INSTITUTIONS: Institution[] = [
  {
    id: 'inst-sena',
    name: 'Servicio Nacional de Aprendizaje',
    shortName: 'SENA',
    type: 'sena',
  },
  {
    id: 'inst-colegio',
    name: 'Colegio Demo Elyron',
    shortName: 'Elyron',
    type: 'colegio',
  },
  {
    id: 'inst-aurora',
    name: 'Corporación Universitaria Aurora',
    shortName: 'Aurora',
    type: 'universidad',
  },
];

export interface DemoLogin {
  label: string;
  email: string;
  password: string;
  roleKey: string;
}

export const DEMO_LOGINS: Record<string, DemoLogin[]> = {
'inst-sena': [
    { label: 'Líder', email: 'vocero@elyron.com', password: 'Test123*', roleKey: 'aprendiz' },
    { label: 'Colíder', email: 'colider@elyron.com', password: 'Test123*', roleKey: 'aprendiz' },
    { label: 'Instructor', email: 'instructor@elyron.com', password: 'Test123*', roleKey: 'instructor' },
    { label: 'Coordinador', email: 'coordinador@elyron.com', password: 'Test123*', roleKey: 'coordinador' },
    { label: 'Bienestar', email: 'bienestar@elyron.com', password: 'Test123*', roleKey: 'coordinador' },
    { label: 'Admin', email: 'breyadmin26@gmail.com', password: 'AdminBrey150926EJE', roleKey: 'admin' },
  ],
  'inst-colegio': [
    { label: 'Estudiante', email: 'estudiante@elyron.com', password: 'Test123*', roleKey: 'estudiante' },
    { label: 'Personera', email: 'personero@elyron.com', password: 'Test123*', roleKey: 'estudiante' },
    { label: 'Docente', email: 'docente@elyron.com', password: 'Test123*', roleKey: 'docente' },
    { label: 'Orientador(a)', email: 'orientador@elyron.com', password: 'Test123*', roleKey: 'orientador' },
    { label: 'Convivencia', email: 'convivencia@elyron.com', password: 'Test123*', roleKey: 'coordinador_convivencia' },
    { label: 'Rector(a)', email: 'rector@elyron.com', password: 'Test123*', roleKey: 'rector' },
  ],
  'inst-aurora': [
    { label: 'Estudiante universitario', email: 'university@prueba.com', password: 'Test123*', roleKey: 'universitario' },
  ],
};

export const CURRENT_MEMBERSHIPS: Membership[] = [
  { institutionId: 'inst-sena', roleKey: 'aprendiz' },
  { institutionId: 'inst-aurora', roleKey: 'aprendiz' },
];

export interface MockAccount {
  email: string;
  name: string;
  memberships: Membership[];
}

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    email: 'ana@elyron.com',
    name: 'Ana Martínez',
    memberships: [
      { institutionId: 'inst-sena', roleKey: 'instructor' },
      { institutionId: 'inst-aurora', roleKey: 'aprendiz' },
    ],
  },
  {
    email: 'breyadmin26@gmail.com',
    name: 'Carolina Pardo',
    memberships: [{ institutionId: 'inst-sena', roleKey: 'admin' }],
  },
  {
    email: 'profesor@elyron.com',
    name: 'Gabriel Beltrán',
    memberships: [{ institutionId: 'inst-sena', roleKey: 'instructor' }],
  },
];

export const findMockAccount = (email?: string | null): MockAccount | undefined =>
  email
    ? MOCK_ACCOUNTS.find((account) => account.email.toLowerCase() === email.toLowerCase())
    : undefined;

export const getInstitution = (id?: string | null): Institution | undefined =>
  id ? INSTITUTIONS.find((institution) => institution.id === id) : undefined;

export interface LearningOutcome {
  id: string;
  name: string;
  done: boolean;
}

export interface Competency {
  id: string;
  name: string;
  weight: number;
  progress: number;
  outcomes: LearningOutcome[];
}

export type GroupStatus = 'Activa' | 'Finalizada';

export interface AcademicGroup {
  id: string;
  code: string;
  name: string;
  startDate: string;
  endDate: string;
  status: GroupStatus;
  competencies: Competency[];
}

export interface Program {
  id: string;
  name: string;
  institutionId: string;
  groupLabel: string;
  groups: AcademicGroup[];
  instructorCount: number;
  apprenticeCount: number;
}

export const ACADEMIC_GROUPS: AcademicGroup[] = [
  {
    id: 'grp-adsi',
    code: 'ADSI-2451310',
    name: 'Desarrollo de Software',
    startDate: '2025-02-01',
    endDate: '2026-11-30',
    status: 'Activa',
    competencies: [
      {
        id: 'comp-1',
        name: 'Desarrollo de software según requisitos',
        weight: 40,
        progress: 68,
        outcomes: [
          { id: 'res-1', name: 'Diseñar la base de datos relacional', done: true },
          { id: 'res-2', name: 'Construir la interfaz de usuario con React', done: false },
          { id: 'res-3', name: 'Documentar el análisis del sistema', done: false },
        ],
      },
      {
        id: 'comp-2',
        name: 'Interacción con bases de datos SQL',
        weight: 30,
        progress: 85,
        outcomes: [
          { id: 'res-4', name: 'Modelar entidades normalizadas (3FN)', done: true },
          { id: 'res-5', name: 'Consultas JOIN y agregación', done: true },
        ],
      },
    ],
  },
  {
    id: 'grp-adsi-2',
    code: 'ADSI-2789431',
    name: 'Desarrollo de Software',
    startDate: '2026-01-15',
    endDate: '2027-07-30',
    status: 'Activa',
    competencies: [
      {
        id: 'comp-4',
        name: 'Programación orientada a objetos',
        weight: 50,
        progress: 45,
        outcomes: [
          { id: 'res-8', name: 'Diseñar clases y herencia', done: true },
          { id: 'res-9', name: 'Implementar patrones de diseño', done: false },
        ],
      },
    ],
  },
  {
    id: 'grp-adsi-old',
    code: 'ADSI-2345678',
    name: 'Desarrollo de Software',
    startDate: '2024-01-10',
    endDate: '2025-06-30',
    status: 'Finalizada',
    competencies: [
      {
        id: 'comp-5',
        name: 'Desarrollo de software según requisitos',
        weight: 100,
        progress: 100,
        outcomes: [
          { id: 'res-10', name: 'Proyecto integrador final', done: true },
        ],
      },
    ],
  },
  {
    id: 'grp-redes',
    code: 'RDTS-2567890',
    name: 'Redes de Datos',
    startDate: '2026-02-01',
    endDate: '2027-08-30',
    status: 'Activa',
    competencies: [
      {
        id: 'comp-6',
        name: 'Instalación y mantenimiento de redes',
        weight: 60,
        progress: 35,
        outcomes: [
          { id: 'res-11', name: 'Configurar routers y switches', done: true },
          { id: 'res-12', name: 'Implementar VLANs', done: false },
        ],
      },
    ],
  },
  {
    id: 'grp-ing',
    code: 'ING-B12',
    name: 'Inglés Técnico · Nivel II',
    startDate: '2026-03-15',
    endDate: '2026-10-20',
    status: 'Activa',
    competencies: [
      {
        id: 'comp-3',
        name: 'Comunicación técnica en inglés',
        weight: 100,
        progress: 42,
        outcomes: [
          { id: 'res-6', name: 'Presentar demostraciones orales', done: true },
          { id: 'res-7', name: 'Redactar documentación técnica', done: false },
        ],
      },
    ],
  },
  {
    id: 'grp-adsi-3',
    code: 'ADSI-2912345',
    name: 'Desarrollo de Software',
    startDate: '2026-07-01',
    endDate: '2028-01-30',
    status: 'Activa',
    competencies: [
      {
        id: 'comp-7',
        name: 'Fundamentos de programación',
        weight: 60,
        progress: 15,
        outcomes: [
          { id: 'res-13', name: 'Variables y tipos de datos', done: true },
          { id: 'res-14', name: 'Estructuras de control', done: false },
        ],
      },
    ],
  },
];

export const PROGRAMS: Program[] = [
  {
    id: 'prog-adsi',
    name: 'Análisis y Desarrollo de Software',
    institutionId: 'inst-sena',
    groupLabel: 'Ficha',
    groups: ACADEMIC_GROUPS.filter((g) => g.code.startsWith('ADSI')),
    instructorCount: 5,
    apprenticeCount: 128,
  },
  {
    id: 'prog-redes',
    name: 'Redes de Datos',
    institutionId: 'inst-sena',
    groupLabel: 'Ficha',
    groups: ACADEMIC_GROUPS.filter((g) => g.code.startsWith('RDTS')),
    instructorCount: 2,
    apprenticeCount: 38,
  },
  {
    id: 'prog-ing',
    name: 'Inglés Técnico',
    institutionId: 'inst-aurora',
    groupLabel: 'Grupo',
    groups: ACADEMIC_GROUPS.filter((g) => g.code.startsWith('ING')),
    instructorCount: 1,
    apprenticeCount: 24,
  },
];

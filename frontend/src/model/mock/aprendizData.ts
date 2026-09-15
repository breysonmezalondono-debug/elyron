import type { AprendizEvidencia } from '../../services/aprendizService';

export const MOCK_APRENDIZ_NIVEL = {
  level: 7,
  xp: 2840,
  nextLevelXp: 3200,
} as const;

export const MOCK_APRENDIZ_EVIDENCIAS: AprendizEvidencia[] = [
  {
    id: 'ev-001',
    title: 'GAES: Levantamiento de requerimientos',
    status: 'approved',
    submittedById: 'aprendiz-mock',
  },
  {
    id: 'ev-002',
    title: 'Modelo entidad-relación de la base de datos',
    status: 'approved',
    submittedById: 'aprendiz-mock',
  },
  {
    id: 'ev-003',
    title: 'Normalización hasta 3FN',
    status: 'approved',
    submittedById: 'aprendiz-mock',
  },
  {
    id: 'ev-004',
    title: 'Diagrama de casos de uso',
    status: 'approved',
    submittedById: 'aprendiz-mock',
  },
  {
    id: 'ev-005',
    title: 'Consulta SQL: joins y agregación',
    status: 'approved',
    submittedById: 'aprendiz-mock',
  },
  {
    id: 'ev-006',
    title: 'Prototipo de interfaz de la aplicación',
    status: 'approved',
    submittedById: 'aprendiz-mock',
  },
  {
    id: 'ev-007',
    title: 'Documentación del proyecto integrador',
    status: 'pending',
    submittedById: 'aprendiz-mock',
  },
  {
    id: 'ev-008',
    title: 'Actividad: triggers y stored procedures',
    status: 'rejected',
    submittedById: 'aprendiz-mock',
  },
];
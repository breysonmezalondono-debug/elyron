export interface Offer {
  id: string;
  title: string;
  companyId: string;
  location: string;
  salary: string;
  expiresAt: string;
  description: string;
}

export const OFFERS: Offer[] = [
  {
    id: 'of-1',
    title: 'Desarrollador Junior React & Node',
    companyId: 'emp-1',
    location: 'Remoto / Híbrido',
    salary: '$2.800.000 COP',
    expiresAt: '2026-09-15',
    description:
      'Buscamos aprendiz egresado con conocimientos sólidos en React y manejo de APIs REST.',
  },
  {
    id: 'of-2',
    title: 'Analista de Bases de Datos SQL',
    companyId: 'emp-2',
    location: 'Medellín',
    salary: '$3.200.000 COP',
    expiresAt: '2026-09-30',
    description:
      'Apoyo en el modelado, optimización de consultas INNER JOIN y mantenimiento de MySQL.',
  },
  {
    id: 'of-3',
    title: 'Pasantía QA & Testing',
    companyId: 'emp-3',
    location: 'Bogotá · Presencial',
    salary: '$1.500.000 COP',
    expiresAt: '2026-10-05',
    description:
      'Diseño de casos de prueba funcionales y automatización básica con Playwright.',
  },
];

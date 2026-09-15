import type { MiFicha } from '../../services/aprendizService';

/**
 * Ficha SENA de demostración usada por el modo mock (VITE_USE_MOCK_AUTH=true).
 * Las identidades de aprendices usan el correo como `id` para coincidir con el
 * campo `sub` (email) del JWT que emite createMockToken en authService.
 */
export const MOCK_FICHA_SENA: MiFicha = {
  id: 'fic-2451310',
  code: '2451310',
  name: 'Análisis y Operación de Mercados',
  tipoPrograma: 'tecnologo',
  status: 'active',
  startDate: '2026-01-20',
  endDate: '2027-06-30',
  instructores: [
    {
      instructor: {
        id: 'ins-rios',
        firstName: 'María Fernanda',
        lastName: 'Ríos',
        email: 'mariafernanda.rios@sena.edu.co',
      },
    },
    {
      instructor: {
        id: 'ins-prada',
        firstName: 'Jorge Andrés',
        lastName: 'Prada',
        email: 'jorgeandres.prada@sena.edu.co',
      },
    },
  ],
  aprendices: [
    {
      id: 'camila.torres@elyron.com',
      firstName: 'Camila',
      lastName: 'Torres',
      email: 'camila.torres@elyron.com',
    },
    {
      id: 'aprendiz@elyron.com',
      firstName: 'Laura',
      lastName: 'Gómez',
      email: 'aprendiz@elyron.com',
    },
    {
      id: 'colider@elyron.com',
      firstName: 'Mateo',
      lastName: 'Vargas',
      email: 'colider@elyron.com',
      esVoceroSuplente: true,
    },
    {
      id: 'andres.rojas@elyron.com',
      firstName: 'Andrés',
      lastName: 'Rojas',
      email: 'andres.rojas@elyron.com',
    },
    {
      id: 'mateo.vargas@elyron.com',
      firstName: 'Mateo',
      lastName: 'Vargas',
      email: 'mateo.vargas@elyron.com',
    },
    {
      id: 'vocero@elyron.com',
      firstName: 'Valentina',
      lastName: 'Lozano',
      email: 'vocero@elyron.com',
      esVocero: true,
    },
    {
      id: 'daniela.ruiz@elyron.com',
      firstName: 'Daniela',
      lastName: 'Ruiz',
      email: 'daniela.ruiz@elyron.com',
    },
  ],
};

export const learnerRowInMockFicha = (
  email: string | null | undefined,
): MiFicha['aprendices'][number] | null => {
  if (!email) return null;
  return (
    MOCK_FICHA_SENA.aprendices.find(
      (learner) => learner.id === email || learner.email === email,
    ) ?? null
  );
};

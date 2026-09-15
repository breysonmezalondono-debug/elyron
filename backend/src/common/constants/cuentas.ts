/* ============================================================
   CUENTAS INSTITUCIONALES · Elyron
   Reglas de creación de cuentas de personal y de la puerta de
   ingreso institucional.

   Principio: las cuentas de aprendiz/estudiante/universitario se
   crean solas en el registro público. Las cuentas de personal
   (instructor, docente, coordinador, etc.) SOLO las crea un
   administrador o un coordinador desde el panel.
   ============================================================ */

/** Roles que entran por el registro/login público. */
export const ROLES_APRENDIENTE = [
  'aprendiz',
  'estudiante',
  'universitario',
] as const;

/** Institución a la que pertenece cada rol. */
export const INSTITUCION_POR_ROL: Record<string, string> = {
  aprendiz: 'sena',
  instructor: 'sena',
  coordinador: 'sena',
  bienestar_sena: 'sena',
  administrador: 'sena',

  estudiante: 'colegio',
  docente: 'colegio',
  rector: 'colegio',
  orientador: 'colegio',
  coordinador_convivencia: 'colegio',

  universitario: 'universidad',
  decano: 'universidad',
  director_programa: 'universidad',
  bienestar_universitario: 'universidad',
};

/**
 * Roles que un coordinador (o cargo equivalente) puede crear según
 * su propia institución. El administrador puede crear cualquier rol.
 * Ningún cargo puede crear administrador ni coordinador/rector.
 */
export const ROLES_CREABLES_POR_CARGO: Record<string, string[]> = {
  sena: ['instructor', 'bienestar_sena'],
  colegio: ['docente', 'orientador', 'coordinador_convivencia'],
  universidad: ['docente'],
};

/** Cargos que tienen la facultad de crear cuentas de personal. */
export const CARGOS_QUE_CREAN_CUENTAS = [
  'administrador',
  'coordinador',
  'director_programa',
  'decano',
] as const;

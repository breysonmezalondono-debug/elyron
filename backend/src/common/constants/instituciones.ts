export const INSTITUCIONES = {
  SENA: 'sena',
  COLEGIO: 'colegio',
  UNIVERSIDAD: 'universidad',
} as const;
export type InstitucionName =
  (typeof INSTITUCIONES)[keyof typeof INSTITUCIONES];

export const INSTITUCIONES_LIST: InstitucionName[] = [
  INSTITUCIONES.SENA,
  INSTITUCIONES.COLEGIO,
  INSTITUCIONES.UNIVERSIDAD,
];

export const SENA_PANEL_ROLES = [
  'coordinador',
  'bienestar_sena',
  'administrador',
];
export const COLEGIO_PANEL_ROLES = [
  'rector',
  'coordinador',
  'coordinador_convivencia',
  'orientador',
  'administrador',
];
export const UNIVERSIDAD_PANEL_ROLES = [
  'decano',
  'director_programa',
  'bienestar_universitario',
  'administrador',
];

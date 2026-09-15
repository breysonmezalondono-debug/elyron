export type InstitutionType =
  | 'sena'
  | 'colegio'
  | 'universidad'
  | 'instituto'
  | 'academia'
  | 'otro';

export interface Institution {
  id: string;
  name: string;
  shortName: string;
  type: InstitutionType;
}

export interface Membership {
  institutionId: string;
  roleKey: string;
}

export interface TerminologyMap {
  group: string;
  program: string;
  competency: string;
  outcome: string;
  instructor: string;
  apprentice: string;
  period: string;
}

export const TERMINOLOGY_BY_TYPE: Record<InstitutionType, TerminologyMap> = {
  sena: {
    group: 'Ficha',
    program: 'Programa',
    competency: 'Competencia',
    outcome: 'Resultado de aprendizaje',
    instructor: 'Instructor',
    apprentice: 'Aprendiz',
    period: 'Periodo',
  },
  colegio: {
    group: 'Grupo',
    program: 'Plan de estudios',
    competency: 'Competencia',
    outcome: 'Resultado de aprendizaje',
    instructor: 'Docente',
    apprentice: 'Estudiante',
    period: 'Periodo',
  },
  universidad: {
    group: 'Grupo',
    program: 'Carrera',
    competency: 'Asignatura',
    outcome: 'Objetivo de aprendizaje',
    instructor: 'Profesor',
    apprentice: 'Estudiante',
    period: 'Semestre',
  },
  instituto: {
    group: 'Cohorte',
    program: 'Programa',
    competency: 'Módulo',
    outcome: 'Resultado',
    instructor: 'Docente',
    apprentice: 'Participante',
    period: 'Ciclo',
  },
  academia: {
    group: 'Clase',
    program: 'Diplomado',
    competency: 'Unidad',
    outcome: 'Meta',
    instructor: 'Profesor',
    apprentice: 'Alumno',
    period: 'Nivel',
  },
  otro: {
    group: 'Grupo',
    program: 'Programa',
    competency: 'Competencia',
    outcome: 'Resultado',
    instructor: 'Formador',
    apprentice: 'Estudiante',
    period: 'Periodo',
  },
};

export const terminologyFor = (type: InstitutionType): TerminologyMap =>
  TERMINOLOGY_BY_TYPE[type] ?? TERMINOLOGY_BY_TYPE.otro;

export const pluralize = (word: string): string =>
  word.length === 0 || word.endsWith('s') ? word : `${word}s`;

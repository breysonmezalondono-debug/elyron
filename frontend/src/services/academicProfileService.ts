import { educoreClient } from '../api';
import { EDUCORE_ROUTES, USE_MOCK } from './config';

/* ============================================================
   PERFIL ACADÉMICO · Elyron
   Crea/consulta el perfil académico según el tipo de estudiante.
   En modo mock devuelve una respuesta simulada para que el
   wizard de registro funcione sin backend.
   ============================================================ */

export type TipoPerfil = 'sena' | 'colegio' | 'universidad';

export interface PerfilAcademicoRespuesta {
  id?: string;
  tipo?: TipoPerfil;
  estadoElyron?: string;
  finalizacionEstimada?: string;
  confianza?: string;
  numeroDocumento?: string;
  semestresRestantes?: number;
  [key: string]: unknown;
}

export interface CrearPerfilSenaPayload {
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  tipoFormacion: 'tecnico' | 'tecnologo';
  programaFormacion: string;
  numeroFicha: string;
  centroFormacion: string;
  regional?: string;
  ciudad?: string;
  modalidad?: string;
  jornada?: string;
  estadoAcademico?: string;
  etapa?: string;
  esLider?: boolean;
  esColider?: boolean;
}

export interface CrearPerfilUniversidadPayload {
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  universidad: string;
  programaAcademico: string;
  facultad?: string;
  nivelAcademico: string;
  anioIngreso: number;
  periodoIngreso: number;
  jornada?: string;
  modalidad?: string;
  creditosPrograma?: number;
  creditosAprobados?: number;
  semestre: number;
  totalSemestres?: number;
  estadoAcademico?: string;
}

export interface CrearPerfilColegioPayload {
  tipoDocumento: string;
  numeroDocumento: string;
  nombres: string;
  apellidos: string;
  telefono?: string;
  colegio: string;
  grado: number;
  jornada: string;
  anioAcademico: number;
  ciudad?: string;
  estadoAcademico?: string;
}

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const mockRespuesta = (
  tipo: TipoPerfil,
  payload: Record<string, unknown>,
  extras?: Record<string, unknown>,
): PerfilAcademicoRespuesta => ({
  id: `mock-${tipo}-${Date.now()}`,
  tipo,
  estadoElyron: 'en_formacion',
  finalizacionEstimada:
    tipo === 'colegio'
      ? `30/11/${(payload.anioAcademico as number) ?? 2026}`
      : '26/08/2027',
  confianza: 'declarada',
  numeroDocumento: payload.numeroDocumento as string,
  ...extras,
});

export const academicProfileService = {
  async crearSena(payload: CrearPerfilSenaPayload): Promise<PerfilAcademicoRespuesta> {
    if (USE_MOCK) {
      await delay(500);
      const resp = mockRespuesta('sena', payload as unknown as Record<string, unknown>);
      return resp;
    }
    const res = await educoreClient.post<PerfilAcademicoRespuesta>(
      EDUCORE_ROUTES.perfil.crearSena,
      payload,
    );
    return res.data;
  },

  async crearUniversidad(payload: CrearPerfilUniversidadPayload): Promise<PerfilAcademicoRespuesta> {
    if (USE_MOCK) {
      await delay(500);
      const restantes = Math.max(
        (payload.totalSemestres ?? 10) - payload.semestre,
        0,
      );
      return mockRespuesta('universidad', payload as unknown as Record<string, unknown>, {
        semestresRestantes: restantes,
      });
    }
    const res = await educoreClient.post<PerfilAcademicoRespuesta>(
      EDUCORE_ROUTES.perfil.crearUniversidad,
      payload,
    );
    return res.data;
  },

  async crearColegio(payload: CrearPerfilColegioPayload): Promise<PerfilAcademicoRespuesta> {
    if (USE_MOCK) {
      await delay(500);
      return mockRespuesta('colegio', payload as unknown as Record<string, unknown>);
    }
    const res = await educoreClient.post<PerfilAcademicoRespuesta>(
      EDUCORE_ROUTES.perfil.crearColegio,
      payload,
    );
    return res.data;
  },
};

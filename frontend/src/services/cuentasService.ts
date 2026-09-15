import { educoreClient } from '../api';
import { USE_MOCK } from './config';

/* ============================================================
   CUENTAS · Elyron
   Creación de cuentas de personal desde el panel (admin /
   coordinador). En modo mock simula la operación.
   ============================================================ */

export interface TituloAcademicoPayload {
  titulo: string;
  institucion: string;
  tipo?: string;
}

export interface EducacionComplementariaPayload {
  nombre: string;
  tipo?: string;
  intensidadHoraria?: string;
}

export interface ExperienciaLaboralPayload {
  empresa: string;
  cargo: string;
  funciones?: string;
  fechaInicio?: string;
  fechaFin?: string;
}

export interface CrearCuentaPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  roleKey: string;
  institucion?: string;
  phone?: string;
  tipoDocumento: string;
  numeroDocumento: string;
  direccion?: string;
  titulosAcademicos?: TituloAcademicoPayload[];
  educacionComplementaria?: EducacionComplementariaPayload[];
  experienciaLaboral?: ExperienciaLaboralPayload[];
}

export interface CuentaCreada {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: { name?: string } | string;
  institucion?: string;
  message?: string;
}

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const cuentasService = {
  async crear(payload: CrearCuentaPayload): Promise<CuentaCreada> {
    if (USE_MOCK) {
      await delay(500);
      return {
        id: `mock-cuenta-${Date.now()}`,
        email: payload.email,
        firstName: payload.firstName,
        lastName: payload.lastName,
        role: { name: payload.roleKey },
        institucion: payload.institucion,
        message: 'Cuenta creada (demo)',
      };
    }
    const res = await educoreClient.post<CuentaCreada>('/users/cuenta', payload);
    return res.data;
  },
};
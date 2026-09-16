import { educoreClient } from '../api';
import { USE_MOCK } from './config';

/* ============================================================
   ADMIN · Instituciones, fichas y estudiantes
   Gestión de instituciones del catálogo y consulta de fichas
   con sus aprendices desde el panel de administración.
   ============================================================ */

export interface InstitucionCatalogo {
  id: string;
  nombre: string;
  tipo: 'colegio' | 'universidad' | 'sena';
  detalles?: {
    regional?: string;
    centros?: string[];
    municipios?: string[];
  } | null;
  status: 'active' | 'inactive';
  createdAt?: string;
}

export interface CrearInstitucionPayload {
  nombre: string;
  tipo: 'colegio' | 'universidad' | 'sena';
  detalles?: {
    regional?: string;
    centros?: string[];
    municipios?: string[];
  };
}

export interface FichaAdmin {
  id: string;
  code: string;
  name: string;
  tipoPrograma?: string;
  status: string;
  startDate?: string;
  endDate?: string;
  programa?: { name?: string } | null;
}

export interface EstudianteFicha {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  esVocero?: boolean;
  esVoceroSuplente?: boolean;
  phone?: string;
}

export interface FichaConEstudiantes extends FichaAdmin {
  estudiantes?: EstudianteFicha[];
}

/** Usuario real devuelto por GET /api/users (para el panel de administración). */
export interface UsuarioAdminApi {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  avatar?: string | null;
  isActive: boolean;
  institucion?: string;
  createdAt?: string;
  role?: { name?: string } | string | null;
}

const delay = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const adminService = {
  /* ---- Usuarios (panel de administración) ---- */
  async listarUsuarios(): Promise<UsuarioAdminApi[]> {
    if (USE_MOCK) {
      await delay(300);
      return [];
    }
    const res = await educoreClient.get<{ data: UsuarioAdminApi[]; total: number }>(
      '/users?limit=100',
    );
    return res.data.data ?? [];
  },

  /* ---- Instituciones ---- */
  async listarInstituciones(): Promise<InstitucionCatalogo[]> {
    if (USE_MOCK) {
      await delay(300);
      return [];
    }
    const res = await educoreClient.get<InstitucionCatalogo[]>(
      '/admin/instituciones',
    );
    return res.data;
  },
  async crearInstitucion(
    payload: CrearInstitucionPayload,
  ): Promise<InstitucionCatalogo> {
    if (USE_MOCK) {
      await delay(300);
      return { ...payload, id: `mock-${Date.now()}`, status: 'active' };
    }
    const res = await educoreClient.post<InstitucionCatalogo>(
      '/admin/instituciones',
      payload,
    );
    return res.data;
  },
  async eliminarInstitucion(id: string): Promise<void> {
    if (USE_MOCK) return;
    await educoreClient.delete(`/admin/instituciones/${id}`);
  },

  /* ---- Fichas y estudiantes ---- */
  async listarFichas(): Promise<FichaAdmin[]> {
    if (USE_MOCK) {
      await delay(300);
      return [];
    }
    const res = await educoreClient.get<{ data: FichaAdmin[]; total: number }>(
      '/fichas?limit=100',
    );
    return res.data.data ?? [];
  },
  async listarEstudiantesDeFicha(
    fichaId: string,
  ): Promise<EstudianteFicha[]> {
    if (USE_MOCK) {
      await delay(300);
      return [];
    }
    const res = await educoreClient.get<EstudianteFicha[]>(
      `/sena/ficha/${fichaId}/aprendices`,
    );
    return res.data;
  },
};

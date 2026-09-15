import { educoreClient } from '../api';
import {
  ELIR_PLANS,
  ELIR_PLANS_ORDER,
  type PlanId,
  type ElirPlan,
  type ElirLimits,
  type ElirLimitErrorCode,
  ELIR_LIMIT_ERRORS,
} from '../model/plans';
import { ELIR_ROUTES, EDUCORE_SERVICE_URL, joinUrl } from './config';

/* ============================================================
   SERVICIO DE PLANES, USO Y DOCUMENTOS DE ELIR · Elyron
   Consulta el plan y el uso del usuario autenticado al backend
   (/api/elir/planes y /api/elir/uso). El backend es la autoridad
   en límites; el frontend solo presenta el estado. Si el backend
   no responde, cae a una estimación local segura (plan free) sin
   romper la conversación.
   ============================================================ */

export interface UsoElirFront {
  plan: PlanId;
  mensajes: number;
  archivos: number;
  imagenes: number;
  tareasAvanzadas: number;
  limites: ElirLimits;
}

export interface ElirErrorInfo {
  code?: ElirLimitErrorCode;
  message?: string;
  httpStatus?: number;
}

export interface ElirDocumentoFront {
  id: string;
  name: string;
  size: number;
  kind: 'file' | 'image';
  status?: string;
  createdAt?: string;
}

const USO_LOCAL_KEY = 'elyron.elir.uso';

/** Normaliza un error del backend a un objeto estructurado. */
export const parseElirError = (err: unknown): ElirErrorInfo => {
  const anyErr = err as {
    response?: { status?: number; data?: { message?: string | string[]; code?: string } };
    message?: string;
  };
  const httpStatus = anyErr?.response?.status;
  const msgRaw = anyErr?.response?.data?.message;
  const dataCode = anyErr?.response?.data?.code;
  const message = Array.isArray(msgRaw) ? msgRaw[0] : msgRaw ?? anyErr?.message;
  // Código estructurado explícito del backend.
  if (dataCode && (dataCode as string) in ELIR_LIMIT_ERRORS) {
    return { code: dataCode as ElirLimitErrorCode, message, httpStatus };
  }
  // Detecta códigos estructurados dentro del mensaje.
  for (const code of Object.values(ELIR_LIMIT_ERRORS)) {
    if (message?.toUpperCase().includes(code) || message?.includes(code)) {
      return { code: code as ElirLimitErrorCode, message, httpStatus };
    }
  }
  // Mapeo por status
  if (httpStatus === 429 || httpStatus === 403) {
    return { code: 'LIMIT_REACHED', message: 'Has alcanzado un límite de tu plan.', httpStatus };
  }
  return { code: undefined, message, httpStatus };
};

/** Lee el plan por defecto (free) con un objeto seguro. */
export const planPorDefecto = (): ElirPlan => ELIR_PLANS.free;

export const planesDisponibles = (): ElirPlan[] => ELIR_PLANS_ORDER.map((id) => ELIR_PLANS[id]);

/** Uso local por si el backend no está disponible (no es la autoridad). */
const usoLocal = (): { fecha: string; mensajes: number; archivos: number; imagenes: number } => {
  try {
    const raw = localStorage.getItem(USO_LOCAL_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const hoy = new Date().toISOString().slice(0, 10);
      if (parsed.fecha === hoy) {
        return {
          fecha: parsed.fecha,
          mensajes: parsed.mensajes ?? 0,
          archivos: parsed.archivos ?? 0,
          imagenes: parsed.imagenes ?? 0,
        };
      }
    }
  } catch {
    /* ignora */
  }
  return { fecha: new Date().toISOString().slice(0, 10), mensajes: 0, archivos: 0, imagenes: 0 };
};

export const registrarUsoLocal = (tipo: 'message' | 'file' | 'image') => {
  try {
    const u = usoLocal();
    if (tipo === 'message') u.mensajes += 1;
    if (tipo === 'file') u.archivos += 1;
    if (tipo === 'image') u.imagenes += 1;
    localStorage.setItem(USO_LOCAL_KEY, JSON.stringify(u));
  } catch {
    /* ignora */
  }
};

export const elirPlanService = {
  /** Estado de uso del usuario autenticado. */
  async estadoDeUso(): Promise<UsoElirFront | null> {
    try {
      const res = await educoreClient.get<UsoElirFront>(ELIR_ROUTES.uso);
      return res.data;
    } catch {
      // Fallback local seguro (nunca rompe la conversación)
      const plan = planPorDefecto();
      const u = usoLocal();
      return {
        plan: plan.id,
        mensajes: u.mensajes,
        archivos: u.archivos,
        imagenes: u.imagenes,
        tareasAvanzadas: 0,
        limites: plan.limits,
      };
    }
  },

  /** Catálogo de planes desde el backend (fallback a config local). */
  async planes(): Promise<ElirPlan[]> {
    try {
      const res = await educoreClient.get<ElirPlan[]>(ELIR_ROUTES.planes);
      if (res.data && res.data.length) return res.data;
    } catch {
      /* ignora */
    }
    return planesDisponibles();
  },

  /** Sube un documento/imagen real al backend (ownership y límites validados). */
  async subirDocumento(file: File, program: string | null): Promise<ElirDocumentoFront> {
    const form = new FormData();
    form.append('file', file, file.name);
    if (program) form.append('program', program);
    // axios fija el Content-Type multipart con el boundary automáticamente.
    const res = await educoreClient.post<ElirDocumentoFront>(ELIR_ROUTES.documentos, form);
    return res.data;
  },

  /** Lista los documentos del usuario autenticado. */
  async misDocumentos(): Promise<ElirDocumentoFront[]> {
    try {
      const res = await educoreClient.get<ElirDocumentoFront[]>(ELIR_ROUTES.documentos);
      return Array.isArray(res.data) ? res.data : [];
    } catch {
      return [];
    }
  },

  /** Genera un cuestionario real de estudio con la IA del backend. */
  async generarQuiz(topic: string, documentIds?: string[]): Promise<import('../model/elir').ElirQuiz> {
    const res = await educoreClient.post<{
      quiz: import('../model/elir').ElirQuiz;
    }>(ELIR_ROUTES.generar, { topic, documentIds });
    return res.data.quiz;
  },

  /** Elimina un documento propio. */
  async borrarDocumento(id: string): Promise<void> {
    await educoreClient.delete(`${ELIR_ROUTES.documentos}/${id}`);
  },

  /** URL del streaming de Elir en el backend (SSE), para fetch directo. */
  chatStreamUrl(): string {
    return joinUrl(EDUCORE_SERVICE_URL, ELIR_ROUTES.chatStream);
  },
};

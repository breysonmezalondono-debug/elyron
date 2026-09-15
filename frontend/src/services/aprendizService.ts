import { educoreClient, getToken } from '../api';
import { perfilService } from './perfilService';
import { EDUCORE_ROUTES, USE_MOCK } from './config';
import type { PerfilSena } from './perfilService';
import { MOCK_FICHA_SENA } from '../model/mock/fichaData';
import { MOCK_APRENDIZ_EVIDENCIAS } from '../model/mock/aprendizData';

export interface AprendizCompetencia {
  id: string;
  name: string;
  description?: string;
  weight?: number;
}

export interface AprendizResultado {
  id: string;
  name: string;
  description?: string;
}

export interface AprendizEvidencia {
  id: string;
  title: string;
  description?: string;
  status: 'pending' | 'approved' | 'rejected';
  feedback?: string;
  submittedById: string;
  reviewedAt?: string;
}

export interface AprendizEvento {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type?: string;
  color?: string;
}

export interface AprendizOferta {
  id: string;
  title: string;
  description: string;
  company?: string;
  location?: string;
  salary?: string;
  requirements?: string[];
  expiresAt?: string;
}

export interface AprendizConvocatoria {
  id: string;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  status: string;
  requirements?: string[];
}

export interface MiFicha {
  id: string;
  code: string;
  name: string;
  tipoPrograma?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
  instructores: Array<{ instructor: { id: string; firstName: string; lastName: string; email: string } }>;
  aprendices: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    esVocero?: boolean;
    esVoceroSuplente?: boolean;
  }>;
}

export interface DashboardData {
  perfil: PerfilSena | null;
  ficha: MiFicha | null;
  competencias: AprendizCompetencia[];
  resultadosPorCompetencia: Record<string, AprendizResultado[]>;
  evidencias: AprendizEvidencia[];
  proximosEventos: AprendizEvento[];
  ofertas: AprendizOferta[];
  convocatorias: AprendizConvocatoria[];
  notificacionesNoLeidas: number;
}

const fallback = (): DashboardData => ({
  perfil: null,
  ficha: null,
  competencias: [],
  resultadosPorCompetencia: {},
  evidencias: [],
  proximosEventos: [],
  ofertas: [],
  convocatorias: [],
  notificacionesNoLeidas: 0,
});

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const isoDias = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

const MOCK_CONVOCATORIAS: AprendizConvocatoria[] = [
  {
    id: 'conv-1',
    title: 'Apoyo de sostenimiento · Segundo semestre',
    description:
      'Postúlate al apoyo económico para aprendices en estado activo. Revisa requisitos y fechas.',
    startDate: isoDias(-5),
    endDate: isoDias(12),
    status: 'abierta',
    requirements: [
      'Estar matriculado y en estado activo',
      'Documentos al día en Sofía Plus',
    ],
  },
  {
    id: 'conv-2',
    title: 'Semillero de investigación en desarrollo de software',
    description:
      'Cupos para aprender investigación aplicada con instructores del centro.',
    startDate: isoDias(-1),
    endDate: isoDias(20),
    status: 'abierta',
    requirements: ['Promedio acumulado ≥ 3.8', 'Disponibilidad de 4 horas semanales'],
  },
];

const MOCK_OFERTAS: AprendizOferta[] = [
  {
    id: 'ofi-1',
    title: 'Desarrollador(a) Frontend Junior',
    description: 'Vacante para etapa productiva con posibilidad de vinculación.',
    company: 'Tecnología Andina',
    location: 'Bogotá · Híbrido',
    salary: '2.2 SMMLV',
    expiresAt: isoDias(18),
  },
  {
    id: 'ofi-2',
    title: 'Analista de datos en formación',
    description: 'Práctica empresarial en equipo de inteligencia de negocio.',
    company: 'DataSmart Colombia',
    location: 'Remoto',
    expiresAt: isoDias(25),
  },
];

const MOCK_EVENTOS: AprendizEvento[] = [
  {
    id: 'ev-2026-1',
    title: 'Charla: rutas en ciberseguridad',
    description: 'Encuentro con egresados del centro para conocer rutas de especialización.',
    startDate: isoDias(3),
    endDate: isoDias(3),
    type: 'charla',
    color: '#1b3a2b',
  },
  {
    id: 'ev-2026-2',
    title: 'Feria empresarial de vinculación',
    description: 'Empresas aliadas ofrecen vacantes de práctica y empleo.',
    startDate: isoDias(9),
    endDate: isoDias(10),
    type: 'feria',
    color: '#1b3a2b',
  },
];

const parseUserId = (): string | null => {
  const token = getToken();
  if (!token) return null;
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(decodeURIComponent(escape(atob(payload))));
    return decoded.sub || decoded.id || decoded.userId || null;
  } catch {
    return null;
  }
};

export const aprendizService = {
  async cargaDashboard(): Promise<DashboardData> {
    if (USE_MOCK) {
      await delay(400);
      return {
        ...fallback(),
        perfil: await perfilService.miPerfil(),
        ficha: await this.miFicha(),
        evidencias: MOCK_APRENDIZ_EVIDENCIAS,
        convocatorias: MOCK_CONVOCATORIAS,
        ofertas: MOCK_OFERTAS,
        proximosEventos: MOCK_EVENTOS,
        notificacionesNoLeidas: 3,
      };
    }
    const data = fallback();
    const [perfil, ficha] = await Promise.all([
      perfilService.miPerfil().catch(() => null),
      this.miFicha(),
    ]);
    data.perfil = perfil;
    data.ficha = ficha;

    if (ficha) {
      data.competencias = await this.competenciasDeFicha(ficha.id);
      const porCompetencia: Record<string, AprendizResultado[]> = {};
      await Promise.all(
        data.competencias.map(async (competencia) => {
          porCompetencia[competencia.id] = await this.resultadosDeCompetencia(competencia.id);
        }),
      );
      data.resultadosPorCompetencia = porCompetencia;
      data.proximosEventos = await this.proximosEventos(8);
    }

    const [, , , , ] = await Promise.all([
      this.evidenciasDelUsuario().then((e) => (data.evidencias = e)),
      this.ofertas().then((o) => (data.ofertas = o)),
      this.convocatorias().then((c) => (data.convocatorias = c)),
      this.notificacionesNoLeidas().then((n) => (data.notificacionesNoLeidas = n)),
    ]);

    return data;
  },

  async miFicha(): Promise<MiFicha | null> {
    if (USE_MOCK) {
      await delay(300);
      return MOCK_FICHA_SENA;
    }
    try {
      const res = await educoreClient.get<MiFicha>(EDUCORE_ROUTES.ficha.miFicha);
      return res.data && res.data.id ? res.data : null;
    } catch {
      return null;
    }
  },

  async competenciasDeFicha(fichaId: string): Promise<AprendizCompetencia[]> {
    try {
      const res = await educoreClient.get<AprendizCompetencia[]>(EDUCORE_ROUTES.competencias.deFicha(fichaId));
      return res.data ?? [];
    } catch {
      return [];
    }
  },

  async resultadosDeCompetencia(competenciaId: string): Promise<AprendizResultado[]> {
    try {
      const res = await educoreClient.get<AprendizResultado[]>(EDUCORE_ROUTES.resultados.deCompetencia(competenciaId));
      return res.data ?? [];
    } catch {
      return [];
    }
  },

  async evidenciasDelUsuario(): Promise<AprendizEvidencia[]> {
    try {
      const userId = parseUserId();
      const res = await educoreClient.get<{ data: AprendizEvidencia[]; total: number }>(
        EDUCORE_ROUTES.evidencias.listar(),
      );
      const todas = res.data?.data ?? [];
      if (!userId) return todas;
      return todas.filter((e) => e.submittedById === userId);
    } catch {
      return [];
    }
  },

  async proximosEventos(limit = 8): Promise<AprendizEvento[]> {
    if (USE_MOCK) {
      await delay(300);
      return MOCK_EVENTOS.filter((e) => new Date(e.startDate).getTime() >= Date.now()).slice(0, limit);
    }
    try {
      const res = await educoreClient.get<AprendizEvento[] | { data: AprendizEvento[]; total: number }>(
        EDUCORE_ROUTES.calendario.proximos(limit),
      );
      const data = res.data as any;
      const eventos: AprendizEvento[] = Array.isArray(data)
        ? data
        : (data?.data ?? []);
      const ahora = new Date().getTime();
      return eventos
        .filter((e) => new Date(e.startDate).getTime() >= ahora - 86400000)
        .sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime())
        .slice(0, limit);
    } catch {
      return [];
    }
  },

  async ofertas(): Promise<AprendizOferta[]> {
    if (USE_MOCK) {
      await delay(300);
      return MOCK_OFERTAS;
    }
    try {
      const res = await educoreClient.get<{ data: AprendizOferta[]; total: number }>(EDUCORE_ROUTES.ofertas.listar());
      return res.data?.data ?? [];
    } catch {
      return [];
    }
  },

  async convocatorias(): Promise<AprendizConvocatoria[]> {
    if (USE_MOCK) {
      await delay(300);
      return MOCK_CONVOCATORIAS;
    }
    try {
      const res = await educoreClient.get<{ data: AprendizConvocatoria[]; total: number }>(EDUCORE_ROUTES.convocatorias.listar());
      return res.data?.data ?? [];
    } catch {
      return [];
    }
  },

  async notificacionesNoLeidas(): Promise<number> {
    if (USE_MOCK) {
      await delay(200);
      return 3;
    }
    try {
      const res = await educoreClient.get<number>(EDUCORE_ROUTES.notificaciones.noLeidas);
      return typeof res.data === 'number' ? res.data : 0;
    } catch {
      return 0;
    }
  },
};

import { useEffect, useState } from 'react';
import type { AcademicActivityType } from './activity';
import { ACTIVITY_TYPES } from './activity';
import type { EvidenceFileType } from './mock/evidenceData';
import { getToken } from '../api';

export type TrabajoEstado = 'publicada' | 'programada' | 'cerrada';

export type EntregaEstado = 'assigned' | 'pending' | 'rejected' | 'approved';

export interface TrabajoSalon {
  id: string;
  claseId: string;
  title: string;
  description: string;
  resultado: string;
  type: AcademicActivityType;
  fechaLimite: string;
  estado: TrabajoEstado;
}

export interface ClaseSalon {
  id: string;
  name: string;
  instructor: string;
  banner: string;
  ficha: string;
}

export interface VersionEntrega {
  version: string;
  date: string;
}

export interface EntregaSalon {
  id: string;
  trabajoId: string;
  userId: string;
  aprendiz: string;
  estado: EntregaEstado;
  versiones: VersionEntrega[];
  fileType: EvidenceFileType;
  nota?: number;
  feedback?: string;
  late: boolean;
}

export interface SalonData {
  clases: ClaseSalon[];
  trabajos: TrabajoSalon[];
  entregas: EntregaSalon[];
}

const STORAGE_KEY = 'elyron.salon.v2';

const isoDias = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const seed = (): SalonData => ({
  clases: [
    {
      id: 'cla-1',
      name: 'Desarrollo de software según requisitos',
      instructor: 'María Fernanda Ríos',
      banner: 'bg-violet-600',
      ficha: 'Ficha 2451310',
    },
    {
      id: 'cla-2',
      name: 'Interacción con bases de datos SQL',
      instructor: 'Jorge Andrés Prada',
      banner: 'bg-sky-600',
      ficha: 'Ficha 2489011',
    },
    {
      id: 'cla-3',
      name: 'Programación orientada a objetos',
      instructor: 'Paola Andrea Gómez',
      banner: 'bg-amber-500',
      ficha: 'Ficha 2510044',
    },
  ],
  trabajos: [
    {
      id: 'evi-1',
      claseId: 'cla-1',
      title: 'Taller 1 · Modelo entidad relación',
      description: 'Modelar el diagrama entidad-relación y normalizar hasta tercera forma normal.',
      resultado: 'Diseñar la base de datos relacional a partir del análisis del sistema',
      type: 'taller',
      fechaLimite: isoDias(-7),
      estado: 'publicada',
    },
    {
      id: 'evi-2',
      claseId: 'cla-1',
      title: 'Taller 2 · Normalización 3FN',
      description: 'Aplicar reglas de normalización y documentar dependencias funcionales.',
      resultado: 'Diseñar la base de datos relacional a partir del análisis del sistema',
      type: 'taller',
      fechaLimite: isoDias(-3),
      estado: 'publicada',
    },
    {
      id: 'evi-p1',
      claseId: 'cla-1',
      title: 'Proyecto · Interfaz de usuario en React',
      description: 'Construir la interfaz de usuario con componentes reutilizables y autenticación.',
      resultado: 'Construir la interfaz de usuario con framework de desarrollo',
      type: 'proyecto',
      fechaLimite: isoDias(-1),
      estado: 'publicada',
    },
    {
      id: 'evi-s1',
      claseId: 'cla-1',
      title: 'Taller 3 · Consultas SQL con JOIN',
      description: 'Resolver el taller de consultas con agregación y subconsultas.',
      resultado: 'Ejecutar consultas de agregación y JOIN',
      type: 'taller',
      fechaLimite: isoDias(3),
      estado: 'publicada',
    },
    {
      id: 'evi-3',
      claseId: 'cla-2',
      title: 'Taller 4 · Agregación y JOIN',
      description: 'Ejercicios progresivos de consultas con JOIN y GROUP BY.',
      resultado: 'Ejecutar consultas de agregación y JOIN',
      type: 'taller',
      fechaLimite: isoDias(4),
      estado: 'publicada',
    },
    {
      id: 'evi-e1',
      claseId: 'cla-2',
      title: 'Examen · Entidades normalizadas',
      description: 'Evaluación escrita sobre entidades normalizadas hasta 3FN.',
      resultado: 'Modelar entidades normalizadas hasta tercera forma normal',
      type: 'examen',
      fechaLimite: isoDias(9),
      estado: 'publicada',
    },
    {
      id: 'evi-p2',
      claseId: 'cla-3',
      title: 'Proyecto · Clases y herencia',
      description: 'Modelar clases con herencia, encapsulamiento y polimorfismo.',
      resultado: 'Diseñar clases y relaciones con herencia',
      type: 'proyecto',
      fechaLimite: isoDias(6),
      estado: 'publicada',
    },
    {
      id: 'evi-q1',
      claseId: 'cla-3',
      title: 'Quiz · Patrones de diseño',
      description: 'Evaluación corta sobre patrones singleton y factory.',
      resultado: 'Implementar patrones de diseño básicos',
      type: 'quiz',
      fechaLimite: isoDias(12),
      estado: 'publicada',
    },
  ],
  entregas: [
    {
      id: 'ent-1',
      trabajoId: 'evi-1',
      userId: 'camila.torres@elyron.com',
      aprendiz: 'Camila Torres',
      estado: 'approved',
      versiones: [{ version: 'v1', date: isoDias(-9) }],
      fileType: 'pdf',
      nota: 4.8,
      feedback: 'Excelente modelado de llaves foráneas y cardinalidad. Cumple tercera forma normal.',
      late: false,
    },
    {
      id: 'ent-2',
      trabajoId: 'evi-2',
      userId: 'camila.torres@elyron.com',
      aprendiz: 'Camila Torres',
      estado: 'approved',
      versiones: [{ version: 'v1', date: isoDias(-4) }],
      fileType: 'pdf',
      nota: 4.5,
      feedback: 'Correcto. Documentación de dependencias funcionales muy completa.',
      late: false,
    },
    {
      id: 'ent-3',
      trabajoId: 'evi-p1',
      userId: 'camila.torres@elyron.com',
      aprendiz: 'Camila Torres',
      estado: 'rejected',
      versiones: [
        { version: 'v1', date: isoDias(-2) },
        { version: 'v2', date: isoDias(-1) },
      ],
      fileType: 'pdf',
      feedback:
        'Te falta implementar el módulo de autenticación y login con persistencia. Revisa la rúbrica y vuelve a entregar.',
      late: true,
    },
    {
      id: 'ent-4',
      trabajoId: 'evi-3',
      userId: 'camila.torres@elyron.com',
      aprendiz: 'Camila Torres',
      estado: 'pending',
      versiones: [{ version: 'v1', date: isoDias(0) }],
      fileType: 'sql',
      late: false,
    },
    {
      id: 'ent-5',
      trabajoId: 'evi-p1',
      userId: 'aprendiz@elyron.com',
      aprendiz: 'Laura Gómez',
      estado: 'pending',
      versiones: [
        { version: 'v1', date: isoDias(-1) },
        { version: 'v2', date: isoDias(0) },
      ],
      fileType: 'pdf',
      late: false,
    },
    {
      id: 'ent-6',
      trabajoId: 'evi-s1',
      userId: 'aprendiz@elyron.com',
      aprendiz: 'Laura Gómez',
      estado: 'approved',
      versiones: [{ version: 'v1', date: isoDias(-2) }],
      fileType: 'sql',
      nota: 4.7,
      feedback: 'Consultas documentadas y optimizadas. Buen uso de índices.',
      late: false,
    },
    {
      id: 'ent-7',
      trabajoId: 'evi-3',
      userId: 'andres.rojas@elyron.com',
      aprendiz: 'Andrés Rojas',
      estado: 'pending',
      versiones: [{ version: 'v1', date: isoDias(-1) }],
      fileType: 'sql',
      late: false,
    },
    {
      id: 'ent-8',
      trabajoId: 'evi-3',
      userId: 'mateo.vargas@elyron.com',
      aprendiz: 'Mateo Vargas',
      estado: 'pending',
      versiones: [{ version: 'v1', date: isoDias(-2) }],
      fileType: 'sql',
      late: true,
    },
  ],
});

const parseUser = (): { id: string; name: string } => {
  try {
    const token = getToken() || '';
    const payload = JSON.parse(decodeURIComponent(escape(atob(token.split('.')[1]))));
    return {
      id: String(payload.sub ?? 'guest'),
      name: payload.name ?? 'Camila Torres',
    };
  } catch {
    return { id: 'guest', name: 'Camila Torres' };
  }
};

const ifWindow = <T,>(fn: () => T): T | null => {
  try {
    return typeof window === 'undefined' ? null : fn();
  } catch {
    return null;
  }
};

let cache: SalonData | null = null;

const load = (): SalonData => {
  if (cache) return cache;
  const raw = ifWindow(() => localStorage.getItem(STORAGE_KEY));
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as SalonData;
      if (parsed && Array.isArray(parsed.clases) && Array.isArray(parsed.trabajos) && Array.isArray(parsed.entregas)) {
        cache = parsed;
        return parsed;
      }
    } catch {
    }
  }
  cache = seed();
  ifWindow(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(cache!)));
  return cache!;
};

const save = (data: SalonData): void => {
  cache = data;
  ifWindow(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)));
};

const clonar = (data: SalonData): SalonData => ({
  clases: data.clases,
  trabajos: data.trabajos,
  entregas: data.entregas,
});

export const useSalon = () => {
  const [data, setData] = useState<SalonData>(() => load());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setData(load());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const commit = (next: SalonData) => {
    save(next);
    setData(next);
  };

  const crearTrabajo = (trabajo: Omit<TrabajoSalon, 'id' | 'estado'>) => {
    const nuevo: TrabajoSalon = {
      ...trabajo,
      id: `act-${Date.now()}`,
      estado: 'publicada',
    };
    if (typeof ACTIVITY_TYPES.includes !== 'function' || !ACTIVITY_TYPES.includes(nuevo.type)) {
      nuevo.type = 'tarea';
    }
    const next = clonar(load());
    next.trabajos = [nuevo, ...next.trabajos];
    commit(next);
  };

  const entregar = (trabajoId: string) => {
    const user = parseUser();
    const next = clonar(load());
    const trabajo = next.trabajos.find((t) => t.id === trabajoId);
    if (!trabajo) return;
    const fecha = new Date().toISOString().slice(0, 10);
    const pendiente = next.entregas.find(
      (e) => e.trabajoId === trabajoId && e.userId === user.id,
    );
    if (pendiente) {
      pendiente.estado = 'pending';
      pendiente.versiones = [
        ...pendiente.versiones,
        { version: `v${pendiente.versiones.length + 1}`, date: fecha },
      ];
      pendiente.late = fecha > trabajo.fechaLimite;
    } else {
      next.entregas.push({
        id: `ent-${Date.now()}`,
        trabajoId,
        userId: user.id,
        aprendiz: user.name,
        estado: 'pending',
        versiones: [{ version: 'v1', date: fecha }],
        fileType: 'pdf',
        late: fecha > trabajo.fechaLimite,
      });
    }
    commit(next);
  };

  const deshacerEntrega = (trabajoId: string) => {
    const user = parseUser();
    const next = clonar(load());
    const entrega = next.entregas.find(
      (e) => e.trabajoId === trabajoId && e.userId === user.id,
    );
    if (!entrega) return;
    entrega.estado = 'assigned';
    commit(next);
  };

  const aprobarEntrega = (entregaId: string, nota: number, feedback?: string) => {
    const next = clonar(load());
    const entrega = next.entregas.find((e) => e.id === entregaId);
    if (!entrega) return;
    entrega.estado = 'approved';
    entrega.nota = nota;
    entrega.feedback = feedback?.trim() ? feedback.trim() : entrega.feedback;
    commit(next);
  };

  const devolverEntrega = (entregaId: string, feedback?: string) => {
    const next = clonar(load());
    const entrega = next.entregas.find((e) => e.id === entregaId);
    if (!entrega) return;
    entrega.estado = 'rejected';
    entrega.nota = undefined;
    entrega.feedback = feedback?.trim() ? feedback.trim() : entrega.feedback;
    commit(next);
  };

  return {
    ...data,
    crearTrabajo,
    entregar,
    deshacerEntrega,
    aprobarEntrega,
    devolverEntrega,
    usuario: parseUser(),
  };
};
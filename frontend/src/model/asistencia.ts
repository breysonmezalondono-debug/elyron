import { useEffect, useState } from 'react';
import { getToken } from '../api';

export type AsistenciaEstado = 'asistio' | 'permiso' | 'no_vino';

export interface AprendizAsistencia {
  id: string;
  nombre: string;
  rol?: 'vocera' | 'instructor' | 'regular';
}

export interface GrupoAsistencia {
  id: string;
  ficha: string;
  nombre: string;
  aprendices: AprendizAsistencia[];
}

export interface RegistroAsistencia {
  fecha: string;
  aprendizId: string;
  estado: AsistenciaEstado;
}

export interface AsistenciaData {
  grupos: GrupoAsistencia[];
  registros: RegistroAsistencia[];
}

export const ASISTENCIA_META: Record<
  AsistenciaEstado,
  { label: string; corto: string; dot: string; chip: string; celda: string }
> = {
  asistio: {
    label: 'Asistió',
    corto: 'Asistió',
    dot: 'bg-mint-500',
    chip: 'bg-mint-50 text-mint-700 ring-mint-200',
    celda: 'bg-mint-100 text-mint-800 ring-mint-300',
  },
  permiso: {
    label: 'Permiso',
    corto: 'Permiso',
    dot: 'bg-[#ff9e80]',
    chip: 'bg-[#ffe8df] text-[#b4552d] ring-[#ffc0a8]',
    celda: 'bg-[#ffe8df] text-[#b4552d] ring-[#ffc0a8]',
  },
  no_vino: {
    label: 'No vino',
    corto: 'No vino',
    dot: 'bg-red-500',
    chip: 'bg-red-50 text-red-600 ring-red-200',
    celda: 'bg-red-100 text-red-700 ring-red-300',
  },
};

const STORAGE_KEY = 'elyron.asistencia.v2';

const isoDias = (n: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const FICHA_PRINCIPAL: GrupoAsistencia = {
  id: 'g-2451310',
  ficha: '2451310',
  nombre: 'Desarrollo de software según requisitos',
  aprendices: [
    { id: 'camila.torres@elyron.com', nombre: 'Camila Torres', rol: 'regular' },
    { id: 'aprendiz@elyron.com', nombre: 'Laura Gómez', rol: 'regular' },
    { id: 'andres.rojas@elyron.com', nombre: 'Andrés Rojas', rol: 'regular' },
    { id: 'mateo.vargas@elyron.com', nombre: 'Mateo Vargas', rol: 'regular' },
    { id: 'vocero@elyron.com', nombre: 'Valentina Lozano', rol: 'vocera' },
  ],
};

const FICHA_SQL: GrupoAsistencia = {
  id: 'g-2489011',
  ficha: '2489011',
  nombre: 'Interacción con bases de datos SQL',
  aprendices: [
    { id: 'sara.ospina@elyron.com', nombre: 'Sara Ospina', rol: 'regular' },
    { id: 'daniela.ruiz@elyron.com', nombre: 'Daniela Ruiz', rol: 'regular' },
    { id: 'camila.torres@elyron.com', nombre: 'Camila Torres', rol: 'regular' },
    { id: 'aprendiz@elyron.com', nombre: 'Laura Gómez', rol: 'regular' },
  ],
};

const FICHA_POO: GrupoAsistencia = {
  id: 'g-2510044',
  ficha: '2510044',
  nombre: 'Programación orientada a objetos',
  aprendices: [
    { id: 'julian.restrepo@elyron.com', nombre: 'Julián Restrepo', rol: 'regular' },
    { id: 'valeria.naranjo@elyron.com', nombre: 'Valeria Naranjo', rol: 'regular' },
    { id: 'andres.rojas@elyron.com', nombre: 'Andrés Rojas', rol: 'regular' },
    { id: 'mateo.vargas@elyron.com', nombre: 'Mateo Vargas', rol: 'regular' },
  ],
};

const seed = (): AsistenciaData => {
  const r = (dia: number, rows: Array<[string, AsistenciaEstado]>) =>
    rows.map(([aprendizId, estado]) => ({
      fecha: isoDias(dia),
      aprendizId,
      estado,
    }));

  return {
    grupos: [FICHA_PRINCIPAL, FICHA_SQL, FICHA_POO],
    registros: [
      ...r(-6, [
        ['camila.torres@elyron.com', 'asistio'],
        ['aprendiz@elyron.com', 'asistio'],
        ['andres.rojas@elyron.com', 'permiso'],
        ['mateo.vargas@elyron.com', 'asistio'],
        ['vocero@elyron.com', 'asistio'],
      ]),
      ...r(-4, [
        ['camila.torres@elyron.com', 'asistio'],
        ['aprendiz@elyron.com', 'permiso'],
        ['andres.rojas@elyron.com', 'no_vino'],
        ['mateo.vargas@elyron.com', 'asistio'],
        ['vocero@elyron.com', 'asistio'],
      ]),
      ...r(-3, [
        ['camila.torres@elyron.com', 'no_vino'],
        ['aprendiz@elyron.com', 'asistio'],
        ['andres.rojas@elyron.com', 'asistio'],
        ['mateo.vargas@elyron.com', 'asistio'],
        ['vocero@elyron.com', 'permiso'],
      ]),
      ...r(-2, [
        ['camila.torres@elyron.com', 'asistio'],
        ['aprendiz@elyron.com', 'asistio'],
        ['andres.rojas@elyron.com', 'no_vino'],
        ['mateo.vargas@elyron.com', 'permiso'],
        ['vocero@elyron.com', 'asistio'],
      ]),
      ...r(-1, [
        ['camila.torres@elyron.com', 'asistio'],
        ['aprendiz@elyron.com', 'permiso'],
        ['andres.rojas@elyron.com', 'no_vino'],
        ['mateo.vargas@elyron.com', 'asistio'],
        ['vocero@elyron.com', 'asistio'],
      ]),
      ...r(0, [
        ['camila.torres@elyron.com', 'asistio'],
        ['aprendiz@elyron.com', 'no_vino'],
        ['andres.rojas@elyron.com', 'asistio'],
        ['mateo.vargas@elyron.com', 'permiso'],
        ['vocero@elyron.com', 'asistio'],
      ]),
      ...r(-5, [
        ['sara.ospina@elyron.com', 'asistio'],
        ['daniela.ruiz@elyron.com', 'permiso'],
        ['camila.torres@elyron.com', 'asistio'],
        ['aprendiz@elyron.com', 'asistio'],
      ]),
      ...r(-2, [
        ['julian.restrepo@elyron.com', 'no_vino'],
        ['valeria.naranjo@elyron.com', 'asistio'],
        ['andres.rojas@elyron.com', 'asistio'],
        ['mateo.vargas@elyron.com', 'permiso'],
      ]),
    ],
  };
};

export const currentUserId = (): string => {
  try {
    const token = getToken() || '';
    const payload = JSON.parse(decodeURIComponent(escape(atob(token.split('.')[1]))));
    return String(payload.sub ?? 'guest');
  } catch {
    return 'guest';
  }
};

const ifWindow = <T,>(fn: () => T): T | null => {
  try {
    return typeof window === 'undefined' ? null : fn();
  } catch {
    return null;
  }
};

let cache: AsistenciaData | null = null;

const load = (): AsistenciaData => {
  if (cache) return cache;
  const raw = ifWindow(() => localStorage.getItem(STORAGE_KEY));
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as AsistenciaData;
      if (parsed && Array.isArray(parsed.grupos) && Array.isArray(parsed.registros)) {
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

const save = (data: AsistenciaData): void => {
  cache = data;
  ifWindow(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(data)));
};

export const useAsistencia = () => {
  const [data, setData] = useState<AsistenciaData>(() => load());

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key !== STORAGE_KEY) return;
      setData(load());
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  const commit = (next: AsistenciaData) => {
    save(next);
    setData(next);
    ifWindow(() => {
      window.dispatchEvent(new Event('elyron:asistencia'));
    });
  };

  const marcar = (fecha: string, aprendizId: string, estado: AsistenciaEstado) => {
    const resto = data.registros.filter((r) => !(r.fecha === fecha && r.aprendizId === aprendizId));
    const nuevo: RegistroAsistencia = { fecha, aprendizId, estado };
    commit({ grupos: data.grupos, registros: [...resto, nuevo] });
  };

  const limpiar = (fecha: string, aprendizId: string) => {
    const registros = data.registros.filter(
      (r) => !(r.fecha === fecha && r.aprendizId === aprendizId),
    );
    commit({ grupos: data.grupos, registros });
  };

  return {
    ...data,
    marcar,
    limpiar,
    registroDe: (fecha: string, aprendizId: string): AsistenciaEstado | null =>
      data.registros.find((r) => r.fecha === fecha && r.aprendizId === aprendizId)?.estado ?? null,
    registrosDe: (aprendizId: string): RegistroAsistencia[] =>
      data.registros.filter((r) => r.aprendizId === aprendizId),
  };
};
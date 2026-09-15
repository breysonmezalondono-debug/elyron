import { educoreClient as api, getToken } from '../api';
import { EDUCORE_ROUTES, USE_MOCK } from './config';
import { learnerRowInMockFicha } from '../model/mock/fichaData';

export interface Solicitud {
  id: string;
  titulo: string;
  descripcion?: string;
  tipo: string;
  estado: 'abierta' | 'en_proceso' | 'resuelta';
  createdAt?: string;
}

export interface Comunicado {
  id: string;
  titulo: string;
  contenido: string;
  prioridad: 'alta' | 'media' | 'baja';
  destinatario: string;
  autorId: string;
  fichaId?: string;
  autor?: { firstName: string; lastName: string; email: string };
  createdAt?: string;
}

export interface RecursoBiblioteca {
  id: string;
  titulo: string;
  tipo: string;
  autor?: string;
  descripcion?: string;
  estado: string;
  prestadoAId?: string;
  fechaDevolucion?: string;
}

export interface DocumentoPersonal {
  id: string;
  titulo: string;
  tipo: string;
  descripcion?: string;
  url?: string;
  fechaEmision?: string;
  createdAt?: string;
}

export interface Apoyo {
  id: string;
  estado: string;
  chatActivo: boolean;
  motivo?: string;
  createdAt?: string;
}

export interface Representacion {
  esVocero: boolean;
  esVoceroSuplente: boolean;
  esPersonero: boolean;
  esPersoneroSuplente: boolean;
}

export interface FichaAnuncio {
  id: string;
  titulo: string;
  contenido: string;
  prioridad: 'alta' | 'media' | 'baja';
  categoria: 'anuncio' | 'actividad' | 'convocatoria' | 'acta';
  autorId: string;
  fichaId?: string;
  autor?: { firstName: string; lastName: string; email: string };
  createdAt?: string;
}

export interface Inquietud {
  id: string;
  titulo: string;
  descripcion: string;
  estado: 'abierta' | 'en_gestion' | 'resuelta';
  categoria: 'academica' | 'bienestar' | 'instalaciones' | 'general';
  autorId: string;
  fichaId?: string;
  autor?: { firstName: string; lastName: string; email: string };
  createdAt?: string;
}

/* ============================================================
   MODO MOCK (VITE_USE_MOCK_AUTH=true)
   Datos demo en memoria para que los flujos SENA funcionen sin
   backend. Las mutaciones se aplican sobre arrays de módulo, así
   sobreviven a la navegación dentro de la sesión.
   ============================================================ */

const FICHA_DEMO_ID = 'fic-2451310';
const FICHA_DEMO_CODE = 'Ficha 2451310';

const delay = (ms = 320): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const nuevoId = (prefijo: string): string => `${prefijo}-${Date.now()}`;

const isoDias = (offset: number): string => {
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return d.toISOString().slice(0, 10);
};

const leerSesion = (): { email: string; nombre: string } => {
  let email = '';
  let nombre = '';
  try {
    const token = getToken() || '';
    if (!token) return { email: '', nombre: '' };
    const payload = JSON.parse(decodeURIComponent(escape(atob(token.split('.')[1]))));
    email = String(payload.sub ?? '');
    nombre = typeof payload.name === 'string' && payload.name ? payload.name : '';
  } catch {
    // token ilegible: sesión anónima
  }
  if (!nombre) {
    const row = learnerRowInMockFicha(email);
    if (row) nombre = `${row.firstName} ${row.lastName}`;
    else nombre = email.split('@')[0] || 'Usuario';
  }
  return { email, nombre };
};

const dividirNombre = (
  nombre: string,
): { firstName: string; lastName: string } => {
  const partes = nombre.trim().split(/\s+/);
  const firstName = partes[0] || 'Usuario';
  const lastName = partes.slice(1).join(' ') || firstName;
  return { firstName, lastName };
};

const esPrioridadValida = (p: string | undefined): p is 'alta' | 'media' | 'baja' =>
  p === 'alta' || p === 'media' || p === 'baja';

const esCategoriaAnuncioValida = (
  c: string | undefined,
): c is FichaAnuncio['categoria'] =>
  c === 'anuncio' || c === 'actividad' || c === 'convocatoria' || c === 'acta';

const esCategoriaInquietudValida = (
  c: string | undefined,
): c is Inquietud['categoria'] =>
  c === 'academica' || c === 'bienestar' || c === 'instalaciones' || c === 'general';

const mockSolicitudes: Solicitud[] = [
  {
    id: 'sol-1',
    titulo: 'Certificado de notas del periodo',
    descripcion: 'Necesito el certificado para una convocatoria de bienestar.',
    tipo: 'academico',
    estado: 'en_proceso',
    createdAt: isoDias(-6),
  },
  {
    id: 'sol-2',
    titulo: 'Actualización de datos de contacto',
    tipo: 'institucional',
    estado: 'abierta',
    createdAt: isoDias(-2),
  },
];

const mockComunicados: Comunicado[] = [
  {
    id: 'com-1',
    titulo: 'Cambio de aula para el taller de SQL',
    contenido:
      'El taller de consultas SQL del viernes se realizará en el laboratorio 204. Lleguen 10 minutos antes.',
    prioridad: 'media',
    destinatario: FICHA_DEMO_CODE,
    autorId: 'vocero@elyron.com',
    fichaId: FICHA_DEMO_ID,
    autor: {
      firstName: 'Valentina',
      lastName: 'Lozano',
      email: 'vocero@elyron.com',
    },
    createdAt: isoDias(-1),
  },
  {
    id: 'com-2',
    titulo: 'Jornada de aseo y organización del ambiente',
    contenido:
      'El próximo lunes haremos la jornada de aseo programada por el centro. La asistencia cuenta para la ficha.',
    prioridad: 'baja',
    destinatario: FICHA_DEMO_CODE,
    autorId: 'vocero@elyron.com',
    fichaId: FICHA_DEMO_ID,
    autor: {
      firstName: 'Valentina',
      lastName: 'Lozano',
      email: 'vocero@elyron.com',
    },
    createdAt: isoDias(-3),
  },
];

const mockCatalogo: RecursoBiblioteca[] = [
  {
    id: 'bib-1',
    titulo: 'Clean Code',
    tipo: 'libro',
    autor: 'Robert C. Martin',
    descripcion: 'Manual de prácticas para escribir código legible y mantenible.',
    estado: 'disponible',
  },
  {
    id: 'bib-2',
    titulo: 'Aprendiendo SQL',
    tipo: 'libro',
    autor: 'Alan Beaulieu',
    descripcion: 'Consultas, JOIN y modelado para principiantes.',
    estado: 'disponible',
  },
  {
    id: 'bib-3',
    titulo: 'Curso: fundamentos de bases de datos',
    tipo: 'recurso_digital',
    descripcion: 'Acceso al aula virtual con videos y ejercicios guiados.',
    estado: 'disponible',
  },
  {
    id: 'bib-4',
    titulo: 'Introducción a la programación con Python',
    tipo: 'libro',
    autor: 'Allen Downey',
    descripcion: 'Primeros pasos con Python orientados a la lógica de programación.',
    estado: 'prestado',
    prestadoAId: 'aprendiz@elyron.com',
    fechaDevolucion: isoDias(14),
  },
];

const mockDocumentos: DocumentoPersonal[] = [
  {
    id: 'doc-1',
    titulo: 'Certificado de formación complementaria',
    tipo: 'certificacion',
    descripcion: 'Curso de habilidades socioemocionales (20 horas).',
    url: '#',
    fechaEmision: isoDias(-40),
    createdAt: isoDias(-40),
  },
  {
    id: 'doc-2',
    titulo: 'Reglamento del aprendiz',
    tipo: 'institucional',
    descripcion: 'Documento oficial del centro de formación.',
    url: '#',
    createdAt: isoDias(-120),
  },
];

const mockApoyo: Apoyo[] = [
  {
    id: 'apo-1',
    estado: 'en_revision',
    chatActivo: false,
    motivo:
      'Solicitud recibida. Bienestar del centro está validando los documentos adjuntos.',
    createdAt: isoDias(-4),
  },
];

const mockAnuncios: FichaAnuncio[] = [
  {
    id: 'anu-1',
    titulo: 'Reunión general de ficha',
    contenido:
      'Confirmaremos horarios de etapa productiva y próximas entregas. Traigan sus dudas.',
    prioridad: 'alta',
    categoria: 'actividad',
    autorId: 'vocero@elyron.com',
    fichaId: FICHA_DEMO_ID,
    autor: {
      firstName: 'Valentina',
      lastName: 'Lozano',
      email: 'vocero@elyron.com',
    },
    createdAt: isoDias(0),
  },
  {
    id: 'anu-2',
    titulo: 'Recordatorio: encuesta de bienestar',
    contenido:
      'La encuesta cierra esta semana. Es anónima y ayuda a mejorar los servicios del centro.',
    prioridad: 'media',
    categoria: 'convocatoria',
    autorId: 'vocero@elyron.com',
    fichaId: FICHA_DEMO_ID,
    autor: {
      firstName: 'Valentina',
      lastName: 'Lozano',
      email: 'vocero@elyron.com',
    },
    createdAt: isoDias(-1),
  },
];

const mockInquietudes: Inquietud[] = [
  {
    id: 'inq-1',
    titulo: 'Luces del laboratorio 204',
    descripcion:
      'Dos lámparas están dañadas y dificultan ver el tablero en las últimas filas.',
    estado: 'abierta',
    categoria: 'instalaciones',
    autorId: 'camila.torres@elyron.com',
    fichaId: FICHA_DEMO_ID,
    autor: {
      firstName: 'Camila',
      lastName: 'Torres',
      email: 'camila.torres@elyron.com',
    },
    createdAt: isoDias(-2),
  },
  {
    id: 'inq-2',
    titulo: 'Dudas sobre la guía de aprendizaje 3',
    descripcion:
      'Varios compañeros no encontramos el anexo de la rúbrica de la guía 3 en la plataforma.',
    estado: 'en_gestion',
    categoria: 'academica',
    autorId: 'andres.rojas@elyron.com',
    fichaId: FICHA_DEMO_ID,
    autor: {
      firstName: 'Andrés',
      lastName: 'Rojas',
      email: 'andres.rojas@elyron.com',
    },
    createdAt: isoDias(-3),
  },
  {
    id: 'inq-3',
    titulo: 'Refrigerios en jornada extendida',
    descripcion:
      'En las jornadas de nivelación de sábado no hay servicio de cafetería.',
    estado: 'resuelta',
    categoria: 'bienestar',
    autorId: 'mateo.vargas@elyron.com',
    fichaId: FICHA_DEMO_ID,
    autor: {
      firstName: 'Mateo',
      lastName: 'Vargas',
      email: 'mateo.vargas@elyron.com',
    },
    createdAt: isoDias(-6),
  },
];

const representacionVacia: Representacion = {
  esVocero: false,
  esVoceroSuplente: false,
  esPersonero: false,
  esPersoneroSuplente: false,
};

export const aprendizServiciosService = {
  async misSolicitudes(): Promise<Solicitud[]> {
    if (USE_MOCK) {
      await delay();
      return [...mockSolicitudes];
    }
    try {
      const res = await api.get<Solicitud[]>(EDUCORE_ROUTES.solicitudes.listar);
      return res.data ?? [];
    } catch {
      return [];
    }
  },
  async crearSolicitud(dto: { titulo: string; descripcion?: string; tipo: string }) {
    if (USE_MOCK) {
      await delay();
      const nuevo: Solicitud = {
        id: nuevoId('sol'),
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        tipo: dto.tipo,
        estado: 'abierta',
        createdAt: isoDias(0),
      };
      mockSolicitudes.unshift(nuevo);
      return nuevo;
    }
    const res = await api.post(EDUCORE_ROUTES.solicitudes.crear, dto);
    return res.data;
  },
  async eliminarSolicitud(id: string) {
    if (USE_MOCK) {
      await delay(120);
      const index = mockSolicitudes.findIndex((s) => s.id === id);
      if (index >= 0) mockSolicitudes.splice(index, 1);
      return;
    }
    await api.delete(EDUCORE_ROUTES.solicitudes.eliminar(id));
  },

  async listarComunicados(): Promise<Comunicado[]> {
    if (USE_MOCK) {
      await delay();
      return [...mockComunicados].sort((a, b) =>
        (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
      );
    }
    try {
      const res = await api.get<Comunicado[]>(EDUCORE_ROUTES.comunicados.listar);
      return res.data ?? [];
    } catch {
      return [];
    }
  },
  async crearComunicado(dto: {
    titulo: string;
    contenido: string;
    prioridad?: string;
  }) {
    if (USE_MOCK) {
      await delay();
      const { email, nombre } = leerSesion();
      const autor = dividirNombre(nombre);
      const nuevo: Comunicado = {
        id: nuevoId('com'),
        titulo: dto.titulo,
        contenido: dto.contenido,
        prioridad: esPrioridadValida(dto.prioridad) ? dto.prioridad : 'media',
        destinatario: FICHA_DEMO_CODE,
        autorId: email,
        fichaId: FICHA_DEMO_ID,
        autor: { ...autor, email },
        createdAt: isoDias(0),
      };
      mockComunicados.unshift(nuevo);
      return nuevo;
    }
    const res = await api.post(EDUCORE_ROUTES.comunicados.crear, dto);
    return res.data;
  },
  async eliminarComunicado(id: string) {
    if (USE_MOCK) {
      await delay(120);
      const index = mockComunicados.findIndex((c) => c.id === id);
      if (index >= 0) mockComunicados.splice(index, 1);
      return;
    }
    await api.delete(EDUCORE_ROUTES.comunicados.eliminar(id));
  },

  async catalogo(): Promise<RecursoBiblioteca[]> {
    if (USE_MOCK) {
      await delay();
      return [...mockCatalogo];
    }
    try {
      const res = await api.get<RecursoBiblioteca[]>(EDUCORE_ROUTES.biblioteca.catalogo);
      return res.data ?? [];
    } catch {
      return [];
    }
  },
  async misPrestamos(): Promise<RecursoBiblioteca[]> {
    if (USE_MOCK) {
      await delay();
      const { email } = leerSesion();
      return mockCatalogo.filter((r) => r.prestadoAId === email);
    }
    try {
      const res = await api.get<RecursoBiblioteca[]>(EDUCORE_ROUTES.biblioteca.misPrestamos);
      return res.data ?? [];
    } catch {
      return [];
    }
  },
  async reservar(id: string) {
    if (USE_MOCK) {
      await delay();
      const { email } = leerSesion();
      const recurso = mockCatalogo.find((r) => r.id === id);
      if (recurso && recurso.estado === 'disponible') {
        recurso.estado = 'prestado';
        recurso.prestadoAId = email;
        recurso.fechaDevolucion = isoDias(14);
      }
      return recurso;
    }
    const res = await api.post(EDUCORE_ROUTES.biblioteca.reservar(id));
    return res.data;
  },
  async devolver(id: string) {
    if (USE_MOCK) {
      await delay();
      const recurso = mockCatalogo.find((r) => r.id === id);
      if (recurso) {
        recurso.estado = 'disponible';
        delete recurso.prestadoAId;
        delete recurso.fechaDevolucion;
      }
      return recurso;
    }
    const res = await api.put(EDUCORE_ROUTES.biblioteca.devolver(id));
    return res.data;
  },

  async misDocumentos(): Promise<DocumentoPersonal[]> {
    if (USE_MOCK) {
      await delay();
      return [...mockDocumentos];
    }
    try {
      const res = await api.get<DocumentoPersonal[]>(EDUCORE_ROUTES.documentos.listar);
      return res.data ?? [];
    } catch {
      return [];
    }
  },
  async crearDocumento(dto: { titulo: string; tipo?: string; descripcion?: string }) {
    if (USE_MOCK) {
      await delay();
      const nuevo: DocumentoPersonal = {
        id: nuevoId('doc'),
        titulo: dto.titulo,
        tipo: dto.tipo ?? 'academico',
        descripcion: dto.descripcion,
        createdAt: isoDias(0),
      };
      mockDocumentos.unshift(nuevo);
      return nuevo;
    }
    const res = await api.post(EDUCORE_ROUTES.documentos.crear, dto);
    return res.data;
  },
  async eliminarDocumento(id: string) {
    if (USE_MOCK) {
      await delay(120);
      const index = mockDocumentos.findIndex((d) => d.id === id);
      if (index >= 0) mockDocumentos.splice(index, 1);
      return;
    }
    await api.delete(EDUCORE_ROUTES.documentos.eliminar(id));
  },

  async miApoyo(): Promise<Apoyo[]> {
    if (USE_MOCK) {
      await delay();
      return [...mockApoyo];
    }
    try {
      const res = await api.get<Apoyo[]>(EDUCORE_ROUTES.apoyo.miApoyo);
      return res.data ?? [];
    } catch {
      return [];
    }
  },

  async miRepresentacion(): Promise<Representacion> {
    if (USE_MOCK) {
      await delay(200);
      const { email } = leerSesion();
      const row = learnerRowInMockFicha(email);
      if (!row) return { ...representacionVacia };
      return {
        esVocero: Boolean(row.esVocero),
        esVoceroSuplente: Boolean(row.esVoceroSuplente),
        esPersonero: false,
        esPersoneroSuplente: false,
      };
    }
    try {
      const res = await api.get<Representacion>(EDUCORE_ROUTES.representacion.miRepresentacion);
      return res.data ?? representacionVacia;
    } catch {
      return representacionVacia;
    }
  },

  async anunciosDeFicha(): Promise<FichaAnuncio[]> {
    if (USE_MOCK) {
      await delay();
      return [...mockAnuncios].sort((a, b) =>
        (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
      );
    }
    try {
      const res = await api.get<FichaAnuncio[]>(EDUCORE_ROUTES.liderazgo.anuncios);
      return res.data ?? [];
    } catch {
      return [];
    }
  },
  async crearAnuncio(dto: {
    titulo: string;
    contenido: string;
    prioridad?: string;
    categoria?: string;
  }): Promise<FichaAnuncio> {
    if (USE_MOCK) {
      await delay();
      const { email, nombre } = leerSesion();
      const autor = dividirNombre(nombre);
      const nuevo: FichaAnuncio = {
        id: nuevoId('anu'),
        titulo: dto.titulo,
        contenido: dto.contenido,
        prioridad: esPrioridadValida(dto.prioridad) ? dto.prioridad : 'media',
        categoria: esCategoriaAnuncioValida(dto.categoria)
          ? dto.categoria
          : 'anuncio',
        autorId: email,
        fichaId: FICHA_DEMO_ID,
        autor: { ...autor, email },
        createdAt: isoDias(0),
      };
      mockAnuncios.unshift(nuevo);
      return nuevo;
    }
    const res = await api.post<FichaAnuncio>(EDUCORE_ROUTES.liderazgo.anuncios, dto);
    return res.data;
  },
  async eliminarAnuncio(id: string) {
    if (USE_MOCK) {
      await delay(120);
      const index = mockAnuncios.findIndex((a) => a.id === id);
      if (index >= 0) mockAnuncios.splice(index, 1);
      return;
    }
    await api.delete(EDUCORE_ROUTES.liderazgo.anuncio(id));
  },
  async inquietudesDeFicha(): Promise<Inquietud[]> {
    if (USE_MOCK) {
      await delay();
      return [...mockInquietudes].sort((a, b) =>
        (b.createdAt ?? '').localeCompare(a.createdAt ?? ''),
      );
    }
    try {
      const res = await api.get<Inquietud[]>(EDUCORE_ROUTES.liderazgo.inquietudes);
      return res.data ?? [];
    } catch {
      return [];
    }
  },
  async crearInquietud(dto: {
    titulo: string;
    descripcion: string;
    categoria?: string;
  }): Promise<Inquietud> {
    if (USE_MOCK) {
      await delay();
      const { email, nombre } = leerSesion();
      const autor = dividirNombre(nombre);
      const nuevo: Inquietud = {
        id: nuevoId('inq'),
        titulo: dto.titulo,
        descripcion: dto.descripcion,
        estado: 'abierta',
        categoria: esCategoriaInquietudValida(dto.categoria)
          ? dto.categoria
          : 'general',
        autorId: email,
        fichaId: FICHA_DEMO_ID,
        autor: { ...autor, email },
        createdAt: isoDias(0),
      };
      mockInquietudes.unshift(nuevo);
      return nuevo;
    }
    const res = await api.post<Inquietud>(EDUCORE_ROUTES.liderazgo.inquietudes, dto);
    return res.data;
  },
  async actualizarEstadoInquietud(id: string, estado: string): Promise<Inquietud> {
    if (USE_MOCK) {
      await delay();
      const inquietud = mockInquietudes.find((q) => q.id === id);
      if (inquietud) {
        const estadoValido: Inquietud['estado'] =
          estado === 'abierta' || estado === 'en_gestion' || estado === 'resuelta'
            ? estado
            : inquietud.estado;
        inquietud.estado = estadoValido;
      }
      if (!inquietud) throw new Error('Inquietud no encontrada');
      return inquietud;
    }
    const res = await api.put<Inquietud>(EDUCORE_ROUTES.liderazgo.inquietudEstado(id), { estado });
    return res.data;
  },

  async listarNotificaciones() {
    if (USE_MOCK) {
      await delay();
      return [
        {
          id: 'not-1',
          title: 'Nuevo comunicado de tu ficha',
          message: 'Valentina publicó un anuncio sobre la reunión general de ficha.',
          type: 'megaphone',
          isRead: false,
          link: '/comunicados',
          createdAt: isoDias(0),
        },
        {
          id: 'not-2',
          title: 'Taller SQL en 3 días',
          message: 'Tienes una actividad próxima en tu calendario académico.',
          type: 'calendar',
          isRead: false,
          link: '/calendario',
          createdAt: isoDias(0),
        },
        {
          id: 'not-3',
          title: 'Nueva convocatoria de apoyo',
          message: 'Abrió la convocatoria de apoyo de sostenimiento del semestre.',
          type: 'info',
          isRead: true,
          link: '/apoyo',
          createdAt: isoDias(-1),
        },
      ];
    }
    try {
      const res = await api.get(EDUCORE_ROUTES.notificaciones.listar());
      const data = res.data as unknown;
      if (Array.isArray(data)) return data as any[];
      return (data as any)?.data ?? [];
    } catch {
      return [];
    }
  },
};

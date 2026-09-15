import { educoreClient } from '../api';
import { USE_MOCK } from './config';

/* ============================================================
   CATÁLOGO ACADÉMICO · Elyron
   Entidades académicas disponibles (socios/registradas) para
   que el usuario las SELECCIONE al registrarse, sin poder
   escribir una universidad/colegio/centro que no esté en la red.
   ============================================================ */

export interface RegionalAcademica {
  id: string;
  nombre: string;
  centros: string[];
  municipios: string[];
}

export interface FichaCatalogo {
  code: string;
  name: string;
  tipoPrograma: string | null;
  programa: string | null;
  duracionMeses: number | null;
  fechaInicio: string | null;
  fechaFinalizacion: string | null;
}

export interface GrupoCatalogo {
  code: string;
  nombre: string;
  grado: number;
  colegio: string | null;
}

export interface CatalogoAcademico {
  universidades: string[];
  colegios: string[];
  regionales: RegionalAcademica[];
  programas: Array<{ id: string; name: string; duracionMeses: number | null }>;
  fichas: FichaCatalogo[];
  grupos: GrupoCatalogo[];
}

export interface ValidacionCurso {
  valido: boolean;
  mensaje?: string;
  tipo?: 'ficha' | 'grupo';
  codigo?: string;
  nombre?: string;
  tipoPrograma?: string | null;
  programa?: string | null;
  duracionMeses?: number | null;
  fechaInicio?: string | null;
  fechaFinalizacion?: string | null;
  grado?: number;
  colegio?: string | null;
}

const REGIONALES_MOCK: RegionalAcademica[] = [
  {
    id: 'bogota',
    nombre: 'Bogotá D.C.',
    centros: [
      'Centro Colombo Alemán para la Formación Tecnológica',
      'Centro de Electricidad, Electrónica y Telecomunicaciones (CEET)',
      'Centro de Gestión de Mercados, Logística y Tecnologías de la Información (CGMLTI)',
      'Centro de Tecnologías para la Construcción y la Madera',
      'Centro de Servicios Financieros',
      'Centro Metalmecánico',
    ],
    municipios: ['Bogotá D.C.'],
  },
  {
    id: 'antioquia',
    nombre: 'Antioquia',
    centros: [
      'Centro de Tecnología de la Manufactura Avanzada (CTMA)',
      'Complejo Tecnológico Turístico y Agroindustrial del Occidente Antioqueño',
      'Centro de Servicios y Gestión Empresarial',
    ],
    municipios: ['Medellín', 'Bello', 'Envigado', 'Itagüí', 'Rionegro', 'Apartadó', 'Turbo'],
  },
  {
    id: 'atlantico',
    nombre: 'Atlántico',
    centros: [
      'Centro Nacional Colombo Alemán',
      'Centro Industrial y de Aviación',
      'Centro de Comercio y Servicios',
    ],
    municipios: [
      'Barranquilla',
      'Soledad',
      'Malambo',
      'Puerto Colombia',
      'Galapa',
      'Sabanalarga',
      'Baranoa',
    ],
  },
  {
    id: 'valle',
    nombre: 'Valle del Cauca',
    centros: [
      'Centro Nacional de Asistencia Técnica a la Industria (ASTIN)',
      'Centro de Electricidad y Electrónica',
      'Centro de Biotecnología Industrial',
    ],
    municipios: ['Cali', 'Palmira', 'Buenaventura', 'Tuluá', 'Buga', 'Yumbo', 'Jamundí'],
  },
  {
    id: 'santander',
    nombre: 'Santander',
    centros: [
      'Centro Industrial del Mantenimiento Integral (CIMI)',
      'Centro de Servicios Empresariales y Turísticos (CSET)',
      'Centro Nacional de Aprendizaje (CENA)',
    ],
    municipios: ['Bucaramanga', 'Floridablanca', 'Girón', 'Piedecuesta', 'Barrancabermeja', 'San Gil'],
  },
  {
    id: 'bolivar',
    nombre: 'Bolívar',
    centros: [
      'Centro de Comercio y Servicios',
      'Centro de Formación Náutica, Pesquera y Agroindustrial',
      'Centro Industrial y de la Construcción',
    ],
    municipios: ['Cartagena de Indias', 'Magangué', 'Turbaco', 'Arjona'],
  },
  {
    id: 'cundinamarca',
    nombre: 'Cundinamarca',
    centros: [
      'Centro Agropecuario de la Sabana',
      'Centro Industrial y de Desarrollo Empresarial de Soacha (CIDE)',
    ],
    municipios: ['Soacha', 'Zipaquirá', 'Facatativá', 'Chía', 'Fusagasugá', 'Girardot'],
  },
  {
    id: 'magdalena',
    nombre: 'Magdalena',
    centros: [
      'Centro Acuícola y Agroindustrial de Gaira',
      'Centro de Logística y Promoción Ecoturística del Magdalena',
    ],
    municipios: ['Santa Marta', 'Ciénaga', 'Fundación'],
  },
  {
    id: 'norte-santander',
    nombre: 'Norte de Santander',
    centros: ['Centro de la Industria, la Empresa y los Servicios (CIES)'],
    municipios: ['Cúcuta', 'Ocaña', 'Los Patios', 'Villa del Rosario', 'Pamplona'],
  },
  {
    id: 'risaralda',
    nombre: 'Risaralda',
    centros: ['Centro de Diseño e Innovación Tecnológica Industrial (CDITI)', 'Centro de Comercio y Servicios'],
    municipios: ['Pereira', 'Dosquebradas', 'La Virginia', 'Santa Rosa de Cabal'],
  },
];

const CATALOGO_MOCK: CatalogoAcademico = {
  universidades: [
    'Universidad Nacional de Colombia',
    'Universidad de Antioquia',
    'Universidad de los Andes',
    'Pontificia Universidad Javeriana',
    'Universidad del Valle',
    'Universidad Industrial de Santander',
    'Universidad del Rosario',
    'Corporación Universitaria Aurora',
  ],
  colegios: [
    'Colegio Demo Elyron',
    'Colegio XYZ',
    'Instituto Nacional',
    'Liceo Los Andes',
    'Colegio San Bartolomé',
    'Institución Educativa La Esperanza',
  ],
  regionales: REGIONALES_MOCK,
  programas: [
    { id: 'prog-adso', name: 'Análisis y Desarrollo de Software', duracionMeses: 18 },
    { id: 'prog-redes', name: 'Redes de Datos', duracionMeses: 18 },
    { id: 'prog-prog', name: 'Programación de Software', duracionMeses: 12 },
    { id: 'prog-grd', name: 'Gestión de Redes de Datos', duracionMeses: 18 },
    { id: 'prog-sist', name: 'Sistemas de Información', duracionMeses: 12 },
    { id: 'prog-dpi', name: 'Diseño de Productos Industriales', duracionMeses: 18 },
  ],
  fichas: [
    {
      code: '2451310',
      name: 'ADSO',
      tipoPrograma: 'tecnologo',
      programa: 'Análisis y Desarrollo de Software',
      duracionMeses: 18,
      fechaInicio: '2026-01-20',
      fechaFinalizacion: '2027-06-30',
    },
  ],
  grupos: [{ code: '10-02', nombre: 'Grado Décimo B', grado: 10, colegio: 'Colegio Demo Elyron' }],
};

const delay = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

const FICHA_MOCK = CATALOGO_MOCK.fichas[0];
const GRUPO_MOCK = CATALOGO_MOCK.grupos[0];

export const catalogoService = {
  async obtener(): Promise<CatalogoAcademico> {
    if (USE_MOCK) {
      await delay(300);
      return CATALOGO_MOCK;
    }
    try {
      const res = await educoreClient.get<CatalogoAcademico>('/catalogo-academico');
      return res.data;
    } catch {
      return CATALOGO_MOCK;
    }
  },

  async validarCurso(
    codigo: string,
    tipo: string,
    programa?: string,
  ): Promise<ValidacionCurso> {
    if (USE_MOCK) {
      await delay(300);
      const codigoTrim = codigo.trim();
      if (tipo === 'sena' || tipo === 'aprendiz') {
        if (codigoTrim === FICHA_MOCK.code) {
          return {
            valido: true,
            tipo: 'ficha',
            codigo: FICHA_MOCK.code,
            nombre: FICHA_MOCK.name,
            tipoPrograma: FICHA_MOCK.tipoPrograma,
            programa: programa || FICHA_MOCK.programa,
            duracionMeses: FICHA_MOCK.duracionMeses,
            fechaInicio: FICHA_MOCK.fechaInicio,
            fechaFinalizacion: FICHA_MOCK.fechaFinalizacion,
          };
        }
        /* Cualquier número de ficha SENA válido (7 dígitos) se acepta:
           cada aprendiz puede tener la ficha que la institución le asigne. */
        if (/^\d{7}$/.test(codigoTrim)) {
          return {
            valido: true,
            tipo: 'ficha',
            codigo: codigoTrim,
            nombre: FICHA_MOCK.name,
            tipoPrograma: FICHA_MOCK.tipoPrograma,
            programa: programa || FICHA_MOCK.programa,
            duracionMeses: FICHA_MOCK.duracionMeses,
            fechaInicio: FICHA_MOCK.fechaInicio,
            fechaFinalizacion: FICHA_MOCK.fechaFinalizacion,
          };
        }
        return { valido: false, mensaje: 'Ingresa un número de ficha válido (7 dígitos).' };
      }
      if (tipo === 'colegio' || tipo === 'estudiante') {
        if (codigoTrim === GRUPO_MOCK.code) {
          return {
            valido: true,
            tipo: 'grupo',
            codigo: GRUPO_MOCK.code,
            nombre: GRUPO_MOCK.nombre,
            grado: GRUPO_MOCK.grado,
            colegio: GRUPO_MOCK.colegio,
          };
        }
        return { valido: false, mensaje: 'Ese código de curso no existe o no está activo.' };
      }
      return { valido: false, mensaje: 'Tipo de curso no válido.' };
    }
    try {
      const res = await educoreClient.get<ValidacionCurso>('/catalogo-academico/validar', {
        params: { codigo, tipo, programa },
      });
      return res.data;
    } catch {
      return { valido: false, mensaje: 'No fue posible validar el código. Intenta de nuevo.' };
    }
  },
};

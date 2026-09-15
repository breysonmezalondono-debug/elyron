export const UNIVERSIDADES_DISPONIBLES = [
  'Universidad Nacional de Colombia',
  'Universidad de Antioquia',
  'Universidad de los Andes',
  'Pontificia Universidad Javeriana',
  'Universidad del Valle',
  'Universidad Industrial de Santander',
  'Universidad del Rosario',
  'Corporación Universitaria Aurora',
] as const;

export const COLEGIOS_DISPONIBLES = [
  'Colegio Demo Elyron',
  'Colegio XYZ',
  'Instituto Nacional',
  'Liceo Los Andes',
  'Colegio San Bartolomé',
  'Institución Educativa La Esperanza',
] as const;

/* ============================================================
   SENA · Estructura territorial real (regionales → centros y
   municipios). El registro usa esta cascada: el usuario elige la
   regional y según ella se habilitan su centro de formación y la
   ciudad/municipio, igual que en Sofía Plus.
   ============================================================ */
export interface RegionalSena {
  id: string;
  nombre: string;
  centros: string[];
  municipios: string[];
}

export const REGIONALES_SENA: RegionalSena[] = [
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
      'Centro de Diseño y Metrología',
      'Centro Nacional de Hotelería, Turismo y Alimentos',
      'Centro de Manufactura en Textil y Cuero',
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
      'Centro de Formación en Diseño, Confección y Moda',
      'Centro de Tecnologías Agroindustriales',
    ],
    municipios: [
      'Medellín',
      'Bello',
      'Envigado',
      'Itagüí',
      'Rionegro',
      'Marinilla',
      'Apartadó',
      'Turbo',
      'Caucasia',
    ],
  },
  {
    id: 'atlantico',
    nombre: 'Atlántico',
    centros: [
      'Centro Nacional Colombo Alemán',
      'Centro Industrial y de Aviación',
      'Centro de Comercio y Servicios',
      'Centro para el Desarrollo Agroecológico y Agroindustrial (CEDA)',
    ],
    municipios: [
      'Barranquilla',
      'Soledad',
      'Malambo',
      'Puerto Colombia',
      'Galapa',
      'Sabanalarga',
      'Baranoa',
      'Santo Tomás',
    ],
  },
  {
    id: 'valle',
    nombre: 'Valle del Cauca',
    centros: [
      'Centro Nacional de Asistencia Técnica a la Industria (ASTIN)',
      'Centro de Electricidad y Electrónica',
      'Centro de Biotecnología Industrial',
      'Centro de Gestión Tecnológica de Servicios',
      'Centro Agropecuario de Buga',
    ],
    municipios: [
      'Cali',
      'Palmira',
      'Buenaventura',
      'Tuluá',
      'Buga',
      'Yumbo',
      'Jamundí',
      'Cartago',
    ],
  },
  {
    id: 'santander',
    nombre: 'Santander',
    centros: [
      'Centro Industrial del Mantenimiento Integral (CIMI)',
      'Centro de Servicios Empresariales y Turísticos (CSET)',
      'Centro Nacional de Aprendizaje (CENA)',
      'Centro de Atención al Sector Agropecuario (CASA)',
    ],
    municipios: [
      'Bucaramanga',
      'Floridablanca',
      'Girón',
      'Piedecuesta',
      'Barrancabermeja',
      'San Gil',
      'Socorro',
      'Vélez',
    ],
  },
  {
    id: 'bolivar',
    nombre: 'Bolívar',
    centros: [
      'Centro de Comercio y Servicios',
      'Centro de Formación Náutica, Pesquera y Agroindustrial',
      'Centro Industrial y de la Construcción',
      'Centro de Formación para el Desarrollo Rural e Institucional',
    ],
    municipios: [
      'Cartagena de Indias',
      'Magangué',
      'Turbaco',
      'Arjona',
      'El Carmen de Bolívar',
    ],
  },
  {
    id: 'cundinamarca',
    nombre: 'Cundinamarca',
    centros: [
      'Centro Agropecuario de la Sabana',
      'Centro Industrial y de Desarrollo Empresarial de Soacha (CIDE)',
      'Centro de Desarrollo Agroindustrial y Empresarial',
      'Complejo Tecnológico Minero Agroempresarial',
    ],
    municipios: [
      'Soacha',
      'Zipaquirá',
      'Facatativá',
      'Chía',
      'Fusagasugá',
      'Girardot',
      'Mosquera',
      'Madrid',
    ],
  },
  {
    id: 'magdalena',
    nombre: 'Magdalena',
    centros: [
      'Centro Acuícola y Agroindustrial de Gaira',
      'Centro de Logística y Promoción Ecoturística del Magdalena',
      'Centro Industrial y Portuario',
    ],
    municipios: ['Santa Marta', 'Ciénaga', 'Fundación', 'El Banco'],
  },
  {
    id: 'norte-santander',
    nombre: 'Norte de Santander',
    centros: [
      'Centro de la Industria, la Empresa y los Servicios (CIES)',
      'Centro de Formación para el Desarrollo Rural (CFDR)',
    ],
    municipios: [
      'Cúcuta',
      'Ocaña',
      'Los Patios',
      'Villa del Rosario',
      'Pamplona',
    ],
  },
  {
    id: 'risaralda',
    nombre: 'Risaralda',
    centros: [
      'Centro de Diseño e Innovación Tecnológica Industrial (CDITI)',
      'Centro de Comercio y Servicios',
      'Centro de Atención al Sector Agropecuario',
    ],
    municipios: [
      'Pereira',
      'Dosquebradas',
      'La Virginia',
      'Santa Rosa de Cabal',
    ],
  },
  {
    id: 'boyaca',
    nombre: 'Boyacá',
    centros: [
      'Centro Industrial de Mantenimiento Integral (CIMI)',
      'Centro de Gestión Administrativa y Fortalecimiento Empresarial',
      'Centro de Desarrollo Agropecuario y Agroindustrial',
      'Centro Minero',
    ],
    municipios: ['Tunja', 'Duitama', 'Sogamoso', 'Chiquinquirá', 'Paipa'],
  },
  {
    id: 'huila',
    nombre: 'Huila',
    centros: [
      'Centro de Gestión y Desarrollo Sostenible Surcolombiano',
      'Centro de la Industria, la Empresa y los Servicios',
      'Centro de Desarrollo Agroempresarial',
    ],
    municipios: ['Neiva', 'Pitalito', 'Garzón', 'La Plata', 'Campoalegre'],
  },
];

export const CENTROS_FORMACION_SENA = REGIONALES_SENA.flatMap(
  (regional) => regional.centros,
);

export const PROGRAMAS_SENA_SEED: {
  name: string;
  duracionMeses: number;
}[] = [
  { name: 'Análisis y Desarrollo de Software', duracionMeses: 18 },
  { name: 'Redes de Datos', duracionMeses: 18 },
  { name: 'Programación de Software', duracionMeses: 12 },
  { name: 'Gestión de Redes de Datos', duracionMeses: 18 },
  { name: 'Sistemas de Información', duracionMeses: 12 },
  { name: 'Diseño de Productos Industriales', duracionMeses: 18 },
];

/* ============================================================
   CATÁLOGO DE PROGRAMAS SENA · Elyron
   Lista base de programas de formación. Cada programa tiene un
   `id` normalizado único, su nivel/duración y su `dominio`
   académico. La biblioteca se resuelve SIEMPRE por el dominio del
   programa; dos programas de dominios distintos NUNCA comparten
   recursos. Los programas de un mismo dominio comparten solo
   porque existe relación académica real entre ellos.
   ============================================================ */

export type NivelPrograma = 'tecnico' | 'tecnologo' | 'especializacion_tecnologica';

export interface ProgramaSena {
  id: string;
  name: string;
  nivel: NivelPrograma;
  duracionMeses: number;
  dominio: string;
}

export const PROGRAMAS_SENA: ProgramaSena[] = [
  /* ==================== TECNÓLOGOS · SOFTWARE ==================== */
  { id: 'adso', name: 'Análisis y Desarrollo de Software', nivel: 'tecnologo', duracionMeses: 24, dominio: 'software' },
  { id: 'desarrollo-videojuegos', name: 'Desarrollo de Videojuegos', nivel: 'tecnologo', duracionMeses: 24, dominio: 'software' },
  { id: 'sistemas-informacion', name: 'Sistemas de Información', nivel: 'tecnologo', duracionMeses: 24, dominio: 'software' },
  { id: 'redes-datos', name: 'Gestión de Redes de Datos', nivel: 'tecnologo', duracionMeses: 24, dominio: 'redes' },
  { id: 'telecomunicaciones', name: 'Telecomunicaciones', nivel: 'tecnologo', duracionMeses: 24, dominio: 'redes' },
  { id: 'mantenimiento-computo', name: 'Mantenimiento de Equipos de Cómputo', nivel: 'tecnologo', duracionMeses: 24, dominio: 'hardware' },

  /* ==================== TECNÓLOGOS · INDUSTRIA / MECATRÓNICA ==================== */
  { id: 'automatismos-mecatronicos', name: 'Diseño e Integración de Automatismos Mecatrónicos', nivel: 'tecnologo', duracionMeses: 24, dominio: 'mecatronica' },
  { id: 'robotica-automatizacion', name: 'Robótica y Automatización Industrial', nivel: 'tecnologo', duracionMeses: 24, dominio: 'mecatronica' },
  { id: 'produccion-industrial', name: 'Gestión de la Producción Industrial', nivel: 'tecnologo', duracionMeses: 24, dominio: 'mecanica' },
  { id: 'mecatronica-industrial', name: 'Mecatrónica Industrial', nivel: 'tecnologo', duracionMeses: 24, dominio: 'mecatronica' },
  { id: 'mecanica-industrial', name: 'Mecánica Industrial', nivel: 'tecnologo', duracionMeses: 24, dominio: 'mecanica' },
  { id: 'soldadura', name: 'Soldadura de Productos Metálicos', nivel: 'tecnologo', duracionMeses: 18, dominio: 'mecanica' },
  { id: 'mantenimiento-electromecanico', name: 'Mantenimiento Electromecánico Industrial', nivel: 'tecnologo', duracionMeses: 24, dominio: 'mecanica' },
  { id: 'electricidad-industrial', name: 'Electricidad Industrial', nivel: 'tecnologo', duracionMeses: 24, dominio: 'electricidad' },
  { id: 'sistemas-electricos', name: 'Sistemas Eléctricos y Electrónicos de Potencia', nivel: 'tecnologo', duracionMeses: 24, dominio: 'electricidad' },
  { id: 'automatizacion-industrial', name: 'Automatización Industrial', nivel: 'tecnologo', duracionMeses: 24, dominio: 'mecatronica' },

  /* ==================== TECNÓLOGOS · ADMINISTRACIÓN / NEGOCIOS ==================== */
  { id: 'gestion-mercados', name: 'Gestión de Mercados', nivel: 'tecnologo', duracionMeses: 24, dominio: 'marketing' },
  { id: 'analisis-operacion-mercados', name: 'Análisis y Operación de Mercados', nivel: 'tecnologo', duracionMeses: 24, dominio: 'marketing' },
  { id: 'operacion-comercial', name: 'Operación Comercial', nivel: 'tecnologo', duracionMeses: 18, dominio: 'marketing' },
  { id: 'gestion-logistica', name: 'Gestión Logística', nivel: 'tecnologo', duracionMeses: 24, dominio: 'logistica' },
  { id: 'gestion-talento-humano', name: 'Gestión del Talento Humano', nivel: 'tecnologo', duracionMeses: 24, dominio: 'talento-humano' },
  { id: 'gestion-administrativa', name: 'Gestión Administrativa', nivel: 'tecnologo', duracionMeses: 24, dominio: 'administracion' },
  { id: 'gestion-contable', name: 'Gestión Contable y Financiera', nivel: 'tecnologo', duracionMeses: 24, dominio: 'contabilidad' },
  { id: 'gestion-bancaria', name: 'Gestión Bancaria y de Entidades Financieras', nivel: 'tecnologo', duracionMeses: 24, dominio: 'contabilidad' },
  { id: 'comercio-internacional', name: 'Comercio Internacional', nivel: 'tecnologo', duracionMeses: 24, dominio: 'administracion' },
  { id: 'contabilidad-finanzas', name: 'Contabilidad y Finanzas', nivel: 'tecnologo', duracionMeses: 24, dominio: 'contabilidad' },
  { id: 'negociacion-internacional', name: 'Negociación Internacional', nivel: 'tecnologo', duracionMeses: 24, dominio: 'administracion' },
  { id: 'negocios-digitales', name: 'Gestión de Negocios Digitales', nivel: 'tecnologo', duracionMeses: 24, dominio: 'marketing' },
  { id: 'marketing-digital', name: 'Marketing Digital', nivel: 'tecnologo', duracionMeses: 24, dominio: 'marketing' },
  { id: 'publicidad-mercadeo', name: 'Publicidad y Mercadeo', nivel: 'tecnologo', duracionMeses: 24, dominio: 'marketing' },
  { id: 'empresas-agropecuarias', name: 'Gestión de Empresas Agropecuarias', nivel: 'tecnologo', duracionMeses: 24, dominio: 'administracion' },
  { id: 'administracion-empresas', name: 'Administración de Empresas', nivel: 'tecnologo', duracionMeses: 24, dominio: 'administracion' },
  { id: 'gestion-empresarial', name: 'Gestión Empresarial', nivel: 'tecnologo', duracionMeses: 24, dominio: 'administracion' },
  { id: 'gestion-calidad', name: 'Gestión de la Calidad', nivel: 'tecnologo', duracionMeses: 24, dominio: 'calidad' },

  /* ==================== TECNÓLOGOS · TURISMO / HOTELERÍA ==================== */
  { id: 'gestion-turistica', name: 'Gestión Turística', nivel: 'tecnologo', duracionMeses: 24, dominio: 'turismo' },
  { id: 'gestion-hotelera', name: 'Gestión Hotelera', nivel: 'tecnologo', duracionMeses: 24, dominio: 'turismo' },

  /* ==================== TECNÓLOGOS · SERVICIO AL CLIENTE ==================== */
  { id: 'atencion-cliente', name: 'Servicio al Cliente y Contact Center', nivel: 'tecnologo', duracionMeses: 18, dominio: 'servicio-cliente' },
  { id: 'servicios-comerciales', name: 'Servicios Comerciales', nivel: 'tecnologo', duracionMeses: 18, dominio: 'servicio-cliente' },

  /* ==================== TECNÓLOGOS · SEGURIDAD ==================== */
  { id: 'seguridad-salud-trabajo', name: 'Seguridad y Salud en el Trabajo', nivel: 'tecnologo', duracionMeses: 24, dominio: 'sst' },
  { id: 'salud-ocupacional', name: 'Salud Ocupacional', nivel: 'tecnologo', duracionMeses: 24, dominio: 'sst' },

  /* ==================== TECNÓLOGOS · AMBIENTAL / AGRO ==================== */
  { id: 'gestion-ambiental', name: 'Gestión Ambiental', nivel: 'tecnologo', duracionMeses: 24, dominio: 'ambiental' },
  { id: 'gestion-recursos-naturales', name: 'Gestión de Recursos Naturales', nivel: 'tecnologo', duracionMeses: 24, dominio: 'ambiental' },
  { id: 'produccion-ecologica', name: 'Producción Agropecuaria Ecológica', nivel: 'tecnologo', duracionMeses: 24, dominio: 'agro' },
  { id: 'agroindustria-alimentaria', name: 'Agroindustria Alimentaria', nivel: 'tecnologo', duracionMeses: 24, dominio: 'agro' },
  { id: 'produccion-agroecologica', name: 'Producción de Agroecológica', nivel: 'tecnologo', duracionMeses: 24, dominio: 'agro' },

  /* ==================== TECNÓLOGOS · MODA ==================== */
  { id: 'diseno-moda', name: 'Diseño para la Industria de la Moda', nivel: 'tecnologo', duracionMeses: 24, dominio: 'moda' },
  { id: 'produccion-prendas', name: 'Producción de Prendas de Vestir', nivel: 'tecnologo', duracionMeses: 24, dominio: 'moda' },
  { id: 'diseno-modas', name: 'Diseño de Modas', nivel: 'tecnologo', duracionMeses: 24, dominio: 'moda' },
  { id: 'gestion-moda-textil', name: 'Gestión de la Moda y el Textil', nivel: 'tecnologo', duracionMeses: 24, dominio: 'moda' },

  /* ==================== TECNÓLOGOS · DISEÑO / MULTIMEDIA ==================== */
  { id: 'diseno-grafico', name: 'Diseño Gráfico', nivel: 'tecnologo', duracionMeses: 24, dominio: 'diseno' },
  { id: 'produccion-multimedia', name: 'Producción Multimedia', nivel: 'tecnologo', duracionMeses: 24, dominio: 'multimedia' },
  { id: 'animacion-digital', name: 'Animación Digital', nivel: 'tecnologo', duracionMeses: 24, dominio: 'multimedia' },
  { id: 'diseno-industrial', name: 'Diseño Industrial', nivel: 'tecnologo', duracionMeses: 24, dominio: 'diseno' },
  { id: 'diseno-productos', name: 'Diseño de Productos Industriales', nivel: 'tecnologo', duracionMeses: 24, dominio: 'diseno' },

  /* ==================== TECNÓLOGOS · SALUD ==================== */
  { id: 'enfermeria', name: 'Enfermería', nivel: 'tecnologo', duracionMeses: 24, dominio: 'salud' },
  { id: 'atencion-prehospitalaria', name: 'Atención Prehospitalaria', nivel: 'tecnologo', duracionMeses: 24, dominio: 'salud' },
  { id: 'instrumentacion-quirurgica', name: 'Instrumentación Quirúrgica', nivel: 'tecnologo', duracionMeses: 24, dominio: 'salud' },
  { id: 'administracion-servicios-salud', name: 'Administración de Servicios de Salud', nivel: 'tecnologo', duracionMeses: 24, dominio: 'salud' },
  { id: 'gestion-servicios-salud', name: 'Gestión de Servicios de Salud', nivel: 'tecnologo', duracionMeses: 24, dominio: 'salud' },
  { id: 'cosmetologia', name: 'Cosmetología y Estética Integral', nivel: 'tecnologo', duracionMeses: 24, dominio: 'belleza' },
  { id: 'estetica-integral', name: 'Estética Integral', nivel: 'tecnologo', duracionMeses: 24, dominio: 'belleza' },

  /* ==================== TECNÓLOGOS · GASTRONOMÍA ==================== */
  { id: 'gastronomia', name: 'Gastronomía', nivel: 'tecnologo', duracionMeses: 24, dominio: 'gastronomia' },
  { id: 'cocina', name: 'Cocina', nivel: 'tecnologo', duracionMeses: 24, dominio: 'gastronomia' },
  { id: 'panaderia-reposteria', name: 'Panadería y Repostería', nivel: 'tecnologo', duracionMeses: 18, dominio: 'gastronomia' },
  { id: 'gestion-servicio-gastronomico', name: 'Gestión del Servicio Gastronómico', nivel: 'tecnologo', duracionMeses: 24, dominio: 'gastronomia' },
  { id: 'seguridad-alimentaria', name: 'Seguridad Alimentaria', nivel: 'tecnologo', duracionMeses: 24, dominio: 'gastronomia' },

  /* ==================== TECNÓLOGOS · CONSTRUCCIÓN ==================== */
  { id: 'construccion', name: 'Construcción', nivel: 'tecnologo', duracionMeses: 24, dominio: 'construccion' },
  { id: 'construccion-edificaciones', name: 'Construcción de Edificaciones', nivel: 'tecnologo', duracionMeses: 24, dominio: 'construccion' },
  { id: 'diseno-obras-civiles', name: 'Diseño y Construcción de Obras Civiles', nivel: 'tecnologo', duracionMeses: 24, dominio: 'construccion' },
  { id: 'topografia', name: 'Topografía', nivel: 'tecnologo', duracionMeses: 24, dominio: 'construccion' },
  { id: 'mantenimiento-construccion', name: 'Mantenimiento de la Construcción', nivel: 'tecnologo', duracionMeses: 24, dominio: 'construccion' },
  { id: 'seguridad-industrial', name: 'Seguridad Industrial', nivel: 'tecnologo', duracionMeses: 24, dominio: 'sst' },
  { id: 'prevencion-riesgos', name: 'Prevención de Riesgos Laborales', nivel: 'tecnologo', duracionMeses: 24, dominio: 'sst' },

  /* ==================== TECNÓLOGOS · LOGÍSTICA / TRANSPORTE ==================== */
  { id: 'cadena-suministro', name: 'Gestión de la Cadena de Suministro', nivel: 'tecnologo', duracionMeses: 24, dominio: 'logistica' },
  { id: 'puertos-aeropuertos', name: 'Gestión de Puertos y Aeropuertos', nivel: 'tecnologo', duracionMeses: 24, dominio: 'logistica' },
  { id: 'gestion-transporte', name: 'Gestión Integral del Transporte', nivel: 'tecnologo', duracionMeses: 24, dominio: 'logistica' },
  { id: 'gestion-transito', name: 'Planeación y Gestión del Tránsito', nivel: 'tecnologo', duracionMeses: 24, dominio: 'logistica' },

  /* ==================== TÉCNICOS ==================== */
  { id: 'tecnico-sistemas', name: 'Técnico en Sistemas', nivel: 'tecnico', duracionMeses: 12, dominio: 'software' },
  { id: 'tecnico-programacion', name: 'Técnico en Programación de Software', nivel: 'tecnico', duracionMeses: 12, dominio: 'software' },
  { id: 'tecnico-mantenimiento-computadores', name: 'Técnico en Mantenimiento de Computadores', nivel: 'tecnico', duracionMeses: 12, dominio: 'hardware' },
  { id: 'tecnico-redes', name: 'Técnico en Redes de Datos', nivel: 'tecnico', duracionMeses: 12, dominio: 'redes' },
  { id: 'tecnico-electricidad', name: 'Técnico en Electricidad y Electrónica', nivel: 'tecnico', duracionMeses: 12, dominio: 'electricidad' },
  { id: 'tecnico-mecanica', name: 'Técnico en Mecánica Industrial', nivel: 'tecnico', duracionMeses: 12, dominio: 'mecanica' },
  { id: 'tecnico-soldadura', name: 'Técnico en Soldadura', nivel: 'tecnico', duracionMeses: 12, dominio: 'mecanica' },
  { id: 'tecnico-operaciones-comerciales', name: 'Técnico en Operaciones Comerciales', nivel: 'tecnico', duracionMeses: 12, dominio: 'servicio-cliente' },
  { id: 'tecnico-contabilizacion', name: 'Técnico en Contabilización de Operaciones Comerciales y Financieras', nivel: 'tecnico', duracionMeses: 12, dominio: 'contabilidad' },
  { id: 'tecnico-asistencia-administrativa', name: 'Técnico en Asistencia Administrativa', nivel: 'tecnico', duracionMeses: 12, dominio: 'administracion' },
  { id: 'tecnico-gestion-administrativa', name: 'Técnico en Gestión Administrativa', nivel: 'tecnico', duracionMeses: 12, dominio: 'administracion' },
  { id: 'tecnico-atencion-cliente', name: 'Técnico en Atención al Cliente', nivel: 'tecnico', duracionMeses: 12, dominio: 'servicio-cliente' },
  { id: 'tecnico-servicio-cliente', name: 'Técnico en Servicio al Cliente', nivel: 'tecnico', duracionMeses: 12, dominio: 'servicio-cliente' },
  { id: 'tecnico-recursos-humanos', name: 'Técnico en Recursos Humanos', nivel: 'tecnico', duracionMeses: 12, dominio: 'talento-humano' },
  { id: 'tecnico-mercadeo', name: 'Técnico en Mercadeo', nivel: 'tecnico', duracionMeses: 12, dominio: 'marketing' },
  { id: 'tecnico-ventas', name: 'Técnico en Ventas de Productos y Servicios', nivel: 'tecnico', duracionMeses: 12, dominio: 'marketing' },
  { id: 'tecnico-diseno-grafico', name: 'Técnico en Diseño Gráfico', nivel: 'tecnico', duracionMeses: 12, dominio: 'diseno' },
  { id: 'tecnico-diseno-publicidad', name: 'Técnico en Diseño y Publicidad', nivel: 'tecnico', duracionMeses: 12, dominio: 'diseno' },
  { id: 'tecnico-produccion-multimedia', name: 'Técnico en Producción de Multimedia', nivel: 'tecnico', duracionMeses: 12, dominio: 'multimedia' },
  { id: 'tecnico-cocina', name: 'Técnico en Cocina', nivel: 'tecnico', duracionMeses: 12, dominio: 'gastronomia' },
  { id: 'tecnico-panaderia', name: 'Técnico en Panadería', nivel: 'tecnico', duracionMeses: 12, dominio: 'gastronomia' },
  { id: 'tecnico-agroindustria', name: 'Técnico en Agroindustria', nivel: 'tecnico', duracionMeses: 12, dominio: 'agro' },
  { id: 'tecnico-produccion-agropecuaria', name: 'Técnico en Producción Agropecuaria', nivel: 'tecnico', duracionMeses: 12, dominio: 'agro' },
  { id: 'tecnico-construccion', name: 'Técnico en Construcción de Edificaciones', nivel: 'tecnico', duracionMeses: 12, dominio: 'construccion' },
  { id: 'tecnico-sst', name: 'Técnico en Seguridad y Salud en el Trabajo', nivel: 'tecnico', duracionMeses: 12, dominio: 'sst' },
  { id: 'tecnico-logistica', name: 'Técnico en Logística', nivel: 'tecnico', duracionMeses: 12, dominio: 'logistica' },
  { id: 'tecnico-turismo', name: 'Técnico en Turismo', nivel: 'tecnico', duracionMeses: 12, dominio: 'turismo' },
  { id: 'tecnico-hotelería', name: 'Técnico en Hotelería y Turismo', nivel: 'tecnico', duracionMeses: 12, dominio: 'turismo' },
  { id: 'tecnico-prevencion-riesgos', name: 'Técnico en Prevención de Riesgos', nivel: 'tecnico', duracionMeses: 12, dominio: 'sst' },
  { id: 'tecnico-estetica', name: 'Técnico en Estética y Belleza', nivel: 'tecnico', duracionMeses: 12, dominio: 'belleza' },
  { id: 'tecnico-salud-ocupacional', name: 'Técnico en Salud Ocupacional', nivel: 'tecnico', duracionMeses: 12, dominio: 'sst' },
  { id: 'tecnico-manipulacion-alimentos', name: 'Técnico en Registro y Manipulación de Alimentos', nivel: 'tecnico', duracionMeses: 12, dominio: 'gastronomia' },
  { id: 'tecnico-mecatronica', name: 'Técnico en Mecatrónica', nivel: 'tecnico', duracionMeses: 12, dominio: 'mecatronica' },
  { id: 'tecnico-calidad', name: 'Técnico en Calidad', nivel: 'tecnico', duracionMeses: 12, dominio: 'calidad' },
  { id: 'tecnico-gestion-documental', name: 'Técnico en Gestión Documental', nivel: 'tecnico', duracionMeses: 12, dominio: 'administracion' },
];

export const PROGRAMAS_SENA_ORDENADOS: ProgramaSena[] = [...PROGRAMAS_SENA].sort((a, b) =>
  a.name.localeCompare(b.name, 'es'),
);

export const DURACION_DEFAULT: Record<NivelPrograma, number> = {
  tecnico: 12,
  tecnologo: 24,
  especializacion_tecnologica: 12,
};

/** Normaliza el nombre (minúsculas + sin acentos). */
export function normalizarPrograma(texto: string): string {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
}

/** Resuelve el id de un programa por nombre o id, normalizando variantes. */
export function resolverIdPrograma(nombre: string | undefined | null): string | null {
  if (!nombre) return null;
  const norm = normalizarPrograma(nombre);
  for (const p of PROGRAMAS_SENA) {
    if (p.id === norm || norm.includes(normalizarPrograma(p.name))) return p.id;
  }
  return null;
}

/** Resuelve el dominio académico de un programa. */
export function resolverDominioPrograma(nombre: string | undefined | null): string | null {
  const id = resolverIdPrograma(nombre);
  if (!id) return null;
  const p = PROGRAMAS_SENA.find((x) => x.id === id);
  return p?.dominio ?? null;
}
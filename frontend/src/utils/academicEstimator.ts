/* ============================================================
   ESTIMADOR DE TRAYECTORIA · Elyron (espejo del backend)
   Calcula en el cliente la fecha estimada de finalización y los
   semestres restantes para mostrarlos en vivo durante el registro.
   El backend siempre es la fuente de verdad final; esto es solo
   una previsualización.
   ============================================================ */

export interface Estimacion {
  fecha: Date | null;
  etiqueta: string | null;
  semestresRestantes?: number;
}

const pad = (value: number): string => String(value).padStart(2, '0');

export const formatearEtiqueta = (date: Date): string =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;

const addMonths = (fecha: Date, meses: number): Date => {
  const result = new Date(fecha);
  const diaInicial = result.getDate();
  result.setMonth(result.getMonth() + meses);
  if (result.getDate() < diaInicial) {
    result.setDate(0);
  }
  return result;
};

const parseFecha = (fecha: string | Date): Date => {
  if (fecha instanceof Date) return fecha;
  if (typeof fecha === 'string') {
    const partes = fecha.split('-').map(Number);
    if (partes.length === 3 && partes.every((n) => !isNaN(n))) {
      return new Date(partes[0], (partes[1] || 1) - 1, partes[2] || 1);
    }
  }
  return new Date(fecha);
};

const MESES_POR_SEMESTRE = 6;

export const estimarSena = (
  fechaInicio: string | Date | null,
  duracionMeses: number | null,
): Estimacion => {
  const inicio = fechaInicio ? parseFecha(fechaInicio) : null;
  if (!inicio || isNaN(inicio.getTime()) || !duracionMeses || duracionMeses <= 0) {
    return { fecha: null, etiqueta: null };
  }
  const fecha = addMonths(inicio, duracionMeses);
  return { fecha, etiqueta: formatearEtiqueta(fecha) };
};

export const estimarUniversidad = (entrada: {
  anioIngreso: number | null;
  periodoIngreso?: number | null;
  semestreActual: number | null;
  totalSemestres: number | null;
}): Estimacion => {
  const total = entrada.totalSemestres || entrada.semestreActual || 0;
  const semestresRestantes = Math.max(total - (entrada.semestreActual ?? 0), 0);
  if (!entrada.anioIngreso || total <= 0) {
    return { fecha: null, etiqueta: null, semestresRestantes };
  }
  const mesInicio = entrada.periodoIngreso === 2 ? 6 : 0;
  const inicio = new Date(entrada.anioIngreso, mesInicio, 15);
  const fecha = addMonths(inicio, total * MESES_POR_SEMESTRE);
  return { fecha, etiqueta: formatearEtiqueta(fecha), semestresRestantes };
};

export const estimarColegio = (anioAcademico: number | null): Estimacion => {
  if (!anioAcademico) return { fecha: null, etiqueta: null };
  const fecha = new Date(anioAcademico, 10, 30);
  return { fecha, etiqueta: formatearEtiqueta(fecha) };
};
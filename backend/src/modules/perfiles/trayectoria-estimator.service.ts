import { Injectable } from '@nestjs/common';
import { MESES_POR_SEMESTRE } from './academic.constants';

const pad = (value: number): string => String(value).padStart(2, '0');

export const formatearFecha = (date: Date): string =>
  `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;

export const formatearFechaBD = (date: Date): string =>
  `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

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

const addMonths = (fecha: Date, meses: number): Date => {
  const result = new Date(fecha);
  const diaInicial = result.getDate();
  result.setMonth(result.getMonth() + meses);
  if (result.getDate() < diaInicial) {
    result.setDate(0);
  }
  return result;
};

export interface EstimacionUniversidad {
  fecha: Date;
  etiqueta: string;
  semestresRestantes: number;
}

@Injectable()
export class TrayectoriaEstimatorService {
  estimarSena(
    fechaInicio: string | Date,
    duracionMeses: number,
  ): { fecha: Date; etiqueta: string } {
    const inicio = parseFecha(fechaInicio);
    if (isNaN(inicio.getTime()) || !duracionMeses || duracionMeses <= 0) {
      return { fecha: null, etiqueta: null };
    }
    const fecha = addMonths(inicio, duracionMeses);
    return { fecha, etiqueta: formatearFecha(fecha) };
  }

  estimarUniversidad(entrada: {
    anioIngreso: number;
    periodoIngreso?: number;
    semestreActual: number;
    totalSemestres: number;
  }): EstimacionUniversidad {
    const total = entrada.totalSemestres || entrada.semestreActual;
    if (!entrada.anioIngreso || total <= 0) {
      return {
        fecha: null,
        etiqueta: null,
        semestresRestantes: Math.max(total - entrada.semestreActual, 0),
      };
    }
    const mesInicio = entrada.periodoIngreso === 2 ? 6 : 0;
    const inicio = new Date(entrada.anioIngreso, mesInicio, 15);
    const fecha = addMonths(inicio, total * MESES_POR_SEMESTRE);
    const semestresRestantes = Math.max(total - entrada.semestreActual, 0);
    return { fecha, etiqueta: formatearFecha(fecha), semestresRestantes };
  }

  estimarColegio(anioAcademico: number): {
    fecha: Date;
    etiqueta: string;
  } {
    if (!anioAcademico) {
      return { fecha: null, etiqueta: null };
    }
    const fecha = new Date(anioAcademico, 10, 30);
    return { fecha, etiqueta: formatearFecha(fecha) };
  }

  derivarEstado(entrada: {
    tipo: 'sena' | 'colegio' | 'universidad';
    estadoAcademico?: string;
    etapa?: string;
    fechaEstimada?: string | Date;
    certificado?: boolean;
  }): { estado: string; fechaSuperada: boolean } {
    const estado = entrada.estadoAcademico || 'en_formacion';
    const fechaEstimada = entrada.fechaEstimada
      ? parseFecha(entrada.fechaEstimada)
      : null;
    const fechaSuperada =
      fechaEstimada &&
      !isNaN(fechaEstimada.getTime()) &&
      fechaEstimada.getTime() < Date.now();

    const terminales = [
      'finalizado',
      'certificado',
      'graduado',
      'egresado',
      'retirado',
      'cancelado',
    ];
    if (terminales.includes(estado)) {
      return { estado, fechaSuperada };
    }
    if (entrada.etapa === 'certificacion' || entrada.certificado) {
      return {
        estado: entrada.tipo === 'colegio' ? 'finalizado' : 'certificado',
        fechaSuperada,
      };
    }
    if (entrada.etapa === 'finalizacion') {
      return { estado: 'finalizado', fechaSuperada };
    }
    return { estado, fechaSuperada };
  }
}

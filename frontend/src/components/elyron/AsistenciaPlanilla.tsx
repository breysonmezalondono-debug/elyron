import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarCheck, ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { ASISTENCIA_META, useAsistencia } from '../../model/asistencia';
import type { AsistenciaEstado } from '../../model/asistencia';

const EASE = [0.22, 1, 0.36, 1] as const;
const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const keyOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const CICLO: AsistenciaEstado[] = ['asistio', 'permiso', 'no_vino'];

const sigEstado = (actual: AsistenciaEstado | null): AsistenciaEstado => {
  if (!actual) return CICLO[0];
  const i = CICLO.indexOf(actual);
  return CICLO[(i + 1) % CICLO.length];
};

export interface AsistenciaPlanillaProps {
  grupoId: string;
  soloLectura?: boolean;
}

export const AsistenciaPlanilla = ({ grupoId, soloLectura = false }: AsistenciaPlanillaProps) => {
  const asistencia = useAsistencia();
  const grupo = asistencia.grupos.find((g) => g.id === grupoId);

  const hoy = new Date();
  const [viewYear, setViewYear] = useState(hoy.getFullYear());
  const [viewMonth, setViewMonth] = useState(hoy.getMonth());

  const diasMes = useMemo(() => {
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => new Date(viewYear, viewMonth, i + 1));
  }, [viewYear, viewMonth]);

  const resumen = useMemo(() => {
    const cuenta = { asistio: 0, permiso: 0, no_vino: 0, sin_marca: 0 };
    if (!grupo) return cuenta;
    const set = new Set(diasMes.map(keyOf));
    grupo.aprendices.forEach((a) => {
      const enMes = asistencia.registros.find(
        (r) => r.aprendizId === a.id && set.has(r.fecha),
      );
      if (!enMes) cuenta.sin_marca += 1;
      else if (enMes.estado === 'asistio') cuenta.asistio += 1;
      else if (enMes.estado === 'permiso') cuenta.permiso += 1;
      else cuenta.no_vino += 1;
    });
    return cuenta;
  }, [grupo, asistencia.registros, diasMes]);

  if (!grupo) {
    return (
      <div className="surface py-10 text-center text-sm font-semibold text-ink-400">
        Ficha no encontrada.
      </div>
    );
  }

  const moveMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const irAhoy = () => {
    setViewYear(hoy.getFullYear());
    setViewMonth(hoy.getMonth());
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            aria-label="Mes anterior"
            onClick={() => moveMonth(-1)}
            className="grid size-9 place-items-center rounded-full border border-line bg-white text-ink-500 transition hover:text-ink-900 hover:shadow-soft active:translate-y-px"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="min-w-36 text-center text-sm font-extrabold text-ink-900">
            {MONTHS[viewMonth]} {viewYear}
          </span>
          <button
            type="button"
            aria-label="Mes siguiente"
            onClick={() => moveMonth(1)}
            className="grid size-9 place-items-center rounded-full border border-line bg-white text-ink-500 transition hover:text-ink-900 hover:shadow-soft active:translate-y-px"
          >
            <ChevronRight size={16} />
          </button>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {(Object.keys(ASISTENCIA_META) as AsistenciaEstado[]).map((estado) => {
            const meta = ASISTENCIA_META[estado];
            return (
              <span
                key={estado}
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${meta.chip}`}
              >
                <span className={`size-2 rounded-full ${meta.dot}`} />
                {meta.label}
              </span>
            );
          })}
          <button
            type="button"
            onClick={irAhoy}
            className="rounded-full border border-line bg-white px-3 py-1 text-[11px] font-extrabold text-ink-600 transition hover:bg-canvas-deep"
          >
            Hoy
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-400">
        <span className="rounded-full bg-canvas-deep px-2.5 py-1 text-ink-500">
          {grupo.aprendices.length} aprendices
        </span>
        <span className="rounded-full bg-mint-50 px-2.5 py-1 text-mint-700">
          {resumen.asistio} asistieron
        </span>
        <span className="rounded-full bg-[#ffe8df] px-2.5 py-1 text-[#b4552d]">
          {resumen.permiso} permiso
        </span>
        <span className="rounded-full bg-red-50 px-2.5 py-1 text-red-600">
          {resumen.no_vino} faltas
        </span>
        <span className="rounded-full bg-canvas-deep px-2.5 py-1 text-ink-400">
          {resumen.sin_marca} sin marcar
        </span>
      </div>

      <div className="overflow-x-auto rounded-3xl ring-1 ring-line">
        <table className="w-full border-collapse bg-white text-sm">
          <thead>
            <tr className="bg-canvas-deep/60">
              <th className="sticky left-0 z-20 min-w-44 border-b border-r border-line bg-canvas-deep/60 px-4 py-3 text-left text-[11px] font-extrabold uppercase tracking-wider text-ink-500">
                Aprendiz
              </th>
              {diasMes.map((d) => {
                const key = keyOf(d);
                const isToday = key === keyOf(hoy);
                const esFin = d.getDay() === 0 || d.getDay() === 6;
                return (
                  <th
                    key={key}
                    className={`min-w-11 border-b border-line px-1 py-2 text-center ${
                      isToday ? 'bg-mint-50' : ''
                    } ${esFin ? 'opacity-45' : ''}`}
                  >
                    <span className="block font-mono text-[12px] font-extrabold text-ink-800">
                      {d.getDate()}
                    </span>
                    <span className="block text-[9px] font-extrabold uppercase text-ink-400">
                      {WEEKDAYS[d.getDay()]}
                    </span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {grupo.aprendices.map((a) => (
              <tr key={a.id} className="group/row">
                <td className="sticky left-0 z-10 border-b border-r border-line bg-white px-4 py-2">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-xs font-extrabold text-ink-900">{a.nombre}</p>
                      {a.rol === 'vocera' && (
                        <p className="text-[9px] font-extrabold uppercase tracking-wider text-amber-600">
                          Líder
                        </p>
                      )}
                    </div>
                  </div>
                </td>
                {diasMes.map((d) => {
                  const key = keyOf(d);
                  const estado = asistencia.registroDe(key, a.id);
                  const meta = estado ? ASISTENCIA_META[estado] : null;
                  const esFin = d.getDay() === 0 || d.getDay() === 6;
                  const isToday = key === keyOf(hoy);
                  const proximo = sigEstado(estado);
                  return (
                    <td
                      key={key}
                      className={`border-b border-line px-1 py-1.5 text-center ${esFin ? 'bg-canvas/40' : ''}`}
                    >
                      {soloLectura ? (
                        <span
                          aria-label={`${a.nombre} el ${d.getDate()} — ${meta ? meta.label : 'sin marcar'}`}
                          title={`${a.nombre} · ${d.getDate()} de ${MONTHS[viewMonth]}: ${meta ? meta.label : 'sin marcar'}`}
                          className={`relative grid size-9 place-items-center rounded-xl text-[10px] font-extrabold ${
                            isToday ? 'ring-2 ring-ink-300' : ''
                          } ${meta ? `${meta.celda} ring-1` : 'text-ink-300 ring-1 ring-transparent'}`}
                        >
                          {meta ? <span className={`size-2.5 rounded-full ${meta.dot}`} /> : '·'}
                        </span>
                      ) : (
                        <button
                          type="button"
                          aria-label={`${a.nombre} el ${d.getDate()} — ${meta ? meta.label : 'sin marcar'} (siguiente: ${ASISTENCIA_META[proximo].label})`}
                          onClick={() => asistencia.marcar(key, a.id, proximo)}
                          onContextMenu={(e) => {
                            e.preventDefault();
                            asistencia.limpiar(key, a.id);
                          }}
                          title={`${a.nombre} · ${d.getDate()} de ${MONTHS[viewMonth]}: ${
                            meta ? meta.label : 'sin marcar — clic para marcar'
                          }${meta ? ` (clic siguiente: ${ASISTENCIA_META[proximo].label})` : ''}`}
                          className={`relative grid size-9 place-items-center rounded-xl text-[10px] font-extrabold transition-all ${
                            isToday ? 'ring-2 ring-ink-300' : ''
                          } ${
                            meta
                              ? `${meta.celda} ring-1 hover:ring-ink-300`
                              : 'text-ink-300 ring-1 ring-transparent hover:bg-canvas-deep hover:text-ink-600'
                          }`}
                        >
                          {meta ? <span className={`size-2.5 rounded-full ${meta.dot}`} /> : '·'}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="flex items-center gap-1.5 text-[11px] font-semibold text-ink-400">
        <RotateCcw size={12} />
        {soloLectura
          ? 'Vista de solo lectura: así se ve la asistencia de tu ficha. El líder es quien la modifica.'
          : 'Clic en la celda para pasar de color; clic derecho para borrar. Los colores se ven en el calendario del aprendiz.'}
      </p>
    </div>
  );
};

export const AsistenciaPanelWrap = ({ grupoId, soloLectura = false }: AsistenciaPlanillaProps) => {
  const asistencia = useAsistencia();
  const grupo = asistencia.grupos.find((g) => g.id === grupoId);
  const hoy = new Date();
  const hoyKey = keyOf(hoy);
  const deHoy = asistencia.registros.filter((r) => r.fecha === hoyKey);

  return grupo ? (
    <motion.section
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45, ease: EASE }}
      className="surface p-6 sm:p-7"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="grid size-10 place-items-center rounded-2xl bg-mint-50 text-mint-600">
            <CalendarCheck size={18} />
          </span>
          <div>
            <h2 className="text-sm font-extrabold tracking-tight text-ink-950">
              Planilla de asistencia · Ficha {grupo.ficha}
            </h2>
            <p className="text-[11px] font-bold text-ink-400">
              {grupo.aprendices.length} aprendices · {deHoy.length} marcados hoy
            </p>
          </div>
        </div>
      </div>
      <AsistenciaPlanilla grupoId={grupoId} soloLectura={soloLectura} />
    </motion.section>
  ) : null;
};
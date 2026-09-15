import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle2,
  ClipboardCheck,
  Clock,
  PenLine,
  RotateCcw,
  TriangleAlert,
  X,
} from 'lucide-react';
import { ACTIVITY_TYPE_BADGE, ACTIVITY_TYPE_LABELS } from '../../model/activity';
import { useSalon } from '../../model/classroom';
import type { EntregaSalon } from '../../model/classroom';

const SUBMISSION_BADGE: Record<EntregaSalon['estado'], string> = {
  pending: 'bg-amber-50 text-amber-700 ring-amber-200',
  approved: 'bg-mint-50 text-mint-700 ring-mint-200',
  rejected: 'bg-red-50 text-red-600 ring-red-200',
  assigned: 'bg-canvas-deep text-ink-400 ring-line-strong',
};

const SUBMISSION_LABEL: Record<EntregaSalon['estado'], string> = {
  pending: 'Pendiente',
  approved: 'Calificada',
  rejected: 'Devuelta',
  assigned: 'Sin entregar',
};

type EstadoFiltro = 'pending' | 'approved' | 'rejected' | 'todas';

const FILTROS: { key: EstadoFiltro; label: string }[] = [
  { key: 'pending', label: 'Pendientes' },
  { key: 'rejected', label: 'Devueltas' },
  { key: 'approved', label: 'Calificadas' },
  { key: 'todas', label: 'Todas' },
];

export const CalificacionesDocenteView = () => {
  const salon = useSalon();
  const [claseFilter, setClaseFilter] = useState<string>('todas');
  const [statusFilter, setStatusFilter] = useState<EstadoFiltro>('pending');
  const [grading, setGrading] = useState<EntregaSalon | null>(null);
  const [gradeForm, setGradeForm] = useState({ grade: '', feedback: '' });

  const filas = useMemo(() => {
    return salon.entregas
      .flatMap((e): { entrega: EntregaSalon; trabajo: (typeof salon.trabajos)[number]; clase: (typeof salon.clases)[number] | undefined }[] => {
        if (e.estado === 'assigned') return [];
        const trabajo = salon.trabajos.find((t) => t.id === e.trabajoId);
        if (!trabajo) return [];
        const clase = salon.clases.find((c) => c.id === trabajo.claseId);
        return [{ entrega: e, trabajo, clase }];
      })
      .sort((a, b) => {
        if (a.entrega.estado !== b.entrega.estado) {
          const orden: Record<string, number> = { pending: 0, rejected: 1, approved: 2 };
          return orden[a.entrega.estado] - orden[b.entrega.estado];
        }
        return 0;
      });
  }, [salon]);

  const filtered = useMemo(
    () =>
      filas.filter((f) => {
        if (claseFilter !== 'todas' && f.clase?.id !== claseFilter) return false;
        if (statusFilter !== 'todas' && f.entrega.estado !== statusFilter) return false;
        return true;
      }),
    [filas, claseFilter, statusFilter],
  );

  const pendingCount = salon.entregas.filter((e) => e.estado === 'pending').length;
  const gradedCount = salon.entregas.filter((e) => e.estado === 'approved').length;
  const rejectedCount = salon.entregas.filter((e) => e.estado === 'rejected').length;

  const claseChips = useMemo(
    () => [
      { id: 'todas', label: 'Todas las clases' },
      ...salon.clases.map((c) => ({ id: c.id, label: `${c.name} · ${c.ficha}` })),
    ],
    [salon.clases],
  );

  const openGrading = (entrega: EntregaSalon) => {
    setGradeForm({
      grade: entrega.nota != null ? String(entrega.nota) : '',
      feedback: entrega.feedback ?? '',
    });
    setGrading(entrega);
  };

  const aprobar = (e: FormEvent) => {
    e.preventDefault();
    if (!grading) return;
    const parsed = Number(gradeForm.grade);
    if (Number.isNaN(parsed) || parsed < 0 || parsed > 5) return;
    salon.aprobarEntrega(grading.id, parsed, gradeForm.feedback);
    setGrading(null);
  };

  const devolver = () => {
    if (!grading) return;
    salon.devolverEntrega(grading.id, gradeForm.feedback);
    setGrading(null);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">
            Enseñanza · Como en Classroom
          </p>
          <h1 className="display mt-2 text-3xl text-ink-950 sm:text-4xl">
            Entregas por <span className="italic">calificar</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-ink-500">
            {pendingCount} pendientes · {gradedCount} calificadas · {rejectedCount} devueltas.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setStatusFilter('pending')}
          className={`btn-pill btn-pill-sm shrink-0 ${
            statusFilter === 'pending' ? 'btn-pill-mint' : 'btn-pill-paper'
          }`}
        >
          <PenLine size={14} />
          Calificar pendientes
        </button>
      </header>

      <div className="space-y-3">
        <div className="flex gap-1.5 overflow-x-auto rounded-full bg-white p-1.5 shadow-soft ring-1 ring-line w-fit max-w-full">
  {claseChips.map((chip) => (
    <button
      key={chip.id}
      type="button"
      onClick={() => setClaseFilter(chip.id)}
      className={`relative shrink-0 rounded-full px-4 py-2 text-[11px] transition-colors ${
        claseFilter === chip.id ? 'font-extrabold text-white' : 'font-bold text-ink-500 hover:text-ink-900'
      }`}
    >
      {claseFilter === chip.id && (
        <motion.span
          layoutId="grade-group-filter"
          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
          className="absolute inset-0 rounded-full bg-ink-900"
        />
      )}
      <span className="relative z-10 line-clamp-1">{chip.label}</span>
    </button>
  ))}
</div>

        <div className="flex gap-1.5 rounded-full bg-white p-1.5 shadow-soft ring-1 ring-line w-fit">
          {FILTROS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              onClick={() => setStatusFilter(filter.key)}
              className={`relative shrink-0 rounded-full px-4 py-2 text-[11px] transition-colors ${
                statusFilter === filter.key ? 'font-extrabold text-white' : 'font-bold text-ink-500 hover:text-ink-900'
              }`}
            >
              {statusFilter === filter.key && (
                <motion.span
                  layoutId="grade-status-filter"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  className="absolute inset-0 rounded-full bg-mint-600"
                />
              )}
              <span className="relative z-10">{filter.label}</span>
            </button>
          ))}
        </div>
      </div>

      <motion.div layout className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.map(({ entrega, trabajo, clase }) => (
            <motion.article
              key={entrega.id}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="surface flex flex-col gap-4 p-6 sm:flex-row sm:items-center"
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${ACTIVITY_TYPE_BADGE[trabajo.type]}`}
                  >
                    {ACTIVITY_TYPE_LABELS[trabajo.type]}
                  </span>
                  <span className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-400">
                    {clase?.ficha}
                  </span>
                  {entrega.late && (
                    <span className="inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 bg-red-50 text-red-500 ring-red-200">
                      <TriangleAlert size={11} />
                      Fuera de plazo
                    </span>
                  )}
                </div>
                <h2 className="mt-2 text-sm font-extrabold tracking-tight text-ink-950">
                  {entrega.aprendiz}
                </h2>
                <p className="mt-0.5 line-clamp-1 text-xs font-medium text-ink-500">
                  {trabajo.title}
                </p>
                <p className="mt-1.5 inline-flex items-center gap-1.5 text-[11px] font-semibold text-ink-400">
                  <Clock size={12} />
                  Entregó {entrega.versiones.length} versión{entrega.versiones.length !== 1 ? 'es' : ''} ·
                  última {entrega.versiones[entrega.versiones.length - 1]?.date}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-4 sm:flex-col sm:items-end sm:gap-2">
                {entrega.estado === 'approved' && entrega.nota != null ? (
                  <div className="flex flex-col items-start gap-1 sm:items-end">
                    <span className="rounded-full bg-canvas-deep px-3 py-1.5 font-mono text-sm font-extrabold text-ink-800">
                      {entrega.nota.toFixed(1)}
                    </span>
                    {entrega.feedback && (
                      <p className="max-w-56 truncate text-[11px] font-medium italic text-ink-400">
                        “{entrega.feedback}”
                      </p>
                    )}
                  </div>
                ) : entrega.estado === 'pending' ? (
                  <button
                    type="button"
                    onClick={() => openGrading(entrega)}
                    className="btn-pill btn-pill-ink btn-pill-sm"
                  >
                    <PenLine size={13} />
                    Calificar
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openGrading(entrega)}
                    className="btn-pill btn-pill-paper btn-pill-sm"
                  >
                    <PenLine size={13} />
                    Revisar
                  </button>
                )}
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${SUBMISSION_BADGE[entrega.estado]}`}
                >
                  {entrega.estado === 'approved' && <CheckCircle2 size={11} />}
                  {SUBMISSION_LABEL[entrega.estado]}
                </span>
              </div>
            </motion.article>
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <section className="surface flex flex-col items-center gap-4 p-10 text-center">
          <span className="grid size-14 place-items-center rounded-[20px] bg-mint-50 text-mint-600 shadow-lift">
            <ClipboardCheck size={26} />
          </span>
          <div className="space-y-1.5">
            <h2 className="text-base font-extrabold tracking-tight text-ink-950">Nada por aquí</h2>
            <p className="mx-auto max-w-xs text-sm font-medium leading-relaxed text-ink-500">
              No hay entregas con estos filtros. Cambia de clase o de estado.
            </p>
          </div>
        </section>
      )}

      <AnimatePresence>
        {grading && (
          <motion.div
            key="grade-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-ink-950/30 p-4 backdrop-blur-sm"
            onClick={() => setGrading(null)}
          >
            <motion.form
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onSubmit={aprobar}
              onClick={(e) => e.stopPropagation()}
              className="elevated-pop w-full max-w-md rounded-[28px] bg-white p-7"
            >
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="display text-2xl text-ink-950">
                    Calificar a {grading.aprendiz.split(' ')[0]}
                  </h2>
                  <p className="mt-1 line-clamp-1 text-xs font-semibold text-ink-400">
                    {salon.trabajos.find((t) => t.id === grading.trabajoId)?.title}
                  </p>
                </div>
                <button
                  type="button"
                  aria-label="Cerrar"
                  onClick={() => setGrading(null)}
                  className="grid size-8 place-items-center rounded-full text-ink-400 transition hover:bg-canvas-deep hover:text-ink-800"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="mt-5 space-y-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="grade-value" className="text-xs font-extrabold uppercase tracking-wider text-ink-500">
                    Nota (0.0 – 5.0)
                  </label>
                  <input
                    id="grade-value"
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={5}
                    step={0.1}
                    className="input"
                    value={gradeForm.grade}
                    onChange={(e) => setGradeForm({ ...gradeForm, grade: e.target.value })}
                    placeholder="4.5"
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="grade-feedback" className="text-xs font-extrabold uppercase tracking-wider text-ink-500">
                    Retroalimentación
                  </label>
                  <textarea
                    id="grade-feedback"
                    className="input resize-none"
                    rows={4}
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm({ ...gradeForm, feedback: e.target.value })}
                    placeholder="Qué hizo bien y qué debe reforzar…"
                  />
                </div>
              </div>

              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={devolver}
                  className="btn-pill btn-pill-paper"
                >
                  <RotateCcw size={15} />
                  Devolver
                </button>
                <button
                  type="submit"
                  disabled={!gradeForm.grade}
                  className="btn-pill btn-pill-mint disabled:cursor-not-allowed"
                >
                  <CheckCircle2 size={15} />
                  Aprobar
                </button>
              </div>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
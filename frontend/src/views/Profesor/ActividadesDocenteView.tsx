import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CalendarDays, ClipboardList, Plus, Users } from 'lucide-react';
import { X } from 'lucide-react';
import { ACTIVITY_TYPE_BADGE, ACTIVITY_TYPE_LABELS } from '../../model/activity';
import type { AcademicActivityType } from '../../model/activity';
import { useSalon } from '../../model/classroom';

const ESTADO_BADGE: Record<string, string> = {
  Publicada: 'bg-mint-50 text-mint-700 ring-mint-200',
  Programada: 'bg-amber-50 text-amber-700 ring-amber-200',
  Cerrada: 'bg-canvas-deep text-ink-400 ring-line-strong',
};

const ESTADO_LABEL: Record<string, string> = {
  publicada: 'Publicada',
  programada: 'Programada',
  cerrada: 'Cerrada',
};

const emptyForm = {
  title: '',
  description: '',
  type: 'taller' as AcademicActivityType,
  claseId: '',
  resultado: '',
  dueDate: '',
};

export const ActividadesDocenteView = () => {
  const salon = useSalon();
  const [claseFilter, setClaseFilter] = useState<string>('todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);

  const trabajos = useMemo(
    () =>
      [...salon.trabajos].sort((a, b) => a.fechaLimite.localeCompare(b.fechaLimite)),
    [salon.trabajos],
  );

  const filtered = useMemo(
    () =>
      claseFilter === 'todas' ? trabajos : trabajos.filter((t) => t.claseId === claseFilter),
    [trabajos, claseFilter],
  );

  const entregadasPorTrabajo = useMemo(() => {
    const mapa: Record<string, number> = {};
    salon.entregas.forEach((e) => {
      if (e.estado !== 'assigned') mapa[e.trabajoId] = (mapa[e.trabajoId] ?? 0) + 1;
    });
    return mapa;
  }, [salon.entregas]);

  const claseChips = useMemo(
    () => [
      { id: 'todas', label: 'Todas las clases' },
      ...salon.clases.map((c) => ({ id: c.id, label: `${c.name} · ${c.ficha}` })),
    ],
    [salon.clases],
  );

  const openModal = () => {
    setForm({ ...emptyForm, claseId: salon.clases[0]?.id ?? '' });
    setModalOpen(true);
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.dueDate || !form.claseId) return;
    salon.crearTrabajo({
      title: form.title,
      description: form.description,
      type: form.type,
      claseId: form.claseId,
      resultado: form.resultado || 'Resultado de aprendizaje del programa',
      fechaLimite: form.dueDate,
    });
    setModalOpen(false);
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">
            Enseñanza · Como en Classroom
          </p>
          <h1 className="display mt-2 text-3xl text-ink-950 sm:text-4xl">
            Actividades y <span className="italic">tareas</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-ink-500">
            Publica trabajos en tus clases y los aprendices los verán en sus evidencias.
          </p>
        </div>
        <button type="button" onClick={openModal} className="btn-pill btn-pill-ink btn-pill-sm shrink-0">
          <Plus size={14} />
          Crear tarea
        </button>
      </header>

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
          layoutId="act-filter"
          transition={{ type: 'spring', stiffness: 420, damping: 36 }}
          className="absolute inset-0 rounded-full bg-ink-900"
        />
      )}
      <span className="relative z-10 line-clamp-1">{chip.label}</span>
    </button>
  ))}
</div>

      <motion.div layout className="space-y-4">
        <AnimatePresence mode="popLayout">
          {filtered.map((trabajo) => {
            const clase = salon.clases.find((c) => c.id === trabajo.claseId);
            const entregas = entregadasPorTrabajo[trabajo.id] ?? 0;
            return (
              <motion.article
                key={trabajo.id}
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
                      {clase?.ficha ?? trabajo.claseId}
                    </span>
                  </div>
                  <h2 className="mt-2 text-sm font-extrabold tracking-tight text-ink-950">
                    {trabajo.title}
                  </h2>
                  <p className="mt-0.5 line-clamp-1 text-xs font-medium text-ink-500">
                    {trabajo.description || 'Sin descripción'}
                  </p>
                  <p className="mt-1.5 line-clamp-1 text-[11px] font-semibold text-ink-400">
                    Clase: {clase?.name ?? '—'} · Resultado: {trabajo.resultado}
                  </p>
                </div>

                <div className="flex shrink-0 items-center gap-5 sm:flex-col sm:items-end sm:gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-canvas-deep px-3 py-1.5 text-[11px] font-extrabold text-ink-600">
                    <CalendarDays size={12} />
                    Vence {trabajo.fechaLimite}
                  </span>
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${ESTADO_BADGE[ESTADO_LABEL[trabajo.estado]]}`}
                  >
                    {ESTADO_LABEL[trabajo.estado]}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-ink-400">
                    <Users size={12} />
                    {entregas} entrega{entregas !== 1 ? 's' : ''}
                  </span>
                </div>
              </motion.article>
            );
          })}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <section className="surface flex flex-col items-center gap-3 p-10 text-center">
          <ClipboardList size={28} className="text-ink-300" />
          <p className="text-sm font-semibold text-ink-500">
            Sin trabajos en esta clase todavía. Publica el primero con “Crear tarea”.
          </p>
        </section>
      )}

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-ink-950/30 p-4 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.form
              initial={{ opacity: 0, y: 24, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.96 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              onSubmit={handleSubmit}
              onClick={(e) => e.stopPropagation()}
              className="elevated-pop w-full max-w-md rounded-[28px] bg-white p-7"
            >
              <div className="flex items-start justify-between">
                <h2 className="display text-2xl text-ink-950">Crear tarea</h2>
                <button
                  type="button"
                  aria-label="Cerrar"
                  onClick={() => setModalOpen(false)}
                  className="grid size-8 place-items-center rounded-full text-ink-400 transition hover:bg-canvas-deep hover:text-ink-800"
                >
                  <X size={15} />
                </button>
              </div>

              <div className="mt-5 space-y-3.5">
                <div className="space-y-1.5">
                  <label htmlFor="act-title" className="text-xs font-extrabold uppercase tracking-wider text-ink-500">
                    Nombre de la tarea
                  </label>
                  <input
                    id="act-title"
                    className="input"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    placeholder="Taller — Modelado de entidades"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="act-desc" className="text-xs font-extrabold uppercase tracking-wider text-ink-500">
                    Instrucciones
                  </label>
                  <textarea
                    id="act-desc"
                    className="input resize-none"
                    rows={3}
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    placeholder="Qué deben hacer los aprendices y con qué criterios…"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label htmlFor="act-type" className="text-xs font-extrabold uppercase tracking-wider text-ink-500">
                      Tipo
                    </label>
                    <select
                      id="act-type"
                      className="input"
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as AcademicActivityType })}
                    >
                      {Object.entries(ACTIVITY_TYPE_LABELS).map(([value, label]) => (
                        <option key={value} value={value}>
                          {label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label htmlFor="act-due" className="text-xs font-extrabold uppercase tracking-wider text-ink-500">
                      Fecha límite
                    </label>
                    <input
                      id="act-due"
                      type="date"
                      className="input"
                      value={form.dueDate}
                      onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="act-clase" className="text-xs font-extrabold uppercase tracking-wider text-ink-500">
                    Clase (curso)
                  </label>
                  <select
                    id="act-clase"
                    className="input"
                    value={form.claseId}
                    onChange={(e) => setForm({ ...form, claseId: e.target.value })}
                  >
                    {salon.clases.map((clase) => (
                      <option key={clase.id} value={clase.id}>
                        {clase.name} · {clase.ficha}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="act-res" className="text-xs font-extrabold uppercase tracking-wider text-ink-500">
                    Resultado de aprendizaje
                  </label>
                  <input
                    id="act-res"
                    className="input"
                    value={form.resultado}
                    onChange={(e) => setForm({ ...form, resultado: e.target.value })}
                    placeholder="Resultado o contenido a evaluar…"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={!form.title || !form.dueDate || !form.claseId}
                className="btn-pill btn-pill-mint mt-5 w-full disabled:cursor-not-allowed"
              >
                <ClipboardList size={15} />
                Publicar tarea
              </button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
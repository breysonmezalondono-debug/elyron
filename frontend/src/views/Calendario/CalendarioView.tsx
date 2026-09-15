import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { CalendarDays, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Elir } from '../../components/elyron/Elir';
import { CALENDAR_EVENTS } from '../../model/mock/calendarData';
import type { CalendarEventType } from '../../model/mock/calendarData';
import { ASISTENCIA_META, currentUserId, useAsistencia } from '../../model/asistencia';
import type { AsistenciaEstado } from '../../model/asistencia';

const EASE = [0.22, 1, 0.36, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const cascade: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

const TYPE_STYLE: Record<CalendarEventType, string> = {
  Entrega: 'bg-red-50 text-red-600 ring-red-200',
  Reunión: 'bg-ink-100 text-ink-700 ring-line-strong',
  Taller: 'bg-mint-50 text-mint-700 ring-mint-200',
};

const DOT_COLOR: Record<CalendarEventType, string> = {
  Entrega: 'bg-red-500',
  Reunión: 'bg-ink-700',
  Taller: 'bg-mint-500',
};

const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];
const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

const toDate = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
};

const keyOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const CalendarioView = () => {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selected, setSelected] = useState(keyOf(today));

  const asistencia = useAsistencia();
  const miId = currentUserId();
  const miMap = useMemo(() => {
    const map: Record<string, AsistenciaEstado> = {};
    asistencia.registrosDe(miId).forEach((r) => {
      map[r.fecha] = r.estado;
    });
    return map;
  }, [asistencia.registros, miId]);

  const miMeta = miMap[selected]
    ? ASISTENCIA_META[miMap[selected]]
    : null;

  const eventsByDate = useMemo(() => {
    const map: Record<string, typeof CALENDAR_EVENTS> = {};
    for (const ev of CALENDAR_EVENTS) {
      map[ev.date] = [...(map[ev.date] ?? []), ev];
    }
    return map;
  }, []);

  const monthSummary = useMemo(() => {
    const inMonth = CALENDAR_EVENTS.filter((ev) => {
      const d = toDate(ev.date);
      return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
    });
    return {
      total: inMonth.length,
      entregas: inMonth.filter((ev) => ev.type === 'Entrega').length,
    };
  }, [viewYear, viewMonth]);

  const grid = useMemo(() => {
    const first = new Date(viewYear, viewMonth, 1);
    const offset = (first.getDay() + 6) % 7;
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells: (Date | null)[] = [];
    for (let i = 0; i < offset; i += 1) cells.push(null);
    for (let d = 1; d <= daysInMonth; d += 1) cells.push(new Date(viewYear, viewMonth, d));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [viewYear, viewMonth]);

  const upcoming = useMemo(
    () => [...CALENDAR_EVENTS].sort((a, b) => a.date.localeCompare(b.date)),
    [],
  );

  const pendientes = useMemo(() => {
    const hoyKey = keyOf(today);
    return CALENDAR_EVENTS
      .filter((ev) => ev.type === 'Entrega' && ev.date >= hoyKey)
      .sort((a, b) => a.date.localeCompare(b.date));
  }, []);

  const diasRestantes = (fecha: string): number => {
    const d = toDate(fecha);
    const diff = Math.round((d.getTime() - today.getTime()) / 86400000);
    return Math.max(diff, 0);
  };

  const moveMonth = (delta: number) => {
    const next = new Date(viewYear, viewMonth + delta, 1);
    setViewYear(next.getFullYear());
    setViewMonth(next.getMonth());
  };

  const selectedEvents = eventsByDate[selected] ?? [];

  return (
    <motion.div
      variants={cascade}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-5xl space-y-7"
    >
      <motion.header variants={rise}>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">Agenda</p>
        <h1 className="display mt-2 text-3xl text-ink-950 sm:text-4xl">
          Calendario <span className="italic">académico</span>
        </h1>
        <p className="mt-2 text-sm font-medium text-ink-500">
          {monthSummary.total > 0
            ? `${monthSummary.total} eventos este mes, ${monthSummary.entregas} de ellos con entrega.`
            : 'Entregas, comités y talleres en un solo lugar.'}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-ink-400">
            Tu asistencia
          </span>
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
        </div>
      </motion.header>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        {pendientes.length > 0 && (
          <div className="mb-1 flex flex-wrap gap-2">
            {pendientes.map((ev) => {
              const d = diasRestantes(ev.date);
              const urgente = d <= 2;
              return (
                <span
                  key={ev.id}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider ring-1 ${
                    urgente ? 'bg-red-50 text-red-600 ring-red-200' : 'bg-amber-50 text-amber-700 ring-amber-200'
                  }`}
                >
                  <CalendarDays size={12} />
                  {urgente
                    ? `Quedan ${d === 0 ? 'horas' : `${d} día${d !== 1 ? 's' : ''}`} para "${ev.title}"`
                    : `${ev.title} · ${d} día${d !== 1 ? 's' : ''}`}
                </span>
              );
            })}
          </div>
        )}

        <motion.section variants={rise} className="surface p-6">
          <div className="flex items-center justify-between">
            <h2 className="display text-xl text-ink-950 sm:text-2xl">
              {MONTHS[viewMonth]} <span className="text-ink-400">{viewYear}</span>
            </h2>
            <div className="flex gap-1.5">
              <button
                type="button"
                aria-label="Mes anterior"
                onClick={() => moveMonth(-1)}
                className="grid size-9 place-items-center rounded-full border border-line bg-white text-ink-500 transition-all hover:text-ink-900 hover:shadow-soft active:translate-y-px"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                type="button"
                aria-label="Mes siguiente"
                onClick={() => moveMonth(1)}
                className="grid size-9 place-items-center rounded-full border border-line bg-white text-ink-500 transition-all hover:text-ink-900 hover:shadow-soft active:translate-y-px"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-7 gap-1.5 text-center">
            {WEEKDAYS.map((w) => (
              <span key={w} className="pb-1.5 text-[11px] font-extrabold uppercase tracking-wider text-ink-400">
                {w}
              </span>
            ))}
            {grid.map((date, idx) => {
              if (!date) return <span key={`empty-${idx}`} />;
              const key = keyOf(date);
              const dayEvents = eventsByDate[key] ?? [];
              const miEstado = miMap[key];
              const miMeta = miEstado ? ASISTENCIA_META[miEstado] : null;
              const isToday = key === keyOf(today);
              const isSelected = key === selected;

              let cellClass =
                'relative flex aspect-square flex-col items-center justify-center rounded-2xl text-sm transition-colors ';
              if (isSelected) cellClass += 'font-extrabold text-white ';
              else if (miMeta) cellClass += `font-bold ${miMeta.celda} `;
              else if (dayEvents.length > 0) cellClass += 'font-bold text-ink-900 ring-1 ring-mint-300 hover:bg-canvas-deep ';
              else if (isToday) cellClass += 'font-extrabold text-mint-700 ring-1 ring-mint-300 ';
              else cellClass += 'font-semibold text-ink-500 hover:bg-canvas-deep ';

              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setSelected(key)}
                  className={cellClass}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="cal-selected"
                      transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                      className="absolute inset-0 rounded-2xl bg-ink-900 shadow-lift"
                    />
                  )}
                  <span className="relative z-10">{date.getDate()}</span>
                  <span className="absolute bottom-1.5 z-10 flex gap-0.5">
                    {miMeta && (
                      <span
                        className={`size-1.5 rounded-full ${miMeta.dot} ${isSelected ? 'ring-1 ring-white/70' : ''}`}
                      />
                    )}
                    {dayEvents.slice(0, 3 - (miMeta ? 1 : 0)).map((ev) => (
                      <span
                        key={ev.id}
                        className={`size-1.5 rounded-full ${isSelected ? 'bg-white' : DOT_COLOR[ev.type]}`}
                      />
                    ))}
                  </span>
                </button>
              );
            })}
          </div>
        </motion.section>

        <motion.section variants={rise} className="surface h-fit p-6">
          <h2 className="flex items-center gap-2 text-sm font-extrabold tracking-tight">
            <CalendarDays size={16} className="text-mint-600" />
            Eventos del día
          </h2>
          <AnimatePresence mode="wait">
            <motion.div
              key={selected}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.22 }}
              className="mt-4 space-y-3"
            >
              <p className="font-mono text-xs font-bold text-ink-400">{selected}</p>
              {miMeta && (
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-wider ring-1 ${miMeta.chip}`}
                >
                  <span className={`size-2 rounded-full ${miMeta.dot}`} />
                  {miMeta.label} · registrado por tu instructor
                </span>
              )}
              {selectedEvents.length === 0 && !miMeta && (
                <div className="flex flex-col items-center gap-2.5 px-4 py-6 text-center">
                  <Elir size={48} mood="curious" />
                  <p className="display text-sm leading-snug text-ink-500">
                    Día despejado. ¿Y si adelantas la{' '}
                    <span className="italic">siguiente entrega</span>?
                  </p>
                </div>
              )}
              {selectedEvents.map((ev) => (
                <article
                  key={ev.id}
                  className="rounded-2xl border border-line bg-white p-4 shadow-soft transition-transform ease-deluxe hover:-translate-y-0.5"
                >
                  <span className={`inline-block rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${TYPE_STYLE[ev.type]}`}>
                    {ev.type}
                  </span>
                  <h3 className="mt-2.5 text-sm font-extrabold leading-snug">{ev.title}</h3>
                  <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink-400">
                    <MapPin size={12} />
                    {ev.location}
                  </p>
                </article>
              ))}
            </motion.div>
          </AnimatePresence>

          <div className="mt-6 border-t border-line pt-4">
            <p className="mb-3 text-[10px] font-extrabold uppercase tracking-wider text-ink-400">
              Próximos eventos
            </p>
            <ul className="space-y-2">
              {upcoming.map((ev) => (
                <li key={ev.id}>
                  <button
                    type="button"
                    onClick={() => {
                      setSelected(ev.date);
                      const d = toDate(ev.date);
                      setViewYear(d.getFullYear());
                      setViewMonth(d.getMonth());
                    }}
                    className="flex w-full items-center gap-3 rounded-2xl px-2 py-2 text-left transition-colors hover:bg-canvas-deep/60"
                  >
                    <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-canvas-deep font-mono text-[11px] font-extrabold leading-none text-ink-600">
                      {ev.date.slice(8)}
                      <span className="text-[9px] font-bold text-ink-400">
                        {MONTHS[Number(ev.date.slice(5, 7)) - 1].slice(0, 3)}
                      </span>
                    </span>
                    <span className="min-w-0 truncate text-xs font-bold text-ink-700">{ev.title}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </motion.section>
      </div>
    </motion.div>
  );
};

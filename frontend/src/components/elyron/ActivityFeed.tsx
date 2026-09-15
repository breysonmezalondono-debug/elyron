import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Award,
  BriefcaseBusiness,
  Check,
  ClipboardList,
  FileUp,
  Flag,
  HelpCircle,
  Inbox,
  Megaphone,
  UserPlus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { AcademicActivityType } from '../../model/activity';
import { useAuth } from '../../context/useAuth';
import { teacherBasePath } from '../../model/navigation';

export type FeedActivityType =
  | 'task'
  | 'notice'
  | 'grade'
  | 'job'
  | 'submission'
  | 'question'
  | 'user'
  | 'incident';

export interface FeedItem {
  id: string;
  type: FeedActivityType;
  title: string;
  meta: string;
  time: string;
  to: string;
  activity?: AcademicActivityType;
}

const TYPE_META: Record<FeedActivityType, { icon: LucideIcon; tile: string }> = {
  task: { icon: ClipboardList, tile: 'bg-amber-100 text-amber-600' },
  notice: { icon: Megaphone, tile: 'bg-ink-100 text-ink-700' },
  grade: { icon: Award, tile: 'bg-violet-100 text-violet-600' },
  job: { icon: BriefcaseBusiness, tile: 'bg-mint-100 text-mint-700' },
  submission: { icon: FileUp, tile: 'bg-mint-100 text-mint-700' },
  question: { icon: HelpCircle, tile: 'bg-amber-100 text-amber-600' },
  user: { icon: UserPlus, tile: 'bg-mint-100 text-mint-700' },
  incident: { icon: Flag, tile: 'bg-red-50 text-red-500' },
};

const LEARNER_ITEMS: FeedItem[] = [
  { id: 'a1', type: 'task', title: 'Entregar Taller 2 — Diagramas ER', meta: 'Bases de Datos · vence mañana', time: '09:12', to: '/evidencias', activity: 'taller' },
  { id: 'a2', type: 'notice', title: 'Comité de seguimiento ADSI', meta: 'Convocatoria para el viernes 28', time: '08:45', to: '/calendario' },
  { id: 'a3', type: 'grade', title: 'Evidencia calificada: Taller 1', meta: 'Nota 4.8 / 5.0 · Excelente modelado', time: 'Ayer', to: '/evidencias', activity: 'taller' },
  { id: 'a4', type: 'task', title: 'Lección: bucles while', meta: 'Lógica · 5 min · +50 XP', time: 'Ayer', to: '/lecciones', activity: 'quiz' },
  { id: 'a5', type: 'job', title: 'Nueva oferta en la bolsa de empleo', meta: 'TechSolutions busca aprendiz React', time: 'Hace 2 días', to: '/ofertas' },
  { id: 'a6', type: 'grade', title: 'Retroalimentación de inglés', meta: 'Speaking Nivel II · 92/100', time: 'Hace 2 días', to: '/academico' },
];

interface ActivityFeedProps {
  title?: string;
  items?: FeedItem[];
}

export const ActivityFeed = ({ title = 'Actividad reciente', items = LEARNER_ITEMS }: ActivityFeedProps) => {
  const navigate = useNavigate();
  const { activeRole } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState<Record<string, boolean>>({ a3: true });

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, [showAll]);

  const filtered = showAll ? items : items.slice(0, 4);

  return (
    <section className="surface p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-extrabold tracking-tight">{title}</h3>
        <button
          type="button"
          onClick={() => setShowAll((v) => !v)}
          className="text-xs font-extrabold text-ink-400 transition-colors hover:text-mint-600"
        >
          {showAll ? 'Ver menos' : 'Ver todo'}
        </button>
      </div>

      <div className="mt-4 space-y-1.5">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="skeleton h-[64px] w-full" />)
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-2 py-12 text-ink-300">
            <Inbox size={32} strokeWidth={1.6} />
            <p className="text-xs font-bold text-ink-400">Sin actividades por aquí</p>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.ul
              key={showAll ? 'all' : 'top'}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-1"
            >
              {filtered.map((item) => {
                const { icon: Icon, tile } = TYPE_META[item.type];
                const isDone = !!done[item.id];
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => navigate(portalAware(item.to, activeRole))}
                      onAuxClick={(e) => e.preventDefault()}
                      className="flex w-full items-center gap-3 rounded-2xl border border-transparent p-3 text-left transition hover:border-line hover:bg-canvas-deep/50"
                    >
                      {item.type === 'task' ? (
                        <span
                          role="checkbox"
                          aria-checked={isDone}
                          tabIndex={0}
                          onClick={(e) => {
                            e.stopPropagation();
                            setDone((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                          }}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.stopPropagation();
                              setDone((prev) => ({ ...prev, [item.id]: !prev[item.id] }));
                            }
                          }}
                          className={`grid size-5 shrink-0 cursor-pointer place-items-center rounded-md border-2 transition-colors ${
                            isDone ? 'border-mint-500 bg-mint-500' : 'border-line-strong'
                          }`}
                        >
                          {isDone && (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: 'spring', bounce: 0.6, duration: 0.4 }}
                            >
                              <Check size={12} strokeWidth={3.5} className="text-white" />
                            </motion.span>
                          )}
                        </span>
                      ) : (
                        <span className={`grid size-9 shrink-0 place-items-center rounded-full ${tile}`}>
                          <Icon size={15} strokeWidth={2.2} />
                        </span>
                      )}

                      <span className="min-w-0 flex-1">
                        <span
                          className={`block truncate text-sm ${
                            isDone ? 'font-medium text-ink-400 line-through' : 'font-bold text-ink-800'
                          }`}
                        >
                          {item.title}
                        </span>
                        <span className="block truncate text-xs font-medium text-ink-400">{item.meta}</span>
                      </span>

                      <span className="shrink-0 text-[11px] font-bold text-ink-300">{item.time}</span>
                    </button>
                  </li>
                );
              })}
            </motion.ul>
          </AnimatePresence>
        )}
      </div>
    </section>
  );
};

/** Reescribe rutas docentes compartidas al prefijo del portal del rol activo. */
const portalAware = (to: string, roleKey?: string | null): string => {
  if (to.startsWith('/profesor')) {
    return `${teacherBasePath(roleKey)}${to.slice('/profesor'.length)}`;
  }
  return to;
};

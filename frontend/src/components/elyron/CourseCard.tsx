import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Eye,
  FileText,
  BellOff,
  MoreVertical,
  Plus,
} from 'lucide-react';
import { IconTile } from './IconTile';
import type { IconTileVariant } from './IconTile';

type CourseColor = 'mint' | 'ink' | 'amber' | 'violet';
type CourseStatus = 'activo' | 'nuevo' | 'finalizado';

export interface Course {
  id: number;
  title: string;
  subtitle: string;
  instructor: string;
  progress: number;
  color: CourseColor;
  status: CourseStatus;
}

const VARIANT_BY_COLOR: Record<CourseColor, IconTileVariant> = {
  mint: 'mint',
  ink: 'ink',
  amber: 'amber',
  violet: 'violet',
};

const BAR_COLORS: Record<CourseColor, string> = {
  mint: '#22c55e',
  ink: '#18181b',
  amber: '#f59e0b',
  violet: '#8b5cf6',
};

const BLOB_COLORS: Record<CourseColor, string> = {
  mint: 'rgba(34, 197, 94, 0.14)',
  ink: 'rgba(24, 24, 27, 0.08)',
  amber: 'rgba(245, 158, 11, 0.14)',
  violet: 'rgba(139, 92, 246, 0.12)',
};

const STATUS_META: Record<CourseStatus, { label: string; className: string }> = {
  activo: { label: 'En curso', className: 'bg-mint-50 text-mint-700 ring-mint-200' },
  nuevo: { label: 'Nuevo', className: 'bg-amber-50 text-amber-700 ring-amber-200' },
  finalizado: { label: 'Finalizado', className: 'bg-canvas-deep text-ink-500 ring-line-strong' },
};

const QUICK_ACTIONS = [
  { id: 'view', label: 'Ver lección interactiva', icon: Eye },
  { id: 'syllabus', label: 'Descargar syllabus', icon: FileText },
  { id: 'mute', label: 'Silenciar avisos', icon: BellOff },
];

interface CourseCardProps {
  course: Course;
}

export const CourseCard = ({ course }: CourseCardProps) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [hovered, setHovered] = useState(false);
  const status = STATUS_META[course.status];
  const shownProgress = hovered ? Math.min(course.progress + 6, 100) : course.progress;

  return (
    <motion.article
      whileHover={{ y: -6 }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      transition={{ type: 'spring', stiffness: 300, damping: 24 }}
      className="surface group relative flex cursor-pointer flex-col p-5 transition-shadow duration-300 ease-deluxe hover:shadow-lift"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -bottom-8 -right-8 size-28 rounded-full blur-xl"
        style={{ backgroundColor: BLOB_COLORS[course.color] }}
      />

      <Link to="/lecciones" className="relative block" onClick={() => setMenuOpen(false)}>
        <div className="flex items-start justify-between gap-3">
          <IconTile icon={BookOpen} variant={VARIANT_BY_COLOR[course.color]} />
          <motion.span
            animate={hovered ? { scale: [1, 1.1, 1] } : { scale: 1 }}
            transition={{ duration: 0.4 }}
            className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${status.className}`}
          >
            {status.label}
          </motion.span>
        </div>

        <h3 className="mt-3.5 truncate text-[15px] font-extrabold tracking-tight">{course.title}</h3>
        <p className="truncate text-sm font-medium text-ink-500">{course.subtitle}</p>

        <div className="mt-auto pt-4">
          <p className="display text-[30px] leading-none text-ink-950">{shownProgress}%</p>
          <div className="mt-2.5 h-1.5 w-full overflow-hidden rounded-full bg-canvas-deep">
            <motion.div
              className="h-full rounded-full"
              style={{ backgroundColor: BAR_COLORS[course.color] }}
              initial={{ width: 0 }}
              animate={{ width: `${shownProgress}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 22 }}
            />
          </div>
        </div>
      </Link>

      <button
        type="button"
        aria-label="Acciones rápidas"
        onClick={(e) => {
          e.preventDefault();
          setMenuOpen((open) => !open);
        }}
        className="absolute right-3 top-3 z-10 grid size-8 place-items-center rounded-full text-ink-400 opacity-0 transition hover:bg-canvas-deep hover:text-ink-700 focus:opacity-100 group-hover:opacity-100"
      >
        <MoreVertical size={16} />
      </button>

      <AnimatePresence>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMenuOpen(false)} />
            <motion.ul
              initial={{ opacity: 0, y: -6, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.96 }}
              transition={{ duration: 0.16, ease: 'easeOut' }}
              className="absolute right-2 top-12 z-40 w-52 origin-top-right overflow-hidden rounded-2xl border border-line bg-white p-1.5 shadow-pop"
            >
              {QUICK_ACTIONS.map(({ id, label, icon: Icon }) => (
                <li key={id}>
                  <Link
                    to="/lecciones"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs font-bold text-ink-600 transition hover:bg-canvas-deep/70"
                  >
                    <Icon size={14} />
                    {label}
                  </Link>
                </li>
              ))}
            </motion.ul>
          </>
        )}
      </AnimatePresence>
    </motion.article>
  );
};

export const AddCourseCard = () => (
  <button
    type="button"
    aria-label="Agregar curso"
    className="flex min-h-[188px] w-full flex-col items-center justify-center gap-3 rounded-[24px] border-2 border-dashed border-line-strong bg-white/50 text-ink-400 transition-all duration-300 ease-deluxe hover:-translate-y-0.5 hover:border-mint-400 hover:bg-mint-50/40 hover:text-mint-600"
  >
    <span className="grid size-11 place-items-center rounded-full bg-canvas-deep transition-colors group-hover:bg-white">
      <Plus size={19} strokeWidth={2.4} />
    </span>
    <span className="text-sm font-bold">Agregar curso</span>
  </button>
);

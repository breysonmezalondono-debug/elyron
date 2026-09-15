import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen, Flag, ScrollText, Settings, Users } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AUDIT_LOG } from '../../model/mock/adminData';
import type { AuditCategory, AuditEntry } from '../../model/mock/adminData';

const EASE = [0.22, 1, 0.36, 1] as const;

type CategoryFilter = AuditCategory | 'todas';

const CATEGORY_FILTERS: { key: CategoryFilter; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'usuarios', label: 'Usuarios' },
  { key: 'contenido', label: 'Contenido' },
  { key: 'moderacion', label: 'Moderación' },
  { key: 'configuracion', label: 'Configuración' },
];

const CATEGORY_META: Record<AuditCategory, { icon: LucideIcon; tile: string; badge: string }> = {
  usuarios: {
    icon: Users,
    tile: 'bg-mint-100 text-mint-700',
    badge: 'bg-mint-50 text-mint-700 ring-mint-200',
  },
  contenido: {
    icon: BookOpen,
    tile: 'bg-violet-100 text-violet-600',
    badge: 'bg-violet-50 text-violet-600 ring-violet-200',
  },
  moderacion: {
    icon: Flag,
    tile: 'bg-red-50 text-red-500',
    badge: 'bg-red-50 text-red-500 ring-red-200',
  },
  configuracion: {
    icon: Settings,
    tile: 'bg-amber-100 text-amber-600',
    badge: 'bg-amber-50 text-amber-700 ring-amber-200',
  },
};

const CATEGORY_LABEL: Record<AuditCategory, string> = {
  usuarios: 'Usuarios',
  contenido: 'Contenido',
  moderacion: 'Moderación',
  configuracion: 'Configuración',
};

export const AuditoriaAdminView = () => {
  const [category, setCategory] = useState<CategoryFilter>('todas');

  const filtered = useMemo(
    () =>
      category === 'todas'
        ? AUDIT_LOG
        : AUDIT_LOG.filter((entry) => entry.category === category),
    [category],
  );

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
      >
        <p className="admin-eyebrow text-[11px] admin-muted">Administración</p>
        <h1 className="admin-heading mt-2 text-3xl text-ink-950 sm:text-4xl">
          Registro de auditoría
        </h1>
        <p className="mt-2 text-sm font-medium admin-muted">
          Trazabilidad de acciones sobre cuentas, contenido y configuración.
        </p>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: EASE }}
        className="flex gap-1.5 overflow-x-auto rounded-full bg-white p-1.5 shadow-soft ring-1 ring-line w-fit max-w-full"
      >
        {CATEGORY_FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setCategory(filter.key)}
            className={`relative shrink-0 rounded-full px-4 py-2 text-[11px] transition-colors ${
              category === filter.key ? 'font-extrabold text-white' : 'font-bold text-ink-500 hover:text-ink-900'
            }`}
          >
            {category === filter.key && (
              <motion.span
                layoutId="audit-category-filter"
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                className="absolute inset-0 rounded-full bg-ink-900"
              />
            )}
            <span className="relative z-10">{filter.label}</span>
          </button>
        ))}
      </motion.div>

      <motion.section layout className="surface p-6 sm:p-7">
        <ol className="relative space-y-6 before:absolute before:bottom-2 before:left-[19px] before:top-2 before:w-px before:bg-line">
          <AnimatePresence mode="popLayout">
            {filtered.map((entry) => (
              <AuditRow key={entry.id} entry={entry} />
            ))}
          </AnimatePresence>
        </ol>

        {filtered.length === 0 && (
          <div className="flex flex-col items-center gap-3 py-12 text-center">
            <span className="grid size-14 place-items-center rounded-[20px] bg-canvas-deep text-ink-400 shadow-lift">
              <ScrollText size={26} />
            </span>
            <p className="max-w-xs text-sm font-medium leading-relaxed text-ink-500">
              No hay eventos registrados en esta categoría durante el periodo actual.
            </p>
          </div>
        )}
      </motion.section>
    </div>
  );
};

const AuditRow = ({ entry }: { entry: AuditEntry }) => {
  const meta = CATEGORY_META[entry.category];
  return (
    <motion.li
      layout
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="relative flex gap-4 pl-0"
    >
      <span className={`z-10 grid size-10 shrink-0 place-items-center rounded-full ${meta.tile}`}>
        <meta.icon size={16} strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1 border-b border-line pb-5">
        <p className="text-sm leading-snug text-ink-600">
          <strong className="font-extrabold text-ink-900">{entry.actor}</strong> {entry.action}{' '}
          <strong className="font-extrabold text-ink-800">{entry.target}</strong>
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${meta.badge}`}>
            {CATEGORY_LABEL[entry.category]}
          </span>
          <span className="text-[11px] font-bold text-ink-300">{entry.time}</span>
        </div>
      </div>
    </motion.li>
  );
};

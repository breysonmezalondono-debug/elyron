import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle,
  EyeOff,
  Search,
  ShieldAlert,
  ShieldCheck,
} from 'lucide-react';
import {
  COMMUNITY_REPORTS,
  REPORT_REASON_BADGE,
  REPORT_REASON_LABELS,
  REPORT_STATUS_BADGE,
  REPORT_STATUS_LABELS,
} from '../../model/mock/adminData';
import type { CommunityReport, ReportReason, ReportStatus } from '../../model/mock/adminData';

const EASE = [0.22, 1, 0.36, 1] as const;

type ReasonFilter = ReportReason | 'todas';

const REASON_FILTERS: { key: ReasonFilter; label: string }[] = [
  { key: 'todas', label: 'Todas' },
  { key: 'spam', label: 'Spam' },
  { key: 'contenido_inapropiado', label: 'Inapropiado' },
  { key: 'acoso', label: 'Acoso' },
  { key: 'otro', label: 'Otro' },
];

const REPORTS_BY_STATUS = (reports: CommunityReport[], status: ReportStatus) =>
  reports.filter((r) => r.status === status).length;

export const ModeracionAdminView = () => {
  const [reports, setReports] = useState(COMMUNITY_REPORTS);
  const [reasonFilter, setReasonFilter] = useState<ReasonFilter>('todas');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return reports.filter((report) => {
      if (reasonFilter !== 'todas' && report.reason !== reasonFilter) return false;
      if (!normalized) return true;
      return (
        report.contentExcerpt.toLowerCase().includes(normalized) ||
        report.authorName.toLowerCase().includes(normalized) ||
        report.reportedBy.toLowerCase().includes(normalized)
      );
    });
  }, [reports, reasonFilter, query]);

  const pending = REPORTS_BY_STATUS(reports, 'pendiente');
  const resolved = reports.filter((r) => r.status === 'aprobado' || r.status === 'ocultado').length;
  const warned = REPORTS_BY_STATUS(reports, 'advertencia');
  const hidden = REPORTS_BY_STATUS(reports, 'ocultado');

  const updateStatus = (reportId: string, newStatus: ReportStatus) => {
    setReports((prev) =>
      prev.map((r) => (r.id === reportId ? { ...r, status: newStatus } : r)),
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: EASE }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="admin-eyebrow text-[11px] admin-muted">Administración</p>
          <h1 className="admin-heading mt-2 text-3xl text-ink-950 sm:text-4xl">
            Moderación de comunidad
          </h1>
          <p className="mt-2 text-sm font-medium admin-muted">
            {pending} reportes pendientes de revisión.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar contenido o usuario…"
            className="input pl-10"
          />
        </div>
      </motion.header>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: EASE }}
        className="grid grid-cols-2 gap-4 sm:grid-cols-4"
      >
        <div className="surface flex items-center gap-4 p-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-amber-100 text-amber-600">
            <AlertTriangle size={19} strokeWidth={2.2} />
          </span>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-400">Pendientes</p>
            <p className="display mt-1 text-[32px] leading-none text-ink-950">{pending}</p>
          </div>
        </div>
        <div className="surface flex items-center gap-4 p-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-mint-100 text-mint-700">
            <CheckCircle size={19} strokeWidth={2.2} />
          </span>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-400">Resueltos</p>
            <p className="display mt-1 text-[32px] leading-none text-ink-950">{resolved}</p>
          </div>
        </div>
        <div className="surface flex items-center gap-4 p-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-ink-900 text-white">
            <EyeOff size={19} strokeWidth={2.2} />
          </span>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-400">Ocultos</p>
            <p className="display mt-1 text-[32px] leading-none text-ink-950">{hidden}</p>
          </div>
        </div>
        <div className="surface flex items-center gap-4 p-5">
          <span className="grid size-11 shrink-0 place-items-center rounded-full bg-red-50 text-red-500">
            <ShieldAlert size={19} strokeWidth={2.2} />
          </span>
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-ink-400">Advertencias</p>
            <p className="display mt-1 text-[32px] leading-none text-ink-950">{warned}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: EASE }}
        className="flex gap-1.5 overflow-x-auto rounded-full bg-white p-1.5 shadow-soft ring-1 ring-line w-fit max-w-full"
      >
        {REASON_FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setReasonFilter(filter.key)}
            className={`relative shrink-0 rounded-full px-4 py-2 text-[11px] transition-colors ${
              reasonFilter === filter.key ? 'font-extrabold text-white' : 'font-bold text-ink-500 hover:text-ink-900'
            }`}
          >
            {reasonFilter === filter.key && (
              <motion.span
                layoutId="mod-reason-filter"
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                className="absolute inset-0 rounded-full bg-ink-900"
              />
            )}
            <span className="relative z-10">{filter.label}</span>
          </button>
        ))}
      </motion.div>

      <motion.div layout className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filtered.map((report) => (
            <ReportRow
              key={report.id}
              report={report}
              onApprove={() => updateStatus(report.id, 'aprobado')}
              onHide={() => updateStatus(report.id, 'ocultado')}
              onWarn={() => updateStatus(report.id, 'advertencia')}
            />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <section className="surface flex flex-col items-center gap-4 p-10 text-center">
          <span className="grid size-14 place-items-center rounded-[20px] bg-mint-50 text-mint-700 shadow-lift">
            <ShieldCheck size={26} />
          </span>
          <div className="space-y-1.5">
            <h2 className="text-base font-extrabold tracking-tight text-ink-950">
              Todo tranquilo por aquí
            </h2>
            <p className="mx-auto max-w-xs text-sm font-medium leading-relaxed text-ink-500">
              No hay reportes que coincidan con el filtro seleccionado.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

interface ReportRowProps {
  report: CommunityReport;
  onApprove: () => void;
  onHide: () => void;
  onWarn: () => void;
}

const ReportRow = ({ report, onApprove, onHide, onWarn }: ReportRowProps) => {
  const isPending = report.status === 'pendiente';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-start"
    >
      <div className="min-w-0 flex-1 space-y-2.5">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${REPORT_REASON_BADGE[report.reason]}`}>
            {REPORT_REASON_LABELS[report.reason]}
          </span>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${REPORT_STATUS_BADGE[report.status]}`}>
            {REPORT_STATUS_LABELS[report.status]}
          </span>
        </div>
        <p className="text-sm leading-relaxed text-ink-700 italic">"{report.contentExcerpt}"</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-ink-400">
          <span>
            Publicado por <strong className="font-extrabold text-ink-700">{report.authorName}</strong>
          </span>
          <span>
            Reportado por <strong className="font-extrabold text-ink-700">{report.reportedBy}</strong> ({report.reportedByRole})
          </span>
          <span>{report.createdAt}</span>
        </div>
      </div>

      {isPending && (
        <div className="flex shrink-0 flex-wrap gap-2">
          <button type="button" onClick={onApprove} className="btn-pill btn-pill-sm btn-pill-mint">
            <ShieldCheck size={13} />
            Aprobar
          </button>
          <button type="button" onClick={onHide} className="btn-pill btn-pill-sm btn-pill-paper">
            <EyeOff size={13} />
            Ocultar
          </button>
          <button type="button" onClick={onWarn} className="btn-pill btn-pill-sm btn-pill-paper">
            <AlertTriangle size={13} />
            Advertir
          </button>
        </div>
      )}
      {!isPending && (
        <div className="flex shrink-0 items-center gap-2">
          {report.status === 'ocultado' && <EyeOff size={14} className="text-ink-400" />}
          {report.status === 'advertencia' && <ShieldAlert size={14} className="text-red-500" />}
          {report.status === 'aprobado' && <CheckCircle size={14} className="text-mint-600" />}
        </div>
      )}
    </motion.article>
  );
};

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BriefcaseBusiness,
  CalendarClock,
  FileCheck,
  Search,
  TrendingUp,
} from 'lucide-react';
import {
  ADMIN_COMPANIES,
  AGREEMENT_STATUS_BADGE,
  AGREEMENT_STATUS_LABELS,
} from '../../model/mock/companyData';
import type { AdminCompany, AgreementStatus } from '../../model/mock/companyData';
import { INSTITUTIONS } from '../../model/mock/orgData';
import { StatCard } from '../../components/elyron/StatCard';

const EASE = [0.22, 1, 0.36, 1] as const;

type StatusFilter = AgreementStatus | 'todos';

const STATUS_FILTERS: { key: StatusFilter; label: string }[] = [
  { key: 'todos', label: 'Todas' },
  { key: 'activo', label: 'Activas' },
  { key: 'por_renovar', label: 'Por renovar' },
  { key: 'vencido', label: 'Vencidas' },
];

const INSTITUTION_LABEL: Record<string, string> = Object.fromEntries(
  INSTITUTIONS.map((i) => [i.id, i.shortName]),
);

export const EmpresasAdminView = () => {
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('todos');

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return ADMIN_COMPANIES.filter((company) => {
      if (statusFilter !== 'todos' && company.agreementStatus !== statusFilter) return false;
      if (!normalized) return true;
      return (
        company.name.toLowerCase().includes(normalized) ||
        company.nit.includes(normalized) ||
        company.contactName.toLowerCase().includes(normalized)
      );
    });
  }, [query, statusFilter]);

  const activeCount = ADMIN_COMPANIES.filter((c) => c.agreementStatus === 'activo').length;
  const renewCount = ADMIN_COMPANIES.filter((c) => c.agreementStatus === 'por_renovar').length;
  const totalOffers = ADMIN_COMPANIES.reduce((sum, c) => sum + c.activeOffers, 0);
  const totalApplications = ADMIN_COMPANIES.reduce((sum, c) => sum + c.totalApplications, 0);

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
            Empresas aliadas
          </h1>
          <p className="mt-2 text-sm font-medium admin-muted">
            {ADMIN_COMPANIES.length} empresas registradas, {activeCount} convenios activos.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar empresa, NIT o contacto…"
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
        <StatCard icon={BriefcaseBusiness} label="Empresas activas" value={`${activeCount}`} variant="mint" />
        <StatCard icon={CalendarClock} label="Por renovar" value={`${renewCount}`} deltaUp={false} delta={`${renewCount} vencen pronto`} variant="amber" />
        <StatCard icon={FileCheck} label="Ofertas publicadas" value={`${totalOffers}`} delta="+3 esta semana" variant="violet" />
        <StatCard icon={TrendingUp} label="Postulaciones totales" value={`${totalApplications}`} delta="+18 este mes" variant="ink" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: EASE }}
        className="flex gap-1.5 overflow-x-auto rounded-full bg-white p-1.5 shadow-soft ring-1 ring-line w-fit max-w-full"
      >
        {STATUS_FILTERS.map((filter) => (
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
                layoutId="empresa-status-filter"
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
          {filtered.map((company) => (
            <CompanyRow key={company.id} company={company} />
          ))}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <section className="surface flex flex-col items-center gap-4 p-10 text-center">
          <span className="grid size-14 place-items-center rounded-[20px] bg-canvas-deep text-ink-400 shadow-lift">
            <BriefcaseBusiness size={26} />
          </span>
          <div className="space-y-1.5">
            <h2 className="text-base font-extrabold tracking-tight text-ink-950">
              Sin resultados
            </h2>
            <p className="mx-auto max-w-xs text-sm font-medium leading-relaxed text-ink-500">
              Ninguna empresa coincide con la búsqueda o el filtro seleccionado.
            </p>
          </div>
        </section>
      )}
    </div>
  );
};

const CompanyRow = ({ company }: { company: AdminCompany }) => {
  const instLabels = company.institutions
    .map((id) => INSTITUTION_LABEL[id] ?? id)
    .join(' · ');

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: EASE }}
      className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
    >
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="text-sm font-extrabold tracking-tight text-ink-950">
            {company.name}
          </h2>
          <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${AGREEMENT_STATUS_BADGE[company.agreementStatus]}`}>
            {AGREEMENT_STATUS_LABELS[company.agreementStatus]}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-ink-400">
          <span>NIT: {company.nit}</span>
          <span>Contacto: <strong className="font-extrabold text-ink-700">{company.contactName}</strong></span>
          <span>{instLabels}</span>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-2 text-xs font-medium text-ink-400 sm:text-right">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-300">Ofertas</p>
          <p className="text-sm font-extrabold text-ink-900">{company.activeOffers}</p>
        </div>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-300">Postulaciones</p>
          <p className="text-sm font-extrabold text-ink-900">{company.totalApplications}</p>
        </div>
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-wider text-ink-300">Convenio</p>
          <p className="text-sm font-extrabold text-ink-900">{company.agreementDate}</p>
        </div>
        <button
          type="button"
          disabled
          title="Próximamente"
          className="btn-pill btn-pill-sm btn-pill-paper opacity-60"
        >
          Gestionar
        </button>
      </div>
    </motion.article>
  );
};

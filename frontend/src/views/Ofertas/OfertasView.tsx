import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { Banknote, Bookmark, Building2, CalendarDays, Check, MapPin } from 'lucide-react';
import { Elir } from '../../components/elyron/Elir';
import { IconTile } from '../../components/elyron/IconTile';
import { useInstitution } from '../../context/useInstitution';
import { INSTITUTIONS } from '../../model/mock/orgData';
import { INITIAL_COMPANIES } from '../../model/mock/companyData';
import { OFFERS } from '../../model/mock/offerData';

const EASE = [0.22, 1, 0.36, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const cascade: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const FILTERS = [
  { id: 'todas', label: 'Todas' },
  { id: 'guardadas', label: 'Guardadas' },
  { id: 'postuladas', label: 'Postuladas' },
];

const companyById = new Map(INITIAL_COMPANIES.map((c) => [c.id, c]));

const partnerLabel = (types: string[]) => {
  const inst = INSTITUTIONS.find((i) => types.includes(i.type));
  return inst?.shortName ?? 'Convenio';
};

export const OfertasView = () => {
  const { institution } = useInstitution();
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({ 'of-2': true });
  const [filter, setFilter] = useState('todas');
  const [scope, setScope] = useState<'mias' | 'todas'>('mias');

  const toggleApply = (id: string) => setApplied((p) => ({ ...p, [id]: !p[id] }));
  const toggleSave = (id: string) => setSaved((p) => ({ ...p, [id]: !p[id] }));

  const scoped = useMemo(
    () =>
      scope === 'mias'
        ? OFFERS.filter((o) =>
            companyById.get(o.companyId)?.institutions.includes(institution.type),
          )
        : OFFERS,
    [scope, institution.type],
  );

  const filtered = useMemo(() => {
    if (filter === 'guardadas') return scoped.filter((o) => saved[o.id]);
    if (filter === 'postuladas') return scoped.filter((o) => applied[o.id]);
    return scoped;
  }, [scoped, filter, applied, saved]);

  return (
    <motion.div variants={cascade} initial="hidden" animate="show" className="mx-auto max-w-5xl space-y-6">
      <motion.header variants={rise} className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">Empleo</p>
          <h1 className="display mt-2 text-3xl text-ink-950 sm:text-4xl">
            Bolsa de <span className="italic">empleo</span>
          </h1>
          <p className="mt-2 text-sm font-medium text-ink-500">
            {scope === 'mias'
              ? `Vacantes aliadas de ${institution.name}, curadas para tu perfil.`
              : 'Vacantes de todas las instituciones aliadas de la plataforma.'}
          </p>
        </div>
        <div className="flex gap-1.5 rounded-full bg-white p-1.5 shadow-soft ring-1 ring-line">
          {FILTERS.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className={`relative rounded-full px-4 py-2 text-xs transition-colors ${
                filter === f.id
                  ? 'font-extrabold text-white'
                  : 'font-semibold text-ink-500 hover:text-ink-900'
              }`}
            >
              {filter === f.id && (
                <motion.span
                  layoutId="of-filter"
                  transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                  className="absolute inset-0 rounded-full bg-ink-900"
                />
              )}
              <span className="relative z-10">{f.label}</span>
            </button>
          ))}
        </div>
      </motion.header>

      <motion.div variants={rise}>
        <button
          type="button"
          onClick={() => setScope((s) => (s === 'mias' ? 'todas' : 'mias'))}
          className="inline-flex items-center gap-2 rounded-full bg-canvas-deep px-4 py-2 text-xs font-bold text-ink-600 ring-1 ring-line transition-colors hover:bg-white hover:text-ink-900 hover:shadow-soft"
        >
          <Building2 size={13} />
          {scope === 'mias'
            ? `Convenios · ${institution.shortName}`
            : 'Mostrando todas las instituciones'}
        </button>
      </motion.div>

      <AnimatePresence mode="wait">
        <motion.div
          key={`${scope}-${filter}`}
          initial={{ opacity: 0, x: 14 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -14 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="grid gap-4 md:grid-cols-2"
        >
          {filtered.length === 0 && (
            <motion.div variants={rise} className="surface col-span-full flex flex-col items-center gap-4 py-14 text-center">
              <Elir size={72} mood={filter === 'todas' ? 'curious' : 'thinking'} />
              <p className="display max-w-sm text-xl leading-snug text-ink-800">
                {filter !== 'todas' ? (
                  <>
                    Nada por aquí todavía. Toda gran trayectoria empieza con{' '}
                    <span className="italic">una postulación</span>.
                  </>
                ) : (
                  <>
                    Tu institución aún no tiene vacantes activas. ¿Exploramos el{' '}
                    <span className="italic">resto de la red</span>?
                  </>
                )}
              </p>
              {filter !== 'todas' ? (
                <button type="button" onClick={() => setFilter('todas')} className="btn-pill btn-pill-paper btn-pill-sm">
                  Ver todas las vacantes
                </button>
              ) : (
                <button type="button" onClick={() => setScope('todas')} className="btn-pill btn-pill-paper btn-pill-sm">
                  Explorar otras instituciones
                </button>
              )}
            </motion.div>
          )}

          {filtered.map((of) => {
            const isApplied = !!applied[of.id];
            const isSaved = !!saved[of.id];
            const company = companyById.get(of.companyId);
            return (
              <motion.article key={of.id} variants={rise} className="surface flex flex-col justify-between gap-4 p-6">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <IconTile icon={Building2} variant="mint" />
                    <button
                      type="button"
                      aria-label={isSaved ? 'Quitar de guardadas' : 'Guardar oferta'}
                      onClick={() => toggleSave(of.id)}
                      className={`grid size-9 place-items-center rounded-full transition ${
                        isSaved
                          ? 'bg-ink-900 text-white'
                          : 'bg-canvas-deep text-ink-400 hover:text-ink-800'
                      }`}
                    >
                      <Bookmark size={15} fill={isSaved ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  <h2 className="mt-3.5 text-base font-extrabold tracking-tight">{of.title}</h2>
                  <p className="flex items-center gap-2 text-sm font-bold text-mint-600">
                    {company?.name}
                    {scope === 'todas' && company && (
                      <span className="rounded-full bg-canvas-deep px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-ink-500 ring-1 ring-line">
                        {partnerLabel(company.institutions)}
                      </span>
                    )}
                  </p>

                  <div className="mt-3 space-y-1.5 text-xs font-semibold text-ink-500">
                    <p className="flex items-center gap-1.5">
                      <MapPin size={13} /> {of.location}
                    </p>
                    <p className="flex items-center gap-1.5 font-extrabold text-ink-900">
                      <Banknote size={14} /> {of.salary}
                    </p>
                    <p className="flex items-center gap-1.5">
                      <CalendarDays size={13} /> Expira el {of.expiresAt}
                    </p>
                  </div>

                  <p className="mt-3 border-t border-line pt-3 text-[13px] leading-relaxed text-ink-600">
                    {of.description}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => toggleApply(of.id)}
                  className={`btn-pill w-full justify-center ${
                    isApplied ? 'bg-mint-50 text-mint-700 shadow-none ring-1 ring-mint-200 hover:bg-mint-50' : 'btn-pill-mint'
                  }`}
                >
                  {isApplied ? (
                    <>
                      <Check size={15} strokeWidth={3} />
                      Postulado — toca para cancelar
                    </>
                  ) : (
                    'Postularme a la oferta'
                  )}
                </button>
              </motion.article>
            );
          })}
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { CalendarDays, MapPin, Plus } from 'lucide-react';
import { IconTile } from '../../components/elyron/IconTile';
import { useInstitution } from '../../context/useInstitution';
import { MOCK_COMMUNITY_EVENTS } from '../../model/mock/eventsData';
import type { CommunityEventVariant } from '../../model/mock/eventsData';

const EASE = [0.22, 1, 0.36, 1] as const;

const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE } },
};

const cascade: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07 } },
};

const VARIANT_TILE: Record<CommunityEventVariant, 'mint' | 'violet' | 'amber'> = {
  mint: 'mint',
  violet: 'violet',
  amber: 'amber',
};

const STATUS_STYLE = {
  proximamente: 'bg-mint-50 text-mint-700 ring-mint-200',
  finalizado: 'bg-canvas-deep text-ink-500 ring-line-strong',
} as const;

const STATUS_LABEL = {
  proximamente: 'Próximo',
  finalizado: 'Finalizado',
} as const;

export const EventosView = () => {
  const { terminology } = useInstitution();

  return (
    <motion.div variants={cascade} initial="hidden" animate="show" className="mx-auto max-w-5xl space-y-7">
      <motion.header variants={rise}>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">Comunidad</p>
        <h1 className="display mt-2 text-3xl text-ink-950 sm:text-4xl">
          Eventos de la <span className="italic">comunidad</span>
        </h1>
        <p className="mt-2 text-sm font-medium text-ink-500">
          Encuentros, charlas y ferias para tu {terminology.group.toLowerCase()}.
        </p>
      </motion.header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {MOCK_COMMUNITY_EVENTS.map((ev) => (
          <motion.article
            key={ev.id}
            variants={rise}
            className="surface relative flex flex-col gap-4 overflow-hidden p-5 transition-all duration-300 ease-deluxe hover:-translate-y-0.5 hover:shadow-lift"
          >
            <div className="flex items-start justify-between gap-3">
              <IconTile icon={CalendarDays} variant={VARIANT_TILE[ev.variant]} />
              <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${STATUS_STYLE[ev.status]}`}>
                {STATUS_LABEL[ev.status]}
              </span>
            </div>
            <div>
              <h2 className="text-[15px] font-extrabold leading-snug tracking-tight">{ev.title}</h2>
              <p className="mt-1.5 flex items-center gap-1.5 text-xs font-semibold text-ink-500">
                <CalendarDays size={13} />
                {new Date(`${ev.date}T00:00:00`).toLocaleDateString('es-CO', {
                  day: 'numeric',
                  month: 'long',
                })}
              </p>
              <p className="mt-1 flex items-center gap-1.5 text-xs font-medium text-ink-400">
                <MapPin size={13} />
                {ev.location}
              </p>
            </div>
          </motion.article>
        ))}

        <button
          type="button"
          aria-label="Proponer evento"
          className="flex min-h-[188px] w-full flex-col items-center justify-center gap-3 rounded-[24px] border-2 border-dashed border-line-strong bg-white/50 text-ink-400 transition-all duration-300 ease-deluxe hover:-translate-y-0.5 hover:border-mint-400 hover:bg-mint-50/40 hover:text-mint-600"
        >
          <span className="grid size-11 place-items-center rounded-full bg-canvas-deep">
            <Plus size={19} strokeWidth={2.4} />
          </span>
          <span className="text-sm font-bold">Proponer un evento</span>
        </button>
      </div>
    </motion.div>
  );
};

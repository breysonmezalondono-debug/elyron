import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  FileBarChart,
  Megaphone,
  Presentation,
  TrendingDown,
  UserPlus,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useInstitution } from '../../context/useInstitution';
import { StatCard } from '../../components/elyron/StatCard';
import { ActivityFeed } from '../../components/elyron/ActivityFeed';
import { ProgressRing } from '../../components/elyron/ProgressRing';
import { CrearCuentaModal, ROLES_POR_ENTIDAD } from '../../components/CrearCuentaModal';
import {
  COORDINATOR_FEED,
  COORDINATED_GROUPS,
  COORDINATED_INSTRUCTORS,
  COORDINATOR_STATS,
} from '../../model/mock/coordinatorData';

const EASE = [0.22, 1, 0.36, 1] as const;

const sequence: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const cascade: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07 } },
};

export const CoordinadorDashboard = () => {
  const { user } = useAuth();
  const { institution } = useInstitution();
  const name = user?.name || user?.sub || 'Coordinador';
  const [modalOpen, setModalOpen] = useState(false);
  const [aviso, setAviso] = useState('');

  const institucion = institution.type;
  const rolesCoordinador = ROLES_POR_ENTIDAD[institucion] ?? ROLES_POR_ENTIDAD.sena;

  const onCreada = (mensaje: string) => {
    setAviso(mensaje);
    setTimeout(() => setAviso(''), 5000);
  };

  return (
    <motion.div variants={sequence} initial="hidden" animate="visible" className="space-y-7">
      <motion.header variants={rise} className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">
            Coordinación · {institution.shortName}
          </p>
          <h1 className="display mt-2 text-3xl leading-tight text-ink-950 sm:text-[40px]">
            Hola, {name}.
            <span className="block italic text-amber-600">
              Tienes {COORDINATED_GROUPS.length} grupos activos y{' '}
              {COORDINATOR_STATS.pendingEvidence} evidencias pendientes en el programa.
            </span>
          </h1>
        </div>
        <Link
          to="/coordinador/reportes"
          className="btn-pill btn-pill-ink hidden shrink-0 sm:inline-flex"
        >
          Ver reportes
          <ArrowRight size={15} />
        </Link>
      </motion.header>

      <motion.section variants={cascade} className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <motion.div variants={rise}>
          <StatCard icon={Users} label="Grupos en el programa" value={`${COORDINATOR_STATS.activeGroups}`} delta={`${COORDINATOR_STATS.activeInstructors} instructores`} variant="amber" to="/coordinador/grupos" />
        </motion.div>
        <motion.div variants={rise}>
          <StatCard icon={Presentation} label="Instructores a cargo" value={`${COORDINATOR_STATS.activeInstructors}`} delta="1 nuevo este periodo" variant="violet" to="/coordinador/grupos" />
        </motion.div>
        <motion.div variants={rise}>
          <StatCard icon={ClipboardCheck} label="Evidencias por revisar" value={`${COORDINATOR_STATS.pendingEvidence}`} delta="7 llegaron hoy" deltaUp variant="mint" to="/coordinador/reportes" />
        </motion.div>
        <motion.div variants={rise}>
          <StatCard icon={Megaphone} label="Comunicados publicados" value={`${COORDINATOR_STATS.publishedNotices}`} delta="El último hoy" variant="ink" to="/coordinador/comunicados" />
        </motion.div>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <motion.div variants={cascade} className="space-y-6 xl:col-span-2">
          <motion.section variants={rise} className="surface p-6 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-base font-extrabold tracking-tight">Avance por grupo del programa</h2>
              <Link
                to="/coordinador/reportes"
                className="inline-flex items-center gap-1 text-xs font-extrabold text-ink-500 transition hover:gap-2 hover:text-ink-900"
              >
                Ver reportes <ArrowRight size={13} />
              </Link>
            </div>
            <ul className="divide-y divide-line">
              {COORDINATED_GROUPS.map((group) => (
                <li key={group.id} className="flex items-center gap-5 py-4">
                  <ProgressRing
                    value={group.averageProgress}
                    size={62}
                    stroke={7}
                    color="#d97706"
                    centerClassName="text-sm font-extrabold tracking-tight text-ink-950"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-ink-900">{group.name}</p>
                    <p className="mt-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      {group.code}
                    </p>
                    <p className="mt-0.5 text-[11px] font-semibold text-ink-400">
                      {group.instructor} · {group.learners} aprendices
                    </p>
                  </div>
                  <span
                    className={`hidden shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-extrabold sm:inline-flex ${
                      group.trend >= 0 ? 'bg-mint-50 text-mint-700' : 'bg-red-50 text-red-500'
                    }`}
                  >
                    <TrendingDown size={12} className={group.trend >= 0 ? 'rotate-180' : ''} />
                    {group.trend >= 0 ? `+${group.trend}` : group.trend} pp
                  </span>
                  <span className="hidden shrink-0 text-xs font-semibold text-ink-400 lg:block">
                    {group.pendingEvidence} pend.
                  </span>
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section variants={rise} className="surface p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-extrabold tracking-tight">Instructores a cargo</h2>
              <Link
                to="/coordinador/grupos"
                className="inline-flex items-center gap-1 text-xs font-extrabold text-ink-500 transition hover:gap-2 hover:text-ink-900"
              >
                Ver todos <ArrowRight size={13} />
              </Link>
            </div>
            <ul className="divide-y divide-line">
              {COORDINATED_INSTRUCTORS.map((instr) => (
                <li key={instr.id} className="flex items-center gap-4 py-3">
                  <span className="grid size-9 shrink-0 place-items-center rounded-full bg-violet-100 text-[11px] font-extrabold text-violet-700">
                    {instr.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-ink-800">{instr.name}</p>
                    <p className="text-[11px] font-semibold text-ink-400">
                      {instr.groups} {instr.groups === 1 ? 'grupo' : 'grupos'} · {instr.lastActive}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </motion.section>
        </motion.div>

        <motion.div variants={cascade} className="space-y-6">
          <motion.section variants={rise} className="surface p-6">
            <h3 className="text-sm font-extrabold tracking-tight">Accesos rápidos</h3>
            <div className="mt-4 space-y-2.5">
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="flex w-full items-center gap-3 rounded-[20px] border border-mint-200 bg-mint-50/50 p-4 text-left transition-all duration-300 ease-deluxe hover:-translate-y-0.5 hover:bg-white hover:shadow-lift dark:border-mint-500/25 dark:bg-mint-500/10"
              >
                <UserPlus size={17} className="shrink-0 text-mint-600" />
                <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink-800">
                  Crear cuenta de {institucion === 'sena' ? 'instructor' : institucion === 'universidad' ? 'profesor' : 'docente'}
                </span>
                <ArrowRight size={14} className="shrink-0 text-ink-300" />
              </button>
              {[
                { to: '/coordinador/reportes', label: 'Reportes del programa', icon: FileBarChart },
                { to: '/coordinador/comunicados', label: 'Publicar comunicado', icon: Megaphone },
                { to: '/calendario', label: 'Calendario consolidado', icon: CalendarDays },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 rounded-[20px] border border-line bg-canvas-deep/40 p-4 transition-all duration-300 ease-deluxe hover:-translate-y-0.5 hover:bg-white hover:shadow-lift"
                >
                  <item.icon size={17} className="shrink-0 text-amber-500" />
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink-800">
                    {item.label}
                  </span>
                  <ArrowRight size={14} className="shrink-0 text-ink-300" />
                </Link>
              ))}
            </div>
          </motion.section>

          <motion.div variants={rise}>
            <ActivityFeed title="Actividad del programa" items={COORDINATOR_FEED} />
          </motion.div>
        </motion.div>
      </div>

      {aviso && (
        <p className="flex items-center gap-2 rounded-2xl border border-mint-200 bg-mint-50 px-4 py-3 text-xs font-bold text-mint-700 dark:border-mint-500/30 dark:bg-mint-500/10 dark:text-mint-400">
          <ClipboardCheck size={14} strokeWidth={3} />
          {aviso}
        </p>
      )}

      <CrearCuentaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreada={onCreada}
        roles={rolesCoordinador}
        institucionPorRol={() => institucion}
      />
    </motion.div>
  );
};

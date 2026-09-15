import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ArrowRight,
  CalendarDays,
  ClipboardCheck,
  HelpCircle,
  MessageSquareQuote,
  TrendingDown,
  UserCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { StatCard } from '../../components/elyron/StatCard';
import { ActivityFeed } from '../../components/elyron/ActivityFeed';
import { ProgressRing } from '../../components/elyron/ProgressRing';
import { useAsistencia } from '../../model/asistencia';
import { teacherBasePath } from '../../model/navigation';
import { TEACHER_FEED, TEACHER_GROUPS, UNANSWERED_QUESTIONS } from '../../model/mock/teacherData';

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

const formatDate = () =>
  new Date()
    .toLocaleDateString('es-CO', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
    .replace(/^./, (c) => c.toUpperCase());

const PENDING_GRADINGS = 8;
const NEXT_CLASSES = 4;

const keyOf = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

export const ProfesorDashboard = () => {
  const { user, activeRole } = useAuth();
  const asistencia = useAsistencia();
  const name = user?.name || user?.sub || 'Profesor';
  const base = teacherBasePath(activeRole);

  const hoyKey = keyOf(new Date());
  const faltasHoy = asistencia.registros.filter(
    (r) => r.fecha === hoyKey && r.estado === 'no_vino',
  ).length;
  const presentesHoy = asistencia.registros.filter(
    (r) => r.fecha === hoyKey && r.estado === 'asistio',
  ).length;

  return (
    <motion.div variants={sequence} initial="hidden" animate="visible" className="space-y-7">
      <motion.header variants={rise} className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">
            {formatDate()}
          </p>
          <h1 className="display mt-2 text-3xl leading-tight text-ink-950 sm:text-[40px]">
            Hola, {name}.
            <span className="block italic text-violet-600">
              Tienes {TEACHER_GROUPS.length} grupos activos y{' '}
              {PENDING_GRADINGS} evidencias por calificar.
            </span>
          </h1>
        </div>
        <Link
          to={`${base}/calificaciones`}
          className="btn-pill btn-pill-ink hidden shrink-0 sm:inline-flex"
        >
          Ir a calificar
          <ArrowRight size={15} />
        </Link>
      </motion.header>

      <motion.section variants={cascade} className="grid grid-cols-2 gap-4 xl:grid-cols-5">
        <motion.div variants={rise}>
          <StatCard icon={Users} label="Grupos a cargo" value={`${TEACHER_GROUPS.length}`} delta="+1 este periodo" variant="violet" to={`${base}/grupos`} />
        </motion.div>
        <motion.div variants={rise}>
          <StatCard icon={ClipboardCheck} label="Evidencias por calificar" value={`${PENDING_GRADINGS}`} delta="3 llegaron hoy" variant="mint" to={`${base}/calificaciones`} />
        </motion.div>
        <motion.div variants={rise}>
          <StatCard icon={CalendarDays} label="Próximas clases" value={`${NEXT_CLASSES}`} delta="La próxima hoy 10:00" deltaUp variant="ink" to="/calendario" />
        </motion.div>
        <motion.div variants={rise}>
          <StatCard icon={UserCheck} label="Asistencia hoy" value={`${presentesHoy}`} delta={`${faltasHoy} faltas`} deltaUp={faltasHoy === 0} variant="mint" to={`${base}/asistencia`} />
        </motion.div>
        <motion.div variants={rise}>
          <StatCard icon={HelpCircle} label="Preguntas sin responder" value={`${UNANSWERED_QUESTIONS.length}`} delta="1 con más de 2 h" deltaUp={false} variant="amber" to="/comunidad" />
        </motion.div>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <motion.div variants={cascade} className="space-y-6 xl:col-span-2">
          <motion.section variants={rise} className="surface p-6 sm:p-7">
            <div className="mb-5 flex items-center justify-between gap-3">
              <h2 className="text-base font-extrabold tracking-tight">Avance promedio por grupo</h2>
              <Link
                to={`${base}/grupos`}
                className="inline-flex items-center gap-1 text-xs font-extrabold text-ink-500 transition hover:gap-2 hover:text-ink-900"
              >
                Ver grupos <ArrowRight size={13} />
              </Link>
            </div>
            <ul className="divide-y divide-line">
              {TEACHER_GROUPS.map((group) => (
                <li key={group.id} className="flex items-center gap-5 py-4">
                  <ProgressRing
                    value={group.averageProgress}
                    size={62}
                    stroke={7}
                    color="#8b5cf6"
                    centerClassName="text-sm font-extrabold tracking-tight text-ink-950"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-extrabold text-ink-900">{group.name}</p>
                    <p className="mt-0.5 font-mono text-[11px] font-bold uppercase tracking-wider text-ink-400">
                      {group.code}
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
                    {group.nextClass.split('·')[0]}
                  </span>
                </li>
              ))}
            </ul>
          </motion.section>

          <motion.section variants={rise} className="surface p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <h2 className="text-base font-extrabold tracking-tight">Actividades recientes</h2>
              <Link
                to={`${base}/actividades`}
                className="inline-flex items-center gap-1 text-xs font-extrabold text-ink-500 transition hover:gap-2 hover:text-ink-900"
              >
                Gestionar actividades <ArrowRight size={13} />
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {[TEACHER_FEED[0], TEACHER_FEED[3]].map((item) => (
                <Link
                  key={item.id}
                  to={item.to}
                  className="rounded-[20px] border border-line bg-canvas-deep/40 p-4 transition-all duration-300 ease-deluxe hover:-translate-y-0.5 hover:bg-white hover:shadow-lift"
                >
                  <p className="text-[10px] font-extrabold uppercase tracking-wider text-violet-500">
                    {item.meta}
                  </p>
                  <p className="mt-1.5 text-sm font-bold leading-snug text-ink-800">{item.title}</p>
                </Link>
              ))}
            </div>
          </motion.section>
        </motion.div>

        <motion.div variants={cascade} className="space-y-6">
          <motion.section variants={rise} className="surface p-6">
            <h3 className="text-sm font-extrabold tracking-tight">Preguntas de aprendices</h3>
            <ul className="mt-4 space-y-3">
              {UNANSWERED_QUESTIONS.map((question) => (
                <li key={question.id} className="rounded-2xl border border-line bg-canvas-deep/40 px-4 py-3">
                  <p className="flex items-start gap-2 text-xs leading-relaxed text-ink-600">
                    <MessageSquareQuote size={14} className="mt-0.5 shrink-0 text-violet-500" />
                    <span>
                      <strong className="font-bold text-ink-800">{question.student}:</strong>{' '}
                      {question.question}
                    </span>
                  </p>
                  <p className="mt-1.5 text-right text-[11px] font-bold text-ink-300">{question.time}</p>
                </li>
              ))}
            </ul>
            <Link
              to="/comunidad"
              className="btn-pill btn-pill-paper btn-pill-sm mt-4 w-full"
            >
              Responder en comunidad
              <ArrowRight size={12} />
            </Link>
          </motion.section>

          <motion.div variants={rise}>
            <ActivityFeed title="Actividad docente" items={TEACHER_FEED} />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

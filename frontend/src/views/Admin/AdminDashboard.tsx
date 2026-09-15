import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ArrowRight,
  ClipboardCheck,
  FileBarChart,
  Flag,
  LayoutGrid,
  ScrollText,
  Building2,
  BriefcaseBusiness,
  GraduationCap,
  Presentation,
  ShieldCheck,
  Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useInstitution } from '../../context/useInstitution';
import { StatCard } from '../../components/elyron/StatCard';
import { ActivityFeed } from '../../components/elyron/ActivityFeed';
import { roleLabel } from '../../model/roles';
import { ADMIN_STATS, INSTITUTION_FEED, ROLE_DISTRIBUTION } from '../../model/mock/adminData';

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

const ROLE_BAR_ICON: Record<string, LucideIcon> = {
  aprendiz: GraduationCap,
  instructor: Presentation,
  coordinador: FileBarChart,
  admin: ShieldCheck,
};

const ROLE_BAR_COLOR: Record<string, string> = {
  aprendiz: 'bg-mint-500',
  instructor: 'bg-violet-500',
  coordinador: 'bg-amber-500',
  admin: 'bg-ink-900',
};

export const AdminDashboard = () => {
  const { user } = useAuth();
  const { institution } = useInstitution();
  const firstName = (user?.name || user?.sub || 'Brey').trim().split(/\s+/)[0] || 'Brey';
  const displayName = firstName.charAt(0).toUpperCase() + firstName.slice(1);

  const hour = new Date().getHours();
  const saludo =
    hour < 12
      ? '¡Buenos días'
      : hour < 19
        ? '¡Buenas tardes'
        : '¡Buenas noches';

  const MENSAJES_DEL_DIA = [
    ['Hoy es un gran día para aprender algo nuevo y hacer realidad tus metas. ¡Tú puedes, empieza con energía!', 'Sigue con esa energía increíble: cada paso que das hoy te acerca a tu mejor versión. ¡A seguir brillando!', 'Cierra el día con la satisfacción de todo lo logrado. Descansa y mañana serás aún más grande.'],
    ['Cada día es una nueva oportunidad para ser mejor que ayer. ¡Ve por ella con toda la actitud!', 'Sigue avanzando sin perder el ritmo: lo que haces ahora ya está dando frutos. ¡No pares!', 'Hoy diste todo. Suelta el día con calma y recarga fuerzas para brillar mañana.'],
    ['La constancia vence lo que el talento no alcanza. ¡Sigue avanzando sin detenerte!', 'Tu constancia de hoy es tu mejor inversión. ¡Mantén el enfoque y verás resultados!', 'Gran jornada, Brey. Reconoce tu avance y descansa tranquilo: vas muy bien.'],
    ['Hoy vas a lograr algo grande: confía en ti y dale con todo a tus objetivos. ¡Ánimo!', 'Vas a lograr algo grande hoy: confía en tu proceso y sigue dándolo todo. ¡Ánimo!', 'Hiciste un gran esfuerzo hoy. Respira, agradece y prepárate para un mañana aún mejor.'],
    ['Pequeños pasos de hoy construyen grandes resultados mañana. ¡Sigue así, vas increíble!', 'Cada tarea que terminas suma a tu gran meta. ¡Sigue así, vas increíble!', 'Lo que avanzaste hoy se notará mañana. Buen trabajo, descansa y sigue sumando.'],
    ['Tu esfuerzo de hoy es la semilla de tus éxitos de mañana. ¡Sigue regando tu futuro!', 'Sigue regando tu futuro con buen trabajo hoy. ¡Cada esfuerzo vale la pena!', 'Cosecharás lo que sembraste hoy. Vete a descansar con la conciencia del trabajo bien hecho.'],
    ['Empieza el día con gratitud y una sonrisa: todo lo bueno está por venir. ¡Brilla!', 'Mantén esa sonrisa y el buen ánimo: tu actitud abre puertas. ¡Sigue brillando!', 'Termina el día agradeciendo lo bueno de hoy. Mañana te espera más para brillar.'],
    ['Hoy es el mejor día para dar ese primer paso que tanto esperabas. ¡Hazlo realidad!', 'Ya estás en marcha, no te detengas: ese primer paso ya lo diste. ¡Continúa!', 'Un paso a la vez. Hoy avanzaste y eso es lo que cuenta. Buen descanso, Brey.'],
    ['No busques el momento perfecto, haz que este momento sea perfecto. ¡A por ello!', 'Este es tu momento: aprovecha las horas que quedan y hazlas valer. ¡A por ello!', 'No esperes la perfección: hoy ya fue un gran día. Descansa y mañana sigues con todo.'],
    ['Cada reto de hoy te hace más fuerte para los sueños de mañana. ¡Tú puedes con todo!', 'Cada reto que superas hoy te hace más fuerte. ¡Tú puedes con todo!', 'Superaste retos hoy: eso te hace más fuerte. Buen descanso y a por mañana.'],
    ['Haz que hoy cuente: una decisión, una acción, un gran avance. ¡Estás a punto de lograrlo!', 'Haz que las horas que quedan cuenten: una acción más y avanzas. ¡Estás muy cerca!', 'Hiciste que hoy contara. Reconoce tu avance y descansa con satisfacción.'],
    ['La mejor versión de ti se construye hoy, paso a paso. ¡Sigue adelante con fe!', 'Sigue construyendo tu mejor versión en estas horas. ¡Paso a paso, con fe!', 'Hoy construiste tu mejor versión paso a paso. Descansa y mañana sigues con fe.'],
  ];
  const diasDesdeEpoch = Math.floor(Date.now() / 86_400_000);
  const franja = hour < 12 ? 0 : hour < 19 ? 1 : 2;
  const mensajeMotivador =
    MENSAJES_DEL_DIA[diasDesdeEpoch % MENSAJES_DEL_DIA.length][franja];

  const totalUsers = ROLE_DISTRIBUTION.reduce((sum, row) => sum + row.count, 0);

  return (
    <motion.div variants={sequence} initial="hidden" animate="visible" className="space-y-7">
      <motion.header variants={rise} className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="admin-eyebrow text-[11px] admin-muted">
            Panel administrativo · {institution.shortName}
          </p>
          <h1 className="admin-heading mt-2 text-3xl text-ink-950 sm:text-[38px]">
            {saludo}, {displayName}
          </h1>
          <p className="mt-2 max-w-xl text-sm font-medium admin-muted">
            {mensajeMotivador}
          </p>
        </div>
        <Link to="/admin/reportes" className="btn-pill btn-pill-ink hidden shrink-0 sm:inline-flex">
          Ver reportes
          <ArrowRight size={15} />
        </Link>
      </motion.header>

      <motion.section variants={cascade} className="grid grid-cols-2 gap-4 xl:grid-cols-4">
        <motion.div variants={rise}>
          <StatCard icon={Users} label="Usuarios activos" value={`${ADMIN_STATS.activeUsers}`} delta="+12 esta semana" variant="violet" to="/admin/usuarios" />
        </motion.div>
        <motion.div variants={rise}>
          <StatCard icon={LayoutGrid} label="Grupos activos" value={`${ADMIN_STATS.activeGroups}`} delta="3 nuevos este periodo" variant="mint" to="/admin/programas" />
        </motion.div>
        <motion.div variants={rise}>
          <StatCard icon={ClipboardCheck} label="Evidencias por revisar" value={`${ADMIN_STATS.pendingEvidence}`} delta="8 llegaron hoy" deltaUp variant="ink" to="/admin/reportes" />
        </motion.div>
        <motion.div variants={rise}>
          <StatCard icon={Flag} label="Reportes sin resolver" value={`${ADMIN_STATS.openReports}`} delta="2 son críticos" deltaUp={false} variant="amber" to="/admin/moderacion" />
        </motion.div>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <motion.section variants={rise} className="surface p-6 sm:p-7 xl:col-span-2">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-base font-extrabold tracking-tight">Distribución de usuarios por rol</h2>
            <Link
              to="/admin/usuarios"
              className="inline-flex items-center gap-1 text-xs font-extrabold text-ink-500 transition hover:gap-2 hover:text-ink-900"
            >
              Ver usuarios <ArrowRight size={13} />
            </Link>
          </div>
          <ul className="space-y-5">
            {ROLE_DISTRIBUTION.map((row) => {
              const Icon = ROLE_BAR_ICON[row.roleKey] ?? Users;
              const pct = Math.round((row.count / totalUsers) * 100);
              return (
                <li key={row.roleKey}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="flex items-center gap-2 text-sm font-extrabold text-ink-900">
                      <Icon size={15} className="text-ink-400" />
                      {roleLabel(row.roleKey)}
                    </p>
                    <p className="text-xs font-bold text-ink-400">
                      {row.count} · {pct}%
                    </p>
                  </div>
                  <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-canvas-deep">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${pct}%` }}
                      transition={{ duration: 0.9, ease: EASE, delay: 0.25 }}
                      className={`h-full rounded-full ${ROLE_BAR_COLOR[row.roleKey]}`}
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </motion.section>

        <motion.div variants={cascade} className="space-y-6">
          <motion.section variants={rise} className="surface p-6">
            <h3 className="text-sm font-extrabold tracking-tight">Accesos rápidos</h3>
            <div className="mt-4 space-y-2.5">
              {[
                { to: '/admin/instituciones', label: 'Gestionar instituciones', icon: Building2 },
                { to: '/admin/empresas', label: 'Convenios con empresas', icon: BriefcaseBusiness },
                { to: '/admin/auditoria', label: 'Registro de auditoría', icon: ScrollText },
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 rounded-[20px] border border-line bg-canvas-deep/40 p-4 transition-all duration-300 ease-deluxe hover:-translate-y-0.5 hover:bg-white hover:shadow-lift"
                >
                  <item.icon size={17} className="shrink-0 text-ink-500" />
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink-800">
                    {item.label}
                  </span>
                  <ArrowRight size={14} className="shrink-0 text-ink-300" />
                </Link>
              ))}
            </div>
          </motion.section>

          <motion.div variants={rise}>
            <ActivityFeed title="Actividad institucional" items={INSTITUTION_FEED} />
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

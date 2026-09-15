import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Activity,
  BookOpen,
  GraduationCap,
  Users,
} from 'lucide-react';
import { ADMIN_STATS, INSTITUTION_FEED } from '../../model/mock/adminData';
import { PROGRAMS } from '../../model/mock/academicData';
import { ActivityFeed } from '../../components/elyron/ActivityFeed';
import { StatCard } from '../../components/elyron/StatCard';

const EASE = [0.22, 1, 0.36, 1] as const;

const sequence: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.06 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const CHART_DATA = PROGRAMS.map((prog) => ({
  name: prog.name.length > 20 ? prog.name.slice(0, 18) + '…' : prog.name,
  aprendices: prog.apprenticeCount,
  instructores: prog.instructorCount,
}));

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number; name: string }>; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="surface rounded-xl px-4 py-3 shadow-lift">
      <p className="text-xs font-extrabold text-ink-900">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="text-xs font-medium text-ink-500">
          {entry.name === 'aprendices' ? 'Aprendices' : 'Instructores'}: {entry.value}
        </p>
      ))}
    </div>
  );
};

export const ReportesAdminView = () => {
  return (
    <motion.div variants={sequence} initial="hidden" animate="visible" className="mx-auto max-w-5xl space-y-7">
      <motion.header variants={rise}>
        <p className="admin-eyebrow text-[11px] admin-muted">Administración</p>
        <h1 className="admin-heading mt-2 text-3xl text-ink-950 sm:text-4xl">
          Reportes y métricas
        </h1>
        <p className="mt-2 text-sm font-medium admin-muted">
          Indicadores clave de la plataforma y actividad institucional reciente.
        </p>
      </motion.header>

      <motion.section variants={sequence} className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <motion.div variants={rise}>
          <StatCard icon={Users} label="Usuarios activos" value={`${ADMIN_STATS.activeUsers}`} delta="+12 esta semana" variant="violet" />
        </motion.div>
        <motion.div variants={rise}>
          <StatCard icon={BookOpen} label="Evidencias entregadas" value="142" delta="este periodo" variant="mint" />
        </motion.div>
        <motion.div variants={rise}>
          <StatCard icon={GraduationCap} label="Avance promedio" value="68%" delta="+4% vs anterior" variant="amber" />
        </motion.div>
        <motion.div variants={rise}>
          <StatCard icon={Activity} label="Participación comunidad" value="83%" delta="de usuarios activos" variant="ink" />
        </motion.div>
      </motion.section>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <motion.section variants={rise} className="surface p-6 sm:p-7 xl:col-span-2">
          <h2 className="text-sm font-extrabold tracking-tight">Matrícula por programa</h2>
          <p className="mt-1 text-xs font-medium text-ink-400">Distribución de aprendices e instructores por programa formativo.</p>
          <div className="mt-6 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={CHART_DATA} barCategoryGap="25%">
                <CartesianGrid strokeDasharray="3 3" stroke="#e8e8e4" vertical={false} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#71717a', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: '#a1a1aa', fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(0,0,0,0.03)' }} />
                <Bar dataKey="aprendices" fill="#22c55e" radius={[6, 6, 0, 0]} name="aprendices" />
                <Bar dataKey="instructores" fill="#8b5cf6" radius={[6, 6, 0, 0]} name="instructores" />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex items-center gap-4 text-xs font-medium text-ink-400">
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-mint-500" /> Aprendices
            </span>
            <span className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-violet-500" /> Instructores
            </span>
          </div>
        </motion.section>

        <motion.div variants={rise}>
          <ActivityFeed title="Actividad institucional" items={INSTITUTION_FEED} />
        </motion.div>
      </div>
    </motion.div>
  );
};

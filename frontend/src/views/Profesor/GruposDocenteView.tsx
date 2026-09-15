import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CalendarClock, Users } from 'lucide-react';
import { ProgressRing } from '../../components/elyron/ProgressRing';
import { useAuth } from '../../context/useAuth';
import { teacherBasePath } from '../../model/navigation';
import {
  STUDENTS_BY_GROUP,
  TEACHER_GROUPS,
} from '../../model/mock/teacherData';

export const GruposDocenteView = () => {
  const { activeRole } = useAuth();
  const base = teacherBasePath(activeRole);
  return (
    <div className="mx-auto max-w-5xl space-y-7">
    <header>
      <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">
        Enseñanza
      </p>
      <h1 className="display mt-2 text-3xl text-ink-950 sm:text-4xl">
        Mis <span className="italic">grupos</span>
      </h1>
      <p className="mt-2 text-sm font-medium text-ink-500">
        {TEACHER_GROUPS.length} grupos a tu cargo ·{' '}
        {TEACHER_GROUPS.reduce((sum, group) => sum + group.learners, 0)} aprendices
      </p>
    </header>

    <div className="space-y-5">
      {TEACHER_GROUPS.map((group) => (
        <motion.article
          key={group.id}
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="surface flex flex-col gap-6 p-6 lg:flex-row lg:items-center"
        >
          <div className="flex min-w-0 flex-1 items-center gap-5">
            <ProgressRing
              value={group.averageProgress}
              size={78}
              stroke={8}
              color="#8b5cf6"
              centerClassName="text-lg font-extrabold tracking-tight text-ink-950"
              subLabel="avance"
            />
            <div className="min-w-0">
              <p className="font-mono text-[11px] font-bold uppercase tracking-wider text-ink-400">
                {group.code}
              </p>
              <h2 className="mt-0.5 truncate text-base font-extrabold tracking-tight text-ink-950">
                {group.name}
              </h2>
              <p className="mt-0.5 truncate text-xs font-medium text-ink-500">{group.program}</p>
              <div className="mt-2 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-ink-500">
                  <Users size={13} className="text-violet-500" />
                  {group.learners} aprendices
                </span>
                <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-ink-500">
                  <CalendarClock size={13} className="text-violet-500" />
                  {group.nextClass}
                </span>
              </div>
            </div>
          </div>

          <div className="min-w-0 border-t border-line pt-4 lg:max-w-xs lg:border-l lg:border-t-0 lg:pl-6 lg:pt-0">
            <p className="mb-2 text-[10px] font-extrabold uppercase tracking-wider text-ink-400">
              Aprendices destacados
            </p>
            <ul className="space-y-1.5">
              {(STUDENTS_BY_GROUP[group.id] ?? []).slice(0, 3).map((student) => (
                <li key={student.id} className="flex items-center justify-between gap-3">
                  <span className="truncate text-xs font-semibold text-ink-600">{student.name}</span>
                  <span className="shrink-0 font-mono text-[11px] font-extrabold text-violet-600">
                    {student.progress}%
                  </span>
                </li>
              ))}
            </ul>
            <Link
              to={`${base}/calificaciones`}
              className="mt-3 inline-flex items-center gap-1 text-[11px] font-extrabold text-ink-500 transition hover:gap-2 hover:text-ink-900"
            >
              Ver evidencias del grupo <ArrowRight size={11} />
            </Link>
          </div>
        </motion.article>
      ))}
    </div>
    </div>
  );
};

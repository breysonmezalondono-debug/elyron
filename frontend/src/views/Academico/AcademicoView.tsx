import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CalendarDays,
  ChevronDown,
  CircleCheck,
  GraduationCap,
  Play,
} from 'lucide-react';
import { useInstitution } from '../../context/useInstitution';
import { pluralize } from '../../model/institution';
import { ACADEMIC_GROUPS } from '../../model/mock/academicData';
import type { AcademicGroup, Competency } from '../../model/mock/academicData';
import { IconTile } from '../../components/elyron/IconTile';
import { ProgressRing } from '../../components/elyron/ProgressRing';

const EASE = [0.22, 1, 0.36, 1] as const;

const weightedProgress = (group: AcademicGroup): number => {
  const totalWeight = group.competencies.reduce((sum, c) => sum + c.weight, 0);
  if (totalWeight === 0) return 0;
  return Math.round(
    group.competencies.reduce((sum, c) => sum + c.progress * c.weight, 0) / totalWeight,
  );
};

interface CompetencyBlockProps {
  competency: Competency;
  outcomeTerm: string;
  competencyTerm: string;
}

const CompetencyBlock = ({ competency, outcomeTerm, competencyTerm }: CompetencyBlockProps) => {
  const doneCount = competency.outcomes.filter((o) => o.done).length;

  return (
    <article className="rounded-3xl border border-line bg-canvas-deep/40 p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <h3 className="max-w-md text-sm font-extrabold leading-snug">{competency.name}</h3>
        <span className="rounded-full bg-white px-2.5 py-1 text-[11px] font-extrabold text-ink-600 ring-1 ring-line">
          Pondera {competency.weight}%
        </span>
      </div>

      <div className="mt-4">
        <div className="flex items-center gap-4">
          <span className="display w-14 shrink-0 text-right text-[30px] leading-none text-ink-950">
            {competency.progress}%
          </span>
          <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-line">
            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: `${competency.progress}%` }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: EASE }}
              className="h-full rounded-full bg-mint-500"
            />
          </div>
        </div>
        <p className="mt-2 text-[11px] font-semibold text-ink-400">
          {doneCount} de {competency.outcomes.length} completos · {outcomeTerm}
        </p>
      </div>

      <ul className="mt-4 space-y-2 border-t border-line pt-4">
        {competency.outcomes.map((outcome) => (
          <li key={outcome.id} className="flex items-center gap-2.5 text-[13px] font-medium text-ink-600">
            <CircleCheck
              size={16}
              strokeWidth={2.2}
              className={outcome.done ? 'shrink-0 text-mint-600' : 'shrink-0 text-ink-300'}
            />
            {outcome.name}
          </li>
        ))}
      </ul>

      <Link to="/lecciones" className="btn-pill btn-pill-paper btn-pill-sm mt-4">
        <Play size={12} fill="currentColor" />
        Practicar {competencyTerm}
      </Link>
    </article>
  );
};

export const AcademicoView = () => {
  const { terminology } = useInstitution();
  const [openGroups, setOpenGroups] = useState(['grp-adsi']);

  const toggle = (id: string) =>
    setOpenGroups((prev) =>
      prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id],
    );

  const groupPlural = pluralize(terminology.group.toLowerCase());
  const competencyPlural = pluralize(terminology.competency.toLowerCase());

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <header>
        <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">
          Gestión académica
        </p>
        <h1 className="display mt-2 text-3xl text-ink-950 sm:text-4xl">
          Tus {groupPlural} & <span className="italic">{competencyPlural}</span>
        </h1>
        <p className="mt-2 max-w-xl text-sm font-medium text-ink-500">
          Estructura Institución → {terminology.program} → {terminology.period} →{' '}
          {terminology.group} → {terminology.competency}. Toca una{' '}
          {terminology.group.toLowerCase()} para explorar sus {competencyPlural} y avanzar en
          cada {terminology.outcome.toLowerCase()}.
        </p>
      </header>

      {ACADEMIC_GROUPS.map((group) => {
        const isOpen = openGroups.includes(group.id);
        return (
          <motion.section
            key={group.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="surface overflow-hidden"
          >
            <button
              type="button"
              onClick={() => toggle(group.id)}
              className="flex w-full items-center gap-4 p-6 text-left transition hover:bg-canvas-deep/30"
            >
              <IconTile icon={GraduationCap} variant={isOpen ? 'mint' : 'paper'} size="md" className="!size-12" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="truncate text-base font-extrabold tracking-tight">{group.name}</h2>
                  <span className="rounded-full border border-line bg-white px-2.5 py-0.5 font-mono text-[11px] font-bold text-ink-500">
                    {group.code}
                  </span>
                </div>
                <p className="mt-1 flex items-center gap-1.5 text-xs font-semibold text-ink-400">
                  <CalendarDays size={13} />
                  {group.startDate} → {group.endDate} · {group.competencies.length} {competencyPlural}
                </p>
              </div>
              <span className="hidden rounded-full bg-mint-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider text-mint-700 ring-1 ring-mint-200 sm:inline-block">
                {group.status}
              </span>
              <span className="relative shrink-0" title={`Avance ponderado del ${terminology.group.toLowerCase()}`}>
                <ProgressRing value={weightedProgress(group)} size={48} stroke={5} color="#18181b" />
              </span>
              <motion.span animate={{ rotate: isOpen ? 180 : 0 }} className="shrink-0 text-ink-400">
                <ChevronDown size={18} />
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <div className="space-y-4 border-t border-line p-6 pt-5">
                    {group.competencies.map((competency) => (
                      <CompetencyBlock
                        key={competency.id}
                        competency={competency}
                        outcomeTerm={terminology.outcome}
                        competencyTerm={terminology.competency.toLowerCase()}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        );
      })}
    </div>
  );
};

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ChevronDown,
  ChevronRight,
  GraduationCap,
  LayoutGrid,
  Search,
  Users,
} from 'lucide-react';
import { INSTITUTIONS } from '../../model/mock/orgData';
import { PROGRAMS, ACADEMIC_GROUPS } from '../../model/mock/academicData';
import type { Program, AcademicGroup } from '../../model/mock/academicData';
import { terminologyFor } from '../../model/institution';
import { StatCard } from '../../components/elyron/StatCard';

const EASE = [0.22, 1, 0.36, 1] as const;

const GROUP_STATUS_BADGE: Record<string, string> = {
  Activa: 'bg-mint-50 text-mint-700 ring-mint-200',
  Finalizada: 'bg-canvas-deep text-ink-500 ring-line-strong',
};

const INSTRUCTOR_NAMES: Record<string, string> = {
  'grp-adsi': 'Gabriel Beltrán',
  'grp-adsi-2': 'Ana Martínez',
  'grp-adsi-old': 'Gabriel Beltrán',
  'grp-adsi-3': 'Carlos Mendoza',
  'grp-redes': 'Carlos Mendoza',
  'grp-ing': 'Julián Restrepo',
};

const INSTRUCTOR_COUNTS: Record<string, number> = {
  'grp-adsi': 32,
  'grp-adsi-2': 38,
  'grp-adsi-old': 45,
  'grp-adsi-3': 32,
  'grp-redes': 20,
  'grp-ing': 24,
};

export const ProgramasAdminView = () => {
  const [query, setQuery] = useState('');
  const [expandedInst, setExpandedInst] = useState<Record<string, boolean>>(
    () => Object.fromEntries(INSTITUTIONS.map((i) => [i.id, true])),
  );
  const [expandedProg, setExpandedProg] = useState<Record<string, boolean>>({});

  const normalized = query.trim().toLowerCase();

  const totalPrograms = PROGRAMS.length;
  const activeGroups = ACADEMIC_GROUPS.filter((g) => g.status === 'Activa').length;
  const totalInstructors = PROGRAMS.reduce((sum, p) => sum + p.instructorCount, 0);
  const totalApprentices = PROGRAMS.reduce((sum, p) => sum + p.apprenticeCount, 0);

  const filteredPrograms = useMemo(() => {
    if (!normalized) return PROGRAMS;
    return PROGRAMS.filter((prog) => {
      if (prog.name.toLowerCase().includes(normalized)) return true;
      return prog.groups.some(
        (g) =>
          g.code.toLowerCase().includes(normalized) ||
          g.name.toLowerCase().includes(normalized),
      );
    });
  }, [normalized]);

  const toggleInst = (id: string) => setExpandedInst((p) => ({ ...p, [id]: !p[id] }));
  const toggleProg = (id: string) => setExpandedProg((p) => ({ ...p, [id]: !p[id] }));

  const programsByInstitution = useMemo(() => {
    const map = new Map<string, Program[]>();
    for (const prog of filteredPrograms) {
      const list = map.get(prog.institutionId) ?? [];
      list.push(prog);
      map.set(prog.institutionId, list);
    }
    return map;
  }, [filteredPrograms]);

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
            Programas y grupos
          </h1>
          <p className="mt-2 text-sm font-medium admin-muted">
            {totalPrograms} programas en {INSTITUTIONS.length} instituciones, {activeGroups} grupos activos.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar programa o ficha…"
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
        <StatCard icon={GraduationCap} label="Programas" value={`${totalPrograms}`} variant="violet" />
        <StatCard icon={LayoutGrid} label="Grupos activos" value={`${activeGroups}`} variant="mint" />
        <StatCard icon={Users} label="Instructores" value={`${totalInstructors}`} variant="amber" />
        <StatCard icon={Users} label="Aprendices" value={`${totalApprentices}`} delta="+12 este mes" variant="ink" />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.12, ease: EASE }}
        className="space-y-4"
      >
        {INSTITUTIONS.map((inst) => {
          const programs = programsByInstitution.get(inst.id) ?? [];
          const isOpen = expandedInst[inst.id] !== false;
          const term = terminologyFor(inst.type);

          return (
            <div key={inst.id} className="surface overflow-hidden">
              <button
                type="button"
                onClick={() => toggleInst(inst.id)}
                className="flex w-full items-center gap-3 p-5 text-left transition hover:bg-canvas-deep/30"
              >
                <span className="size-5 shrink-0 text-ink-400">
                  {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </span>
                <div className="min-w-0 flex-1">
                  <h2 className="text-sm font-extrabold tracking-tight text-ink-950">
                    {inst.name}
                  </h2>
                  <p className="text-xs font-medium text-ink-400">
                    {inst.shortName} · {programs.length} {programs.length === 1 ? term.program : `${term.program}s`}
                  </p>
                </div>
                <span className="rounded-full bg-canvas-deep px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink-500 ring-1 ring-line-strong">
                  {inst.type}
                </span>
              </button>

              <AnimatePresence>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className="overflow-hidden"
                  >
                    <div className="border-t border-line px-5 pb-5 pt-3">
                      {programs.length === 0 ? (
                        <p className="py-6 text-center text-sm font-medium text-ink-400">
                          Sin programas que coincidan con la búsqueda.
                        </p>
                      ) : (
                        <div className="space-y-3">
                          {programs.map((prog) => {
                            const progOpen = expandedProg[prog.id] !== false;
                            const activeGrps = prog.groups.filter((g) => g.status === 'Activa').length;

                            return (
                              <div key={prog.id} className="rounded-2xl border border-line bg-white/60">
                                <button
                                  type="button"
                                  onClick={() => toggleProg(prog.id)}
                                  className="flex w-full items-center gap-3 p-4 text-left transition hover:bg-canvas-deep/30"
                                >
                                  <span className="size-4 shrink-0 text-ink-300">
                                    {progOpen ? <ChevronDown size={15} /> : <ChevronRight size={15} />}
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <h3 className="text-sm font-extrabold text-ink-900">{prog.name}</h3>
                                    <p className="text-xs font-medium text-ink-400">
                                      {activeGrps} {term.group.toLowerCase()}s activos · {prog.apprenticeCount} {term.apprentice.toLowerCase()}s
                                    </p>
                                  </div>
                                </button>

                                <AnimatePresence>
                                  {progOpen && (
                                    <motion.div
                                      initial={{ height: 0, opacity: 0 }}
                                      animate={{ height: 'auto', opacity: 1 }}
                                      exit={{ height: 0, opacity: 0 }}
                                      transition={{ duration: 0.25, ease: EASE }}
                                      className="overflow-hidden"
                                    >
                                      <div className="space-y-2 border-t border-line px-4 pb-4 pt-3">
                                        {prog.groups.map((group) => (
                                          <GroupRow
                                            key={group.id}
                                            group={group}
                                            term={term.group}
                                            instructor={INSTRUCTOR_NAMES[group.id] ?? 'Sin asignar'}
                                            apprenticeCount={INSTRUCTOR_COUNTS[group.id] ?? 0}
                                          />
                                        ))}
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
};

interface GroupRowProps {
  group: AcademicGroup;
  term: string;
  instructor: string;
  apprenticeCount: number;
}

const GroupRow = ({ group, term, instructor, apprenticeCount }: GroupRowProps) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, ease: EASE }}
    className="flex flex-col gap-3 rounded-xl border border-line bg-canvas-deep/30 p-4 sm:flex-row sm:items-center"
  >
    <div className="min-w-0 flex-1">
      <div className="flex flex-wrap items-center gap-2">
        <h4 className="text-sm font-extrabold text-ink-900">{group.code}</h4>
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${GROUP_STATUS_BADGE[group.status]}`}>
          {group.status}
        </span>
      </div>
      <p className="mt-1 text-xs font-medium text-ink-400">{group.name}</p>
    </div>
    <div className="flex shrink-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs font-medium text-ink-400">
      <span>
        {term}: <strong className="font-extrabold text-ink-700">{instructor}</strong>
      </span>
      <span>
        {apprenticeCount} aprendices
      </span>
      <span className="text-ink-300">
        {group.startDate} → {group.endDate}
      </span>
    </div>
  </motion.div>
);

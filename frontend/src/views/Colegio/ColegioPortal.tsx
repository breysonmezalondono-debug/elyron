import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  CalendarDays,
  ClipboardCheck,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  Megaphone,
  MessagesSquare,
  PartyPopper,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useInstitution } from '../../context/useInstitution';
import { roleLabel } from '../../model/roles';
import decodeJwt from '../../utils/jwt';
import { getToken } from '../../api';

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

interface RealTokenPayload {
  role?: string;
  institucion?: string;
  grupo_id?: string | null;
  es_personero?: boolean;
  es_personero_suplente?: boolean;
}

const MODULES_BY_ROLE: Record<string, { label: string; icon: typeof Users }[]> = {
  estudiante: [
    { label: 'Mis amigos y mi grupo', icon: Users },
    { label: 'Remisiones de orientación', icon: ClipboardCheck },
    { label: 'Comunicados del rector', icon: Megaphone },
  ],
  docente: [
    { label: 'Mis grupos', icon: Users },
    { label: 'Calificaciones', icon: ClipboardCheck },
    { label: 'Remisiones hacia mí', icon: Megaphone },
  ],
  orientador: [
    { label: 'Remisiones de orientación', icon: ClipboardCheck },
    { label: 'Estudiantes acompañados', icon: Users },
  ],
  coordinador_convivencia: [
    { label: 'Remisiones de convivencia', icon: ClipboardCheck },
    { label: 'Seguimiento de estudiantes', icon: Users },
  ],
  rector: [
    { label: 'Gestión de grupos', icon: Users },
    { label: 'Docentes y asignaciones', icon: GraduationCap },
    { label: 'Remisiones de orientación', icon: ClipboardCheck },
  ],
};

export const ColegioPortal = () => {
  const { user, activeRole } = useAuth();
  const { institution } = useInstitution();
  const name = user?.name || user?.sub || 'Bienvenido';
  const firstName = name.split(' ')[0];

  const realPayload = decodeJwt(
    getToken() ?? '',
  ) as RealTokenPayload | null;

  const role = activeRole ?? 'estudiante';
  const realRole = realPayload?.role;
  const esPersonero = (realPayload?.es_personero && realRole === 'estudiante') || false;
  const grupoCode = realPayload?.grupo_id ? 'grupo asignado' : null;

  const modules = MODULES_BY_ROLE[role] ?? [];
  const isEstudiante = role === 'estudiante';

  return (
    <motion.div variants={sequence} initial="hidden" animate="visible" className="space-y-7">
      <motion.header variants={rise} className="flex flex-wrap items-end justify-between gap-6">
        <div>
          <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">
            Colegio · {institution.shortName}
          </p>
          <h1 className="display mt-2 text-3xl leading-tight text-ink-950 sm:text-[40px]">
            Hola, {firstName}.
            <span className="mt-1 block italic text-mint-600 text-xl sm:text-2xl">
              {roleLabel(role, 'colegio')} · {institution.name}
            </span>
          </h1>
        </div>
        {esPersonero && (
          <span className="inline-flex shrink-0 items-center gap-2 rounded-full bg-mint-50 px-4 py-2 text-xs font-extrabold text-mint-700 ring-1 ring-mint-200">
            <ShieldCheck size={14} />
            Personero(a) de {grupoCode ?? 'tu grupo'}
          </span>
        )}
      </motion.header>

      <motion.section variants={cascade} className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <motion.div variants={rise} className="space-y-6 xl:col-span-2">
          <motion.section variants={rise} className="surface p-6 sm:p-7">
            <h2 className="text-base font-extrabold tracking-tight">Accesos rápidos</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              {[
                { to: '/comunidad', label: 'Comunidad educativa', icon: MessagesSquare },
                { to: '/calendario', label: 'Calendario', icon: CalendarDays },
                { to: '/eventos', label: 'Eventos', icon: PartyPopper },
                ...(isEstudiante
                  ? [{ to: '/ofertas', label: 'Bolsa de empleo', icon: BriefcaseBusiness }]
                  : []),
              ].map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  className="flex items-center gap-3 rounded-[20px] border border-line bg-canvas-deep/40 p-4 transition-all duration-300 ease-deluxe hover:-translate-y-0.5 hover:bg-white hover:shadow-lift"
                >
                  <item.icon size={17} className="shrink-0 text-mint-600" />
                  <span className="min-w-0 flex-1 truncate text-sm font-bold text-ink-800">
                    {item.label}
                  </span>
                  <ArrowRight size={14} className="shrink-0 text-ink-300" />
                </Link>
              ))}
            </div>
          </motion.section>

          <motion.section variants={rise} className="surface p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-base font-extrabold tracking-tight">
                Módulos del Colegio
              </h2>
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-amber-700 ring-1 ring-amber-200">
                En construcción
              </span>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2">
              {modules.map((mod) => (
                <li
                  key={mod.label}
                  className="flex items-center gap-3 rounded-[18px] border border-dashed border-line-strong/70 bg-canvas-deep/30 p-4"
                >
                  <mod.icon size={17} className="shrink-0 text-ink-400" />
                  <span className="text-sm font-bold text-ink-600">{mod.label}</span>
                </li>
              ))}
            </ul>
            {(isEstudiante || role === 'docente' || role === 'orientador') && (
              <p className="mt-4 inline-flex items-center gap-2 text-xs font-bold text-ink-400">
                <MessagesSquare size={13} />
                Tu chat institucional llegará con los módulos de remisiones
              </p>
            )}
          </motion.section>
        </motion.div>

        <motion.div variants={cascade} className="space-y-6">
          <motion.div variants={rise} className="elevated-pop overflow-hidden rounded-[24px] bg-ink-950 p-6 text-white">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-2xl bg-mint-500/15 text-mint-400">
                <Building2 size={20} />
              </span>
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-wider text-white/40">
                  Institución
                </p>
                <p className="text-sm font-extrabold">{institution.name}</p>
              </div>
            </div>
            <div className="mt-5 space-y-2.5 text-[11px] font-semibold text-white/60">
              <p className="flex items-center gap-2">
                <LayoutDashboard size={13} className="text-mint-400" />
                Rol activo: {roleLabel(role, 'colegio')}
              </p>
              {grupoCode && (
                <p className="flex items-center gap-2">
                  <Users size={13} className="text-mint-400" />
                  {roleLabel('estudiante', 'colegio')} con {grupoCode}
                </p>
              )}
              <p className="flex items-center gap-2">
                <FolderOpen size={13} className="text-mint-400" />
                Portal de {institution.type}
              </p>
            </div>
          </motion.div>
        </motion.div>
      </motion.section>
    </motion.div>
  );
};
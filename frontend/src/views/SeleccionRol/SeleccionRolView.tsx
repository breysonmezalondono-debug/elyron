import { useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import type { Variants } from 'framer-motion';
import { ArrowRight, FileBarChart, GraduationCap, Presentation, ShieldCheck } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useInstitution } from '../../context/useInstitution';
import { roleLabel } from '../../model/roles';
import {
  ROLE_ACCENT,
  ROLE_DESCRIPTION,
  portalHomeForRole,
  requiresRoleSelection,
} from '../../model/permissions';
import { getInstitution } from '../../model/mock/orgData';
import { IconTile } from '../../components/elyron/IconTile';
import type { IconTileVariant } from '../../components/elyron/IconTile';
import { Elir } from '../../components/elyron/Elir';

const EASE = [0.22, 1, 0.36, 1] as const;

const sequence: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.09, delayChildren: 0.08 } },
};

const rise: Variants = {
  hidden: { opacity: 0, y: 22 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
};

const ROLE_ICONS: Record<string, LucideIcon> = {
  admin: ShieldCheck,
  coordinador: FileBarChart,
  instructor: Presentation,
  aprendiz: GraduationCap,
};

export const SeleccionRolView = () => {
  const {
    user,
    isAuthenticated,
    availableRoles,
    activeRole,
    selectRole,
    clearActiveRole,
  } = useAuth();
  const { institution } = useInstitution();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && !activeRole && !requiresRoleSelection(availableRoles)) {
      if (availableRoles.length > 0) selectRole(availableRoles[0].roleKey);
    }
  }, [isAuthenticated, activeRole, availableRoles, selectRole]);

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (activeRole && availableRoles.length <= 1) {
    return <Navigate to={portalHomeForRole(activeRole)} replace />;
  }

  const name = user?.name || user?.sub || 'Usuario';

  const enterAs = (roleKey: string) => {
    clearActiveRole();
    selectRole(roleKey);
    navigate(portalHomeForRole(roleKey), { replace: true });
  };

  return (
    <div className="grid min-h-screen bg-canvas lg:grid-cols-[1.05fr_1fr]">
      <aside className="relative hidden overflow-hidden bg-ink-950 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute -left-20 -top-24 size-80 rounded-full bg-mint-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -right-16 size-96 rounded-full bg-violet-500/10 blur-3xl" />

        <p className="relative text-xs font-extrabold uppercase tracking-[0.22em] text-mint-400">
          Elyron · Plataforma educativa
        </p>

        <div className="relative flex flex-col items-start gap-6">
          <Elir size={148} mood="happy" />
          <p className="display max-w-md text-4xl leading-tight text-white xl:text-5xl">
            Un mismo lugar,{' '}
            <span className="italic text-mint-400">varias formas</span> de
            habitarlo.
          </p>
          <p className="max-w-sm text-sm font-medium leading-relaxed text-white/60">
            Cada rol abre su propio panel con sus permisos. Puedes cambiar de rol
            en cualquier momento desde tu perfil, sin cerrar sesión.
          </p>
        </div>

        <p className="relative text-xs font-semibold text-white/40">
          © 2026 Elyron · Aprendizaje que deja huella
        </p>
      </aside>

      <main className="flex items-center justify-center px-6 py-12">
        <motion.div
          variants={sequence}
          initial="hidden"
          animate="visible"
          className="elevated-pop w-full max-w-md rounded-[28px] bg-white p-8"
        >
          <motion.div variants={rise} className="mb-6 flex items-center gap-3 lg:hidden">
            <Elir size={38} float={false} mood="happy" />
            <span className="text-lg font-extrabold tracking-tight text-ink-950">
              Elyron<span className="text-mint-500">.</span>
            </span>
          </motion.div>

          <motion.div variants={rise}>
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-ink-400">
              Último paso
            </p>
            <h1 className="display mt-2 text-3xl leading-tight text-ink-950">
              ¿Con qué rol quieres entrar hoy,{' '}
              <span className="italic">{name.split(' ')[0]}</span>?
            </h1>
            <p className="mt-1.5 text-sm font-medium text-ink-500">
              Tu cuenta tiene varios accesos. Elige con cuál trabajarás hoy.
            </p>
          </motion.div>

          <motion.div variants={rise} className="mt-7 space-y-3">
            {availableRoles.map(({ roleKey, institutionId }) => {
              const sessionInstitution =
                getInstitution(institutionId) ?? institution;
              const Icon = ROLE_ICONS[roleKey] ?? GraduationCap;
              const accent: IconTileVariant = ROLE_ACCENT[roleKey] ?? 'mint';
              return (
                <button
                  key={`${roleKey}-${institutionId}`}
                  type="button"
                  onClick={() => enterAs(roleKey)}
                  className={`group flex w-full items-center gap-4 rounded-[22px] border p-4 text-left transition-all duration-300 ease-deluxe hover:-translate-y-0.5 hover:shadow-lift ${
                    activeRole === roleKey
                      ? 'border-mint-300 bg-mint-50/60'
                      : 'border-line bg-canvas-deep/40 hover:border-line-strong hover:bg-white'
                  }`}
                >
                  <IconTile icon={Icon} variant={accent} size="md" />
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-extrabold tracking-tight text-ink-900">
                      {roleLabel(roleKey, sessionInstitution.type)}
                    </span>
                    <span className="mt-0.5 block text-xs font-medium leading-snug text-ink-500">
                      {ROLE_DESCRIPTION[roleKey] ?? 'Accede a tu panel de trabajo.'}
                    </span>
                    <span className="mt-1.5 inline-flex rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink-400 ring-1 ring-line">
                      {sessionInstitution.shortName}
                    </span>
                  </span>
                  <ArrowRight
                    size={17}
                    className="shrink-0 text-ink-300 transition group-hover:translate-x-1 group-hover:text-mint-600"
                  />
                </button>
              );
            })}
          </motion.div>

          <motion.p variants={rise} className="mt-6 text-center text-[11px] font-semibold text-ink-400">
            Podrás cambiar de rol desde tu perfil cuando quieras, sin cerrar sesión.
          </motion.p>

          {activeRole && (
            <motion.button
              variants={rise}
              type="button"
              onClick={() => navigate(portalHomeForRole(activeRole))}
              className="mx-auto mt-3 block text-[11px] font-extrabold text-mint-600 transition-colors hover:text-mint-700"
            >
              Volver a mi panel actual
            </motion.button>
          )}
        </motion.div>
      </main>
    </div>
  );
};

import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  ChevronDown,
  PanelLeftClose,
  PanelLeftOpen,
} from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useInstitution } from '../../context/useInstitution';
import { buildNavForRole } from '../../model/navigation';
import type { NavGroupDef, NavItemDef } from '../../model/navigation';
import { roleLabel } from '../../model/roles';
import { can as roleCan } from '../../model/permissions';
import { MOCK_APRENDIZ_NIVEL } from '../../model/mock/aprendizData';
import { useTheme, accentRgbFor } from '../../theme/theme';
import { Elir } from './Elir';

const SIDEBAR_GROUPS_KEY = 'elyron_sidebar_groups';

const HOME_BASE_ROUTES = [
  '/dashboard',
  '/admin',
  '/coordinador',
  '/profesor',
  '/instructor',
  '/colegio',
];

const BLACK_PILL = 'rgb(24, 24, 27)';

const loadOpenGroups = (): Record<string, boolean> => {
  try {
    const raw = window.localStorage.getItem(SIDEBAR_GROUPS_KEY);
    return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
  } catch {
    return {};
  }
};

interface AppSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onOpenTutor: () => void;
}

export const AppSidebar = ({ collapsed, onToggle, onOpenTutor }: AppSidebarProps) => {
  const { terminology, institution } = useInstitution();
  const { user, activeRole } = useAuth();
  const isLearner = roleCan(activeRole, 'lecciones.ver');
  const GROUPS: NavGroupDef[] = buildNavForRole(activeRole, terminology, {
    es_vocero: Boolean(user?.es_vocero),
    es_vocero_suplente: Boolean(user?.es_vocero_suplente),
  });
  const name = user?.name || user?.sub || (isLearner ? 'Aprendiz' : 'Usuario');
  const initials = name.slice(0, 2).toUpperCase();
  const xpPercent = Math.round((MOCK_APRENDIZ_NIVEL.xp / MOCK_APRENDIZ_NIVEL.nextLevelXp) * 100);

  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => loadOpenGroups());

  useEffect(() => {
    window.localStorage.setItem(SIDEBAR_GROUPS_KEY, JSON.stringify(openGroups));
  }, [openGroups]);

  const toggleGroup = (title: string) => {
    setOpenGroups((prev) => ({ ...prev, [title]: !(prev[title] ?? true) }));
  };

  const isGroupOpen = (title: string) => openGroups[title] ?? true;

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 80 : 272 }}
      transition={{ type: 'spring', stiffness: 320, damping: 32 }}
      className="sticky top-0 hidden h-screen shrink-0 border-r border-line bg-canvas md:block"
    >
      <div className="flex h-full w-[272px] flex-col px-4 py-5">
        <div className="mb-7 flex h-11 items-center gap-2 px-1">
          <NavLink to="/dashboard" className="flex min-w-0 flex-1 items-center gap-3">
            <Elir size={38} float={false} mood="happy" />
            {!collapsed && (
              <span className="display truncate text-[26px] leading-none text-ink-950">
                Elyron<span className="text-mint-500">.</span>
              </span>
            )}
          </NavLink>
          {!collapsed && (
            <button
              type="button"
              aria-label="Colapsar menú"
              onClick={onToggle}
              className="grid size-8 shrink-0 place-items-center rounded-full text-ink-400 transition hover:bg-canvas-deep hover:text-ink-800"
            >
              <PanelLeftClose size={15} />
            </button>
          )}
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto overflow-x-hidden pb-2">
          {GROUPS.map((group) => {
            const open = isGroupOpen(group.title);
            return (
              <div key={group.title}>
                {collapsed ? (
                  <ul className="space-y-1">
                    {group.items.map((item) => (
                      <SidebarItem
                        key={item.to}
                        item={item}
                        collapsed
                      />
                    ))}
                  </ul>
                ) : (
                  <>
                    <button
                      type="button"
                      onClick={() => toggleGroup(group.title)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-1.5 rounded-full px-2.5 py-2 text-left transition-colors hover:bg-canvas-deep"
                    >
                      <motion.span
                        animate={{ rotate: open ? 180 : 0 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                        className="grid size-4 shrink-0 place-items-center text-ink-400"
                      >
                        <ChevronDown size={13} strokeWidth={2.4} />
                      </motion.span>
                      <span className="flex-1 truncate text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-400">
                        {group.title}
                      </span>
                      {group.items.length > 0 && (
                        <span className="shrink-0 rounded-full bg-canvas-deep px-1.5 py-px text-[9px] font-extrabold text-ink-400">
                          {group.items.length}
                        </span>
                      )}
                    </button>
                    <AnimatePresence initial={false}>
                      {open && (
                        <motion.ul
                          key="group-items"
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                          className="space-y-1 overflow-hidden"
                        >
                          {group.items.map((item) => (
                            <SidebarItem
                              key={item.to}
                              item={item}
                              collapsed={false}
                            />
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>
            );
          })}

          {isLearner && (
            <div className="border-t border-line pt-5">
              {collapsed ? (
                <button
                  type="button"
                  onClick={onOpenTutor}
                  title="Abrir a Elir, tu tutor IA"
                  className="group relative flex w-full items-center justify-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
                >
                  <span className="relative grid shrink-0 place-items-center">
                    <span className="absolute inset-0 animate-pulse-ring rounded-full bg-mint-400/40" />
                    <Elir size={22} float={false} mood="happy" />
                  </span>
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => toggleGroup('Inteligencia')}
                    aria-expanded={isGroupOpen('Inteligencia')}
                    className="flex w-full items-center gap-1.5 rounded-full px-2.5 py-2 text-left transition-colors hover:bg-canvas-deep"
                  >
                    <motion.span
                      animate={{ rotate: isGroupOpen('Inteligencia') ? 180 : 0 }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      className="grid size-4 shrink-0 place-items-center text-ink-400"
                    >
                      <ChevronDown size={13} strokeWidth={2.4} />
                    </motion.span>
                    <span className="flex-1 truncate text-[10px] font-extrabold uppercase tracking-[0.16em] text-ink-400">
                      Inteligencia
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isGroupOpen('Inteligencia') && (
                      <motion.ul
                        key="inteligencia-items"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                        className="space-y-1 overflow-hidden"
                      >
                        <li>
                          <button
                            type="button"
                            onClick={onOpenTutor}
                            className="group relative flex w-full items-center gap-3 rounded-full px-3.5 py-2.5 text-sm font-semibold text-ink-500 transition hover:text-ink-900"
                          >
                            <span className="relative grid shrink-0 place-items-center">
                              <span className="absolute inset-0 animate-pulse-ring rounded-full bg-mint-400/40" />
                              <Elir size={22} float={false} mood="happy" />
                            </span>
                            <span className="flex-1 truncate text-left">Tutor IA · Elir</span>
                          </button>
                        </li>
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>
          )}
        </nav>

        {isLearner && !collapsed && (
          <div className="mt-4 overflow-hidden rounded-[24px] bg-linear-to-br from-mint-50 via-white to-white p-4 ring-1 ring-mint-100">
            <Elir size={44} float={false} mood="happy" />
            <p className="mt-2 text-xs font-bold leading-snug text-ink-800">
              ¿Trabado en una prueba? Pregúntale a quien nunca duerme.
            </p>
            <button
              type="button"
              onClick={onOpenTutor}
              className="btn-pill btn-pill-ink btn-pill-sm mt-3 w-full"
            >
              Hablar con Elir
              <ArrowRight size={13} />
            </button>
          </div>
        )}

        <div className={`mt-4 flex items-center gap-3 ${collapsed ? 'justify-center' : 'rounded-2xl px-2 py-1'}`}>
          <NavLink
            to="/dashboard"
            title={`${name}${isLearner ? ` · Nivel ${MOCK_APRENDIZ_NIVEL.level}` : ''}`}
            className="relative shrink-0"
          >
            <span className="grid size-10 place-items-center rounded-full bg-ink-900 text-[11px] font-extrabold text-white">
              {initials}
              {isLearner && (
                <span className="absolute -bottom-0.5 -right-0.5 grid size-4 place-items-center rounded-full bg-mint-500 text-[8px] font-extrabold text-white ring-2 ring-canvas">
                  {MOCK_APRENDIZ_NIVEL.level}
                </span>
              )}
            </span>
          </NavLink>
          {!collapsed && (
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-extrabold text-ink-900">{name}</p>
              {isLearner ? (
                <>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                    Nivel {MOCK_APRENDIZ_NIVEL.level} · {MOCK_APRENDIZ_NIVEL.xp.toLocaleString('es-CO')} XP
                  </p>
                  <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-canvas-deep">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${xpPercent}%` }}
                      transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
                      className="h-full rounded-full bg-mint-500"
                    />
                  </div>
                </>
              ) : (
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
                  {roleLabel(activeRole, institution.type)} · {institution.shortName}
                </p>
              )}
            </div>
          )}
        </div>

        {collapsed && (
          <button
            type="button"
            aria-label="Expandir menú"
            onClick={onToggle}
            className="mt-4 grid w-full place-items-center rounded-full border border-line-strong/60 bg-white/60 py-2.5 text-ink-500 transition hover:bg-white hover:text-ink-800"
          >
            <PanelLeftOpen size={15} />
          </button>
        )}
      </div>
    </motion.aside>
  );
};

const SidebarItem = ({
  item,
  collapsed,
}: {
  item: NavItemDef;
  collapsed: boolean;
}) => {
  const { to, label, icon: Icon, badge } = item;
  const { accent, resolved } = useTheme();
  const isHome = HOME_BASE_ROUTES.includes(to);
  const [ar, ag, ab] = accentRgbFor(accent, resolved === 'dark');
  const pillColor = `rgb(${ar}, ${ag}, ${ab})`;
  const activeTextColor = 'var(--app-accent-ink)';
  return (
    <li key={`${to}-${collapsed}`}>
      <NavLink to={to} title={collapsed ? label : undefined} className="block">
        {({ isActive }) =>
          isHome ? (
            <span
              className={`group relative flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm transition-colors duration-500 ${
                isActive ? 'font-extrabold' : 'font-semibold'
              } text-white group-hover:text-[color:var(--app-accent-ink)]`}
            >
              <span
                className={`absolute inset-0 rounded-full ring-1 ring-white/15 transition-colors duration-1000 ease-out ${
                  isActive ? 'bg-accent' : 'bg-ink-900 group-hover:bg-accent'
                }`}
              />
              <Icon size={18} strokeWidth={2.2} className="relative z-10 shrink-0" />
              <span
                className={`relative z-10 flex-1 truncate ${collapsed ? 'pointer-events-none opacity-0' : ''}`}
              >
                {label}
              </span>
              {!collapsed && badge != null && (
                <span
                  className={`relative z-10 grid h-5 min-w-5 place-items-center rounded-full border border-white/20 px-1.5 text-[10px] font-extrabold ${
                    isActive
                      ? 'bg-white/25 text-[color:var(--app-accent-ink)]'
                      : 'bg-white/15 text-white'
                  }`}
                >
                  {badge}
                </span>
              )}
            </span>
          ) : (
            <span
              className={`relative flex items-center gap-3 rounded-full px-3.5 py-2.5 text-sm transition-colors ${
                isActive
                  ? 'font-extrabold'
                  : 'font-semibold text-ink-500 hover:text-ink-900'
              }`}
              style={isActive ? { color: activeTextColor } : undefined}
            >
              {isActive && (
                <motion.span
                  layoutId="sidebar-pill"
                  initial={{ backgroundColor: BLACK_PILL }}
                  animate={{ backgroundColor: pillColor }}
                  transition={{
                    layout: { type: 'spring', stiffness: 420, damping: 36 },
                    backgroundColor: { duration: 1.2, ease: [0.22, 1, 0.36, 1] },
                  }}
                  className="absolute inset-0 rounded-full ring-1 ring-white/15"
                />
              )}
              <Icon
                size={18}
                strokeWidth={2.2}
                className="relative z-10 shrink-0"
                style={isActive ? { color: activeTextColor } : undefined}
              />
              <span
                className={`relative z-10 flex-1 truncate ${collapsed ? 'pointer-events-none opacity-0' : ''}`}
              >
                {label}
              </span>
              {!collapsed && badge != null && (
                <span
                  className={`relative z-10 grid h-5 min-w-5 place-items-center rounded-full px-1.5 text-[10px] font-extrabold ${
                    isActive ? '' : 'bg-canvas-deep text-ink-500'
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: 'rgba(255, 255, 255, 0.22)', color: 'var(--app-accent-ink)' }
                      : undefined
                  }
                >
                  {badge}
                </span>
              )}
            </span>
          )
        }
      </NavLink>
    </li>
  );
};

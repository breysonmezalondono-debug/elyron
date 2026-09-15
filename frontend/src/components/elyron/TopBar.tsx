import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Bell,
  BriefcaseBusiness,
  ChevronDown,
  ClipboardCheck,
  Flag,
  FolderOpen,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  Repeat,
  ScrollText,
  Search,
  Sparkles,
  UserPlus,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useAuth } from '../../context/useAuth';
import { useInstitution } from '../../context/useInstitution';
import { ThemeCustomizer } from './ThemeCustomizer';
import { roleLabel } from '../../model/roles';
import { pluralize } from '../../model/institution';
import type { TerminologyMap } from '../../model/institution';
import { buildNavForRole, teacherBasePath } from '../../model/navigation';
import { portalHomeForRole, requiresRoleSelection } from '../../model/permissions';

interface Destination {
  label: string;
  hint: string;
  to: string;
  icon: LucideIcon;
}

const buildSearchIndex = (
  terms: TerminologyMap,
  activeRole: string | null | undefined,
  canLessons: boolean,
  flags?: { es_vocero?: boolean; es_vocero_suplente?: boolean },
): Destination[] => {
  const destinations: Destination[] = [];
  buildNavForRole(activeRole, terms, flags).forEach((group) => {
    group.items.forEach(({ to, label, icon }) => {
      destinations.push({ label, hint: group.title, to, icon });
    });
  });
  if (canLessons) {
    destinations.push(
      { label: 'Lección interactiva · Bucles while', hint: 'Learn by doing · 5 min', to: '/lecciones', icon: GraduationCap },
      { label: 'Conocer a Elir', hint: 'Onboarding del tutor IA', to: '/bienvenida', icon: Sparkles },
    );
  }
  return destinations;
};

interface NotificationItem {
  id: string;
  text: string;
  sub: string;
  to: string;
  icon: LucideIcon;
}

const NOTIFICATIONS_BY_ROLE: Record<string, NotificationItem[]> = {
  aprendiz: [
    { id: 'n1', text: 'Evidencia calificada: Taller 1', sub: 'Nota 4.8 / 5.0 · hace 25 min', to: '/evidencias', icon: FolderOpen },
    { id: 'n2', text: 'Taller 2 — Diagramas ER vence mañana', sub: 'Bases de Datos · 09:12', to: '/evidencias', icon: ClipboardCheck },
    { id: 'n3', text: 'Nueva vacante para aprendices React', sub: 'Bolsa de empleo · hace 2 h', to: '/ofertas', icon: BriefcaseBusiness },
  ],
  instructor: [
    { id: 'n4', text: 'Nueva entrega de Ana Martínez', sub: 'Proyecto Integrador · hace 12 min', to: '/profesor/calificaciones', icon: FolderOpen },
    { id: 'n5', text: 'Pregunta sin responder en Comunidad', sub: 'Duda sobre JOINs · hace 1 h', to: '/comunidad', icon: MessagesSquare },
    { id: 'n6', text: 'Clase de SQL a las 10:00', sub: 'Ficha ADSI-2451310 · hoy', to: '/calendario', icon: ClipboardCheck },
  ],
  admin: [
    { id: 'n7', text: '3 cuentas nuevas por verificar', sub: 'Usuarios · hace 30 min', to: '/admin/usuarios', icon: UserPlus },
    { id: 'n8', text: 'Reporte en una publicación de comunidad', sub: 'Moderación · hace 2 h', to: '/admin/moderacion', icon: Flag },
    { id: 'n9', text: 'Auditoría: cambio de rol registrado', sub: 'Carolina Pardo · ayer', to: '/admin/auditoria', icon: ScrollText },
  ],
};

type Menu = 'bell' | 'user' | null;

export const TopBar = () => {
  const { user, logout, activeRole, availableRoles, can } = useAuth();
  const { institution, terminology } = useInstitution();
  const navigate = useNavigate();
  const name = user?.name || user?.sub || 'Usuario';
  const roleText =
    roleLabel(activeRole, institution.type) || terminology.apprentice;
  const SEARCH_INDEX = useMemo(
    () =>
      buildSearchIndex(terminology, activeRole, can('lecciones.ver'), {
        es_vocero: Boolean(user?.es_vocero),
        es_vocero_suplente: Boolean(user?.es_vocero_suplente),
      }),
    [terminology, activeRole, can, user?.es_vocero, user?.es_vocero_suplente],
  );
  const NOTIFICATIONS = NOTIFICATIONS_BY_ROLE[activeRole ?? 'aprendiz'] ?? NOTIFICATIONS_BY_ROLE.aprendiz;

  const [menu, setMenu] = useState<Menu>(null);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const [readIds, setReadIds] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setFocused(false);
        setMenu(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const results = query.trim()
    ? SEARCH_INDEX.filter((d) =>
        d.label.toLowerCase().includes(query.trim().toLowerCase()),
      )
    : SEARCH_INDEX;

  const go = (to: string) => {
    setMenu(null);
    setFocused(false);
    setQuery('');
    const resolved = to.startsWith('/profesor')
      ? `${teacherBasePath(activeRole)}${to.slice('/profesor'.length)}`
      : to;
    navigate(resolved);
  };

  const unreadCount = NOTIFICATIONS.filter((n) => !readIds.includes(n.id)).length;
  const initials = name.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b border-line bg-canvas/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 w-full max-w-7xl items-center gap-3 px-5 lg:px-8">
        <div className="relative w-full max-w-md">
          <div
            className={`flex h-11 items-center gap-2.5 rounded-full border bg-white px-4 transition-all ${
              focused ? 'border-mint-400 shadow-lift ring-4 ring-mint-100' : 'border-line shadow-soft'
            }`}
          >
            <Search size={16} className="pointer-events-none shrink-0 text-ink-400" />
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onFocus={() => setFocused(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && results[0]) go(results[0].to);
              }}
              placeholder={`Buscar lecciones, ${pluralize(terminology.group.toLowerCase())}, evidencias…`}
              className="min-w-0 flex-1 bg-transparent text-sm font-medium outline-none placeholder:text-ink-400"
            />
            <kbd className="hidden shrink-0 rounded-md border border-line px-1.5 py-0.5 text-[10px] font-bold text-ink-400 sm:block">
              ⌘K
            </kbd>
          </div>

          <AnimatePresence>
            {focused && (
              <>
                <div className="fixed inset-0 z-30" onClick={() => setFocused(false)} />
                <motion.div
                  initial={{ opacity: 0, y: -6, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -6, scale: 0.98 }}
                  transition={{ duration: 0.16 }}
                  className="absolute left-0 right-0 top-[52px] z-40 overflow-hidden rounded-3xl border border-line bg-white p-2 shadow-pop"
                >
                  {results.length === 0 && (
                    <p className="px-4 py-5 text-center text-xs font-semibold text-ink-400">
                      Sin resultados para “{query}”
                    </p>
                  )}
                  {results.map(({ to, label, hint, icon: Icon }) => (
                    <button
                      key={to}
                      type="button"
                      onClick={() => go(to)}
                      className="flex w-full items-center gap-3 rounded-2xl px-3.5 py-2.5 text-left transition hover:bg-canvas-deep/70"
                    >
                      <span className="grid size-8 shrink-0 place-items-center rounded-full bg-canvas-deep text-ink-500">
                        <Icon size={14} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-bold text-ink-800">{label}</span>
                        <span className="block truncate text-[11px] font-medium text-ink-400">{hint}</span>
                      </span>
                    </button>
                  ))}
                </motion.div>
              </>
            )}
          </AnimatePresence>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <ThemeCustomizer />

          <button
            type="button"
            aria-label="Notificaciones"
            onClick={() => setMenu(menu === 'bell' ? null : 'bell')}
            className={`relative grid size-11 place-items-center rounded-full border transition ${
              menu === 'bell'
                ? 'border-line bg-white shadow-soft text-ink-900'
                : 'border-transparent text-ink-500 hover:border-line hover:bg-white hover:text-ink-900'
            }`}
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute right-2.5 top-2.5 grid size-4 place-items-center rounded-full bg-mint-500 text-[9px] font-extrabold text-white ring-2 ring-canvas">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenu(menu === 'user' ? null : 'user')}
            className={`flex items-center gap-2.5 rounded-full border py-1.5 pl-1.5 pr-3 transition ${
              menu === 'user'
                ? 'border-line bg-white shadow-soft'
                : 'border-transparent hover:border-line hover:bg-white'
            }`}
          >
            <span className="relative grid size-9 shrink-0 place-items-center rounded-full bg-ink-900 text-[11px] font-extrabold text-white">
              {initials}
              <span className="absolute -bottom-0 -right-0 size-2.5 rounded-full bg-mint-500 ring-2 ring-canvas" />
            </span>
            <span className="hidden text-left sm:block">
              <span className="block max-w-32 truncate text-xs font-extrabold leading-tight">{name}</span>
              <span className="block text-[10px] font-semibold capitalize leading-tight text-ink-400">
                {roleText}
              </span>
            </span>
            <ChevronDown
              size={14}
              className={`hidden text-ink-400 transition-transform sm:block ${menu === 'user' ? 'rotate-180' : ''}`}
            />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {menu === 'bell' && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMenu(null)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute right-5 top-[60px] z-50 w-80 overflow-hidden rounded-3xl border border-line bg-white p-2 shadow-pop lg:right-8"
            >
              <div className="flex items-center justify-between px-3 pb-1 pt-2">
                <p className="text-xs font-extrabold uppercase tracking-wider text-ink-400">Notificaciones</p>
                {unreadCount > 0 && (
                  <button
                    type="button"
                    onClick={() => setReadIds(NOTIFICATIONS.map((n) => n.id))}
                    className="text-[11px] font-bold text-mint-600 transition hover:text-mint-700"
                  >
                    Marcar leídas
                  </button>
                )}
              </div>
              {NOTIFICATIONS.map((n) => {
                const isUnread = !readIds.includes(n.id);
                return (
                  <button
                    key={n.id}
                    type="button"
                    onClick={() => {
                      setReadIds((r) => [...r, n.id]);
                      go(n.to);
                    }}
                    className="flex w-full items-start gap-3 rounded-2xl p-3 text-left transition hover:bg-canvas-deep/70"
                  >
                    <span className={`mt-0.5 grid size-9 shrink-0 place-items-center rounded-xl ${isUnread ? 'bg-mint-100 text-mint-700' : 'bg-canvas-deep text-ink-400'}`}>
                      <n.icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={`block text-sm leading-snug ${isUnread ? 'font-bold text-ink-800' : 'font-semibold text-ink-500'}`}>
                        {n.text}
                      </span>
                      <span className="block text-[11px] font-medium text-ink-400">{n.sub}</span>
                    </span>
                    {isUnread && <span className="mt-1.5 size-2 shrink-0 rounded-full bg-mint-500" />}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}

        {menu === 'user' && (
          <>
            <div className="fixed inset-0 z-30" onClick={() => setMenu(null)} />
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8, scale: 0.98 }}
              transition={{ duration: 0.18 }}
              className="absolute right-5 top-[60px] z-50 w-64 overflow-hidden rounded-3xl border border-line bg-white p-2 shadow-pop lg:right-8"
            >
              <div className="border-b border-line px-4 py-3">
                <p className="truncate text-sm font-extrabold">{name}</p>
                <p className="truncate text-[11px] font-semibold capitalize text-ink-400">
                  {roleText} · {institution.shortName}
                </p>
              </div>
              {can('lecciones.ver') && (
                <button
                  type="button"
                  onClick={() => go('/bienvenida')}
                  className="mt-1 flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-sm font-bold text-ink-700 transition hover:bg-canvas-deep/70"
                >
                  <Sparkles size={15} className="text-mint-600" />
                  Ver presentación de Elir
                </button>
              )}
              {requiresRoleSelection(availableRoles) && (
                <button
                  type="button"
                  onClick={() => go('/seleccionar-rol')}
                  className={`flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-sm font-bold text-ink-700 transition hover:bg-canvas-deep/70 ${
                    can('lecciones.ver') ? '' : 'mt-1'
                  }`}
                >
                  <Repeat size={15} className="text-violet-500" />
                  Cambiar de rol
                </button>
              )}
              <button
                type="button"
                onClick={() => go(portalHomeForRole(activeRole))}
                className="flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-sm font-bold text-ink-700 transition hover:bg-canvas-deep/70"
              >
                <LayoutDashboard size={15} className="text-ink-400" />
                Mi panel
              </button>
              <button
                type="button"
                onClick={() => logout()}
                className="mb-1 flex w-full items-center gap-2.5 rounded-2xl px-3.5 py-2.5 text-left text-sm font-bold text-red-500 transition hover:bg-red-50"
              >
                <LogOut size={15} />
                Cerrar sesión
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
};

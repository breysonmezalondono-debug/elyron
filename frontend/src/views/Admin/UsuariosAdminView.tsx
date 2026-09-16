import { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Search, ShieldBan, ShieldCheck, UserPlus, Users } from 'lucide-react';
import { roleLabel, findRoleByKey } from '../../model/roles';
import { getInstitution } from '../../model/mock/orgData';
import { ADMIN_USERS } from '../../model/mock/adminData';
import type { AdminUser } from '../../model/mock/adminData';
import { adminService } from '../../services/adminService';
import { CrearCuentaModal, ROLES_ADMIN } from '../../components/CrearCuentaModal';

type RoleFilterKey = 'todos' | 'aprendiz' | 'instructor' | 'admin';

const ROLE_FILTERS: { key: RoleFilterKey; label: string }[] = [
  { key: 'todos', label: 'Todos' },
  { key: 'aprendiz', label: 'Aprendices' },
  { key: 'instructor', label: 'Instructores' },
  { key: 'admin', label: 'Administradores' },
];

const ROLE_BADGE: Record<string, string> = {
  aprendiz: 'bg-mint-50 text-mint-700 ring-mint-200',
  instructor: 'bg-violet-50 text-violet-600 ring-violet-200',
  admin: 'bg-canvas-deep text-ink-700 ring-line-strong',
};

const AVATAR_COLOR: Record<string, string> = {
  aprendiz: 'bg-mint-100 text-mint-700',
  instructor: 'bg-violet-100 text-violet-600',
  admin: 'bg-ink-900 text-white',
};

const initialsOf = (name: string): string =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

export const UsuariosAdminView = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilterKey>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [aviso, setAviso] = useState('');

  /** Convierte el nombre del rol de la API al key usado por la UI. */
  const roleKeyOf = (roleName?: string | null): string => {
    if (!roleName) return 'aprendiz';
    const normalized = roleName.toLowerCase();
    if (normalized === 'administrador') return 'admin';
    if (findRoleByKey(normalized)) return normalized;
    return normalized;
  };

  /** Convierte un usuario real de la API al formato de la tabla. */
  const toAdminUser = (u: import('../../services/adminService').UsuarioAdminApi): AdminUser => {
    const roleKey = roleKeyOf(typeof u.role === 'string' ? u.role : u.role?.name);
    return {
      id: u.id,
      name: `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email,
      email: u.email,
      roleKey,
      institutionId: u.institucion || 'inst-sena',
      extraRoleKeys: [],
      status: u.isActive ? 'Activo' : 'Suspendido',
      lastActive: u.createdAt ? new Date(u.createdAt).toLocaleDateString('es-CO') : '—',
    };
  };

  const cargarUsuarios = async () => {
    setLoading(true);
    try {
      const lista = await adminService.listarUsuarios();
      setUsers(lista.map(toAdminUser));
    } catch {
      // Si falla la API (p. ej. modo mock), mostramos la demo local.
      setUsers(ADMIN_USERS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void cargarUsuarios();
  }, []);

  const institucionPorRol = (roleKey: string): string => {
    if (['aprendiz', 'instructor', 'coordinador', 'bienestar_sena', 'administrador'].includes(roleKey)) return 'sena';
    if (['estudiante', 'docente', 'rector', 'orientador', 'coordinador_convivencia'].includes(roleKey)) return 'colegio';
    return 'universidad';
  };

  const onCreada = (mensaje: string) => {
    setAviso(mensaje);
    void cargarUsuarios(); // recarga la lista para mostrar la cuenta nueva
    setTimeout(() => setAviso(''), 5000);
  };

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter !== 'todos' && user.roleKey !== roleFilter) return false;
      if (!normalized) return true;
      return (
        user.name.toLowerCase().includes(normalized) ||
        user.email.toLowerCase().includes(normalized)
      );
    });
  }, [users, query, roleFilter]);

  const toggleStatus = (userId: string) => {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === userId
          ? { ...user, status: user.status === 'Activo' ? 'Suspendido' : 'Activo' }
          : user,
      ),
    );
  };

  return (
    <div className="mx-auto max-w-5xl space-y-7">
      <motion.header
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-wrap items-end justify-between gap-4"
      >
        <div>
          <p className="admin-eyebrow text-[11px] admin-muted">Administración</p>
          <h1 className="admin-heading mt-2 text-3xl text-ink-950 sm:text-4xl">
            Usuarios y roles
          </h1>
          <p className="mt-2 text-sm font-medium admin-muted">
            {users.filter((user) => user.status === 'Activo').length} cuentas activas en tus
            instituciones.
          </p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search size={15} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre o correo…"
            className="input pl-10"
          />
        </div>
      </motion.header>

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-mint-200 bg-mint-50/50 px-4 py-3 dark:border-mint-500/20 dark:bg-mint-500/5">
        <p className="flex items-center gap-2 text-xs font-bold text-ink-600 dark:text-ink-300">
          <ShieldCheck size={14} className="shrink-0 text-mint-600 dark:text-mint-400" />
          Las cuentas de personal (instructores, coordinadores, docentes) se crean aquí y entran
          por el acceso institucional. Los estudiantes se registran solos.
        </p>
        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="btn-pill btn-pill-mint"
        >
          <UserPlus size={15} />
          Crear cuenta
        </button>
      </div>

      {aviso && (
        <p className="flex items-center gap-2 rounded-2xl border border-mint-200 bg-mint-50 px-4 py-3 text-xs font-bold text-mint-700 dark:border-mint-500/30 dark:bg-mint-500/10 dark:text-mint-400">
          <Check size={14} strokeWidth={3} />
          {aviso}
        </p>
      )}

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
        className="flex gap-1.5 overflow-x-auto rounded-full bg-white p-1.5 shadow-soft ring-1 ring-line w-fit max-w-full"
      >
        {ROLE_FILTERS.map((filter) => (
          <button
            key={filter.key}
            type="button"
            onClick={() => setRoleFilter(filter.key)}
            className={`relative shrink-0 rounded-full px-4 py-2 text-[11px] transition-colors ${
              roleFilter === filter.key ? 'font-extrabold text-white' : 'font-bold text-ink-500 hover:text-ink-900'
            }`}
          >
            {roleFilter === filter.key && (
              <motion.span
                layoutId="users-role-filter"
                transition={{ type: 'spring', stiffness: 420, damping: 36 }}
                className="absolute inset-0 rounded-full bg-ink-900"
              />
            )}
            <span className="relative z-10">{filter.label}</span>
          </button>
        ))}
      </motion.div>

      <motion.div layout className="space-y-3">
        <AnimatePresence mode="popLayout">
          {loading ? (
            <section className="surface flex items-center justify-center gap-3 p-10 text-center">
              <span className="size-5 animate-spin rounded-full border-2 border-ink-300 border-t-transparent" />
              <span className="text-sm font-bold text-ink-500">Cargando cuentas…</span>
            </section>
          ) : (
            filtered.map((user) => (
              <UserRow key={user.id} user={user} onToggleStatus={() => toggleStatus(user.id)} />
            ))
          )}
        </AnimatePresence>
      </motion.div>

      {filtered.length === 0 && (
        <section className="surface flex flex-col items-center gap-4 p-10 text-center">
          <span className="grid size-14 place-items-center rounded-[20px] bg-violet-50 text-violet-600 shadow-lift">
            <Users size={26} />
          </span>
          <div className="space-y-1.5">
            <h2 className="text-base font-extrabold tracking-tight text-ink-950">
              Sin resultados
            </h2>
            <p className="mx-auto max-w-xs text-sm font-medium leading-relaxed text-ink-500">
              Ninguna cuenta coincide con la búsqueda o el filtro seleccionado.
            </p>
          </div>
        </section>
      )}

      <CrearCuentaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreada={onCreada}
        roles={ROLES_ADMIN}
        institucionPorRol={institucionPorRol}
      />
    </div>
  );
};

interface UserRowProps {
  user: AdminUser;
  onToggleStatus: () => void;
}

const UserRow = ({ user, onToggleStatus }: UserRowProps) => {
  const institution = getInstitution(user.institutionId);
  const suspended = user.status === 'Suspendido';

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.97 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="surface flex flex-col gap-4 p-5 sm:flex-row sm:items-center"
    >
      <div className="flex min-w-0 flex-1 items-center gap-4">
        <span
          className={`grid size-11 shrink-0 place-items-center rounded-full text-sm font-extrabold ${AVATAR_COLOR[user.roleKey] ?? 'bg-canvas-deep text-ink-600'}`}
        >
          {initialsOf(user.name)}
        </span>
        <div className="min-w-0">
          <h2 className="truncate text-sm font-extrabold tracking-tight text-ink-950">
            {user.name}
          </h2>
          <p className="truncate text-xs font-medium text-ink-400">{user.email}</p>
          <p className="mt-1 truncate text-[11px] font-semibold text-ink-400">
            Última conexión: {user.lastActive}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 flex-wrap items-center gap-2">
        <span className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${ROLE_BADGE[user.roleKey] ?? 'bg-canvas-deep text-ink-600 ring-line-strong'}`}>
          {roleLabel(user.roleKey, institution?.type)}
        </span>
        {user.extraRoleKeys.map((extraKey) => (
          <span
            key={extraKey}
            className={`rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ring-1 ${ROLE_BADGE[extraKey] ?? 'bg-canvas-deep text-ink-600 ring-line-strong'}`}
          >
            + {roleLabel(extraKey)}
          </span>
        ))}
        <span className="rounded-full bg-white px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-ink-400 ring-1 ring-line">
          {institution?.shortName ?? '—'}
        </span>
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider ${
            suspended ? 'bg-red-50 text-red-500' : 'bg-mint-50 text-mint-700'
          }`}
        >
          <span className={`size-1.5 rounded-full ${suspended ? 'bg-red-500' : 'bg-mint-500'}`} />
          {user.status}
        </span>
        <button
          type="button"
          onClick={onToggleStatus}
          className={`btn-pill btn-pill-sm ${suspended ? 'btn-pill-mint' : 'btn-pill-paper'}`}
        >
          {suspended ? (
            <>
              <ShieldCheck size={13} />
              Reactivar
            </>
          ) : (
            <>
              <ShieldBan size={13} />
              Suspender
            </>
          )}
        </button>
      </div>
    </motion.article>
  );
};

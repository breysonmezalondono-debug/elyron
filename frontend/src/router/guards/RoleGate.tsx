import { Navigate, Outlet, Link } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { portalHomeForRole } from '../../model/permissions';

interface RoleGateProps {
  /** Único rol (o conjunto) que puede acceder a esta rama del router. */
  roles: readonly string[];
  /** Flags del usuario (ej. es_vocero) que deben ser true para pasar. */
  atributos?: readonly string[];
}

/**
 * Guarda estricta de portal. Aísla cada rama del router a un rol concreto:
 *  - No autenticado  → /login
 *  - Sin rol activo   → /seleccionar-rol
 *  - Role NO permitido → vista 403 (No Autorizado) con enlace a su propio portal.
 * Además soporta gating por atributo (es_vocero / es_vocero_suplente) para que
 * un aprendiz regular no acceda a las áreas de líder/colíder.
 */
export const RoleGate = ({ roles, atributos }: RoleGateProps) => {
  const { isAuthenticated, activeRole, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!activeRole) return <Navigate to="/seleccionar-rol" replace />;

  const cumpleAtributos =
    !atributos ||
    atributos.every((attr) => Boolean(user?.[attr]));

  if (!roles.includes(activeRole) || !cumpleAtributos) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas px-6 py-12 dark:bg-canvas-deep">
        <div className="surface w-full max-w-lg p-8 text-center">
          <p className="text-5xl font-extrabold tracking-tight text-ink-950 dark:text-white">403</p>
          <p className="admin-eyebrow mt-4 text-[11px] text-mint-600 dark:text-mint-400">
            Acceso no autorizado
          </p>
          <h1 className="display mt-2 text-3xl text-ink-950 dark:text-white">
            Esta área es exclusiva de otro rol
          </h1>
          <p className="mt-2 text-sm font-medium text-ink-500 dark:text-ink-300">
            {activeRole} no tiene permisos para ver esta sección. Tu sesión sigue activa; vuelve a
            tu portal.
          </p>
          <Link
            to={portalHomeForRole(activeRole)}
            className="btn-pill btn-pill-ink mt-6 w-full justify-center"
          >
            Ir a mi portal
          </Link>
        </div>
      </div>
    );
  }

  return <Outlet />;
};

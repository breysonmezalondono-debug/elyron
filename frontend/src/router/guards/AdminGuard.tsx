import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  isCampusRole,
  isStaffRole,
  portalHomeForRole,
} from '../../model/permissions';

/**
 * AdminGuard — Solo deja pasar roles de producción (Staff / Admin).
 * Si un rol campus intenta entrar, lo expulsa a su portal (/campus).
 */
export const AdminGuard = () => {
  const { isAuthenticated, activeRole } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!activeRole) return <Navigate to="/seleccionar-rol" replace />;

  if (isCampusRole(activeRole)) {
    return <Navigate to={portalHomeForRole(activeRole)} replace />;
  }
  if (!isStaffRole(activeRole)) {
    return <Navigate to={portalHomeForRole(activeRole) ?? '/login'} replace />;
  }

  return <Outlet />;
};

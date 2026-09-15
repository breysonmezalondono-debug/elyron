import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import {
  isCampusRole,
  isStaffRole,
  portalHomeForRole,
} from '../../model/permissions';

/**
 * CampusGuard — Solo deja pasar roles de consumo (Campus).
 * Si un rol staff intenta entrar, lo expulsa a su portal (/admin).
 */
export const CampusGuard = () => {
  const { isAuthenticated, activeRole } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!activeRole) return <Navigate to="/seleccionar-rol" replace />;

  if (isStaffRole(activeRole)) {
    return <Navigate to={portalHomeForRole(activeRole)} replace />;
  }
  if (!isCampusRole(activeRole)) {
    return <Navigate to={portalHomeForRole(activeRole) ?? '/login'} replace />;
  }

  return <Outlet />;
};

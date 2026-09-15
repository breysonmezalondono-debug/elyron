import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import { homeForRole } from '../model/permissions';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

export const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
  const { isAuthenticated, activeRole } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!activeRole) return <Navigate to="/seleccionar-rol" replace />;

  if (allowedRoles && !allowedRoles.includes(activeRole)) {
    return <Navigate to={homeForRole(activeRole)} replace />;
  }

  return <Outlet />;
};

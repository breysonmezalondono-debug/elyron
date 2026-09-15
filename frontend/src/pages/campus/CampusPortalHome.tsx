import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { homeForRole } from '../../model/permissions';

/**
 * Home del Portal Campus.
 * Los roles de consumo comparten el dashboard gamificado del aprendiz
 * (el panel de ElyronDashboard ya es multi-rol para aprendiz/universitario).
 */
export const CampusPortalHome = () => {
  const { activeRole } = useAuth();
  return <Navigate to={activeRole ? homeForRole(activeRole) : '/dashboard'} replace />;
};

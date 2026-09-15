import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../context/useAuth';
import { homeForRole } from '../../model/permissions';

const AdminDashboard = lazy(() =>
  import('../../views/Admin/AdminDashboard').then((m) => ({ default: m.AdminDashboard })),
);

/**
 * Home del Portal Staff / Admin.
 * El rol `admin` ve su panel general; el resto de roles staff se enrutan a
 * su propio panel (profesor / coordinador / colegio). Los roles de consumo
 * no pueden llegar aquí (AdministracionGuard los expulsa).
 */
export const AdminPortalHome = () => {
  const { activeRole } = useAuth();

  if (activeRole === 'admin') return <AdminDashboard />;
  return <Navigate to={activeRole ? homeForRole(activeRole) : '/admin'} replace />;
};

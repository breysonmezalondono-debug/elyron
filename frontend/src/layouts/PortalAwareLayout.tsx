import { Layout } from '../components/Layout';
import { useAuth } from '../context/useAuth';
import { portalForRole } from '../model/permissions';

/**
 * Layout consciente del portal para rutas compartidas (comunidad, eventos,
 * calendario, empresas, ofertas). Elige el shell del portal del rol activo
 * sin duplicar definiciones de ruta en ambas ramas.
 */
export const PortalAwareLayout = () => {
  const { activeRole } = useAuth();
  return <Layout portal={portalForRole(activeRole)} />;
};

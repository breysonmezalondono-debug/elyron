import { useAuth } from '../context/useAuth';
import { FormacionView } from '../views/Sena/FormacionView';
import { ElyronInteractiveLesson } from './elyron/ElyronInteractiveLesson';

export const LeccionesGateway = () => {
  const { activeRole } = useAuth();
  return activeRole === 'aprendiz' ? <FormacionView /> : <ElyronInteractiveLesson />;
};

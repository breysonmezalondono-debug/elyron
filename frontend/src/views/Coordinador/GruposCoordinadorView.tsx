import { Users } from 'lucide-react';
import { CoordinadorSeccionBase } from './coordinadorSeccionBase';

export const GruposCoordinadorView = () => (
  <CoordinadorSeccionBase
    icon={Users}
    eyebrow="Coordinación · Grupos"
    title="Grupos e instructores"
    description="Consulta los grupos del programa, sus instructores asignados y el detalle de cada ficha."
    features={[
      'Directorio de fichas con instructor y aprendices a cargo',
      'Asignación y reasignación de instructores por grupo',
      'Vista rápida de avance y entregas por ficha',
    ]}
  />
);

import { FileBarChart } from 'lucide-react';
import { CoordinadorSeccionBase } from './coordinadorSeccionBase';

export const ReportesCoordinadorView = () => (
  <CoordinadorSeccionBase
    icon={FileBarChart}
    eyebrow="Coordinación · Reportes"
    title="Reportes del programa"
    description="Resumen de avance, entregas y desempeño por grupo e instructor de tu programa."
    features={[
      'Avance promedio y riesgo por ficha del programa',
      'Evidencias entregadas vs. pendientes por instructor',
      'Exportación de reportes por periodo y trimestre',
    ]}
  />
);

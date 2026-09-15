import { Megaphone } from 'lucide-react';
import { CoordinadorSeccionBase } from './coordinadorSeccionBase';

export const ComunicadosCoordinadorView = () => (
  <CoordinadorSeccionBase
    icon={Megaphone}
    eyebrow="Coordinación · Comunicación"
    title="Comunicados del programa"
    description="Publica y administra los comunicados dirigidos a las fichas e instructores de tu programa."
    features={[
      'Redacción y envío de comunicados por ficha o por todo el programa',
      'Historial de publicaciones con estado y destinatarios',
      'Programación de recordatorios de entregas y actividades',
    ]}
  />
);

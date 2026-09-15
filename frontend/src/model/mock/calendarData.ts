import type { AcademicActivityType } from '../activity';

export type CalendarEventType = 'Entrega' | 'Reunión' | 'Taller';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  type: CalendarEventType;
  activity?: AcademicActivityType;
}

export const CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'ev-1',
    title: 'Entrega Final — Base de Datos',
    date: '2026-08-25',
    location: 'Centro de Servicios · Sede principal',
    type: 'Entrega',
    activity: 'proyecto',
  },
  {
    id: 'ev-2',
    title: 'Comité de Seguimiento Ficha ADSI',
    date: '2026-08-28',
    location: 'Aula 301 · Bloque B',
    type: 'Reunión',
  },
  {
    id: 'ev-3',
    title: 'Taller de Preparación Pruebas Saber',
    date: '2026-09-02',
    location: 'Auditorio principal',
    type: 'Taller',
    activity: 'taller',
  },
  {
    id: 'ev-4',
    title: 'Lección interactiva: Bucles while',
    date: '2026-09-05',
    location: 'Laboratorio de informática 2',
    type: 'Taller',
    activity: 'quiz',
  },
];

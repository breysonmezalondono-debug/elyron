export type CommunityEventVariant = 'mint' | 'violet' | 'amber';

export interface CommunityEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  variant: CommunityEventVariant;
  status: 'proximamente' | 'finalizado';
}

export const MOCK_COMMUNITY_EVENTS: CommunityEvent[] = [
  {
    id: 'cev-1',
    title: 'Hackathon interno Elyron',
    date: '2026-09-12',
    location: 'Auditorio principal · 8:00 a. m.',
    variant: 'mint',
    status: 'proximamente',
  },
  {
    id: 'cev-2',
    title: 'Charla: carreras en datos e IA',
    date: '2026-08-29',
    location: 'Virtual · 3:00 p. m.',
    variant: 'violet',
    status: 'proximamente',
  },
  {
    id: 'cev-3',
    title: 'Feria de talento y convenios',
    date: '2026-07-30',
    location: 'Plaza central · Todo el día',
    variant: 'amber',
    status: 'finalizado',
  },
];
